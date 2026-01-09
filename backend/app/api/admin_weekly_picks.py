"""
Admin API endpoints for weekly picks management
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlmodel import Session, select, func
from app.core.database import get_session
from app.core.security import get_current_admin_user
from app.core.audit import create_audit_log
from app.models.user import User
from app.models.weekly_picks import (
    WeeklyPick,
    ScorePrediction,
    PlayerPick,
)

router = APIRouter(prefix="/admin/weekly-picks", tags=["Admin - Weekly Picks"])


@router.get("")
async def list_weekly_picks(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    gameweek: Optional[int] = None,
    user_id: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    min_points: Optional[int] = None,
    max_points: Optional[int] = None,
    flagged: Optional[bool] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """List weekly picks with pagination and filters"""
    query = select(WeeklyPick)
    
    # Apply filters
    if gameweek:
        query = query.where(WeeklyPick.gameweek == gameweek)
    
    if user_id:
        query = query.where(WeeklyPick.user_id == user_id)
    
    # Note: flagged column was removed from model - skip filtering
    # if flagged is not None:
    #     query = query.where(WeeklyPick.flagged == flagged)
    
    if date_from:
        try:
            date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
            query = query.where(WeeklyPick.created_at >= date_from_obj)
        except ValueError:
            pass
    
    if date_to:
        try:
            date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
            query = query.where(WeeklyPick.created_at <= date_to_obj)
        except ValueError:
            pass
    
    if min_points is not None:
        query = query.where(WeeklyPick.total_points >= min_points)
    
    if max_points is not None:
        query = query.where(WeeklyPick.total_points <= max_points)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(WeeklyPick.created_at.desc()).offset(offset).limit(page_size)
    
    picks = session.exec(query).all()
    
    # Get user info for each pick
    from app.models.user import User
    picks_with_users = []
    for pick in picks:
        user = session.get(User, pick.user_id)
        picks_with_users.append({
            "id": pick.id,
            "user_id": pick.user_id,
            "username": user.username if user else "Unknown",
            "email": user.email if user else "Unknown",
            "gameweek": pick.gameweek,
            "total_points": pick.total_points,
            "rank": pick.rank,
            "flagged": getattr(pick, 'flagged', False),  # Column may not exist in DB
            "created_at": pick.created_at.isoformat(),
            "updated_at": pick.updated_at.isoformat(),
        })
    
    return {
        "items": picks_with_users,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/{pick_id}")
async def get_weekly_pick(
    pick_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Get weekly pick details with all predictions and picks"""
    pick = session.get(WeeklyPick, pick_id)
    if not pick:
        raise HTTPException(status_code=404, detail="Weekly pick not found")
    
    # Get user info
    user = session.get(User, pick.user_id)
    
    # Get score predictions
    score_predictions = session.exec(
        select(ScorePrediction).where(ScorePrediction.weekly_pick_id == pick_id)
    ).all()
    
    # Get player picks
    player_picks = session.exec(
        select(PlayerPick).where(PlayerPick.weekly_pick_id == pick_id)
    ).all()
    
    return {
        "id": pick.id,
        "user_id": pick.user_id,
        "username": user.username if user else "Unknown",
        "email": user.email if user else "Unknown",
        "gameweek": pick.gameweek,
        "total_points": pick.total_points,
        "rank": pick.rank,
        "flagged": getattr(pick, 'flagged', False),  # Column may not exist in DB
        "created_at": pick.created_at.isoformat(),
        "updated_at": pick.updated_at.isoformat(),
        "score_predictions": [
            {
                "id": sp.id,
                "fixture_id": sp.fixture_id,
                "home_team_id": sp.home_team_id,
                "away_team_id": sp.away_team_id,
                "predicted_home_score": sp.predicted_home_score,
                "predicted_away_score": sp.predicted_away_score,
                "actual_home_score": sp.actual_home_score,
                "actual_away_score": sp.actual_away_score,
                "points": sp.points,
                "breakdown": sp.breakdown,
            }
            for sp in score_predictions
        ],
        "player_picks": [
            {
                "id": pp.id,
                "player_id": pp.player_id,
                "fixture_id": pp.fixture_id,
                "fpl_points": pp.fpl_points,
                "points": pp.points,
            }
            for pp in player_picks
        ],
    }


