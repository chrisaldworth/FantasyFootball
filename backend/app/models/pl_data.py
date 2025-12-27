"""
Premier League Data Models
Models for storing scraped match data from FBRef
"""
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship, JSON, Column
from sqlalchemy import Text


def utc_now() -> datetime:
    """Helper function to get current UTC datetime"""
    return datetime.now(timezone.utc)


class Team(SQLModel, table=True):
    """Team information from FBRef"""
    __tablename__ = "teams"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    fbref_id: str = Field(unique=True, index=True)
    name: str = Field(index=True)
    logo_url: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class Player(SQLModel, table=True):
    """Player information from FBRef"""
    __tablename__ = "players"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    fbref_id: str = Field(unique=True, index=True)
    name: str = Field(index=True)
    position: Optional[str] = None  # GK, DF, MF, FW, etc.
    current_team_id: Optional[UUID] = Field(default=None, foreign_key="teams.id", index=True)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class Match(SQLModel, table=True):
    """Match information"""
    __tablename__ = "matches"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    season: str = Field(index=True)  # e.g., "2025-2026"
    matchday: Optional[int] = Field(default=None, index=True)
    date: date = Field(index=True)
    home_team_id: UUID = Field(foreign_key="teams.id", index=True)
    away_team_id: UUID = Field(foreign_key="teams.id", index=True)
    score_home: Optional[int] = None
    score_away: Optional[int] = None
    status: str = Field(default="finished", index=True)  # scheduled, live, finished
    venue: Optional[str] = None
    referee: Optional[str] = None
    attendance: Optional[int] = None
    home_manager: Optional[str] = None
    away_manager: Optional[str] = None
    home_captain: Optional[str] = None
    away_captain: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class MatchPlayerStats(SQLModel, table=True):
    """Player statistics for a specific match"""
    __tablename__ = "match_player_stats"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    match_id: UUID = Field(foreign_key="matches.id", index=True)
    player_id: UUID = Field(foreign_key="players.id", index=True)
    team_id: UUID = Field(foreign_key="teams.id", index=True)
    
    # Basic stats
    minutes: Optional[int] = None
    goals: Optional[int] = Field(default=0)
    assists: Optional[int] = Field(default=0)
    
    # Shooting
    shots: Optional[int] = None
    shots_on_target: Optional[int] = None
    
    # Passing
    passes: Optional[int] = None
    pass_accuracy: Optional[float] = None  # Percentage
    
    # Defensive
    tackles: Optional[int] = None
    interceptions: Optional[int] = None
    clearances: Optional[int] = None
    blocks: Optional[int] = None
    
    # Discipline
    fouls: Optional[int] = None
    cards: Optional[str] = None  # yellow, red, null
    
    # Additional stats (stored as JSON for flexibility)
    additional_stats: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    
    # Composite index for common queries
    __table_args__ = (
        {"indexes": [
            {"name": "idx_match_player", "columns": ["match_id", "player_id"]},
            {"name": "idx_player_season", "columns": ["player_id", "match_id"]},
        ]}
    )


class MatchEvent(SQLModel, table=True):
    """Match events (goals, cards, substitutions, etc.)"""
    __tablename__ = "match_events"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    match_id: UUID = Field(foreign_key="matches.id", index=True)
    event_type: str = Field(index=True)  # goal, card, substitution, etc.
    minute: Optional[int] = Field(index=True)
    player_id: Optional[UUID] = Field(default=None, foreign_key="players.id", index=True)
    team_id: UUID = Field(foreign_key="teams.id", index=True)
    
    # Event details stored as JSON for flexibility
    details: Dict[str, Any] = Field(sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Composite index for match events queries
    __table_args__ = (
        {"indexes": [
            {"name": "idx_match_events", "columns": ["match_id", "event_type", "minute"]},
        ]}
    )


class Lineup(SQLModel, table=True):
    """Match lineups (starting XI and substitutes)"""
    __tablename__ = "lineups"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    match_id: UUID = Field(foreign_key="matches.id", index=True)
    team_id: UUID = Field(foreign_key="teams.id", index=True)
    is_home: bool = Field(index=True)  # True for home team, False for away
    
    formation: Optional[str] = None  # e.g., "4-2-3-1"
    starting_xi: List[Dict[str, Any]] = Field(sa_column=Column(JSON))  # Array of player info
    substitutes: List[Dict[str, Any]] = Field(sa_column=Column(JSON))  # Array of player info
    
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    
    # Composite index
    __table_args__ = (
        {"indexes": [
            {"name": "idx_match_team_lineup", "columns": ["match_id", "team_id"]},
        ]}
    )


class TeamStats(SQLModel, table=True):
    """Team statistics for a match"""
    __tablename__ = "team_stats"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    match_id: UUID = Field(foreign_key="matches.id", index=True)
    team_id: UUID = Field(foreign_key="teams.id", index=True)
    is_home: bool = Field(index=True)
    
    # Possession and play
    possession: Optional[float] = None  # Percentage
    passes: Optional[int] = None
    pass_accuracy: Optional[float] = None
    
    # Shooting
    shots: Optional[int] = None
    shots_on_target: Optional[int] = None
    
    # Defensive
    tackles: Optional[int] = None
    interceptions: Optional[int] = None
    clearances: Optional[int] = None
    
    # Additional stats
    additional_stats: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    
    # Composite index
    __table_args__ = (
        {"indexes": [
            {"name": "idx_match_team_stats", "columns": ["match_id", "team_id"]},
        ]}
    )

