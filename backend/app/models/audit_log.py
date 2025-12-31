from typing import Optional, Dict, Any
from datetime import datetime
from sqlmodel import SQLModel, Field, Column, JSON


class AuditLog(SQLModel, table=True):
    """Audit log for admin actions"""
    __tablename__ = "audit_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    admin_user_id: int = Field(foreign_key="users.id", index=True)
    admin_username: str = Field(index=True)
    action: str = Field(index=True)  # e.g., "user.update", "league.delete"
    resource_type: str = Field(index=True)  # e.g., "user", "league", "weekly_pick"
    resource_id: Optional[int] = Field(default=None, index=True)
    details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))  # Additional details
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "admin_user_id": 1,
                "admin_username": "admin",
                "action": "user.update",
                "resource_type": "user",
                "resource_id": 5,
                "details": {"field": "role", "old_value": "user", "new_value": "admin"},
                "ip_address": "192.168.1.1",
                "user_agent": "Mozilla/5.0...",
                "created_at": "2025-01-01T12:00:00Z"
            }
        }


