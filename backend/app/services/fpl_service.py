import httpx
from typing import Optional, Dict, Any, List
from app.core.config import settings


class FPLService:
    """Service for interacting with the Fantasy Premier League API"""
    
    def __init__(self):
        self.base_url = settings.FPL_BASE_URL
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def get_bootstrap_static(self) -> Dict[str, Any]:
        """
        Get all static FPL data including:
        - All players (elements)
        - All teams
        - All events (gameweeks)
        - Game settings
        """
        response = await self.client.get(f"{self.base_url}/bootstrap-static/")
        response.raise_for_status()
        return response.json()
    
    async def get_player_summary(self, player_id: int) -> Dict[str, Any]:
        """Get detailed player data including fixture and history"""
        response = await self.client.get(f"{self.base_url}/element-summary/{player_id}/")
        response.raise_for_status()
        return response.json()
    
    async def get_fixtures(self) -> List[Dict[str, Any]]:
        """Get all fixtures for the season"""
        response = await self.client.get(f"{self.base_url}/fixtures/")
        response.raise_for_status()
        return response.json()
    
    async def get_gameweek_fixtures(self, gameweek: int) -> List[Dict[str, Any]]:
        """Get fixtures for a specific gameweek"""
        response = await self.client.get(f"{self.base_url}/fixtures/?event={gameweek}")
        response.raise_for_status()
        return response.json()
    
    async def get_live_gameweek(self, gameweek: int) -> Dict[str, Any]:
        """Get live scores for a gameweek"""
        response = await self.client.get(f"{self.base_url}/event/{gameweek}/live/")
        response.raise_for_status()
        return response.json()
    
    async def get_user_team(self, team_id: int) -> Dict[str, Any]:
        """Get basic info about a user's FPL team"""
        response = await self.client.get(f"{self.base_url}/entry/{team_id}/")
        response.raise_for_status()
        return response.json()
    
    async def get_user_picks(self, team_id: int, gameweek: int) -> Dict[str, Any]:
        """Get a user's squad picks for a specific gameweek"""
        response = await self.client.get(f"{self.base_url}/entry/{team_id}/event/{gameweek}/picks/")
        response.raise_for_status()
        return response.json()
    
    async def get_user_history(self, team_id: int) -> Dict[str, Any]:
        """Get a user's history (past seasons, chips, etc)"""
        response = await self.client.get(f"{self.base_url}/entry/{team_id}/history/")
        response.raise_for_status()
        return response.json()
    
    async def get_user_transfers(self, team_id: int) -> List[Dict[str, Any]]:
        """Get a user's transfer history"""
        response = await self.client.get(f"{self.base_url}/entry/{team_id}/transfers/")
        response.raise_for_status()
        return response.json()
    
    async def get_classic_league(self, league_id: int, page: int = 1) -> Dict[str, Any]:
        """Get classic league standings"""
        response = await self.client.get(
            f"{self.base_url}/leagues-classic/{league_id}/standings/",
            params={"page_standings": page}
        )
        response.raise_for_status()
        return response.json()
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Singleton instance
fpl_service = FPLService()

