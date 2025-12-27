#!/usr/bin/env python3
"""
Simple Premier League fixtures scraper from fbref.com
Goes to Scores and Fixtures page, extracts all match report URLs, and scrapes each match.

Usage:
    python scripts/scrape_fixtures_simple.py --season 25/26
"""

import argparse
import json
import time
import os
import re
from datetime import datetime
from typing import List, Dict
import sys

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
except ImportError:
    print("Error: selenium is not installed. Install it with: pip install selenium")
    sys.exit(1)

import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


def get_season_url(season: str) -> str:
    """Get the fbref.com URL for a specific Premier League season"""
    if '/' in season:
        parts = season.split('/')
        year1 = int(parts[0])
        year2 = int(parts[1])
        if year1 < 50:
            year1 = 2000 + year1
        if year2 < 50:
            year2 = 2000 + year2
        season_slug = f"{year1}-{year2}"
        return f"https://fbref.com/en/comps/9/{season_slug}/schedule/{season_slug}-Premier-League-Scores-and-Fixtures"
    else:
        return f"https://fbref.com/en/comps/9/{season}/schedule/{season}-Premier-League-Scores-and-Fixtures"


def setup_driver(headless: bool = True):
    """Setup Chrome WebDriver with Cloudflare bypass options"""
    logger.info("Setting up Chrome WebDriver...")
    chrome_options = Options()
    
    if headless:
        chrome_options.add_argument('--headless=new')
    else:
        logger.info("  Running in visible mode (better for Cloudflare bypass)")
    
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('--disable-features=IsolateOrigins,site-per-process')
    
    # Better stealth options
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation", "enable-logging"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Set realistic user agent
    user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    chrome_options.add_argument(f'--user-agent={user_agent}')
    chrome_options.add_argument('--lang=en-US,en;q=0.9')
    chrome_options.add_argument('--window-size=1920,1080')
    
    # Try to use undetected-chromedriver for better Cloudflare bypass
    try:
        import undetected_chromedriver as uc
        logger.info("  Using undetected-chromedriver for better Cloudflare bypass")
        
        uc_options = uc.ChromeOptions()
        if headless:
            uc_options.add_argument('--headless=new')
        else:
            logger.info("  Running in visible mode (recommended for Cloudflare)")
        
        uc_options.add_argument('--no-sandbox')
        uc_options.add_argument('--disable-dev-shm-usage')
        
        # Use a specific user data directory to ensure single instance
        import tempfile
        user_data_dir = tempfile.mkdtemp(prefix='chrome_scraper_')
        uc_options.add_argument(f'--user-data-dir={user_data_dir}')
        
        # Prevent multiple instances
        uc_options.add_argument('--disable-blink-features=AutomationControlled')
        
        driver = uc.Chrome(options=uc_options, version_main=None)
        logger.info("✓ Chrome WebDriver initialized successfully (undetected mode)")
        logger.info(f"  Browser window handle: {driver.current_window_handle}")
        
        # Ensure we start with a blank page, not Google
        driver.get("about:blank")
        time.sleep(0.5)
        
        return driver
    except ImportError:
        logger.warning("  undetected-chromedriver not installed, using standard Selenium")
        logger.info("  Install with: pip install undetected-chromedriver")
        logger.info("  This will significantly improve Cloudflare bypass")
    except Exception as e:
        logger.warning(f"  Failed to use undetected-chromedriver: {e}")
        logger.info("  Falling back to standard Selenium")
    
    # Fallback to standard Selenium
    try:
        from selenium.webdriver.chrome.service import Service
        service = Service()
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # Remove automation indicators
        driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
            'source': '''
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
            '''
        })
        
        driver.execute_cdp_cmd('Network.setUserAgentOverride', {
            "userAgent": user_agent,
            "platform": "MacIntel",
            "acceptLanguage": "en-US,en;q=0.9"
        })
        
        logger.info("✓ Chrome WebDriver initialized successfully (standard mode)")
        
        # Ensure we start with a blank page, not Google
        driver.get("about:blank")
        time.sleep(0.5)
        
        return driver
    except Exception as e:
        logger.error(f"Error setting up Chrome driver: {e}")
        raise


