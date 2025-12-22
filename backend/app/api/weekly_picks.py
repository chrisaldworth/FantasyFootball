from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from typing import Optional, List
from datetime import datetime
import secrets
import string

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.weekly_picks import (
    WeeklyPick,
    ScorePrediction,
    PlayerPick,
    WeeklyPicksLeague,
    WeeklyPicksLeagueMember,
)
from app.services.fpl_service import fpl_service

router = APIRouter(prefix="/weekly-picks", tags=["Weekly Picks"])


# Helper function to generate league code
def generate_league_code(length: int = 6) -> str:
    """Generate a random alphanumeric code"""
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


# Scoring logic
def calculate_score_prediction_points(
    predicted_home: int,
    predicted_away: int,
    actual_home: int,
    actual_away: int,
) -> dict:
    """
    Calculate points for a score prediction:
    - Exact score: 4 points
    - Correct result (win/draw): 2 points
    - Correct home goals: 1 point
    - Correct away goals: 1 point
    Maximum: 4 points (exact score includes all bonuses)
    """
    points = 0
    breakdown = {
        "home_goals": 0,
        "away_goals": 0,
        "result": 0,
        "exact_score": 0,
    }
    
    # Exact score
    if predicted_home == actual_home and predicted_away == actual_away:
        points = 4
        breakdown["exact_score"] = 4
        breakdown["home_goals"] = 1
        breakdown["away_goals"] = 1
        breakdown["result"] = 2
    else:
        # Correct result (win/draw)
        predicted_result = "home" if predicted_home > predicted_away else ("away" if predicted_away > predicted_home else "draw")
        actual_result = "home" if actual_home > actual_away else ("away" if actual_away > actual_home else "draw")
        
        if predicted_result == actual_result:
            points += 2
            breakdown["result"] = 2
        
        # Correct home goals
        if predicted_home == actual_home:
            points += 1
            breakdown["home_goals"] = 1
        
        # Correct away goals
        if predicted_away == actual_away:
            points += 1
            breakdown["away_goals"] = 1
    
    return {"points": points, "breakdown": breakdown}


def calculate_player_pick_points(fpl_points: Optional[int]) -> int:
    """
    Calculate points for a player pick:
    - Points = FPL points scored (1:1 ratio)
    - Minimum: 0 points
    """
    return max(0, fpl_points or 0)


