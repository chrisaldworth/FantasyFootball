"""
AI Prediction Analytics API
Endpoints for tracking and analyzing AI prediction accuracy
"""
from fastapi import APIRouter, Query, HTTPException, status, Depends
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta
from sqlmodel import Session, select, func, and_, or_
from uuid import UUID

from app.core.database import get_session
from app.core.pl_database import get_pl_session
from app.core.security import get_current_admin_user
from app.models.user import User
from app.models.ai_prediction import AIPrediction, AIPredictionAccuracySummary
from app.models.pl_data import Match, Team
from app.services.fpl_service import fpl_service
from app.services.prediction_service import PredictionService

router = APIRouter(prefix="/prediction-analytics", tags=["Prediction Analytics"])


# ============ Public Endpoints ============

@router.get("/accuracy/overview")
async def get_accuracy_overview(
    season: Optional[str] = Query(None, description="Filter by season (e.g., '2025-2026')"),
    session: Session = Depends(get_session),
) -> Dict[str, Any]:
    """
    Get overall prediction accuracy metrics.
    Returns summary statistics for all stored AI predictions.
    """
    try:
        # Build query
        query = select(AIPrediction).where(AIPrediction.actual_home_score.isnot(None))
        
        if season:
            query = query.where(AIPrediction.season == season)
        
        predictions = session.exec(query).all()
        
        if not predictions:
            return {
                "message": "No predictions with results found. Predictions are stored when matches are predicted and results are updated after matches finish.",
                "total_predictions": 0,
                "metrics": None,
            }
        
        # Calculate metrics
        total = len(predictions)
        exact_matches = sum(1 for p in predictions if p.is_exact_match)
        correct_outcomes = sum(1 for p in predictions if p.is_outcome_correct)
        
        # Average accuracy score
        avg_accuracy = sum(p.accuracy_score or 0 for p in predictions) / total if total > 0 else 0
        
        # Goal prediction accuracy
        avg_predicted_goals = sum(p.predicted_home_score + p.predicted_away_score for p in predictions) / total
        avg_actual_goals = sum((p.actual_home_score or 0) + (p.actual_away_score or 0) for p in predictions) / total
        avg_goal_diff = sum(p.score_difference or 0 for p in predictions) / total
        
        # Confidence analysis
        high_conf = [p for p in predictions if (p.confidence or 0) >= 80]
        med_conf = [p for p in predictions if 60 <= (p.confidence or 0) < 80]
        low_conf = [p for p in predictions if (p.confidence or 0) < 60]
        
        high_conf_accuracy = sum(1 for p in high_conf if p.is_outcome_correct) / len(high_conf) * 100 if high_conf else None
        med_conf_accuracy = sum(1 for p in med_conf if p.is_outcome_correct) / len(med_conf) * 100 if med_conf else None
        low_conf_accuracy = sum(1 for p in low_conf if p.is_outcome_correct) / len(low_conf) * 100 if low_conf else None
        
        return {
            "total_predictions": total,
            "metrics": {
                "exact_match_count": exact_matches,
                "exact_match_rate": round(exact_matches / total * 100, 2) if total > 0 else 0,
                "correct_outcome_count": correct_outcomes,
                "outcome_accuracy_rate": round(correct_outcomes / total * 100, 2) if total > 0 else 0,
                "overall_accuracy_score": round(avg_accuracy, 2),
            },
            "goal_prediction": {
                "avg_predicted_goals": round(avg_predicted_goals, 2),
                "avg_actual_goals": round(avg_actual_goals, 2),
                "avg_goal_difference": round(avg_goal_diff, 2),
            },
            "confidence_analysis": {
                "high_confidence": {
                    "count": len(high_conf),
                    "accuracy": round(high_conf_accuracy, 2) if high_conf_accuracy else None,
                },
                "medium_confidence": {
                    "count": len(med_conf),
                    "accuracy": round(med_conf_accuracy, 2) if med_conf_accuracy else None,
                },
                "low_confidence": {
                    "count": len(low_conf),
                    "accuracy": round(low_conf_accuracy, 2) if low_conf_accuracy else None,
                },
            },
            "season": season or "all",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch accuracy overview: {str(e)}"
        )


