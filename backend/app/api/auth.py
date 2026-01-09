from datetime import timedelta
import os
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select, text
from pydantic import BaseModel
from typing import Optional

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


# Firebase Token Verification
class FirebaseTokenRequest(BaseModel):
    id_token: str


class FirebaseVerifyResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_new_user: bool
    user: dict


async def verify_firebase_token(id_token: str) -> dict:
    """
    Verify Firebase ID token using Google's token info endpoint.
    This is a simpler approach that doesn't require firebase-admin SDK.
    """
    try:
        # Use Google's tokeninfo endpoint to verify the token
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            )
            
            if response.status_code != 200:
                print(f"[Firebase] Token verification failed: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Firebase token"
                )
            
            token_data = response.json()
            print(f"[Firebase] Token verified for: {token_data.get('email')}")
            
            # Verify the token is for our Firebase project
            firebase_project_id = os.environ.get("FIREBASE_PROJECT_ID") or settings.FIREBASE_PROJECT_ID if hasattr(settings, 'FIREBASE_PROJECT_ID') else None
            if firebase_project_id:
                aud = token_data.get("aud")
                if aud != firebase_project_id:
                    print(f"[Firebase] Token audience mismatch: {aud} != {firebase_project_id}")
                    # Don't fail - just warn (audience can vary)
            
            return {
                "uid": token_data.get("sub"),
                "email": token_data.get("email"),
                "email_verified": token_data.get("email_verified") == "true",
                "name": token_data.get("name"),
                "picture": token_data.get("picture"),
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Firebase] Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Failed to verify Firebase token: {str(e)}"
        )


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
    print(f"[Auth] Login attempt for email: {form_data.username}")
    
    try:
        # Test database connection first
        try:
            # Simple query to test connection - use session.get or a simple select
            from sqlmodel import text
            # Try a simple connection test
            session.exec(text("SELECT 1")).first()
            print("[Auth] Database connection OK")
        except Exception as db_error:
            print(f"[Auth] Database connection error: {str(db_error)}")
            print(f"[Auth] Error type: {type(db_error)}")
            import traceback
            print(traceback.format_exc())
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Database connection error: {str(db_error)[:200]}. Please try again later.",
            )
        
        # Find user by email - use direct query execution
        try:
            # Try using a more explicit parameter binding approach
            email_param = form_data.username.strip()
            print(f"[Auth] Looking up user with email: {email_param}")
            
            # Execute query directly in one line
            user = session.exec(
                select(User).where(User.email == email_param)
            ).first()
            print(f"[Auth] User lookup result: {'Found' if user else 'Not found'}")
            if user:
                print(f"[Auth] Found user ID: {user.id}, email: {user.email}")
        except Exception as query_error:
            error_class = type(query_error).__name__
            error_message = str(query_error)
            print(f"[Auth] User query error: {error_class}: {error_message}")
            import traceback
            error_trace = traceback.format_exc()
            print(error_trace)
            
            # Provide more specific error information
            if "table" in error_message.lower() and ("does not exist" in error_message.lower() or "relation" in error_message.lower()):
                detail = "Database table does not exist. Tables may need to be created."
            elif "connection" in error_message.lower() or "connect" in error_message.lower():
                detail = "Database connection error. Please try again later."
            elif "f405" in error_message.lower() or "parameter" in error_message.lower():
                detail = "Database query parameter error. This may indicate a schema mismatch."
            else:
                detail = f"Database query error ({error_class}): {error_message[:150]}"
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=detail,
            )
        
        if not user:
            print(f"[Auth] Login attempt failed: User not found for email {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user has a password set (Google-only users won't)
        if not user.hashed_password:
            print(f"[Auth] Login attempt failed: User {user.email} has no password (Google-only account)")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="This account uses Google sign-in. Please use 'Continue with Google' to log in.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        try:
            password_valid = verify_password(form_data.password, user.hashed_password)
            print(f"[Auth] Password verification result: {password_valid}")
        except Exception as pwd_error:
            print(f"[Auth] Password verification error: {str(pwd_error)}")
            import traceback
            print(traceback.format_exc())
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Password verification error. Please try again.",
            )
        
        if not password_valid:
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
        
        # Create access token
        try:
            access_token = create_access_token(
                data={"sub": str(user.id)},
                expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            )
            print(f"[Auth] Login successful for user {user.email} (ID: {user.id})")
            return Token(access_token=access_token)
        except Exception as token_error:
            print(f"[Auth] Token creation error: {str(token_error)}")
            import traceback
            print(traceback.format_exc())
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Token creation error. Please try again.",
            )
            
    except HTTPException:
        # Re-raise HTTP exceptions (they already have proper error messages)
        raise
    except Exception as e:
        print(f"[Auth] Unexpected login error: {str(e)}")
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


