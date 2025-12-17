"""
FPL Authenticated Service - Handles login and team management via the FPL API

The FPL API uses session-based authentication. We use Playwright for login
since FPL requires JavaScript execution for authentication.
"""

import httpx
import re
from typing import Optional, Dict, Any, List
from cryptography.fernet import Fernet
from app.core.config import settings

# Try to import Playwright, fall back to httpx if not available
try:
    from playwright.async_api import async_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("[FPL Auth] Playwright not available, falling back to httpx")


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
        
        Uses Playwright for browser automation to handle JavaScript-based authentication.
        Falls back to httpx if Playwright is not available.
        
        Returns:
            Dict with 'success', 'session_cookies', 'team_id', 'error'
        """
        # Try Playwright first (handles JavaScript auth)
        if PLAYWRIGHT_AVAILABLE:
            return await self._login_with_playwright(email, password)
        else:
            # Fallback to httpx
            return await self._login_with_httpx(email, password)
    
    async def _login_with_playwright(self, email: str, password: str) -> Dict[str, Any]:
        """Login using Playwright browser automation"""
        try:
            async with async_playwright() as p:
                # Launch browser (headless)
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                )
                page = await context.new_page()
                
                # Navigate to login page with increased timeout and more reliable wait condition
                # Use 'load' instead of 'networkidle' as it's more reliable for FPL login page
                try:
                    await page.goto(self.LOGIN_URL, wait_until='load', timeout=60000)
                except Exception as goto_error:
                    # If 'load' fails, try 'domcontentloaded' which is faster
                    try:
                        await page.goto(self.LOGIN_URL, wait_until='domcontentloaded', timeout=60000)
                    except Exception:
                        # Last resort: just navigate without waiting
                        await page.goto(self.LOGIN_URL, timeout=60000)
                
                # Wait a bit for any dynamic content to load
                await page.wait_for_timeout(2000)
                
                # Fill in login form
                await page.fill('input[name="login"], input[type="email"], input[id*="login"], input[id*="email"]', email)
                await page.fill('input[name="password"], input[type="password"], input[id*="password"]', password)
                
                # Submit form
                await page.click('button[type="submit"], input[type="submit"], button:has-text("Log in"), button:has-text("Sign in")')
                
                # Wait for navigation (either success redirect or error page)
                # Use 'load' instead of 'networkidle' for more reliable waiting
                try:
                    await page.wait_for_url('**/fantasy.premierleague.com/**', timeout=30000)
                    # Wait for page to fully load
                    await page.wait_for_load_state('load', timeout=10000)
                except Exception as nav_error:
                    # Wait a bit for page to load even if URL check fails
                    await page.wait_for_timeout(3000)
                
                # Check if we're logged in by looking for error messages or redirect
                # Ensure URL is converted to string - page.url returns a URL object
                current_url = ''
                try:
                    url_obj = page.url
                    # Force conversion to string
                    if url_obj:
                        current_url = str(url_obj)
                    else:
                        # Fallback: get URL from JavaScript
                        current_url = await page.evaluate('window.location.href') or ''
                except Exception as url_error:
                    # Fallback: get URL from JavaScript
                    try:
                        current_url = await page.evaluate('window.location.href') or ''
                    except:
                        current_url = ''
                
                # Ensure current_url is definitely a string before using .lower()
                if not isinstance(current_url, str):
                    current_url = str(current_url) if current_url else ''
                
                # Check for error messages on page
                error_elements = await page.query_selector_all(
                    '.error, .alert-error, [class*="error"], [class*="Error"], div:has-text("Invalid"), div:has-text("incorrect")'
                )
                
                if error_elements:
                    error_text = await error_elements[0].inner_text()
                    await browser.close()
                    return {
                        'success': False,
                        'error': f'Invalid email or password: {error_text[:100]}',
                    }
                
                # If still on login page, login failed - ensure current_url is string
                current_url_str = str(current_url) if current_url else ''
                if 'login' in current_url_str.lower() or 'accounts/login' in current_url_str.lower():
                    await browser.close()
                    return {
                        'success': False,
                        'error': 'Login failed - still on login page. Please check your credentials.',
                    }
                
                # Get cookies from browser context
                cookies = await context.cookies()
                cookie_dict = {cookie['name']: cookie['value'] for cookie in cookies}
                
                # Try to get team ID from /me endpoint using cookies
                async with httpx.AsyncClient() as client:
                    me_response = await client.get(
                        f"{self.API_URL}/me/",
                        cookies=cookie_dict,
                        headers={'User-Agent': 'Mozilla/5.0'},
                    )
                    
                    if me_response.status_code == 200:
                        me_data = me_response.json()
                        team_id = me_data.get('player', {}).get('entry')
                        
                        await browser.close()
                        
                        if team_id:
                            return {
                                'success': True,
                                'session_cookies': cookie_dict,
                                'team_id': team_id,
                                'player': me_data.get('player', {}),
                            }
                
                await browser.close()
                return {
                    'success': False,
                    'error': 'Login may have succeeded but could not verify team ID',
                }
                
        except Exception as e:
            import traceback
            error_str = str(e)
            
            # Provide user-friendly error messages
            if 'timeout' in error_str.lower() or 'Timeout' in error_str:
                user_message = 'Connection timeout. The FPL website may be slow or unavailable. Please try again in a moment.'
            elif 'navigation' in error_str.lower():
                user_message = 'Unable to reach the FPL login page. Please check your internet connection and try again.'
            else:
                user_message = f'Login failed: {error_str[:200]}'  # Limit error message length
            
            return {
                'success': False,
                'error': user_message,
                'details': traceback.format_exc() if getattr(settings, 'DEBUG', False) else None,
            }
    
    async def _login_with_httpx(self, email: str, password: str) -> Dict[str, Any]:
        """Fallback login using httpx (for when Playwright is not available)"""
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
                
                # Make login request (don't follow redirects yet)
                response = await client.post(
                    self.LOGIN_URL,
                    data=login_data,
                    headers=headers,
                    cookies=cookies_with_csrf,
                    follow_redirects=False,  # Don't auto-follow, we'll do it manually
                )
                
                # Merge cookies from initial request and login response
                all_cookies = {**initial_cookies, **dict(response.cookies)}
                
                # Check if we got redirected (successful login usually redirects)
                if response.status_code in [302, 301, 303, 307, 308]:
                    redirect_location = response.headers.get('Location', '')
                    
                    # Follow the redirect to get final session cookies
                    if redirect_location:
                        # Make sure it's an absolute URL
                        if redirect_location.startswith('/'):
                            redirect_location = 'https://fantasy.premierleague.com' + redirect_location
                        elif not redirect_location.startswith('http'):
                            redirect_location = 'https://fantasy.premierleague.com/' + redirect_location
                        
                        # Follow redirect
                        redirect_response = await client.get(
                            redirect_location,
                            cookies=all_cookies,
                            follow_redirects=True,
                            headers={
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            }
                        )
                        
                        # Merge cookies from redirect
                        all_cookies = {**all_cookies, **dict(redirect_response.cookies)}
                
                # Check response status
                if response.status_code in [200, 302, 301, 303, 307, 308]:
                    # Check for successful login cookies
                    # FPL uses various cookie names for authenticated sessions
                    session_indicators = [
                        'pl_profile', 'sessionid', 'pl_session', 
                        'pl_auth', 'auth_token', 'fpl_session'
                    ]
                    
                    has_session = any(indicator in all_cookies for indicator in session_indicators)
                    
                    # Also check if we got redirected to the main FPL page (indicates success)
                    if response.status_code in [302, 301, 303, 307, 308]:
                        redirect_location = str(response.headers.get('Location', ''))
                        if 'fantasy.premierleague.com' in redirect_location and 'login' not in redirect_location.lower():
                            has_session = True  # Redirected away from login = likely success
                    
                    if has_session:
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
                        # Check response body for error messages
                        response_text = response.text.lower() if hasattr(response, 'text') else ''
                        error_indicators = ['error', 'invalid', 'incorrect', 'wrong password', 'login failed']
                        
                        if any(indicator in response_text for indicator in error_indicators):
                            return {
                                'success': False,
                                'error': 'Invalid email or password',
                            }
                        
                        # Check if we're still on login page (failed login)
                        response_url = str(response.url) if hasattr(response, 'url') else ''
                        if 'login' in response_url.lower() or 'accounts/login' in response_url.lower():
                            return {
                                'success': False,
                                'error': 'Login failed - still on login page. Please check your credentials.',
                            }
                        
                        return {
                            'success': False,
                            'error': f'Login failed - no session cookies received. Status: {response.status_code}, Cookies: {list(all_cookies.keys())}',
                        }
                else:
                    # Check response for error details
                    error_msg = f'Login request failed with status {response.status_code}'
                    if hasattr(response, 'text') and response.text:
                        # Try to extract error message
                        import re
                        error_match = re.search(r'<[^>]*class="[^"]*error[^"]*"[^>]*>([^<]+)', response.text, re.IGNORECASE)
                        if error_match:
                            error_msg += f": {error_match.group(1).strip()}"
                    
                    return {
                        'success': False,
                        'error': error_msg,
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

