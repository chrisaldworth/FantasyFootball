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
if settings.FRONTEND_URL and settings.FRONTEND_URL.strip() and settings.FRONTEND_URL not in cors_origins:
    frontend_url = settings.FRONTEND_URL.strip().rstrip("/")
    cors_origins.append(frontend_url)
    
    # Also allow common Vercel patterns if FRONTEND_URL contains vercel.app
    if "vercel.app" in frontend_url.lower():
        # Allow both with and without trailing slash
        if not frontend_url.endswith("/"):
            cors_origins.append(frontend_url + "/")
        
        # Also allow the wildcard pattern for Vercel preview deployments
        # Extract base domain (e.g., fantasy-football-omega.vercel.app)
        try:
            from urllib.parse import urlparse
            parsed = urlparse(frontend_url)
            if parsed.netloc:
                base_domain = parsed.netloc
                cors_origins.append(f"https://{base_domain}")
        except:
            pass

print(f"[CORS] Allowing origins: {cors_origins}")

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
    return {"status": "healthy"}

