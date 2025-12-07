from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    username: str = Field(unique=True, index=True)
    
    # FPL Integration
    fpl_team_id: Optional[int] = Field(default=None, index=True)
    fpl_email: Optional[str] = None
    fpl_password_encrypted: Optional[str] = None  # Encrypted FPL password for session auth
    
    # Profile
    is_active: bool = Field(default=True)
    is_premium: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(SQLModel):
    email: str
    username: str
    password: str
    fpl_team_id: Optional[int] = None


class UserRead(SQLModel):
    id: int
    email: str
    username: str
    fpl_team_id: Optional[int]
    is_active: bool
    is_premium: bool
    created_at: datetime


class UserUpdate(SQLModel):
    email: Optional[str] = None
    username: Optional[str] = None
    fpl_team_id: Optional[int] = None

