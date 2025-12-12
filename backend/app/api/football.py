"""
Football API - General football data (fixtures, results, standings)
"""

from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any
from app.services.football_cache_service import football_cache_service

router = APIRouter(prefix="/football", tags=["Football"])


async def _get_uk_team_ids() -> List[int]:
    """Get list of UK Premier League team IDs"""
    from app.services.football_api_service import football_api_service
    from datetime import datetime
    
    if not football_api_service.api_football_key:
        return []
    
    try:
        current_year = datetime.now().year
        season = current_year if datetime.now().month >= 8 else current_year - 1
        
        response = await football_api_service.client.get(
            f"{football_api_service.api_football_base}/teams",
            params={'league': 39, 'season': season},  # Premier League
            headers={
                'X-RapidAPI-Key': football_api_service.api_football_key,
                'X-RapidAPI-Host': 'v3.football.api-sports.io',
            }
        )
        response.raise_for_status()
        data = response.json()
        
        team_ids = [team['team']['id'] for team in data.get('response', [])]
        return team_ids
    except Exception as e:
        print(f"[Football API] Error fetching UK team IDs: {e}")
        return []


@router.get("/fixtures/today")
async def get_todays_fixtures(
    league_id: Optional[int] = Query(None, description="League ID (e.g., 39 for Premier League). If not provided, shows UK and European competitions."),
    team_id: Optional[int] = Query(None, description="Team ID to filter"),
    force_refresh: bool = Query(False, description="Force refresh cache"),
    uk_only: bool = Query(True, description="Show UK leagues and European competitions (default: true)"),
) -> Dict[str, Any]:
    """
    Get today's football fixtures.
    By default, shows UK leagues (Premier League, Championship, etc.) and European competitions (Champions League, Europa League).
    Also includes fixtures where UK teams are playing in cups and European competitions.
    Cached for 5 minutes to reduce API calls.
    """
    try:
        # If no league_id specified and uk_only is True, fetch all UK leagues + European competitions + UK team fixtures
        if league_id is None and uk_only:
            all_fixtures = []
            errors = []
            
            # Fetch by league IDs (UK leagues and European competitions)
            for uk_league_id in UK_AND_EUROPEAN_IDS:
                try:
                    fixtures = await football_cache_service.get_todays_fixtures(uk_league_id, team_id, force_refresh)
                    all_fixtures.extend(fixtures)
                except Exception as e:
                    errors.append(f"League {uk_league_id}: {str(e)}")
                    print(f"[Football API] Error fetching league {uk_league_id}: {e}")
            
            # Also fetch fixtures by UK team IDs to catch cups and European competitions
            uk_team_ids = await _get_uk_team_ids()
            if uk_team_ids:
                print(f"[Football API] Fetching fixtures for {len(uk_team_ids)} UK teams")
                # Fetch in batches to avoid too many API calls
                for team_id_val in uk_team_ids[:20]:  # Limit to first 20 teams to avoid rate limits
                    try:
                        fixtures = await football_cache_service.get_todays_fixtures(None, team_id_val, force_refresh)
                        all_fixtures.extend(fixtures)
                    except Exception as e:
                        # Silently skip individual team errors
                        pass
            
            # Remove duplicates (same fixture might appear in multiple calls)
            seen = set()
            unique_fixtures = []
            for fixture in all_fixtures:
                fixture_id = fixture.get('fixture', {}).get('id')
                if fixture_id and fixture_id not in seen:
                    seen.add(fixture_id)
                    unique_fixtures.append(fixture)
            
            result = {
                'fixtures': unique_fixtures,
                'count': len(unique_fixtures),
                'cached': not force_refresh,
                'filter': 'UK leagues, European competitions, and UK team fixtures',
            }
            
            if errors:
                result['errors'] = errors
            
            return result
        else:
            fixtures = await football_cache_service.get_todays_fixtures(league_id, team_id, force_refresh)
            return {
                'fixtures': fixtures,
                'count': len(fixtures),
                'cached': not force_refresh,
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
    league_id: Optional[int] = Query(None, description="League ID"),
    team_id: Optional[int] = Query(None, description="Team ID to filter"),
    force_refresh: bool = Query(False, description="Force refresh cache"),
    uk_only: bool = Query(True, description="Show UK leagues and European competitions (default: true)"),
) -> Dict[str, Any]:
    """
    Get upcoming football fixtures.
    By default, shows UK leagues (Premier League, Championship, etc.) and European competitions (Champions League, Europa League).
    Also includes fixtures where UK teams are playing in cups and European competitions.
    Includes fixtures from today onwards.
    Cached for 1 hour to reduce API calls.
    """
    # If no league_id specified and uk_only is True, fetch all UK leagues + European competitions + UK team fixtures
    if league_id is None and uk_only:
        all_fixtures = []
        errors = []
        
        # Fetch by league IDs (UK leagues and European competitions)
        for uk_league_id in UK_AND_EUROPEAN_IDS:
            try:
                fixtures = await football_cache_service.get_upcoming_fixtures(days, uk_league_id, team_id, force_refresh)
                all_fixtures.extend(fixtures)
            except Exception as e:
                errors.append(f"League {uk_league_id}: {str(e)}")
                print(f"[Football API] Error fetching league {uk_league_id}: {e}")
        
        # Also fetch fixtures by UK team IDs to catch cups and European competitions
        uk_team_ids = await _get_uk_team_ids()
        if uk_team_ids:
            print(f"[Football API] Fetching upcoming fixtures for {len(uk_team_ids)} UK teams")
            # Fetch in batches to avoid too many API calls
            for team_id_val in uk_team_ids[:20]:  # Limit to first 20 teams to avoid rate limits
                try:
                    fixtures = await football_cache_service.get_upcoming_fixtures(days, None, team_id_val, force_refresh)
                    all_fixtures.extend(fixtures)
                except Exception as e:
                    # Silently skip individual team errors
                    pass
        
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
            'filter': 'UK leagues, European competitions, and UK team fixtures',
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
    uk_only: bool = Query(True, description="Show UK leagues and European competitions (default: true)"),
) -> Dict[str, Any]:
    """
    Get recent match results.
    By default, shows UK leagues (Premier League, Championship, etc.) and European competitions (Champions League, Europa League).
    Cached for 6 hours to reduce API calls.
    """
    # If no league_id specified and uk_only is True, fetch all UK leagues + European competitions
    if league_id is None and uk_only:
        all_results = []
        for league_id_item in UK_AND_EUROPEAN_IDS:
            results = await football_cache_service.get_recent_results(days, league_id_item, team_id, force_refresh)
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
            'filter': 'UK leagues and European competitions',
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
    Returns teams with ID, name, and logo for easy selection
    """
    from app.services.football_api_service import football_api_service
    
    if not football_api_service.api_football_key:
        # Try fallback to FPL API for teams
        try:
            from app.services.fpl_service import fpl_service
            print("[Football API] API_FOOTBALL_KEY not configured, using FPL fallback")
            fpl_data = await fpl_service.get_bootstrap_static()
            teams = []
            for team in fpl_data.get('teams', []):
                teams.append({
                    'id': team['id'],  # Note: This is FPL team ID, not API-FOOTBALL ID
                    'name': team['name'],
                    'logo': None,  # FPL doesn't provide team logos
                    'code': team.get('short_name'),
                })
            teams.sort(key=lambda x: x['name'])
            print(f"[Football API] Returning {len(teams)} teams from FPL fallback")
            return {
                'teams': teams,
                'warning': 'Using FPL teams as fallback. For full functionality, configure API_FOOTBALL_KEY. Get your free key at https://www.api-football.com/'
            }
        except Exception as e:
            print(f"[Football API] FPL fallback also failed: {e}")
            return {
                'teams': [],
                'error': 'API_FOOTBALL_KEY not configured. Get your free API key at https://www.api-football.com/ and set it as API_FOOTBALL_KEY environment variable.'
            }
    
    try:
        # Get Premier League teams (league ID 39)
        # API-FOOTBALL teams endpoint: /teams?league=39&season=2024
        import httpx
        from datetime import datetime
        
        # Get current season year
        # Premier League season runs from August to May
        # So if we're in Jan-July, we're in the second half of the previous season
        # If we're in Aug-Dec, we're in the first half of the current season
        current_year = datetime.now().year
        current_month = datetime.now().month
        season = current_year if current_month >= 8 else current_year - 1
        
        print(f"[Football API] Fetching UK teams for season {season}, month {current_month}")
        
        response = await football_api_service.client.get(
            f"{football_api_service.api_football_base}/teams",
            params={'league': 39, 'season': season},
            headers={
                'X-RapidAPI-Key': football_api_service.api_football_key,
                'X-RapidAPI-Host': 'v3.football.api-sports.io',
            }
        )
        
        print(f"[Football API] Teams response status: {response.status_code}")
        
        response.raise_for_status()
        data = response.json()
        
        print(f"[Football API] Teams response keys: {list(data.keys())}")
        print(f"[Football API] Teams response sample: {str(data)[:500]}")
        
        teams = []
        response_teams = data.get('response', [])
        print(f"[Football API] Found {len(response_teams)} teams in response")
        
        for team in response_teams:
            if 'team' in team:
                teams.append({
                    'id': team['team']['id'],
                    'name': team['team']['name'],
                    'logo': team['team'].get('logo'),
                    'code': team['team'].get('code'),
                })
        
        # Sort by name
        teams.sort(key=lambda x: x['name'])
        
        print(f"[Football API] Returning {len(teams)} teams")
        
        if len(teams) == 0:
            error_msg = 'No teams found. This might be due to API key issues or season configuration.'
            if 'errors' in data:
                error_msg += f" API errors: {data['errors']}"
            return {
                'teams': [],
                'error': error_msg
            }
        
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
    """Get detailed information about a specific team"""
    from app.services.football_api_service import football_api_service
    
    if not football_api_service.api_football_key:
        # Fallback to FPL data when API key is not configured
        # Note: team_id here is an FPL team ID, not API-FOOTBALL ID
        try:
            from app.services.fpl_service import fpl_service
            print(f"[Football API] API_FOOTBALL_KEY not configured, using FPL fallback for team_id {team_id}")
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
            upcoming_fixtures = []
            for fixture in fixtures:
                # Check if this fixture involves the selected team
                if fixture.get('team_h') == team_id or fixture.get('team_a') == team_id:
                    # Check if fixture is in the future
                    fixture_date = fixture.get('kickoff_time')
                    if fixture_date:
                        from datetime import datetime
                        try:
                            kickoff = datetime.fromisoformat(fixture_date.replace('Z', '+00:00'))
                            if kickoff > datetime.now(kickoff.tzinfo):
                                # Format for display
                                home_team = next((t for t in fpl_data.get('teams', []) if t['id'] == fixture.get('team_h')), {})
                                away_team = next((t for t in fpl_data.get('teams', []) if t['id'] == fixture.get('team_a')), {})
                                upcoming_fixtures.append({
                                    'fixture': {
                                        'id': fixture.get('id'),
                                        'date': fixture_date,
                                    },
                                    'teams': {
                                        'home': {'id': fixture.get('team_h'), 'name': home_team.get('name', 'Unknown')},
                                        'away': {'id': fixture.get('team_a'), 'name': away_team.get('name', 'Unknown')},
                                    },
                                    'league': {'name': 'Premier League'},
                                })
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
            print(f"[Football API] FPL fallback error: {e}")
            print(traceback.format_exc())
            return {'error': f'Failed to fetch team info: {str(e)}'}
    
    try:
        import httpx
        from datetime import datetime
        
        current_year = datetime.now().year
        season = f"{current_year - 1}" if datetime.now().month < 7 else str(current_year)
        
        # Get team info
        response = await football_api_service.client.get(
            f"{football_api_service.api_football_base}/teams",
            params={'id': team_id},
            headers={
                'X-RapidAPI-Key': football_api_service.api_football_key,
                'X-RapidAPI-Host': 'v3.football.api-sports.io',
            }
        )
        
        response.raise_for_status()
        data = response.json()
        
        team_data = data.get('response', [])
        if not team_data:
            return {'error': 'Team not found'}
        
        team = team_data[0]['team']
        
        # Get upcoming fixtures for this team
        upcoming = await football_api_service.get_upcoming_fixtures(days=30, team_id=team_id)
        
        return {
            'id': team['id'],
            'name': team['name'],
            'logo': team.get('logo'),
            'code': team.get('code'),
            'country': team.get('country'),
            'founded': team.get('founded'),
            'venue': team_data[0].get('venue', {}),
            'upcoming_fixtures': upcoming[:5],  # Next 5 fixtures
        }
    except Exception as e:
        import traceback
        print(f"[Football API] Error fetching team info: {e}")
        print(traceback.format_exc())
        return {'error': str(e)}

