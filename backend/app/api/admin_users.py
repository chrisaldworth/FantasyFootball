"""
Admin API endpoints for user management
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlmodel import Session, select, func
from app.core.database import get_session
from app.core.security import get_current_admin_user
from app.models.user import User, UserRead, UserUpdate, UserCreate
from app.core.audit import create_audit_log

router = APIRouter(prefix="/admin/users", tags=["Admin - Users"])


@router.get("", response_model=dict)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    is_premium: Optional[bool] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """List users with pagination and filters"""
    query = select(User)
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.where(
            (User.email.ilike(search_term)) |
            (User.username.ilike(search_term))
        )
    
    if role:
        query = query.where(User.role == role)
    
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    
    if is_premium is not None:
        query = query.where(User.is_premium == is_premium)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    users = session.exec(query).all()
    
    return {
        "items": [UserRead.model_validate(user) for user in users],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Get user details"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserRead.model_validate(user)


@router.post("", response_model=UserRead)
async def create_user(
    user_data: UserCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new user"""
    from app.core.security import get_password_hash
    
    # Check if email or username already exists
    existing = session.exec(
        select(User).where(
            (User.email == user_data.email) | (User.username == user_data.username)
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email or username already exists"
        )
    
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        fpl_team_id=user_data.fpl_team_id,
        role="user"  # Default role
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return UserRead.model_validate(user)


@router.put("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Update user"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Track changes for audit
    changes = {}
    update_data = user_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        old_value = getattr(user, key, None)
        if old_value != value:
            changes[key] = {"old": old_value, "new": value}
        setattr(user, key, value)
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Log audit
    if changes:
        await create_audit_log(
            session=session,
            admin_user=current_user,
            action="user.update",
            resource_type="user",
            resource_id=user_id,
            details=changes,
            request=request,
        )
    
    return UserRead.model_validate(user)


@router.put("/{user_id}/role", response_model=UserRead)
async def update_user_role(
    user_id: int,
    role: str = Query(..., regex="^(user|admin|super_admin)$"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Update user role (requires super_admin for super_admin role)"""
    from app.core.security import get_current_super_admin_user
    
    # Require super_admin to assign super_admin role
    if role == "super_admin":
        current_user = await get_current_super_admin_user(current_user)
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return UserRead.model_validate(user)


@router.put("/{user_id}/status", response_model=UserRead)
async def update_user_status(
    user_id: int,
    is_active: bool,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Activate or deactivate user"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = is_active
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return UserRead.model_validate(user)


@router.put("/{user_id}/premium", response_model=UserRead)
async def update_user_premium(
    user_id: int,
    is_premium: bool,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Update user premium status"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_premium = is_premium
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return UserRead.model_validate(user)


@router.post("/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    password_data: dict,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Reset user password"""
    from app.core.security import get_password_hash
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_password = password_data.get("new_password")
    if not new_password:
        raise HTTPException(status_code=400, detail="new_password is required")
    
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    user.hashed_password = get_password_hash(new_password)
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Log audit
    await create_audit_log(
        session=session,
        admin_user=current_user,
        action="user.reset_password",
        resource_type="user",
        resource_id=user_id,
        details={"email": user.email},
        request=request,
    )
    
    return {"message": "Password reset successfully"}


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete user (soft delete by deactivating)"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Soft delete - just deactivate
    user.is_active = False
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Log audit
    await create_audit_log(
        session=session,
        admin_user=current_user,
        action="user.delete",
        resource_type="user",
        resource_id=user_id,
        details={"email": user.email, "username": user.username},
        request=request,
    )
    
    return {"message": "User deactivated successfully"}

