from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_db_and_tables
from app.api import api_router
from app.services.fpl_service import fpl_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        print("[App] Starting up...")
        create_db_and_tables()
        print("[App] Startup complete")
    except Exception as e:
        print(f"[App] ERROR during startup: {str(e)}")
        import traceback
        print(traceback.format_exc())
        # Don't raise - let the app start and log the error
        # The database might still be accessible even if table creation failed
    yield
    # Shutdown
    print("[App] Shutting down...")
    await fpl_service.close()
    print("[App] Shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Fantasy Premier League companion platform",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware - allow all origins in development, specific origins in production
# For production, set FRONTEND_URL environment variable (e.g., https://your-app.vercel.app)
cors_origins = ["http://localhost:3000", "http://localhost:3001"]

# Add iOS simulator and Capacitor app origins
# iOS simulator can access localhost, but also allow IP-based access
import socket
try:
    # Get local IP address for iOS simulator access
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    local_ip = s.getsockname()[0]
    s.close()
    
    # Add IP-based origins for iOS simulator and physical devices
    ip_origins = [
        f"http://{local_ip}:3000",
        f"http://{local_ip}:8080",
        f"capacitor://localhost",
        f"ionic://localhost",
        f"http://localhost",
        f"https://localhost",
    ]
    for origin in ip_origins:
        if origin not in cors_origins:
            cors_origins.append(origin)
    
    print(f"[CORS] Added local IP origins: {local_ip}")
except Exception as e:
    print(f"[CORS] Could not determine local IP: {e}")

# Add FRONTEND_URL if set and not empty
if settings.FRONTEND_URL and settings.FRONTEND_URL.strip():
    frontend_url = settings.FRONTEND_URL.strip().rstrip("/")
    
    # Normalize URL
    if not frontend_url.startswith("http"):
        frontend_url = f"https://{frontend_url}"
    
    if frontend_url not in cors_origins:
        cors_origins.append(frontend_url)
    
    # Also allow Vercel preview deployments (wildcard for *.vercel.app)
    if "vercel.app" in frontend_url.lower():
        # Allow both with and without trailing slash
        if not frontend_url.endswith("/"):
            if frontend_url + "/" not in cors_origins:
                cors_origins.append(frontend_url + "/")
        
        # For Vercel, also allow all subdomains (*.vercel.app pattern)
        # This handles preview deployments automatically
        try:
            from urllib.parse import urlparse
            parsed = urlparse(frontend_url)
            if parsed.netloc and "vercel.app" in parsed.netloc:
                # Allow main domain patterns
                base_pattern = parsed.netloc.split(".")[-2] + "." + parsed.netloc.split(".")[-1]
                # Note: FastAPI CORS doesn't support wildcards directly, but we can add common patterns
                # For now, just ensure main domain is included
                pass
        except Exception as e:
            print(f"[CORS] Error parsing URL: {e}")

# In development or if FRONTEND_URL is not set, allow all origins (less secure but works for dev)
# For production, always require FRONTEND_URL to be set
if settings.DEBUG and not settings.FRONTEND_URL:
    print("[CORS] WARNING: DEBUG mode and no FRONTEND_URL set - allowing all origins")
    cors_origins = ["*"]  # Allow all in debug mode if no FRONTEND_URL

print(f"[CORS] Allowing origins: {cors_origins}")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to FPL Companion API",
        "docs": "/docs",
        "version": "0.1.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/health/db")
async def health_check_db():
    """Health check with database connectivity test"""
    from app.core.database import get_session, engine
    from sqlmodel import select
    from app.models.user import User
    from sqlalchemy import inspect, text
    
    try:
        # Get a session using the dependency
        session_gen = get_session()
        session = next(session_gen)
        
        # Check if users table exists
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        table_exists = "users" in tables
        
        if not table_exists:
            return {
                "status": "unhealthy",
                "database": "connected",
                "tables": tables,
                "error": "users table does not exist",
                "message": "Database connected but 'users' table is missing"
            }
        
        # Get actual column information
        columns = inspector.get_columns("users")
        column_names = [col["name"] for col in columns]
        
        # Expected columns from User model
        expected_columns = [
            "id", "email", "hashed_password", "username", 
            "fpl_team_id", "fpl_email", "fpl_password_encrypted",
            "favorite_team_id", "is_active", "is_premium", 
            "created_at", "updated_at"
        ]
        
        missing_columns = set(expected_columns) - set(column_names)
        extra_columns = set(column_names) - set(expected_columns)
        
        # Test database connection with a simple query
        try:
            result = session.exec(select(User).limit(1)).first()
            query_works = True
        except Exception as query_error:
            query_works = False
            query_error_msg = str(query_error)
        
        if query_works:
            return {
                "status": "healthy",
                "database": "connected",
                "tables": tables,
                "columns": column_names,
                "expected_columns": expected_columns,
                "missing_columns": list(missing_columns) if missing_columns else None,
                "extra_columns": list(extra_columns) if extra_columns else None,
                "message": "Database connection successful"
            }
        else:
            return {
                "status": "unhealthy",
                "database": "connected",
                "tables": tables,
                "columns": column_names,
                "expected_columns": expected_columns,
                "missing_columns": list(missing_columns) if missing_columns else None,
                "extra_columns": list(extra_columns) if extra_columns else None,
                "query_error": query_error_msg,
                "message": "Database connected but query failed - schema mismatch likely"
            }
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[Health] Database check failed: {str(e)}")
        print(error_trace)
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "error_type": type(e).__name__,
            "message": "Database connection failed"
        }
    finally:
        # Ensure session is closed
        try:
            next(session_gen, None)
        except (StopIteration, UnboundLocalError, NameError):
            pass

