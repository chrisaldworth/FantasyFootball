"""
Predictions API endpoints
Provides AI-powered match score and goal scorer predictions
"""
from fastapi import APIRouter, Query, HTTPException, status, Depends
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta
from sqlmodel import Session, select, func, and_, or_
from uuid import UUID

from app.core.pl_database import get_pl_session
from app.models.pl_data import Match, Team, Player
from app.services.fpl_service import fpl_service
from app.services.prediction_service import PredictionService

router = APIRouter(prefix="/predictions", tags=["Predictions"])


def _get_fpl_team_id_from_name(team_name: str, teams_map: Dict[int, Dict]) -> Optional[int]:
    """Map team name to FPL team ID"""
    for team_id, team_data in teams_map.items():
        if team_data.get('name', '').lower() == team_name.lower():
            return team_id
    return None


def _get_db_team_from_fpl_id(fpl_team_id: int, session: Session) -> Optional[Team]:
    """Get database team from FPL team ID"""
    # Teams in DB use fbref_id like "fpl_1", "fpl_2", etc.
    fbref_id = f"fpl_{fpl_team_id}"
    statement = select(Team).where(Team.fbref_id == fbref_id)
    return session.exec(statement).first()


def _get_db_team_from_name(team_name: str, session: Session) -> Optional[Team]:
    """Get database team from team name"""
    statement = select(Team).where(Team.name == team_name)
    return session.exec(statement).first()


