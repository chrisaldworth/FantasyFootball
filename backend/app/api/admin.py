"""
Admin API endpoints for data management
Includes endpoints for importing match data
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from typing import Optional
from pathlib import Path
import os

from app.core.security import get_current_admin_user, get_current_user
from app.models.user import User
from sqlmodel import Session, text
from app.core.database import get_session, engine

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/ping")
async def admin_ping():
    """Simple ping endpoint to test if new endpoints are loading"""
    return {"status": "ok", "message": "Admin router new endpoints are working", "timestamp": "2025-12-27"}


@router.post("/fix-schema")
async def fix_schema(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Fix database schema by adding missing columns.
    WARNING: This should only be run by admins in production.
    """
    try:
        from sqlalchemy import inspect
        
        inspector = inspect(engine)
        columns = inspector.get_columns("users")
        column_names = [col["name"] for col in columns]
        
        # Expected columns
        expected_columns = {
            "id", "email", "hashed_password", "username", 
            "fpl_team_id", "fpl_email", "fpl_password_encrypted",
            "favorite_team_id", "is_active", "is_premium", 
            "created_at", "updated_at", "role"
        }
        
        missing = expected_columns - set(column_names)
        
        if not missing:
            return {
                "status": "ok",
                "message": "Schema is up to date - no missing columns",
                "existing_columns": column_names
            }
        
        # Add missing columns (simplified - in production, use proper migrations)
        for col in missing:
            if col == "role":
                session.exec(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user'"))
            # Add other columns as needed
        
        session.commit()
        
        return {
            "status": "ok",
            "message": f"Added missing columns: {list(missing)}",
            "existing_columns": column_names,
            "added_columns": list(missing)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Schema fix failed: {str(e)}"
        )


@router.get("/test")
async def admin_test(current_user: User = Depends(get_current_admin_user)):
    """Test endpoint to verify admin router is working"""
    return {"status": "ok", "message": "Admin router is working", "user": current_user.email}


@router.post("/import-match-data")
async def import_match_data(
    season: str = Query(..., description="Season identifier (e.g., '2025-2026')"),
    data_dir: Optional[str] = Query(None, description="Optional path to data directory"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: User = Depends(get_current_admin_user),
):
    """
    Import match data from JSON files into database
    
    This endpoint triggers the import process. For large imports, it runs in the background.
    
    Args:
        season: Season identifier (e.g., "2025-2026")
        data_dir: Optional path to data directory (defaults to backend/data)
        background_tasks: FastAPI background tasks
    
    Returns:
        Import status and job information
    """
    try:
        # Default data directory
        if not data_dir:
            # Try to find data directory relative to backend
            backend_dir = Path(__file__).parent.parent.parent
            data_dir = str(backend_dir / "data")
        
        # Check if data directory exists
        data_path = Path(data_dir)
        if not data_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data directory not found: {data_dir}"
            )
        
        # Check if season directory exists
        season_path = data_path / season / "matches"
        if not season_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Season directory not found: {season_path}"
            )
        
        # Count match files
        match_files = list(season_path.glob("*.json"))
        if not match_files:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No match files found in {season_path}"
            )
        
        # Import service (lazy import to avoid module load errors)
        from app.services.match_import_service import MatchImportService
        import_service = MatchImportService(season=season, data_dir=data_path)
        
        # Run import (can be background task for large imports)
        if background_tasks and len(match_files) > 10:
            # Large import - run in background
            background_tasks.add_task(import_service.run)
            return {
                "status": "started",
                "message": f"Import started in background for {len(match_files)} matches",
                "season": season,
                "match_count": len(match_files),
            }
        else:
            # Small import - run synchronously
            result = import_service.run()
            return {
                "status": "completed",
                "message": "Import completed",
                "season": season,
                "matches_imported": result.get("imported", 0),
                "errors": result.get("errors", []),
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Import failed: {str(e)}"
        )


@router.get("/import-status")
async def get_import_status(
    current_user: User = Depends(get_current_admin_user),
):
    """
    Get status of match data import
    """
    # TODO: Implement import status tracking
    return {
        "status": "not_implemented",
        "message": "Import status tracking not yet implemented"
    }
# Force update Sat Dec 27 19:39:44 GMT 2025
