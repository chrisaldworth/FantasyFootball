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

# Try to import match_data router - make it optional to avoid blocking API startup
try:
    from app.api.match_data import router as match_data_router
    match_data_router_available = True
except Exception as e:
    print(f"[API] Warning: Could not import match_data router: {e}")
    match_data_router_available = False
    match_data_router = None

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router)
api_router.include_router(fpl_router)
api_router.include_router(notifications_router)
api_router.include_router(fpl_account_router)
api_router.include_router(football_router)
api_router.include_router(admin_router)
api_router.include_router(admin_users_router)
api_router.include_router(admin_analytics_router)
api_router.include_router(weekly_picks_router)
if match_data_router_available and match_data_router:
    api_router.include_router(match_data_router)

