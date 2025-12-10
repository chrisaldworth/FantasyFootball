"""
Football Cache Service - Caches football data to reduce API calls
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from app.services.football_api_service import football_api_service


class FootballCacheService:
    """Service for caching football data with TTL"""
    
    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.cache_ttl = {
            'today': timedelta(minutes=5),  # Today's fixtures - refresh every 5 min
            'upcoming': timedelta(hours=1),  # Upcoming fixtures - refresh hourly
            'results': timedelta(hours=6),   # Results - refresh every 6 hours
        }
    
    def _get_cache_key(self, data_type: str, league_id: Optional[int], team_id: Optional[int]) -> str:
        """Generate cache key"""
        key_parts = [data_type]
        if league_id:
            key_parts.append(f'league:{league_id}')
        if team_id:
            key_parts.append(f'team:{team_id}')
        return ':'.join(key_parts)
    
    def _is_cache_valid(self, cache_entry: Dict[str, Any], ttl: timedelta) -> bool:
        """Check if cache entry is still valid"""
        if not cache_entry:
            return False
        
        cached_at = cache_entry.get('cached_at')
        if not cached_at:
            return False
        
        if isinstance(cached_at, str):
            cached_at = datetime.fromisoformat(cached_at)
        
        return datetime.now() - cached_at < ttl
    
    async def get_todays_fixtures(
        self,
        league_id: Optional[int] = None,
        team_id: Optional[int] = None,
        force_refresh: bool = False
    ) -> List[Dict[str, Any]]:
        """Get today's fixtures with caching"""
        cache_key = self._get_cache_key('today', league_id, team_id)
        cached = self.cache.get(cache_key)
        
        if not force_refresh and cached and self._is_cache_valid(cached, self.cache_ttl['today']):
            return cached['data']
        
        # Fetch fresh data
        data = await football_api_service.get_todays_fixtures(league_id, team_id)
        
        # Update cache
        self.cache[cache_key] = {
            'data': data,
            'cached_at': datetime.now(),
        }
        
        return data
    
    async def get_upcoming_fixtures(
        self,
        days: int = 7,
        league_id: Optional[int] = None,
        team_id: Optional[int] = None,
        force_refresh: bool = False
    ) -> List[Dict[str, Any]]:
        """Get upcoming fixtures with caching"""
        cache_key = self._get_cache_key(f'upcoming:{days}', league_id, team_id)
        cached = self.cache.get(cache_key)
        
        if not force_refresh and cached and self._is_cache_valid(cached, self.cache_ttl['upcoming']):
            return cached['data']
        
        # Fetch fresh data
        data = await football_api_service.get_upcoming_fixtures(days, league_id, team_id)
        
        # Update cache
        self.cache[cache_key] = {
            'data': data,
            'cached_at': datetime.now(),
        }
        
        return data
    
    async def get_recent_results(
        self,
        days: int = 7,
        league_id: Optional[int] = None,
        team_id: Optional[int] = None,
        force_refresh: bool = False
    ) -> List[Dict[str, Any]]:
        """Get recent results with caching"""
        cache_key = self._get_cache_key(f'results:{days}', league_id, team_id)
        cached = self.cache.get(cache_key)
        
        if not force_refresh and cached and self._is_cache_valid(cached, self.cache_ttl['results']):
            return cached['data']
        
        # Fetch fresh data
        data = await football_api_service.get_recent_results(days, league_id, team_id)
        
        # Update cache
        self.cache[cache_key] = {
            'data': data,
            'cached_at': datetime.now(),
        }
        
        return data
    
    def clear_cache(self, cache_key: Optional[str] = None):
        """Clear cache (all or specific key)"""
        if cache_key:
            self.cache.pop(cache_key, None)
        else:
            self.cache.clear()


# Singleton instance
football_cache_service = FootballCacheService()