def get_premier_league_clubs() -> Dict:
    """Get list of Premier League clubs for filtering"""
    return {
        'Arsenal': {'variations': ['Arsenal', 'Gunners']},
        'Aston Villa': {'variations': ['Aston Villa', 'Villa']},
        'Bournemouth': {'variations': ['Bournemouth', 'Cherries']},
        'Brentford': {'variations': ['Brentford', 'Bees']},
        'Brighton': {'variations': ['Brighton', 'Brighton and Hove Albion', 'Seagulls']},
        'Chelsea': {'variations': ['Chelsea', 'Blues']},
        'Crystal Palace': {'variations': ['Crystal Palace', 'Palace', 'Eagles']},
        'Everton': {'variations': ['Everton', 'Toffees']},
        'Fulham': {'variations': ['Fulham', 'Cottagers']},
        'Ipswich': {'variations': ['Ipswich', 'Ipswich Town', 'Tractor Boys']},
        'Leicester': {'variations': ['Leicester', 'Leicester City', 'Foxes']},
        'Liverpool': {'variations': ['Liverpool', 'Reds']},
        'Manchester City': {'variations': ['Manchester City', 'Man City', 'City', 'Citizens']},
        'Manchester Utd': {'variations': ['Manchester Utd', 'Manchester United', 'Man United', 'Man Utd', 'United', 'Red Devils']},
        'Newcastle Utd': {'variations': ['Newcastle Utd', 'Newcastle United', 'Newcastle', 'Magpies']},
        'Nottingham Forest': {'variations': ['Nottingham Forest', 'Nott\'ham Forest', 'Forest']},
        'Southampton': {'variations': ['Southampton', 'Saints']},
        'Tottenham': {'variations': ['Tottenham', 'Tottenham Hotspur', 'Spurs']},
        'West Ham': {'variations': ['West Ham', 'West Ham United', 'Hammers']},
        'Wolves': {'variations': ['Wolves', 'Wolverhampton Wanderers', 'Wanderers']},
    }


def is_premier_league_club(team_name: str, pl_clubs: Dict) -> bool:
    """Check if a team name matches a Premier League club"""
    team_name_lower = team_name.lower()
    for club_name, club_info in pl_clubs.items():
        if team_name == club_name or team_name_lower == club_name.lower():
            return True
        for variation in club_info.get('variations', []):
            if team_name == variation or team_name_lower == variation.lower():
                return True
        if club_name.lower() in team_name_lower or team_name_lower in club_name.lower():
            return True
    return False


