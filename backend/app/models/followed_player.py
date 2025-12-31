from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column, Integer, ForeignKey, Index


class FollowedPlayer(SQLModel, table=True):
    __tablename__ = "followed_players"
    __table_args__ = (
        Index("idx_user_player", "user_id", "player_id", unique=True),
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    player_id: int = Field(index=True)  # FPL player ID
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship to User (optional, for future use)
    # user: Optional[User] = Relationship(back_populates="followed_players")


class FollowedPlayerCreate(SQLModel):
    player_id: int


class FollowedPlayerRead(SQLModel):
    id: int
    user_id: int
    player_id: int
    created_at: datetime
