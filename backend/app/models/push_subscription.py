from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class PushSubscription(SQLModel, table=True):
    """Model for storing push notification subscriptions"""
    __tablename__ = "push_subscriptions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    endpoint: str = Field(unique=True, index=True)
    p256dh_key: str  # Public key for encryption
    auth_key: str  # Auth secret
    
    # Notification preferences (synced from frontend settings)
    notify_goals: bool = Field(default=True)
    notify_assists: bool = Field(default=True)
    notify_yellow_cards: bool = Field(default=True)
    notify_red_cards: bool = Field(default=True)
    notify_substitutions: bool = Field(default=True)
    notify_match_end: bool = Field(default=True)
    notify_bonus_points: bool = Field(default=True)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Track if subscription is still valid
    is_active: bool = Field(default=True)
    last_error: Optional[str] = Field(default=None)


class NotificationLog(SQLModel, table=True):
    """Log of sent notifications for debugging and analytics"""
    __tablename__ = "notification_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    notification_type: str  # goal, assist, yellow, red, etc.
    player_id: int
    player_name: str
    message: str
    sent_at: datetime = Field(default_factory=datetime.utcnow)
    success: bool = Field(default=True)
    error_message: Optional[str] = Field(default=None)

