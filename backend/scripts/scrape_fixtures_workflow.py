#!/usr/bin/env python3
"""
Premier League Fixtures Scraper - Step-by-step workflow
1. Extract fixtures and match report links from schedule page
2. Show user the list for approval
3. Scrape each match report using comprehensive extraction

Usage:
    python scripts/scrape_fixtures_workflow.py --season 25/26
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
    if season == "current" or not season:
        return "https://fbref.com/en/comps/9/schedule/Premier-League-Scores-and-Fixtures"
    
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
        uc_options.add_argument('--disable-blink-features=AutomationControlled')
        
        driver = uc.Chrome(options=uc_options, version_main=None)
        logger.info("✓ Chrome WebDriver initialized successfully (undetected mode)")
        logger.info(f"  Browser window handle: {driver.current_window_handle}")
        
        # Ensure we start with a blank page
        driver.get("about:blank")
        time.sleep(0.5)
        
        return driver
    except ImportError:
        logger.warning("  undetected-chromedriver not installed, using standard Selenium")
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
        
        driver.get("about:blank")
        time.sleep(0.5)
        
        return driver
    except Exception as e:
        logger.error(f"Error setting up Chrome driver: {e}")
        raise


def check_and_handle_cloudflare(driver, headless: bool = True, max_wait: int = 60) -> bool:
    """Check for Cloudflare challenge and wait for verification if needed"""
    page_text = driver.page_source.lower()
    page_title = driver.title.lower()
    
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
        '<table'
    ]
    
    # Only wait if we see strong Cloudflare indicators
    is_cloudflare = any(indicator in page_title.lower() for indicator in strong_cloudflare_indicators)
    
    if is_cloudflare:
        if not headless:
            logger.warning("  ⚠ Cloudflare challenge detected!")
            logger.warning(f"  📄 Page title: {driver.title}")
            logger.info("  👤 Please complete the verification in the browser window")
            logger.info(f"  ⏳ Waiting up to {max_wait} seconds for manual verification...")
            
            for i in range(max_wait):
                time.sleep(1)
                
                # Make sure we're on the correct window
                if len(driver.window_handles) > 1:
                    driver.switch_to.window(driver.window_handles[0])
                
                try:
                    current_text = driver.page_source.lower()
                    current_title = driver.title.lower()
                    
                    # Check if page has loaded
                    has_loaded_content = any(indicator in current_text for indicator in page_loaded_indicators) or \
                                        any(indicator in current_title for indicator in page_loaded_indicators)
                    
                    # Check if still on Cloudflare challenge
                    still_on_challenge = any(indicator in current_title.lower() for indicator in strong_cloudflare_indicators)
                    
                    if has_loaded_content and not still_on_challenge and len(current_text) > 5000:
                        logger.info(f"  ✓ Cloudflare verification completed after {i+1} seconds")
                        return True
                    
                    if i % 10 == 0 and i > 0:
                        logger.info(f"  Still waiting... ({i+1}s / {max_wait}s)")
                except:
                    continue
            
            logger.warning(f"  ⚠ Cloudflare verification timeout after {max_wait} seconds")
            return False
        else:
            time.sleep(5)  # Brief wait in headless mode
    
    return True


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


def extract_fixtures_from_schedule(driver, url: str, headless: bool = True) -> tuple[List[Dict], str]:
    """
    Extract all fixtures and match report links from the Premier League Scores and Fixtures page
    
    Returns:
        Tuple of (list of fixture dictionaries, detected season string)
        Fixture dicts contain: date, home_team, away_team, score, match_report_url
    """
    logger.info(f"Loading schedule page: {url}")
    
    # Navigate to URL
    driver.get(url)
    time.sleep(3)
    current_url = driver.current_url
    logger.info(f"  Current URL: {current_url}")
    
    # Extract season from URL if present
    detected_season = None
    season_match = re.search(r'/comps/9/(\d{4}-\d{4})/', current_url)
    if season_match:
        detected_season = season_match.group(1)
        logger.info(f"  Detected season from URL: {detected_season}")
    else:
        # If no season in URL (current season), determine from current date
        # Premier League seasons run from August to May
        now = datetime.now()
        current_year = now.year
        current_month = now.month
        
        # If we're in Jan-July, the season is previous year-current year
        # If we're in Aug-Dec, the season is current year-next year
        if current_month >= 8:
            detected_season = f"{current_year}-{current_year + 1}"
        else:
            detected_season = f"{current_year - 1}-{current_year}"
        logger.info(f"  No season in URL (current season), determined: {detected_season}")
    
    # Check if we're on Google or wrong page
    if current_url and 'google.com' in current_url.lower():
        logger.error("  ✗ Browser opened to Google instead of fbref.com!")
        logger.info("  Retrying navigation...")
        time.sleep(2)
        driver.get(url)
        time.sleep(3)
        current_url = driver.current_url
        if current_url and 'google.com' in current_url.lower():
            raise Exception("Failed to navigate to fbref.com - browser keeps opening to Google")
    
    # Check and handle Cloudflare
    if not headless:
        logger.info("")
        logger.info("=" * 80)
        logger.info("🌐 BROWSER IS NOW OPEN - CHECK IT NOW!")
        logger.info("=" * 80)
        logger.info(f"📄 Current page: {driver.title}")
        logger.info(f"🔗 URL: {driver.current_url[:80]}...")
        logger.info("  👤 Please check the browser window for Cloudflare verification")
        logger.info("  ⏳ Waiting 10 seconds for you to check...")
        logger.info("=" * 80)
        logger.info("")
        
        for i in range(10, 0, -1):
            logger.info(f"⏳ Starting in {i} seconds... (check browser now!)")
            time.sleep(1)
        
        logger.info("✅ Continuing...")
        logger.info("")
    
    if not check_and_handle_cloudflare(driver, headless):
        logger.error("✗ Cloudflare verification failed or timed out")
        return [], detected_season or "current"
    
    # Wait for table to load
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
    except TimeoutException:
        logger.error("✗ Timeout waiting for schedule table to load")
        return [], detected_season or "current"
    
    time.sleep(2)
    
    # Find the schedule table
    table = None
    table_selectors = [
        (By.XPATH, "//table[@id[contains(., 'sched')]]"),
        (By.XPATH, "//table[contains(@class, 'stats_table')]"),
        (By.TAG_NAME, "table")
    ]
    
    for selector_type, selector_value in table_selectors:
        try:
            tables = driver.find_elements(selector_type, selector_value)
            if tables:
                table = tables[0]
                logger.info(f"✓ Found schedule table")
                break
        except:
            continue
    
    if not table:
        logger.error("✗ Could not find schedule table")
        return [], detected_season or "current"
    
    # Get Premier League clubs for filtering
    pl_clubs = get_premier_league_clubs()
    
    # Extract fixtures from table
    tbody = table.find_element(By.TAG_NAME, "tbody")
    rows = tbody.find_elements(By.TAG_NAME, "tr")
    
    logger.info(f"Found {len(rows)} rows in schedule table")
    
    fixtures = []
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
            
            # Find match report URL - look for the actual match report link in the table
            # Match report URLs have format: /matches/{hex_id}/{team1}-{team2}-{date}-{competition}
            # Example: https://fbref.com/en/matches/a071faa8/Liverpool-Bournemouth-August-15-2025-Premier-League
            match_report_url = None
            all_links = row.find_elements(By.TAG_NAME, "a")
            
            # Look for links that match the match report pattern
            # Pattern: /matches/{8-character hex ID}/{description}
            # Example: https://fbref.com/en/matches/a071faa8/Liverpool-Bournemouth-August-15-2025-Premier-League
            for link in all_links:
                href = link.get_attribute("href") or ""
                
                # Exclude squad and player links
                if '/squads/' not in href and '/players/' not in href:
                    # Check if it matches the match report pattern
                    # Match report URLs have: /matches/{8-char hex_id}/ followed by team names and date
                    match_pattern = re.search(r'/matches/([a-f0-9]{8})/', href)
                    if match_pattern:
                        # This looks like a match report URL (has 8-char hex ID)
                        match_report_url = href
                        logger.debug(f"  Found match report URL: {match_report_url}")
                        break
            
            # If still not found, try looking in all cells (the link might be in the score/result cell)
            if not match_report_url:
                for cell in cells:
                    cell_links = cell.find_elements(By.TAG_NAME, "a")
                    for link in cell_links:
                        href = link.get_attribute("href") or ""
                        # Match report URLs have the hex ID pattern
                        if re.search(r'/matches/([a-f0-9]{8})/', href) and '/squads/' not in href and '/players/' not in href:
                            match_report_url = href
                            logger.debug(f"  Found match report URL in cell: {match_report_url}")
                            break
                    if match_report_url:
                        break
            
            if not match_report_url:
                logger.warning(f"  ⚠ No match report URL found for {home_team} vs {away_team}")
                # Log all links found for debugging
                logger.debug(f"  Available links in row:")
                for link in all_links:
                    href = link.get_attribute("href") or ""
                    if href:
                        logger.debug(f"    - {href}")
                continue
            
            # Extract date
            date = None
            date_cell_index = None
            for idx, cell in enumerate(cells):
                text = cell.text.strip()
                date_match = re.search(r'(\d{4}-\d{2}-\d{2})', text)
                if date_match:
                    date = date_match.group(1)
                    date_cell_index = idx
                    break
            
            # Extract score if available
            # Scores are typically in the cell that contains the match report link
            # Format is usually "X-Y" or "X:Y" or "X–Y" (with various separators)
            home_score = None
            away_score = None
            
            # Method 1: Look in the cell that contains the match report link (most reliable)
            # The match report link is usually in the score/result cell
            if match_report_url:
                for cell in cells:
                    cell_links = cell.find_elements(By.TAG_NAME, "a")
                    for link in cell_links:
                        href = link.get_attribute("href") or ""
                        if match_report_url in href or (re.search(r'/matches/([a-f0-9]{8})/', href) and '/squads/' not in href):
                            # This cell contains the match report link, likely also contains the score
                            cell_text = cell.text.strip()
                            logger.debug(f"  Checking score in match report link cell: '{cell_text}'")
                            
                            # Look for score pattern in this cell
                            # Patterns: "2-1", "2:1", "2–1", "2 1", etc.
                            score_patterns = [
                                r'(\d+)[\s:–\-–—]+(\d+)',  # Various separators
                                r'(\d+)\s+(\d+)',  # Space separated
                            ]
                            
                            for pattern in score_patterns:
                                score_match = re.search(pattern, cell_text)
                                if score_match:
                                    try:
                                        score1 = int(score_match.group(1))
                                        score2 = int(score_match.group(2))
                                        
                                        # STRICT validation: Scores in football are 0-15 (rarely higher)
                                        # Also check length to avoid multi-digit numbers (like dates)
                                        if (0 <= score1 <= 15 and 0 <= score2 <= 15 and 
                                            len(str(score1)) <= 2 and len(str(score2)) <= 2):
                                            home_score = score1
                                            away_score = score2
                                            logger.debug(f"  ✓ Found score in match report cell: {home_score}-{away_score}")
                                            break
                                    except:
                                        pass
                            
                            if home_score is not None:
                                break
                    
                    if home_score is not None:
                        break
            
            # Method 2: If not found, search all cells (except date cell)
            if home_score is None:
                for idx, cell in enumerate(cells):
                    # Skip the date cell to avoid matching dates as scores
                    if idx == date_cell_index:
                        continue
                    
                    text = cell.text.strip()
                    
                    # Skip if cell contains team names (likely team name cell)
                    if home_team.lower() in text.lower() or away_team.lower() in text.lower():
                        continue
                    
                    # Look for score pattern, but validate that numbers are reasonable scores
                    # Patterns: "2-1", "2:1", "2–1", "2 1", etc.
                    score_patterns = [
                        r'^(\d+)[\s:–\-–—]+(\d+)$',  # Exact match with various separators
                        r'^(\d+)\s+(\d+)$',  # Space separated, exact match
                        r'(\d+)[\s:–\-–—]+(\d+)',  # Anywhere in text
                    ]
                    
                    for pattern in score_patterns:
                        score_match = re.search(pattern, text)
                        if score_match:
                            try:
                                score1 = int(score_match.group(1))
                                score2 = int(score_match.group(2))
                                
                                # STRICT validation: Scores in football are 0-15 (rarely higher)
                                # Also check length to avoid multi-digit numbers (like dates or IDs)
                                if (0 <= score1 <= 15 and 0 <= score2 <= 15 and 
                                    len(str(score1)) <= 2 and len(str(score2)) <= 2):
                                    home_score = score1
                                    away_score = score2
                                    logger.debug(f"  ✓ Found score: {home_score}-{away_score} in cell {idx} ('{text}')")
                                    break
                                else:
                                    logger.debug(f"  ✗ Rejected invalid score: {score1}-{score2} in cell {idx} ('{text}')")
                            except:
                                pass
                    
                    if home_score is not None:
                        break
            
            fixtures.append({
                'date': date,
                'home_team': home_team,
                'away_team': away_team,
                'home_score': home_score,
                'away_score': away_score,
                'match_report_url': match_report_url
            })
            
        except Exception as e:
            logger.debug(f"Error processing row: {e}")
            continue
    
    logger.info(f"✓ Extracted {len(fixtures)} Premier League fixtures")
    return fixtures, detected_season or "current"


def display_fixtures_for_approval(fixtures: List[Dict]) -> bool:
    """Display fixtures and match report links for user approval"""
    print("\n" + "=" * 80)
    print("FIXTURES AND MATCH REPORT LINKS")
    print("=" * 80)
    print(f"\nTotal fixtures found: {len(fixtures)}\n")
    
    for idx, fixture in enumerate(fixtures, 1):
        date_str = fixture.get('date', 'TBD')
        home = fixture['home_team']
        away = fixture['away_team']
        score = ""
        if fixture.get('home_score') is not None and fixture.get('away_score') is not None:
            score = f" ({fixture['home_score']}-{fixture['away_score']})"
        match_url = fixture['match_report_url']
        
        print(f"{idx:3d}. {date_str} | {home:25s} vs {away:25s}{score}")
        print(f"     Match Report: {match_url}")
        print()
    
    print("=" * 80)
    print("\nDo you want to proceed with scraping these match reports?")
    response = input("Type 'yes' or 'y' to continue, anything else to cancel: ").strip().lower()
    
    return response in ['yes', 'y']


def scrape_match_report(driver, match_url: str, home_team: str, away_team: str, delay: float = 2.0, headless: bool = True) -> Dict:
    """
    Scrape comprehensive match data from a match report page
    Uses the comprehensive extraction function from scrape_fbref_comprehensive.py
    """
    # Import the comprehensive extraction function
    from scrape_fbref_comprehensive import extract_comprehensive_match_data
    
    logger.info(f"  Scraping match report: {home_team} vs {away_team}")
    logger.info(f"  URL: {match_url}")
    
    # Use the comprehensive extraction function
    match_data = extract_comprehensive_match_data(
        driver=driver,
        match_url=match_url,
        home_team=home_team,
        away_team=away_team,
        delay=delay,
        headless=headless
    )
    
    # Validate that we got valid data
    if not match_data:
        raise Exception("extract_comprehensive_match_data returned None")
    
    if not match_data.get('home_team') or not match_data.get('away_team'):
        raise Exception(f"Invalid match data: missing team information")
    
    # Log success
    logger.info(f"  ✓ Successfully extracted match data")
    
    return match_data


def main():
    parser = argparse.ArgumentParser(description='Premier League fixtures scraper - step-by-step workflow')
    parser.add_argument('--season', type=str, default='current', help='Season to scrape (e.g., 25/26, 2025-2026, or "current")')
    parser.add_argument('--delay', type=float, default=2.0, help='Delay between requests in seconds')
    parser.add_argument('--limit', type=int, help='Limit number of matches to scrape (for testing)')
    parser.add_argument('--no-headless', action='store_true', help='Run browser in visible mode')
    parser.add_argument('--output-dir', type=str, help='Output directory for match files')
    parser.add_argument('--skip-approval', action='store_true', help='Skip user approval and start scraping immediately')
    parser.add_argument('--start-from', type=int, help='Resume scraping from a specific match number (1-indexed). Skips matches before this number.')
    parser.add_argument('--skip-existing', action='store_true', help='Skip matches that already have JSON files (useful for resuming)')
    
    args = parser.parse_args()
    
    # Get URL
    url = get_season_url(args.season)
    
    # Normalize season format for output directory
    if args.season == "current" or not args.season:
        season_normalized = "current"
    elif '/' in args.season:
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
    logger.info(f"Premier League Fixtures Scraper - Step-by-Step Workflow")
    logger.info("=" * 80)
    logger.info(f"Season: {args.season}")
    logger.info(f"Schedule URL: {url}")
    logger.info(f"Output directory: {output_dir}")
    logger.info("=" * 80)
    
    # Setup driver
    driver = setup_driver(headless=not args.no_headless)
    
    # Wait a moment for all windows to initialize
    time.sleep(2)
    
    # Check for multiple windows and manage them
    logger.info(f"  Browser windows detected: {len(driver.window_handles)}")
    if len(driver.window_handles) > 1:
        logger.warning(f"  ⚠ Multiple browser windows detected! Closing extra windows...")
        main_window = driver.window_handles[0]
        for handle in driver.window_handles[1:]:
            try:
                driver.switch_to.window(handle)
                driver.close()
                logger.info(f"  ✓ Closed extra window: {handle}")
            except:
                pass
        driver.switch_to.window(main_window)
        logger.info(f"  ✓ Using main window: {driver.current_window_handle}")
    
    time.sleep(1)
    
    try:
        # Step 1: Extract fixtures and match report links
        logger.info("")
        logger.info("STEP 1: Extracting fixtures and match report links from schedule page...")
        logger.info("")
        
        fixtures, detected_season = extract_fixtures_from_schedule(driver, url, headless=not args.no_headless)
        
        if not fixtures:
            logger.error("✗ No fixtures found on schedule page")
            return
        
        logger.info(f"✓ Found {len(fixtures)} Premier League fixtures")
        
        # If season was "current", use the detected season for output directory
        if args.season == "current" or not args.season:
            if detected_season and detected_season != "current":
                season_normalized = detected_season
                logger.info(f"  Using detected season for output: {season_normalized}")
                # Recalculate output directory with detected season
                script_dir = os.path.dirname(os.path.abspath(__file__))
                backend_dir = os.path.dirname(script_dir)
                output_dir = os.path.join(backend_dir, "data", season_normalized, "matches")
                os.makedirs(output_dir, exist_ok=True)
                logger.info(f"  Updated output directory: {output_dir}")
        
        # Apply limit if specified
        if args.limit:
            fixtures = fixtures[:args.limit]
            logger.info(f"  Limited to {len(fixtures)} fixtures for testing")
        
        # Step 2: Display fixtures for user approval
        logger.info("")
        logger.info("STEP 2: Displaying fixtures for approval...")
        logger.info("")
        
        if not args.skip_approval:
            if not display_fixtures_for_approval(fixtures):
                logger.info("Scraping cancelled by user")
                return
        else:
            logger.info("Skipping approval (--skip-approval flag set)")
        
        # Step 3: Scrape each match report
        logger.info("")
        logger.info("STEP 3: Scraping match reports...")
        logger.info(f"  Total matches to scrape: {len(fixtures)}")
        
        # Handle resume from specific match number
        start_index = 0
        if args.start_from:
            if args.start_from < 1:
                logger.error(f"  ✗ --start-from must be >= 1, got {args.start_from}")
                return
            if args.start_from > len(fixtures):
                logger.error(f"  ✗ --start-from ({args.start_from}) is greater than total fixtures ({len(fixtures)})")
                return
            start_index = args.start_from - 1  # Convert to 0-based index
            logger.info(f"  Resuming from match {args.start_from} (skipping first {start_index} matches)")
        
        logger.info("")
        
        scraped_count = 0
        skipped_count = 0
        error_count = 0
        consecutive_errors = 0
        max_consecutive_errors = 5  # Stop if 5 consecutive errors
        
        for idx, fixture in enumerate(fixtures, 1):
            # Skip matches before start_from
            if args.start_from and idx < args.start_from:
                continue
            
            # Check for too many consecutive errors - might be Cloudflare blocking
            if consecutive_errors >= max_consecutive_errors:
                logger.error(f"  ✗ Too many consecutive errors ({consecutive_errors}). Possible Cloudflare block.")
                logger.error(f"  ✗ Stopping at match {idx}. You can resume with --start-from {idx}")
                logger.error(f"  ✗ Consider increasing delay (--delay) or checking browser for Cloudflare verification")
                break
            
            try:
                # Periodic browser health check and refresh (every 30 matches)
                if idx > 1 and idx % 30 == 0:
                    logger.info(f"  🔄 Periodic browser refresh after {idx} matches...")
                    try:
                        # Check if browser is still responsive
                        driver.current_url
                        # Small refresh to prevent stale connections
                        driver.refresh()
                        time.sleep(2)
                        logger.info(f"  ✓ Browser refreshed successfully")
                    except Exception as e:
                        logger.warning(f"  ⚠ Browser health check failed: {e}")
                        logger.warning(f"  ⚠ Continuing anyway...")
                
                # Check if file already exists and skip if --skip-existing is set
                safe_home = fixture['home_team'].replace(' ', '_').replace('/', '_').replace("'", '')
                safe_away = fixture['away_team'].replace(' ', '_').replace('/', '_').replace("'", '')
                date_str = fixture.get('date', 'unknown_date').replace('-', '_')
                filename = f"match_{date_str}_{safe_home}_vs_{safe_away}.json"
                filepath = os.path.join(output_dir, filename)
                
                if args.skip_existing and os.path.exists(filepath):
                    logger.info(f"[{idx}/{len(fixtures)}] Skipping (file exists): {fixture['home_team']} vs {fixture['away_team']}")
                    skipped_count += 1
                    consecutive_errors = 0  # Reset error count on successful skip
                    continue
                
                logger.info(f"[{idx}/{len(fixtures)}] Processing: {fixture['home_team']} vs {fixture['away_team']}")
                
                # Retry logic for scraping
                max_retries = 3
                match_data = None
                for retry in range(max_retries):
                    try:
                        # Scrape match report
                        match_data = scrape_match_report(
                            driver=driver,
                            match_url=fixture['match_report_url'],
                            home_team=fixture['home_team'],
                            away_team=fixture['away_team'],
                            delay=args.delay,
                            headless=not args.no_headless
                        )
                        
                        # Validate that we got actual data (not empty)
                        if not match_data or not match_data.get('home_team') or not match_data.get('away_team'):
                            raise Exception("Empty or invalid match data returned")
                        
                        break  # Success, exit retry loop
                    except Exception as retry_error:
                        if retry < max_retries - 1:
                            wait_time = (retry + 1) * 5  # Exponential backoff: 5s, 10s, 15s
                            logger.warning(f"  ⚠ Retry {retry + 1}/{max_retries} after {wait_time}s: {retry_error}")
                            time.sleep(wait_time)
                        else:
                            raise  # Re-raise on final retry failure
                
                if not match_data:
                    raise Exception("Failed to scrape match data after all retries")
                
                # Add fixture info to match data
                match_data['match_info']['date'] = fixture.get('date')
                
                # Only override scores from fixture if match report didn't extract a score
                # The match report page should have the correct score, so prefer that
                if match_data['match_info'].get('home_score') is None or match_data['match_info'].get('away_score') is None:
                    # Match report didn't extract score, try using fixture score if valid
                    home_score = fixture.get('home_score')
                    away_score = fixture.get('away_score')
                    
                    if home_score is not None and away_score is not None:
                        # STRICT validation: must be 0-15 range (not dates like 2025-8 or other large numbers)
                        if 0 <= home_score <= 15 and 0 <= away_score <= 15:
                            match_data['match_info']['home_score'] = home_score
                            match_data['match_info']['away_score'] = away_score
                            logger.info(f"  ✓ Using score from fixture: {home_score}-{away_score}")
                        else:
                            logger.warning(f"  ⚠ Skipping invalid fixture scores: {home_score}-{away_score} (likely date or invalid)")
                else:
                    logger.info(f"  ✓ Using score from match report: {match_data['match_info']['home_score']}-{match_data['match_info']['away_score']}")
                
                # Save to file
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(match_data, f, indent=2, ensure_ascii=False)
                
                logger.info(f"  ✓ Saved: {filename}")
                logger.info("")
                
                scraped_count += 1
                consecutive_errors = 0  # Reset error count on success
                
                # Delay between matches
                if idx < len(fixtures):
                    time.sleep(args.delay)
                    
            except Exception as e:
                error_count += 1
                consecutive_errors += 1
                logger.error(f"  ✗ Error scraping match {idx}: {e}")
                logger.error(f"  ✗ Consecutive errors: {consecutive_errors}/{max_consecutive_errors}")
                import traceback
                logger.debug(traceback.format_exc())
                
                # If too many errors, suggest stopping
                if consecutive_errors >= 3:
                    logger.warning(f"  ⚠ {consecutive_errors} consecutive errors. Check browser for Cloudflare verification.")
                    if not args.no_headless:
                        logger.warning(f"  ⚠ Pausing 30 seconds for manual Cloudflare check...")
                        time.sleep(30)
                
                continue
        
        logger.info("=" * 80)
        logger.info(f"✓ Scraping complete!")
        logger.info(f"  Total matches processed: {len(fixtures)}")
        logger.info(f"  Newly scraped: {scraped_count}")
        if skipped_count > 0:
            logger.info(f"  Skipped (existing files): {skipped_count}")
        if error_count > 0:
            logger.warning(f"  Errors encountered: {error_count}")
            logger.warning(f"  You can resume with: --start-from {scraped_count + skipped_count + 1}")
        logger.info(f"  Files saved to: {output_dir}")
        logger.info("=" * 80)
        
    finally:
        driver.quit()
        logger.info("Browser closed")


if __name__ == "__main__":
    main()

