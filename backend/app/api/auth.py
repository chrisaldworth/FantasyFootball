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


# Diagnostic endpoint to check Firebase configuration
@router.get("/firebase/config-check")
async def firebase_config_check():
    """Check if Firebase is properly configured (no auth required)"""
    from sqlalchemy import inspect
    from app.core.database import engine
    
    firebase_api_key = os.environ.get("FIREBASE_WEB_API_KEY")
    firebase_project_id = os.environ.get("FIREBASE_PROJECT_ID", "fotmate")
    
    # Check database columns
    try:
        inspector = inspect(engine)
        columns = [col["name"] for col in inspector.get_columns("users")]
        google_columns_exist = "google_uid" in columns and "google_email" in columns
    except Exception as e:
        google_columns_exist = False
        columns = f"Error: {str(e)}"
    
    return {
        "firebase_api_key_set": bool(firebase_api_key),
        "firebase_api_key_length": len(firebase_api_key) if firebase_api_key else 0,
        "firebase_project_id": firebase_project_id,
        "google_columns_exist": google_columns_exist,
        "user_table_columns": columns if isinstance(columns, list) else str(columns),
        "status": "ready" if (firebase_api_key and google_columns_exist) else "not_ready",
        "issues": [
            issue for issue in [
                None if firebase_api_key else "FIREBASE_WEB_API_KEY not set",
                None if google_columns_exist else "Google auth columns not in database (run migrate-google-auth)",
            ] if issue
        ]
    }


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
    Verify Firebase ID token using Firebase Identity Toolkit API.
    This approach uses the Firebase Web API key to validate tokens.
    """
    try:
        # Get Firebase project ID and API key from environment
        firebase_project_id = os.environ.get("FIREBASE_PROJECT_ID", "fotmate")
        firebase_api_key = os.environ.get("FIREBASE_WEB_API_KEY")
        
        print(f"[Firebase] Verifying token for project: {firebase_project_id}")
        print(f"[Firebase] API key configured: {bool(firebase_api_key)}")
        
        # Use Firebase Identity Toolkit API to verify the token
        # This requires the Firebase Web API Key to be set
        if not firebase_api_key:
            print("[Firebase] ERROR: FIREBASE_WEB_API_KEY environment variable not set")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Firebase authentication not configured. Please set FIREBASE_WEB_API_KEY environment variable."
            )
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            print(f"[Firebase] Calling Identity Toolkit API...")
            response = await client.post(
                f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={firebase_api_key}",
                json={"idToken": id_token}
            )
            
            print(f"[Firebase] Identity Toolkit response status: {response.status_code}")
            
            if response.status_code != 200:
                error_text = response.text
                print(f"[Firebase] Identity Toolkit verification failed: {error_text}")
                
                # Parse error for better message
                try:
                    error_data = response.json()
                    error_message = error_data.get("error", {}).get("message", "Invalid token")
                except:
                    error_message = "Invalid Firebase token"
                
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Firebase token verification failed: {error_message}"
                )
            
            data = response.json()
            users = data.get("users", [])
            
            if not users:
                print("[Firebase] No user found for token")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No user found for Firebase token"
                )
            
            user_data = users[0]
            email = user_data.get("email")
            uid = user_data.get("localId")
            
            print(f"[Firebase] Token verified successfully for: {email} (UID: {uid})")
            
            return {
                "uid": uid,
                "email": email,
                "email_verified": user_data.get("emailVerified", False),
                "name": user_data.get("displayName", ""),
                "picture": user_data.get("photoUrl", ""),
            }
            
    except HTTPException:
        raise
    except httpx.TimeoutException:
        print("[Firebase] Token verification timed out")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Firebase token verification timed out. Please try again."
        )
    except Exception as e:
        print(f"[Firebase] Token verification error: {type(e).__name__}: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
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
    try:
        from sqlalchemy import inspect
        from app.core.database import engine
        import secrets
        
        print(f"[Firebase] firebase_verify endpoint called")
        
        # Check if google_uid column exists in database
        try:
            inspector = inspect(engine)
            columns = [col["name"] for col in inspector.get_columns("users")]
            google_columns_exist = "google_uid" in columns and "google_email" in columns
            print(f"[Firebase] Database columns check - google columns exist: {google_columns_exist}")
        except Exception as db_check_error:
            print(f"[Firebase] Error checking database columns: {db_check_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(db_check_error)}"
            )
        
        if not google_columns_exist:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Google authentication not yet configured. Please run the migrate-google-auth migration first."
            )
        
        # Verify the Firebase token
        print(f"[Firebase] Calling verify_firebase_token...")
        firebase_data = await verify_firebase_token(request.id_token)
        google_uid = firebase_data["uid"]
        email = firebase_data["email"]
        name = firebase_data.get("name", "")
        
        print(f"[Firebase] Token verified for UID: {google_uid}, email: {email}")
        
        # Check if user exists by Google UID (using raw SQL since column may not be in model)
        # Use execute() instead of exec() for raw SQL with parameters
        result = session.execute(
            text("SELECT id FROM users WHERE google_uid = :uid"),
            {"uid": google_uid}
        ).first()
        user = session.get(User, result[0]) if result else None
        
        is_new_user = False
        
        if not user:
            # Check if user exists by email (might have registered with email/password)
            user = session.exec(
                select(User).where(User.email == email)
            ).first()
            
            if user:
                # Link Google account to existing user (using raw SQL)
                print(f"[Firebase] Linking Google to existing user: {user.email}")
                session.execute(
                    text("UPDATE users SET google_uid = :uid, google_email = :email WHERE id = :id"),
                    {"uid": google_uid, "email": email, "id": user.id}
                )
                session.commit()
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
            
            # Generate a random password hash for Google-only users
            # They won't use this, but the field is required
            random_password = secrets.token_urlsafe(32)
            
            user = User(
                email=email,
                username=username,
                hashed_password=get_password_hash(random_password),
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            
            # Set Google fields using raw SQL
            session.execute(
                text("UPDATE users SET google_uid = :uid, google_email = :email WHERE id = :id"),
                {"uid": google_uid, "email": email, "id": user.id}
            )
            session.commit()
            print(f"[Firebase] Created new user ID: {user.id}")
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        print(f"[Firebase] Successfully authenticated user: {user.email}")
        
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
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Firebase] firebase_verify error: {type(e).__name__}: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Firebase authentication error: {str(e)}"
        )


@router.post("/link-google")
async def link_google_account(
    request: FirebaseTokenRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Link a Google account to the current user"""
    from sqlalchemy import inspect
    from app.core.database import engine
    
    # Check if google columns exist
    inspector = inspect(engine)
    columns = [col["name"] for col in inspector.get_columns("users")]
    if "google_uid" not in columns:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google authentication not yet configured. Please run the migrate-google-auth migration first."
        )
    
    print(f"[Firebase] Linking Google to user: {current_user.email}")
    
    # Verify the Firebase token
    firebase_data = await verify_firebase_token(request.id_token)
    google_uid = firebase_data["uid"]
    google_email = firebase_data["email"]
    
    # Check if this Google account is already linked to another user (raw SQL)
    result = session.execute(
        text("SELECT id FROM users WHERE google_uid = :uid"),
        {"uid": google_uid}
    ).first()
    
    if result and result[0] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This Google account is already linked to another user"
        )
    
    # Link Google account (raw SQL)
    session.execute(
        text("UPDATE users SET google_uid = :uid, google_email = :email WHERE id = :id"),
        {"uid": google_uid, "email": google_email, "id": current_user.id}
    )
    session.commit()
    
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
    from sqlalchemy import inspect
    from app.core.database import engine
    
    # Check if google columns exist
    inspector = inspect(engine)
    columns = [col["name"] for col in inspector.get_columns("users")]
    if "google_uid" not in columns:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google authentication not yet configured."
        )
    
    print(f"[Firebase] Unlinking Google from user: {current_user.email}")
    
    # Check if user has Google linked (raw SQL)
    result = session.execute(
        text("SELECT google_uid FROM users WHERE id = :id"),
        {"id": current_user.id}
    ).first()
    
    if not result or not result[0]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No Google account linked"
        )
    
    # Unlink Google account (raw SQL)
    session.execute(
        text("UPDATE users SET google_uid = NULL, google_email = NULL WHERE id = :id"),
        {"id": current_user.id}
    )
    session.commit()
    
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
    from sqlalchemy import inspect
    from app.core.database import engine
    
    # Check if google columns exist
    inspector = inspect(engine)
    columns = [col["name"] for col in inspector.get_columns("users")]
    google_columns_exist = "google_uid" in columns
    
    google_uid = getattr(current_user, 'google_uid', None) if google_columns_exist else None
    google_email = getattr(current_user, 'google_email', None) if google_columns_exist else None
    
    return {
        "email": {
            "linked": current_user.hashed_password is not None,
            "email": current_user.email,
        },
        "google": {
            "linked": google_uid is not None,
            "email": google_email,
        }
    }