def check_and_handle_cloudflare(driver, headless: bool = True):
    """Check for Cloudflare challenge and wait for verification if needed"""
    page_text = driver.page_source.lower()
    page_title = driver.title.lower()
    current_url = driver.current_url.lower()
    
    cloudflare_indicators = [
        'checking your browser',
        'cloudflare',
        'challenge',
        'verify you are human',
        'just a moment',
        'ddos protection',
        'ray id',
        'cf-browser-verification',
        'cf-challenge',
        'cf-ray',
        'checking if the site connection is secure',
        'please wait',
        'you are being rate limited'
    ]
    
    # Strong Cloudflare challenge indicators
    strong_cloudflare_indicators = [
        'just a moment',
        'checking your browser',
        'verify you are human',
        'please wait while we verify',
        'ddos protection by cloudflare',
        'cf-browser-verification'
    ]
    
    # Positive indicators that page has loaded
    page_loaded_indicators = [
        'premier league',
        'scores and fixtures',
        'match report',
        'stats_table',
        'schedule',
        'fbref.com',
        '<tbody>',
        '<table',
        'squad'
    ]
    
    # Check if we're on a Cloudflare challenge page
    is_cloudflare = (
        any(indicator in page_text for indicator in cloudflare_indicators) or
        any(indicator in page_title for indicator in cloudflare_indicators) or
        any(indicator in current_url for indicator in cloudflare_indicators) or
        'ray id' in page_text or
        len(page_text) < 5000
    )
    
    if is_cloudflare:
        if not headless:
            logger.warning("  ⚠ Cloudflare challenge detected!")
            logger.warning(f"  📄 Page title: {driver.title}")
            logger.warning(f"  🔗 Current URL: {current_url[:100]}")
            logger.warning(f"  🪟 Browser window handle: {driver.current_window_handle}")
            logger.warning(f"  📊 Total windows: {len(driver.window_handles)}")
            
            # Close extra windows if any
            if len(driver.window_handles) > 1:
                logger.warning(f"  ⚠ Multiple browser windows detected! Closing extra windows...")
                main_window = driver.current_window_handle
                for handle in driver.window_handles:
                    if handle != main_window:
                        try:
                            driver.switch_to.window(handle)
                            driver.close()
                            logger.info(f"  ✓ Closed extra window: {handle}")
                        except:
                            pass
                driver.switch_to.window(main_window)
                logger.info(f"  ✓ Using main window: {driver.current_window_handle}")
            
            logger.info("  👤 Please check the browser window and complete any verification")
            logger.info("  ⏳ Waiting up to 5 minutes for manual verification...")
            logger.info("  📌 Once verified, the script will continue automatically")
            logger.info("  💡 If you see a checkbox or challenge, please complete it now")
            
            # Wait for Cloudflare to clear (up to 5 minutes)
            for i in range(300):
                time.sleep(1)
                
                # Make sure we're on the correct window
                if len(driver.window_handles) > 1:
                    driver.switch_to.window(driver.window_handles[0])
                
                try:
                    current_text = driver.page_source.lower()
                    current_title = driver.title.lower()
                    current_url_check = driver.current_url.lower()
                    
                    # Check if page has loaded (positive check)
                    has_loaded_content = any(indicator in current_text for indicator in page_loaded_indicators) or \
                                        any(indicator in current_title for indicator in page_loaded_indicators) or \
                                        'fbref' in current_url_check
                    
                    # Check if still on Cloudflare challenge
                    still_on_challenge = any(indicator in current_title.lower() for indicator in strong_cloudflare_indicators) or \
                                        ('just a moment' in current_title.lower() and len(current_text) < 10000)
                    
                    # Page is loaded if it has content AND is not on challenge page
                    if has_loaded_content and not still_on_challenge and len(current_text) > 5000:
                        logger.info(f"  ✓ Cloudflare verification completed after {i+1} seconds")
                        logger.info(f"  📄 New page title: {driver.title}")
                        logger.info(f"  🔗 New URL: {driver.current_url[:80]}")
                        logger.info(f"  📊 Page size: {len(current_text)} chars")
                        logger.info("  ✅ Continuing...")
                        time.sleep(2)
                        return True
                    
                    if i % 10 == 0 and i > 0:
                        logger.info(f"  Still waiting for verification... ({i+1}s / 300s)")
                        logger.info(f"  Current page: {driver.title[:50]}")
                        logger.info(f"  Page size: {len(current_text)} chars")
                        logger.info(f"  Has content: {has_loaded_content}, Still challenge: {still_on_challenge}")
                except Exception as e:
                    logger.debug(f"  Error checking page: {e}")
                    continue
            
            logger.warning("  ⚠ Cloudflare verification timeout after 5 minutes")
            return False
        else:
            logger.warning("  ⚠ Cloudflare challenge detected - consider using --no-headless")
            logger.warning("  ⏳ Waiting up to 2 minutes for automatic resolution...")
            for i in range(120):
                time.sleep(1)
                current_text = driver.page_source.lower()
                if not any(indicator in current_text for indicator in strong_cloudflare_indicators):
                    logger.info(f"  ✓ Cloudflare check passed after {i+1} seconds")
                    return True
                if i % 10 == 0 and i > 0:
                    logger.info(f"  Still waiting... ({i+1}s)")
            return False
    
    return True