@router.get("/accuracy/by-gameweek")
async def get_accuracy_by_gameweek(
    season: str = Query(..., description="Season (e.g., '2025-2026')"),
    session: Session = Depends(get_session),
) -> Dict[str, Any]:
    """
    Get prediction accuracy broken down by gameweek.
    """
    try:
        query = select(AIPrediction).where(
            and_(
                AIPrediction.season == season,
                AIPrediction.actual_home_score.isnot(None),
                AIPrediction.gameweek.isnot(None)
            )
        ).order_by(AIPrediction.gameweek)
        
        predictions = session.exec(query).all()
        
        if not predictions:
            return {
                "season": season,
                "gameweeks": [],
                "message": "No predictions with results found for this season"
            }
        
        # Group by gameweek
        gameweek_data = {}
        for pred in predictions:
            gw = pred.gameweek
            if gw not in gameweek_data:
                gameweek_data[gw] = {
                    "total": 0,
                    "exact": 0,
                    "outcome": 0,
                    "accuracy_sum": 0,
                }
            gameweek_data[gw]["total"] += 1
            if pred.is_exact_match:
                gameweek_data[gw]["exact"] += 1
            if pred.is_outcome_correct:
                gameweek_data[gw]["outcome"] += 1
            gameweek_data[gw]["accuracy_sum"] += pred.accuracy_score or 0
        
        gameweeks = []
        for gw in sorted(gameweek_data.keys()):
            data = gameweek_data[gw]
            gameweeks.append({
                "gameweek": gw,
                "total_predictions": data["total"],
                "exact_matches": data["exact"],
                "exact_match_rate": round(data["exact"] / data["total"] * 100, 2),
                "correct_outcomes": data["outcome"],
                "outcome_accuracy_rate": round(data["outcome"] / data["total"] * 100, 2),
                "avg_accuracy_score": round(data["accuracy_sum"] / data["total"], 2),
            })
        
        return {
            "season": season,
            "gameweeks": gameweeks,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch gameweek accuracy: {str(e)}"
        )


@router.get("/accuracy/by-team")
async def get_accuracy_by_team(
    season: Optional[str] = Query(None, description="Filter by season"),
    session: Session = Depends(get_session),
) -> Dict[str, Any]:
    """
    Get prediction accuracy broken down by team.
    Shows which teams the AI predicts well vs poorly.
    """
    try:
        query = select(AIPrediction).where(AIPrediction.actual_home_score.isnot(None))
        
        if season:
            query = query.where(AIPrediction.season == season)
        
        predictions = session.exec(query).all()
        
        if not predictions:
            return {
                "teams": [],
                "message": "No predictions with results found"
            }
        
        # Group by team (counting both home and away)
        team_data = {}
        for pred in predictions:
            for team_id, team_name, is_home in [
                (pred.home_team_id, pred.home_team_name, True),
                (pred.away_team_id, pred.away_team_name, False)
            ]:
                if team_id not in team_data:
                    team_data[team_id] = {
                        "name": team_name or f"Team {team_id}",
                        "total": 0,
                        "exact": 0,
                        "outcome": 0,
                        "as_home": 0,
                        "as_away": 0,
                    }
                team_data[team_id]["total"] += 1
                if pred.is_exact_match:
                    team_data[team_id]["exact"] += 1
                if pred.is_outcome_correct:
                    team_data[team_id]["outcome"] += 1
                if is_home:
                    team_data[team_id]["as_home"] += 1
                else:
                    team_data[team_id]["as_away"] += 1
        
        teams = []
        for team_id, data in team_data.items():
            teams.append({
                "team_id": team_id,
                "team_name": data["name"],
                "total_predictions": data["total"],
                "exact_match_rate": round(data["exact"] / data["total"] * 100, 2),
                "outcome_accuracy_rate": round(data["outcome"] / data["total"] * 100, 2),
                "home_predictions": data["as_home"],
                "away_predictions": data["as_away"],
            })
        
        # Sort by outcome accuracy
        teams.sort(key=lambda x: x["outcome_accuracy_rate"], reverse=True)
        
        return {
            "season": season or "all",
            "teams": teams,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch team accuracy: {str(e)}"
        )


