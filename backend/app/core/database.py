import os
from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings

# Import all models to ensure tables are created
from app.models.user import User
from app.models.push_subscription import PushSubscription, NotificationLog

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
else:
    connect_args = {}

engine = create_engine(database_url, echo=settings.DEBUG, connect_args=connect_args)


def create_db_and_tables():
    """Create all database tables if they don't exist"""
    try:
        print("[DB] Creating database tables...")
        SQLModel.metadata.create_all(engine)
        print("[DB] Database tables created successfully")
        
        # Verify tables exist
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"[DB] Existing tables: {tables}")
        
        if "users" not in tables:
            print("[DB] WARNING: 'users' table not found after creation attempt")
        else:
            print("[DB] 'users' table exists")
            
    except Exception as e:
        print(f"[DB] ERROR creating tables: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise


def get_session():
    with Session(engine) as session:
        yield session