def extract_match_report_urls_from_schedule(driver, season: str, headless: bool = True) -> List[Dict]:
    """
    Extract all match report URLs from the Premier League Scores and Fixtures page
    
    Returns:
        List of match dictionaries with home_team, away_team, match_report_url, date, score
    """
    url = get_season_url(season)
    logger.info(f"Loading schedule page: {url}")
    
    # Navigate to URL
    driver.get(url)
    time.sleep(3)  # Wait for page to start loading
    current_url = driver.current_url
    logger.info(f"  Current URL: {current_url}")
    
    # Check if we're on Google or wrong page
    if 'google.com' in current_url.lower():
        logger.error("  ✗ Browser opened to Google instead of fbref.com!")
        logger.info("  Retrying navigation...")
        time.sleep(2)
        driver.get(url)
        time.sleep(3)
        current_url = driver.current_url
        logger.info(f"  Current URL after retry: {current_url}")
        
        if 'google.com' in current_url.lower():
            logger.error("  ✗ Still on Google. Please check Chrome/ChromeDriver configuration")
            raise Exception("Failed to navigate to fbref.com - browser keeps opening to Google")
    
    # Check for Cloudflare
    if not headless:
        logger.info("")
        logger.info("=" * 80)
        logger.info("🌐 BROWSER IS NOW OPEN - CHECK IT NOW!")
        logger.info("=" * 80)
        logger.info(f"📄 Current page: {driver.title}")
        logger.info(f"🔗 URL: {driver.current_url[:80]}...")
        logger.info(f"🪟 Window handle: {driver.current_window_handle}")
        logger.info(f"📊 Total windows: {len(driver.window_handles)}")
        
        # Close extra windows if any
        if len(driver.window_handles) > 1:
            logger.warning(f"  ⚠ Multiple browser windows detected! Closing extra windows...")
            main_window = driver.current_window_handle
            for handle in driver.window_handles:
                if handle != main_window:
                    try:
                        driver.switch_to.window(handle)
                        driver.close()
                        logger.info(f"  ✓ Closed extra window: {handle}")
                    except:
                        pass
            driver.switch_to.window(main_window)
            logger.info(f"  ✓ Using main window: {driver.current_window_handle}")
        
        logger.info("  👤 Please check the browser window for Cloudflare verification")
        logger.info("  ⏳ Waiting 10 seconds for you to check...")
        logger.info("=" * 80)
        logger.info("")
        
        for i in range(10, 0, -1):
            logger.info(f"⏳ Starting in {i} seconds... (check browser now!)")
            time.sleep(1)
        
        logger.info("✅ Continuing...")
        logger.info("")
    
    # Check and handle Cloudflare
    if not check_and_handle_cloudflare(driver, headless):
        logger.error("✗ Cloudflare verification failed or timed out")
        return []
    
    # Wait for table to load
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
    except TimeoutException:
        logger.error("✗ Timeout waiting for schedule table to load")
        return []
    
    time.sleep(2)  # Extra wait for dynamic content
    
    # Find the schedule table
    table = None
    table_selectors = [
        (By.XPATH, f"//table[@id[contains(., 'sched')]]"),
        (By.XPATH, "//table[contains(@class, 'stats_table')]"),
        (By.TAG_NAME, "table")
    ]
    
    for selector_type, selector_value in table_selectors:
        try:
            tables = driver.find_elements(selector_type, selector_value)
            if tables:
                table = tables[0]
                logger.info(f"✓ Found schedule table using: {selector_value}")
                break
        except:
            continue
    
    if not table:
        logger.error("✗ Could not find schedule table")
        return []
    
    # Get Premier League clubs for filtering
    pl_clubs = get_premier_league_clubs()
    
    # Extract matches from table
    tbody = table.find_element(By.TAG_NAME, "tbody")
    rows = tbody.find_elements(By.TAG_NAME, "tr")
    
    logger.info(f"Found {len(rows)} rows in schedule table")
    
    matches = []
    for row in rows:
        try:
            # Skip header rows
            if row.find_elements(By.TAG_NAME, "th") and not row.find_elements(By.TAG_NAME, "td"):
                continue
            
            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) < 5:
                continue
            
            # Find team links (home and away)
            team_links = row.find_elements(By.XPATH, ".//a[contains(@href, '/squads/')]")
            if len(team_links) < 2:
                continue
            
            home_team = team_links[0].text.strip()
            away_team = team_links[1].text.strip()
            
            # Only include Premier League matches (both teams must be PL clubs)
            if not (is_premier_league_club(home_team, pl_clubs) and is_premier_league_club(away_team, pl_clubs)):
                continue
            
            # Find match report URL
            match_report_url = None
            all_links = row.find_elements(By.TAG_NAME, "a")
            for link in all_links:
                href = link.get_attribute("href") or ""
                if ('/matches/' in href or '/match-report/' in href) and '/squads/' not in href and '/players/' not in href:
                    match_report_url = href
                    break
            
            if not match_report_url:
                continue
            
            # Extract date
            date = None
            for cell in cells:
                text = cell.text.strip()
                date_match = re.search(r'(\d{4}-\d{2}-\d{2})', text)
                if date_match:
                    date = date_match.group(1)
                    break
            
            # Extract score if available
            home_score = None
            away_score = None
            for cell in cells:
                text = cell.text.strip()
                score_match = re.search(r'(\d+)[\s:–-]+(\d+)', text)
                if score_match:
                    try:
                        home_score = int(score_match.group(1))
                        away_score = int(score_match.group(2))
                    except:
                        pass
                    break
            
            matches.append({
                'home_team': home_team,
                'away_team': away_team,
                'match_report_url': match_report_url,
                'date': date,
                'home_score': home_score,
                'away_score': away_score
            })
            
        except Exception as e:
            logger.debug(f"Error processing row: {e}")
            continue
    
    logger.info(f"✓ Extracted {len(matches)} Premier League matches from schedule")
    return matches