@router.get("/recent")
async def get_recent_predictions(
    limit: int = Query(20, ge=1, le=100, description="Number of predictions to return"),
    include_pending: bool = Query(False, description="Include predictions without results"),
    session: Session = Depends(get_session),
) -> Dict[str, Any]:
    """
    Get recent AI predictions with their accuracy.
    """
    try:
        query = select(AIPrediction)
        
        if not include_pending:
            query = query.where(AIPrediction.actual_home_score.isnot(None))
        
        query = query.order_by(AIPrediction.prediction_timestamp.desc()).limit(limit)
        predictions = session.exec(query).all()
        
        results = []
        for pred in predictions:
            result = {
                "id": str(pred.id),
                "fixture_id": pred.fixture_id,
                "home_team": pred.home_team_name or f"Team {pred.home_team_id}",
                "away_team": pred.away_team_name or f"Team {pred.away_team_id}",
                "predicted_score": f"{pred.predicted_home_score}-{pred.predicted_away_score}",
                "confidence": pred.confidence,
                "home_win_prob": pred.home_win_probability,
                "draw_prob": pred.draw_probability,
                "away_win_prob": pred.away_win_probability,
                "prediction_time": pred.prediction_timestamp.isoformat(),
                "match_date": pred.match_date.isoformat(),
                "gameweek": pred.gameweek,
                "season": pred.season,
            }
            
            if pred.actual_home_score is not None:
                result["actual_score"] = f"{pred.actual_home_score}-{pred.actual_away_score}"
                result["is_exact_match"] = pred.is_exact_match
                result["is_outcome_correct"] = pred.is_outcome_correct
                result["accuracy_score"] = pred.accuracy_score
                
                # Determine accuracy type
                if pred.is_exact_match:
                    result["accuracy_type"] = "exact"
                elif pred.is_outcome_correct:
                    result["accuracy_type"] = "outcome"
                else:
                    result["accuracy_type"] = "wrong"
            else:
                result["status"] = "pending"
            
            results.append(result)
        
        return {
            "predictions": results,
            "count": len(results),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch recent predictions: {str(e)}"
        )


# ============ Admin Endpoints ============

