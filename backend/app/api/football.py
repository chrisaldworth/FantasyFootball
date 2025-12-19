"""
Football API - General football data (fixtures, results, standings)
Uses FPL API as the primary data source
"""

from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from app.services.fpl_service import fpl_service
from app.services.news_service import news_service

router = APIRouter(prefix="/football", tags=["Football"])


def _format_fpl_fixture_to_standard(fpl_fixture: Dict[str, Any], teams_map: Dict[int, Dict]) -> Dict[str, Any]:
    """Convert FPL fixture format to standard format expected by frontend"""
    home_team_id = fpl_fixture.get('team_h')
    away_team_id = fpl_fixture.get('team_a')
    home_team = teams_map.get(home_team_id, {})
    away_team = teams_map.get(away_team_id, {})
    
    kickoff_time = fpl_fixture.get('kickoff_time')
    fixture_date = kickoff_time if kickoff_time else None
    
    # Determine status
    finished = fpl_fixture.get('finished', False)
    started = fpl_fixture.get('started', False)
    
    if finished:
        status_long = 'Match Finished'
        status_short = 'FT'
    elif started:
        status_long = 'In Progress'
        status_short = 'LIVE'
    else:
        status_long = 'Not Started'
        status_short = 'NS'
    
    return {
        'fixture': {
            'id': fpl_fixture.get('id'),
            'date': fixture_date,
            'status': {
                'long': status_long,
                'short': status_short,
                'elapsed': fpl_fixture.get('minutes') if started else None,
            },
            'venue': {
                'name': None,  # FPL doesn't provide venue info
            },
        },
        'league': {
            'id': 39,  # Premier League
            'name': 'Premier League',
        },
        'teams': {
            'home': {
                'id': home_team_id,
                'name': home_team.get('name', 'Unknown'),
            },
            'away': {
                'id': away_team_id,
                'name': away_team.get('name', 'Unknown'),
            },
        },
        'goals': {
            'home': fpl_fixture.get('team_h_score') if finished else None,
            'away': fpl_fixture.get('team_a_score') if finished else None,
        },
    }


async def _get_fpl_teams_map() -> Dict[int, Dict]:
    """Get FPL teams as a map by team ID"""
    fpl_data = await fpl_service.get_bootstrap_static()
    teams_map = {}
    for team in fpl_data.get('teams', []):
        teams_map[team['id']] = team
    return teams_map


@router.get("/fixtures/today")
async def get_todays_fixtures(
    team_id: Optional[int] = Query(None, description="FPL Team ID to filter (optional - returns all if not provided)"),
) -> Dict[str, Any]:
    """
    Get today's Premier League fixtures from FPL API.
    Returns ALL fixtures for today if no team_id is provided.
    """
    try:
        today = datetime.now().date()
        today_str = today.strftime('%Y-%m-%d')
        
        print(f"[Football API] Fetching today's fixtures from FPL API for {today_str}")
        if team_id:
            print(f"[Football API] Filtering for team_id: {team_id}")
        else:
            print(f"[Football API] Returning ALL fixtures for today")
        
        # Get all fixtures from FPL
        fpl_fixtures = await fpl_service.get_fixtures()
        teams_map = await _get_fpl_teams_map()
        
        # Filter for today's fixtures
        today_fixtures = []
        for fpl_fixture in fpl_fixtures:
            kickoff_time = fpl_fixture.get('kickoff_time')
            if not kickoff_time:
                continue
            
            # Parse date from kickoff_time (format: "2024-01-15T15:00:00Z")
            try:
                fixture_date = datetime.fromisoformat(kickoff_time.replace('Z', '+00:00')).date()
            except:
                continue
            
            # Check if it's today
            if fixture_date == today:
                # Filter by team_id if provided
                if team_id:
                    if fpl_fixture.get('team_h') != team_id and fpl_fixture.get('team_a') != team_id:
                        continue
                
                formatted_fixture = _format_fpl_fixture_to_standard(fpl_fixture, teams_map)
                today_fixtures.append(formatted_fixture)
        
        print(f"[Football API] Found {len(today_fixtures)} fixtures for today")
        
        return {
            'fixtures': today_fixtures,
            'count': len(today_fixtures),
            'source': 'FPL API (Premier League)',
        }
    except Exception as e:
        import traceback
        print(f"[Football API] Error in get_todays_fixtures: {e}")
        print(traceback.format_exc())
        return {
            'fixtures': [],
            'count': 0,
            'error': str(e),
        }


