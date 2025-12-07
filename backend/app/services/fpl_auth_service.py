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
        async with httpx.AsyncClient(follow_redirects=False, timeout=30.0) as client:
            try:
                # First, get the login page to get CSRF token and cookies
                login_page = await client.get(
                    self.LOGIN_URL,
                    headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                    }
                )
                
                # Extract CSRF token from cookies (primary method)
                csrf_token = login_page.cookies.get('csrftoken', '') or login_page.cookies.get('csrfmiddlewaretoken', '')
                
                # Also try to extract from HTML if not in cookies
                if not csrf_token and login_page.text:
                    import re
                    # Try multiple patterns for CSRF token in HTML
                    patterns = [
                        r'name="csrfmiddlewaretoken"\s+value="([^"]+)"',
                        r'name="csrf_token"\s+value="([^"]+)"',
                        r'"csrfmiddlewaretoken":\s*"([^"]+)"',
                        r'csrfToken["\']?\s*[:=]\s*["\']([^"\']+)',
                        r'<input[^>]*name=["\']csrfmiddlewaretoken["\'][^>]*value=["\']([^"\']+)',
                    ]
                    
                    for pattern in patterns:
                        csrf_match = re.search(pattern, login_page.text, re.IGNORECASE)
                        if csrf_match:
                            csrf_token = csrf_match.group(1)
                            break
                
                # Try getting from Set-Cookie header
                if not csrf_token:
                    for cookie in login_page.headers.get_list('Set-Cookie', []):
                        if 'csrftoken=' in cookie:
                            csrf_match = re.search(r'csrftoken=([^;]+)', cookie)
                            if csrf_match:
                                csrf_token = csrf_match.group(1)
                                break
                
                # If still no token, try a different approach - make a HEAD request first
                if not csrf_token:
                    head_response = await client.head(self.LOGIN_URL)
                    csrf_token = head_response.cookies.get('csrftoken', '') or head_response.cookies.get('csrfmiddlewaretoken', '')
                
                if not csrf_token:
                    # Last resort: try to proceed without CSRF token (some endpoints allow this)
                    # But log a warning
                    print(f"[FPL Auth] Warning: Could not extract CSRF token. Page length: {len(login_page.text) if login_page.text else 0}")
                    # We'll still try the login, but it may fail
                
                # Get all cookies from initial request
                initial_cookies = dict(login_page.cookies)
                
                # Prepare login data - FPL uses specific field names
                login_data = {
                    'login': email,
                    'password': password,
                    'app': 'plfpl-web',
                    'redirect_uri': 'https://fantasy.premierleague.com/',
                }
                
                # Build headers
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Referer': self.LOGIN_URL,
                    'Origin': 'https://users.premierleague.com',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
                
                # Add CSRF token to headers if we have it
                if csrf_token:
                    headers['X-CSRFToken'] = csrf_token
                    headers['X-CSRF-Token'] = csrf_token
                
                # Perform login - try with cookies including CSRF
                cookies_with_csrf = initial_cookies.copy()
                if csrf_token:
                    cookies_with_csrf['csrftoken'] = csrf_token
                
                response = await client.post(
                    self.LOGIN_URL,
                    data=login_data,
                    headers=headers,
                    cookies=cookies_with_csrf,
                )
                
                # Merge all cookies
                all_cookies = {**initial_cookies, **dict(response.cookies)}
                
                # Check response status
                if response.status_code == 302 or response.status_code == 200:
                    # Check for successful login cookies
                    # FPL uses 'pl_profile' or 'sessionid' for authenticated sessions
                    if 'pl_profile' in all_cookies or 'sessionid' in all_cookies or 'pl_session' in all_cookies:
                        # Try to get user info to verify login
                        me_response = await client.get(
                            f"{self.API_URL}/me/",
                            cookies=all_cookies,
                            headers={
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            }
                        )
                        
                        if me_response.status_code == 200:
                            me_data = me_response.json()
                            team_id = me_data.get('player', {}).get('entry')
                            
                            if team_id:
                                return {
                                    'success': True,
                                    'session_cookies': all_cookies,
                                    'team_id': team_id,
                                    'player': me_data.get('player', {}),
                                }
                            else:
                                return {
                                    'success': False,
                                    'error': 'Login successful but could not find team ID',
                                }
                        else:
                            # Try alternative: check if we can access my-team endpoint
                            # First need to get team ID from user's FPL team
                            # For now, return error with more info
                            return {
                                'success': False,
                                'error': f'Login may have succeeded but could not verify (status: {me_response.status_code})',
                            }
                    else:
                        # Check if we got redirected to an error page
                        if 'error' in response.text.lower() or 'invalid' in response.text.lower():
                            return {
                                'success': False,
                                'error': 'Invalid email or password',
                            }
                        return {
                            'success': False,
                            'error': 'Login failed - no session cookies received',
                        }
                else:
                    return {
                        'success': False,
                        'error': f'Login request failed with status {response.status_code}',
                    }
                
            except httpx.TimeoutException:
                return {
                    'success': False,
                    'error': 'Request timed out. Please try again.',
                }
            except Exception as e:
                import traceback
                error_details = traceback.format_exc()
                debug_info = error_details if getattr(settings, 'DEBUG', False) else None
                return {
                    'success': False,
                    'error': f'Login error: {str(e)}',
                    'details': debug_info,
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

