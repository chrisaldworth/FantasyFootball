"""
Admin API endpoints for analytics
"""
from typing import Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, func
from app.core.database import get_session
from app.core.security import get_current_admin_user
from app.models.user import User

router = APIRouter(prefix="/admin/analytics", tags=["Admin - Analytics"])


@router.get("/overview")
async def get_overview(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Get overview metrics"""
    # Total users
    total_users = session.exec(select(func.count(User.id))).one()
    
    # Active users
    active_users = session.exec(
        select(func.count(User.id)).where(User.is_active == True)
    ).one()
    
    # New users today
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    new_users_today = session.exec(
        select(func.count(User.id)).where(User.created_at >= today)
    ).one()
    
    # Premium users
    premium_users = session.exec(
        select(func.count(User.id)).where(User.is_premium == True)
    ).one()
    
    # Users by role
    admin_users = session.exec(
        select(func.count(User.id)).where(User.role.in_(["admin", "super_admin"]))
    ).one()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "new_users_today": new_users_today,
        "premium_users": premium_users,
        "admin_users": admin_users,
        "inactive_users": total_users - active_users
    }


@router.get("/users")
async def get_user_analytics(
    days: int = Query(30, ge=1, le=365),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Get user analytics over time"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Users created per day
    users_per_day = session.exec(
        select(
            func.date(User.created_at).label("date"),
            func.count(User.id).label("count")
        )
        .where(User.created_at >= start_date)
        .group_by(func.date(User.created_at))
        .order_by(func.date(User.created_at))
    ).all()
    
    # Convert to list of dicts
    user_growth = [
        {"date": str(row.date), "count": row.count}
        for row in users_per_day
    ]
    
    return {
        "period_days": days,
        "user_growth": user_growth
    }


@router.get("/engagement")
async def get_engagement_analytics(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Get engagement metrics"""
    # Users with FPL linked
    fpl_linked = session.exec(
        select(func.count(User.id)).where(User.fpl_team_id.isnot(None))
    ).one()
    
    # Users with favorite team
    favorite_team_set = session.exec(
        select(func.count(User.id)).where(User.favorite_team_id.isnot(None))
    ).one()
    
    total_users = session.exec(select(func.count(User.id))).one()
    
    return {
        "fpl_linked_users": fpl_linked,
        "fpl_linked_percentage": (fpl_linked / total_users * 100) if total_users > 0 else 0,
        "favorite_team_set": favorite_team_set,
        "favorite_team_percentage": (favorite_team_set / total_users * 100) if total_users > 0 else 0,
        "total_users": total_users
    }


@router.get("/system-health")
async def get_system_health(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Get system health metrics"""
    # Test database connection
    try:
        session.exec(select(func.count(User.id)))
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "database": {
            "status": db_status,
            "timestamp": datetime.utcnow().isoformat()
        },
        "api": {
            "status": "online",
            "timestamp": datetime.utcnow().isoformat()
        }
    }