@router.get("/fixtures/upcoming")
async def get_upcoming_fixtures(
    days: int = Query(7, description="Number of days ahead to fetch"),
    team_id: Optional[int] = Query(None, description="FPL Team ID to filter (optional - returns all if not provided)"),
) -> Dict[str, Any]:
    """
    Get upcoming fixtures from Premier League (FPL API).
    Returns ALL upcoming fixtures if no team_id is provided.
    Also includes Champions League, FA Cup, and League Cup if API-FOOTBALL key is configured.
    """
    try:
        today = datetime.now().date()
        end_date = today + timedelta(days=days)
        
        print(f"[Football API] Fetching upcoming fixtures for next {days} days")
        if team_id:
            print(f"[Football API] Filtering for team_id: {team_id}")
        else:
            print(f"[Football API] Returning ALL upcoming fixtures")
        
        # Get FPL team name if filtering by team_id
        team_name = None
        if team_id:
            teams_map = await _get_fpl_teams_map()
            fpl_team = teams_map.get(team_id)
            if fpl_team:
                team_name = fpl_team.get('name')
                print(f"[Football API] Filtering for team: {team_name} (FPL ID: {team_id})")
        
        upcoming_fixtures = []
        
        # 1. Get ALL Premier League fixtures from FPL API
        print(f"[Football API] Fetching ALL Premier League fixtures from FPL API")
        fpl_fixtures = await fpl_service.get_fixtures()
        teams_map = await _get_fpl_teams_map()
        
        for fpl_fixture in fpl_fixtures:
            kickoff_time = fpl_fixture.get('kickoff_time')
            if not kickoff_time:
                continue
            
            try:
                fixture_date = datetime.fromisoformat(kickoff_time.replace('Z', '+00:00')).date()
            except:
                continue
            
            # Include all upcoming fixtures (not finished, in date range)
            if today <= fixture_date <= end_date and not fpl_fixture.get('finished', False):
                # Filter by team_id if provided
                if team_id:
                    if fpl_fixture.get('team_h') != team_id and fpl_fixture.get('team_a') != team_id:
                        continue
                
                formatted_fixture = _format_fpl_fixture_to_standard(fpl_fixture, teams_map)
                upcoming_fixtures.append(formatted_fixture)
        
        # 2. Get Champions League, FA Cup, and League Cup fixtures from API-FOOTBALL (if configured)
        from app.services.football_api_service import football_api_service
        
        if football_api_service.api_football_key:
            competitions = [
                (2, 'Champions League'),
                (45, 'FA Cup'),
                (48, 'League Cup'),
            ]
            
            for league_id, league_name in competitions:
                try:
                    print(f"[Football API] Fetching {league_name} fixtures (league_id: {league_id})")
                    api_fixtures = await football_api_service.get_upcoming_fixtures(
                        days=days,
                        league_id=league_id,
                        team_id=None  # We'll filter by name instead
                    )
                    
                    # Filter by team name if provided, otherwise include all
                    for api_fixture in api_fixtures:
                        if team_name:
                            home_name = api_fixture.get('teams', {}).get('home', {}).get('name', '')
                            away_name = api_fixture.get('teams', {}).get('away', {}).get('name', '')
                            
                            # Normalize names for matching
                            normalized_team = _normalize_team_name(team_name)
                            normalized_home = _normalize_team_name(home_name)
                            normalized_away = _normalize_team_name(away_name)
                            
                            # Check if team matches
                            if (normalized_team not in normalized_home and 
                                normalized_team not in normalized_away and
                                team_name.lower() not in home_name.lower() and
                                team_name.lower() not in away_name.lower()):
                                continue
                        
                        # Format and add to fixtures
                        formatted = _format_api_football_fixture(api_fixture)
                        upcoming_fixtures.append(formatted)
                        
                except Exception as e:
                    print(f"[Football API] Error fetching {league_name} fixtures: {e}")
                    continue
        
        # 3. Get UK league fixtures from Football-Data.org (if configured)
        if football_api_service.football_data_key:
            uk_competitions = [
                (2016, 'Championship'),
                (2017, 'League One'),
                (2018, 'League Two'),
                (2019, 'Scottish Premiership'),
            ]
            
            for league_id, league_name in uk_competitions:
                try:
                    print(f"[Football API] Fetching {league_name} fixtures (league_id: {league_id})")
                    uk_fixtures = await football_api_service.get_upcoming_fixtures(
                        days=days,
                        league_id=league_id,
                        team_id=None  # We'll filter by name instead
                    )
                    
                    # Filter by team name if provided, otherwise include all
                    for uk_fixture in uk_fixtures:
                        if team_name:
                            home_name = uk_fixture.get('teams', {}).get('home', {}).get('name', '')
                            away_name = uk_fixture.get('teams', {}).get('away', {}).get('name', '')
                            
                            # Normalize names for matching
                            normalized_team = _normalize_team_name(team_name)
                            normalized_home = _normalize_team_name(home_name)
                            normalized_away = _normalize_team_name(away_name)
                            
                            # Check if team matches
                            if (normalized_team not in normalized_home and 
                                normalized_team not in normalized_away and
                                team_name.lower() not in home_name.lower() and
                                team_name.lower() not in away_name.lower()):
                                continue
                        
                        # Fixtures are already in standardized format from service
                        upcoming_fixtures.append(uk_fixture)
                        
                except Exception as e:
                    print(f"[Football API] Error fetching {league_name} fixtures: {e}")
                    continue
        
        # Sort by fixture date
        upcoming_fixtures.sort(key=lambda x: x.get('fixture', {}).get('date', ''))
        
        print(f"[Football API] Found {len(upcoming_fixtures)} total upcoming fixtures")
        
        source_parts = ['FPL API (Premier League)']
        if football_api_service.api_football_key:
            source_parts.append('API-FOOTBALL')
        if football_api_service.football_data_key:
            source_parts.append('Football-Data.org')
        
        return {
            'fixtures': upcoming_fixtures,
            'count': len(upcoming_fixtures),
            'source': ' + '.join(source_parts),
        }
    except Exception as e:
        import traceback
        print(f"[Football API] Error in get_upcoming_fixtures: {e}")
        print(traceback.format_exc())
        return {
            'fixtures': [],
            'count': 0,
            'error': str(e),
        }


