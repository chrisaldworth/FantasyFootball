"""
Audit logging utilities for admin actions
"""
from typing import Optional, Dict, Any
from functools import wraps
from fastapi import Request, Depends
from sqlmodel import Session
from app.core.database import get_session
from app.core.security import get_current_admin_user
from app.models.user import User
from app.models.audit_log import AuditLog


def log_admin_action(
    action: str,
    resource_type: str,
    resource_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None
):
    """
    Decorator to log admin actions
    
    Usage:
        @log_admin_action("user.update", "user")
        async def update_user(...):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get current user and session from dependencies
            current_user: Optional[User] = None
            session: Optional[Session] = None
            request: Optional[Request] = None
            
            # Extract dependencies from kwargs
            for key, value in kwargs.items():
                if isinstance(value, User) and current_user is None:
                    current_user = value
                elif isinstance(value, Session) and session is None:
                    session = value
                elif isinstance(value, Request) and request is None:
                    request = value
            
            # Execute the function
            result = await func(*args, **kwargs)
            
            # Log the action
            if current_user and session:
                try:
                    # Extract resource_id from result if not provided
                    actual_resource_id = resource_id
                    if actual_resource_id is None and isinstance(result, dict):
                        actual_resource_id = result.get("id") or result.get("user_id") or result.get("league_id") or result.get("pick_id")
                    
                    # Get IP and user agent from request
                    ip_address = None
                    user_agent = None
                    if request:
                        ip_address = request.client.host if request.client else None
                        user_agent = request.headers.get("user-agent")
                    
                    audit_log = AuditLog(
                        admin_user_id=current_user.id,
                        admin_username=current_user.username,
                        action=action,
                        resource_type=resource_type,
                        resource_id=actual_resource_id,
                        details=details or {},
                        ip_address=ip_address,
                        user_agent=user_agent,
                    )
                    session.add(audit_log)
                    session.commit()
                except Exception as e:
                    # Don't fail the request if logging fails
                    print(f"[Audit] Failed to log action: {e}")
            
            return result
        return wrapper
    return decorator


async def create_audit_log(
    session: Session,
    admin_user: User,
    action: str,
    resource_type: str,
    resource_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None,
    request: Optional[Request] = None,
):
    """Helper function to create an audit log entry"""
    ip_address = None
    user_agent = None
    if request:
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
    
    audit_log = AuditLog(
        admin_user_id=admin_user.id,
        admin_username=admin_user.username,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details or {},
        ip_address=ip_address,
        user_agent=user_agent,
    )
    session.add(audit_log)
    session.commit()
    return audit_log

