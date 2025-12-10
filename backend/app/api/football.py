"""
Football API - General football data (fixtures, results, standings)
"""

from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any
from app.services.football_cache_service import football_cache_service

router = APIRouter(prefix="/football", tags=["Football"])


@router.get("/fixtures/today")
async def get_todays_fixtures(
    league_id: Optional[int] = Query(None, description="League ID (e.g., 39 for Premier League). If not provided, shows UK leagues only."),
    team_id: Optional[int] = Query(None, description="Team ID to filter"),
    force_refresh: bool = Query(False, description="Force refresh cache"),
    uk_only: bool = Query(True, description="Show UK leagues only (default: true)"),
) -> Dict[str, Any]:
    """
    Get today's football fixtures.
    By default, shows UK leagues only (Premier League, Championship, etc.).
    Cached for 5 minutes to reduce API calls.
    """
    # If no league_id specified and uk_only is True, fetch all UK leagues
    if league_id is None and uk_only:
        all_fixtures = []
        for uk_league_id in UK_LEAGUE_IDS:
            fixtures = await football_cache_service.get_todays_fixtures(uk_league_id, team_id, force_refresh)
            all_fixtures.extend(fixtures)
        
        # Remove duplicates (same fixture might appear in multiple calls)
        seen = set()
        unique_fixtures = []
        for fixture in all_fixtures:
            fixture_id = fixture.get('fixture', {}).get('id')
            if fixture_id and fixture_id not in seen:
                seen.add(fixture_id)
                unique_fixtures.append(fixture)
        
        return {
            'fixtures': unique_fixtures,
            'count': len(unique_fixtures),
            'cached': not force_refresh,
            'filter': 'UK leagues only',
        }
    else:
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
    uk_only: bool = Query(True, description="Show UK leagues only (default: true)"),
) -> Dict[str, Any]:
    """
    Get upcoming football fixtures.
    By default, shows UK leagues only (Premier League, Championship, etc.).
    Cached for 1 hour to reduce API calls.
    """
    # If no league_id specified and uk_only is True, fetch all UK leagues
    if league_id is None and uk_only:
        all_fixtures = []
        for uk_league_id in UK_LEAGUE_IDS:
            fixtures = await football_cache_service.get_upcoming_fixtures(days, uk_league_id, team_id, force_refresh)
            all_fixtures.extend(fixtures)
        
        # Remove duplicates and sort by date
        seen = set()
        unique_fixtures = []
        for fixture in all_fixtures:
            fixture_id = fixture.get('fixture', {}).get('id')
            if fixture_id and fixture_id not in seen:
                seen.add(fixture_id)
                unique_fixtures.append(fixture)
        
        # Sort by fixture date
        unique_fixtures.sort(key=lambda x: x.get('fixture', {}).get('date', ''))
        
        return {
            'fixtures': unique_fixtures,
            'count': len(unique_fixtures),
            'cached': not force_refresh,
            'filter': 'UK leagues only',
        }
    else:
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
    uk_only: bool = Query(True, description="Show UK leagues only (default: true)"),
) -> Dict[str, Any]:
    """
    Get recent match results.
    By default, shows UK leagues only (Premier League, Championship, etc.).
    Cached for 6 hours to reduce API calls.
    """
    # If no league_id specified and uk_only is True, fetch all UK leagues
    if league_id is None and uk_only:
        all_results = []
        for uk_league_id in UK_LEAGUE_IDS:
            results = await football_cache_service.get_recent_results(days, uk_league_id, team_id, force_refresh)
            all_results.extend(results)
        
        # Remove duplicates and sort by date (most recent first)
        seen = set()
        unique_results = []
        for result in all_results:
            fixture_id = result.get('fixture', {}).get('id')
            if fixture_id and fixture_id not in seen:
                seen.add(fixture_id)
                unique_results.append(result)
        
        # Sort by fixture date (most recent first)
        unique_results.sort(key=lambda x: x.get('fixture', {}).get('date', ''), reverse=True)
        
        return {
            'results': unique_results,
            'count': len(unique_results),
            'cached': not force_refresh,
            'filter': 'UK leagues only',
        }
    else:
        results = await football_cache_service.get_recent_results(days, league_id, team_id, force_refresh)
        return {
            'results': results,
            'count': len(results),
            'cached': not force_refresh,
        }


# League IDs reference (API-FOOTBALL)
LEAGUE_IDS = {
    # UK Leagues
    'premier_league': 39,
    'championship': 40,
    'league_one': 41,
    'league_two': 42,
    'fa_cup': 45,
    'league_cup': 48,
    'scottish_premiership': 179,
    'scottish_championship': 180,
    
    # Other leagues (for reference)
    'champions_league': 2,
    'europa_league': 3,
    'la_liga': 140,
    'bundesliga': 78,
    'serie_a': 135,
    'ligue_1': 61,
}

# UK League IDs to filter by default
UK_LEAGUE_IDS = [39, 40, 41, 42, 45, 48, 179, 180]  # Premier League, Championship, League One, League Two, FA Cup, League Cup, Scottish Premiership, Scottish Championship


@router.get("/leagues")
async def get_league_ids():
    """Get list of supported league IDs"""
    return {
        'leagues': LEAGUE_IDS,
        'uk_leagues': {k: v for k, v in LEAGUE_IDS.items() if v in UK_LEAGUE_IDS},
        'uk_league_ids': UK_LEAGUE_IDS,
        'note': 'These are API-FOOTBALL league IDs. Premier League = 39. By default, only UK leagues are shown.',
    }

