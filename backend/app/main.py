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
    create_db_and_tables()
    yield
    # Shutdown
    await fpl_service.close()


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Fantasy Premier League companion platform",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware - allow all origins in development, specific origins in production
# For production, set FRONTEND_URL environment variable (e.g., https://your-app.vercel.app)
cors_origins = ["http://localhost:3000", "http://localhost:3001"]

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
    from app.core.database import get_session
    from sqlmodel import select
    from app.models.user import User
    
    try:
        # Get a session using the dependency
        session_gen = get_session()
        session = next(session_gen)
        
        # Test database connection with a simple query
        result = session.exec(select(User).limit(1)).first()
        
        return {
            "status": "healthy",
            "database": "connected",
            "message": "Database connection successful"
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
            "message": "Database connection failed"
        }
    finally:
        # Ensure session is closed
        try:
            next(session_gen, None)
        except (StopIteration, UnboundLocalError):
            pass