def _normalize_team_name(name: str) -> str:
    """Normalize team name for matching (remove common suffixes, lowercase)"""
    if not name:
        return ""
    name = name.lower().strip()
    # Remove common suffixes that might differ between APIs
    suffixes = [' fc', ' football club', ' united', ' city', ' town', ' rovers', ' wanderers']
    for suffix in suffixes:
        if name.endswith(suffix):
            name = name[:-len(suffix)]
    return name.strip()


def _format_api_football_fixture(api_fixture: Dict[str, Any]) -> Dict[str, Any]:
    """Convert API-FOOTBALL fixture format to standard format"""
    fixture_data = api_fixture.get('fixture', {})
    teams_data = api_fixture.get('teams', {})
    goals_data = api_fixture.get('goals', {})
    league_data = api_fixture.get('league', {})
    
    return {
        'fixture': {
            'id': fixture_data.get('id'),
            'date': fixture_data.get('date'),
            'status': {
                'long': fixture_data.get('status', {}).get('long', ''),
                'short': fixture_data.get('status', {}).get('short', ''),
                'elapsed': fixture_data.get('status', {}).get('elapsed'),
            },
            'venue': {
                'name': fixture_data.get('venue', {}).get('name'),
            },
        },
        'league': {
            'id': league_data.get('id'),
            'name': league_data.get('name', 'Unknown'),
        },
        'teams': {
            'home': {
                'id': teams_data.get('home', {}).get('id'),
                'name': teams_data.get('home', {}).get('name', 'Unknown'),
            },
            'away': {
                'id': teams_data.get('away', {}).get('id'),
                'name': teams_data.get('away', {}).get('name', 'Unknown'),
            },
        },
        'goals': {
            'home': goals_data.get('home'),
            'away': goals_data.get('away'),
        },
    }