@router.post("/submit")
async def submit_picks(
    gameweek: int,
    scorePredictions: List[dict],
    playerPicks: List[dict],
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Submit weekly picks for a gameweek"""
    try:
        # Validate input
        if len(scorePredictions) != 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must submit exactly 3 score predictions"
            )
        
        if len(playerPicks) != 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must submit exactly 3 player picks"
            )
        
        # Check if picks already exist
        existing_pick = session.exec(
            select(WeeklyPick).where(
                WeeklyPick.user_id == current_user.id,
                WeeklyPick.gameweek == gameweek
            )
        ).first()
        
        if existing_pick:
            # Update existing picks
            weekly_pick = existing_pick
            # Delete old predictions and picks
            old_score_preds = session.exec(
                select(ScorePrediction).where(ScorePrediction.weekly_pick_id == weekly_pick.id)
            ).all()
            for sp in old_score_preds:
                session.delete(sp)
            
            old_player_picks = session.exec(
                select(PlayerPick).where(PlayerPick.weekly_pick_id == weekly_pick.id)
            ).all()
            for pp in old_player_picks:
                session.delete(pp)
            
            session.commit()
        else:
            # Create new picks
            weekly_pick = WeeklyPick(
                user_id=current_user.id,
                gameweek=gameweek,
                total_points=0,
            )
            session.add(weekly_pick)
            session.commit()
            session.refresh(weekly_pick)
        
        # Add score predictions
        total_points = 0
        for sp in scorePredictions:
            score_pred = ScorePrediction(
                weekly_pick_id=weekly_pick.id,
                fixture_id=sp["fixtureId"],
                home_team_id=sp.get("homeTeamId", 0),
                away_team_id=sp.get("awayTeamId", 0),
                predicted_home_score=sp["homeScore"],
                predicted_away_score=sp["awayScore"],
                points=0,  # Will be calculated when results are available
            )
            session.add(score_pred)
        
        # Add player picks
        for pp in playerPicks:
            player_pick = PlayerPick(
                weekly_pick_id=weekly_pick.id,
                player_id=pp["playerId"],
                fixture_id=pp["fixtureId"],
                points=0,  # Will be calculated when results are available
            )
            session.add(player_pick)
        
        session.commit()
        
        return {
            "success": True,
            "message": "Picks submitted successfully",
            "weekly_pick_id": weekly_pick.id,
        }
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit picks: {str(e)}"
        )


@router.get("/{gameweek}")
async def get_picks(
    gameweek: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get user's picks for a gameweek"""
    try:
        weekly_pick = session.exec(
            select(WeeklyPick).where(
                WeeklyPick.user_id == current_user.id,
                WeeklyPick.gameweek == gameweek
            )
        ).first()
        
        if not weekly_pick:
            return {
                "scorePredictions": [],
                "playerPicks": [],
            }
        
        # Get score predictions
        score_predictions = session.exec(
            select(ScorePrediction).where(ScorePrediction.weekly_pick_id == weekly_pick.id)
        ).all()
        
        # Get player picks
        player_picks = session.exec(
            select(PlayerPick).where(PlayerPick.weekly_pick_id == weekly_pick.id)
        ).all()
        
        # Get fixture and team info from FPL
        bootstrap = await fpl_service.get_bootstrap_static()
        teams = {t["id"]: t for t in bootstrap.get("teams", [])}
        
        return {
            "scorePredictions": [
                {
                    "fixtureId": sp.fixture_id,
                    "homeTeamId": sp.home_team_id,
                    "awayTeamId": sp.away_team_id,
                    "homeTeam": teams.get(sp.home_team_id, {}).get("short_name", "TBD"),
                    "awayTeam": teams.get(sp.away_team_id, {}).get("short_name", "TBD"),
                    "homeScore": sp.predicted_home_score,
                    "awayScore": sp.predicted_away_score,
                }
                for sp in score_predictions
            ],
            "playerPicks": [
                {
                    "playerId": pp.player_id,
                    "fixtureId": pp.fixture_id,
                }
                for pp in player_picks
            ],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch picks: {str(e)}"
        )


@router.get("/{gameweek}/results")
async def get_results(
    gameweek: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get user's results for a gameweek"""
    try:
        weekly_pick = session.exec(
            select(WeeklyPick).where(
                WeeklyPick.user_id == current_user.id,
                WeeklyPick.gameweek == gameweek
            )
        ).first()
        
        if not weekly_pick:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No picks found for this gameweek"
            )
        
        # Get score predictions with results
        score_predictions = session.exec(
            select(ScorePrediction).where(ScorePrediction.weekly_pick_id == weekly_pick.id)
        ).all()
        
        # Get player picks with results
        player_picks = session.exec(
            select(PlayerPick).where(PlayerPick.weekly_pick_id == weekly_pick.id)
        ).all()
        
        # Get fixture and team info from FPL
        bootstrap = await fpl_service.get_bootstrap_static()
        teams = {t["id"]: t for t in bootstrap.get("teams", [])}
        
        # Get fixtures to get actual scores
        fixtures_data = await fpl_service.get_gameweek_fixtures(gameweek)
        fixtures = {f["id"]: f for f in fixtures_data}
        
        # Get live data for player points
        try:
            live_data = await fpl_service.get_live_gameweek(gameweek)
            live_elements = {e["id"]: e for e in live_data.get("elements", [])}
        except:
            live_elements = {}
        
        score_pred_results = []
        for sp in score_predictions:
            fixture = fixtures.get(sp.fixture_id, {})
            actual_home = fixture.get("team_h_score")
            actual_away = fixture.get("team_a_score")
            
            # Update actual scores if available
            if actual_home is not None and actual_away is not None:
                sp.actual_home_score = actual_home
                sp.actual_away_score = actual_away
                
                # Calculate points
                scoring = calculate_score_prediction_points(
                    sp.predicted_home_score,
                    sp.predicted_away_score,
                    actual_home,
                    actual_away,
                )
                sp.points = scoring["points"]
                sp.breakdown = scoring["breakdown"]
                session.add(sp)
            
            score_pred_results.append({
                "homeTeam": teams.get(sp.home_team_id, {}).get("short_name", "TBD"),
                "awayTeam": teams.get(sp.away_team_id, {}).get("short_name", "TBD"),
                "prediction": {
                    "home": sp.predicted_home_score,
                    "away": sp.predicted_away_score,
                },
                "actual": {
                    "home": sp.actual_home_score,
                    "away": sp.actual_away_score,
                } if sp.actual_home_score is not None else None,
                "points": sp.points,
                "breakdown": sp.breakdown,
            })
        
        player_pick_results = []
        for pp in player_picks:
            # Get player info
            player_data = None
            for p in bootstrap.get("elements", []):
                if p["id"] == pp.player_id:
                    player_data = p
                    break
            
            # Get FPL points from live data
            live_element = live_elements.get(pp.player_id, {})
            fpl_points = live_element.get("stats", {}).get("total_points", 0)
            
            if fpl_points > 0:
                pp.fpl_points = fpl_points
                pp.points = calculate_player_pick_points(fpl_points)
                session.add(pp)
            
            player_pick_results.append({
                "player": {
                    "name": player_data.get("web_name", "Unknown") if player_data else "Unknown",
                    "photo": f"https://resources.premierleague.com/premierleague/photos/players/110x140/p{player_data.get('code', 0)}.png" if player_data else None,
                    "fplPoints": pp.fpl_points or 0,
                },
                "points": pp.points,
            })
        
        session.commit()
        
        # Recalculate total points
        total_points = sum(sp.points for sp in score_predictions) + sum(pp.points for pp in player_picks)
        weekly_pick.total_points = total_points
        session.add(weekly_pick)
        session.commit()
        
        return {
            "scorePredictions": score_pred_results,
            "playerPicks": player_pick_results,
            "totalPoints": total_points,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch results: {str(e)}"
        )


@router.get("/leaderboard")
async def get_leaderboard(
    gameweek: Optional[int] = None,
    league_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get leaderboard for a gameweek or league"""
    try:
        # If league_id is provided, filter by league members
        user_ids = None
        if league_id:
            members = session.exec(
                select(WeeklyPicksLeagueMember).where(
                    WeeklyPicksLeagueMember.league_id == league_id
                )
            ).all()
            user_ids = [m.user_id for m in members]
        
        # Get current gameweek if not specified
        if not gameweek:
            bootstrap = await fpl_service.get_bootstrap_static()
            current_event = next(
                (e for e in bootstrap.get("events", []) if e.get("is_current")),
                None
            )
            if current_event:
                gameweek = current_event["id"]
            else:
                gameweek = 1
        
        # Query weekly picks
        query = select(WeeklyPick).where(WeeklyPick.gameweek == gameweek)
        if user_ids:
            query = query.where(WeeklyPick.user_id.in_(user_ids))
        
        picks = session.exec(query).all()
        
        # Get user info
        user_ids_list = [p.user_id for p in picks]
        users = session.exec(
            select(User).where(User.id.in_(user_ids_list))
        ).all()
        user_map = {u.id: u for u in users}
        
        # Sort by total points (descending)
        picks_sorted = sorted(picks, key=lambda p: p.total_points, reverse=True)
        
        # Calculate ranks and movements (simplified - would need previous week data for movement)
        leaderboard = []
        for idx, pick in enumerate(picks_sorted):
            user = user_map.get(pick.user_id)
            if not user:
                continue
            
            leaderboard.append({
                "userId": user.id,
                "userName": user.username,
                "rank": idx + 1,
                "points": pick.total_points,
                "movement": None,  # Would need to compare with previous week
            })
        
        return leaderboard
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch leaderboard: {str(e)}"
        )


@router.post("/leagues")
async def create_league(
    name: str,
    description: Optional[str] = None,
    type: str = "both",
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Create a new private league"""
    try:
        # Generate unique code
        code = generate_league_code()
        while session.exec(
            select(WeeklyPicksLeague).where(WeeklyPicksLeague.code == code)
        ).first():
            code = generate_league_code()
        
        league = WeeklyPicksLeague(
            name=name,
            description=description,
            code=code,
            type=type,
            created_by=current_user.id,
        )
        session.add(league)
        session.commit()
        session.refresh(league)
        
        # Add creator as member
        member = WeeklyPicksLeagueMember(
            league_id=league.id,
            user_id=current_user.id,
        )
        session.add(member)
        session.commit()
        
        return {
            "id": league.id,
            "name": league.name,
            "code": league.code,
            "type": league.type,
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create league: {str(e)}"
        )


@router.get("/leagues")
async def get_leagues(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get user's leagues"""
    try:
        # Get leagues where user is a member
        members = session.exec(
            select(WeeklyPicksLeagueMember).where(
                WeeklyPicksLeagueMember.user_id == current_user.id
            )
        ).all()
        
        league_ids = [m.league_id for m in members]
        if not league_ids:
            return []
        
        leagues = session.exec(
            select(WeeklyPicksLeague).where(WeeklyPicksLeague.id.in_(league_ids))
        ).all()
        
        # Get member counts and user ranks
        result = []
        for league in leagues:
            all_members = session.exec(
                select(WeeklyPicksLeagueMember).where(
                    WeeklyPicksLeagueMember.league_id == league.id
                )
            ).all()
            
            # Calculate user's rank in league (simplified - would need to calculate based on points)
            # For now, just return member count
            result.append({
                "id": league.id,
                "name": league.name,
                "description": league.description,
                "code": league.code,
                "type": league.type,
                "memberCount": len(all_members),
                "yourRank": 1,  # Would need to calculate based on points
            })
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch leagues: {str(e)}"
        )


@router.get("/leagues/{league_id}")
async def get_league(
    league_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get league details"""
    try:
        league = session.exec(
            select(WeeklyPicksLeague).where(WeeklyPicksLeague.id == league_id)
        ).first()
        
        if not league:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="League not found"
            )
        
        # Check if user is a member
        member = session.exec(
            select(WeeklyPicksLeagueMember).where(
                WeeklyPicksLeagueMember.league_id == league_id,
                WeeklyPicksLeagueMember.user_id == current_user.id
            )
        ).first()
        
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this league"
            )
        
        # Get members
        members = session.exec(
            select(WeeklyPicksLeagueMember).where(
                WeeklyPicksLeagueMember.league_id == league_id
            )
        ).all()
        
        return {
            "id": league.id,
            "name": league.name,
            "description": league.description,
            "code": league.code,
            "type": league.type,
            "memberCount": len(members),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch league: {str(e)}"
        )


@router.post("/leagues/join")
async def join_league(
    code: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Join a league by code"""
    try:
        league = session.exec(
            select(WeeklyPicksLeague).where(WeeklyPicksLeague.code == code.upper())
        ).first()
        
        if not league:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid league code"
            )
        
        # Check if already a member
        existing_member = session.exec(
            select(WeeklyPicksLeagueMember).where(
                WeeklyPicksLeagueMember.league_id == league.id,
                WeeklyPicksLeagueMember.user_id == current_user.id
            )
        ).first()
        
        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are already a member of this league"
            )
        
        # Add member
        member = WeeklyPicksLeagueMember(
            league_id=league.id,
            user_id=current_user.id,
        )
        session.add(member)
        session.commit()
        
        return {
            "success": True,
            "message": "Successfully joined league",
            "league": {
                "id": league.id,
                "name": league.name,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to join league: {str(e)}"
        )


@router.get("/statistics")
async def get_statistics(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get user's statistics"""
    try:
        # Get all user's picks
        picks = session.exec(
            select(WeeklyPick).where(WeeklyPick.user_id == current_user.id)
        ).all()
        
        if not picks:
            return {
                "totalPoints": 0,
                "averagePoints": 0,
                "bestRank": None,
                "scorePredictionStats": {
                    "accuracy": 0,
                    "exactScores": 0,
                    "avgPoints": 0,
                },
                "playerPickStats": {
                    "avgFplPoints": 0,
                    "successRate": 0,
                    "totalPicks": 0,
                },
                "pointsOverTime": [],
                "rankOverTime": [],
            }
        
        total_points = sum(p.total_points for p in picks)
        avg_points = total_points / len(picks) if picks else 0
        
        # Get best rank
        best_rank = min((p.rank for p in picks if p.rank), default=None)
        
        # Score prediction stats
        all_score_predictions = []
        for pick in picks:
            score_preds = session.exec(
                select(ScorePrediction).where(ScorePrediction.weekly_pick_id == pick.id)
            ).all()
            all_score_predictions.extend(score_preds)
        
        exact_scores = sum(1 for sp in all_score_predictions if sp.breakdown and sp.breakdown.get("exact_score", 0) > 0)
        score_accuracy = (exact_scores / len(all_score_predictions) * 100) if all_score_predictions else 0
        avg_score_points = sum(sp.points for sp in all_score_predictions) / len(all_score_predictions) if all_score_predictions else 0
        
        # Player pick stats
        all_player_picks = []
        for pick in picks:
            player_picks = session.exec(
                select(PlayerPick).where(PlayerPick.weekly_pick_id == pick.id)
            ).all()
            all_player_picks.extend(player_picks)
        
        successful_picks = sum(1 for pp in all_player_picks if pp.fpl_points and pp.fpl_points > 0)
        success_rate = (successful_picks / len(all_player_picks) * 100) if all_player_picks else 0
        avg_fpl_points = sum(pp.fpl_points or 0 for pp in all_player_picks) / len(all_player_picks) if all_player_picks else 0
        
        # Points and rank over time
        points_over_time = [
            {"gameweek": p.gameweek, "points": p.total_points}
            for p in sorted(picks, key=lambda x: x.gameweek)
        ]
        rank_over_time = [
            {"gameweek": p.gameweek, "rank": p.rank}
            for p in sorted(picks, key=lambda x: x.gameweek)
            if p.rank
        ]
        
        return {
            "totalPoints": total_points,
            "averagePoints": round(avg_points, 1),
            "bestRank": best_rank,
            "scorePredictionStats": {
                "accuracy": round(score_accuracy, 1),
                "exactScores": exact_scores,
                "avgPoints": round(avg_score_points, 1),
            },
            "playerPickStats": {
                "avgFplPoints": round(avg_fpl_points, 1),
                "successRate": round(success_rate, 1),
                "totalPicks": len(all_player_picks),
            },
            "pointsOverTime": points_over_time,
            "rankOverTime": rank_over_time,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )


@router.get("/history")
async def get_history(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get user's pick history"""
    try:
        picks = session.exec(
            select(WeeklyPick).where(WeeklyPick.user_id == current_user.id)
            .order_by(WeeklyPick.gameweek.desc())
        ).all()
        
        result = []
        for pick in picks:
            # Get score predictions and player picks
            score_preds = session.exec(
                select(ScorePrediction).where(ScorePrediction.weekly_pick_id == pick.id)
            ).all()
            
            player_picks = session.exec(
                select(PlayerPick).where(PlayerPick.weekly_pick_id == pick.id)
            ).all()
            
            # Get team info
            bootstrap = await fpl_service.get_bootstrap_static()
            teams = {t["id"]: t for t in bootstrap.get("teams", [])}
            
            result.append({
                "gameweek": pick.gameweek,
                "totalPoints": pick.total_points,
                "rank": pick.rank,
                "scorePredictions": [
                    {
                        "homeTeam": teams.get(sp.home_team_id, {}).get("short_name", "TBD"),
                        "awayTeam": teams.get(sp.away_team_id, {}).get("short_name", "TBD"),
                        "prediction": {
                            "home": sp.predicted_home_score,
                            "away": sp.predicted_away_score,
                        },
                        "actual": {
                            "home": sp.actual_home_score,
                            "away": sp.actual_away_score,
                        } if sp.actual_home_score is not None else None,
                        "points": sp.points,
                    }
                    for sp in score_preds
                ],
                "playerPicks": [
                    {
                        "player": {
                            "name": "Unknown",  # Would need to fetch from bootstrap
                            "fplPoints": pp.fpl_points or 0,
                        },
                        "points": pp.points,
                    }
                    for pp in player_picks
                ],
            })
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history: {str(e)}"
        )

