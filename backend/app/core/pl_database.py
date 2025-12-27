"""
Premier League Data Database Connection
Separate database for PL match data (scraped from FBRef)
"""
import os
from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings

# Import PL data models
from app.models.pl_data import (
    Team,
    Player,
    Match,
    MatchPlayerStats,
    MatchEvent,
    Lineup,
    TeamStats,
)

# Get PL database URL
# Default: Use same database as user data (can override with PL_DATABASE_URL for separate DB)
# This allows starting simple (same DB) and migrating to separate DB later if needed
pl_database_url = os.environ.get("PL_DATABASE_URL") or os.environ.get("DATABASE_URL") or settings.DATABASE_URL
pl_database_url = pl_database_url.strip() if pl_database_url else ""

print(f"[PL DB] Raw PL_DATABASE_URL length: {len(pl_database_url)}")
print(f"[PL DB] Raw PL_DATABASE_URL prefix: {pl_database_url[:50] if len(pl_database_url) > 50 else pl_database_url}...")

# Fallback to SQLite if empty
if not pl_database_url:
    print("[PL DB] WARNING: No PL_DATABASE_URL set, using SQLite")
    pl_database_url = "sqlite:///./pl_data.db"

# Convert postgres:// to postgresql:// (Render/Heroku use postgres://)
if pl_database_url.startswith("postgres://"):
    pl_database_url = pl_database_url.replace("postgres://", "postgresql://", 1)

# For psycopg2 driver with PostgreSQL
if pl_database_url.startswith("postgresql://"):
    pl_database_url = pl_database_url.replace("postgresql://", "postgresql+psycopg2://", 1)

print(f"[PL DB] Final URL prefix: {pl_database_url[:60]}...")

# Create engine with appropriate connect_args
if "sqlite" in pl_database_url:
    connect_args = {"check_same_thread": False}
    pool_args = {}
else:
    connect_args = {
        "sslmode": "require",
        "connect_timeout": 10,
    }
    pool_args = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
    }

# Create engine
if "sqlite" in pl_database_url:
    pl_engine = create_engine(pl_database_url, echo=settings.DEBUG, connect_args=connect_args)
else:
    pl_engine = create_engine(
        pl_database_url,
        echo=settings.DEBUG,
        connect_args=connect_args,
        **pool_args
    )


def create_pl_db_and_tables():
    """Create all PL data database tables if they don't exist"""
    try:
        print("[PL DB] Creating PL database tables...")
        SQLModel.metadata.create_all(pl_engine)
        print("[PL DB] PL database tables created successfully")
        
        # Verify tables exist
        from sqlalchemy import inspect
        inspector = inspect(pl_engine)
        tables = inspector.get_table_names()
        print(f"[PL DB] Existing tables: {tables}")
        
        expected_tables = ["teams", "players", "matches", "match_player_stats", "match_events", "lineups", "team_stats"]
        missing = set(expected_tables) - set(tables)
        if missing:
            print(f"[PL DB] WARNING: Missing tables: {missing}")
        else:
            print("[PL DB] All PL data tables exist")
            
    except Exception as e:
        print(f"[PL DB] ERROR creating tables: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise


def get_pl_session():
    """Get a PL database session"""
    try:
        with Session(pl_engine) as session:
            yield session
    except Exception as e:
        error_msg = str(e)
        if "SSL" in error_msg or "connection" in error_msg.lower():
            print(f"[PL DB] Connection error in session: {error_msg[:200]}")
            try:
                with Session(pl_engine) as new_session:
                    yield new_session
            except Exception as retry_error:
                print(f"[PL DB] Retry also failed: {str(retry_error)[:200]}")
                raise
        else:
            raise

