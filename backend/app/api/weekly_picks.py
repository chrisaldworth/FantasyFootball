from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlmodel import Session, select, func
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel
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


# Request models
class ScorePredictionRequest(BaseModel):
    fixtureId: int
    homeTeamId: Optional[int] = 0
    awayTeamId: Optional[int] = 0
    homeScore: int
    awayScore: int


class PlayerPickRequest(BaseModel):
    playerId: int
    fixtureId: int


class SubmitPicksRequest(BaseModel):
    scorePredictions: List[ScorePredictionRequest]
    playerPicks: List[PlayerPickRequest]


@router.get("/valid-gameweeks")
async def get_valid_gameweeks():
    """Get current gameweek and valid gameweeks for submission"""
    try:
        bootstrap = await fpl_service.get_bootstrap_static()
        events = bootstrap.get("events", [])
        
        if not events:
            return {
                "current_gameweek": None,
                "valid_gameweeks": [],
                "error": "Unable to fetch gameweek data"
            }
        
        # Get current gameweek
        current_event = next((e for e in events if e.get("is_current")), None)
        if not current_event:
            return {
                "current_gameweek": None,
                "valid_gameweeks": [],
                "error": "No current gameweek found"
            }
        
        current_gameweek = current_event["id"]
        
        # Valid gameweeks are current and next
        valid_gameweeks = [current_gameweek]
        next_event = next((e for e in events if e["id"] == current_gameweek + 1), None)
        if next_event:
            valid_gameweeks.append(current_gameweek + 1)
        
        # Get deadlines for valid gameweeks
        gameweek_info = []
        for gw in valid_gameweeks:
            event = next((e for e in events if e["id"] == gw), None)
            if event:
                deadline_time = event.get("deadline_time")
                gameweek_info.append({
                    "gameweek": gw,
                    "deadline": deadline_time,
                    "name": event.get("name", f"Gameweek {gw}"),
                })
        
        return {
            "current_gameweek": current_gameweek,
            "valid_gameweeks": gameweek_info,
        }
    except Exception as e:
        print(f"[Weekly Picks] Error getting valid gameweeks: {e}")
        return {
            "current_gameweek": None,
            "valid_gameweeks": [],
            "error": str(e)
        }


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


async def validate_gameweek_for_submission(gameweek: int) -> dict:
    """
    Validate that picks can be submitted for the given gameweek.
    
    Returns:
        {
            "valid": bool,
            "error": str | None,
            "current_gameweek": int | None,
            "deadline": str | None
        }
    """
    try:
        # Get bootstrap data
        bootstrap = await fpl_service.get_bootstrap_static()
        events = bootstrap.get("events", [])
        
        if not events:
            return {
                "valid": False,
                "error": "Unable to fetch gameweek data from FPL API",
                "current_gameweek": None,
            }
        
        # Find target gameweek in events
        target_event = next((e for e in events if e["id"] == gameweek), None)
        if not target_event:
            # Try to get current gameweek for error message
            current_event = next((e for e in events if e.get("is_current")), None)
            max_gameweek = max((e["id"] for e in events), default=0)
            return {
                "valid": False,
                "error": f"Gameweek {gameweek} not found. Valid gameweeks are 1-{max_gameweek}",
                "current_gameweek": current_event["id"] if current_event else None,
            }
        
        # Get current gameweek
        current_event = next((e for e in events if e.get("is_current")), None)
        if not current_event:
            # If no current gameweek, check if season has ended or not started
            finished_events = [e for e in events if e.get("finished")]
            if finished_events:
                last_finished = max(finished_events, key=lambda e: e["id"])
                return {
                    "valid": False,
                    "error": f"Season appears to have ended. Last finished gameweek was {last_finished['id']}",
                    "current_gameweek": None,
                }
            else:
                return {
                    "valid": False,
                    "error": "No current gameweek found. Season may not have started yet.",
                    "current_gameweek": None,
                }
        
        current_gameweek = current_event["id"]
        
        # Validate gameweek is current or next
        if gameweek < current_gameweek:
            return {
                "valid": False,
                "error": f"Cannot submit picks for past gameweek {gameweek}. Current gameweek is {current_gameweek}",
                "current_gameweek": current_gameweek,
            }
        
        if gameweek > current_gameweek + 1:
            return {
                "valid": False,
                "error": f"Cannot submit picks for gameweek {gameweek}. Next available gameweek is {current_gameweek + 1}",
                "current_gameweek": current_gameweek,
            }
        
        # Check if deadline has passed (check first fixture kickoff time)
        try:
            fixtures = await fpl_service.get_gameweek_fixtures(gameweek)
            if fixtures:
                # Get first fixture by kickoff time
                fixtures_with_time = [f for f in fixtures if f.get("kickoff_time")]
                if fixtures_with_time:
                    first_fixture = min(fixtures_with_time, key=lambda f: f["kickoff_time"])
                    kickoff_time_str = first_fixture.get("kickoff_time")
                    if kickoff_time_str:
                        # Parse kickoff time (format: "2024-12-21T15:00:00Z")
                        if kickoff_time_str.endswith('Z'):
                            deadline = datetime.fromisoformat(kickoff_time_str.replace('Z', '+00:00'))
                        else:
                            deadline = datetime.fromisoformat(kickoff_time_str)
                        if not deadline.tzinfo:
                            deadline = deadline.replace(tzinfo=timezone.utc)
                        now = datetime.now(timezone.utc)
                        if now > deadline:
                            deadline_str = deadline.strftime("%Y-%m-%d %H:%M UTC")
                            return {
                                "valid": False,
                                "error": f"Submission deadline for gameweek {gameweek} has passed (deadline: {deadline_str})",
                                "current_gameweek": current_gameweek,
                                "deadline": deadline_str,
                            }
        except Exception as e:
            # If we can't get fixtures, log but don't fail validation
            print(f"[Weekly Picks] Warning: Could not check deadline for gameweek {gameweek}: {e}")
            # Continue with validation - deadline check is best effort
        
        return {
            "valid": True,
            "current_gameweek": current_gameweek,
        }
    except Exception as e:
        print(f"[Weekly Picks] Error validating gameweek: {e}")
        import traceback
        traceback.print_exc()
        return {
            "valid": False,
            "error": f"Error validating gameweek: {str(e)}",
            "current_gameweek": None,
        }


