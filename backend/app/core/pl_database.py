"""
Premier League Data Database Connection
Separate database for PL match data (scraped from FBRef)
"""
import os
from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy import MetaData
from app.core.config import settings

# Create separate metadata for PL data to avoid conflicts with main database
pl_metadata = MetaData()

# Import PL data models
# Note: If models are imported multiple times, we'll get a metadata conflict
# This is OK - the models are already defined and tables likely exist
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


# Track if tables have been created to avoid multiple calls
_pl_tables_created = False

def create_pl_db_and_tables():
    """Create all PL data database tables if they don't exist"""
    global _pl_tables_created
    
    # If already created in this process, skip
    if _pl_tables_created:
        return
    
    try:
        print("[PL DB] Creating PL database tables...")
        # Check if tables already exist in database
        from sqlalchemy import inspect
        inspector = inspect(pl_engine)
        existing_tables = inspector.get_table_names()
        
        # Only create tables if they don't exist
        expected_tables = ["teams", "players", "matches", "match_player_stats", "match_events", "lineups", "team_stats"]
        missing_tables = set(expected_tables) - set(existing_tables)
        
        if missing_tables:
            print(f"[PL DB] Creating missing tables: {missing_tables}")
            try:
                # Use reflect to get existing table definitions and extend_existing
                from sqlalchemy import MetaData
                metadata = MetaData()
                metadata.reflect(bind=pl_engine)
                # Now create with extend_existing
                SQLModel.metadata.create_all(pl_engine, checkfirst=True)
            except Exception as e:
                error_str = str(e)
                if "already defined" in error_str:
                    # Metadata conflict - this happens when models are imported multiple times
                    # The tables likely already exist in the database, so we can continue
                    print(f"[PL DB] Metadata conflict (this is OK if tables exist): {error_str[:200]}")
                    # Verify tables actually exist in database
                    inspector = inspect(pl_engine)
                    actual_tables = inspector.get_table_names()
                    if all(table in actual_tables for table in missing_tables):
                        print("[PL DB] All required tables exist in database despite metadata conflict")
                    else:
                        # Some tables are actually missing - this is a real problem
                        missing_in_db = set(missing_tables) - set(actual_tables)
                        if missing_in_db:
                            raise Exception(f"Tables missing in database: {missing_in_db}")
                elif "already exists" in error_str.lower():
                    # Table already exists in database - this is fine
                    print(f"[PL DB] Tables already exist: {error_str[:200]}")
                else:
                    # Real error, re-raise
                    raise
        else:
            print("[PL DB] All PL data tables already exist")
        
        _pl_tables_created = True
        print("[PL DB] PL database tables ready")
        
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

