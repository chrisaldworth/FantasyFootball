"""
FPL Account Management API - Link FPL accounts and make team changes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.services.fpl_auth_service import fpl_auth_service

router = APIRouter(prefix="/fpl-account", tags=["FPL Account"])


class LinkAccountRequest(BaseModel):
    email: str
    password: str


class LinkAccountResponse(BaseModel):
    success: bool
    team_id: Optional[int] = None
    team_name: Optional[str] = None
    error: Optional[str] = None


class SaveTeamRequest(BaseModel):
    picks: List[Dict[str, Any]]
    chip: Optional[str] = None  # 'bboost', '3xc', 'freehit', 'wildcard'


class TransferRequest(BaseModel):
    transfers: List[Dict[str, int]]  # [{'element_in': id, 'element_out': id}]
    chip: Optional[str] = None  # 'freehit' or 'wildcard' for unlimited
    gameweek: Optional[int] = None


class AccountStatusResponse(BaseModel):
    linked: bool
    fpl_email: Optional[str] = None
    team_id: Optional[int] = None


@router.post("/link", response_model=LinkAccountResponse)
async def link_fpl_account(
    request: LinkAccountRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Link your FPL account to enable direct team management.
    Your FPL password is encrypted before storage.
    """
    # Attempt to login to FPL
    result = await fpl_auth_service.login(request.email, request.password)
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get('error', 'Failed to login to FPL'),
        )
    
    # Encrypt and store credentials
    encrypted_password = fpl_auth_service.encrypt_password(request.password)
    
    current_user.fpl_email = request.email
    current_user.fpl_password_encrypted = encrypted_password
    current_user.fpl_team_id = result['team_id']
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    # Get team name
    player_info = result.get('player', {})
    team_name = player_info.get('entry_name', '')
    
    return LinkAccountResponse(
        success=True,
        team_id=result['team_id'],
        team_name=team_name,
    )


@router.delete("/unlink")
async def unlink_fpl_account(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Remove linked FPL account"""
    current_user.fpl_email = None
    current_user.fpl_password_encrypted = None
    
    session.add(current_user)
    session.commit()
    
    return {"success": True, "message": "FPL account unlinked"}


@router.get("/status", response_model=AccountStatusResponse)
async def get_account_status(
    current_user: User = Depends(get_current_user),
):
    """Check if FPL account is linked"""
    return AccountStatusResponse(
        linked=current_user.fpl_email is not None and current_user.fpl_password_encrypted is not None,
        fpl_email=current_user.fpl_email,
        team_id=current_user.fpl_team_id,
    )


async def _get_fpl_session(user: User) -> Dict[str, str]:
    """Get FPL session cookies for a user"""
    if not user.fpl_email or not user.fpl_password_encrypted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="FPL account not linked. Please link your account first.",
        )
    
    # Decrypt password and login
    password = fpl_auth_service.decrypt_password(user.fpl_password_encrypted)
    result = await fpl_auth_service.login(user.fpl_email, password)
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="FPL session expired. Please re-link your account.",
        )
    
    return result['session_cookies']


@router.get("/my-team")
async def get_my_team(
    current_user: User = Depends(get_current_user),
):
    """Get authenticated team data including transfers available"""
    cookies = await _get_fpl_session(current_user)
    
    if not current_user.fpl_team_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No FPL team ID set",
        )
    
    team_data = await fpl_auth_service.get_my_team(cookies, current_user.fpl_team_id)
    return team_data


@router.post("/save-team")
async def save_team(
    request: SaveTeamRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Save team selection (lineup, captain, bench order, chips)
    
    This will apply changes directly to your FPL team!
    """
    cookies = await _get_fpl_session(current_user)
    
    if not current_user.fpl_team_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No FPL team ID set",
        )
    
    result = await fpl_auth_service.save_team(
        cookies=cookies,
        team_id=current_user.fpl_team_id,
        picks=request.picks,
        chip=request.chip,
    )
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get('error', 'Failed to save team'),
        )
    
    return {"success": True, "message": "Team saved successfully", "data": result.get('data')}


@router.post("/transfers")
async def make_transfers(
    request: TransferRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Make transfers
    
    This will apply transfers directly to your FPL team!
    Each transfer beyond your free transfers costs 4 points.
    """
    cookies = await _get_fpl_session(current_user)
    
    if not current_user.fpl_team_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No FPL team ID set",
        )
    
    result = await fpl_auth_service.make_transfers(
        cookies=cookies,
        team_id=current_user.fpl_team_id,
        transfers=request.transfers,
        chip=request.chip,
        gameweek=request.gameweek,
    )
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get('error', 'Failed to make transfers'),
        )
    
    return {"success": True, "message": "Transfers completed", "data": result.get('data')}


@router.post("/activate-chip")
async def activate_chip(
    chip: str,
    current_user: User = Depends(get_current_user),
):
    """
    Activate a chip without making other changes
    
    Valid chips: 'bboost', '3xc', 'freehit', 'wildcard'
    """
    if chip not in ['bboost', '3xc', 'freehit', 'wildcard']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid chip: {chip}. Must be one of: bboost, 3xc, freehit, wildcard",
        )
    
    cookies = await _get_fpl_session(current_user)
    
    if not current_user.fpl_team_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No FPL team ID set",
        )
    
    result = await fpl_auth_service.activate_chip(
        cookies=cookies,
        team_id=current_user.fpl_team_id,
        chip=chip,
    )
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get('error', 'Failed to activate chip'),
        )
    
    return {"success": True, "message": f"Chip '{chip}' activated", "data": result.get('data')}

