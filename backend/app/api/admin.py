"""
Admin API endpoints for data management
Includes endpoints for importing match data
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from typing import Optional
from pathlib import Path
import os

from app.core.security import get_current_admin_user
from app.models.user import User
from app.services.match_import_service import MatchImportService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/import-match-data")
async def import_match_data(
    season: str,
    data_dir: Optional[str] = None,
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
        
        # Import service
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