def navigate_to_match_report(driver, match_url: str, headless: bool = True) -> str:
    """
    Navigate from match page to match report page
    Returns the match report URL
    """
    logger.debug(f"  Navigating to match page: {match_url}")
    driver.get(match_url)
    time.sleep(2)  # Wait for page to load
    
    # Check for Cloudflare (quick check, don't wait long)
    page_text = driver.page_source.lower()
    page_title = driver.title.lower()
    
    strong_cloudflare_indicators = [
        'just a moment',
        'checking your browser',
        'verify you are human',
        'please wait while we verify',
        'ddos protection by cloudflare'
    ]
    
    # Only wait if we see strong Cloudflare indicators
    if any(indicator in page_title.lower() for indicator in strong_cloudflare_indicators):
        if not headless:
            logger.warning("  ⚠ Cloudflare detected on match page, waiting for verification...")
            for i in range(60):  # Wait up to 1 minute
                time.sleep(1)
                current_title = driver.title.lower()
                if not any(indicator in current_title for indicator in strong_cloudflare_indicators):
                    logger.info(f"  ✓ Cloudflare cleared after {i+1} seconds")
                    break
                if i % 10 == 0 and i > 0:
                    logger.info(f"  Still waiting... ({i+1}s)")
        else:
            time.sleep(5)  # Brief wait in headless mode
    
    # Wait for page to load
    try:
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    except:
        pass
    
    time.sleep(1)
    
    # Find "Match Report" link
    logger.debug("  Looking for 'Match Report' link...")
    report_links = driver.find_elements(By.XPATH, "//a[contains(text(), 'Match Report') or contains(text(), 'Report') or contains(@href, '/match-report/')]")
    
    match_report_url = None
    for link in report_links:
        href = link.get_attribute("href") or ""
        link_text = link.text.strip().lower()
        if '/match-report/' in href or ('match' in link_text and 'report' in link_text):
            match_report_url = href
            logger.debug(f"  ✓ Found match report link: {match_report_url}")
            break
    
    if not match_report_url:
        # Try finding any link with match-report in URL
        all_links = driver.find_elements(By.TAG_NAME, "a")
        for link in all_links:
            href = link.get_attribute("href") or ""
            if '/match-report/' in href:
                match_report_url = href
                logger.debug(f"  ✓ Found match report link (alternative): {match_report_url}")
                break
    
    if not match_report_url:
        logger.warning(f"  ⚠ No 'Match Report' link found, using match page URL directly")
        match_report_url = match_url
    
    return match_report_url


def scrape_match_report(driver, match_url: str, home_team: str, away_team: str, delay: float = 2.0, headless: bool = True) -> Dict:
    """
    Scrape comprehensive match data from a match report page
    First navigates to match page, then to match report page
    """
    # Import the comprehensive extraction function
    from scrape_fbref_comprehensive import extract_comprehensive_match_data
    
    logger.info(f"  Processing match: {home_team} vs {away_team}")
    
    # Step 1: Navigate to match page and find match report link
    match_report_url = navigate_to_match_report(driver, match_url, headless=headless)
    
    if match_report_url != match_url:
        logger.info(f"  ✓ Found match report page: {match_report_url}")
    else:
        logger.info(f"  Using match page directly: {match_url}")
    
    # Step 2: Scrape the match report page
    logger.info(f"  Scraping match report data...")
    match_data = extract_comprehensive_match_data(
        driver=driver,
        match_url=match_report_url,
        home_team=home_team,
        away_team=away_team,
        delay=delay,
        headless=headless
    )
    
    return match_data


