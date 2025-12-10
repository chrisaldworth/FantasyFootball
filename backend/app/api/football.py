"""
Football API - General football data (fixtures, results, standings)
"""

from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any
from app.services.football_cache_service import football_cache_service

router = APIRouter(prefix="/football", tags=["Football"])


@router.get("/fixtures/today")
async def get_todays_fixtures(
    league_id: Optional[int] = Query(None, description="League ID (e.g., 39 for Premier League)"),
    team_id: Optional[int] = Query(None, description="Team ID to filter"),
    force_refresh: bool = Query(False, description="Force refresh cache"),
) -> Dict[str, Any]:
    """
    Get today's football fixtures.
    Cached for 5 minutes to reduce API calls.
    """
    fixtures = await football_cache_service.get_todays_fixtures(league_id, team_id, force_refresh)
    return {
        'fixtures': fixtures,
        'count': len(fixtures),
        'cached': not force_refresh,
    }


@router.get("/fixtures/upcoming")
async def get_upcoming_fixtures(
    days: int = Query(7, description="Number of days ahead to fetch"),
    league_id: Optional[int] = Query(None, description="League ID"),
    team_id: Optional[int] = Query(None, description="Team ID to filter"),
    force_refresh: bool = Query(False, description="Force refresh cache"),
) -> Dict[str, Any]:
    """
    Get upcoming football fixtures.
    Cached for 1 hour to reduce API calls.
    """
    fixtures = await football_cache_service.get_upcoming_fixtures(days, league_id, team_id, force_refresh)
    return {
        'fixtures': fixtures,
        'count': len(fixtures),
        'cached': not force_refresh,
    }


@router.get("/results/recent")
async def get_recent_results(
    days: int = Query(7, description="Number of days back to fetch"),
    league_id: Optional[int] = Query(None, description="League ID"),
    team_id: Optional[int] = Query(None, description="Team ID to filter"),
    force_refresh: bool = Query(False, description="Force refresh cache"),
) -> Dict[str, Any]:
    """
    Get recent match results.
    Cached for 6 hours to reduce API calls.
    """
    results = await football_cache_service.get_recent_results(days, league_id, team_id, force_refresh)
    return {
        'results': results,
        'count': len(results),
        'cached': not force_refresh,
    }


# League IDs reference (Premier League = 39)
LEAGUE_IDS = {
    'premier_league': 39,
    'champions_league': 2,
    'la_liga': 140,
    'bundesliga': 78,
    'serie_a': 135,
    'ligue_1': 61,
}


@router.get("/leagues")
async def get_league_ids():
    """Get list of supported league IDs"""
    return {
        'leagues': LEAGUE_IDS,
        'note': 'These are API-FOOTBALL league IDs. Premier League = 39',
    }