@router.get("/fixtures")
async def get_fixtures_with_predictions(
    gameweek: Optional[int] = Query(None, description="Filter by gameweek"),
    team_id: Optional[int] = Query(None, description="Filter by FPL team ID"),
    date_from: Optional[str] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    session: Session = Depends(get_pl_session),
) -> Dict[str, Any]:
    """
    Get fixtures with predictions
    
    Returns list of upcoming fixtures with AI-powered score predictions,
    outcome probabilities, and confidence levels.
    """
    try:
        # Get current season
        now = datetime.now()
        if now.month >= 8:
            season = f"{now.year}-{now.year + 1}"
        else:
            season = f"{now.year - 1}-{now.year}"
        
        # Get fixtures from FPL API
        if gameweek:
            fpl_fixtures = await fpl_service.get_gameweek_fixtures(gameweek)
        else:
            fpl_fixtures = await fpl_service.get_fixtures()
        
        # Get teams map
        bootstrap = await fpl_service.get_bootstrap_static()
        teams_map = {team['id']: team for team in bootstrap.get('teams', [])}
        
        # Filter fixtures
        filtered_fixtures = []
        today = datetime.now().date()
        
        for fpl_fixture in fpl_fixtures:
            # Filter by team
            if team_id:
                if fpl_fixture.get('team_h') != team_id and fpl_fixture.get('team_a') != team_id:
                    continue
            
            # Filter by date
            kickoff_time = fpl_fixture.get('kickoff_time')
            if kickoff_time:
                try:
                    fixture_date = datetime.fromisoformat(kickoff_time.replace('Z', '+00:00')).date()
                    
                    if date_from:
                        from_date = datetime.fromisoformat(date_from).date()
                        if fixture_date < from_date:
                            continue
                    
                    if date_to:
                        to_date = datetime.fromisoformat(date_to).date()
                        if fixture_date > to_date:
                            continue
                    
                    # Only include future fixtures for predictions
                    if fixture_date < today:
                        continue
                        
                except:
                    pass
            
            filtered_fixtures.append(fpl_fixture)
        
        # Generate predictions
        predictions = []
        prediction_service = PredictionService(session)
        
        for fpl_fixture in filtered_fixtures:
            try:
                home_fpl_id = fpl_fixture.get('team_h')
                away_fpl_id = fpl_fixture.get('team_a')
                
                if not home_fpl_id or not away_fpl_id:
                    continue
                
                # Get database teams
                home_team = _get_db_team_from_fpl_id(home_fpl_id, session)
                away_team = _get_db_team_from_fpl_id(away_fpl_id, session)
                
                if not home_team or not away_team:
                    # Try by name as fallback
                    home_name = teams_map.get(home_fpl_id, {}).get('name', '')
                    away_name = teams_map.get(away_fpl_id, {}).get('name', '')
                    home_team = _get_db_team_from_name(home_name, session)
                    away_team = _get_db_team_from_name(away_name, session)
                
                if not home_team or not away_team:
                    continue
                
                # Get fixture date
                kickoff_time = fpl_fixture.get('kickoff_time')
                if kickoff_time:
                    fixture_date = datetime.fromisoformat(kickoff_time.replace('Z', '+00:00')).date()
                else:
                    fixture_date = today
                
                # Generate prediction
                prediction = prediction_service.predict_match_score(
                    str(home_team.id),
                    str(away_team.id),
                    season,
                    fixture_date
                )
                
                # Get actual result if match is finished
                actual_result = None
                if fpl_fixture.get('finished'):
                    actual_result = {
                        'homeScore': fpl_fixture.get('team_h_score'),
                        'awayScore': fpl_fixture.get('team_a_score'),
                    }
                
                predictions.append({
                    'fixture': {
                        'id': fpl_fixture.get('id'),
                        'homeTeam': {
                            'id': home_fpl_id,
                            'name': teams_map.get(home_fpl_id, {}).get('name', 'Unknown'),
                        },
                        'awayTeam': {
                            'id': away_fpl_id,
                            'name': teams_map.get(away_fpl_id, {}).get('name', 'Unknown'),
                        },
                        'date': kickoff_time or fixture_date.isoformat(),
                    },
                    'prediction': prediction,
                    'actualResult': actual_result,
                })
                
            except Exception as e:
                print(f"Error generating prediction for fixture {fpl_fixture.get('id')}: {e}")
                continue
        
        return {
            "predictions": predictions,
            "count": len(predictions),
            "filters": {
                "gameweek": gameweek,
                "team_id": team_id,
                "date_from": date_from,
                "date_to": date_to,
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch predictions: {str(e)}"
        )


@router.get("/match/{fixture_id}")
async def get_match_prediction(
    fixture_id: int,
    session: Session = Depends(get_pl_session),
) -> Dict[str, Any]:
    """
    Get detailed prediction for a specific match
    """
    try:
        # Get fixture from FPL API
        fpl_fixtures = await fpl_service.get_fixtures()
        fpl_fixture = next((f for f in fpl_fixtures if f.get('id') == fixture_id), None)
        
        if not fpl_fixture:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Fixture {fixture_id} not found"
            )
        
        # Get teams
        bootstrap = await fpl_service.get_bootstrap_static()
        teams_map = {team['id']: team for team in bootstrap.get('teams', [])}
        
        home_fpl_id = fpl_fixture.get('team_h')
        away_fpl_id = fpl_fixture.get('team_a')
        
        home_team = _get_db_team_from_fpl_id(home_fpl_id, session)
        away_team = _get_db_team_from_fpl_id(away_fpl_id, session)
        
        if not home_team or not away_team:
            home_name = teams_map.get(home_fpl_id, {}).get('name', '')
            away_name = teams_map.get(away_fpl_id, {}).get('name', '')
            home_team = _get_db_team_from_name(home_name, session)
            away_team = _get_db_team_from_name(away_name, session)
        
        if not home_team or not away_team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teams not found in database"
            )
        
        # Get season and date
        now = datetime.now()
        if now.month >= 8:
            season = f"{now.year}-{now.year + 1}"
        else:
            season = f"{now.year - 1}-{now.year}"
        
        kickoff_time = fpl_fixture.get('kickoff_time')
        if kickoff_time:
            fixture_date = datetime.fromisoformat(kickoff_time.replace('Z', '+00:00')).date()
        else:
            fixture_date = datetime.now().date()
        
        # Generate prediction
        prediction_service = PredictionService(session)
        prediction = prediction_service.predict_match_score(
            str(home_team.id),
            str(away_team.id),
            season,
            fixture_date
        )
        
        # Get team form data
        home_form_data = prediction_service.get_team_form_data(
            str(home_team.id), season, fixture_date, is_home=True, limit=5
        )
        away_form_data = prediction_service.get_team_form_data(
            str(away_team.id), season, fixture_date, is_home=False, limit=5
        )
        
        # Get head-to-head
        h2h_matches = prediction_service._get_head_to_head(
            str(home_team.id), str(away_team.id), fixture_date
        )
        
        # Format H2H for response
        h2h_formatted = []
        for match in h2h_matches:
            h2h_formatted.append({
                'date': match['date'],
                'homeTeam': home_team.name,
                'awayTeam': away_team.name,
                'homeScore': match['home_score'],
                'awayScore': match['away_score'],
                'result': 'W' if match['home_score'] > match['away_score'] else ('D' if match['home_score'] == match['away_score'] else 'L'),
            })
        
        # Get team stats
        home_form = prediction_service._get_team_form(str(home_team.id), season, fixture_date, is_home=True)
        away_form = prediction_service._get_team_form(str(away_team.id), season, fixture_date, is_home=False)
        
        return {
            "fixture_id": fixture_id,
            "prediction": prediction,
            "teamForm": {
                "home": home_form_data,
                "away": away_form_data,
            },
            "headToHead": h2h_formatted,
            "teamStats": {
                "home": {
                    "goalsFor": round(home_form.get('avg_goals_for', 0) * 10),
                    "goalsAgainst": round(home_form.get('avg_goals_against', 0) * 10),
                    "wins": home_form.get('wins', 0),
                    "draws": home_form.get('draws', 0),
                    "losses": home_form.get('losses', 0),
                },
                "away": {
                    "goalsFor": round(away_form.get('avg_goals_for', 0) * 10),
                    "goalsAgainst": round(away_form.get('avg_goals_against', 0) * 10),
                    "wins": away_form.get('wins', 0),
                    "draws": away_form.get('draws', 0),
                    "losses": away_form.get('losses', 0),
                },
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch match prediction: {str(e)}"
        )


@router.get("/goal-scorers/{fixture_id}")
async def get_goal_scorer_predictions(
    fixture_id: int,
    session: Session = Depends(get_pl_session),
) -> Dict[str, Any]:
    """
    Get predicted goal scorers for a match
    """
    try:
        # Get fixture from FPL API
        fpl_fixtures = await fpl_service.get_fixtures()
        fpl_fixture = next((f for f in fpl_fixtures if f.get('id') == fixture_id), None)
        
        if not fpl_fixture:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Fixture {fixture_id} not found"
            )
        
        # Get teams
        bootstrap = await fpl_service.get_bootstrap_static()
        teams_map = {team['id']: team for team in bootstrap.get('teams', [])}
        
        home_fpl_id = fpl_fixture.get('team_h')
        away_fpl_id = fpl_fixture.get('team_a')
        
        home_team = _get_db_team_from_fpl_id(home_fpl_id, session)
        away_team = _get_db_team_from_fpl_id(away_fpl_id, session)
        
        if not home_team or not away_team:
            home_name = teams_map.get(home_fpl_id, {}).get('name', '')
            away_name = teams_map.get(away_fpl_id, {}).get('name', '')
            home_team = _get_db_team_from_name(home_name, session)
            away_team = _get_db_team_from_name(away_name, session)
        
        if not home_team or not away_team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teams not found in database"
            )
        
        # Get season and date
        now = datetime.now()
        if now.month >= 8:
            season = f"{now.year}-{now.year + 1}"
        else:
            season = f"{now.year - 1}-{now.year}"
        
        kickoff_time = fpl_fixture.get('kickoff_time')
        if kickoff_time:
            fixture_date = datetime.fromisoformat(kickoff_time.replace('Z', '+00:00')).date()
        else:
            fixture_date = datetime.now().date()
        
        # Generate goal scorer predictions
        prediction_service = PredictionService(session)
        scorers = prediction_service.predict_goal_scorers(
            str(home_team.id),
            str(away_team.id),
            season,
            fixture_date
        )
        
        return {
            "fixture_id": fixture_id,
            "homeScorers": scorers.get('homeScorers', []),
            "awayScorers": scorers.get('awayScorers', []),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch goal scorer predictions: {str(e)}"
        )


