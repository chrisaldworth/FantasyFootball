from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.fpl import router as fpl_router
from app.api.notifications import router as notifications_router
from app.api.fpl_account import router as fpl_account_router
from app.api.football import router as football_router

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router)
api_router.include_router(fpl_router)
api_router.include_router(notifications_router)
api_router.include_router(fpl_account_router)
api_router.include_router(football_router)