@router.get("/health")
async def health_check():
    """Health check for weekly picks tables"""
    from sqlalchemy import inspect
    from app.core.database import engine
    
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        required_tables = ["weekly_picks", "score_predictions", "player_picks"]
        missing_tables = [t for t in required_tables if t not in tables]
        
        if missing_tables:
            return {
                "status": "unhealthy",
                "message": f"Missing tables: {missing_tables}",
                "existing_tables": tables,
            }
        
        # Check weekly_picks table columns
        columns = inspector.get_columns("weekly_picks")
        column_names = [col["name"] for col in columns]
        
        return {
            "status": "healthy",
            "tables": required_tables,
            "weekly_picks_columns": column_names,
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
        }


@router.post("/submit")
async def submit_picks(
    request: SubmitPicksRequest = Body(...),
    gameweek: int = Query(..., description="Gameweek number"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Submit weekly picks for a gameweek"""
    import traceback
    step = "init"
    try:
        step = "logging_request"
        print(f"[Weekly Picks] Submit request - User: {current_user.id}, Gameweek: {gameweek}")
        print(f"[Weekly Picks] Score predictions count: {len(request.scorePredictions)}")
        print(f"[Weekly Picks] Player picks count: {len(request.playerPicks)}")
        
        # Log detailed data safely
        try:
            print(f"[Weekly Picks] Score predictions data: {[sp.model_dump() for sp in request.scorePredictions]}")
            print(f"[Weekly Picks] Player picks data: {[pp.model_dump() for pp in request.playerPicks]}")
        except Exception as log_err:
            print(f"[Weekly Picks] Could not log request data: {log_err}")
        
        scorePredictions = request.scorePredictions
        playerPicks = request.playerPicks
        
        # Validate gameweek FIRST before processing anything else
        step = "validate_gameweek"
        print(f"[Weekly Picks] Step: {step}")
        validation = await validate_gameweek_for_submission(gameweek)
        if not validation["valid"]:
            error_detail = validation["error"]
            if validation.get("current_gameweek"):
                error_detail += f" (Current gameweek: {validation['current_gameweek']})"
            print(f"[Weekly Picks] Validation failed: {error_detail}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_detail
            )
        print(f"[Weekly Picks] Gameweek validation passed")
        
        # Validate input
        step = "validate_input_counts"
        print(f"[Weekly Picks] Step: {step}")
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
        print(f"[Weekly Picks] Input counts validated")
        
        # Check if picks already exist
        step = "check_existing_picks"
        print(f"[Weekly Picks] Step: {step}")
        existing_pick = session.exec(
            select(WeeklyPick).where(
                WeeklyPick.user_id == current_user.id,
                WeeklyPick.gameweek == gameweek
            )
        ).first()
        print(f"[Weekly Picks] Existing pick found: {existing_pick is not None}")
        
        if existing_pick:
            step = "update_existing_picks"
            print(f"[Weekly Picks] Step: {step}")
            # Update existing picks
            weekly_pick = existing_pick
            # Delete old predictions and picks
            old_score_preds = session.exec(
                select(ScorePrediction).where(ScorePrediction.weekly_pick_id == weekly_pick.id)
            ).all()
            print(f"[Weekly Picks] Found {len(old_score_preds)} old score predictions to delete")
            for sp in old_score_preds:
                session.delete(sp)
            
            old_player_picks = session.exec(
                select(PlayerPick).where(PlayerPick.weekly_pick_id == weekly_pick.id)
            ).all()
            print(f"[Weekly Picks] Found {len(old_player_picks)} old player picks to delete")
            for pp in old_player_picks:
                session.delete(pp)
            
            step = "commit_deletions"
            print(f"[Weekly Picks] Step: {step}")
            session.commit()
            print(f"[Weekly Picks] Old picks deleted successfully")
        else:
            step = "create_new_weekly_pick"
            print(f"[Weekly Picks] Step: {step}")
            # Create new picks
            weekly_pick = WeeklyPick(
                user_id=current_user.id,
                gameweek=gameweek,
                total_points=0,
            )
            session.add(weekly_pick)
            step = "commit_new_weekly_pick"
            print(f"[Weekly Picks] Step: {step}")
            session.commit()
            session.refresh(weekly_pick)
            print(f"[Weekly Picks] New weekly pick created with id: {weekly_pick.id}")
        
        # Add score predictions
        step = "add_score_predictions"
        print(f"[Weekly Picks] Step: {step}")
        total_points = 0
        for idx, sp in enumerate(scorePredictions):
            print(f"[Weekly Picks] Adding score prediction {idx+1}: fixture={sp.fixtureId}, home_team={sp.homeTeamId}, away_team={sp.awayTeamId}")
            score_pred = ScorePrediction(
                weekly_pick_id=weekly_pick.id,
                fixture_id=sp.fixtureId,
                home_team_id=sp.homeTeamId or 0,
                away_team_id=sp.awayTeamId or 0,
                predicted_home_score=sp.homeScore,
                predicted_away_score=sp.awayScore,
                points=0,  # Will be calculated when results are available
            )
            session.add(score_pred)
        print(f"[Weekly Picks] All score predictions added")
        
        # Add player picks
        step = "add_player_picks"
        print(f"[Weekly Picks] Step: {step}")
        for idx, pp in enumerate(playerPicks):
            print(f"[Weekly Picks] Adding player pick {idx+1}: player={pp.playerId}, fixture={pp.fixtureId}")
            player_pick = PlayerPick(
                weekly_pick_id=weekly_pick.id,
                player_id=pp.playerId,
                fixture_id=pp.fixtureId,
                points=0,  # Will be calculated when results are available
            )
            session.add(player_pick)
        print(f"[Weekly Picks] All player picks added")
        
        step = "final_commit"
        print(f"[Weekly Picks] Step: {step}")
        session.commit()
        print(f"[Weekly Picks] Final commit successful")
        
        return {
            "success": True,
            "message": "Picks submitted successfully",
            "weekly_pick_id": weekly_pick.id,
        }
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        error_trace = traceback.format_exc()
        error_str = str(e)
        print(f"[Weekly Picks] ERROR at step '{step}': {error_str}")
        print(f"[Weekly Picks] Error type: {type(e).__name__}")
        print(f"[Weekly Picks] Full traceback:\n{error_trace}")
        
        # Check for specific database errors
        if "no such table" in error_str.lower() or "doesn't exist" in error_str.lower():
            detail = f"Database tables not created (step: {step}). Please contact support."
        elif "constraint" in error_str.lower() or "unique" in error_str.lower():
            detail = f"Database constraint error at step '{step}'. You may have already submitted picks for this gameweek."
        elif "connection" in error_str.lower() or "ssl" in error_str.lower():
            detail = f"Database connection error at step '{step}'. Please try again."
        else:
            detail = f"Failed at step '{step}': {error_str[:200]}"
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )


@router.get("/{gameweek}")
async def get_picks(
    gameweek: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get user's picks for a gameweek"""
    import traceback
    try:
        # Validate gameweek
        if not isinstance(gameweek, int) or gameweek < 1:
            return {
                "scorePredictions": [],
                "playerPicks": [],
            }
        
        # Get weekly pick
        try:
            weekly_pick = session.exec(
                select(WeeklyPick).where(
                    WeeklyPick.user_id == current_user.id,
                    WeeklyPick.gameweek == gameweek
                )
            ).first()
        except Exception as db_error:
            print(f"[Weekly Picks] Database error fetching weekly pick for gameweek {gameweek}, user {current_user.id}: {db_error}")
            traceback.print_exc()
            # Return empty picks instead of 500 error
            return {
                "scorePredictions": [],
                "playerPicks": [],
            }
        
        if not weekly_pick:
            return {
                "scorePredictions": [],
                "playerPicks": [],
            }
        
        # Get score predictions
        try:
            score_predictions = session.exec(
                select(ScorePrediction).where(ScorePrediction.weekly_pick_id == weekly_pick.id)
            ).all()
        except Exception as e:
            print(f"[Weekly Picks] Error fetching score predictions: {e}")
            traceback.print_exc()
            score_predictions = []
        
        # Get player picks
        try:
            player_picks = session.exec(
                select(PlayerPick).where(PlayerPick.weekly_pick_id == weekly_pick.id)
            ).all()
        except Exception as e:
            print(f"[Weekly Picks] Error fetching player picks: {e}")
            traceback.print_exc()
            player_picks = []
        
        # Get fixture and team info from FPL - handle errors gracefully
        teams = {}
        try:
            bootstrap = await fpl_service.get_bootstrap_static()
            if bootstrap and isinstance(bootstrap, dict):
                teams_list = bootstrap.get("teams", [])
                if isinstance(teams_list, list):
                    teams = {t.get("id"): t for t in teams_list if isinstance(t, dict) and "id" in t}
        except Exception as bootstrap_error:
            print(f"[Weekly Picks] Warning: Could not fetch bootstrap data for gameweek {gameweek}: {bootstrap_error}")
            traceback.print_exc()
            # Continue without team names - will use "TBD" as fallback
        
        # Build response with defensive coding
        score_predictions_data = []
        for sp in score_predictions:
            try:
                home_team_id = sp.home_team_id if sp.home_team_id is not None else None
                away_team_id = sp.away_team_id if sp.away_team_id is not None else None
                
                # Get team names safely
                home_team_name = "TBD"
                away_team_name = "TBD"
                if teams and home_team_id is not None:
                    home_team = teams.get(home_team_id, {})
                    if isinstance(home_team, dict):
                        home_team_name = home_team.get("short_name", "TBD")
                if teams and away_team_id is not None:
                    away_team = teams.get(away_team_id, {})
                    if isinstance(away_team, dict):
                        away_team_name = away_team.get("short_name", "TBD")
                
                score_predictions_data.append({
                    "fixtureId": sp.fixture_id if hasattr(sp, 'fixture_id') else None,
                    "homeTeamId": home_team_id,
                    "awayTeamId": away_team_id,
                    "homeTeam": home_team_name,
                    "awayTeam": away_team_name,
                    "homeScore": sp.predicted_home_score if hasattr(sp, 'predicted_home_score') else None,
                    "awayScore": sp.predicted_away_score if hasattr(sp, 'predicted_away_score') else None,
                })
            except Exception as sp_error:
                print(f"[Weekly Picks] Error processing score prediction: {sp_error}")
                traceback.print_exc()
                continue
        
        player_picks_data = []
        for pp in player_picks:
            try:
                player_picks_data.append({
                    "playerId": pp.player_id if hasattr(pp, 'player_id') else None,
                    "fixtureId": pp.fixture_id if hasattr(pp, 'fixture_id') else None,
                })
            except Exception as pp_error:
                print(f"[Weekly Picks] Error processing player pick: {pp_error}")
                traceback.print_exc()
                continue
        
        return {
            "scorePredictions": score_predictions_data,
            "playerPicks": player_picks_data,
        }
    except Exception as e:
        print(f"[Weekly Picks] Unhandled error fetching picks for gameweek {gameweek}, user {current_user.id}: {e}")
        traceback.print_exc()
        # Return empty picks instead of 500 error to prevent frontend crashes
        return {
            "scorePredictions": [],
            "playerPicks": [],
        }


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