@router.get("/accuracy")
async def get_prediction_accuracy(
    limit: Optional[int] = Query(30, description="Number of recent predictions to analyze"),
    session: Session = Depends(get_pl_session),
) -> Dict[str, Any]:
    """
    Get prediction accuracy metrics
    """
    try:
        # Get finished fixtures from FPL API
        fpl_fixtures = await fpl_service.get_fixtures()
        finished_fixtures = [f for f in fpl_fixtures if f.get('finished')]
        
        # Limit to most recent
        finished_fixtures = sorted(
            finished_fixtures,
            key=lambda x: x.get('kickoff_time', ''),
            reverse=True
        )[:limit]
        
        bootstrap = await fpl_service.get_bootstrap_static()
        teams_map = {team['id']: team for team in bootstrap.get('teams', [])}
        
        # Calculate accuracy
        exact_matches = 0
        outcome_correct = 0
        total = 0
        
        recent_predictions = []
        accuracy_trend = []
        
        prediction_service = PredictionService(session)
        
        for fpl_fixture in finished_fixtures:
            try:
                home_fpl_id = fpl_fixture.get('team_h')
                away_fpl_id = fpl_fixture.get('team_a')
                actual_home = fpl_fixture.get('team_h_score')
                actual_away = fpl_fixture.get('team_a_score')
                
                if actual_home is None or actual_away is None:
                    continue
                
                home_team = _get_db_team_from_fpl_id(home_fpl_id, session)
                away_team = _get_db_team_from_fpl_id(away_fpl_id, session)
                
                if not home_team or not away_team:
                    continue
                
                # Get fixture date (use kickoff time or estimate from finished status)
                kickoff_time = fpl_fixture.get('kickoff_time')
                if kickoff_time:
                    fixture_date = datetime.fromisoformat(kickoff_time.replace('Z', '+00:00')).date()
                else:
                    # Estimate date (finished matches are in the past)
                    fixture_date = datetime.now().date() - timedelta(days=1)
                
                # CRITICAL: Use date BEFORE match for prediction (simulate pre-match prediction)
                # Subtract 1 day to ensure we're using data available before the match
                prediction_date = fixture_date - timedelta(days=1)
                
                # Get season
                if fixture_date.month >= 8:
                    season = f"{fixture_date.year}-{fixture_date.year + 1}"
                else:
                    season = f"{fixture_date.year - 1}-{fixture_date.year}"
                
                # Generate prediction (using date BEFORE match to simulate real prediction)
                prediction = prediction_service.predict_match_score(
                    str(home_team.id),
                    str(away_team.id),
                    season,
                    prediction_date
                )
                
                pred_home = prediction.get('predictedHomeScore', 0)
                pred_away = prediction.get('predictedAwayScore', 0)
                
                # Check accuracy
                is_exact = (pred_home == actual_home and pred_away == actual_away)
                is_outcome_correct = (
                    (pred_home > pred_away and actual_home > actual_away) or
                    (pred_home < pred_away and actual_home < actual_away) or
                    (pred_home == pred_away and actual_home == actual_away)
                )
                
                if is_exact:
                    exact_matches += 1
                if is_outcome_correct:
                    outcome_correct += 1
                
                total += 1
                
                # Store recent prediction
                home_name = teams_map.get(home_fpl_id, {}).get('name', 'Unknown')
                away_name = teams_map.get(away_fpl_id, {}).get('name', 'Unknown')
                
                accuracy_type = 'exact' if is_exact else ('outcome' if is_outcome_correct else 'wrong')
                
                recent_predictions.append({
                    'fixture': f"{home_name} vs {away_name}",
                    'predicted': f"{pred_home}-{pred_away}",
                    'actual': f"{actual_home}-{actual_away}",
                    'accuracy': accuracy_type,
                    'date': fixture_date.isoformat(),
                })
                
            except Exception as e:
                print(f"Error calculating accuracy for fixture {fpl_fixture.get('id')}: {e}")
                continue
        
        # Calculate metrics with improved weighting
        exact_accuracy = (exact_matches / total * 100) if total > 0 else 0
        outcome_accuracy = (outcome_correct / total * 100) if total > 0 else 0
        
        # Improved overall accuracy calculation:
        # - Exact score matches are worth 100 points
        # - Correct outcome (but wrong score) is worth 50 points
        # - Wrong outcome is worth 0 points
        # This gives more weight to exact predictions while still rewarding outcome accuracy
        if total > 0:
            exact_score_points = exact_matches * 100
            outcome_only_points = (outcome_correct - exact_matches) * 50
            total_points = exact_score_points + outcome_only_points
            overall_accuracy = (total_points / (total * 100)) * 100
        else:
            overall_accuracy = 0
        
        # Generate trend (last 10 matches)
        trend_data = []
        for i in range(min(10, len(recent_predictions))):
            pred = recent_predictions[i]
            trend_data.append({
                'date': pred['date'],
                'accuracy': 100 if pred['accuracy'] == 'exact' else (50 if pred['accuracy'] == 'outcome' else 0),
                'exactScore': 100 if pred['accuracy'] == 'exact' else 0,
                'outcome': 100 if pred['accuracy'] in ['exact', 'outcome'] else 0,
            })
        
        return {
            "metrics": {
                "overallAccuracy": round(overall_accuracy, 1),
                "exactScoreAccuracy": round(exact_accuracy, 1),
                "outcomeAccuracy": round(outcome_accuracy, 1),
                "goalScorerAccuracy": 0,  # TODO: Implement goal scorer accuracy tracking
            },
            "trend": trend_data,
            "recentPredictions": recent_predictions[:10],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch accuracy metrics: {str(e)}"
        )