@router.post("/store-prediction")
async def store_ai_prediction(
    fixture_id: int,
    gameweek: Optional[int] = None,
    session: Session = Depends(get_session),
    pl_session: Session = Depends(get_pl_session),
) -> Dict[str, Any]:
    """
    Generate and store an AI prediction for a fixture.
    This should be called before matches to record predictions.
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
        
        # Check if prediction already exists
        existing = session.exec(
            select(AIPrediction).where(AIPrediction.fixture_id == fixture_id)
        ).first()
        
        if existing:
            return {
                "message": "Prediction already exists for this fixture",
                "prediction_id": str(existing.id),
                "existing": True,
            }
        
        # Get teams
        bootstrap = await fpl_service.get_bootstrap_static()
        teams_map = {team['id']: team for team in bootstrap.get('teams', [])}
        
        home_fpl_id = fpl_fixture.get('team_h')
        away_fpl_id = fpl_fixture.get('team_a')
        home_team_info = teams_map.get(home_fpl_id, {})
        away_team_info = teams_map.get(away_fpl_id, {})
        
        # Get database teams
        home_team = pl_session.exec(
            select(Team).where(Team.fbref_id == f"fpl_{home_fpl_id}")
        ).first()
        away_team = pl_session.exec(
            select(Team).where(Team.fbref_id == f"fpl_{away_fpl_id}")
        ).first()
        
        if not home_team or not away_team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teams not found in database"
            )
        
        # Get fixture date and season
        kickoff_time = fpl_fixture.get('kickoff_time')
        if kickoff_time:
            fixture_date = datetime.fromisoformat(kickoff_time.replace('Z', '+00:00')).date()
        else:
            fixture_date = datetime.now().date()
        
        if fixture_date.month >= 8:
            season = f"{fixture_date.year}-{fixture_date.year + 1}"
        else:
            season = f"{fixture_date.year - 1}-{fixture_date.year}"
        
        # Generate prediction
        prediction_service = PredictionService(pl_session)
        prediction = await prediction_service.predict_match_score(
            str(home_team.id),
            str(away_team.id),
            season,
            fixture_date
        )
        
        # Store prediction
        ai_pred = AIPrediction(
            fixture_id=fixture_id,
            home_team_id=home_fpl_id,
            away_team_id=away_fpl_id,
            home_team_name=home_team_info.get('name'),
            away_team_name=away_team_info.get('name'),
            predicted_home_score=prediction['predictedHomeScore'],
            predicted_away_score=prediction['predictedAwayScore'],
            home_win_probability=prediction['homeWinProbability'],
            draw_probability=prediction['drawProbability'],
            away_win_probability=prediction['awayWinProbability'],
            confidence=prediction['confidence'],
            home_xg=prediction['expectedGoals']['home'],
            away_xg=prediction['expectedGoals']['away'],
            home_elo=prediction['eloRatings']['home'],
            away_elo=prediction['eloRatings']['away'],
            home_availability=prediction['availability']['home'] / 100,
            away_availability=prediction['availability']['away'] / 100,
            model_inputs={
                'key_factors': prediction.get('keyFactors', []),
                'alternative_scores': prediction.get('alternativeScores', []),
            },
            match_date=fixture_date,
            gameweek=gameweek or fpl_fixture.get('event'),
            season=season,
            model_version="v1.0",
        )
        
        session.add(ai_pred)
        session.commit()
        session.refresh(ai_pred)
        
        return {
            "message": "Prediction stored successfully",
            "prediction_id": str(ai_pred.id),
            "prediction": {
                "predicted_score": f"{ai_pred.predicted_home_score}-{ai_pred.predicted_away_score}",
                "confidence": ai_pred.confidence,
                "home_win_prob": ai_pred.home_win_probability,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store prediction: {str(e)}"
        )


@router.post("/update-results")
async def update_prediction_results(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Update predictions with actual results from finished matches.
    Admin only - typically called by a scheduled job.
    """
    try:
        # Get predictions without results
        pending_predictions = session.exec(
            select(AIPrediction).where(AIPrediction.actual_home_score.is_(None))
        ).all()
        
        if not pending_predictions:
            return {
                "message": "No pending predictions to update",
                "updated": 0,
            }
        
        # Get fixtures from FPL API
        fpl_fixtures = await fpl_service.get_fixtures()
        fixtures_map = {f['id']: f for f in fpl_fixtures}
        
        updated_count = 0
        for pred in pending_predictions:
            fixture = fixtures_map.get(pred.fixture_id)
            if not fixture or not fixture.get('finished'):
                continue
            
            actual_home = fixture.get('team_h_score')
            actual_away = fixture.get('team_a_score')
            
            if actual_home is not None and actual_away is not None:
                pred.actual_home_score = actual_home
                pred.actual_away_score = actual_away
                pred.calculate_accuracy()
                session.add(pred)
                updated_count += 1
        
        session.commit()
        
        return {
            "message": f"Updated {updated_count} predictions with results",
            "updated": updated_count,
            "pending_remaining": len(pending_predictions) - updated_count,
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update results: {str(e)}"
        )


