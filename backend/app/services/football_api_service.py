"""
Football API Service - General football data (fixtures, results, standings)
Supports multiple data sources: API-FOOTBALL, Football-Data.org, etc.
"""

import httpx
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from app.core.config import settings

# Import httpx exceptions
from httpx import HTTPStatusError


class FootballAPIService:
    """Service for fetching general football data from external APIs"""
    
    def __init__(self):
        # API-FOOTBALL (api-sports.io) configuration
        self.api_football_base = "https://v3.football.api-sports.io"
        self.api_football_key = getattr(settings, 'API_FOOTBALL_KEY', '')
        
        # Football-Data.org configuration
        self.football_data_base = "https://api.football-data.org/v4"
        self.football_data_key = getattr(settings, 'FOOTBALL_DATA_KEY', '')
        
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def get_todays_fixtures(
        self, 
        league_id: Optional[int] = None,
        team_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Get today's fixtures
        
        Args:
            league_id: Optional league ID to filter (e.g., 39 for Premier League)
            team_id: Optional team ID to filter
        
        Returns:
            List of fixture dictionaries
        """
        if self.api_football_key:
            return await self._get_todays_fixtures_api_football(league_id, team_id)
        elif self.football_data_key:
            return await self._get_todays_fixtures_football_data(league_id, team_id)
        else:
            return []
    
    async def _get_todays_fixtures_api_football(
        self, 
        league_id: Optional[int] = None,
        team_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get today's fixtures from API-FOOTBALL, and if none found, include upcoming fixtures from today onwards"""
        today = datetime.now()
        today_str = today.strftime('%Y-%m-%d')
        end_date = (today + timedelta(days=7)).strftime('%Y-%m-%d')  # Include next 7 days if today is empty
        current_year = datetime.now().year
        current_month = datetime.now().month
        
        # First try to get today's fixtures
        params = {'date': today_str}
        if league_id:
            params['league'] = league_id
            # Add season parameter for leagues (European competitions need it)
            if league_id in [2, 3]:  # Champions League, Europa League
                # European competitions run Aug-May
                season = current_year if current_month >= 8 else current_year - 1
                params['season'] = season
            elif league_id in [39, 40, 41, 42]:  # UK leagues
                # Premier League and UK leagues run Aug-May
                season = current_year if current_month >= 8 else current_year - 1
                params['season'] = season
        if team_id:
            params['team'] = team_id
        
        try:
            print(f"[Football API] Fetching fixtures for date={today_str}, league={league_id}, team={team_id}")
            print(f"[Football API] Using endpoint: {self.api_football_base}/fixtures")
            print(f"[Football API] API key present: {bool(self.api_football_key)}")
            
            response = await self.client.get(
                f"{self.api_football_base}/fixtures",
                params=params,
                headers={
                    'X-RapidAPI-Key': self.api_football_key,
                    'X-RapidAPI-Host': 'v3.football.api-sports.io',
                }
            )
            
            print(f"[Football API] Response status: {response.status_code}")
            
            response.raise_for_status()
            data = response.json()
            
            print(f"[Football API] Response keys: {list(data.keys())}")
            print(f"[Football API] Full response sample: {str(data)[:500]}")
            
            fixtures = data.get('response', [])
            print(f"[Football API] Found {len(fixtures)} fixtures for league_id={league_id}, date={today_str}")
            
            # If no fixtures today, try to get upcoming fixtures from today onwards
            if len(fixtures) == 0:
                print(f"[Football API] No fixtures today, fetching upcoming fixtures from {today_str} to {end_date}")
                params_upcoming = {'from': today_str, 'to': end_date}
                if league_id:
                    params_upcoming['league'] = league_id
                    if league_id in [2, 3]:
                        season = current_year if current_month >= 8 else current_year - 1
                        params_upcoming['season'] = season
                    elif league_id in [39, 40, 41, 42]:
                        season = current_year if current_month >= 8 else current_year - 1
                        params_upcoming['season'] = season
                if team_id:
                    params_upcoming['team'] = team_id
                
                response_upcoming = await self.client.get(
                    f"{self.api_football_base}/fixtures",
                    params=params_upcoming,
                    headers={
                        'X-RapidAPI-Key': self.api_football_key,
                        'X-RapidAPI-Host': 'v3.football.api-sports.io',
                    }
                )
                response_upcoming.raise_for_status()
                data_upcoming = response_upcoming.json()
                fixtures_upcoming = data_upcoming.get('response', [])
                
                # Filter to only upcoming (not finished) and from today onwards
                fixtures = [
                    f for f in fixtures_upcoming 
                    if f.get('fixture', {}).get('status', {}).get('long') != 'Match Finished'
                    and f.get('fixture', {}).get('date', '') >= today_str
                ]
                print(f"[Football API] Found {len(fixtures)} upcoming fixtures from today onwards")
            
            # If no fixtures and we have a league_id, log the first fixture structure if any
            if len(fixtures) == 0 and league_id:
                print(f"[Football API] WARNING: No fixtures found for league {league_id} on {today_str} or upcoming")
                # Try to see if there's any useful info in the response
                if 'errors' in data:
                    print(f"[Football API] API errors: {data['errors']}")
            
            return fixtures
        except httpx.HTTPStatusError as e:
            print(f"[Football API] HTTP error {e.response.status_code}: {e.response.text[:200]}")
            return []
        except Exception as e:
            import traceback
            print(f"[Football API] Error fetching fixtures: {e}")
            print(traceback.format_exc())
            return []
    
    async def _get_todays_fixtures_football_data(
        self,
        league_id: Optional[int] = None,
        team_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get today's fixtures from Football-Data.org"""
        today = datetime.now().strftime('%Y-%m-%d')
        
        try:
            if league_id:
                response = await self.client.get(
                    f"{self.football_data_base}/competitions/{league_id}/matches",
                    params={'dateFrom': today, 'dateTo': today},
                    headers={'X-Auth-Token': self.football_data_key}
                )
            else:
                # Get all matches for today
                response = await self.client.get(
                    f"{self.football_data_base}/matches",
                    params={'dateFrom': today, 'dateTo': today},
                    headers={'X-Auth-Token': self.football_data_key}
                )
            
            response.raise_for_status()
            data = response.json()
            matches = data.get('matches', [])
            
            # Filter by team if specified
            if team_id:
                matches = [
                    m for m in matches 
                    if m.get('homeTeam', {}).get('id') == team_id 
                    or m.get('awayTeam', {}).get('id') == team_id
                ]
            
            return self._format_football_data_matches(matches)
        except Exception as e:
            print(f"[Football API] Error fetching fixtures: {e}")
            return []
    
    async def get_upcoming_fixtures(
        self,
        days: int = 7,
        league_id: Optional[int] = None,
        team_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get upcoming fixtures for the next N days"""
        if self.api_football_key:
            return await self._get_upcoming_fixtures_api_football(days, league_id, team_id)
        elif self.football_data_key:
            return await self._get_upcoming_fixtures_football_data(days, league_id, team_id)
        else:
            return []
    
    async def _get_upcoming_fixtures_api_football(
        self,
        days: int = 7,
        league_id: Optional[int] = None,
        team_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get upcoming fixtures from API-FOOTBALL"""
        today = datetime.now()
        end_date = (today + timedelta(days=days)).strftime('%Y-%m-%d')
        start_date = today.strftime('%Y-%m-%d')
        current_year = datetime.now().year
        current_month = datetime.now().month
        
        params = {'from': start_date, 'to': end_date}
        if league_id:
            params['league'] = league_id
            # Add season parameter for leagues
            if league_id in [2, 3]:  # Champions League, Europa League
                season = current_year if current_month >= 8 else current_year - 1
                params['season'] = season
            elif league_id in [39, 40, 41, 42]:  # UK leagues
                season = current_year if current_month >= 8 else current_year - 1
                params['season'] = season
        if team_id:
            params['team'] = team_id
        
        try:
            print(f"[Football API] Fetching upcoming fixtures: from={start_date}, to={end_date}, league={league_id}")
            
            response = await self.client.get(
                f"{self.api_football_base}/fixtures",
                params=params,
                headers={
                    'X-RapidAPI-Key': self.api_football_key,
                    'X-RapidAPI-Host': 'v3.football.api-sports.io',
                }
            )
            
            print(f"[Football API] Upcoming fixtures response status: {response.status_code}")
            
            response.raise_for_status()
            data = response.json()
            
            fixtures = data.get('response', [])
            print(f"[Football API] Found {len(fixtures)} total fixtures in date range for league_id={league_id}")
            
            # Filter to only upcoming (status not finished)
            upcoming = [
                f for f in fixtures 
                if f.get('fixture', {}).get('status', {}).get('long') != 'Match Finished'
            ]
            print(f"[Football API] Found {len(upcoming)} upcoming fixtures (excluding finished)")
            
            return upcoming
        except Exception as e:
            import traceback
            print(f"[Football API] Error fetching upcoming fixtures: {e}")
            print(traceback.format_exc())
            return []
    
    async def _get_upcoming_fixtures_football_data(
        self,
        days: int = 7,
        league_id: Optional[int] = None,
        team_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get upcoming fixtures from Football-Data.org"""
        today = datetime.now()
        end_date = (today + timedelta(days=days)).strftime('%Y-%m-%d')
        
        try:
            if league_id:
                response = await self.client.get(
                    f"{self.football_data_base}/competitions/{league_id}/matches",
                    params={'dateFrom': today.strftime('%Y-%m-%d'), 'dateTo': end_date},
                    headers={'X-Auth-Token': self.football_data_key}
                )
            else:
                response = await self.client.get(
                    f"{self.football_data_base}/matches",
                    params={'dateFrom': today.strftime('%Y-%m-%d'), 'dateTo': end_date},
                    headers={'X-Auth-Token': self.football_data_key}
                )
            
            response.raise_for_status()
            data = response.json()
            matches = data.get('matches', [])
            
            # Filter by team if specified
            if team_id:
                matches = [
                    m for m in matches 
                    if m.get('homeTeam', {}).get('id') == team_id 
                    or m.get('awayTeam', {}).get('id') == team_id
                ]
            
            # Filter to only scheduled/upcoming
            upcoming = [
                m for m in matches 
                if m.get('status') in ['SCHEDULED', 'TIMED']
            ]
            
            return self._format_football_data_matches(upcoming)
        except Exception as e:
            print(f"[Football API] Error fetching upcoming fixtures: {e}")
            return []
    
    async def get_recent_results(
        self,
        days: int = 7,
        league_id: Optional[int] = None,
        team_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get recent match results"""
        if self.api_football_key:
            return await self._get_recent_results_api_football(days, league_id, team_id)
        elif self.football_data_key:
            return await self._get_recent_results_football_data(days, league_id, team_id)
        else:
            return []
    
    async def _get_recent_results_api_football(
        self,
        days: int = 7,
        league_id: Optional[int] = None,
        team_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get recent results from API-FOOTBALL"""
        today = datetime.now()
        start_date = (today - timedelta(days=days)).strftime('%Y-%m-%d')
        
        params = {'from': start_date, 'to': today.strftime('%Y-%m-%d')}
        if league_id:
            params['league'] = league_id
        if team_id:
            params['team'] = team_id
        
        try:
            response = await self.client.get(
                f"{self.api_football_base}/fixtures",
                params=params,
                headers={
                    'X-RapidAPI-Key': self.api_football_key,
                    'X-RapidAPI-Host': 'v3.football.api-sports.io',
                }
            )
            response.raise_for_status()
            data = response.json()
            fixtures = data.get('response', [])
            
            # Filter to only finished matches
            return [
                f for f in fixtures 
                if f.get('fixture', {}).get('status', {}).get('long') == 'Match Finished'
            ]
        except Exception as e:
            print(f"[Football API] Error fetching results: {e}")
            return []
    
    async def _get_recent_results_football_data(
        self,
        days: int = 7,
        league_id: Optional[int] = None,
        team_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get recent results from Football-Data.org"""
        today = datetime.now()
        start_date = (today - timedelta(days=days)).strftime('%Y-%m-%d')
        
        try:
            if league_id:
                response = await self.client.get(
                    f"{self.football_data_base}/competitions/{league_id}/matches",
                    params={'dateFrom': start_date, 'dateTo': today.strftime('%Y-%m-%d')},
                    headers={'X-Auth-Token': self.football_data_key}
                )
            else:
                response = await self.client.get(
                    f"{self.football_data_base}/matches",
                    params={'dateFrom': start_date, 'dateTo': today.strftime('%Y-%m-%d')},
                    headers={'X-Auth-Token': self.football_data_key}
                )
            
            response.raise_for_status()
            data = response.json()
            matches = data.get('matches', [])
            
            # Filter by team if specified
            if team_id:
                matches = [
                    m for m in matches 
                    if m.get('homeTeam', {}).get('id') == team_id 
                    or m.get('awayTeam', {}).get('id') == team_id
                ]
            
            # Filter to only finished matches
            finished = [
                m for m in matches 
                if m.get('status') == 'FINISHED'
            ]
            
            return self._format_football_data_matches(finished)
        except Exception as e:
            print(f"[Football API] Error fetching results: {e}")
            return []
    
    def _format_football_data_matches(self, matches: List[Dict]) -> List[Dict]:
        """Convert Football-Data.org format to standardized format"""
        formatted = []
        for match in matches:
            formatted.append({
                'fixture': {
                    'id': match.get('id'),
                    'date': match.get('utcDate'),
                    'status': {
                        'long': match.get('status'),
                        'short': match.get('status'),
                        'elapsed': match.get('minute'),
                    },
                    'venue': {
                        'name': match.get('venue'),
                    },
                },
                'league': {
                    'id': match.get('competition', {}).get('id') if 'competition' in match else None,
                    'name': match.get('competition', {}).get('name') if 'competition' in match else None,
                },
                'teams': {
                    'home': {
                        'id': match.get('homeTeam', {}).get('id'),
                        'name': match.get('homeTeam', {}).get('name'),
                    },
                    'away': {
                        'id': match.get('awayTeam', {}).get('id'),
                        'name': match.get('awayTeam', {}).get('name'),
                    },
                },
                'goals': {
                    'home': match.get('score', {}).get('fullTime', {}).get('home'),
                    'away': match.get('score', {}).get('fullTime', {}).get('away'),
                },
            })
        return formatted
    
    async def get_match_details(self, fixture_id: int) -> Dict[str, Any]:
        """Get detailed information about a specific match"""
        if self.api_football_key:
            return await self._get_match_details_api_football(fixture_id)
        elif self.football_data_key:
            return await self._get_match_details_football_data(fixture_id)
        else:
            return {}
    
    async def _get_match_details_api_football(self, fixture_id: int) -> Dict[str, Any]:
        """Get match details from API-FOOTBALL"""
        try:
            # Get fixture events, lineups, and stats
            endpoints = {
                'events': f"{self.api_football_base}/fixtures/events?fixture={fixture_id}",
                'lineups': f"{self.api_football_base}/fixtures/lineups?fixture={fixture_id}",
                'statistics': f"{self.api_football_base}/fixtures/statistics?fixture={fixture_id}",
            }
            
            headers = {
                'X-RapidAPI-Key': self.api_football_key,
                'X-RapidAPI-Host': 'v3.football.api-sports.io',
            }
            
            results = {}
            for key, url in endpoints.items():
                try:
                    response = await self.client.get(url, headers=headers)
                    response.raise_for_status()
                    data = response.json()
                    results[key] = data.get('response', [])
                except Exception as e:
                    print(f"[Football API] Error fetching {key}: {e}")
                    results[key] = []
            
            return results
        except Exception as e:
            print(f"[Football API] Error fetching match details: {e}")
            return {}
    
    async def get_head_to_head(
        self,
        team1_id: int,
        team2_id: int,
        last: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get head-to-head matches between two teams using API-FOOTBALL
        
        Args:
            team1_id: API-FOOTBALL team ID for first team
            team2_id: API-FOOTBALL team ID for second team
            last: Number of recent matches to return (default 10)
        
        Returns:
            List of fixture dictionaries
        """
        if self.api_football_key:
            return await self._get_head_to_head_api_football(team1_id, team2_id, last)
        else:
            return []
    
    async def _get_head_to_head_api_football(
        self,
        team1_id: int,
        team2_id: int,
        last: int = 10
    ) -> List[Dict[str, Any]]:
        """Get head-to-head matches from API-FOOTBALL"""
        try:
            # API-FOOTBALL head-to-head endpoint
            params = {
                'h2h': f'{team1_id}-{team2_id}',
                'last': last
            }
            
            print(f"[Football API] Fetching head-to-head: team1={team1_id}, team2={team2_id}, last={last}")
            
            response = await self.client.get(
                f"{self.api_football_base}/fixtures/headtohead",
                params=params,
                headers={
                    'X-RapidAPI-Key': self.api_football_key,
                    'X-RapidAPI-Host': 'v3.football.api-sports.io',
                }
            )
            
            response.raise_for_status()
            data = response.json()
            
            fixtures = data.get('response', [])
            print(f"[Football API] Found {len(fixtures)} head-to-head matches")
            
            return fixtures
        except Exception as e:
            import traceback
            print(f"[Football API] Error fetching head-to-head: {e}")
            print(traceback.format_exc())
            return []
    
    async def _get_match_details_football_data(self, fixture_id: int) -> Dict[str, Any]:
        """Get match details from Football-Data.org"""
        try:
            response = await self.client.get(
                f"{self.football_data_base}/matches/{fixture_id}",
                headers={'X-Auth-Token': self.football_data_key}
            )
            response.raise_for_status()
            match_data = response.json()
            
            # Format to match API-FOOTBALL structure
            return {
                'events': match_data.get('referees', []),  # Limited events in free tier
                'lineups': [],  # Lineups not available in free tier
                'statistics': [],  # Stats not available in free tier
                'match_data': match_data,  # Include raw data
            }
        except Exception as e:
            print(f"[Football API] Error fetching match details: {e}")
            return {}
    
    async def get_teams_by_competition(self, competition_id: int) -> List[Dict[str, Any]]:
        """Get all teams from a specific competition"""
        if self.football_data_key:
            return await self._get_teams_football_data(competition_id)
        elif self.api_football_key:
            return await self._get_teams_api_football(competition_id)
        else:
            return []
    
    async def _get_teams_football_data(self, competition_id: int) -> List[Dict[str, Any]]:
        """Get teams from Football-Data.org"""
        try:
            response = await self.client.get(
                f"{self.football_data_base}/competitions/{competition_id}/teams",
                headers={'X-Auth-Token': self.football_data_key}
            )
            response.raise_for_status()
            data = response.json()
            teams = data.get('teams', [])
            
            # Format teams
            formatted_teams = []
            for team in teams:
                formatted_teams.append({
                    'id': team.get('id'),
                    'name': team.get('name'),
                    'short_name': team.get('shortName'),
                    'logo': team.get('crest'),
                    'code': team.get('tla'),
                    'founded': team.get('founded'),
                    'venue': team.get('venue'),
                    'address': team.get('address'),
                    'website': team.get('website'),
                    'colors': team.get('clubColors'),
                })
            
            return formatted_teams
        except Exception as e:
            print(f"[Football API] Error fetching teams from Football-Data.org: {e}")
            return []
    
    async def _get_teams_api_football(self, league_id: int) -> List[Dict[str, Any]]:
        """Get teams from API-FOOTBALL"""
        try:
            current_year = datetime.now().year
            current_month = datetime.now().month
            season = current_year if current_month >= 8 else current_year - 1
            
            response = await self.client.get(
                f"{self.api_football_base}/teams",
                params={'league': league_id, 'season': season},
                headers={
                    'X-RapidAPI-Key': self.api_football_key,
                    'X-RapidAPI-Host': 'v3.football.api-sports.io',
                }
            )
            response.raise_for_status()
            data = response.json()
            teams = data.get('response', [])
            
            # Format teams
            formatted_teams = []
            for item in teams:
                team = item.get('team', {})
                formatted_teams.append({
                    'id': team.get('id'),
                    'name': team.get('name'),
                    'short_name': team.get('name'),  # API-FOOTBALL doesn't have short name
                    'logo': team.get('logo'),
                    'code': None,
                    'founded': team.get('founded'),
                    'venue': None,
                    'address': None,
                    'website': None,
                    'colors': None,
                })
            
            return formatted_teams
        except Exception as e:
            print(f"[Football API] Error fetching teams from API-FOOTBALL: {e}")
            return []
    
    async def get_all_uk_teams(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get all UK teams from multiple competitions
        Returns teams grouped by competition
        """
        # Football-Data.org competition IDs for UK leagues
        # See: https://www.football-data.org/documentation/quickstart
        uk_competitions = {
            'Premier League': 2021,      # Premier League
            'Championship': 2016,         # Championship
            'League One': 2017,          # League One
            'League Two': 2018,           # League Two
            'Scottish Premiership': 2019,  # Scottish Premiership
        }
        
        all_teams = {}
        
        if self.football_data_key:
            for comp_name, comp_id in uk_competitions.items():
                try:
                    print(f"[Football API] Fetching {comp_name} teams (ID: {comp_id})")
                    teams = await self._get_teams_football_data(comp_id)
                    if teams:
                        all_teams[comp_name] = teams
                        print(f"[Football API] Found {len(teams)} teams in {comp_name}")
                except Exception as e:
                    print(f"[Football API] Error fetching {comp_name} teams: {e}")
                    continue
        elif self.api_football_key:
            # API-FOOTBALL league IDs
            api_football_leagues = {
                'Premier League': 39,
                'Championship': 40,
                'League One': 41,
                'League Two': 42,
                'Scottish Premiership': 179,
            }
            
            for comp_name, league_id in api_football_leagues.items():
                try:
                    print(f"[Football API] Fetching {comp_name} teams (League ID: {league_id})")
                    teams = await self._get_teams_api_football(league_id)
                    if teams:
                        all_teams[comp_name] = teams
                        print(f"[Football API] Found {len(teams)} teams in {comp_name}")
                except Exception as e:
                    print(f"[Football API] Error fetching {comp_name} teams: {e}")
                    continue
        
        return all_teams
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Singleton instance
football_api_service = FootballAPIService()

