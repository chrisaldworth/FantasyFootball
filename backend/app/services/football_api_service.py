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
        """Get today's fixtures from API-FOOTBALL"""
        today = datetime.now().strftime('%Y-%m-%d')
        
        params = {'date': today}
        if league_id:
            params['league'] = league_id
        if team_id:
            params['team'] = team_id
        
        try:
            print(f"[Football API] Fetching fixtures for date={today}, league={league_id}, team={team_id}")
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
            fixtures = data.get('response', [])
            print(f"[Football API] Found {len(fixtures)} fixtures")
            
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
        
        params = {'from': today.strftime('%Y-%m-%d'), 'to': end_date}
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
            
            # Filter to only upcoming (status not finished)
            return [
                f for f in fixtures 
                if f.get('fixture', {}).get('status', {}).get('long') != 'Match Finished'
            ]
        except Exception as e:
            print(f"[Football API] Error fetching upcoming fixtures: {e}")
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
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Singleton instance
football_api_service = FootballAPIService()

