"""
Admin API endpoints for audit log
"""
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlmodel import Session, select, func, and_
from app.core.database import get_session
from app.core.security import get_current_admin_user
from app.models.user import User
from app.models.audit_log import AuditLog
import csv
import io

router = APIRouter(prefix="/admin/audit", tags=["Admin - Audit Log"])


@router.get("")
async def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    admin_user_id: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Get audit logs with pagination and filters"""
    query = select(AuditLog)
    
    # Apply filters
    if action:
        query = query.where(AuditLog.action.ilike(f"%{action}%"))
    
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
    
    if admin_user_id:
        query = query.where(AuditLog.admin_user_id == admin_user_id)
    
    if date_from:
        try:
            date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
            query = query.where(AuditLog.created_at >= date_from_obj)
        except ValueError:
            pass
    
    if date_to:
        try:
            date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
            query = query.where(AuditLog.created_at <= date_to_obj)
        except ValueError:
            pass
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(page_size)
    
    logs = session.exec(query).all()
    
    return {
        "items": [
            {
                "id": log.id,
                "admin_user_id": log.admin_user_id,
                "admin_username": log.admin_username,
                "action": log.action,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "details": log.details,
                "ip_address": log.ip_address,
                "user_agent": log.user_agent,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/export")
async def export_audit_logs(
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    admin_user_id: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    format: str = Query("csv", regex="^(csv|json)$"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Export audit logs as CSV or JSON"""
    query = select(AuditLog)
    
    # Apply same filters as list endpoint
    if action:
        query = query.where(AuditLog.action.ilike(f"%{action}%"))
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
    if admin_user_id:
        query = query.where(AuditLog.admin_user_id == admin_user_id)
    if date_from:
        try:
            date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
            query = query.where(AuditLog.created_at >= date_from_obj)
        except ValueError:
            pass
    if date_to:
        try:
            date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
            query = query.where(AuditLog.created_at <= date_to_obj)
        except ValueError:
            pass
    
    logs = session.exec(query.order_by(AuditLog.created_at.desc())).all()
    
    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            "ID", "Admin User ID", "Admin Username", "Action", "Resource Type",
            "Resource ID", "Details", "IP Address", "User Agent", "Created At"
        ])
        
        # Write data
        for log in logs:
            writer.writerow([
                log.id,
                log.admin_user_id,
                log.admin_username,
                log.action,
                log.resource_type,
                log.resource_id or "",
                str(log.details) if log.details else "",
                log.ip_address or "",
                log.user_agent or "",
                log.created_at.isoformat(),
            ])
        
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=audit_logs_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )
    
    else:  # JSON
        return {
            "logs": [
                {
                    "id": log.id,
                    "admin_user_id": log.admin_user_id,
                    "admin_username": log.admin_username,
                    "action": log.action,
                    "resource_type": log.resource_type,
                    "resource_id": log.resource_id,
                    "details": log.details,
                    "ip_address": log.ip_address,
                    "user_agent": log.user_agent,
                    "created_at": log.created_at.isoformat(),
                }
                for log in logs
            ],
            "exported_at": datetime.utcnow().isoformat(),
            "total": len(logs)
        }


@router.get("/stats")
async def get_audit_stats(
    days: int = Query(30, ge=1, le=365),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_admin_user)
):
    """Get audit log statistics"""
    since = datetime.utcnow() - timedelta(days=days)
    
    # Total actions
    total = session.exec(
        select(func.count(AuditLog.id)).where(AuditLog.created_at >= since)
    ).one()
    
    # Actions by type
    actions_by_type = {}
    logs = session.exec(
        select(AuditLog.resource_type, func.count(AuditLog.id))
        .where(AuditLog.created_at >= since)
        .group_by(AuditLog.resource_type)
    ).all()
    
    for resource_type, count in logs:
        actions_by_type[resource_type] = count
    
    # Actions by admin
    actions_by_admin = {}
    admin_logs = session.exec(
        select(AuditLog.admin_username, func.count(AuditLog.id))
        .where(AuditLog.created_at >= since)
        .group_by(AuditLog.admin_username)
    ).all()
    
    for username, count in admin_logs:
        actions_by_admin[username] = count
    
    return {
        "period_days": days,
        "total_actions": total,
        "actions_by_resource_type": actions_by_type,
        "actions_by_admin": actions_by_admin,
    }

