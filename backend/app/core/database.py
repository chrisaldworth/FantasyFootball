import os
from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings

# Import all models to ensure tables are created
from app.models.user import User
from app.models.push_subscription import PushSubscription, NotificationLog
from app.models.weekly_picks import (
    WeeklyPick,
    ScorePrediction,
    PlayerPick,
    WeeklyPicksLeague,
    WeeklyPicksLeagueMember,
)

# Get database URL - prioritize environment variable
database_url = os.environ.get("DATABASE_URL") or settings.DATABASE_URL
database_url = database_url.strip() if database_url else ""

print(f"[DB] Raw DATABASE_URL length: {len(database_url)}")
print(f"[DB] Raw DATABASE_URL prefix: {database_url[:50] if len(database_url) > 50 else database_url}...")

# Fallback to SQLite if empty
if not database_url:
    print("[DB] WARNING: No DATABASE_URL set, using SQLite")
    database_url = "sqlite:///./fpl_companion.db"

# Convert postgres:// to postgresql:// (Render/Heroku use postgres://)
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# For psycopg2 driver with PostgreSQL (only if not already specified)
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg2://", 1)

print(f"[DB] Final URL prefix: {database_url[:60]}...")

# Create engine with appropriate connect_args
if "sqlite" in database_url:
    connect_args = {"check_same_thread": False}
    pool_args = {}
else:
    # PostgreSQL connection arguments
    # For Neon and other cloud PostgreSQL services, SSL is required
    connect_args = {
        "sslmode": "require",  # Require SSL for cloud databases
        "connect_timeout": 10,  # 10 second timeout
    }
    
    # Connection pooling settings for cloud databases
    # These help prevent connection drops and handle reconnections
    pool_args = {
        "pool_pre_ping": True,  # Verify connections before using them
        "pool_recycle": 300,    # Recycle connections after 5 minutes (Neon timeout is often 10 min)
        "pool_size": 5,         # Maintain 5 connections in the pool
        "max_overflow": 10,     # Allow up to 10 additional connections
        "pool_timeout": 30,     # Wait up to 30 seconds for a connection
    }

# Create engine with pooling for PostgreSQL
if "sqlite" in database_url:
    engine = create_engine(database_url, echo=settings.DEBUG, connect_args=connect_args)
else:
    engine = create_engine(
        database_url, 
        echo=settings.DEBUG, 
        connect_args=connect_args,
        **pool_args
    )


def create_db_and_tables():
    """Create all database tables if they don't exist"""
    try:
        print("[DB] Creating database tables...")
        SQLModel.metadata.create_all(engine)
        print("[DB] Database tables created successfully")
        
        # Verify tables exist and check schema
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"[DB] Existing tables: {tables}")
        
        if "users" not in tables:
            print("[DB] WARNING: 'users' table not found after creation attempt")
        else:
            print("[DB] 'users' table exists")
            # Check columns
            columns = inspector.get_columns("users")
            column_names = [col["name"] for col in columns]
            print(f"[DB] 'users' table columns: {column_names}")
            
            # Expected columns
            expected_columns = [
                "id", "email", "hashed_password", "username", 
                "fpl_team_id", "fpl_email", "fpl_password_encrypted",
                "favorite_team_id", "is_active", "is_premium", 
                "created_at", "updated_at"
            ]
            
            missing = set(expected_columns) - set(column_names)
            if missing:
                print(f"[DB] WARNING: Missing columns in 'users' table: {missing}")
                print("[DB] This may cause query errors. Consider running a migration.")
            
    except Exception as e:
        print(f"[DB] ERROR creating tables: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise


def get_session():
    """
    Get a database session with automatic retry on connection errors.
    Handles SSL connection drops by creating a new session.
    """
    try:
        with Session(engine) as session:
            yield session
    except Exception as e:
        # If connection fails, log and re-raise
        error_msg = str(e)
        if "SSL" in error_msg or "connection" in error_msg.lower():
            print(f"[DB] Connection error in session: {error_msg[:200]}")
            # Try to create a new session
            try:
                with Session(engine) as new_session:
                    yield new_session
            except Exception as retry_error:
                print(f"[DB] Retry also failed: {str(retry_error)[:200]}")
                raise
        else:
            raise