@router.put("/{pick_id}/points")
async def adjust_points(
    pick_id: int,
    adjustment_data: dict,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Manually adjust points for a weekly pick"""
    pick = session.get(WeeklyPick, pick_id)
    if not pick:
        raise HTTPException(status_code=404, detail="Weekly pick not found")
    
    old_points = pick.total_points
    new_points = adjustment_data.get("total_points")
    if new_points is None:
        raise HTTPException(status_code=400, detail="total_points is required")
    
    if not isinstance(new_points, int):
        raise HTTPException(status_code=400, detail="total_points must be an integer")
    
    pick.total_points = new_points
    pick.updated_at = datetime.utcnow()
    session.add(pick)
    session.commit()
    session.refresh(pick)
    
    # Log audit
    await create_audit_log(
        session=session,
        admin_user=current_user,
        action="weekly_pick.adjust_points",
        resource_type="weekly_pick",
        resource_id=pick_id,
        details={"old_points": old_points, "new_points": new_points, "user_id": pick.user_id},
        request=request,
    )
    
    return {
        "message": "Points adjusted successfully",
        "pick_id": pick.id,
        "new_total_points": pick.total_points
    }


@router.delete("/{pick_id}")
async def delete_weekly_pick(
    pick_id: int,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a weekly pick and all associated data"""
    pick = session.get(WeeklyPick, pick_id)
    if not pick:
        raise HTTPException(status_code=404, detail="Weekly pick not found")
    
    user_id = pick.user_id
    gameweek = pick.gameweek
    
    # Delete associated score predictions
    score_predictions = session.exec(
        select(ScorePrediction).where(ScorePrediction.weekly_pick_id == pick_id)
    ).all()
    for sp in score_predictions:
        session.delete(sp)
    
    # Delete associated player picks
    player_picks = session.exec(
        select(PlayerPick).where(PlayerPick.weekly_pick_id == pick_id)
    ).all()
    for pp in player_picks:
        session.delete(pp)
    
    # Delete the pick itself
    session.delete(pick)
    session.commit()
    
    # Log audit
    await create_audit_log(
        session=session,
        admin_user=current_user,
        action="weekly_pick.delete",
        resource_type="weekly_pick",
        resource_id=pick_id,
        details={"user_id": user_id, "gameweek": gameweek},
        request=request,
    )
    
    return {"message": "Weekly pick deleted successfully"}


@router.put("/{pick_id}/flag")
async def flag_weekly_pick(
    pick_id: int,
    flag_data: dict,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Flag or unflag a weekly pick for review
    
    Note: This endpoint is currently disabled because the 'flagged' column
    does not exist in the production database. Add the column with a migration
    before enabling this feature.
    """
    raise HTTPException(
        status_code=501,  # Not Implemented
        detail="Flag feature is temporarily disabled. The 'flagged' column needs to be added to the database."
    )
    
    # Original implementation (commented out until DB migration):
    # pick = session.get(WeeklyPick, pick_id)
    # if not pick:
    #     raise HTTPException(status_code=404, detail="Weekly pick not found")
    # 
    # old_flagged = getattr(pick, 'flagged', False)
    # is_flagged = flag_data.get("flagged", True)
    # 
    # pick.flagged = is_flagged
    # pick.updated_at = datetime.utcnow()
    # session.add(pick)
    # session.commit()
    # session.refresh(pick)
    # 
    # # Log audit
    # await create_audit_log(
    #     session=session,
    #     admin_user=current_user,
    #     action=f"weekly_pick.{'flag' if is_flagged else 'unflag'}",
    #     resource_type="weekly_pick",
    #     resource_id=pick_id,
    #     details={"user_id": pick.user_id, "gameweek": pick.gameweek, "old_flagged": old_flagged, "new_flagged": is_flagged},
    #     request=request,
    # )
    # 
    # return {
    #     "message": f"Weekly pick {'flagged' if is_flagged else 'unflagged'} successfully",
    #     "pick_id": pick_id,
    #     "flagged": getattr(pick, 'flagged', False)
    # }

