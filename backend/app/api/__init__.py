from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.fpl import router as fpl_router
from app.api.notifications import router as notifications_router
from app.api.fpl_account import router as fpl_account_router
from app.api.football import router as football_router
from app.api.admin import router as admin_router
from app.api.admin_users import router as admin_users_router
from app.api.admin_analytics import router as admin_analytics_router
from app.api.weekly_picks import router as weekly_picks_router
from app.api.followed_players import router as followed_players_router
from app.api.predictions import router as predictions_router

# Optional admin routers - make imports optional to avoid blocking startup
try:
    from app.api.admin_weekly_picks import router as admin_weekly_picks_router
    admin_weekly_picks_available = True
except ImportError:
    print("[API] admin_weekly_picks router not available, skipping")
    admin_weekly_picks_router = None
    admin_weekly_picks_available = False

try:
    from app.api.admin_leagues import router as admin_leagues_router
    admin_leagues_available = True
except ImportError:
    print("[API] admin_leagues router not available, skipping")
    admin_leagues_router = None
    admin_leagues_available = False

try:
    from app.api.admin_audit import router as admin_audit_router
    admin_audit_available = True
except ImportError:
    print("[API] admin_audit router not available, skipping")
    admin_audit_router = None
    admin_audit_available = False

# Import match_data router - always include it, errors will be handled at endpoint level
try:
    # Try importing pl_database first to see if there are connection issues
    try:
        from app.core.pl_database import get_pl_session
        print("[API] Successfully imported pl_database")
    except Exception as pl_db_error:
        print(f"[API] WARNING: pl_database import issue (may be OK if DB not configured): {pl_db_error}")
    
    from app.api.match_data import router as match_data_router
    print("[API] Successfully imported match_data router")
except Exception as e:
    print(f"[API] ERROR: Could not import match_data router: {e}")
    import traceback
    print(traceback.format_exc())
    # Create a dummy router that returns 503 errors for all endpoints
    from fastapi import APIRouter, HTTPException, status
    match_data_router = APIRouter(prefix="/match-data", tags=["Match Data"])
    
    @match_data_router.get("/{path:path}")
    async def match_data_unavailable():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Match data service is currently unavailable. The database may not be configured or accessible. Please check server logs."
        )

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router)
api_router.include_router(fpl_router)
api_router.include_router(notifications_router)
api_router.include_router(fpl_account_router)
api_router.include_router(football_router)
api_router.include_router(admin_router)
api_router.include_router(admin_users_router)
api_router.include_router(admin_analytics_router)
if admin_weekly_picks_available and admin_weekly_picks_router:
    api_router.include_router(admin_weekly_picks_router)
if admin_leagues_available and admin_leagues_router:
    api_router.include_router(admin_leagues_router)
if admin_audit_available and admin_audit_router:
    api_router.include_router(admin_audit_router)
api_router.include_router(weekly_picks_router)
api_router.include_router(followed_players_router)
api_router.include_router(predictions_router)
# Always include match_data router (even if import failed, it will return 503)
api_router.include_router(match_data_router)

