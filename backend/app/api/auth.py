from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.core.config import settings
from app.core.database import get_session
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)
from app.models.user import User, UserCreate, UserRead
from app.schemas.auth import Token, LoginRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserRead)
async def register(
    data: RegisterRequest,
    session: Session = Depends(get_session)
):
    """Register a new user"""
    # Check if email exists
    existing_email = session.exec(
        select(User).where(User.email == data.email)
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username exists
    existing_username = session.exec(
        select(User).where(User.username == data.username)
    ).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    user = User(
        email=data.email,
        username=data.username,
        hashed_password=get_password_hash(data.password),
        fpl_team_id=data.fpl_team_id
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    """Login and get access token"""
    try:
        # Find user by email
        user = session.exec(
            select(User).where(User.email == form_data.username)
        ).first()
        
        if not user:
            print(f"[Auth] Login attempt failed: User not found for email {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not verify_password(form_data.password, user.hashed_password):
            print(f"[Auth] Login attempt failed: Invalid password for user {user.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            print(f"[Auth] Login attempt failed: User {user.email} is inactive")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        print(f"[Auth] Login successful for user {user.email}")
        return Token(access_token=access_token)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Auth] Login error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again.",
        )


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user


@router.put("/me/fpl-team", response_model=UserRead)
async def update_fpl_team_id(
    fpl_team_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update user's FPL team ID"""
    current_user.fpl_team_id = fpl_team_id
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