@router.get("/results/recent")
async def get_recent_results(
    days: int = Query(7, description="Number of days back to fetch"),
    team_id: Optional[int] = Query(None, description="FPL Team ID to filter (optional - returns all if not provided)"),
) -> Dict[str, Any]:
    """
    Get recent match results from Premier League (FPL API).
    Returns ALL recent results if no team_id is provided.
    Also includes Champions League, FA Cup, and League Cup if API-FOOTBALL key is configured.
    """
    try:
        today = datetime.now().date()
        start_date = today - timedelta(days=days)
        
        print(f"[Football API] Fetching recent results for last {days} days")
        if team_id:
            print(f"[Football API] Filtering for team_id: {team_id}")
        else:
            print(f"[Football API] Returning ALL recent results")
        
        # Get FPL team name if filtering by team_id
        team_name = None
        if team_id:
            teams_map = await _get_fpl_teams_map()
            fpl_team = teams_map.get(team_id)
            if fpl_team:
                team_name = fpl_team.get('name')
                print(f"[Football API] Filtering for team: {team_name} (FPL ID: {team_id})")
        
        recent_results = []
        
        # 1. Get ALL Premier League results from FPL API
        print(f"[Football API] Fetching ALL Premier League results from FPL API")
        fpl_fixtures = await fpl_service.get_fixtures()
        teams_map = await _get_fpl_teams_map()
        
        for fpl_fixture in fpl_fixtures:
            if not fpl_fixture.get('finished', False):
                continue
            
            kickoff_time = fpl_fixture.get('kickoff_time')
            if not kickoff_time:
                continue
            
            try:
                fixture_date = datetime.fromisoformat(kickoff_time.replace('Z', '+00:00')).date()
            except:
                continue
            
            # Include all finished fixtures in the date range
            if start_date <= fixture_date <= today:
                # Filter by team_id if provided
                if team_id:
                    if fpl_fixture.get('team_h') != team_id and fpl_fixture.get('team_a') != team_id:
                        continue
                
                formatted_fixture = _format_fpl_fixture_to_standard(fpl_fixture, teams_map)
                recent_results.append(formatted_fixture)
        
        # 2. Get Champions League, FA Cup, and League Cup results from API-FOOTBALL (if configured)
        from app.services.football_api_service import football_api_service
        
        if football_api_service.api_football_key:
            competitions = [
                (2, 'Champions League'),
                (45, 'FA Cup'),
                (48, 'League Cup'),
            ]
            
            for league_id, league_name in competitions:
                try:
                    print(f"[Football API] Fetching {league_name} results (league_id: {league_id})")
                    api_results = await football_api_service.get_recent_results(
                        days=days,
                        league_id=league_id,
                        team_id=None  # We'll filter by name instead
                    )
                    
                    # Filter by team name if provided, otherwise include all
                    for api_fixture in api_results:
                        if team_name:
                            home_name = api_fixture.get('teams', {}).get('home', {}).get('name', '')
                            away_name = api_fixture.get('teams', {}).get('away', {}).get('name', '')
                            
                            # Normalize names for matching
                            normalized_team = _normalize_team_name(team_name)
                            normalized_home = _normalize_team_name(home_name)
                            normalized_away = _normalize_team_name(away_name)
                            
                            # Check if team matches (exact or normalized)
                            if (normalized_team not in normalized_home and 
                                normalized_team not in normalized_away and
                                team_name.lower() not in home_name.lower() and
                                team_name.lower() not in away_name.lower()):
                                continue
                        
                        # Format and add to results
                        formatted = _format_api_football_fixture(api_fixture)
                        recent_results.append(formatted)
                        
                except Exception as e:
                    print(f"[Football API] Error fetching {league_name} results: {e}")
                    # Continue with other competitions even if one fails
                    continue
        
        # 3. Get UK league results from Football-Data.org (if configured)
        if football_api_service.football_data_key:
            uk_competitions = [
                (2016, 'Championship'),
                (2017, 'League One'),
                (2018, 'League Two'),
                (2019, 'Scottish Premiership'),
            ]
            
            for league_id, league_name in uk_competitions:
                try:
                    print(f"[Football API] Fetching {league_name} results (league_id: {league_id})")
                    uk_results = await football_api_service.get_recent_results(
                        days=days,
                        league_id=league_id,
                        team_id=None  # We'll filter by name instead
                    )
                    
                    # Filter by team name if provided, otherwise include all
                    for uk_result in uk_results:
                        if team_name:
                            home_name = uk_result.get('teams', {}).get('home', {}).get('name', '')
                            away_name = uk_result.get('teams', {}).get('away', {}).get('name', '')
                            
                            # Normalize names for matching
                            normalized_team = _normalize_team_name(team_name)
                            normalized_home = _normalize_team_name(home_name)
                            normalized_away = _normalize_team_name(away_name)
                            
                            # Check if team matches
                            if (normalized_team not in normalized_home and 
                                normalized_team not in normalized_away and
                                team_name.lower() not in home_name.lower() and
                                team_name.lower() not in away_name.lower()):
                                continue
                        
                        # Results are already in standardized format from service
                        recent_results.append(uk_result)
                        
                except Exception as e:
                    print(f"[Football API] Error fetching {league_name} results: {e}")
                    continue
        
        # Sort by fixture date (most recent first)
        recent_results.sort(key=lambda x: x.get('fixture', {}).get('date', ''), reverse=True)
        
        print(f"[Football API] Found {len(recent_results)} total recent results")
        
        source_parts = ['FPL API (Premier League)']
        if football_api_service.api_football_key:
            source_parts.append('API-FOOTBALL')
        if football_api_service.football_data_key:
            source_parts.append('Football-Data.org')
        
        return {
            'results': recent_results,
            'count': len(recent_results),
            'source': ' + '.join(source_parts),
        }
    except Exception as e:
        import traceback
        print(f"[Football API] Error in get_recent_results: {e}")
        print(traceback.format_exc())
        return {
            'results': [],
            'count': 0,
            'error': str(e),
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

# UK League IDs
UK_LEAGUE_IDS = [39, 40, 41, 42, 45, 48, 179, 180]  # Premier League, Championship, League One, League Two, FA Cup, League Cup, Scottish Premiership, Scottish Championship

# European Competition IDs
EUROPEAN_COMPETITION_IDS = [2, 3]  # Champions League, Europa League

# UK + European leagues to filter by default
UK_AND_EUROPEAN_IDS = UK_LEAGUE_IDS + EUROPEAN_COMPETITION_IDS


@router.get("/fixtures/all")
async def get_all_fixtures(
    team_id: Optional[int] = Query(None, description="FPL Team ID to filter (optional - returns all if not provided)"),
) -> Dict[str, Any]:
    """
    Get ALL Premier League fixtures for the season from FPL API.
    Includes both past (results) and future (upcoming) fixtures.
    Returns ALL fixtures if no team_id is provided.
    """
    try:
        print(f"[Football API] Fetching ALL Premier League fixtures from FPL API")
        if team_id:
            print(f"[Football API] Filtering for team_id: {team_id}")
        else:
            print(f"[Football API] Returning ALL fixtures for the season")
        
        # Get all fixtures from FPL
        fpl_fixtures = await fpl_service.get_fixtures()
        teams_map = await _get_fpl_teams_map()
        
        all_fixtures = []
        for fpl_fixture in fpl_fixtures:
            # Filter by team_id if provided
            if team_id:
                if fpl_fixture.get('team_h') != team_id and fpl_fixture.get('team_a') != team_id:
                    continue
            
            formatted_fixture = _format_fpl_fixture_to_standard(fpl_fixture, teams_map)
            all_fixtures.append(formatted_fixture)
        
        # Sort by fixture date
        all_fixtures.sort(key=lambda x: x.get('fixture', {}).get('date', ''))
        
        # Separate into past and future
        today = datetime.now().date()
        past_fixtures = []
        future_fixtures = []
        
        for fixture in all_fixtures:
            fixture_date_str = fixture.get('fixture', {}).get('date')
            if fixture_date_str:
                try:
                    fixture_date = datetime.fromisoformat(fixture_date_str.replace('Z', '+00:00')).date()
                    if fixture_date < today:
                        past_fixtures.append(fixture)
                    elif fixture_date >= today:
                        future_fixtures.append(fixture)
                except:
                    # If date parsing fails, check status
                    if fixture.get('fixture', {}).get('status', {}).get('long') == 'Match Finished':
                        past_fixtures.append(fixture)
                    else:
                        future_fixtures.append(fixture)
        
        print(f"[Football API] Found {len(all_fixtures)} total fixtures ({len(past_fixtures)} past, {len(future_fixtures)} future)")
        
        return {
            'fixtures': all_fixtures,
            'past': past_fixtures,
            'future': future_fixtures,
            'count': len(all_fixtures),
            'past_count': len(past_fixtures),
            'future_count': len(future_fixtures),
            'source': 'FPL API (Premier League)',
        }
    except Exception as e:
        import traceback
        print(f"[Football API] Error in get_all_fixtures: {e}")
        print(traceback.format_exc())
        return {
            'fixtures': [],
            'past': [],
            'future': [],
            'count': 0,
            'error': str(e),
        }


@router.get("/head-to-head")
async def get_head_to_head(
    team1_id: int = Query(..., description="FPL Team ID for first team"),
    team2_id: int = Query(..., description="FPL Team ID for second team"),
    last: int = Query(10, description="Number of recent matches to return"),
) -> Dict[str, Any]:
    """
    Get head-to-head matches between two teams.
    Uses API-FOOTBALL for historical data if available, otherwise falls back to FPL API (current season only).
    """
    try:
        from app.services.football_api_service import football_api_service
        
        # Get team names from FPL API
        teams_map = await _get_fpl_teams_map()
        team1 = teams_map.get(team1_id)
        team2 = teams_map.get(team2_id)
        
        if not team1 or not team2:
            return {
                'matches': [],
                'count': 0,
                'error': 'One or both teams not found',
            }
        
        team1_name = team1.get('name', '')
        team2_name = team2.get('name', '')
        
        print(f"[Football API] Fetching head-to-head: {team1_name} vs {team2_name}")
        
        # Try API-FOOTBALL first (has historical data)
        if football_api_service.api_football_key:
            try:
                # Get API-FOOTBALL team IDs by searching for teams
                # API-FOOTBALL team IDs are different from FPL IDs, so we search by name
                api_teams_response = await football_api_service.client.get(
                    f"{football_api_service.api_football_base}/teams",
                    params={'search': team1_name, 'league': 39},  # Premier League
                    headers={
                        'X-RapidAPI-Key': football_api_service.api_football_key,
                        'X-RapidAPI-Host': 'v3.football.api-sports.io',
                    }
                )
                api_teams_response.raise_for_status()
                api_teams_data = api_teams_response.json()
                api_team1_list = api_teams_data.get('response', [])
                
                api_teams_response2 = await football_api_service.client.get(
                    f"{football_api_service.api_football_base}/teams",
                    params={'search': team2_name, 'league': 39},
                    headers={
                        'X-RapidAPI-Key': football_api_service.api_football_key,
                        'X-RapidAPI-Host': 'v3.football.api-sports.io',
                    }
                )
                api_teams_response2.raise_for_status()
                api_teams_data2 = api_teams_response2.json()
                api_team2_list = api_teams_data2.get('response', [])
                
                if api_team1_list and api_team2_list:
                    api_team1_id = api_team1_list[0]['team']['id']
                    api_team2_id = api_team2_list[0]['team']['id']
                    
                    print(f"[Football API] Found API-FOOTBALL IDs: {api_team1_id} vs {api_team2_id}")
                    
                    # Get head-to-head from API-FOOTBALL
                    h2h_matches = await football_api_service.get_head_to_head(
                        api_team1_id, api_team2_id, last
                    )
                    
                    # Format matches
                    formatted_matches = []
                    for match in h2h_matches:
                        fixture = match.get('fixture', {})
                        teams = match.get('teams', {})
                        goals = match.get('goals', {})
                        league = match.get('league', {})
                        
                        formatted_matches.append({
                            'date': fixture.get('date', ''),
                            'homeTeam': teams.get('home', {}).get('name', ''),
                            'awayTeam': teams.get('away', {}).get('name', ''),
                            'homeScore': goals.get('home'),
                            'awayScore': goals.get('away'),
                            'competition': league.get('name', 'Premier League'),
                            'status': fixture.get('status', {}).get('short', 'FT'),
                        })
                    
                    print(f"[Football API] Found {len(formatted_matches)} head-to-head matches from API-FOOTBALL")
                    
                    return {
                        'matches': formatted_matches,
                        'count': len(formatted_matches),
                        'source': 'API-FOOTBALL',
                    }
            except Exception as e:
                print(f"[Football API] Error fetching from API-FOOTBALL: {e}")
                # Fall through to FPL API
        
        # Fallback to FPL API (current season only)
        print(f"[Football API] Using FPL API for head-to-head (current season only)")
        fpl_fixtures = await fpl_service.get_fixtures()
        teams_map = await _get_fpl_teams_map()
        
        h2h_matches = []
        for fpl_fixture in fpl_fixtures:
            home_id = fpl_fixture.get('team_h')
            away_id = fpl_fixture.get('team_a')
            
            # Check if this is a match between the two teams
            if ((home_id == team1_id and away_id == team2_id) or
                (home_id == team2_id and away_id == team1_id)):
                
                if fpl_fixture.get('finished', False):
                    formatted = _format_fpl_fixture_to_standard(fpl_fixture, teams_map)
                    h2h_matches.append({
                        'date': formatted.get('fixture', {}).get('date', ''),
                        'homeTeam': formatted.get('teams', {}).get('home', {}).get('name', ''),
                        'awayTeam': formatted.get('teams', {}).get('away', {}).get('name', ''),
                        'homeScore': formatted.get('goals', {}).get('home'),
                        'awayScore': formatted.get('goals', {}).get('away'),
                        'competition': 'Premier League',
                        'status': 'FT',
                    })
        
        # Sort by date (most recent first) and limit
        h2h_matches.sort(key=lambda x: x.get('date', ''), reverse=True)
        h2h_matches = h2h_matches[:last]
        
        return {
            'matches': h2h_matches,
            'count': len(h2h_matches),
            'source': 'FPL API (current season only)',
        }
    except Exception as e:
        import traceback
        print(f"[Football API] Error in get_head_to_head: {e}")
        print(traceback.format_exc())
        return {
            'matches': [],
            'count': 0,
            'error': str(e),
        }


@router.get("/match/{fixture_id}")
async def get_match_details(
    fixture_id: int,
    force_refresh: bool = Query(False, description="Force refresh cache"),
) -> Dict[str, Any]:
    """
    Get detailed information about a specific match:
    - Events (goals, cards, substitutions)
    - Lineups
    - Statistics
    """
    # For match details, we'll fetch fresh each time (or cache very briefly)
    # since users want up-to-date information
    from app.services.football_api_service import football_api_service
    details = await football_api_service.get_match_details(fixture_id)
    return {
        'fixture_id': fixture_id,
        'events': details.get('events', []),
        'lineups': details.get('lineups', []),
        'statistics': details.get('statistics', []),
    }


@router.get("/test")
async def test_football_api():
    """
    Test endpoint to check if API keys are configured and working
    """
    from app.services.football_api_service import football_api_service
    from datetime import datetime
    import httpx
    
    result = {
        'api_football_key_configured': bool(football_api_service.api_football_key),
        'football_data_key_configured': bool(football_api_service.football_data_key),
        'api_source': 'api-football' if football_api_service.api_football_key else ('football-data' if football_api_service.football_data_key else 'none'),
        'test_date': datetime.now().strftime('%Y-%m-%d'),
    }
    
    # Try to fetch today's fixtures for Premier League as a test
    if football_api_service.api_football_key:
        try:
            # First, test the leagues endpoint to verify league IDs
            try:
                leagues_response = await football_api_service.client.get(
                    f"{football_api_service.api_football_base}/leagues",
                    params={'id': 3},  # Test Europa League ID
                    headers={
                        'X-RapidAPI-Key': football_api_service.api_football_key,
                        'X-RapidAPI-Host': 'v3.football.api-sports.io',
                    }
                )
                leagues_data = leagues_response.json()
                result['europa_league_info'] = leagues_data.get('response', [])[:1] if leagues_data.get('response') else None
            except Exception as e:
                result['league_info_error'] = str(e)
            
            # Test today's fixtures (Premier League only)
            test_fixtures = await football_api_service.get_todays_fixtures(league_id=39)  # Premier League
            result['test_fetch_success'] = True
            result['today_fixture_count'] = len(test_fixtures)
            
            # Test upcoming fixtures (all UK leagues)
            upcoming_fixtures = await football_api_service.get_upcoming_fixtures(days=7)
            result['upcoming_fixture_count'] = len(upcoming_fixtures)
            
            # Test all UK leagues for today
            all_uk_fixtures = []
            for league_id in UK_AND_EUROPEAN_IDS[:3]:  # Test first 3 leagues
                fixtures = await football_api_service.get_todays_fixtures(league_id=league_id)
                all_uk_fixtures.extend(fixtures)
            result['all_uk_today_count'] = len(all_uk_fixtures)
            
            # Specifically test European competitions - try without date filter first
            print(f"[Test] Testing Champions League (ID: 2)")
            champions_league_fixtures = await football_api_service.get_todays_fixtures(league_id=2)
            result['champions_league_today'] = len(champions_league_fixtures)
            
            print(f"[Test] Testing Europa League (ID: 3)")
            europa_league_fixtures = await football_api_service.get_todays_fixtures(league_id=3)
            result['europa_league_today'] = len(europa_league_fixtures)
            
            # Test upcoming European fixtures
            champions_league_upcoming = await football_api_service.get_upcoming_fixtures(days=7, league_id=2)
            europa_league_upcoming = await football_api_service.get_upcoming_fixtures(days=7, league_id=3)
            result['champions_league_upcoming'] = len(champions_league_upcoming)
            result['europa_league_upcoming'] = len(europa_league_upcoming)
            
            # Try fetching without date filter to see if there are any fixtures at all
            # API-FOOTBALL uses 'next' parameter for upcoming fixtures
            try:
                # Get current season year for European competitions
                from datetime import datetime
                current_year = datetime.now().year
                current_month = datetime.now().month
                # European competitions typically run from August to May/June
                season = current_year if current_month >= 8 else current_year - 1
                
                no_date_response = await football_api_service.client.get(
                    f"{football_api_service.api_football_base}/fixtures",
                    params={
                        'league': 3,  # Europa League
                        'next': 10,   # Get next 10 fixtures
                        'season': season,  # Add season parameter
                    },
                    headers={
                        'X-RapidAPI-Key': football_api_service.api_football_key,
                        'X-RapidAPI-Host': 'v3.football.api-sports.io',
                    }
                )
                no_date_data = no_date_response.json()
                next_fixtures = no_date_data.get('response', [])
                result['europa_league_next_10'] = len(next_fixtures)
                result['season_used'] = season
                
                if next_fixtures:
                    result['sample_next_fixture'] = {
                        'date': next_fixtures[0].get('fixture', {}).get('date'),
                        'teams': {
                            'home': next_fixtures[0].get('teams', {}).get('home', {}).get('name'),
                            'away': next_fixtures[0].get('teams', {}).get('away', {}).get('name'),
                        },
                        'league': next_fixtures[0].get('league', {}).get('name'),
                    }
                else:
                    # Check if there's error info
                    if 'errors' in no_date_data:
                        result['api_errors'] = no_date_data['errors']
                    result['api_response'] = no_date_data.get('response') if 'response' in no_date_data else 'No response key'
            except Exception as e:
                result['next_fixtures_error'] = str(e)
                import traceback
                result['next_fixtures_traceback'] = traceback.format_exc()
            
            if test_fixtures:
                result['sample_fixture'] = {
                    'id': test_fixtures[0].get('fixture', {}).get('id'),
                    'teams': {
                        'home': test_fixtures[0].get('teams', {}).get('home', {}).get('name'),
                        'away': test_fixtures[0].get('teams', {}).get('away', {}).get('name'),
                    }
                }
            elif upcoming_fixtures:
                result['sample_upcoming_fixture'] = {
                    'id': upcoming_fixtures[0].get('fixture', {}).get('id'),
                    'date': upcoming_fixtures[0].get('fixture', {}).get('date'),
                    'teams': {
                        'home': upcoming_fixtures[0].get('teams', {}).get('home', {}).get('name'),
                        'away': upcoming_fixtures[0].get('teams', {}).get('away', {}).get('name'),
                    }
                }
        except Exception as e:
            result['test_fetch_success'] = False
            result['test_error'] = str(e)
            import traceback
            result['test_error_traceback'] = traceback.format_exc()
    
    return result


@router.get("/leagues")
async def get_league_ids():
    """Get list of supported league IDs"""
    return {
        'leagues': LEAGUE_IDS,
        'uk_leagues': {k: v for k, v in LEAGUE_IDS.items() if v in UK_LEAGUE_IDS},
        'european_competitions': {k: v for k, v in LEAGUE_IDS.items() if v in EUROPEAN_COMPETITION_IDS},
        'uk_league_ids': UK_LEAGUE_IDS,
        'european_competition_ids': EUROPEAN_COMPETITION_IDS,
        'default_filter': UK_AND_EUROPEAN_IDS,
        'note': 'These are API-FOOTBALL league IDs. By default, UK leagues and European competitions (Champions League, Europa League) are shown.',
    }


@router.get("/teams/uk")
async def get_uk_teams():
    """
    Get list of UK teams from multiple competitions for team selection.
    Uses FPL API for Premier League teams (always available).
    Uses Football-Data.org or API-FOOTBALL for other UK leagues if configured.
    Returns teams with ID, name, logo, and competition info.
    """
    try:
        all_teams = []
        
        # 1. Get Premier League teams from FPL API (always available)
        print("[Football API] Fetching Premier League teams from FPL API")
        fpl_data = await fpl_service.get_bootstrap_static()
        for team in fpl_data.get('teams', []):
            all_teams.append({
                'id': team['id'],  # FPL team ID
                'name': team['name'],
                'logo': None,  # FPL doesn't provide team logos
                'code': team.get('short_name'),
                'competition': 'Premier League',
                'source': 'FPL',
            })
        
        # 2. Get teams from other UK leagues if API is configured
        from app.services.football_api_service import football_api_service
        
        if football_api_service.football_data_key or football_api_service.api_football_key:
            print("[Football API] Fetching teams from other UK leagues")
            uk_teams_by_competition = await football_api_service.get_all_uk_teams()
            
            for comp_name, teams in uk_teams_by_competition.items():
                # Skip Premier League as we already have it from FPL
                if comp_name == 'Premier League':
                    continue
                
                for team in teams:
                    all_teams.append({
                        'id': team.get('id'),
                        'name': team.get('name'),
                        'logo': team.get('logo'),
                        'code': team.get('code') or team.get('short_name'),
                        'competition': comp_name,
                        'source': 'Football-Data.org' if football_api_service.football_data_key else 'API-FOOTBALL',
                        'founded': team.get('founded'),
                        'venue': team.get('venue'),
                    })
        else:
            print("[Football API] No additional API key configured - only Premier League teams available")
            print("[Football API] To get Championship, League One, League Two, etc., add FOOTBALL_DATA_KEY or API_FOOTBALL_KEY")
        
        # Sort by competition, then by name
        all_teams.sort(key=lambda x: (x.get('competition', ''), x.get('name', '')))
        
        print(f"[Football API] Returning {len(all_teams)} total UK teams from {len(set(t.get('competition') for t in all_teams))} competitions")
        
        # Group by competition for easier frontend use
        teams_by_competition = {}
        for team in all_teams:
            comp = team.get('competition', 'Unknown')
            if comp not in teams_by_competition:
                teams_by_competition[comp] = []
            teams_by_competition[comp].append(team)
        
        return {
            'teams': all_teams,
            'teams_by_competition': teams_by_competition,
            'count': len(all_teams),
            'competitions': list(teams_by_competition.keys()),
            'source': 'FPL API' + (' + ' + ('Football-Data.org' if football_api_service.football_data_key else 'API-FOOTBALL') if (football_api_service.football_data_key or football_api_service.api_football_key) else ''),
        }
    except Exception as e:
        import traceback
        print(f"[Football API] Error fetching UK teams: {e}")
        print(traceback.format_exc())
        return {
            'teams': [],
            'teams_by_competition': {},
            'count': 0,
            'error': str(e)
        }


@router.get("/team/{team_id}/news")
async def get_team_news(team_id: int, limit: int = Query(10, description="Maximum number of news items to return")):
    """Get news for a specific team from RSS feeds"""
    try:
        print(f"[Football API] Fetching team news for team_id {team_id}")
        fpl_data = await fpl_service.get_bootstrap_static()
        
        # Find team in FPL data
        fpl_team = None
        for team in fpl_data.get('teams', []):
            if team['id'] == team_id:
                fpl_team = team
                break
        
        if not fpl_team:
            return {
                'news': [],
                'error': f'Team with ID {team_id} not found in FPL data.'
            }
        
        team_name = fpl_team.get('name', 'Team')
        
        # Fetch news from RSS feeds
        news_items = await news_service.get_team_news(team_name, limit=limit)
        
        return {
            'news': news_items,
            'team': team_name,
            'count': len(news_items),
        }
    except Exception as e:
        import traceback
        print(f"[Football API] Error in get_team_news: {e}")
        print(traceback.format_exc())
        return {
            'news': [],
            'error': str(e),
        }


@router.get("/team/{team_id}/news/overview")
async def get_team_news_overview(team_id: int, limit: int = Query(20, description="Maximum number of news items to analyze")):
    """Get analyzed news overview with highlights and big news for a team"""
    try:
        print(f"[Football API] Fetching news overview for team_id {team_id}")
        fpl_data = await fpl_service.get_bootstrap_static()
        
        # Find team in FPL data
        fpl_team = None
        for team in fpl_data.get('teams', []):
            if team['id'] == team_id:
                fpl_team = team
                break
        
        if not fpl_team:
            return {
                'overview': f'Team with ID {team_id} not found.',
                'highlights': [],
                'big_news': [],
                'categories': {},
                'total_count': 0,
                'error': f'Team with ID {team_id} not found in FPL data.'
            }
        
        team_name = fpl_team.get('name', 'Team')
        
        # Get news overview with analysis
        overview = await news_service.get_team_news_overview(team_name, limit=limit)
        
        return overview
    except Exception as e:
        import traceback
        print(f"[Football API] Error in get_team_news_overview: {e}")
        print(traceback.format_exc())
        return {
            'overview': 'Unable to fetch news overview at this time.',
            'highlights': [],
            'big_news': [],
            'categories': {},
            'total_count': 0,
            'error': str(e),
        }


@router.get("/team/{team_id}/info")
async def get_team_info(team_id: int):
    """Get detailed information about a specific team using FPL API"""
    try:
        print(f"[Football API] Fetching team info from FPL API for team_id {team_id}")
        fpl_data = await fpl_service.get_bootstrap_static()
        
        # Find team in FPL data
        fpl_team = None
        for team in fpl_data.get('teams', []):
            if team['id'] == team_id:
                fpl_team = team
                break
        
        if not fpl_team:
            return {'error': f'Team with ID {team_id} not found in FPL data'}
        
        # Get upcoming fixtures from FPL
        fixtures = await fpl_service.get_fixtures()
        teams_map = await _get_fpl_teams_map()
        upcoming_fixtures = []
        
        for fixture in fixtures:
            # Check if this fixture involves the selected team
            if fixture.get('team_h') == team_id or fixture.get('team_a') == team_id:
                # Check if fixture is in the future
                fixture_date = fixture.get('kickoff_time')
                if fixture_date:
                    try:
                        kickoff = datetime.fromisoformat(fixture_date.replace('Z', '+00:00'))
                        if kickoff > datetime.now(kickoff.tzinfo) and not fixture.get('finished', False):
                            formatted_fixture = _format_fpl_fixture_to_standard(fixture, teams_map)
                            upcoming_fixtures.append(formatted_fixture)
                            if len(upcoming_fixtures) >= 5:
                                break
                    except:
                        pass
        
        return {
            'id': fpl_team['id'],
            'name': fpl_team['name'],
            'logo': None,  # FPL doesn't provide team logos
            'code': fpl_team.get('short_name'),
            'country': 'England',  # Premier League teams are from England
            'founded': None,  # FPL doesn't provide founding year
            'venue': {
                'name': None,  # FPL doesn't provide venue info
                'city': None,
                'capacity': None,
            },
            'upcoming_fixtures': upcoming_fixtures[:5],
        }
    except Exception as e:
        import traceback
        print(f"[Football API] Error fetching team info: {e}")
        print(traceback.format_exc())
        return {'error': str(e)}

