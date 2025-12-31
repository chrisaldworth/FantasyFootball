from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlmodel import Session, select, func
from datetime import datetime

from app.core.security import get_current_user
from app.core.database import get_session
from app.models.user import User
from app.models.followed_player import FollowedPlayer, FollowedPlayerCreate, FollowedPlayerRead
from app.services.fpl_service import fpl_service

router = APIRouter(prefix="/fpl/followed-players", tags=["Followed Players"])

# Maximum number of players a user can follow
MAX_FOLLOWED_PLAYERS = 20


@router.post("", response_model=FollowedPlayerRead, status_code=status.HTTP_201_CREATED)
async def follow_player(
    request: FollowedPlayerCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Follow a player"""
    # Check if already following
    existing = session.exec(
        select(FollowedPlayer).where(
            FollowedPlayer.user_id == current_user.id,
            FollowedPlayer.player_id == request.player_id
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Player is already being followed"
        )
    
    # Check follow limit (optimized with count query)
    count_result = session.exec(
        select(func.count(FollowedPlayer.id)).where(FollowedPlayer.user_id == current_user.id)
    ).one()
    
    if count_result >= MAX_FOLLOWED_PLAYERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum of {MAX_FOLLOWED_PLAYERS} players can be followed"
        )
    
    # Verify player exists in FPL (optional - can be removed if not needed)
    try:
        bootstrap = await fpl_service.get_bootstrap_static()
        player_exists = any(p.get('id') == request.player_id for p in bootstrap.get('elements', []))
        if not player_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Player not found"
            )
    except Exception as e:
        # If FPL API fails, still allow following (player might exist)
        print(f"Warning: Could not verify player existence: {e}")
    
    # Create followed player record
    followed_player = FollowedPlayer(
        user_id=current_user.id,
        player_id=request.player_id,
        created_at=datetime.utcnow()
    )
    
    session.add(followed_player)
    session.commit()
    session.refresh(followed_player)
    
    return followed_player


@router.delete("/{player_id}", status_code=status.HTTP_200_OK)
async def unfollow_player(
    player_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Unfollow a player"""
    followed_player = session.exec(
        select(FollowedPlayer).where(
            FollowedPlayer.user_id == current_user.id,
            FollowedPlayer.player_id == player_id
        )
    ).first()
    
    if not followed_player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player is not being followed"
        )
    
    session.delete(followed_player)
    session.commit()
    
    return {"success": True, "message": "Player unfollowed successfully"}


@router.get("", response_model=List[FollowedPlayerRead])
async def get_followed_players(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all followed players for the current user"""
    followed_players = session.exec(
        select(FollowedPlayer)
        .where(FollowedPlayer.user_id == current_user.id)
        .order_by(FollowedPlayer.created_at.desc())
    ).all()
    
    return followed_players


@router.get("/stats")
async def get_followed_players_with_stats(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get followed players with their FPL stats"""
    # Get followed player IDs
    followed_players = session.exec(
        select(FollowedPlayer)
        .where(FollowedPlayer.user_id == current_user.id)
        .order_by(FollowedPlayer.created_at.desc())
    ).all()
    
    if not followed_players:
        return []
    
    # Get FPL bootstrap data
    try:
        bootstrap = await fpl_service.get_bootstrap_static()
        players = bootstrap.get('elements', [])
        teams = bootstrap.get('teams', [])
        
        # Map followed players with their stats
        result = []
        for fp in followed_players:
            player = next((p for p in players if p.get('id') == fp.player_id), None)
            if player:
                team = next((t for t in teams if t.get('id') == player.get('team')), None)
                result.append({
                    "followed_player_id": fp.id,
                    "player_id": fp.player_id,
                    "followed_at": fp.created_at.isoformat(),
                    "player": {
                        "id": player.get('id'),
                        "web_name": player.get('web_name'),
                        "first_name": player.get('first_name'),
                        "second_name": player.get('second_name'),
                        "photo": player.get('photo'),
                        "team": player.get('team'),
                        "team_name": team.get('name') if team else None,
                        "team_short_name": team.get('short_name') if team else None,
                        "element_type": player.get('element_type'),
                        "position": {1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD'}.get(player.get('element_type')),
                        "now_cost": player.get('now_cost'),
                        "price": player.get('now_cost', 0) / 10,
                        "form": float(player.get('form', 0)) if player.get('form') else 0,
                        "total_points": player.get('total_points', 0),
                        "selected_by_percent": player.get('selected_by_percent', '0'),
                        "goals_scored": player.get('goals_scored', 0),
                        "assists": player.get('assists', 0),
                        "clean_sheets": player.get('clean_sheets', 0),
                        "minutes": player.get('minutes', 0),
                        "starts": player.get('starts', 0),
                    }
                })
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch player stats: {str(e)}"
        )


@router.get("/player/{player_id}/follow-status")
async def check_follow_status(
    player_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Check if a player is being followed by the current user"""
    followed_player = session.exec(
        select(FollowedPlayer).where(
            FollowedPlayer.user_id == current_user.id,
            FollowedPlayer.player_id == player_id
        )
    ).first()
    
    return {
        "is_followed": followed_player is not None,
        "followed_at": followed_player.created_at.isoformat() if followed_player else None
    }
