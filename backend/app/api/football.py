"""
Football API - General football data (fixtures, results, standings)
Uses FPL API as the primary data source
"""

from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from app.services.fpl_service import fpl_service

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
    team_id: Optional[int] = Query(None, description="FPL Team ID to filter"),
) -> Dict[str, Any]:
    """
    Get today's Premier League fixtures from FPL API.
    """
    try:
        today = datetime.now().date()
        today_str = today.strftime('%Y-%m-%d')
        
        print(f"[Football API] Fetching today's fixtures from FPL API for {today_str}")
        
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
    team_id: Optional[int] = Query(None, description="FPL Team ID to filter"),
) -> Dict[str, Any]:
    """
    Get upcoming Premier League fixtures from FPL API.
    Includes fixtures from today onwards.
    """
    try:
        today = datetime.now().date()
        end_date = today + timedelta(days=days)
        
        print(f"[Football API] Fetching upcoming fixtures from FPL API for next {days} days")
        
        # Get all fixtures from FPL
        fpl_fixtures = await fpl_service.get_fixtures()
        teams_map = await _get_fpl_teams_map()
        
        # Filter for upcoming fixtures
        upcoming_fixtures = []
        for fpl_fixture in fpl_fixtures:
            kickoff_time = fpl_fixture.get('kickoff_time')
            if not kickoff_time:
                continue
            
            # Parse date from kickoff_time
            try:
                fixture_date = datetime.fromisoformat(kickoff_time.replace('Z', '+00:00')).date()
            except:
                continue
            
            # Check if it's in the date range and not finished
            if today <= fixture_date <= end_date and not fpl_fixture.get('finished', False):
                # Filter by team_id if provided
                if team_id:
                    if fpl_fixture.get('team_h') != team_id and fpl_fixture.get('team_a') != team_id:
                        continue
                
                formatted_fixture = _format_fpl_fixture_to_standard(fpl_fixture, teams_map)
                upcoming_fixtures.append(formatted_fixture)
        
        # Sort by fixture date
        upcoming_fixtures.sort(key=lambda x: x.get('fixture', {}).get('date', ''))
        
        print(f"[Football API] Found {len(upcoming_fixtures)} upcoming fixtures")
        
        return {
            'fixtures': upcoming_fixtures,
            'count': len(upcoming_fixtures),
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


@router.get("/results/recent")
async def get_recent_results(
    days: int = Query(7, description="Number of days back to fetch"),
    team_id: Optional[int] = Query(None, description="FPL Team ID to filter"),
) -> Dict[str, Any]:
    """
    Get recent Premier League match results from FPL API.
    """
    try:
        today = datetime.now().date()
        start_date = today - timedelta(days=days)
        
        print(f"[Football API] Fetching recent results from FPL API for last {days} days")
        
        # Get all fixtures from FPL
        fpl_fixtures = await fpl_service.get_fixtures()
        teams_map = await _get_fpl_teams_map()
        
        # Filter for finished fixtures in the date range
        recent_results = []
        for fpl_fixture in fpl_fixtures:
            if not fpl_fixture.get('finished', False):
                continue
            
            kickoff_time = fpl_fixture.get('kickoff_time')
            if not kickoff_time:
                continue
            
            # Parse date from kickoff_time
            try:
                fixture_date = datetime.fromisoformat(kickoff_time.replace('Z', '+00:00')).date()
            except:
                continue
            
            # Check if it's in the date range
            if start_date <= fixture_date <= today:
                # Filter by team_id if provided
                if team_id:
                    if fpl_fixture.get('team_h') != team_id and fpl_fixture.get('team_a') != team_id:
                        continue
                
                formatted_fixture = _format_fpl_fixture_to_standard(fpl_fixture, teams_map)
                recent_results.append(formatted_fixture)
        
        # Sort by fixture date (most recent first)
        recent_results.sort(key=lambda x: x.get('fixture', {}).get('date', ''), reverse=True)
        
        print(f"[Football API] Found {len(recent_results)} recent results")
        
        return {
            'results': recent_results,
            'count': len(recent_results),
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
    Get list of UK teams (Premier League teams) for team selection
    Uses FPL API as the data source
    Returns teams with ID, name, and logo for easy selection
    """
    try:
        print("[Football API] Fetching UK teams from FPL API")
        fpl_data = await fpl_service.get_bootstrap_static()
        teams = []
        for team in fpl_data.get('teams', []):
            teams.append({
                'id': team['id'],  # FPL team ID
                'name': team['name'],
                'logo': None,  # FPL doesn't provide team logos
                'code': team.get('short_name'),
            })
        teams.sort(key=lambda x: x['name'])
        print(f"[Football API] Returning {len(teams)} teams from FPL API")
        return {'teams': teams}
    except Exception as e:
        import traceback
        print(f"[Football API] Error fetching UK teams: {e}")
        print(traceback.format_exc())
        return {
            'teams': [],
            'error': str(e)
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