def main():
    parser = argparse.ArgumentParser(description='Simple Premier League fixtures scraper')
    parser.add_argument('--season', type=str, default='25/26', help='Season to scrape (e.g., 25/26 or 2025-2026)')
    parser.add_argument('--delay', type=float, default=2.0, help='Delay between requests in seconds')
    parser.add_argument('--limit', type=int, help='Limit number of matches to scrape (for testing)')
    parser.add_argument('--no-headless', action='store_true', help='Run browser in visible mode')
    parser.add_argument('--output-dir', type=str, help='Output directory for match files')
    
    args = parser.parse_args()
    
    # Normalize season format
    if '/' in args.season:
        parts = args.season.split('/')
        year1 = int(parts[0])
        year2 = int(parts[1])
        if year1 < 50:
            year1 = 2000 + year1
        if year2 < 50:
            year2 = 2000 + year2
        season_normalized = f"{year1}-{year2}"
    else:
        season_normalized = args.season
    
    # Setup output directory
    if args.output_dir:
        output_dir = args.output_dir
    else:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(script_dir)
        output_dir = os.path.join(backend_dir, "data", season_normalized, "matches")
    
    os.makedirs(output_dir, exist_ok=True)
    
    logger.info("=" * 80)
    logger.info(f"Premier League Fixtures Scraper - Season {season_normalized}")
    logger.info("=" * 80)
    logger.info(f"Output directory: {output_dir}")
    
    # Setup driver
    driver = setup_driver(headless=not args.no_headless)
    
    # Wait a moment for all windows to initialize
    time.sleep(2)
    
    # Check for multiple windows and manage them
    logger.info(f"  Browser windows detected: {len(driver.window_handles)}")
    if len(driver.window_handles) > 1:
        logger.warning(f"  ⚠ Multiple browser windows detected! Closing extra windows...")
        logger.warning(f"  Window handles: {driver.window_handles}")
        # Keep only the first window
        main_window = driver.window_handles[0]
        for handle in driver.window_handles[1:]:
            try:
                driver.switch_to.window(handle)
                driver.close()
                logger.info(f"  ✓ Closed extra window: {handle}")
            except Exception as e:
                logger.debug(f"  Could not close window {handle}: {e}")
        driver.switch_to.window(main_window)
        logger.info(f"  ✓ Using main window: {driver.current_window_handle}")
    
    # Wait again to ensure windows are closed
    time.sleep(1)
    
    # Final check - close any new windows that appeared
    if len(driver.window_handles) > 1:
        logger.warning(f"  ⚠ Still multiple windows after cleanup! Closing again...")
        main_window = driver.window_handles[0]
        for handle in driver.window_handles[1:]:
            try:
                driver.switch_to.window(handle)
                driver.close()
            except:
                pass
        driver.switch_to.window(main_window)
        logger.info(f"  ✓ Final cleanup complete. Using window: {driver.current_window_handle}")
    
    try:
        # Step 1: Extract all match report URLs from schedule page
        logger.info("")
        logger.info("Step 1: Extracting match report URLs from schedule page...")
        matches = extract_match_report_urls_from_schedule(driver, args.season, headless=not args.no_headless)
        
        if not matches:
            logger.error("✗ No matches found on schedule page")
            return
        
        logger.info(f"✓ Found {len(matches)} Premier League matches")
        
        # Apply limit if specified
        if args.limit:
            matches = matches[:args.limit]
            logger.info(f"  Limited to {len(matches)} matches for testing")
        
        # Step 2: Scrape each match report
        logger.info("")
        logger.info("Step 2: Scraping match reports...")
        logger.info(f"  Total matches to scrape: {len(matches)}")
        logger.info("")
        
        for idx, match in enumerate(matches, 1):
            try:
                logger.info(f"[{idx}/{len(matches)}] Processing: {match['home_team']} vs {match['away_team']}")
                
                # Scrape match report
                match_data = scrape_match_report(
                    driver=driver,
                    match_url=match['match_report_url'],
                    home_team=match['home_team'],
                    away_team=match['away_team'],
                    delay=args.delay,
                    headless=not args.no_headless
                )
                
                # Add match info from schedule
                match_data['match_info']['date'] = match.get('date')
                if match.get('home_score') is not None:
                    match_data['match_info']['home_score'] = match['home_score']
                if match.get('away_score') is not None:
                    match_data['match_info']['away_score'] = match['away_score']
                
                # Save to file
                safe_home = match['home_team'].replace(' ', '_').replace('/', '_').replace("'", '')
                safe_away = match['away_team'].replace(' ', '_').replace('/', '_').replace("'", '')
                date_str = match.get('date', 'unknown_date').replace('-', '_')
                filename = f"match_{date_str}_{safe_home}_vs_{safe_away}.json"
                filepath = os.path.join(output_dir, filename)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(match_data, f, indent=2, ensure_ascii=False)
                
                logger.info(f"  ✓ Saved: {filename}")
                logger.info("")
                
                # Delay between matches
                if idx < len(matches):
                    time.sleep(args.delay)
                    
            except Exception as e:
                logger.error(f"  ✗ Error scraping match {idx}: {e}")
                import traceback
                logger.debug(traceback.format_exc())
                continue
        
        logger.info("=" * 80)
        logger.info(f"✓ Scraping complete! Scraped {len(matches)} matches")
        logger.info(f"  Files saved to: {output_dir}")
        logger.info("=" * 80)
        
    finally:
        driver.quit()
        logger.info("Browser closed")


if __name__ == "__main__":
    main()

