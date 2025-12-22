from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column, JSON
from sqlalchemy import ForeignKey, UniqueConstraint


class WeeklyPick(SQLModel, table=True):
    """Main weekly picks submission"""
    __tablename__ = "weekly_picks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    gameweek: int = Field(index=True)
    total_points: int = Field(default=0)
    rank: Optional[int] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    score_predictions: List["ScorePrediction"] = Relationship(back_populates="weekly_pick")
    player_picks: List["PlayerPick"] = Relationship(back_populates="weekly_pick")
    
    __table_args__ = (
        UniqueConstraint("user_id", "gameweek", name="unique_user_gameweek"),
    )


class ScorePrediction(SQLModel, table=True):
    """Score prediction for a fixture"""
    __tablename__ = "score_predictions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    weekly_pick_id: int = Field(foreign_key="weekly_picks.id", index=True)
    fixture_id: int = Field(index=True)  # FPL fixture ID
    home_team_id: int  # FPL team ID
    away_team_id: int  # FPL team ID
    predicted_home_score: int
    predicted_away_score: int
    actual_home_score: Optional[int] = None
    actual_away_score: Optional[int] = None
    points: int = Field(default=0)
    breakdown: Optional[dict] = Field(default=None, sa_column=Column(JSON))  # Store breakdown as JSON
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    weekly_pick: Optional[WeeklyPick] = Relationship(back_populates="score_predictions")


class PlayerPick(SQLModel, table=True):
    """Player pick for a fixture"""
    __tablename__ = "player_picks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    weekly_pick_id: int = Field(foreign_key="weekly_picks.id", index=True)
    player_id: int = Field(index=True)  # FPL player ID
    fixture_id: int = Field(index=True)  # FPL fixture ID
    fpl_points: Optional[int] = None  # Actual FPL points scored
    points: int = Field(default=0)  # Points awarded for this pick
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    weekly_pick: Optional[WeeklyPick] = Relationship(back_populates="player_picks")


class WeeklyPicksLeague(SQLModel, table=True):
    """Private league for weekly picks"""
    __tablename__ = "weekly_picks_leagues"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    code: str = Field(unique=True, index=True)  # Unique invite code
    type: str = Field(default="both")  # "weekly", "seasonal", or "both"
    created_by: int = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    members: List["WeeklyPicksLeagueMember"] = Relationship(back_populates="league")


class WeeklyPicksLeagueMember(SQLModel, table=True):
    """League membership"""
    __tablename__ = "weekly_picks_league_members"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    league_id: int = Field(foreign_key="weekly_picks_leagues.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    league: Optional[WeeklyPicksLeague] = Relationship(back_populates="members")
    
    __table_args__ = (
        UniqueConstraint("league_id", "user_id", name="unique_league_member"),
    )

