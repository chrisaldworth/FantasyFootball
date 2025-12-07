from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional

from app.core.security import get_current_user
from app.models.user import User
from app.services.fpl_service import fpl_service

router = APIRouter(prefix="/fpl", tags=["FPL Data"])


@router.get("/bootstrap")
async def get_bootstrap_data():
    """
    Get all static FPL data (players, teams, gameweeks).
    This endpoint is public and cached.
    """
    try:
        data = await fpl_service.get_bootstrap_static()
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch FPL data: {str(e)}"
        )


@router.get("/fixtures")
async def get_fixtures(gameweek: Optional[int] = None):
    """Get fixtures, optionally filtered by gameweek"""
    try:
        if gameweek:
            data = await fpl_service.get_gameweek_fixtures(gameweek)
        else:
            data = await fpl_service.get_fixtures()
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch fixtures: {str(e)}"
        )


@router.get("/live/{gameweek}")
async def get_live_gameweek(gameweek: int):
    """Get live scores for a gameweek"""
    try:
        data = await fpl_service.get_live_gameweek(gameweek)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch live data: {str(e)}"
        )


@router.get("/player/{player_id}")
async def get_player_details(player_id: int):
    """Get detailed player information"""
    try:
        data = await fpl_service.get_player_summary(player_id)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch player data: {str(e)}"
        )


@router.get("/team/{team_id}")
async def get_team_info(team_id: int):
    """Get public FPL team information"""
    try:
        data = await fpl_service.get_user_team(team_id)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch team data: {str(e)}"
        )


@router.get("/team/{team_id}/picks/{gameweek}")
async def get_team_picks(team_id: int, gameweek: int):
    """Get a team's picks for a specific gameweek"""
    try:
        data = await fpl_service.get_user_picks(team_id, gameweek)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch picks: {str(e)}"
        )


@router.get("/team/{team_id}/history")
async def get_team_history(team_id: int):
    """Get a team's history"""
    try:
        data = await fpl_service.get_user_history(team_id)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch history: {str(e)}"
        )


@router.get("/team/{team_id}/transfers")
async def get_team_transfers(team_id: int):
    """Get a team's transfer history"""
    try:
        data = await fpl_service.get_user_transfers(team_id)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch transfers: {str(e)}"
        )


@router.get("/league/{league_id}")
async def get_league_standings(league_id: int, page: int = 1):
    """Get classic league standings"""
    try:
        data = await fpl_service.get_classic_league(league_id, page)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch league data: {str(e)}"
        )


# Authenticated endpoints - require login

@router.get("/my-team")
async def get_my_team(current_user: User = Depends(get_current_user)):
    """Get the current user's FPL team info"""
    if not current_user.fpl_team_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No FPL team ID linked to your account"
        )
    
    try:
        data = await fpl_service.get_user_team(current_user.fpl_team_id)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch your team: {str(e)}"
        )


@router.get("/my-team/picks/{gameweek}")
async def get_my_picks(gameweek: int, current_user: User = Depends(get_current_user)):
    """Get the current user's picks for a gameweek"""
    if not current_user.fpl_team_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No FPL team ID linked to your account"
        )
    
    try:
        data = await fpl_service.get_user_picks(current_user.fpl_team_id, gameweek)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch your picks: {str(e)}"
        )


@router.get("/my-team/history")
async def get_my_history(current_user: User = Depends(get_current_user)):
    """Get the current user's FPL history"""
    if not current_user.fpl_team_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No FPL team ID linked to your account"
        )
    
    try:
        data = await fpl_service.get_user_history(current_user.fpl_team_id)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch your history: {str(e)}"
        )

