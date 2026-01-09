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
    
    # Football Companion
    favorite_team_id: Optional[int] = Field(default=None, index=True)  # API-FOOTBALL team ID
    
    # Profile
    is_active: bool = Field(default=True)
    is_premium: bool = Field(default=False)
    role: Optional[str] = Field(default="user")  # user, admin, super_admin
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Google/Firebase Authentication - These are dynamically accessed after migration
    # Columns: google_uid VARCHAR UNIQUE, google_email VARCHAR
    # Run: POST /api/admin/migrate-google-auth to add these columns


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
    favorite_team_id: Optional[int]
    is_active: bool
    is_premium: bool
    role: Optional[str]
    created_at: datetime


class UserUpdate(SQLModel):
    email: Optional[str] = None
    username: Optional[str] = None
    fpl_team_id: Optional[int] = None
    favorite_team_id: Optional[int] = None