@router.post("/store-gameweek-predictions")
async def store_gameweek_predictions(
    gameweek: int = Query(..., description="Gameweek to store predictions for"),
    session: Session = Depends(get_session),
    pl_session: Session = Depends(get_pl_session),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Store AI predictions for all fixtures in a gameweek.
    Admin only - call this before the gameweek starts.
    """
    try:
        # Get fixtures for gameweek
        fpl_fixtures = await fpl_service.get_gameweek_fixtures(gameweek)
        
        if not fpl_fixtures:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No fixtures found for gameweek {gameweek}"
            )
        
        bootstrap = await fpl_service.get_bootstrap_static()
        teams_map = {team['id']: team for team in bootstrap.get('teams', [])}
        
        stored = 0
        skipped = 0
        errors = []
        
        prediction_service = PredictionService(pl_session)
        
        for fpl_fixture in fpl_fixtures:
            fixture_id = fpl_fixture.get('id')
            
            try:
                # Check if already stored
                existing = session.exec(
                    select(AIPrediction).where(AIPrediction.fixture_id == fixture_id)
                ).first()
                
                if existing:
                    skipped += 1
                    continue
                
                # Get teams
                home_fpl_id = fpl_fixture.get('team_h')
                away_fpl_id = fpl_fixture.get('team_a')
                home_team_info = teams_map.get(home_fpl_id, {})
                away_team_info = teams_map.get(away_fpl_id, {})
                
                # Get database teams
                home_team = pl_session.exec(
                    select(Team).where(Team.fbref_id == f"fpl_{home_fpl_id}")
                ).first()
                away_team = pl_session.exec(
                    select(Team).where(Team.fbref_id == f"fpl_{away_fpl_id}")
                ).first()
                
                if not home_team or not away_team:
                    errors.append(f"Fixture {fixture_id}: Teams not found in database")
                    continue
                
                # Get fixture date and season
                kickoff_time = fpl_fixture.get('kickoff_time')
                if kickoff_time:
                    fixture_date = datetime.fromisoformat(kickoff_time.replace('Z', '+00:00')).date()
                else:
                    fixture_date = datetime.now().date()
                
                if fixture_date.month >= 8:
                    season = f"{fixture_date.year}-{fixture_date.year + 1}"
                else:
                    season = f"{fixture_date.year - 1}-{fixture_date.year}"
                
                # Generate prediction
                prediction = await prediction_service.predict_match_score(
                    str(home_team.id),
                    str(away_team.id),
                    season,
                    fixture_date
                )
                
                # Store prediction
                ai_pred = AIPrediction(
                    fixture_id=fixture_id,
                    home_team_id=home_fpl_id,
                    away_team_id=away_fpl_id,
                    home_team_name=home_team_info.get('name'),
                    away_team_name=away_team_info.get('name'),
                    predicted_home_score=prediction['predictedHomeScore'],
                    predicted_away_score=prediction['predictedAwayScore'],
                    home_win_probability=prediction['homeWinProbability'],
                    draw_probability=prediction['drawProbability'],
                    away_win_probability=prediction['awayWinProbability'],
                    confidence=prediction['confidence'],
                    home_xg=prediction['expectedGoals']['home'],
                    away_xg=prediction['expectedGoals']['away'],
                    home_elo=prediction['eloRatings']['home'],
                    away_elo=prediction['eloRatings']['away'],
                    home_availability=prediction['availability']['home'] / 100,
                    away_availability=prediction['availability']['away'] / 100,
                    model_inputs={
                        'key_factors': prediction.get('keyFactors', []),
                        'alternative_scores': prediction.get('alternativeScores', []),
                    },
                    match_date=fixture_date,
                    gameweek=gameweek,
                    season=season,
                    model_version="v1.0",
                )
                
                session.add(ai_pred)
                stored += 1
                
            except Exception as e:
                errors.append(f"Fixture {fixture_id}: {str(e)}")
        
        session.commit()
        
        return {
            "message": f"Stored {stored} predictions for gameweek {gameweek}",
            "stored": stored,
            "skipped": skipped,
            "errors": errors if errors else None,
            "total_fixtures": len(fpl_fixtures),
        }
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store gameweek predictions: {str(e)}"
        )


@router.get("/factor-analysis")
async def get_factor_analysis(
    season: Optional[str] = Query(None, description="Filter by season"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user),
) -> Dict[str, Any]:
    """
    Analyze which factors correlate with prediction accuracy.
    Admin only - provides insights for model improvement.
    """
    try:
        query = select(AIPrediction).where(AIPrediction.actual_home_score.isnot(None))
        
        if season:
            query = query.where(AIPrediction.season == season)
        
        predictions = session.exec(query).all()
        
        if not predictions:
            return {
                "message": "No predictions with results found",
                "analysis": None,
            }
        
        # Analyze Elo gap correlation
        elo_analysis = {
            "large_gap": {"total": 0, "correct": 0},  # > 100 Elo diff
            "medium_gap": {"total": 0, "correct": 0},  # 50-100 Elo diff
            "close_match": {"total": 0, "correct": 0},  # < 50 Elo diff
        }
        
        # Analyze confidence correlation
        conf_analysis = {
            "high": {"total": 0, "correct": 0},
            "medium": {"total": 0, "correct": 0},
            "low": {"total": 0, "correct": 0},
        }
        
        # Analyze xG accuracy
        xg_analysis = {
            "total_predictions": 0,
            "avg_xg_diff_correct": [],
            "avg_xg_diff_wrong": [],
        }
        
        for pred in predictions:
            xg_analysis["total_predictions"] += 1
            
            # Elo analysis
            if pred.home_elo and pred.away_elo:
                elo_diff = abs(pred.home_elo - pred.away_elo)
                if elo_diff > 100:
                    bucket = "large_gap"
                elif elo_diff >= 50:
                    bucket = "medium_gap"
                else:
                    bucket = "close_match"
                
                elo_analysis[bucket]["total"] += 1
                if pred.is_outcome_correct:
                    elo_analysis[bucket]["correct"] += 1
            
            # Confidence analysis
            conf = pred.confidence or 0
            if conf >= 80:
                bucket = "high"
            elif conf >= 60:
                bucket = "medium"
            else:
                bucket = "low"
            
            conf_analysis[bucket]["total"] += 1
            if pred.is_outcome_correct:
                conf_analysis[bucket]["correct"] += 1
            
            # xG accuracy
            if pred.home_xg and pred.away_xg:
                predicted_goals = pred.home_xg + pred.away_xg
                actual_goals = (pred.actual_home_score or 0) + (pred.actual_away_score or 0)
                xg_diff = abs(predicted_goals - actual_goals)
                
                if pred.is_outcome_correct:
                    xg_analysis["avg_xg_diff_correct"].append(xg_diff)
                else:
                    xg_analysis["avg_xg_diff_wrong"].append(xg_diff)
        
        # Calculate percentages
        for bucket in elo_analysis.values():
            if bucket["total"] > 0:
                bucket["accuracy"] = round(bucket["correct"] / bucket["total"] * 100, 2)
        
        for bucket in conf_analysis.values():
            if bucket["total"] > 0:
                bucket["accuracy"] = round(bucket["correct"] / bucket["total"] * 100, 2)
        
        # Calculate xG averages
        xg_analysis["avg_xg_diff_correct"] = round(
            sum(xg_analysis["avg_xg_diff_correct"]) / len(xg_analysis["avg_xg_diff_correct"]), 2
        ) if xg_analysis["avg_xg_diff_correct"] else None
        
        xg_analysis["avg_xg_diff_wrong"] = round(
            sum(xg_analysis["avg_xg_diff_wrong"]) / len(xg_analysis["avg_xg_diff_wrong"]), 2
        ) if xg_analysis["avg_xg_diff_wrong"] else None
        
        return {
            "season": season or "all",
            "total_analyzed": len(predictions),
            "elo_gap_analysis": elo_analysis,
            "confidence_analysis": conf_analysis,
            "xg_analysis": xg_analysis,
            "insights": [
                f"Elo gap correlates with prediction accuracy: large gaps have {elo_analysis['large_gap'].get('accuracy', 'N/A')}% accuracy",
                f"High confidence predictions: {conf_analysis['high'].get('accuracy', 'N/A')}% accurate",
                f"When predictions are correct, xG is off by {xg_analysis['avg_xg_diff_correct'] or 'N/A'} goals on average",
            ],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze factors: {str(e)}"
        )
