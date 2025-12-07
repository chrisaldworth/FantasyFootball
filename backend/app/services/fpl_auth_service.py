"""
FPL Authenticated Service - Handles login and team management via the FPL API

The FPL API uses session-based authentication. We need to:
1. Login to get session cookies
2. Use those cookies for authenticated requests
3. Include CSRF tokens where required
"""

import httpx
import re
from typing import Optional, Dict, Any, List
from cryptography.fernet import Fernet
from app.core.config import settings


class FPLAuthService:
    """Service for authenticated FPL operations (transfers, team changes, etc.)"""
    
    LOGIN_URL = "https://users.premierleague.com/accounts/login/"
    API_URL = "https://fantasy.premierleague.com/api"
    
    def __init__(self):
        self.encryption_key = self._get_or_create_encryption_key()
        self.fernet = Fernet(self.encryption_key)
    
    def _get_or_create_encryption_key(self) -> bytes:
        """Get encryption key from settings or generate one"""
        key = getattr(settings, 'FPL_ENCRYPTION_KEY', None)
        if key:
            return key.encode() if isinstance(key, str) else key
        # Generate a key if not set (for dev - in prod, set FPL_ENCRYPTION_KEY env var)
        return Fernet.generate_key()
    
    def encrypt_password(self, password: str) -> str:
        """Encrypt FPL password for storage"""
        return self.fernet.encrypt(password.encode()).decode()
    
    def decrypt_password(self, encrypted_password: str) -> str:
        """Decrypt FPL password for use"""
        return self.fernet.decrypt(encrypted_password.encode()).decode()
    
    async def login(self, email: str, password: str) -> Dict[str, Any]:
        """
        Login to FPL and return session info
        
        Returns:
            Dict with 'success', 'session_cookies', 'team_id', 'error'
        """
        async with httpx.AsyncClient(follow_redirects=True) as client:
            try:
                # First, get the login page to get CSRF token
                login_page = await client.get(self.LOGIN_URL)
                
                # Extract CSRF token from cookies
                csrf_token = login_page.cookies.get('csrftoken', '')
                
                # Prepare login data
                login_data = {
                    'login': email,
                    'password': password,
                    'app': 'plfpl-web',
                    'redirect_uri': 'https://fantasy.premierleague.com/',
                }
                
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Referer': self.LOGIN_URL,
                    'X-CSRFToken': csrf_token,
                }
                
                # Perform login
                response = await client.post(
                    self.LOGIN_URL,
                    data=login_data,
                    headers=headers,
                    cookies={'csrftoken': csrf_token},
                )
                
                # Check if login was successful by looking for certain cookies
                cookies = dict(response.cookies)
                all_cookies = {**dict(login_page.cookies), **cookies}
                
                # Check for session cookie (pl_profile or sessionid)
                if 'pl_profile' in all_cookies or 'sessionid' in all_cookies:
                    # Get user's team ID
                    me_response = await client.get(
                        f"{self.API_URL}/me/",
                        cookies=all_cookies,
                    )
                    
                    if me_response.status_code == 200:
                        me_data = me_response.json()
                        return {
                            'success': True,
                            'session_cookies': all_cookies,
                            'team_id': me_data.get('player', {}).get('entry'),
                            'player': me_data.get('player', {}),
                        }
                
                # Login failed
                return {
                    'success': False,
                    'error': 'Invalid email or password',
                }
                
            except Exception as e:
                return {
                    'success': False,
                    'error': str(e),
                }
    
    async def get_my_team(self, cookies: Dict[str, str], team_id: int) -> Dict[str, Any]:
        """Get authenticated user's current team with transfer info"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.API_URL}/my-team/{team_id}/",
                cookies=cookies,
            )
            response.raise_for_status()
            return response.json()
    
    async def save_team(
        self,
        cookies: Dict[str, str],
        team_id: int,
        picks: List[Dict[str, Any]],
        chip: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Save team selection (lineup, captain, bench order)
        
        Args:
            cookies: Session cookies from login
            team_id: User's FPL team ID
            picks: List of picks with element, position, is_captain, is_vice_captain
            chip: Optional chip to play ('bboost', '3xc', 'freehit', 'wildcard')
        
        Returns:
            Dict with success status and any error
        """
        async with httpx.AsyncClient() as client:
            try:
                # Format picks for API
                formatted_picks = []
                for pick in picks:
                    formatted_picks.append({
                        'element': pick['element'],
                        'position': pick['position'],
                        'is_captain': pick.get('is_captain', False),
                        'is_vice_captain': pick.get('is_vice_captain', False),
                    })
                
                payload = {'picks': formatted_picks}
                if chip:
                    payload['chip'] = chip
                
                response = await client.post(
                    f"{self.API_URL}/my-team/{team_id}/",
                    json=payload,
                    cookies=cookies,
                    headers={'Content-Type': 'application/json'},
                )
                
                if response.status_code == 200:
                    return {'success': True, 'data': response.json()}
                else:
                    return {
                        'success': False,
                        'error': response.text,
                        'status_code': response.status_code,
                    }
                    
            except Exception as e:
                return {'success': False, 'error': str(e)}
    
    async def make_transfers(
        self,
        cookies: Dict[str, str],
        team_id: int,
        transfers: List[Dict[str, int]],
        chip: Optional[str] = None,
        gameweek: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Make transfers
        
        Args:
            cookies: Session cookies from login
            team_id: User's FPL team ID
            transfers: List of {'element_in': id, 'element_out': id}
            chip: Optional chip ('freehit' or 'wildcard' for unlimited transfers)
            gameweek: Current gameweek
        
        Returns:
            Dict with success status and any error
        """
        async with httpx.AsyncClient() as client:
            try:
                # Get current team info to determine gameweek if not provided
                if gameweek is None:
                    bootstrap = await client.get(f"{self.API_URL}/bootstrap-static/")
                    events = bootstrap.json().get('events', [])
                    current_event = next((e for e in events if e['is_current']), None)
                    gameweek = current_event['id'] if current_event else 1
                
                payload = {
                    'transfers': transfers,
                    'chip': chip,
                    'entry': team_id,
                    'event': gameweek,
                }
                
                response = await client.post(
                    f"{self.API_URL}/transfers/",
                    json=payload,
                    cookies=cookies,
                    headers={'Content-Type': 'application/json'},
                )
                
                if response.status_code == 200:
                    return {'success': True, 'data': response.json()}
                else:
                    error_data = response.json() if response.text else {}
                    return {
                        'success': False,
                        'error': error_data.get('non_field_errors', [response.text])[0] if error_data else response.text,
                        'status_code': response.status_code,
                    }
                    
            except Exception as e:
                return {'success': False, 'error': str(e)}
    
    async def activate_chip(
        self,
        cookies: Dict[str, str],
        team_id: int,
        chip: str,
    ) -> Dict[str, Any]:
        """
        Activate a chip (without making other changes)
        
        Args:
            cookies: Session cookies from login
            team_id: User's FPL team ID
            chip: Chip to activate ('bboost', '3xc', 'freehit', 'wildcard')
        
        Returns:
            Dict with success status
        """
        # Get current team
        my_team = await self.get_my_team(cookies, team_id)
        picks = my_team.get('picks', [])
        
        # Re-save with chip
        return await self.save_team(cookies, team_id, picks, chip)
    
    async def verify_session(self, cookies: Dict[str, str]) -> bool:
        """Check if session cookies are still valid"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.API_URL}/me/",
                    cookies=cookies,
                )
                return response.status_code == 200
            except:
                return False


# Singleton instance
fpl_auth_service = FPLAuthService()