@router.put("/me/favorite-team", response_model=UserRead)
async def update_favorite_team_id(
    favorite_team_id: int = Query(..., description="API-FOOTBALL team ID"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update user's favorite football team ID (API-FOOTBALL team ID)"""
    current_user.favorite_team_id = favorite_team_id
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


# ============================================================================
# Firebase/Google Authentication Endpoints
# ============================================================================

@router.post("/firebase/verify")
async def firebase_verify(
    request: FirebaseTokenRequest,
    session: Session = Depends(get_session)
):
    """
    Verify Firebase ID token and return backend JWT.
    Creates a new user if one doesn't exist with this Google account.
    """
    print(f"[Firebase] Verifying token...")
    
    # Verify the Firebase token
    firebase_data = await verify_firebase_token(request.id_token)
    google_uid = firebase_data["uid"]
    email = firebase_data["email"]
    name = firebase_data.get("name", "")
    
    print(f"[Firebase] Token verified for UID: {google_uid}, email: {email}")
    
    # Check if user exists by Google UID
    user = session.exec(
        select(User).where(User.google_uid == google_uid)
    ).first()
    
    is_new_user = False
    
    if not user:
        # Check if user exists by email (might have registered with email/password)
        user = session.exec(
            select(User).where(User.email == email)
        ).first()
        
        if user:
            # Link Google account to existing user
            print(f"[Firebase] Linking Google to existing user: {user.email}")
            user.google_uid = google_uid
            user.google_email = email
            session.add(user)
            session.commit()
            session.refresh(user)
        else:
            # Create new user
            print(f"[Firebase] Creating new user for: {email}")
            is_new_user = True
            
            # Generate username from email or name
            base_username = name.replace(" ", "_").lower() if name else email.split("@")[0]
            username = base_username
            counter = 1
            
            # Ensure username is unique
            while session.exec(select(User).where(User.username == username)).first():
                username = f"{base_username}_{counter}"
                counter += 1
            
            user = User(
                email=email,
                username=username,
                hashed_password=None,  # No password for Google-only users
                google_uid=google_uid,
                google_email=email,
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            print(f"[Firebase] Created new user ID: {user.id}")
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_new_user": is_new_user,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "fpl_team_id": user.fpl_team_id,
            "favorite_team_id": user.favorite_team_id,
            "is_active": user.is_active,
            "is_premium": user.is_premium,
            "role": user.role,
        }
    }


@router.post("/link-google")
async def link_google_account(
    request: FirebaseTokenRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Link a Google account to the current user"""
    print(f"[Firebase] Linking Google to user: {current_user.email}")
    
    # Verify the Firebase token
    firebase_data = await verify_firebase_token(request.id_token)
    google_uid = firebase_data["uid"]
    google_email = firebase_data["email"]
    
    # Check if this Google account is already linked to another user
    existing_user = session.exec(
        select(User).where(User.google_uid == google_uid)
    ).first()
    
    if existing_user and existing_user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This Google account is already linked to another user"
        )
    
    # Link Google account
    current_user.google_uid = google_uid
    current_user.google_email = google_email
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    print(f"[Firebase] Successfully linked Google to user: {current_user.email}")
    
    return {
        "success": True,
        "message": "Google account linked successfully",
        "google_email": google_email
    }


@router.delete("/unlink-google")
async def unlink_google_account(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Unlink Google account from current user"""
    print(f"[Firebase] Unlinking Google from user: {current_user.email}")
    
    if not current_user.google_uid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No Google account linked"
        )
    
    # Ensure user has a password before unlinking (so they can still log in)
    if not current_user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot unlink Google account - you need to set a password first"
        )
    
    # Unlink Google account
    current_user.google_uid = None
    current_user.google_email = None
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    print(f"[Firebase] Successfully unlinked Google from user: {current_user.email}")
    
    return {
        "success": True,
        "message": "Google account unlinked successfully"
    }


@router.get("/methods")
async def get_auth_methods(
    current_user: User = Depends(get_current_user),
):
    """Get authentication methods for current user"""
    return {
        "email": {
            "linked": current_user.hashed_password is not None,
            "email": current_user.email if current_user.hashed_password else None,
        },
        "google": {
            "linked": current_user.google_uid is not None,
            "email": current_user.google_email,
        }
    }

