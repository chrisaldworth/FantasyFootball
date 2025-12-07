from sqlmodel import create_engine, SQLModel, Session
from app.core.config import settings

# Get database URL and convert for SQLAlchemy compatibility
database_url = settings.DATABASE_URL

# Convert postgres:// to postgresql:// (Render/Heroku use postgres://)
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# For psycopg2 driver, convert postgresql:// to postgresql+psycopg2://
if database_url.startswith("postgresql://") and "+psycopg2" not in database_url:
    database_url = database_url.replace("postgresql://", "postgresql+psycopg2://", 1)

# Create engine
connect_args = {"check_same_thread": False} if "sqlite" in database_url else {}
engine = create_engine(database_url, echo=settings.DEBUG, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session

