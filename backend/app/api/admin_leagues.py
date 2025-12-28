"""
Admin API endpoints for league management
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
    WeeklyPicksLeague,
    WeeklyPicksLeagueMember,
)

router = APIRouter(prefix="/admin/leagues", tags=["Admin - Leagues"])


@router.get("")
async def list_leagues(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    type: Optional[str] = None,
    created_by: Optional[int] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """List leagues with pagination and filters"""
    query = select(WeeklyPicksLeague)
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.where(
            (WeeklyPicksLeague.name.ilike(search_term)) |
            (WeeklyPicksLeague.code.ilike(search_term))
        )
    
    if type:
        query = query.where(WeeklyPicksLeague.type == type)
    
    if created_by:
        query = query.where(WeeklyPicksLeague.created_by == created_by)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(WeeklyPicksLeague.created_at.desc()).offset(offset).limit(page_size)
    
    leagues = session.exec(query).all()
    
    # Get creator and member count for each league
    leagues_with_info = []
    for league in leagues:
        creator = session.get(User, league.created_by)
        member_count = session.exec(
            select(func.count(WeeklyPicksLeagueMember.id)).where(
                WeeklyPicksLeagueMember.league_id == league.id
            )
        ).one()
        
        leagues_with_info.append({
            "id": league.id,
            "name": league.name,
            "description": league.description,
            "code": league.code,
            "type": league.type,
            "created_by": league.created_by,
            "creator_username": creator.username if creator else "Unknown",
            "creator_email": creator.email if creator else "Unknown",
            "member_count": member_count,
            "created_at": league.created_at.isoformat(),
            "updated_at": league.updated_at.isoformat(),
        })
    
    return {
        "items": leagues_with_info,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/{league_id}")
async def get_league(
    league_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Get league details with all members"""
    league = session.get(WeeklyPicksLeague, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    # Get creator
    creator = session.get(User, league.created_by)
    
    # Get all members
    members = session.exec(
        select(WeeklyPicksLeagueMember).where(
            WeeklyPicksLeagueMember.league_id == league_id
        )
    ).all()
    
    # Get user info for each member
    members_with_info = []
    for member in members:
        user = session.get(User, member.user_id)
        members_with_info.append({
            "id": member.id,
            "user_id": member.user_id,
            "username": user.username if user else "Unknown",
            "email": user.email if user else "Unknown",
            "joined_at": member.joined_at.isoformat(),
        })
    
    return {
        "id": league.id,
        "name": league.name,
        "description": league.description,
        "code": league.code,
        "type": league.type,
        "created_by": league.created_by,
        "creator_username": creator.username if creator else "Unknown",
        "creator_email": creator.email if creator else "Unknown",
        "created_at": league.created_at.isoformat(),
        "updated_at": league.updated_at.isoformat(),
        "members": members_with_info,
        "member_count": len(members_with_info),
    }


@router.put("/{league_id}")
async def update_league(
    league_id: int,
    update_data: dict,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Update league information"""
    league = session.get(WeeklyPicksLeague, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    changes = {}
    if "name" in update_data:
        changes["name"] = {"old": league.name, "new": update_data["name"]}
        league.name = update_data["name"]
    if "description" in update_data:
        changes["description"] = {"old": league.description, "new": update_data.get("description")}
        league.description = update_data.get("description")
    if "type" in update_data:
        if update_data["type"] not in ["weekly", "seasonal", "both"]:
            raise HTTPException(status_code=400, detail="Type must be 'weekly', 'seasonal', or 'both'")
        changes["type"] = {"old": league.type, "new": update_data["type"]}
        league.type = update_data["type"]
    
    league.updated_at = datetime.utcnow()
    session.add(league)
    session.commit()
    session.refresh(league)
    
    # Log audit
    if changes:
        await create_audit_log(
            session=session,
            admin_user=current_user,
            action="league.update",
            resource_type="league",
            resource_id=league_id,
            details=changes,
            request=request,
        )
    
    return {
        "message": "League updated successfully",
        "league_id": league.id,
        "league": {
            "id": league.id,
            "name": league.name,
            "description": league.description,
            "type": league.type,
        }
    }


@router.delete("/{league_id}")
async def delete_league(
    league_id: int,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a league and all memberships"""
    league = session.get(WeeklyPicksLeague, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    league_name = league.name
    member_count = session.exec(
        select(func.count(WeeklyPicksLeagueMember.id)).where(
            WeeklyPicksLeagueMember.league_id == league_id
        )
    ).one()
    
    # Delete all memberships
    members = session.exec(
        select(WeeklyPicksLeagueMember).where(
            WeeklyPicksLeagueMember.league_id == league_id
        )
    ).all()
    for member in members:
        session.delete(member)
    
    # Delete the league
    session.delete(league)
    session.commit()
    
    # Log audit
    await create_audit_log(
        session=session,
        admin_user=current_user,
        action="league.delete",
        resource_type="league",
        resource_id=league_id,
        details={"name": league_name, "member_count": member_count},
        request=request,
    )
    
    return {"message": "League deleted successfully"}


@router.post("/{league_id}/members/{user_id}")
async def add_member(
    league_id: int,
    user_id: int,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Add a user to a league"""
    league = session.get(WeeklyPicksLeague, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already a member
    existing = session.exec(
        select(WeeklyPicksLeagueMember).where(
            WeeklyPicksLeagueMember.league_id == league_id,
            WeeklyPicksLeagueMember.user_id == user_id
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member of this league")
    
    # Add member
    member = WeeklyPicksLeagueMember(
        league_id=league_id,
        user_id=user_id,
    )
    session.add(member)
    session.commit()
    session.refresh(member)
    
    # Log audit
    await create_audit_log(
        session=session,
        admin_user=current_user,
        action="league.add_member",
        resource_type="league",
        resource_id=league_id,
        details={"league_name": league.name, "user_id": user_id, "username": user.username},
        request=request,
    )
    
    return {
        "message": "Member added successfully",
        "member_id": member.id,
        "user_id": user_id,
        "username": user.username,
    }


@router.delete("/{league_id}/members/{user_id}")
async def remove_member(
    league_id: int,
    user_id: int,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Remove a user from a league"""
    league = session.get(WeeklyPicksLeague, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    user = session.get(User, user_id)
    
    member = session.exec(
        select(WeeklyPicksLeagueMember).where(
            WeeklyPicksLeagueMember.league_id == league_id,
            WeeklyPicksLeagueMember.user_id == user_id
        )
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="User is not a member of this league")
    
    session.delete(member)
    session.commit()
    
    # Log audit
    await create_audit_log(
        session=session,
        admin_user=current_user,
        action="league.remove_member",
        resource_type="league",
        resource_id=league_id,
        details={"league_name": league.name, "user_id": user_id, "username": user.username if user else "Unknown"},
        request=request,
    )
    
    return {"message": "Member removed successfully"}

