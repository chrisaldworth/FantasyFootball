#!/usr/bin/env python3
"""
Comprehensive Selenium-based scraper for Premier League match data from fbref.com
Extracts all available match information including lineups, player stats, events, etc.
Outputs to JSON structure suitable for PostgreSQL migration.

Usage:
    python scripts/scrape_fbref_comprehensive.py [--season SEASON] [--output OUTPUT_FILE] [--limit LIMIT]
    
Example:
    python scripts/scrape_fbref_comprehensive.py --season 2024-2025 --output pl_data_2024_2025.json --limit 10
"""

import argparse
import json
import time
import random
from datetime import datetime
from typing import List, Dict, Optional, Set
import sys
import os
import re

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

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def get_season_url(season: str) -> str:
    """Get the fbref.com URL for a specific Premier League season
    
    Format examples:
    - Current season: https://fbref.com/en/comps/9/schedule/Premier-League-Scores-and-Fixtures
    - Specific season: https://fbref.com/en/comps/9/2024-2025/schedule/2024-2025-Premier-League-Scores-and-Fixtures
    """
    # Handle both 2024-2025 and 2025-2026 formats
    if len(season) == 9 and season[4] == '-':
        season_slug = season
        return f"https://fbref.com/en/comps/9/{season_slug}/schedule/{season_slug}-Premier-League-Scores-and-Fixtures"
    else:
        # Convert 25/26 to 2025-2026
        parts = season.split('/')
        if len(parts) == 2:
            year1 = int(parts[0])
            year2 = int(parts[1])
            if year1 < 50:  # Assume 20xx
                year1 = 2000 + year1
            if year2 < 50:
                year2 = 2000 + year2
            season_slug = f"{year1}-{year2}"
            return f"https://fbref.com/en/comps/9/{season_slug}/schedule/{season_slug}-Premier-League-Scores-and-Fixtures"
        else:
            # For current season, use the shorter URL
            return f"https://fbref.com/en/comps/9/schedule/Premier-League-Scores-and-Fixtures"


def get_club_matches_url(club_fbref_id: str, season: str) -> str:
    """Get the fbref.com URL for a club's all matches page"""
    season_slug = season.replace('-', '-')
    return f"https://fbref.com/en/squads/{club_fbref_id}/{season_slug}/all_comps/{club_fbref_id}-All-Competitions"


def setup_driver(headless: bool = True):
    """Setup Chrome WebDriver with Cloudflare bypass options"""
    logger.info("Setting up Chrome WebDriver...")
    chrome_options = Options()
    
    if headless:
        chrome_options.add_argument('--headless=new')  # Use new headless mode
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
        uc_options.add_argument('--single-process')
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


def extract_player_info(player_element) -> Dict:
    """Extract player information from a player element"""
    player_info = {
        'name': None,
        'fbref_id': None,
        'position': None,
        'nationality': None,
        'age': None,
        'height': None,
        'weight': None
    }
    
    try:
        # Get player name from link
        player_link = player_element.find_element(By.XPATH, ".//a[contains(@href, '/players/')]")
        if player_link:
            player_info['name'] = player_link.text.strip()
            href = player_link.get_attribute("href")
            # Extract player ID from URL: /en/players/{id}/{name}
            match = re.search(r'/players/([a-f0-9]+)/', href)
            if match:
                player_info['fbref_id'] = match.group(1)
        
        # Try to get position, nationality, age from data attributes or nearby text
        # This varies by page structure
        parent_text = player_element.text
        # Position might be in a data attribute or nearby cell
        try:
            position_elem = player_element.find_element(By.XPATH, ".//*[@data-stat='position' or contains(@class, 'position')]")
            player_info['position'] = position_elem.text.strip()
        except:
            pass
        
    except Exception as e:
        logger.debug(f"  Error extracting player info: {e}")
    
    return player_info


def extract_comprehensive_match_data(driver: webdriver.Chrome, match_url: str, home_team: str = None, away_team: str = None, delay: float = 2.0, debug: bool = False, debug_dir: str = None, headless: bool = True) -> Dict:
    """
    Extract comprehensive match data from match report page
    
    Returns:
        Dictionary with all match data including lineups, stats, events, etc.
    """
    match_data = {
        'match_info': {},
        'home_team': {},
        'away_team': {},
        'lineups': {
            'home': {'starting_xi': [], 'substitutes': [], 'formation': None},
            'away': {'starting_xi': [], 'substitutes': [], 'formation': None}
        },
        'events': {
            'goals': [],
            'assists': [],
            'cards': [],
            'substitutions': [],
            'other': []
        },
        'player_stats': {
            'home': [],
            'away': []
        },
        'team_stats': {
            'home': {
                'possession': None,
                'passes_completed': None,
                'passes_attempted': None,
                'passing_accuracy': None,
                'shots': None,
                'shots_on_target': None,
                'saves': None,
                'fouls': None,
                'corners': None,
                'crosses': None,
                'touches': None,
                'tackles': None,
                'interceptions': None,
                'aerials_won': None,
                'clearances': None,
                'offsides': None,
                'goal_kicks': None,
                'throw_ins': None,
                'long_balls': None,
                'yellow_cards': None,
                'red_cards': None
            },
            'away': {
                'possession': None,
                'passes_completed': None,
                'passes_attempted': None,
                'passing_accuracy': None,
                'shots': None,
                'shots_on_target': None,
                'saves': None,
                'fouls': None,
                'corners': None,
                'crosses': None,
                'touches': None,
                'tackles': None,
                'interceptions': None,
                'aerials_won': None,
                'clearances': None,
                'offsides': None,
                'goal_kicks': None,
                'throw_ins': None,
                'long_balls': None,
                'yellow_cards': None,
                'red_cards': None
            }
        }
    }
    
    try:
        wait_time = delay + random.uniform(0.1, 0.3)  # Further reduced for faster testing
        logger.debug(f"  Waiting {wait_time:.1f}s before loading match page...")
        time.sleep(wait_time)
        
        # Step 1: Navigate to match page
        logger.debug(f"  Step 1: Loading match page: {match_url}")
        driver.get(match_url)
        
        # Verify we're on the correct page
        current_url = driver.current_url
        logger.debug(f"  Current URL: {current_url}")
        
        if 'google.com' in current_url.lower() or 'about:blank' in current_url.lower():
            logger.warning(f"  ⚠ Browser opened to wrong page: {current_url}")
            logger.info(f"  Retrying navigation to: {match_url}")
            time.sleep(2)
            driver.get(match_url)
            current_url = driver.current_url
            logger.debug(f"  Current URL after retry: {current_url}")
        
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        time.sleep(2)  # Wait for page to load
        
        # Check for Cloudflare on match page too - more aggressive detection
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
        
        # Check page title, URL, and content
        is_cloudflare = (
            any(indicator in page_text for indicator in cloudflare_indicators) or
            any(indicator in page_title for indicator in cloudflare_indicators) or
            any(indicator in current_url for indicator in cloudflare_indicators) or
            'ray id' in page_text or
            len(page_text) < 5000  # Very short page might be Cloudflare
        )
        
        if is_cloudflare:
            if not headless:
                logger.warning("  ⚠ Cloudflare challenge on match page!")
                logger.warning(f"  📄 Page title: {driver.title}")
                logger.warning(f"  🔗 Current URL: {current_url[:100]}")
                logger.info("  👤 Please check the browser window and complete any verification")
                logger.info("  ⏳ Waiting up to 5 minutes for manual verification...")
                logger.info("  📌 Once verified, the script will continue automatically")
                logger.info("  💡 If you see a checkbox or challenge, please complete it now")
                
                for i in range(300):
                    time.sleep(1)
                    
                    try:
                        current_text = driver.page_source.lower()
                        current_title = driver.title.lower()
                        
                        # Positive indicators that page has loaded
                        page_loaded_indicators = [
                            'premier league',
                            'match report',
                            'stats_table',
                            'fbref.com',
                            '<tbody>',
                            '<table',
                            'squad',
                            'player',
                            'score'
                        ]
                        
                        # Strong Cloudflare challenge indicators
                        strong_cloudflare_indicators = [
                            'just a moment',
                            'checking your browser',
                            'verify you are human',
                            'please wait while we verify',
                            'ddos protection by cloudflare'
                        ]
                        
                        # Check if page has loaded (positive check)
                        has_loaded_content = any(indicator in current_text for indicator in page_loaded_indicators) or \
                                            any(indicator in current_title for indicator in page_loaded_indicators)
                        
                        # Check if still on Cloudflare challenge
                        still_on_challenge = any(indicator in current_title.lower() for indicator in strong_cloudflare_indicators) or \
                                            ('just a moment' in current_title.lower() and len(current_text) < 10000)
                        
                        # Page is loaded if it has content AND is not on challenge page
                        if has_loaded_content and not still_on_challenge and len(current_text) > 5000:
                            logger.info(f"  ✓ Verification completed after {i+1} seconds")
                            logger.info(f"  📄 New page title: {driver.title}")
                            logger.info("  ✅ Continuing with match extraction...")
                            time.sleep(2)
                            break
                        
                        if i % 10 == 0 and i > 0:
                            logger.info(f"  Still waiting for verification... ({i+1}s / 300s)")
                            logger.info(f"  Current page: {driver.title[:50]}")
                            logger.info(f"  Page size: {len(current_text)} chars, Has content: {has_loaded_content}, Still challenge: {still_on_challenge}")
                    except Exception as e:
                        logger.debug(f"  Error checking page: {e}")
                        continue
            else:
                logger.warning("  ⚠ Cloudflare challenge detected - consider using --no-headless")
                logger.warning("  ⏳ Waiting up to 2 minutes for automatic resolution...")
                for i in range(120):
                    time.sleep(1)
                    current_text = driver.page_source.lower()
                    if not any(indicator in current_text for indicator in cloudflare_indicators):
                        logger.info(f"  ✓ Cloudflare check passed after {i+1} seconds")
                        break
                    if i % 10 == 0 and i > 0:
                        logger.info(f"  Still waiting... ({i+1}s)")
        else:
            if not headless:
                logger.debug(f"  ✓ No Cloudflare challenge detected (page: {driver.title[:50]})")
        
        # Handle date-only URLs
        if home_team and away_team and len(match_url.split('/')) <= 5:
            logger.debug(f"  Date-only URL detected, finding Premier League match...")
            normalized_home = home_team.lower().replace("'", "").replace(" ", "-")
            normalized_away = away_team.lower().replace("'", "").replace(" ", "-")
            
            match_links = driver.find_elements(By.XPATH, "//a[contains(@href, '/matches/') and not(contains(@href, '/squads/')) and not(contains(@href, '/players/'))]")
            
            best_match = None
            for link in match_links:
                href = link.get_attribute("href") or ""
                link_text = link.text.lower()
                parent_text = ""
                try:
                    parent = link.find_element(By.XPATH, "./..")
                    parent_text = parent.text.lower()
                except:
                    pass
                
                has_both_teams = (normalized_home in href.lower() and normalized_away in href.lower()) or \
                                (home_team.lower() in link_text and away_team.lower() in link_text)
                is_not_womens = "women" not in href.lower() and "women" not in link_text
                is_not_youth = "youth" not in href.lower() and "youth" not in link_text
                
                if has_both_teams and is_not_womens and is_not_youth:
                    if "premier league" in href.lower() or "premier league" in link_text:
                        best_match = link
                        break
                    elif not best_match:
                        best_match = link
            
            if best_match:
                match_url = best_match.get_attribute("href")
                driver.get(match_url)
                WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
                time.sleep(1)
            else:
                logger.warning(f"  Could not find Premier League match")
                return match_data
        
        # Step 2: Find and navigate to Match Report
        logger.debug(f"  Step 2: Looking for 'Match Report' link...")
        report_links = driver.find_elements(By.XPATH, "//a[contains(text(), 'Match Report') or contains(text(), 'Report') or contains(@href, '/match-report/')]")
        
        match_report_url = None
        for link in report_links:
            href = link.get_attribute("href") or ""
            link_text = link.text.strip().lower()
            if '/match-report/' in href or ('match' in link_text and 'report' in link_text):
                match_report_url = href
                break
        
        if not match_report_url:
            all_links = driver.find_elements(By.TAG_NAME, "a")
            for link in all_links:
                href = link.get_attribute("href") or ""
                if '/match-report/' in href:
                    match_report_url = href
                    break
        
        if match_report_url:
            logger.debug(f"  Navigating to Match Report: {match_report_url}")
            driver.get(match_report_url)
            WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            time.sleep(0.5)  # Reduced from 2s to 0.5s
            
            # Save HTML for debugging
            if debug and debug_dir:
                try:
                    os.makedirs(debug_dir, exist_ok=True)
                    safe_home = (home_team or 'home').replace(' ', '_').replace('/', '_').replace("'", '')
                    safe_away = (away_team or 'away').replace(' ', '_').replace('/', '_').replace("'", '')
                    html_file = os.path.join(debug_dir, f"match_report_{safe_home}_{safe_away}.html")
                    with open(html_file, 'w', encoding='utf-8') as f:
                        f.write(driver.page_source)
                    logger.info(f"  💾 Saved HTML snapshot: {html_file}")
                except Exception as e:
                    logger.warning(f"  ⚠ Could not save debug HTML: {e}")
        else:
            logger.warning(f"  No Match Report link found, extracting from current page...")
            time.sleep(1)
            
            # Save HTML even if no match report URL found
            if debug and debug_dir:
                try:
                    os.makedirs(debug_dir, exist_ok=True)
                    safe_home = (home_team or 'home').replace(' ', '_').replace('/', '_').replace("'", '')
                    safe_away = (away_team or 'away').replace(' ', '_').replace('/', '_').replace("'", '')
                    html_file = os.path.join(debug_dir, f"match_page_{safe_home}_{safe_away}.html")
                    with open(html_file, 'w', encoding='utf-8') as f:
                        f.write(driver.page_source)
                    logger.info(f"  💾 Saved HTML snapshot: {html_file}")
                except Exception as e:
                    logger.warning(f"  ⚠ Could not save debug HTML: {e}")
        
        # Extract match basic info
        try:
            # Date - try multiple methods
            date_found = False
            
            # Method 1: Look for date elements with various selectors
            date_selectors = [
                "//*[contains(@class, 'date')]",
                "//*[contains(@id, 'date')]",
                "//*[contains(@class, 'venuetime')]",
                "//*[contains(@class, 'venue')]",
                "//*[contains(@class, 'matchdate')]",
                "//time",
                "//*[@datetime]"
            ]
            
            for selector in date_selectors:
                try:
                    date_elems = driver.find_elements(By.XPATH, selector)
                    for date_elem in date_elems:
                        # Try text content
                        date_text = date_elem.text.strip()
                        # Try datetime attribute
                        datetime_attr = date_elem.get_attribute('datetime') or date_elem.get_attribute('data-date') or ''
                        
                        # Look for date patterns in text
                        date_match = re.search(r'(\d{4}-\d{2}-\d{2})|(\d{1,2}\s+\w+\s+\d{4})|(\w+\s+\d{1,2},\s+\d{4})', date_text)
                        if date_match:
                            match_data['match_info']['date'] = date_text
                            match_data['date'] = date_text
                            logger.info(f"  ✓ Extracted date: {date_text}")
                            date_found = True
                            break
                        
                        # Try datetime attribute
                        if datetime_attr:
                            date_match = re.search(r'(\d{4}-\d{2}-\d{2})', datetime_attr)
                            if date_match:
                                match_data['match_info']['date'] = date_match.group(1)
                                match_data['date'] = date_match.group(1)
                                logger.info(f"  ✓ Extracted date from datetime attr: {date_match.group(1)}")
                                date_found = True
                                break
                    
                    if date_found:
                        break
                except:
                    continue
            
            # Method 2: Look in page title
            if not date_found:
                try:
                    page_title = driver.title
                    date_match = re.search(r'(\d{4}-\d{2}-\d{2})|(\w+\s+\d{1,2},\s+\d{4})|(\d{1,2}\s+\w+\s+\d{4})', page_title)
                    if date_match:
                        match_data['match_info']['date'] = date_match.group(0)
                        match_data['date'] = date_match.group(0)
                        logger.info(f"  ✓ Extracted date from title: {date_match.group(0)}")
                        date_found = True
                except:
                    pass
            
            # Method 3: Look in URL (fbref URLs often contain dates)
            if not date_found:
                try:
                    current_url = driver.current_url
                    date_match = re.search(r'(\d{4}-\d{2}-\d{2})', current_url)
                    if date_match:
                        match_data['match_info']['date'] = date_match.group(1)
                        match_data['date'] = date_match.group(1)
                        logger.info(f"  ✓ Extracted date from URL: {date_match.group(1)}")
                        date_found = True
                except:
                    pass
            
            # Method 4: Look in page text for common date patterns
            if not date_found:
                try:
                    page_text = driver.find_element(By.TAG_NAME, "body").text
                    # Try ISO format first
                    date_match = re.search(r'(\d{4}-\d{2}-\d{2})', page_text)
                    if not date_match:
                        # Try other formats like "September 21, 2025"
                        date_match = re.search(r'(\w+\s+\d{1,2},\s+\d{4})', page_text)
                    if not date_match:
                        # Try "21 September 2025"
                        date_match = re.search(r'(\d{1,2}\s+\w+\s+\d{4})', page_text)
                    if date_match:
                        match_data['match_info']['date'] = date_match.group(1)
                        match_data['date'] = date_match.group(1)
                        logger.info(f"  ✓ Extracted date from page text: {date_match.group(1)}")
                        date_found = True
                except:
                    pass
        except Exception as e:
            logger.debug(f"  Error extracting date: {e}")
        
        # Extract team names and IDs - use scorebox (sb_team_0 = home, sb_team_1 = away) as authoritative
        try:
            home_name = None
            away_name = None
            home_id = None
            away_id = None

            # Prefer scorebox teams for order and IDs
            try:
                sb_team_0 = driver.find_element(By.ID, "sb_team_0")
                sb_team_1 = driver.find_element(By.ID, "sb_team_1")

                # Home
                try:
                    home_link = sb_team_0.find_element(By.XPATH, ".//a[contains(@href, '/squads/')]")
                    home_name = home_link.text.strip()
                    match = re.search(r'/squads/([a-f0-9]+)/', home_link.get_attribute("href") or "")
                    home_id = match.group(1) if match else None
                except:
                    home_name = sb_team_0.text.strip()

                # Away
                try:
                    away_link = sb_team_1.find_element(By.XPATH, ".//a[contains(@href, '/squads/')]")
                    away_name = away_link.text.strip()
                    match = re.search(r'/squads/([a-f0-9]+)/', away_link.get_attribute("href") or "")
                    away_id = match.group(1) if match else None
                except:
                    away_name = sb_team_1.text.strip()

                logger.info(f"  ✓ Scorebox teams: home='{home_name}' (id={home_id}), away='{away_name}' (id={away_id})")
            except Exception as e:
                logger.debug(f"  Could not get teams from scorebox: {e}")

            # Fallback to passed parameters if scorebox missing names
            if not home_name and home_team:
                home_name = home_team
            if not away_name and away_team:
                away_name = away_team

            # As a further fallback, try header links if IDs are missing
            if home_id is None or away_id is None:
                header_links = driver.find_elements(By.XPATH, "//div[contains(@class, 'scorebox')]//a[contains(@href, '/squads/')]")
                for link in header_links:
                    href = link.get_attribute("href") or ""
                    link_text = link.text.strip()
                    match = re.search(r'/squads/([a-f0-9]+)/', href)
                    tid = match.group(1) if match else None
                    if not tid:
                        continue
                    if home_name and link_text and link_text.lower() in home_name.lower():
                        home_id = tid
                    elif away_name and link_text and link_text.lower() in away_name.lower():
                        away_id = tid

            match_data['home_team'] = {'name': home_name, 'fbref_id': home_id}
            match_data['away_team'] = {'name': away_name, 'fbref_id': away_id}
            logger.info(f"  ✓ Final teams: {home_name} (id={home_id}) vs {away_name} (id={away_id})")
        except Exception as e:
            logger.error(f"  ✗ Error extracting team info: {e}")
            import traceback
            logger.debug(traceback.format_exc())
        
        # Extract score - fbref.com displays score prominently in match header/scorebox
        try:
            # Try multiple methods to find the score
            score_found = False
            
            # Method 1: Extract from scorebox_team divs (most reliable)
            # fbref.com has two scorebox_team divs with id="sb_team_0" and id="sb_team_1"
            # Each contains a team name and a score in <div class="score">
            try:
                scorebox_teams = driver.find_elements(By.XPATH, "//div[contains(@class, 'scorebox_team')]")
                if len(scorebox_teams) >= 2:
                    home_score = None
                    away_score = None
                    
                    for team_div in scorebox_teams:
                        try:
                            # Get team ID first - this is the most reliable way to determine home/away
                            # sb_team_0 is ALWAYS home, sb_team_1 is ALWAYS away
                            team_id = team_div.get_attribute("id") or ""
                            is_home_team = "sb_team_0" in team_id
                            is_away_team = "sb_team_1" in team_id
                            
                            # Get score from <div class="score">
                            score_div = team_div.find_element(By.XPATH, ".//div[contains(@class, 'score') and not(contains(@class, 'score_xg'))]")
                            score_text = score_div.text.strip()
                            score_clean = re.sub(r'[^\d]', '', score_text)
                            
                            if score_clean.isdigit():
                                score = int(score_clean)
                                # STRICT validation: scores must be 0-15, single or double digit (max 2 digits)
                                if 0 <= score <= 15 and len(score_clean) <= 2:
                                    # Use team ID to determine home/away (most reliable)
                                    if is_home_team:
                                        home_score = score
                                        logger.debug(f"  Found home score from sb_team_0: {score}")
                                    elif is_away_team:
                                        away_score = score
                                        logger.debug(f"  Found away score from sb_team_1: {score}")
                                else:
                                    logger.warning(f"  Rejected invalid score: {score} from {team_id} (not in 0-15 range or too many digits)")
                                    
                                    # Verify with team name if available (for logging/debugging)
                                    try:
                                        team_link = team_div.find_element(By.XPATH, ".//a[contains(@href, '/squads/')]")
                                        team_name = team_link.text.strip()
                                        if home_team and home_team.lower() in team_name.lower():
                                            logger.debug(f"  Verified: {team_name} matches home team {home_team}")
                                        elif away_team and away_team.lower() in team_name.lower():
                                            logger.debug(f"  Verified: {team_name} matches away team {away_team}")
                                        else:
                                            logger.debug(f"  Note: Team name '{team_name}' doesn't match expected teams, but using ID-based assignment")
                                    except:
                                        pass  # Team name verification is optional
                        except Exception as e:
                            logger.debug(f"  Error extracting score from scorebox_team: {e}")
                            continue
                    
                    if home_score is not None and away_score is not None:
                        # Final validation before setting scores
                        if 0 <= home_score <= 15 and 0 <= away_score <= 15:
                            match_data['match_info']['home_score'] = home_score
                            match_data['match_info']['away_score'] = away_score
                            logger.info(f"  ✓ Extracted score from scorebox_team divs: {home_score}-{away_score}")
                            score_found = True
                        else:
                            logger.error(f"  ✗ Invalid scores extracted: {home_score}-{away_score} (rejected)")
                            home_score = None
                            away_score = None
            except Exception as e:
                logger.debug(f"  Error extracting from scorebox_team divs: {e}")
            
            # Method 2: Look specifically in scorebox for score numbers (fallback)
            if not score_found:
                try:
                    scorebox = driver.find_element(By.XPATH, "//div[contains(@class, 'scorebox')]")
                    
                    # Look for score numbers in scorebox - try multiple approaches
                    # Approach 1: Look for elements with class "score" specifically
                    score_elements = scorebox.find_elements(By.XPATH, ".//*[contains(@class, 'score') and not(contains(@class, 'scorebox')) and not(contains(@class, 'score_xg'))]")
                    
                    # Approach 2: Look in the scores div (fbref has a div with class "scores")
                    try:
                        scores_div = scorebox.find_element(By.XPATH, ".//div[contains(@class, 'scores')]")
                        score_elements.extend(scores_div.find_elements(By.XPATH, ".//*[contains(@class, 'score') and not(contains(@class, 'score_xg'))]"))
                    except:
                        pass
                    
                    # Extract scores in order - try to find them within sb_team_0 and sb_team_1
                    home_score_fallback = None
                    away_score_fallback = None
                    
                    # First, try to find scores within sb_team_0 and sb_team_1 divs
                    try:
                        sb_team_0 = scorebox.find_element(By.XPATH, ".//div[@id='sb_team_0']")
                        sb_team_1 = scorebox.find_element(By.XPATH, ".//div[@id='sb_team_1']")
                        
                        # Get score from sb_team_0 (home)
                        home_score_elem = sb_team_0.find_element(By.XPATH, ".//div[contains(@class, 'score') and not(contains(@class, 'score_xg'))]")
                        home_score_text = home_score_elem.text.strip()
                        home_score_clean = re.sub(r'[^\d]', '', home_score_text)
                        if home_score_clean.isdigit():
                            home_score_fallback = int(home_score_clean)
                            # STRICT validation: scores must be 0-15, single or double digit
                            if 0 <= home_score_fallback <= 15 and len(home_score_clean) <= 2:
                                logger.debug(f"  Found home score from sb_team_0: {home_score_fallback}")
                            else:
                                logger.warning(f"  Rejected invalid home score: {home_score_fallback} (not in 0-15 range or too many digits)")
                                home_score_fallback = None
                        
                        # Get score from sb_team_1 (away)
                        away_score_elem = sb_team_1.find_element(By.XPATH, ".//div[contains(@class, 'score') and not(contains(@class, 'score_xg'))]")
                        away_score_text = away_score_elem.text.strip()
                        away_score_clean = re.sub(r'[^\d]', '', away_score_text)
                        if away_score_clean.isdigit():
                            away_score_fallback = int(away_score_clean)
                            # STRICT validation: scores must be 0-15, single or double digit
                            if 0 <= away_score_fallback <= 15 and len(away_score_clean) <= 2:
                                logger.debug(f"  Found away score from sb_team_1: {away_score_fallback}")
                            else:
                                logger.warning(f"  Rejected invalid away score: {away_score_fallback} (not in 0-15 range or too many digits)")
                                away_score_fallback = None
                    except:
                        pass
                    
                    # If we found both scores from sb_team divs, use them
                    if home_score_fallback is not None and away_score_fallback is not None:
                        match_data['match_info']['home_score'] = home_score_fallback
                        match_data['match_info']['away_score'] = away_score_fallback
                        logger.info(f"  ✓ Extracted score from scorebox sb_team divs: {home_score_fallback}-{away_score_fallback}")
                        score_found = True
                    else:
                        # Fallback: extract all score numbers and use first two (less reliable)
                        score_texts = []
                        for elem in score_elements:
                            text = elem.text.strip()
                            text_clean = re.sub(r'[^\d]', '', text)
                            if text_clean and text_clean.isdigit():
                                try:
                                    num = int(text_clean)
                                    # STRICT validation: must be 0-15 AND max 2 digits
                                    if 0 <= num <= 15 and len(text_clean) <= 2:
                                        score_texts.append(num)
                                    else:
                                        logger.debug(f"  Rejected invalid score candidate: {num} (length: {len(text_clean)})")
                                except:
                                    pass
                        
                        if len(score_texts) >= 2:
                            # Final validation before setting
                            if 0 <= score_texts[0] <= 15 and 0 <= score_texts[1] <= 15:
                                match_data['match_info']['home_score'] = score_texts[0]
                                match_data['match_info']['away_score'] = score_texts[1]
                                logger.info(f"  ✓ Extracted score from scorebox elements (fallback): {score_texts[0]}-{score_texts[1]}")
                                score_found = True
                            else:
                                logger.warning(f"  Rejected invalid scores from fallback: {score_texts[0]}-{score_texts[1]}")
                    
                    # If not found, try parsing scorebox HTML/text more carefully
                    if not score_found:
                        scorebox_text = scorebox.text
                        # Look for two numbers separated by common separators
                        # Try to find the score pattern in the scorebox
                        # First, try to find numbers in elements with class "score"
                        score_divs = scorebox.find_elements(By.XPATH, ".//div[contains(@class, 'score') and not(contains(@class, 'score_xg'))] | .//span[contains(@class, 'score')]")
                        if len(score_divs) >= 2:
                            try:
                                score1_text = score_divs[0].text.strip()
                                score2_text = score_divs[1].text.strip()
                                score1_clean = re.sub(r'[^\d]', '', score1_text)
                                score2_clean = re.sub(r'[^\d]', '', score2_text)
                                if score1_clean.isdigit() and score2_clean.isdigit():
                                    score1 = int(score1_clean)
                                    score2 = int(score2_clean)
                                    # STRICT validation: must be 0-15 AND max 2 digits
                                    if 0 <= score1 <= 15 and 0 <= score2 <= 15 and len(score1_clean) <= 2 and len(score2_clean) <= 2:
                                        match_data['match_info']['home_score'] = score1
                                        match_data['match_info']['away_score'] = score2
                                        logger.info(f"  ✓ Extracted score from score divs: {score1}-{score2}")
                                        score_found = True
                                    else:
                                        logger.warning(f"  Rejected invalid scores from score divs: {score1}-{score2}")
                            except:
                                pass
                        
                        if not score_found:
                            # Try regex patterns on scorebox text
                            score_patterns = [
                                r'(\d{1,2})[\s:–-]+(\d{1,2})',  # "2-1" or "2:1"
                                r'\b(\d{1,2})\b\s+\b(\d{1,2})\b',  # "2 1"
                            ]
                            
                            for pattern in score_patterns:
                                score_match = re.search(pattern, scorebox_text)
                                if score_match:
                                    score1 = int(score_match.group(1))
                                    score2 = int(score_match.group(2))
                                    # STRICT validation: must be 0-15 AND max 2 digits (to avoid dates like 2025-8)
                                    if 0 <= score1 <= 15 and 0 <= score2 <= 15 and len(score_match.group(1)) <= 2 and len(score_match.group(2)) <= 2:
                                        match_data['match_info']['home_score'] = score1
                                        match_data['match_info']['away_score'] = score2
                                        logger.info(f"  ✓ Extracted score from scorebox text: {score1}-{score2}")
                                        score_found = True
                                        break
                                    else:
                                        logger.debug(f"  Rejected invalid score pattern: {score1}-{score2}")
                except NoSuchElementException:
                    logger.debug("  Scorebox not found, trying other methods...")
                except Exception as e:
                    logger.debug(f"  Error extracting from scorebox: {e}")
            
            # Method 2: Look for score in large text elements (common pattern on fbref)
            if not score_found:
                score_elements = driver.find_elements(By.XPATH, "//*[contains(@class, 'score') or contains(@id, 'score')]")
                for elem in score_elements:
                    try:
                        text = elem.text.strip()
                        # Look for score pattern like "1:1" or "2-1" or "2 – 1"
                        score_match = re.search(r'(\d+)[\s:–-]+(\d+)', text)
                        if score_match:
                            score1 = int(score_match.group(1))
                            score2 = int(score_match.group(2))
                            # STRICT validation: must be 0-15 AND max 2 digits (to avoid dates like 2025-8)
                            if 0 <= score1 <= 15 and 0 <= score2 <= 15 and len(score_match.group(1)) <= 2 and len(score_match.group(2)) <= 2:
                                match_data['match_info']['home_score'] = score1
                                match_data['match_info']['away_score'] = score2
                                logger.info(f"  ✓ Extracted score: {match_data['match_info']['home_score']}-{match_data['match_info']['away_score']}")
                                score_found = True
                                break
                            else:
                                logger.debug(f"  Rejected invalid score pattern: {score1}-{score2}")
                    except:
                        continue
            
            # Method 2: Look in the main match header area (scorebox)
            if not score_found:
                try:
                    # fbref.com has score in scorebox div - look for score numbers specifically
                    scorebox_selectors = [
                        "//div[contains(@class, 'scorebox')]",
                        "//div[contains(@class, 'score_box')]",
                        "//div[contains(@class, 'match')]",
                        "//div[contains(@id, 'scorebox')]"
                    ]
                    
                    for selector in scorebox_selectors:
                        try:
                            scoreboxes = driver.find_elements(By.XPATH, selector)
                            for scorebox in scoreboxes:
                                # Look for score numbers in the scorebox
                                # Scores are usually displayed as large numbers
                                score_elements = scorebox.find_elements(By.XPATH, ".//*[contains(@class, 'score') or contains(@class, 'goals')]")
                                
                                # Also try to find numbers that look like scores
                                scorebox_text = scorebox.text
                                
                                # Look for pattern like "2" "1" or "2-1" or "2:1" in scorebox
                                # Try to find two numbers that are scores
                                score_patterns = [
                                    r'(\d+)[\s:–-]+(\d+)',  # "2-1" or "2:1"
                                    r'(\d+)\s+(\d+)',        # "2 1"
                                ]
                                
                                for pattern in score_patterns:
                                    score_match = re.search(pattern, scorebox_text)
                                    if score_match:
                                        score1 = int(score_match.group(1))
                                        score2 = int(score_match.group(2))
                                        # Validate scores are reasonable (0-15 range, not dates)
                                        if score1 <= 15 and score2 <= 15:
                                            match_data['match_info']['home_score'] = score1
                                            match_data['match_info']['away_score'] = score2
                                            logger.info(f"  ✓ Extracted score from scorebox: {match_data['match_info']['home_score']}-{match_data['match_info']['away_score']}")
                                            score_found = True
                                            break
                                
                                if score_found:
                                    break
                            
                            if score_found:
                                break
                        except Exception as e:
                            logger.debug(f"  Error with selector {selector}: {e}")
                            continue
                except Exception as e:
                    logger.debug(f"  Error extracting score from header: {e}")
                    pass
            
            # Method 3: Look for score in page title or main heading
            if not score_found:
                try:
                    page_text = driver.find_element(By.TAG_NAME, "body").text
                    # Look for score pattern in context of team names
                    score_match = re.search(r'(\d+)[\s:–-]+(\d+)', page_text)
                    if score_match:
                        score1 = int(score_match.group(1))
                        score2 = int(score_match.group(2))
                        # Validate scores are reasonable (0-15 range, not dates)
                        if score1 <= 15 and score2 <= 15:
                            match_data['match_info']['home_score'] = score1
                            match_data['match_info']['away_score'] = score2
                            logger.info(f"  ✓ Extracted score from page text: {match_data['match_info']['home_score']}-{match_data['match_info']['away_score']}")
                except:
                    pass
        except Exception as e:
            logger.debug(f"  Error extracting score: {e}")
        
        # Extract lineups - will be done after player stats are extracted
        # (Placeholder - actual extraction happens later)
        
        # Extract events (goals, cards, substitutions)
        # fbref.com has events in a "Match Summary" section with chronological list
        # Based on screenshots: events are listed with minute, player name, and event type
        logger.info(f"  Extracting match events...")
        if debug:
            logger.info(f"    Debug mode: {debug}, Debug dir: {debug_dir}")
        
        # Method 0: Extract goals from shots table (most reliable)
        logger.info(f"    Extracting goals from shots table...")
        try:
            # Find shots tables - they have id like "shots_all", "shots_822bd0ba", "shots_4ba7cbea"
            shots_tables = driver.find_elements(By.XPATH, "//table[contains(@id, 'shots_') or @id='shots_all']")
            logger.info(f"    Found {len(shots_tables)} shots tables")
            
            for shots_table in shots_tables:
                try:
                    # Get team ID from table ID (e.g., "shots_822bd0ba" -> "822bd0ba")
                    table_id = shots_table.get_attribute("id") or ""
                    team_id_match = re.search(r'shots_([a-f0-9]+)', table_id)
                    table_team_id = team_id_match.group(1) if team_id_match else None
                    
                    # Determine if this is home or away team
                    is_home_team = False
                    if table_team_id:
                        if match_data.get('home_team', {}).get('fbref_id') == table_team_id:
                            is_home_team = True
                        elif match_data.get('away_team', {}).get('fbref_id') == table_team_id:
                            is_home_team = False
                        else:
                            # Try to determine from table position or class
                            table_class = shots_table.get_attribute("class") or ""
                            if 'home' in table_class.lower():
                                is_home_team = True
                            elif 'away' in table_class.lower():
                                is_home_team = False
                    
                    team_key = 'home' if is_home_team else 'away'
                    
                    # Find all rows in tbody
                    tbody = shots_table.find_element(By.TAG_NAME, "tbody")
                    rows = tbody.find_elements(By.TAG_NAME, "tr")
                    logger.info(f"    Processing {len(rows)} rows from shots table {table_id}")
                    
                    for row in rows:
                        try:
                            # Check if this row is a goal (has data-stat="outcome" with text "Goal")
                            outcome_cell = row.find_element(By.XPATH, ".//td[@data-stat='outcome']")
                            outcome_text = outcome_cell.text.strip()
                            
                            if outcome_text.lower() != 'goal':
                                continue
                            
                            # Extract minute
                            minute_cell = row.find_element(By.XPATH, ".//th[@data-stat='minute'] | .//td[@data-stat='minute']")
                            minute_text = minute_cell.text.strip()
                            # Handle formats like "37", "90+4", "45+2"
                            minute_match = re.search(r'(\d+)(?:\+(\d+))?', minute_text)
                            if minute_match:
                                minute_base = int(minute_match.group(1))
                                minute_added = minute_match.group(2) if minute_match.lastindex and minute_match.lastindex >= 2 else None
                                minute = f"{minute_base}+{minute_added}" if minute_added else str(minute_base)
                            else:
                                minute = minute_text
                            
                            # Extract player name and ID
                            player_cell = row.find_element(By.XPATH, ".//td[@data-stat='player']")
                            player_link = player_cell.find_element(By.XPATH, ".//a[contains(@href, '/players/')]")
                            player_name = player_link.text.strip()
                            player_href = player_link.get_attribute("href")
                            player_id_match = re.search(r'/players/([a-f0-9]+)/', player_href)
                            player_id = player_id_match.group(1) if player_id_match else None
                            
                            # Extract assist info if available
                            assist_player = None
                            assist_player_id = None
                            try:
                                sca1_player_cell = row.find_element(By.XPATH, ".//td[@data-stat='sca_1_player']")
                                sca1_player_link = sca1_player_cell.find_element(By.XPATH, ".//a[contains(@href, '/players/')]")
                                assist_player = sca1_player_link.text.strip()
                                assist_href = sca1_player_link.get_attribute("href")
                                assist_id_match = re.search(r'/players/([a-f0-9]+)/', assist_href)
                                assist_player_id = assist_id_match.group(1) if assist_id_match else None
                            except:
                                pass
                            
                            # Add goal event if not already present
                            if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['goals']):
                                goal_event = {
                                    'type': 'goal',
                                    'player_name': player_name,
                                    'player_id': player_id,
                                    'minute': minute,
                                    'team': team_key,
                                    'assist_player': assist_player,
                                    'assist_player_id': assist_player_id
                                }
                                match_data['events']['goals'].append(goal_event)
                                
                                # Also add assist if found
                                if assist_player and not any(e.get('player_name') == assist_player and str(e.get('minute')) == str(minute) for e in match_data['events']['assists']):
                                    assist_event = {
                                        'type': 'assist',
                                        'player_name': assist_player,
                                        'player_id': assist_player_id,
                                        'minute': minute,
                                        'team': team_key
                                    }
                                    match_data['events']['assists'].append(assist_event)
                                
                                logger.info(f"    ✓ Goal from shots table: {player_name} ({minute}') [{team_key}]" + (f" (assist: {assist_player})" if assist_player else ""))
                        except Exception as e:
                            logger.debug(f"      Error processing shots table row: {e}")
                            continue
                    
                    logger.info(f"    ✓ Extracted {len([g for g in match_data['events']['goals'] if g.get('team') == team_key])} goals from shots table {table_id}")
                except Exception as e:
                    logger.debug(f"    Error processing shots table: {e}")
                    continue
        except Exception as e:
            logger.debug(f"    Error extracting goals from shots table: {e}")
            import traceback
            logger.debug(traceback.format_exc())
        
        # Save events section HTML for debugging
        if debug and debug_dir:
            try:
                os.makedirs(debug_dir, exist_ok=True)
                safe_home = (home_team or 'home').replace(' ', '_').replace('/', '_').replace("'", '')
                safe_away = (away_team or 'away').replace(' ', '_').replace('/', '_').replace("'", '')
                events_sections = driver.find_elements(By.XPATH, "//div[contains(@id, 'events') or contains(@class, 'events') or contains(@class, 'summary') or contains(@class, 'match_summary')]")
                if events_sections:
                    events_html = os.path.join(debug_dir, f"events_section_{safe_home}_{safe_away}.html")
                    with open(events_html, 'w', encoding='utf-8') as f:
                        f.write(events_sections[0].get_attribute('outerHTML'))
                    logger.info(f"  💾 Saved events section HTML: {events_html}")
            except Exception as e:
                logger.debug(f"  Could not save events HTML: {e}")
        
        try:
            # Look for match summary or events section
            # fbref.com uses various structures - try multiple approaches
            events_found = False
            
            # Method 0: Extract cards from card icons/elements (cards are shown as icons on fbref)
            logger.info(f"    Extracting cards from card icons/elements...")
            try:
                # Look for card icons - cards are often displayed as yellow/red squares or emojis
                # Try multiple selectors to find card elements
                card_selectors = [
                    "//*[contains(@class, 'card')]",
                    "//*[contains(@class, 'yellow-card') or contains(@class, 'red-card')]",
                    "//*[contains(@class, 'yellow') and contains(@class, 'card')]",
                    "//*[contains(@class, 'red') and contains(@class, 'card')]",
                    "//*[contains(@title, 'card') or contains(@title, 'yellow') or contains(@title, 'red')]",
                    "//*[contains(@aria-label, 'card')]"
                ]
                
                all_card_elements = []
                for selector in card_selectors:
                    try:
                        elements = driver.find_elements(By.XPATH, selector)
                        all_card_elements.extend(elements)
                    except:
                        continue
                
                # Also look for elements containing card emojis/unicode
                card_emoji_elements = driver.find_elements(By.XPATH, "//*[contains(text(), '🟨') or contains(text(), '🟥')]")
                all_card_elements.extend(card_emoji_elements)
                
                logger.info(f"    Found {len(all_card_elements)} potential card elements")
                
                for card_elem in all_card_elements[:50]:  # Limit to first 50
                    try:
                        # Get parent or container to find player name and minute
                        parent = None
                        try:
                            parent = card_elem.find_element(By.XPATH, "./ancestor::*[contains(@class, 'player') or contains(@class, 'event') or contains(@class, 'summary') or contains(@class, 'lineup')][1]")
                        except:
                            try:
                                parent = card_elem.find_element(By.XPATH, "./parent::*")
                            except:
                                continue
                        
                        if not parent:
                            continue
                        
                        parent_text = parent.text
                        
                        # Look for player link in parent or nearby
                        player_link = None
                        try:
                            player_link = parent.find_element(By.XPATH, ".//a[contains(@href, '/players/')]")
                        except:
                            # Try sibling
                            try:
                                sibling = card_elem.find_element(By.XPATH, "./following-sibling::*//a[contains(@href, '/players/')] | ./preceding-sibling::*//a[contains(@href, '/players/')]")
                                player_link = sibling
                            except:
                                pass
                        
                        if not player_link:
                            continue
                        
                        player_name = player_link.text.strip()
                        if not player_name or len(player_name) < 3:
                            continue
                        
                        href = player_link.get_attribute("href")
                        player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                        player_id = player_id_match.group(1) if player_id_match else None
                        
                        # Look for minute in parent text or nearby
                        minute_match = re.search(r'(\d+)(?:\+(\d+))?[\'′''\u2019\u2032]', parent_text)
                        if not minute_match:
                            # Try in card element itself
                            card_text = card_elem.text
                            minute_match = re.search(r'(\d+)(?:\+(\d+))?[\'′''\u2019\u2032]', card_text)
                        
                        if not minute_match:
                            continue
                        
                        minute_base = int(minute_match.group(1))
                        minute_added = minute_match.group(2) if minute_match.lastindex and minute_match.lastindex >= 2 else None
                        minute = f"{minute_base}+{minute_added}" if minute_added else str(minute_base)
                        
                        # Determine card type
                        card_type = 'yellow'
                        elem_class = card_elem.get_attribute("class") or ""
                        elem_text = card_elem.text
                        elem_title = card_elem.get_attribute("title") or ""
                        elem_aria = card_elem.get_attribute("aria-label") or ""
                        
                        if 'red' in elem_class.lower() or '🟥' in elem_text or 'red' in elem_text.lower() or 'red' in elem_title.lower() or 'red' in elem_aria.lower():
                            card_type = 'red'
                        elif 'yellow' in elem_class.lower() or '🟨' in elem_text or 'yellow' in elem_text.lower() or 'yellow' in elem_title.lower() or 'yellow' in elem_aria.lower():
                            card_type = 'yellow'
                        
                        # Determine team
                        team = 'home'  # Default
                        try:
                            team_parent = parent.find_element(By.XPATH, "./ancestor::*[contains(@class, 'home') or contains(@class, 'away')][1]")
                            team_class = team_parent.get_attribute("class") or ""
                            if 'away' in team_class.lower():
                                team = 'away'
                        except:
                            # Try to determine from position in page or team name in text
                            if away_team and away_team.lower() in parent_text.lower():
                                # Check if away team appears before home team
                                home_idx = parent_text.lower().find(home_team.lower() if home_team else '')
                                away_idx = parent_text.lower().find(away_team.lower())
                                if away_idx >= 0 and (home_idx < 0 or away_idx < home_idx):
                                    team = 'away'
                        
                        # Add card event if not already present
                        if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['cards']):
                            event = {
                                'type': 'card',
                                'card_type': card_type,
                                'player_name': player_name,
                                'player_id': player_id,
                                'minute': minute,
                                'team': team
                            }
                            match_data['events']['cards'].append(event)
                            logger.info(f"    ✓ Card (icon): {player_name} ({minute}') [{card_type}] [{team}]")
                            events_found = True
                    except Exception as e:
                        logger.debug(f"      Error processing card element: {e}")
                        continue
                
                if len([c for c in match_data['events']['cards']]) > 0:
                    logger.info(f"    ✓ Extracted {len([c for c in match_data['events']['cards']])} cards from icons")
            except Exception as e:
                logger.debug(f"    Error extracting cards from icons: {e}")
            
            # Method 0.5: Extract substitutions from substitution icons/elements
            logger.info(f"    Extracting substitutions from substitution icons/elements...")
            try:
                # Look for substitution icons - substitutions are often displayed as arrows or icons
                sub_selectors = [
                    "//*[contains(@class, 'substitution') or contains(@class, 'sub')]",
                    "//*[contains(@class, 'sub-on') or contains(@class, 'sub-off')]",
                    "//*[contains(@title, 'substitution') or contains(@title, 'sub')]",
                    "//*[contains(@aria-label, 'substitution') or contains(@aria-label, 'sub')]"
                ]
                
                all_sub_elements = []
                for selector in sub_selectors:
                    try:
                        elements = driver.find_elements(By.XPATH, selector)
                        all_sub_elements.extend(elements)
                    except:
                        continue
                
                # Also look for substitution arrows/icons (↔, ↕, ⇄, etc.)
                sub_arrow_elements = driver.find_elements(By.XPATH, "//*[contains(text(), '↔') or contains(text(), '↕') or contains(text(), '⇄')]")
                all_sub_elements.extend(sub_arrow_elements)
                
                logger.info(f"    Found {len(all_sub_elements)} potential substitution elements")
                
                for sub_elem in all_sub_elements[:50]:  # Limit to first 50
                    try:
                        # Get parent or container to find player names and minute
                        parent = None
                        try:
                            parent = sub_elem.find_element(By.XPATH, "./ancestor::*[contains(@class, 'player') or contains(@class, 'event') or contains(@class, 'summary') or contains(@class, 'lineup')][1]")
                        except:
                            try:
                                parent = sub_elem.find_element(By.XPATH, "./parent::*")
                            except:
                                continue
                        
                        if not parent:
                            continue
                        
                        parent_text = parent.text
                        
                        # Look for player links in parent (should be 2: one coming in, one going out)
                        player_links = parent.find_elements(By.XPATH, ".//a[contains(@href, '/players/')]")
                        if len(player_links) < 1:
                            # Try sibling
                            try:
                                sibling = sub_elem.find_element(By.XPATH, "./following-sibling::* | ./preceding-sibling::*")
                                player_links = sibling.find_elements(By.XPATH, ".//a[contains(@href, '/players/')]")
                            except:
                                pass
                        
                        if len(player_links) < 1:
                            continue
                        
                        # Determine which player is coming in (usually the second link or the one after "for")
                        player_in_link = player_links[0]  # Default to first
                        player_out_link = None
                        
                        # Look for "for" or "on" in text to determine substitution direction
                        if 'for' in parent_text.lower() or 'on' in parent_text.lower():
                            # Try to find the pattern "Player A for Player B" or "Player A on for Player B"
                            for i, link in enumerate(player_links):
                                link_text = link.text.strip()
                                # Check if this link appears after "for" or "on"
                                link_idx = parent_text.lower().find(link_text.lower())
                                for_idx = parent_text.lower().find('for')
                                on_idx = parent_text.lower().find(' on ')
                                if (for_idx >= 0 and link_idx > for_idx) or (on_idx >= 0 and link_idx > on_idx):
                                    player_in_link = link
                                    if i > 0:
                                        player_out_link = player_links[i-1]
                                    break
                        
                        player_in_name = player_in_link.text.strip()
                        if not player_in_name or len(player_in_name) < 3:
                            continue
                        
                        href = player_in_link.get_attribute("href")
                        player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                        player_in_id = player_id_match.group(1) if player_id_match else None
                        
                        player_out_name = None
                        player_out_id = None
                        if player_out_link:
                            player_out_name = player_out_link.text.strip()
                            href_out = player_out_link.get_attribute("href")
                            player_out_id_match = re.search(r'/players/([a-f0-9]+)/', href_out)
                            player_out_id = player_out_id_match.group(1) if player_out_id_match else None
                        
                        # Look for minute in parent text
                        minute_match = re.search(r'(\d+)(?:\+(\d+))?[\'′''\u2019\u2032]', parent_text)
                        if not minute_match:
                            continue
                        
                        minute_base = int(minute_match.group(1))
                        minute_added = minute_match.group(2) if minute_match.lastindex and minute_match.lastindex >= 2 else None
                        minute = f"{minute_base}+{minute_added}" if minute_added else str(minute_base)
                        
                        # Determine team
                        team = 'home'  # Default
                        try:
                            team_parent = parent.find_element(By.XPATH, "./ancestor::*[contains(@class, 'home') or contains(@class, 'away')][1]")
                            team_class = team_parent.get_attribute("class") or ""
                            if 'away' in team_class.lower():
                                team = 'away'
                        except:
                            if away_team and away_team.lower() in parent_text.lower():
                                home_idx = parent_text.lower().find(home_team.lower() if home_team else '')
                                away_idx = parent_text.lower().find(away_team.lower())
                                if away_idx >= 0 and (home_idx < 0 or away_idx < home_idx):
                                    team = 'away'
                        
                        # Add substitution event if not already present
                        if not any(e.get('player_name') == player_in_name and str(e.get('minute')) == str(minute) for e in match_data['events']['substitutions']):
                            event = {
                                'type': 'substitution',
                                'player_name': player_in_name,
                                'player_id': player_in_id,
                                'minute': minute,
                                'team': team,
                                'substituted_for': player_out_name
                            }
                            match_data['events']['substitutions'].append(event)
                            logger.info(f"    ✓ Substitution (icon): {player_in_name} ({minute}') for {player_out_name or 'N/A'} [{team}]")
                            events_found = True
                    except Exception as e:
                        logger.debug(f"      Error processing substitution element: {e}")
                        continue
                
                if len([s for s in match_data['events']['substitutions']]) > 0:
                    logger.info(f"    ✓ Extracted {len([s for s in match_data['events']['substitutions']])} substitutions from icons")
            except Exception as e:
                logger.debug(f"    Error extracting substitutions from icons: {e}")
            
            # Method 1: Look for match summary section - fbref.com often uses specific IDs/classes
            # Try more specific selectors first (events_wrap is common on fbref)
            summary_sections = []
            event_selectors = [
                "//div[@id='events_wrap']",
                "//div[contains(@id, 'events_wrap')]",
                "//div[contains(@class, 'events_wrap')]",
                "//div[@id='events']",
                "//div[contains(@id, 'events')]",
                "//div[contains(@class, 'events')]",
                "//div[contains(@class, 'match_summary')]",
                "//div[contains(@class, 'summary')]",
                "//div[contains(@id, 'summary')]",
                "//section[contains(@class, 'events')]",
                "//section[contains(@id, 'events')]"
            ]
            
            for selector in event_selectors:
                try:
                    sections = driver.find_elements(By.XPATH, selector)
                    if sections:
                        summary_sections.extend(sections)
                        logger.info(f"    Found {len(sections)} sections with selector: {selector}")
                        if len(summary_sections) > 0:
                            break  # Use first successful selector
                except:
                    continue
            
            if not summary_sections:
                # Fallback to broader search
                summary_sections = driver.find_elements(By.XPATH, "//div[contains(@id, 'events') or contains(@class, 'events') or contains(@class, 'summary') or contains(@id, 'summary') or contains(@class, 'match_summary')]")
            
            logger.info(f"    Found {len(summary_sections)} summary/events sections total")
            
            # Method 2: Look for event lists (ul/ol with event items)
            event_lists = driver.find_elements(By.XPATH, "//ul[contains(@class, 'event')] | //ol[contains(@class, 'event')] | //div[contains(@class, 'event')]")
            logger.info(f"    Found {len(event_lists)} event lists")
            
            # Method 3: Look for list items or divs that contain both minutes and player links
            # fbref.com events are often in <li> or <div> elements
            event_containers = driver.find_elements(By.XPATH, "//li[.//a[contains(@href, '/players/')] and (contains(text(), \"'\") or contains(text(), '+'))] | //div[.//a[contains(@href, '/players/')] and (contains(text(), \"'\") or contains(text(), '+'))]")
            logger.info(f"    Found {len(event_containers)} containers with both player links and minute markers")
            
            # Also try finding containers by looking for elements with minute markers that have player links nearby
            # Try a broader search
            all_li_elements = driver.find_elements(By.XPATH, "//li")
            all_div_elements = driver.find_elements(By.XPATH, "//div[contains(@class, 'event') or contains(@class, 'summary') or contains(@id, 'event')]")
            logger.info(f"    Also found {len(all_li_elements)} <li> elements and {len(all_div_elements)} event-related divs")
            
            # Process these containers
            containers_processed = 0
            for container in event_containers[:30]:  # Process first 30
                try:
                    container_text = container.text.strip()
                    logger.debug(f"      Checking container {containers_processed + 1}: text_length={len(container_text)}, text_preview='{container_text[:100]}'")
                    
                    if not container_text or len(container_text) < 5:
                        logger.debug(f"        Skipping: text too short or empty")
                        continue
                    
                    # Look for minute pattern - try multiple formats
                    minute_match = re.search(r'(\d+)(?:\+(\d+))?\s*[\'′]', container_text)
                    if not minute_match:
                        # Try without apostrophe
                        minute_match = re.search(r'(\d+)(?:\+(\d+))?\s*:', container_text)
                    
                    if not minute_match:
                        logger.debug(f"        Skipping: no minute pattern found")
                        continue
                    
                    minute_base = int(minute_match.group(1))
                    minute_added = minute_match.group(2)
                    minute = f"{minute_base}+{minute_added}" if minute_added else minute_base
                    
                    containers_processed += 1
                    # Log all containers to see structure
                    logger.info(f"      ✓ Container {containers_processed} with minute {minute}: '{container_text[:200]}'")
                    
                    container_lower = container_text.lower()
                    
                    # Check for event indicators - be more lenient
                    # Goals might not always have "goal" text, just player name and minute
                    has_goal = ('goal' in container_lower and 'assist' not in container_lower) or '⚽' in container_text or '🥅' in container_text
                    has_assist = 'assist' in container_lower and 'goal' not in container_lower
                    has_card = ('yellow' in container_lower or 'red' in container_lower or '🟨' in container_text or '🟥' in container_text) and ('card' in container_lower or 'yellow' in container_lower or 'red' in container_lower)
                    has_sub = 'substitution' in container_lower or ('sub' in container_lower and ('for' in container_lower or 'out' in container_lower or 'in' in container_lower))
                    
                    # If we have a minute and player link, it might be a goal even without explicit "goal" text
                    # (fbref sometimes just shows player name and minute for goals)
                    might_be_goal = minute_match and player_links and not (has_assist or has_card or has_sub)
                    
                    if not (has_goal or has_assist or has_card or has_sub or might_be_goal):
                        continue
                    
                    # Find player links in this container
                    player_links = container.find_elements(By.XPATH, ".//a[contains(@href, '/players/')]")
                    if containers_processed <= 5:
                        logger.info(f"        player_links found: {len(player_links)}, has_goal={has_goal}, has_assist={has_assist}, has_card={has_card}, has_sub={has_sub}")
                    
                    if not player_links:
                        continue
                    
                    for player_link in player_links:
                        try:
                            player_name = player_link.text.strip()
                            if not player_name or len(player_name) < 3:
                                continue
                            
                            href = player_link.get_attribute("href")
                            player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                            player_id = player_id_match.group(1) if player_id_match else None
                            
                            # Determine team - check if player is in home or away section
                            is_home = True
                            try:
                                # Check parent elements for home/away indicators
                                parent = player_link.find_element(By.XPATH, "./ancestor::*[contains(@class, 'home') or contains(@class, 'away')][1]")
                                parent_class = parent.get_attribute("class") or ""
                                if 'away' in parent_class.lower():
                                    is_home = False
                            except:
                                # Fallback: check if player name appears near home/away team names
                                container_parent = container.find_element(By.XPATH, "./ancestor::*[contains(@class, 'home') or contains(@class, 'away')][1]")
                                parent_class = container_parent.get_attribute("class") or ""
                                if 'away' in parent_class.lower():
                                    is_home = False
                            
                            if has_goal or might_be_goal:
                                if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['goals']):
                                    event = {
                                        'type': 'goal',
                                        'player_name': player_name,
                                        'player_id': player_id,
                                        'minute': minute,
                                        'team': 'home' if is_home else 'away'
                                    }
                                    match_data['events']['goals'].append(event)
                                    logger.info(f"    ✓ Goal: {player_name} ({minute}')")
                                    events_found = True
                            
                            elif has_assist:
                                if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['assists']):
                                    event = {
                                        'type': 'assist',
                                        'player_name': player_name,
                                        'player_id': player_id,
                                        'minute': minute,
                                        'team': 'home' if is_home else 'away'
                                    }
                                    match_data['events']['assists'].append(event)
                                    logger.info(f"    ✓ Assist: {player_name} ({minute}')")
                                    events_found = True
                            
                            elif has_card:
                                card_type = "red" if "red" in container_lower else "yellow"
                                if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['cards']):
                                    event = {
                                        'type': 'card',
                                        'card_type': card_type,
                                        'player_name': player_name,
                                        'player_id': player_id,
                                        'minute': minute,
                                        'team': 'home' if is_home else 'away'
                                    }
                                    match_data['events']['cards'].append(event)
                                    logger.info(f"    ✓ Card: {player_name} ({minute}')")
                                    events_found = True
                            
                            elif has_sub:
                                if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['substitutions']):
                                    event = {
                                        'type': 'substitution',
                                        'player_name': player_name,
                                        'player_id': player_id,
                                        'minute': minute,
                                        'team': 'home' if is_home else 'away'
                                    }
                                    match_data['events']['substitutions'].append(event)
                                    logger.info(f"    ✓ Substitution: {player_name} ({minute}')")
                                    events_found = True
                        except:
                            continue
                except:
                    continue
            
            # Method 4: Use BeautifulSoup to parse HTML and find events more reliably
            try:
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                
                # Look for common event container patterns
                # fbref.com often uses specific classes or IDs for events
                event_sections = soup.find_all(['div', 'section', 'ul', 'ol'], 
                    class_=re.compile(r'event|summary|match.*summary|timeline|goal|assist|card|sub', re.I))
                
                # Also look for sections by ID
                event_sections_by_id = soup.find_all(['div', 'section'], 
                    id=re.compile(r'event|summary|goal|assist|card|sub', re.I))
                
                # Combine and deduplicate
                all_sections = event_sections + [s for s in event_sections_by_id if s not in event_sections]
                
                logger.info(f"    Found {len(all_sections)} potential event sections via BeautifulSoup")
                
                for section_idx, section in enumerate(all_sections[:30]):  # Check first 30
                    section_text = section.get_text(separator=' ', strip=True)
                    if len(section_text) < 10:
                        continue
                    
                    # Log first few sections to see structure
                    if section_idx < 5:
                        logger.info(f"      Section {section_idx + 1}: '{section_text[:200]}'")
                    
                    # Check if this section contains the player-minute format OR event keywords
                    # Don't skip sections that might have assists, cards, or substitutions in different formats
                    has_separator = '·' in section_text or '•' in section_text
                    has_event_keywords = any(keyword in section_text.lower() for keyword in ['assist', 'card', 'yellow', 'red', 'substitution', 'sub'])
                    
                    if not has_separator and not has_event_keywords:
                        # Skip sections without separator or event keywords
                        continue
                    
                    # Pattern 1: "Player Name · Minute'" format (common for goal scorers)
                    # Example: "Hugo Ekitike · 37' Cody Gakpo · 49'"
                    # The · character might be encoded differently, try multiple approaches
                    player_minute_matches = []
                    
                    # Approach 1: Split by common separators and extract pairs
                    # Format: "Player Name · Minute' Next Player Name · Minute'"
                    # When split by ·, we get: ["Player Name", "Minute' Next Player Name", "Minute' Next Player Name", ...]
                    parts = re.split(r'\s*[·•]\s*', section_text)
                    logger.info(f"        Split into {len(parts)} parts")
                    if len(parts) > 1:
                        logger.info(f"        First 3 parts: {parts[:3]}")
                    
                    # Process pairs: part[i] is player name, part[i+1] contains minute and next player
                    # Format: "Hugo Ekitike · 37' Cody Gakpo · 49'"
                    # After split: ["Hugo Ekitike", "37' Cody Gakpo", "49' Federico Chiesa"]
                    # For each part[i], the minute is in part[i+1], and the player name is in part[i]
                    for part_idx in range(len(parts) - 1):
                        player_name = parts[part_idx].strip()
                        next_part = parts[part_idx + 1].strip()
                        
                        # Extract minute from next_part (format: "37' Next Player" or "90+4'")
                        # The minute is at the start of next_part
                        minute_match = re.search(r'^(\d+)(?:\+(\d+))?[\'′''\u2019\u2032]', next_part)
                        if not minute_match:
                            # Try with optional space
                            minute_match = re.search(r'^(\d+)(?:\+(\d+))?\s*[\'′''\u2019\u2032]', next_part)
                        
                        if minute_match and player_name and len(player_name) > 2:
                            minute_base = int(minute_match.group(1))
                            minute_added = minute_match.group(2) if minute_match.lastindex and minute_match.lastindex >= 2 else None
                            minute = f"{minute_base}+{minute_added}" if minute_added else str(minute_base)
                            
                            # Clean player name - remove any leading numbers and apostrophes (in case of mis-split)
                            player_name_clean = re.sub(r'^\d+[\'′''\u2019\u2032]\s*', '', player_name).strip()
                            if player_name_clean and len(player_name_clean) > 2:
                                player_minute_matches.append((player_name_clean, str(minute_base), minute_added))
                                logger.info(f"          ✓ Extracted: {player_name_clean} ({minute}')")
                        elif part_idx < 3:
                            logger.info(f"          Part {part_idx}: No minute match found in '{next_part[:50]}'")
                    
                    # Also check last part for final player-minute pair
                    if len(parts) >= 2:
                        last_part = parts[-1].strip()
                        # If we have an odd number, the last part might be just a minute
                        # But we already processed it in the loop above
                    
                    # Approach 2: Direct regex if approach 1 didn't work
                    if not player_minute_matches:
                        pattern = re.compile(r'([A-Z][a-zA-Z\s]+?)\s*[·•]\s*(\d+)(?:\+(\d+))?\s*[\'′]', re.MULTILINE)
                        player_minute_matches = pattern.findall(section_text)
                    
                    # Approach 3: Even simpler - any capital words followed by number and '
                    if not player_minute_matches:
                        pattern = re.compile(r'([A-Z][a-zA-Z\s]{2,}?)\s+(\d+)(?:\+(\d+))?\s*[\'′]', re.MULTILINE)
                        player_minute_matches = pattern.findall(section_text)
                    
                    if player_minute_matches:
                        logger.info(f"      ✓ Found {len(player_minute_matches)} player-minute pairs")
                        logger.debug(f"        First match: {player_minute_matches[0]}")
                    
                    if player_minute_matches:
                        logger.info(f"      ✓ Section {section_idx + 1}: Found {len(player_minute_matches)} player-minute pairs")
                        logger.info(f"        First few matches: {player_minute_matches[:3]}")
                        
                        # Get player links from this section to match names
                        player_links = section.find_all('a', href=re.compile(r'/players/'))
                        player_link_map = {}
                        for link in player_links:
                            player_name = link.get_text(strip=True)
                            href = link.get('href', '')
                            player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                            player_id = player_id_match.group(1) if player_id_match else None
                            player_link_map[player_name] = player_id
                        
                        logger.info(f"        Found {len(player_link_map)} player links in section")
                        
                        # Process each player-minute pair
                        for match_idx, match in enumerate(player_minute_matches):
                            player_name = match[0].strip() if isinstance(match[0], str) else str(match[0]).strip()
                            minute_base = int(match[1]) if isinstance(match[1], (int, str)) else int(str(match[1]))
                            minute_added = match[2] if len(match) > 2 and match[2] else None
                            minute = f"{minute_base}+{minute_added}" if minute_added else str(minute_base)
                            
                            # Get player ID from link map
                            player_id = player_link_map.get(player_name)
                            
                            # Determine event type based on section context
                            section_lower = section_text.lower()
                            section_class = ' '.join(section.get('class', [])) if section.get('class') else ''
                            section_id = section.get('id', '')
                            
                            # Check if this is a goals section - look for goal-related keywords in parent elements too
                            section_parent = section.parent if section.parent else None
                            parent_text = section_parent.get_text(separator=' ', strip=True).lower() if section_parent else ''
                            parent_class = ' '.join(section_parent.get('class', [])).lower() if section_parent and section_parent.get('class') else ''
                            
                            is_goals = ('goal' in section_lower or 'scorer' in section_lower or 
                                       'goal' in section_class.lower() or 'goal' in section_id.lower() or
                                       'goal' in parent_text or 'scorer' in parent_text)
                            is_assists = ('assist' in section_lower or 'assist' in section_class.lower() or 'assist' in section_id.lower() or
                                         'assist' in parent_text)
                            is_cards = ('card' in section_lower or 'yellow' in section_lower or 'red' in section_lower or
                                       'card' in section_class.lower() or 'card' in section_id.lower() or
                                       'card' in parent_text or 'yellow' in parent_text or 'red' in parent_text)
                            is_subs = ('sub' in section_lower or 'substitution' in section_lower or
                                      'sub' in section_class.lower() or 'sub' in section_id.lower() or
                                      'sub' in parent_text or 'substitution' in parent_text)
                            
                            # If section contains player-minute pairs in format "Player · Minute'", it's likely goals
                            # Default to goal if it's a simple player-minute format (most common for goal scorers)
                            # Since we're processing from player_minute_matches, default to goals
                            if match_idx < 3:
                                logger.info(f"          Processing match {match_idx + 1}: player='{player_name}', minute={minute}, is_goals={is_goals}, is_assists={is_assists}, is_cards={is_cards}, is_subs={is_subs}")
                            
                            # Default to goal if no specific event type detected (player-minute format is usually goals)
                            if is_goals or (not is_assists and not is_cards and not is_subs):
                                if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['goals']):
                                    event = {
                                        'type': 'goal',
                                        'player_name': player_name,
                                        'player_id': player_id,
                                        'minute': minute,
                                        'team': 'home'  # Will refine team detection later
                                    }
                                    match_data['events']['goals'].append(event)
                                    logger.info(f"    ✓ Goal (BS4): {player_name} ({minute}')")
                                    events_found = True
                            elif is_assists:
                                if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['assists']):
                                    event = {
                                        'type': 'assist',
                                        'player_name': player_name,
                                        'player_id': player_id,
                                        'minute': minute,
                                        'team': team
                                    }
                                    match_data['events']['assists'].append(event)
                                    logger.info(f"    ✓ Assist (BS4): {player_name} ({minute}') [{team}]")
                                    events_found = True
                            elif is_cards:
                                card_type = "red" if "red" in section_lower or "red" in parent_text else "yellow"
                                if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['cards']):
                                    event = {
                                        'type': 'card',
                                        'card_type': card_type,
                                        'player_name': player_name,
                                        'player_id': player_id,
                                        'minute': minute,
                                        'team': team
                                    }
                                    match_data['events']['cards'].append(event)
                                    logger.info(f"    ✓ Card (BS4): {player_name} ({minute}') [{card_type}] [{team}]")
                                    events_found = True
                            elif is_subs:
                                if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['substitutions']):
                                    event = {
                                        'type': 'substitution',
                                        'player_name': player_name,
                                        'player_id': player_id,
                                        'minute': minute,
                                        'team': team
                                    }
                                    match_data['events']['substitutions'].append(event)
                                    logger.info(f"    ✓ Substitution (BS4): {player_name} ({minute}') [{team}]")
                                    events_found = True
                    
                    # Pattern 2: Look for minute patterns with event keywords (original approach)
                    minute_event_matches = re.findall(r'(\d+)(?:\+(\d+))?\s*[\'′]\s*[^:]*?([Gg]oal|[Aa]ssist|[Cc]ard|[Ss]ub)', section_text)
                    if minute_event_matches and not player_minute_matches:
                        logger.info(f"      ✓ Section {section_idx + 1}: Found {len(minute_event_matches)} potential events (keyword pattern): '{section_text[:200]}'")
                        
                        # Try to extract player names from links in this section
                        player_links = section.find_all('a', href=re.compile(r'/players/'))
                        for link in player_links:
                            player_name = link.get_text(strip=True)
                            href = link.get('href', '')
                            player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                            player_id = player_id_match.group(1) if player_id_match else None
                            
                            # Find the minute for this player by looking at nearby text
                            link_text = link.parent.get_text(separator=' ', strip=True) if link.parent else ''
                            minute_match = re.search(r'(\d+)(?:\+(\d+))?\s*[\'′]', link_text)
                            if minute_match:
                                minute_base = int(minute_match.group(1))
                                minute_added = minute_match.group(2)
                                minute = f"{minute_base}+{minute_added}" if minute_added else minute_base
                                
                                # Determine event type from context
                                context_lower = link_text.lower()
                                if 'goal' in context_lower and 'assist' not in context_lower:
                                    if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['goals']):
                                        event = {
                                            'type': 'goal',
                                            'player_name': player_name,
                                            'player_id': player_id,
                                            'minute': minute,
                                            'team': 'home'
                                        }
                                        match_data['events']['goals'].append(event)
                                        logger.info(f"    ✓ Goal (BS4): {player_name} ({minute}')")
                                        events_found = True
                                elif 'assist' in context_lower:
                                    if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['assists']):
                                        event = {
                                            'type': 'assist',
                                            'player_name': player_name,
                                            'player_id': player_id,
                                            'minute': minute,
                                            'team': 'home'
                                        }
                                        match_data['events']['assists'].append(event)
                                        logger.info(f"    ✓ Assist (BS4): {player_name} ({minute}')")
                                        events_found = True
                                elif 'card' in context_lower:
                                    card_type = "red" if "red" in context_lower else "yellow"
                                    if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['cards']):
                                        event = {
                                            'type': 'card',
                                            'card_type': card_type,
                                            'player_name': player_name,
                                            'player_id': player_id,
                                            'minute': minute,
                                            'team': 'home'
                                        }
                                        match_data['events']['cards'].append(event)
                                        logger.info(f"    ✓ Card (BS4): {player_name} ({minute}')")
                                        events_found = True
            except Exception as e:
                logger.debug(f"    BeautifulSoup parsing error: {e}")
            
            # Method 5: Fallback - look for all elements containing minute markers (e.g., "9'", "90+3'")
            # This is a broader search to find any element that might contain event info
            # Optimized: Only search in likely event containers
            minute_elements = driver.find_elements(By.XPATH, "//div[contains(@class, 'event') or contains(@class, 'summary') or contains(@class, 'timeline')]//*[contains(text(), \"'\")]")
            if not minute_elements:
                minute_elements = driver.find_elements(By.XPATH, "//*[contains(text(), \"'\") or contains(text(), '+')]")
            logger.info(f"    Found {len(minute_elements)} elements with minute markers")
            
            # Process these elements directly to find events
            processed_minutes = 0
            for elem in minute_elements[:30]:  # Reduced from 50 to 30
                try:
                    elem_text = elem.text.strip()
                    if not elem_text or len(elem_text) < 3:
                        continue
                    
                    # Look for minute pattern in element text
                    minute_match = re.search(r'(\d+)(?:\+(\d+))?\s*[\'′]', elem_text)
                    if not minute_match:
                        continue
                    
                    minute_base = int(minute_match.group(1))
                    minute_added = minute_match.group(2)
                    minute = f"{minute_base}+{minute_added}" if minute_added else minute_base
                    
                    processed_minutes += 1
                    # Log first few to see what we're working with
                    if processed_minutes <= 5:
                        logger.info(f"      Element {processed_minutes} with minute {minute}: '{elem_text[:100]}'")
                    
                    # Check if this element contains event indicators
                    elem_lower = elem_text.lower()
                    has_goal = 'goal' in elem_lower and 'assist' not in elem_lower
                    has_assist = 'assist' in elem_lower
                    has_card = ('yellow' in elem_lower or 'red' in elem_lower) and 'card' in elem_lower
                    has_sub = 'substitution' in elem_lower or ('sub' in elem_lower and 'for' in elem_lower)
                    
                    # Try to find player link in this element or nearby
                    player_link = None
                    try:
                        player_link = elem.find_element(By.XPATH, ".//a[contains(@href, '/players/')]")
                    except:
                        try:
                            # Try parent or sibling
                            parent = elem.find_element(By.XPATH, "./..")
                            player_link = parent.find_element(By.XPATH, ".//a[contains(@href, '/players/')]")
                        except:
                            pass
                    
                    if player_link:
                        player_name = player_link.text.strip()
                        if not player_name:
                            continue
                        
                        href = player_link.get_attribute("href")
                        player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                        player_id = player_id_match.group(1) if player_id_match else None
                        
                        # Determine team (simplified - will refine)
                        is_home = True  # Default
                        
                        if has_goal:
                            if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['goals']):
                                event = {
                                    'type': 'goal',
                                    'player_name': player_name,
                                    'player_id': player_id,
                                    'minute': minute,
                                    'team': 'home' if is_home else 'away'
                                }
                                match_data['events']['goals'].append(event)
                                logger.info(f"    ✓ Goal: {player_name} ({minute}')")
                                events_found = True
                        
                        elif has_assist:
                            if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['assists']):
                                event = {
                                    'type': 'assist',
                                    'player_name': player_name,
                                    'player_id': player_id,
                                    'minute': minute,
                                    'team': 'home' if is_home else 'away'
                                }
                                match_data['events']['assists'].append(event)
                                logger.info(f"    ✓ Assist: {player_name} ({minute}')")
                                events_found = True
                        
                        elif has_card:
                            card_type = "red" if "red" in elem_lower else "yellow"
                            if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['cards']):
                                event = {
                                    'type': 'card',
                                    'card_type': card_type,
                                    'player_name': player_name,
                                    'player_id': player_id,
                                    'minute': minute,
                                    'team': 'home' if is_home else 'away'
                                }
                                match_data['events']['cards'].append(event)
                                logger.info(f"    ✓ Card: {player_name} ({minute}')")
                                events_found = True
                        
                        elif has_sub:
                            if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['substitutions']):
                                event = {
                                    'type': 'substitution',
                                    'player_name': player_name,
                                    'player_id': player_id,
                                    'minute': minute,
                                    'team': 'home' if is_home else 'away'
                                }
                                match_data['events']['substitutions'].append(event)
                                logger.info(f"    ✓ Substitution: {player_name} ({minute}')")
                                events_found = True
                except:
                    continue
            
            # Method 4: Look for all elements with player links that also contain minute markers
            # This is the most reliable method - find any element with both a player link and a minute
            # Optimized: Only search in likely event containers first
            player_link_elements = driver.find_elements(By.XPATH, "//div[contains(@class, 'event') or contains(@class, 'summary')]//a[contains(@href, '/players/')]")
            if len(player_link_elements) < 10:
                player_link_elements = driver.find_elements(By.XPATH, "//a[contains(@href, '/players/')]")
            logger.info(f"    Found {len(player_link_elements)} player links")
            
            # Combine all potential event containers
            all_event_containers = list(summary_sections) + list(event_lists)
            
            # Process containers first
            for container in all_event_containers:
                try:
                    container_text = container.text
                    if not container_text or len(container_text) < 5:
                        continue
                    
                    # Look for player links in this container
                    player_links = container.find_elements(By.XPATH, ".//a[contains(@href, '/players/')]")
                    if not player_links:
                        continue
                    
                    # Extract minute from text (pattern: "9'", "90+3'", etc.)
                    minute_match = re.search(r'(\d+)(?:\+(\d+))?[\'′]', container_text)
                    minute = None
                    if minute_match:
                        if minute_match.group(2):
                            minute = f"{minute_match.group(1)}+{minute_match.group(2)}"
                        else:
                            minute = int(minute_match.group(1))
                    
                    if not minute:
                        continue
                    
                    # Get player info
                    for player_link in player_links:
                        try:
                            player_name = player_link.text.strip()
                            if not player_name:
                                continue
                            
                            href = player_link.get_attribute("href")
                            player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                            player_id = player_id_match.group(1) if player_id_match else None
                            
                            # Determine team (check parent elements for team indicators)
                            is_home = False
                            try:
                                parent = container.find_element(By.XPATH, "./ancestor::*[contains(@class, 'home') or contains(@class, 'away')]")
                                parent_class = parent.get_attribute("class") or ""
                                is_home = "home" in parent_class.lower()
                            except:
                                # Try to determine from position in page or other context
                                pass
                            
                            container_lower = container_text.lower()
                            
                            # Check for goal indicators (soccer ball icon, "Goal", etc.)
                            has_goal_icon = "⚽" in container_text or "goal" in container_lower
                            has_assist_text = "assist" in container_lower
                            has_card_icon = "🟨" in container_text or "🟥" in container_text or "yellow" in container_lower or "red" in container_lower
                            has_sub_text = "substitution" in container_lower or "sub" in container_lower or "for" in container_lower
                            
                            # Goals - highest priority
                            if has_goal_icon or ("goal" in container_lower and not has_assist_text):
                                event = {
                                    'type': 'goal',
                                    'player_name': player_name,
                                    'player_id': player_id,
                                    'minute': minute,
                                    'team': 'home' if is_home else 'away'
                                }
                                match_data['events']['goals'].append(event)
                                logger.debug(f"    ✓ Goal: {player_name} ({minute}')")
                                events_found = True
                            
                            # Assists - usually mentioned with goals
                            elif has_assist_text:
                                event = {
                                    'type': 'assist',
                                    'player_name': player_name,
                                    'player_id': player_id,
                                    'minute': minute,
                                    'team': 'home' if is_home else 'away'
                                }
                                match_data['events']['assists'].append(event)
                                logger.debug(f"    ✓ Assist: {player_name} ({minute}')")
                                events_found = True
                            
                            # Cards
                            elif has_card_icon:
                                card_type = "red" if "red" in container_lower or "🟥" in container_text else "yellow"
                                event = {
                                    'type': 'card',
                                    'card_type': card_type,
                                    'player_name': player_name,
                                    'player_id': player_id,
                                    'minute': minute,
                                    'team': 'home' if is_home else 'away'
                                }
                                match_data['events']['cards'].append(event)
                                logger.debug(f"    ✓ Card: {player_name} ({minute}')")
                                events_found = True
                            
                            # Substitutions
                            elif has_sub_text:
                                event = {
                                    'type': 'substitution',
                                    'player_name': player_name,
                                    'player_id': player_id,
                                    'minute': minute,
                                    'team': 'home' if is_home else 'away'
                                }
                                match_data['events']['substitutions'].append(event)
                                logger.debug(f"    ✓ Substitution: {player_name} ({minute}')")
                                events_found = True
                        except:
                            continue
                except:
                    continue
            
            # Method 4: Look for Match Summary section specifically
            # Based on screenshots, fbref.com has a "Match Summary" section with events
            # Format examples:
            #   "9' (0:1): Goal by Erling Haaland. Assist by Tijjani Reijnders."
            #   "90+3' (1:1): Goal by Gabriel Martinelli. Assist by Eberechi Eze."
            #   "36' (0:1): Yellow card for Bernardo Silva."
            #   "46' (0:1): Substitution: Bukayo Saka out for Noni Madueke."
            try:
                summary_heading = driver.find_elements(By.XPATH, "//*[contains(text(), 'Match Summary') or contains(text(), 'match summary')]")
                if summary_heading:
                    logger.info(f"    Found 'Match Summary' heading, extracting events...")
                    # Get the entire summary section - try multiple approaches
                    summary_text = ""
                    summary_container = None
                    
                    for heading in summary_heading[:1]:
                        try:
                            # Try multiple approaches to find the summary content
                            summary_container = None
                            
                            # Approach 1: Following sibling
                            try:
                                summary_container = heading.find_element(By.XPATH, "./following-sibling::*[1]")
                                if summary_container and len(summary_container.text) > 50:
                                    summary_text = summary_container.text
                                    logger.info(f"    Found summary via following sibling, length: {len(summary_text)} chars")
                                    break
                            except:
                                pass
                            
                            # Approach 2: Parent container
                            try:
                                summary_container = heading.find_element(By.XPATH, "./parent::*")
                                if summary_container and len(summary_container.text) > 50:
                                    summary_text = summary_container.text
                                    logger.info(f"    Found summary via parent, length: {len(summary_text)} chars")
                                    break
                            except:
                                pass
                            
                            # Approach 3: Ancestor with summary/events class
                            try:
                                summary_container = heading.find_element(By.XPATH, "./ancestor::div[contains(@class, 'summary') or contains(@class, 'events') or contains(@id, 'summary') or contains(@id, 'events')][1]")
                                if summary_container and len(summary_container.text) > 50:
                                    summary_text = summary_container.text
                                    logger.info(f"    Found summary via ancestor, length: {len(summary_text)} chars")
                                    break
                            except:
                                pass
                            
                            # Approach 4: Next div or section after heading
                            try:
                                all_elements = driver.find_elements(By.XPATH, "//*")
                                heading_idx = -1
                                for idx, elem in enumerate(all_elements):
                                    if elem == heading:
                                        heading_idx = idx
                                        break
                                
                                if heading_idx >= 0:
                                    # Look at next few elements
                                    for i in range(1, min(10, len(all_elements) - heading_idx)):
                                        try:
                                            next_elem = all_elements[heading_idx + i]
                                            if next_elem.tag_name in ['div', 'section', 'ul', 'ol']:
                                                text = next_elem.text
                                                if len(text) > 50 and ('goal' in text.lower() or 'assist' in text.lower() or 'card' in text.lower()):
                                                    summary_text = text
                                                    summary_container = next_elem
                                                    logger.info(f"    Found summary via next element, length: {len(summary_text)} chars")
                                                    break
                                        except:
                                            continue
                                    if summary_text:
                                        break
                            except:
                                pass
                        except:
                            continue
                    
                    # Use summary container text if found, otherwise use body text
                    if summary_container and summary_text:
                        logger.info(f"    Using summary container text, length: {len(summary_text)} chars")
                    else:
                        logger.info(f"    Searching entire page body for event patterns...")
                        summary_text = driver.find_element(By.TAG_NAME, "body").text
                        logger.info(f"    Body text length: {len(summary_text)} chars")
                    
                    # Extract and log sample text containing event keywords with minute markers
                    # Look for patterns like "9'", "90+3'" followed by event keywords
                    minute_event_pattern = re.compile(r'(\d+)(?:\+(\d+))?\s*[\'′].*?(goal|assist|card|substitution|yellow|red)', re.IGNORECASE | re.DOTALL)
                    minute_events = minute_event_pattern.findall(summary_text)
                    
                    if minute_events:
                        logger.info(f"    Found {len(minute_events)} potential events with minute markers")
                        for i, match in enumerate(minute_events[:5]):
                            minute = f"{match[0]}+{match[1]}" if match[1] else match[0]
                            event_type = match[2]
                            # Find the full context around this match
                            pattern_str = f"{minute}'"
                            idx = summary_text.find(pattern_str)
                            if idx >= 0:
                                context = summary_text[max(0, idx-20):min(len(summary_text), idx+300)]
                                logger.info(f"      {i+1}. {minute}' - {event_type}: {context[:200]}")
                    else:
                        # Try simpler pattern - just minutes with apostrophes
                        simple_minutes = re.findall(r'(\d+)(?:\+(\d+))?\s*[\'′]', summary_text)
                        logger.info(f"    Found {len(simple_minutes)} minute markers in text")
                        # Show context around first few minutes
                        for i, match in enumerate(simple_minutes[:3]):
                            minute_str = f"{match[0]}+{match[1]}" if match[1] else match[0]
                            idx = summary_text.find(f"{minute_str}'")
                            if idx >= 0:
                                context = summary_text[max(0, idx-10):min(len(summary_text), idx+150)]
                                logger.info(f"      {i+1}. {minute_str}': {context[:180]}")
                    
                    # Save page text to file for inspection
                    if debug and debug_dir:
                        try:
                            os.makedirs(debug_dir, exist_ok=True)
                            safe_home = (home_team or 'home').replace(' ', '_').replace('/', '_').replace("'", '')
                            safe_away = (away_team or 'away').replace(' ', '_').replace('/', '_').replace("'", '')
                            text_file = os.path.join(debug_dir, f"page_text_{safe_home}_{safe_away}.txt")
                            with open(text_file, 'w', encoding='utf-8') as f:
                                f.write(summary_text)
                            logger.info(f"  💾 Saved page text to: {text_file}")
                            
                            # Log a sample to verify we have the right content
                            if 'goal' in summary_text.lower() or 'assist' in summary_text.lower():
                                # Find first occurrence of "Goal" or "goal"
                                goal_idx = summary_text.lower().find('goal')
                                if goal_idx >= 0:
                                    sample = summary_text[max(0, goal_idx-50):min(len(summary_text), goal_idx+200)]
                                    logger.info(f"    Sample text around 'goal': ...{sample}...")
                        except Exception as e:
                            logger.debug(f"    Could not save page text: {e}")
                    
                    # Pattern 1: Goals with assists
                    # "9' (0:1): Goal by Erling Haaland. Assist by Tijjani Reijnders."
                    # Try multiple patterns
                    goal_patterns = [
                        re.compile(r'(\d+)(?:\+(\d+))?\s*[\'′]\s*\([^)]+\):\s*Goal\s+by\s+([^.]+)\.(?:\s+Assist\s+by\s+([^.]+)\.)?', re.IGNORECASE),
                        re.compile(r'(\d+)(?:\+(\d+))?\s*[\'′]\s*Goal\s+by\s+([^.]+)\.(?:\s+Assist\s+by\s+([^.]+)\.)?', re.IGNORECASE),
                        re.compile(r'(\d+)(?:\+(\d+))?\s*[\'′]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(\d+)[\s:–-]+(\d+)', re.IGNORECASE),  # Player name followed by score
                    ]
                    
                    goal_matches = []
                    for pattern in goal_patterns:
                        matches = pattern.findall(summary_text)
                        if matches:
                            goal_matches = matches
                            logger.info(f"    Found {len(goal_matches)} goal matches with pattern: {pattern.pattern[:50]}...")
                            break
                    
                    if not goal_matches:
                        # Try to find any text with minute + goal indicator
                        simple_goal_pattern = re.compile(r'(\d+)(?:\+(\d+))?\s*[\'′].*?[Gg]oal', re.IGNORECASE)
                        simple_matches = simple_goal_pattern.findall(summary_text)
                        if simple_matches:
                            logger.info(f"    Found {len(simple_matches)} potential goal minutes (simple pattern)")
                            # Extract surrounding text for each match
                            for match in simple_matches[:5]:
                                minute_str = f"{match[0]}+{match[1]}" if match[1] else match[0]
                                idx = summary_text.find(f"{minute_str}'")
                                if idx >= 0:
                                    context = summary_text[max(0, idx-20):idx+150]
                                    logger.info(f"      Context: {context[:200]}")
                    
                    for match in goal_matches:
                        minute_base = int(match[0])
                        minute_added = match[1] if match[1] else None
                        minute = f"{minute_base}+{minute_added}" if minute_added else minute_base
                        goal_scorer = match[2].strip()
                        assist_provider = match[3].strip() if match[3] else None
                        
                        # Find player IDs
                        goal_scorer_id = None
                        assist_id = None
                        
                        if summary_container:
                            try:
                                goal_link = summary_container.find_element(By.XPATH, f".//a[contains(text(), '{goal_scorer[:15]}')]")
                                href = goal_link.get_attribute("href")
                                player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                                goal_scorer_id = player_id_match.group(1) if player_id_match else None
                            except:
                                pass
                            
                            if assist_provider:
                                try:
                                    assist_link = summary_container.find_element(By.XPATH, f".//a[contains(text(), '{assist_provider[:15]}')]")
                                    href = assist_link.get_attribute("href")
                                    player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                                    assist_id = player_id_match.group(1) if player_id_match else None
                                except:
                                    pass
                        
                        # Add goal
                        if not any(e.get('player_name') == goal_scorer and str(e.get('minute')) == str(minute) for e in match_data['events']['goals']):
                            event = {
                                'type': 'goal',
                                'player_name': goal_scorer,
                                'player_id': goal_scorer_id,
                                'minute': minute,
                                'team': 'home'  # Will determine from score context
                            }
                            match_data['events']['goals'].append(event)
                            logger.info(f"    ✓ Goal: {goal_scorer} ({minute}')")
                            events_found = True
                        
                        # Add assist if present
                        if assist_provider and not any(e.get('player_name') == assist_provider and str(e.get('minute')) == str(minute) for e in match_data['events']['assists']):
                            event = {
                                'type': 'assist',
                                'player_name': assist_provider,
                                'player_id': assist_id,
                                'minute': minute,
                                'team': 'home'
                            }
                            match_data['events']['assists'].append(event)
                            logger.info(f"    ✓ Assist: {assist_provider} ({minute}')")
                            events_found = True
                    
                    # Pattern 2: Cards
                    # "36' (0:1): Yellow card for Bernardo Silva."
                    card_pattern = re.compile(r'(\d+)(?:\+(\d+))?\s*[\'′]\s*\([^)]+\):\s*(Yellow|Red)\s+card\s+for\s+([^.]+)\.', re.IGNORECASE)
                    card_matches = card_pattern.findall(summary_text)
                    
                    for match in card_matches:
                        minute_base = int(match[0])
                        minute_added = match[1] if len(match) > 1 and match[1] else None
                        minute = f"{minute_base}+{minute_added}" if minute_added else str(minute_base)
                        
                        # Handle different pattern formats
                        if len(match) >= 4:
                            if match[2].lower() in ['yellow', 'red']:
                                card_type = match[2].lower()
                                player_name = match[3].strip()
                            else:
                                card_type = match[3].lower() if len(match) > 3 and match[3].lower() in ['yellow', 'red'] else 'yellow'
                                player_name = match[2].strip()
                        else:
                            continue
                        
                        player_id = None
                        if summary_container:
                            try:
                                player_link = summary_container.find_element(By.XPATH, f".//a[contains(text(), '{player_name[:15]}')]")
                                href = player_link.get_attribute("href")
                                player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                                player_id = player_id_match.group(1) if player_id_match else None
                            except:
                                pass
                        
                        if not any(e.get('player_name') == player_name and str(e.get('minute')) == str(minute) for e in match_data['events']['cards']):
                            event = {
                                'type': 'card',
                                'card_type': card_type,
                                'player_name': player_name,
                                'player_id': player_id,
                                'minute': minute,
                                'team': 'home'
                            }
                            match_data['events']['cards'].append(event)
                            logger.info(f"    ✓ Card: {player_name} ({minute}')")
                            events_found = True
                    
                    # Pattern 3: Substitutions - match the actual format from fbref
                    # "60' (2:0): Substitution for Liverpool FC: Wataru Endo comes on for Jeremie Frimpong."
                    # "72' (2:1): Substitution for Liverpool FC: Joe Gomez comes on for Hugo Ekitike."
                    sub_patterns = [
                        re.compile(r'(\d+)(?:\+(\d+))?\s*[\'′]\s*\([^)]+\):\s*Substitution\s+for\s+[^:]+:\s+([A-Z][a-zA-Z\s]+)\s+comes\s+on\s+for\s+([A-Z][a-zA-Z\s]+)\.', re.IGNORECASE),
                        re.compile(r'(\d+)(?:\+(\d+))?\s*[\'′]\s*\([^)]+\):\s*Substitution[^:]*?:\s*([A-Z][a-zA-Z\s]+)\s+(?:comes\s+on\s+for|out\s+for|for)\s+([A-Z][a-zA-Z\s]+)\.', re.IGNORECASE),
                        re.compile(r'(\d+)(?:\+(\d+))?\s*[\'′]\s*[^:]*?Substitution[^:]*?:\s*([A-Z][a-zA-Z\s]+)\s+(?:comes\s+on\s+for|for)\s+([A-Z][a-zA-Z\s]+)', re.IGNORECASE)
                    ]
                    
                    for sub_pattern in sub_patterns:
                        sub_matches = sub_pattern.findall(summary_text)
                        if sub_matches:
                            for match in sub_matches:
                                minute_base = int(match[0])
                                minute_added = match[1] if len(match) > 1 and match[1] else None
                                minute = f"{minute_base}+{minute_added}" if minute_added else str(minute_base)
                                player_in = match[2].strip()
                                player_out = match[3].strip() if len(match) > 3 else None
                                
                                # Find player IDs
                                player_in_id = None
                                player_out_id = None
                                if summary_container:
                                    try:
                                        player_in_link = summary_container.find_element(By.XPATH, f".//a[contains(text(), '{player_in[:20]}')]")
                                        href = player_in_link.get_attribute("href")
                                        player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                                        player_in_id = player_id_match.group(1) if player_id_match else None
                                    except:
                                        pass
                                    
                                    if player_out:
                                        try:
                                            player_out_link = summary_container.find_element(By.XPATH, f".//a[contains(text(), '{player_out[:20]}')]")
                                            href = player_out_link.get_attribute("href")
                                            player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                                            player_out_id = player_id_match.group(1) if player_id_match else None
                                        except:
                                            pass
                                
                                # Determine team from context (check which team name appears)
                                team = 'home'  # Default
                                if home_team and home_team.lower() in summary_text.lower():
                                    # Check if home team appears before this substitution
                                    sub_idx = summary_text.find(f"{minute}'")
                                    if sub_idx > 0:
                                        context_before = summary_text[max(0, sub_idx-200):sub_idx].lower()
                                        if home_team.lower() in context_before:
                                            team = 'home'
                                        elif away_team and away_team.lower() in context_before:
                                            team = 'away'
                                
                                # Add substitution event for player coming IN (this is the standard)
                                if not any(e.get('player_name') == player_in and str(e.get('minute')) == str(minute) for e in match_data['events']['substitutions']):
                                    event = {
                                        'type': 'substitution',
                                        'player_name': player_in,
                                        'player_id': player_in_id,
                                        'minute': minute,
                                        'team': team,
                                        'substituted_for': player_out
                                    }
                                    match_data['events']['substitutions'].append(event)
                                    logger.info(f"    ✓ Substitution: {player_in} ({minute}') for {player_out} [{team}]")
                                    events_found = True
                            break  # Stop after first successful pattern
            except Exception as e:
                logger.debug(f"    Error in Match Summary extraction: {e}")
                import traceback
                logger.debug(traceback.format_exc())
            
            # Method 5: Process individual player links that might be events
            # Look for player links in context that suggests an event
            # Process first 100 player links to avoid timeout (events are usually near the top)
            processed_count = 0
            for player_link in player_link_elements[:50]:  # Reduced from 100 to 50
                try:
                    player_name = player_link.text.strip()
                    if not player_name or len(player_name) < 3:
                        continue
                    
                    href = player_link.get_attribute("href")
                    if not href or '/players/' not in href:
                        continue
                    
                    player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                    player_id = player_id_match.group(1) if player_id_match else None
                    
                    # Get parent elements to check for minute and event context
                    # Try multiple parent levels
                    parent_text = ""
                    parent_lower = ""
                    minute = None
                    is_home = False
                    
                    try:
                        # Try immediate parent first
                        parent = player_link.find_element(By.XPATH, "./..")
                        parent_text = parent.text
                        parent_lower = parent_text.lower()
                        
                        # Look for minute in parent text
                        minute_match = re.search(r'(\d+)(?:\+(\d+))?[\'′]', parent_text)
                        if minute_match:
                            if minute_match.group(2):
                                minute = f"{minute_match.group(1)}+{minute_match.group(2)}"
                            else:
                                minute = int(minute_match.group(1))
                    except:
                        pass
                    
                    # If no minute in immediate parent, try grandparent
                    if not minute:
                        try:
                            parent = player_link.find_element(By.XPATH, "./../..")
                            parent_text = parent.text
                            parent_lower = parent_text.lower()
                            minute_match = re.search(r'(\d+)(?:\+(\d+))?[\'′]', parent_text)
                            if minute_match:
                                if minute_match.group(2):
                                    minute = f"{minute_match.group(1)}+{minute_match.group(2)}"
                                else:
                                    minute = int(minute_match.group(1))
                        except:
                            pass
                    
                    # Skip if no minute found
                    if not minute:
                        continue
                    
                    # Determine team from parent classes or position
                    try:
                        team_parent = player_link.find_element(By.XPATH, "./ancestor::*[contains(@class, 'home') or contains(@class, 'away')][position()<=3]")
                        parent_class = team_parent.get_attribute("class") or ""
                        is_home = "home" in parent_class.lower()
                    except:
                        # Default: assume first team mentioned is home
                        pass
                    
                    # Check for event indicators in parent text
                    has_goal = "⚽" in parent_text or ("goal" in parent_lower and "assist" not in parent_lower and "against" not in parent_lower)
                    has_assist = "assist" in parent_lower and "goal" not in parent_lower
                    has_card = "🟨" in parent_text or "🟥" in parent_text or ("yellow" in parent_lower and "card" in parent_lower) or ("red" in parent_lower and "card" in parent_lower)
                    has_sub = "substitution" in parent_lower or ("sub" in parent_lower and "for" in parent_lower)
                    
                    # Create event key to avoid duplicates
                    event_key = f"{player_id}_{minute}"
                    
                    # Add goal
                    if has_goal:
                        if not any(e.get('player_id') == player_id and str(e.get('minute')) == str(minute) for e in match_data['events']['goals']):
                            event = {
                                'type': 'goal',
                                'player_name': player_name,
                                'player_id': player_id,
                                'minute': minute,
                                'team': 'home' if is_home else 'away'
                            }
                            match_data['events']['goals'].append(event)
                            logger.info(f"    ✓ Goal: {player_name} ({minute}')")
                            events_found = True
                            processed_count += 1
                    
                    # Add assist
                    elif has_assist:
                        if not any(e.get('player_id') == player_id and str(e.get('minute')) == str(minute) for e in match_data['events']['assists']):
                            event = {
                                'type': 'assist',
                                'player_name': player_name,
                                'player_id': player_id,
                                'minute': minute,
                                'team': 'home' if is_home else 'away'
                            }
                            match_data['events']['assists'].append(event)
                            logger.info(f"    ✓ Assist: {player_name} ({minute}')")
                            events_found = True
                            processed_count += 1
                    
                    # Add card
                    elif has_card:
                        if not any(e.get('player_id') == player_id and str(e.get('minute')) == str(minute) for e in match_data['events']['cards']):
                            card_type = "red" if "red" in parent_lower or "🟥" in parent_text else "yellow"
                            event = {
                                'type': 'card',
                                'card_type': card_type,
                                'player_name': player_name,
                                'player_id': player_id,
                                'minute': minute,
                                'team': 'home' if is_home else 'away'
                            }
                            match_data['events']['cards'].append(event)
                            logger.info(f"    ✓ Card: {player_name} ({minute}')")
                            events_found = True
                            processed_count += 1
                    
                    # Add substitution
                    elif has_sub:
                        if not any(e.get('player_id') == player_id and str(e.get('minute')) == str(minute) for e in match_data['events']['substitutions']):
                            event = {
                                'type': 'substitution',
                                'player_name': player_name,
                                'player_id': player_id,
                                'minute': minute,
                                'team': 'home' if is_home else 'away'
                            }
                            match_data['events']['substitutions'].append(event)
                            logger.info(f"    ✓ Substitution: {player_name} ({minute}')")
                            events_found = True
                            processed_count += 1
                except Exception as e:
                    # Silently continue - many player links won't be events
                    continue
            
            logger.info(f"    Processed {processed_count} potential events from player links")
            
            # Method 5: Extract from goal scorer sections (often displayed prominently)
            # fbref.com shows goals prominently in the match header
            try:
                # Look for goal scorer sections - often in divs with specific classes
                goal_sections = driver.find_elements(By.XPATH, "//div[contains(@class, 'goal') or contains(@id, 'goal')] | //span[contains(@class, 'goal')]")
                for section in goal_sections:
                    try:
                        text = section.text
                        # Look for pattern like "Player Name 9'" or "9' Player Name"
                        goal_match = re.search(r'([A-Za-z\s]+?)\s+(\d+)(?:\+(\d+))?[\'′]', text)
                        if goal_match:
                            player_name = goal_match.group(1).strip()
                            minute = int(goal_match.group(2))
                            if goal_match.group(3):
                                minute = f"{minute}+{goal_match.group(3)}"
                            
                            # Try to find player link to get ID
                            try:
                                player_link = section.find_element(By.XPATH, ".//a[contains(@href, '/players/')]")
                                href = player_link.get_attribute("href")
                                player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                                player_id = player_id_match.group(1) if player_id_match else None
                                
                                if not any(e.get('player_id') == player_id and str(e.get('minute')) == str(minute) for e in match_data['events']['goals']):
                                    event = {
                                        'type': 'goal',
                                        'player_name': player_name,
                                        'player_id': player_id,
                                        'minute': minute,
                                        'team': 'home'  # Will need to determine from context
                                    }
                                    match_data['events']['goals'].append(event)
                                    logger.info(f"    ✓ Goal from section: {player_name} ({minute}')")
                                    events_found = True
                            except:
                                pass
                    except:
                        continue
            except:
                pass
            
            if events_found:
                logger.info(f"  ✓ Extracted {len(match_data['events']['goals'])} goals, {len(match_data['events']['assists'])} assists, {len(match_data['events']['cards'])} cards, {len(match_data['events']['substitutions'])} substitutions")
        except Exception as e:
            logger.warning(f"  Error extracting events: {e}")
        
        # Extract player statistics
        logger.info(f"  Extracting player statistics...")
        try:
            # Look for the main player stats table - it usually has id containing "player_stats" or "stats_"
            stats_tables = driver.find_elements(By.XPATH, "//table[contains(@class, 'stats_table')]")
            logger.info(f"    Found {len(stats_tables)} stats tables on page")
            
            # Also look for tables with specific IDs that contain player stats
            player_stats_tables = driver.find_elements(By.XPATH, "//table[contains(@id, 'stats_') or contains(@id, 'player')]")
            logger.info(f"    Found {len(player_stats_tables)} potential player stats tables by ID")
            
            # Combine both
            all_tables = list(stats_tables) + [t for t in player_stats_tables if t not in stats_tables]
            
            for table_idx, table in enumerate(all_tables):
                try:
                    # Get table ID for debugging
                    table_id = table.get_attribute("id") or f"table_{table_idx}"
                    
                    # Get all header elements - check both thead and first row
                    headers_from_thead = []
                    try:
                        thead = table.find_element(By.TAG_NAME, "thead")
                        headers_from_thead = [th.text.strip().lower() for th in thead.find_elements(By.TAG_NAME, "th") if th.text.strip()]
                    except:
                        pass
                    
                    headers = [th.text.strip().lower() for th in table.find_elements(By.TAG_NAME, "th") if th.text.strip()]
                    header_text = ' '.join(headers)
                    
                    # Use thead headers if available, otherwise use regular headers
                    if headers_from_thead:
                        headers = headers_from_thead
                        header_text = ' '.join(headers)
                    
                    # Check if this is a player stats table
                    # fbref.com has multiple table types - we want the main detailed stats table
                    # Look for tables with many columns (detailed stats) that have player links
                    rows = table.find_elements(By.TAG_NAME, "tr")
                    if len(rows) < 2:
                        continue
                    
                    # Check if this table has player links (actual player stats, not summary)
                    sample_row = rows[1] if len(rows) > 1 else None
                    has_player_links = False
                    if sample_row:
                        try:
                            player_links = sample_row.find_elements(By.XPATH, ".//a[contains(@href, '/players/')]")
                            has_player_links = len(player_links) > 0
                        except:
                            pass
                    
                    # Get all cells from sample row to check column count
                    cell_count = 0
                    if sample_row:
                        try:
                            all_row_cells = sample_row.find_elements(By.XPATH, ".//th | .//td")
                            cell_count = len(all_row_cells)
                        except:
                            pass
                    
                    # This is likely a detailed player stats table if:
                    # - Has player links AND many columns (20+), OR
                    # - Has standard stats headers (Min, Gls, Ast, Sh, SoT, Cmp, Att, etc.)
                    has_min = any(h == 'min' for h in headers)
                    has_goals = any(h == 'gls' for h in headers)
                    has_assists = any(h == 'ast' for h in headers)
                    has_shots = any(h == 'sh' for h in headers)
                    has_passes = any(h in ['cmp', 'att'] for h in headers)
                    
                    # Check if this is ONLY an advanced stats table (no basic stats)
                    # Tables can have both basic and advanced stats, so only exclude if it's ONLY advanced
                    is_only_advanced = (
                        any(h in ['performance', 'expected', 'sca', 'carries', 'take-ons'] for h in headers) and
                        not has_min and not has_goals
                    )
                    is_gk_table = any(h in ['shot stopping', 'launched', 'goal kicks', 'sweeper'] for h in headers)
                    
                    # Simplified: If table has "min" header and many columns, it's likely a player stats table
                    # Exclude ONLY advanced stats tables (no basic stats) and goalkeeper-specific tables
                    is_player_table = (
                        has_min and 
                        cell_count > 15 and 
                        not is_only_advanced and 
                        not is_gk_table
                    )
                    
                    # Debug logging for tables that might be player stats tables
                    if has_min:
                        logger.info(f"      Table {table_idx + 1}: has_min={has_min}, has_player_links={has_player_links}, cell_count={cell_count}, is_only_advanced={is_only_advanced}, is_gk={is_gk_table}, is_player_table={is_player_table}")
                        if has_min:
                            logger.info(f"        Headers sample: {headers[:12]}")
                    
                    if is_player_table:
                        logger.info(f"      ✓ Detected player stats table {table_idx + 1}: has_min={has_min}, has_goals={has_goals}, cell_count={cell_count}")
                    
                    if is_player_table:
                        rows = table.find_elements(By.TAG_NAME, "tr")
                        if len(rows) < 2:  # Need at least header + 1 data row
                            continue
                        
                        logger.info(f"    Found player stats table {table_idx + 1} with {len(rows)-1} rows")
                        logger.info(f"      Headers ({len(headers)}): {headers[:15]}")
                        logger.info(f"      Cell count: {cell_count}, Has player links: {has_player_links}")
                        
                        is_home = len(match_data['player_stats']['home']) == 0  # First populated table is home
                        
                        # Get header row to properly map columns
                        # fbref.com uses nested headers - need to find the row with actual column names
                        # Try multiple rows to find the one with column headers (not group headers)
                        header_labels = []
                        
                        # First, try thead - it might have multiple rows
                        try:
                            thead = table.find_element(By.TAG_NAME, "thead")
                            thead_rows = thead.find_elements(By.TAG_NAME, "tr")
                            # Usually the last row in thead has the actual column headers
                            if thead_rows:
                                header_row = thead_rows[-1]
                                header_cells = header_row.find_elements(By.XPATH, ".//th | .//td")
                                header_labels = [hc.text.strip().lower() for hc in header_cells if hc.text.strip()]
                        except:
                            pass
                        
                        # If thead didn't work, try the first row
                        if not header_labels and rows:
                            header_row = rows[0]
                            header_cells = header_row.find_elements(By.XPATH, ".//th | .//td")
                            header_labels = [hc.text.strip().lower() for hc in header_cells if hc.text.strip()]
                        
                        # Fallback: use original headers
                        if not header_labels:
                            header_labels = headers
                        
                        logger.info(f"      Using {len(header_labels)} header labels: {header_labels[:15]}")
                        
                        if len(rows) < 2:
                            logger.warning(f"      ⚠ Table {table_idx + 1} has less than 2 rows, skipping")
                            continue
                        
                        logger.info(f"    Processing {len(rows) - 1} player rows from table {table_idx + 1}...")
                        stats_extracted = 0
                        players_processed = 0
                        
                        for row in rows[1:]:  # Skip header
                            try:
                                # Get all cells including th (player name might be in th)
                                all_cells = row.find_elements(By.XPATH, ".//th | .//td")
                                # Filter to only td cells for stats (skip player name th)
                                cells = row.find_elements(By.TAG_NAME, "td")
                                
                                if len(cells) < 3:
                                    continue
                                
                                player_info = extract_player_info(row)
                                if not player_info['name']:
                                    continue
                                
                                players_processed += 1
                                # Only log first few players to avoid spam
                                if players_processed <= 2:
                                    logger.info(f"      Processing player {players_processed}: {player_info['name']} ({len(cells)} cells)")
                                
                                stats = {
                                    'player_name': player_info['name'],
                                    'player_id': player_info['fbref_id'],
                                    'jersey_number': None,
                                    'position': None,
                                    'minutes': None,
                                    'goals': None,
                                    'assists': None,
                                    'shots': None,
                                    'shots_on_target': None,
                                    'passes': None,
                                    'pass_accuracy': None,
                                    'tackles': None,
                                    'interceptions': None,
                                    'fouls': None,
                                    'cards': None
                                }
                                
                                # Extract stats from cells - properly map headers to cells
                                # fbref.com tables: player name is in <th>, stats are in <td>
                                # Need to handle different table structures
                                
                                # Check if player name is in th or first td
                                player_name_in_th = False
                                try:
                                    th_cell = row.find_element(By.XPATH, ".//th")
                                    if th_cell:
                                        player_name_in_th = True
                                except:
                                    pass
                                
                                # If player name is in th, stats start at td[0], header[1] maps to cell[0]
                                # If player name is in td[0], stats start at td[1], header[1] maps to cell[1]
                                # So: cell_idx = header_idx - 1 if player_name_in_th, else header_idx
                                stats_start_idx = 1 if player_name_in_th else 1  # Both cases: skip header[0] (player name)
                                
                                # Debug: log first few cells for first player
                                if players_processed == 1:
                                    logger.info(f"      Sample - Player: {player_info['name']}")
                                    logger.info(f"      Sample - Cells ({len(cells)}): {[c.text.strip()[:10] for c in cells[:10]]}")
                                    logger.info(f"      Sample - Headers ({len(header_labels)}): {header_labels[:10]}")
                                
                                # Extract stats using header-to-cell mapping
                                # fbref.com structure from screenshots:
                                # Headers: ['player', '#', 'nation', 'pos', 'age', 'min', 'gls', 'ast', ...]
                                # Data row: player name in <th>, then stats in <td> cells starting at index 0
                                # So: header[0]="player" (skip), header[1]="#" -> cell[0], header[2]="nation" -> cell[1], header[5]="min" -> cell[4]
                                
                                for i, header in enumerate(header_labels):
                                    # Skip player name column (first header)
                                    if i == 0:
                                        continue
                                    
                                    # Map header index to cell index: header[i] -> cell[i-1]
                                    cell_idx = i - 1
                                    if cell_idx < 0 or cell_idx >= len(cells):
                                        continue
                                    
                                    # Debug first few extractions for first player
                                    if players_processed == 1 and i <= 12:
                                        logger.info(f"        Header[{i}]='{header}' -> Cell[{cell_idx}]='{cells[cell_idx].text.strip()[:15] if cell_idx < len(cells) else 'N/A'}'")
                                    
                                    cell_value = cells[cell_idx].text.strip()
                                    
                                    # Skip empty cells
                                    if not cell_value or cell_value == '-' or cell_value == '':
                                        continue
                                    
                                    # Extract stats - fbref.com uses exact abbreviated headers
                                    # Based on screenshots: Min, Gls, Ast, Sh, SoT, Cmp, Att, Cmp%, Tkl, Int, Crdy, CrdR
                                    
                                    # Jersey Number - fbref uses "#" (hash symbol)
                                    if header == '#' or header == 'number':
                                        if cell_value.isdigit():
                                            stats['jersey_number'] = int(cell_value)
                                    
                                    # Position - fbref uses "pos" (exact match)
                                    elif header == 'pos' or header == 'position':
                                        stats['position'] = cell_value
                                    
                                    # Minutes - fbref uses "Min" (exact match, case-insensitive after lower())
                                    elif header == 'min':
                                        clean_min = cell_value.replace('+', '').strip()
                                        if clean_min.isdigit():
                                            stats['minutes'] = int(clean_min)
                                    
                                    # Goals - fbref uses "Gls" (exact match)
                                    elif header == 'gls':
                                        if cell_value.isdigit():
                                            stats['goals'] = int(cell_value)
                                    
                                    # Assists - fbref uses "Ast" (exact match)
                                    elif header == 'ast':
                                        if cell_value.isdigit():
                                            stats['assists'] = int(cell_value)
                                    
                                    # Shots - fbref uses "Sh" (exact match, total shots)
                                    elif header == 'sh':
                                        if cell_value.isdigit():
                                            stats['shots'] = int(cell_value)
                                    
                                    # Shots on Target - fbref uses "SoT" (exact match)
                                    elif header == 'sot':
                                        if cell_value.isdigit():
                                            stats['shots_on_target'] = int(cell_value)
                                    
                                    # Passes Attempted - fbref uses "Att" in passing section
                                    # Need to distinguish from "Att" in take-ons section
                                    # In passing: Cmp, Att, Cmp% are together
                                    elif header == 'att':
                                        # Check if this is in passing context by looking for Cmp nearby
                                        # Find Cmp index
                                        cmp_idx = -1
                                        for j, h in enumerate(header_labels):
                                            if h == 'cmp':
                                                cmp_idx = j
                                                break
                                        
                                        # If Cmp is within 3 positions of Att, this is passes attempted
                                        if cmp_idx >= 0 and abs(i - cmp_idx) <= 3:
                                            if cell_value.isdigit():
                                                pass_count = int(cell_value)
                                                # Passes attempted: 0-1000 range
                                                if pass_count <= 1000:
                                                    # FIX: Skip if 90 and minutes not set (likely minutes column)
                                                    if pass_count == 90 and stats['minutes'] is None:
                                                        continue
                                                    stats['passes'] = pass_count
                                    
                                    # Passes Completed - fbref uses "Cmp" (completed passes)
                                    # Use as fallback for passes if Att not available
                                    elif header == 'cmp':
                                        if cell_value.isdigit():
                                            cmp_count = int(cell_value)
                                            # Use Cmp as passes if Att not set (fallback)
                                            if stats['passes'] is None and cmp_count <= 1000:
                                                stats['passes'] = cmp_count
                                    
                                    # Pass Accuracy - fbref uses "Cmp%" (pass completion %)
                                    elif header == 'cmp%' or (header.startswith('cmp') and '%' in cell_value):
                                        clean_value = cell_value.replace('%', '').strip()
                                        if clean_value.replace('.', '').isdigit():
                                            stats['pass_accuracy'] = float(clean_value)
                                    
                                    # Tackles - fbref uses "Tkl" (exact match)
                                    elif header == 'tkl':
                                        if cell_value.isdigit():
                                            stats['tackles'] = int(cell_value)
                                    
                                    # Interceptions - fbref uses "Int" (exact match)
                                    elif header == 'int':
                                        if cell_value.isdigit():
                                            stats['interceptions'] = int(cell_value)
                                    
                                    # Fouls - fbref might use "Fls" or check context
                                    elif header == 'fls' or (header.startswith('foul') and 'drawn' not in header_text):
                                        if cell_value.isdigit():
                                            stats['fouls'] = int(cell_value)
                                    
                                    # Cards - fbref uses "Crdy" (yellow) and "CrdR" (red)
                                    elif header == 'crdy':
                                        if cell_value.isdigit():
                                            yellow_count = int(cell_value)
                                            if yellow_count > 0:
                                                stats['cards'] = f"{yellow_count} yellow"
                                    elif header == 'crdr':
                                        if cell_value.isdigit():
                                            red_count = int(cell_value)
                                            if red_count > 0:
                                                stats['cards'] = f"{red_count} red"
                                
                                # Check if we extracted any stats
                                has_stats = any(v is not None for k, v in stats.items() if k not in ['player_name', 'player_id'])
                                if has_stats:
                                    stats_extracted += 1
                                
                                if is_home:
                                    match_data['player_stats']['home'].append(stats)
                                else:
                                    match_data['player_stats']['away'].append(stats)
                            except Exception as e:
                                logger.debug(f"      Error extracting stats for row: {e}")
                                continue
                        
                        logger.info(f"    ✓ Extracted stats for {stats_extracted} players from table {table_idx + 1}")
                except:
                    continue
        except Exception as e:
            logger.debug(f"  Error extracting player stats: {e}")
        
        # Extract Team Stats from the Team Stats section
        logger.info(f"  Extracting team stats...")
        try:
            # Method 1: Extract from team stats summary tables (most reliable)
            # fbref.com has team stats in tables with sections like "assoc_stats_822bd0ba_summary"
            try:
                # Find team stats summary sections
                team_stats_sections = driver.find_elements(By.XPATH, "//*[contains(@class, 'assoc_stats_') and contains(@class, '_summary')]")
                logger.info(f"    Found {len(team_stats_sections)} team stats summary sections")
                
                for section in team_stats_sections:
                    try:
                        # Get team ID from class (e.g., "assoc_stats_822bd0ba_summary" -> "822bd0ba")
                        section_class = section.get_attribute("class") or ""
                        team_id_match = re.search(r'assoc_stats_([a-f0-9]+)_summary', section_class)
                        section_team_id = team_id_match.group(1) if team_id_match else None
                        
                        # Determine if this is home or away team
                        is_home_team = False
                        if section_team_id:
                            if match_data.get('home_team', {}).get('fbref_id') == section_team_id:
                                is_home_team = True
                            elif match_data.get('away_team', {}).get('fbref_id') == section_team_id:
                                is_home_team = False
                        
                        team_key = 'home' if is_home_team else 'away'
                        
                        # Find the stats table in this section
                        stats_table = section.find_element(By.XPATH, ".//table[contains(@class, 'stats_table')]")
                        
                        # Get the footer row which contains team totals
                        try:
                            tfoot = stats_table.find_element(By.TAG_NAME, "tfoot")
                            footer_row = tfoot.find_element(By.TAG_NAME, "tr")
                            footer_cells = footer_row.find_elements(By.XPATH, ".//td | .//th")
                            
                            # Get header row to map columns
                            thead = stats_table.find_element(By.TAG_NAME, "thead")
                            header_rows = thead.find_elements(By.TAG_NAME, "tr")
                            header_row = header_rows[-1] if header_rows else None
                            header_cells = header_row.find_elements(By.XPATH, ".//th | .//td") if header_row else []
                            
                            # Map data-stat attributes to stats
                            for i, header_cell in enumerate(header_cells):
                                if i >= len(footer_cells):
                                    break
                                
                                data_stat = header_cell.get_attribute("data-stat") or ""
                                cell_value = footer_cells[i].text.strip()
                                
                                # Extract stats based on data-stat attribute
                                if data_stat == 'goals' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['goals'] = int(cell_value)
                                elif data_stat == 'assists' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['assists'] = int(cell_value)
                                elif data_stat == 'shots' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['shots'] = int(cell_value)
                                elif data_stat == 'shots_on_target' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['shots_on_target'] = int(cell_value)
                                elif data_stat == 'passes' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['passes_attempted'] = int(cell_value)
                                elif data_stat == 'passes_completed' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['passes_completed'] = int(cell_value)
                                elif data_stat == 'passes_pct' and '%' in cell_value:
                                    match_data['team_stats'][team_key]['passing_accuracy'] = float(cell_value.replace('%', ''))
                                elif data_stat == 'possession' and '%' in cell_value:
                                    match_data['team_stats'][team_key]['possession'] = float(cell_value.replace('%', ''))
                                elif data_stat == 'touches' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['touches'] = int(cell_value)
                                elif data_stat == 'tackles' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['tackles'] = int(cell_value)
                                elif data_stat == 'interceptions' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['interceptions'] = int(cell_value)
                                elif data_stat == 'blocks' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['blocks'] = int(cell_value)
                                elif data_stat == 'fouls' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['fouls'] = int(cell_value)
                                elif data_stat == 'corners' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['corners'] = int(cell_value)
                                elif data_stat == 'crosses' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['crosses'] = int(cell_value)
                                elif data_stat == 'clearances' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['clearances'] = int(cell_value)
                                elif data_stat == 'offsides' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['offsides'] = int(cell_value)
                                elif data_stat == 'cards_yellow' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['yellow_cards'] = int(cell_value)
                                elif data_stat == 'cards_red' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['red_cards'] = int(cell_value)
                                elif data_stat == 'aerials_won' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['aerials_won'] = int(cell_value)
                                elif data_stat == 'gk_saves' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['saves'] = int(cell_value)
                                elif data_stat == 'gk_goal_kicks' and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['goal_kicks'] = int(cell_value)
                                elif 'throw' in data_stat.lower() and 'ins' in data_stat.lower() and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['throw_ins'] = int(cell_value)
                                elif 'long' in data_stat.lower() and 'ball' in data_stat.lower() and cell_value.isdigit():
                                    match_data['team_stats'][team_key]['long_balls'] = int(cell_value)
                            
                            logger.info(f"    ✓ Extracted team stats for {team_key} team from summary table")
                        except Exception as e:
                            logger.debug(f"    Error extracting from team stats summary table: {e}")
                            continue
                    except Exception as e:
                        logger.debug(f"    Error processing team stats section: {e}")
                        continue
            except Exception as e:
                logger.debug(f"    Error extracting from team stats summary sections: {e}")
            
            # Method 1.4.5: Extract from div#team_stats_extra (most reliable - this is the actual structure!)
            # This is a div with nested divs, not a table
            stats_extracted_from_table = False
            try:
                # Get team names from match_data
                home_team_name = match_data.get('home_team', {}).get('name', '').lower()
                away_team_name = match_data.get('away_team', {}).get('name', '').lower()
                
                # Wait for Cloudflare challenge to pass
                max_wait = 30  # Wait up to 30 seconds
                waited = 0
                while waited < max_wait:
                    page_title = driver.title
                    if "Just a moment" not in page_title and "Checking your browser" not in page_title:
                        break
                    logger.info(f"    Waiting for Cloudflare challenge to pass... ({waited}s)")
                    time.sleep(2)
                    waited += 2
                
                # Wait a bit more for page to fully load
                time.sleep(2)
                
                # Debug: Check current URL and page title
                current_url = driver.current_url
                page_title = driver.title
                logger.info(f"    DEBUG: Current URL: {current_url[:100]}")
                logger.info(f"    DEBUG: Page title: {page_title[:100]}")
                
                # Try multiple ways to find the div
                team_stats_extra = driver.find_elements(By.XPATH, "//div[@id='team_stats_extra']")
                logger.info(f"    DEBUG: Searching for div#team_stats_extra, found {len(team_stats_extra)} elements")
                
                # Also try searching for divs with team_stats in id or class
                if not team_stats_extra:
                    team_stats_extra = driver.find_elements(By.XPATH, "//div[contains(@id, 'team_stats')]")
                    logger.info(f"    DEBUG: Searching for divs with 'team_stats' in id, found {len(team_stats_extra)} elements")
                if not team_stats_extra:
                    team_stats_extra = driver.find_elements(By.XPATH, "//div[contains(@class, 'team_stats')]")
                    logger.info(f"    DEBUG: Searching for divs with 'team_stats' in class, found {len(team_stats_extra)} elements")
                
                # Also try finding divs that contain "Fouls" and "Corners" text (the stats we need)
                if not team_stats_extra:
                    team_stats_extra = driver.find_elements(By.XPATH, "//div[.//div[contains(text(), 'Fouls')] and .//div[contains(text(), 'Corners')]]")
                    logger.info(f"    DEBUG: Searching for divs containing 'Fouls' and 'Corners', found {len(team_stats_extra)} elements")
                if team_stats_extra:
                    logger.info(f"    Found div#team_stats_extra - using this for team stats extraction")
                    team_stats_div = team_stats_extra[0]
                    
                    # Get all stat groups (each group is a div containing a header and stat rows)
                    stat_groups = team_stats_div.find_elements(By.XPATH, "./div")
                    logger.info(f"    Found {len(stat_groups)} stat groups in team_stats_extra")
                    
                    for group_idx, group in enumerate(stat_groups):
                        try:
                            # Get header row (first 3 divs with class "th")
                            header_divs = group.find_elements(By.XPATH, ".//div[@class='th']")
                            if len(header_divs) >= 3:
                                col1_name = header_divs[0].text.strip().lower()
                                col3_name = header_divs[2].text.strip().lower()
                                
                                # Determine which column is home
                                col1_is_home = False
                                if home_team_name and (home_team_name in col1_name or col1_name in home_team_name or
                                                      any(word in col1_name for word in home_team_name.split() if len(word) > 3)):
                                    col1_is_home = True
                                
                                logger.debug(f"    Group {group_idx+1} header: col1='{col1_name}', col3='{col3_name}', col1_is_home={col1_is_home}")
                                
                                # Get all stat rows (divs that are not headers)
                                stat_rows = group.find_elements(By.XPATH, ".//div[not(@class='th')]")
                                # Group them into rows of 3 (home value, stat name, away value)
                                for i in range(0, len(stat_rows), 3):
                                    if i + 2 < len(stat_rows):
                                        home_value_div = stat_rows[i]
                                        stat_name_div = stat_rows[i + 1]
                                        away_value_div = stat_rows[i + 2]
                                        
                                        home_value = home_value_div.text.strip()
                                        stat_name = stat_name_div.text.strip().lower()
                                        away_value = away_value_div.text.strip()
                                        
                                        # Extract numeric values
                                        home_num = re.sub(r'[^\d]', '', home_value)
                                        away_num = re.sub(r'[^\d]', '', away_value)
                                        
                                        if home_num.isdigit() and away_num.isdigit():
                                            home_int = int(home_num)
                                            away_int = int(away_num)
                                            
                                            logger.debug(f"    Extracting stat '{stat_name}': home={home_int}, away={away_int}")
                                            
                                            # Map stat names to team_stats keys
                                            if 'foul' in stat_name:
                                                match_data['team_stats']['home']['fouls'] = home_int
                                                match_data['team_stats']['away']['fouls'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Fouls: home={home_int}, away={away_int}")
                                            elif 'corner' in stat_name:
                                                match_data['team_stats']['home']['corners'] = home_int
                                                match_data['team_stats']['away']['corners'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Corners: home={home_int}, away={away_int}")
                                            elif 'cross' in stat_name:
                                                match_data['team_stats']['home']['crosses'] = home_int
                                                match_data['team_stats']['away']['crosses'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Crosses: home={home_int}, away={away_int}")
                                            elif 'touch' in stat_name:
                                                match_data['team_stats']['home']['touches'] = home_int
                                                match_data['team_stats']['away']['touches'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Touches: home={home_int}, away={away_int}")
                                            elif 'tackle' in stat_name:
                                                match_data['team_stats']['home']['tackles'] = home_int
                                                match_data['team_stats']['away']['tackles'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Tackles: home={home_int}, away={away_int}")
                                            elif 'interception' in stat_name:
                                                match_data['team_stats']['home']['interceptions'] = home_int
                                                match_data['team_stats']['away']['interceptions'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Interceptions: home={home_int}, away={away_int}")
                                            elif 'aerial' in stat_name:
                                                match_data['team_stats']['home']['aerials_won'] = home_int
                                                match_data['team_stats']['away']['aerials_won'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Aerials Won: home={home_int}, away={away_int}")
                                            elif 'clearance' in stat_name:
                                                match_data['team_stats']['home']['clearances'] = home_int
                                                match_data['team_stats']['away']['clearances'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Clearances: home={home_int}, away={away_int}")
                                            elif 'offside' in stat_name:
                                                match_data['team_stats']['home']['offsides'] = home_int
                                                match_data['team_stats']['away']['offsides'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Offsides: home={home_int}, away={away_int}")
                                            elif 'goal kick' in stat_name:
                                                match_data['team_stats']['home']['goal_kicks'] = home_int
                                                match_data['team_stats']['away']['goal_kicks'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Goal Kicks: home={home_int}, away={away_int}")
                                            elif 'throw in' in stat_name:
                                                match_data['team_stats']['home']['throw_ins'] = home_int
                                                match_data['team_stats']['away']['throw_ins'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Throw Ins: home={home_int}, away={away_int}")
                                            elif 'long ball' in stat_name:
                                                match_data['team_stats']['home']['long_balls'] = home_int
                                                match_data['team_stats']['away']['long_balls'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Long Balls: home={home_int}, away={away_int}")
                                            elif 'possession' in stat_name:
                                                # Possession is a percentage, extract it differently
                                                home_pct = re.search(r'(\d+(?:\.\d+)?)', home_value)
                                                away_pct = re.search(r'(\d+(?:\.\d+)?)', away_value)
                                                if home_pct and away_pct:
                                                    match_data['team_stats']['home']['possession'] = float(home_pct.group(1))
                                                    match_data['team_stats']['away']['possession'] = float(away_pct.group(1))
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Possession: home={home_pct.group(1)}%, away={away_pct.group(1)}%")
                                            elif 'passing accuracy' in stat_name or 'passing' in stat_name:
                                                # Passing accuracy format: "430/539 (79.8%)" or "430 of 539 — 80%"
                                                # Extract completed/attempted and percentage
                                                home_passes = re.search(r'(\d+)\s*(?:of|/)\s*(\d+)', home_value)
                                                away_passes = re.search(r'(\d+)\s*(?:of|/)\s*(\d+)', away_value)
                                                if home_passes and away_passes:
                                                    match_data['team_stats']['home']['passes_completed'] = int(home_passes.group(1))
                                                    match_data['team_stats']['home']['passes_attempted'] = int(home_passes.group(2))
                                                    match_data['team_stats']['away']['passes_completed'] = int(away_passes.group(1))
                                                    match_data['team_stats']['away']['passes_attempted'] = int(away_passes.group(2))
                                                    # Extract percentage
                                                    home_pct = re.search(r'(\d+(?:\.\d+)?)\s*%', home_value)
                                                    away_pct = re.search(r'(\d+(?:\.\d+)?)\s*%', away_value)
                                                    if home_pct:
                                                        match_data['team_stats']['home']['passing_accuracy'] = float(home_pct.group(1))
                                                    if away_pct:
                                                        match_data['team_stats']['away']['passing_accuracy'] = float(away_pct.group(1))
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Passing Accuracy: home={home_passes.group(1)}/{home_passes.group(2)}, away={away_passes.group(1)}/{away_passes.group(2)}")
                                            elif 'shot' in stat_name and 'on target' not in stat_name:
                                                match_data['team_stats']['home']['shots'] = home_int
                                                match_data['team_stats']['away']['shots'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Shots: home={home_int}, away={away_int}")
                                            elif 'shot' in stat_name and 'on target' in stat_name:
                                                match_data['team_stats']['home']['shots_on_target'] = home_int
                                                match_data['team_stats']['away']['shots_on_target'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Shots on Target: home={home_int}, away={away_int}")
                                            elif 'save' in stat_name:
                                                match_data['team_stats']['home']['saves'] = home_int
                                                match_data['team_stats']['away']['saves'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Saves: home={home_int}, away={away_int}")
                        except Exception as e:
                            logger.debug(f"    Error processing stat group {group_idx+1}: {e}")
                            continue
                    
                    if stats_extracted_from_table:
                        logger.info(f"    ✓ Successfully extracted team stats from div#team_stats_extra")
                        # Verify values are in match_data
                        logger.info(f"    DEBUG: Verification - Fouls: home={match_data['team_stats']['home']['fouls']}, away={match_data['team_stats']['away']['fouls']}")
                        logger.info(f"    DEBUG: Verification - Touches: home={match_data['team_stats']['home']['touches']}, away={match_data['team_stats']['away']['touches']}")
                
                if not team_stats_extra:
                    logger.debug(f"    div#team_stats_extra not found, trying other methods...")
            except Exception as e:
                logger.debug(f"    Error extracting from div#team_stats_extra: {e}")
                import traceback
                logger.debug(f"    Traceback: {traceback.format_exc()}")
            
            # Extract basic stats (possession, passing accuracy, shots, saves) from tables with home-value/away-value classes
            # These are usually in a separate table and should be extracted regardless of div#team_stats_extra
            if not match_data['team_stats']['home'].get('possession') or not match_data['team_stats']['home'].get('passing_accuracy'):
                try:
                    # Try finding the table by looking for "Possession" text first
                    possession_elements = driver.find_elements(By.XPATH, "//td[contains(text(), 'Possession')] | //th[contains(text(), 'Possession')]")
                    logger.info(f"    DEBUG: Found {len(possession_elements)} elements containing 'Possession'")
                    
                    tables_with_classes = []
                    if possession_elements:
                        # Find the table containing the Possession element
                        for elem in possession_elements:
                            try:
                                table = elem.find_element(By.XPATH, "./ancestor::table[1]")
                                if table not in tables_with_classes:
                                    tables_with_classes.append(table)
                            except:
                                continue
                    
                    # Also try direct XPath patterns
                    if not tables_with_classes:
                        tables_with_classes = driver.find_elements(By.XPATH, "//table[.//td[@class='home-value'] and .//td[@class='away-value']]")
                    if not tables_with_classes:
                        tables_with_classes = driver.find_elements(By.XPATH, "//table[.//td[contains(@class, 'home-value')] and .//td[contains(@class, 'away-value')]]")
                    if not tables_with_classes:
                        # Try finding any table with "Possession" text
                        tables_with_classes = driver.find_elements(By.XPATH, "//table[.//td[contains(text(), 'Possession')]]")
                    
                    logger.info(f"    DEBUG: Found {len(tables_with_classes)} tables with home-value/away-value classes")
                    if tables_with_classes:
                        logger.info(f"    Found {len(tables_with_classes)} tables with home-value/away-value classes - extracting basic stats")
                        for table in tables_with_classes:
                            try:
                                # Try different XPath patterns to find the actual data rows
                                stat_rows = table.find_elements(By.XPATH, ".//tbody//tr[td]")
                                if not stat_rows:
                                    stat_rows = table.find_elements(By.XPATH, ".//tr[td and position()>1]")
                                if not stat_rows:
                                    stat_rows = table.find_elements(By.XPATH, ".//tr[count(td)>=3]")
                                logger.info(f"      Found {len(stat_rows)} stat rows in table")
                                for row_idx, row in enumerate(stat_rows):
                                    try:
                                        # Get all cells including nested ones - try direct children first
                                        cells = row.find_elements(By.XPATH, "./td | ./th")
                                        if len(cells) < 3:
                                            # Try all descendant cells
                                            cells = row.find_elements(By.XPATH, ".//td | .//th")
                                        logger.info(f"      Row {row_idx+1}: Found {len(cells)} cells (td/th)")
                                        # Log cell contents for debugging
                                        for cell_idx, cell in enumerate(cells):
                                            logger.info(f"        Cell {cell_idx+1}: text='{cell.text.strip()[:50]}', class='{cell.get_attribute('class')}'")
                                        if len(cells) < 3:
                                            # Also try getting all child elements
                                            all_cells = row.find_elements(By.XPATH, "./*")
                                            logger.info(f"      Row {row_idx+1}: Found {len(all_cells)} child elements")
                                            if len(all_cells) >= 3:
                                                cells = all_cells
                                            # If we have 2 cells, that's fine - they're likely home and away values
                                            # The stat name will be inferred from row content or previous row
                                            elif len(cells) == 2:
                                                logger.info(f"      Row {row_idx+1}: Using 2 cells as home/away values")
                                                # Continue processing with 2 cells
                                            else:
                                                logger.info(f"      Row {row_idx+1}: Skipping - only {len(cells)} cells")
                                                continue
                                        
                                        # Try to get stat name - first check if first cell looks like a stat name (not a number/percentage)
                                        stat_name = ""
                                        first_cell_text = cells[0].text.strip().lower() if len(cells) > 0 else ""
                                        
                                        # Check if first cell looks like a stat name (contains letters, not just numbers/percentages)
                                        if first_cell_text and not re.match(r'^[\d\s%—\-]+$', first_cell_text):
                                            stat_name = first_cell_text
                                        else:
                                            # Try getting from previous row
                                            try:
                                                prev_row = stat_rows[row_idx - 1] if row_idx > 0 else None
                                                if prev_row:
                                                    prev_cells = prev_row.find_elements(By.XPATH, "./td | ./th | .//td | .//th")
                                                    if prev_cells and prev_cells[0].text.strip():
                                                        prev_text = prev_cells[0].text.strip().lower()
                                                        if not re.match(r'^[\d\s%—\-]+$', prev_text):
                                                            stat_name = prev_text
                                            except:
                                                pass
                                        
                                        # If still no stat name or stat_name looks like a value (contains numbers/percentages), try to infer
                                        if not stat_name or re.match(r'^[\d\s%—\-]+$', stat_name) or (re.search(r'\d', stat_name) and '%' in stat_name):
                                            # Look for stat name in the row's text or in a strong tag
                                            row_text = row.text.strip().lower()
                                            # Check cell values to infer stat type
                                            home_val = cells[0].text.strip() if len(cells) > 0 else ""
                                            away_val = cells[1].text.strip() if len(cells) > 1 else ""
                                            
                                            # Infer from values: possession is usually just percentages like "61%"
                                            if re.match(r'^\d+\.?\d*%$', home_val) and re.match(r'^\d+\.?\d*%$', away_val):
                                                stat_name = 'possession'
                                            # Passing accuracy has format like "430 of 539 — 80%" or "430 of 539 — 80%"
                                            elif 'of' in home_val and ('—' in home_val or '%' in home_val) and row_idx == 1:
                                                stat_name = 'passing accuracy'
                                            # Shots on target has format like "10 of 19 — 53%"
                                            elif 'of' in home_val and ('—' in home_val or '%' in home_val) and row_idx == 2:
                                                stat_name = 'shots on target'
                                            # Shots is usually just numbers (but we already extracted shots on target, so this might not be needed)
                                            elif re.match(r'^\d+$', home_val) and re.match(r'^\d+$', away_val) and row_idx == 2:
                                                stat_name = 'shots'
                                            # Saves has format like "1 of 3 — 33%" or "1 of 3 — 33%"
                                            elif 'of' in home_val and ('—' in home_val or '%' in home_val) and row_idx == 3:
                                                stat_name = 'saves'
                                            # Fallback: infer from row text
                                            elif 'possession' in row_text:
                                                stat_name = 'possession'
                                            elif 'passing' in row_text or 'accuracy' in row_text:
                                                stat_name = 'passing accuracy'
                                            elif 'shot' in row_text and 'target' in row_text:
                                                stat_name = 'shots on target'
                                            elif 'shot' in row_text:
                                                stat_name = 'shots'
                                            elif 'save' in row_text:
                                                stat_name = 'saves'
                                        
                                        logger.info(f"      Processing stat row {row_idx+1}: stat_name='{stat_name}'")
                                        
                                        # Find cells with home-value and away-value classes
                                        home_cell = None
                                        away_cell = None
                                        
                                        # If we have exactly 2 cells, use them as home and away
                                        if len(cells) == 2:
                                            home_cell = cells[0]
                                            away_cell = cells[1]
                                        else:
                                            # Otherwise, look for cells with home-value/away-value classes
                                            for cell in cells[1:]:
                                                cell_class = (cell.get_attribute('class') or '').lower()
                                                cell_text = cell.text.strip()
                                                logger.info(f"        Cell class: '{cell_class}', text: '{cell_text}'")
                                                if 'home-value' in cell_class or ('home' in cell_class and 'value' in cell_class):
                                                    home_cell = cell
                                                elif 'away-value' in cell_class or ('away' in cell_class and 'value' in cell_class):
                                                    away_cell = cell
                                        
                                        logger.info(f"      Found home_cell: {home_cell is not None}, away_cell: {away_cell is not None}")
                                        if home_cell and away_cell:
                                            home_value = home_cell.text.strip()
                                            away_value = away_cell.text.strip()
                                            logger.info(f"      Values: home='{home_value}', away='{away_value}'")
                                            
                                            # Extract possession
                                            if 'possession' in stat_name and not match_data['team_stats']['home'].get('possession'):
                                                home_pct = re.search(r'(\d+(?:\.\d+)?)', home_value)
                                                away_pct = re.search(r'(\d+(?:\.\d+)?)', away_value)
                                                if home_pct and away_pct:
                                                    match_data['team_stats']['home']['possession'] = float(home_pct.group(1))
                                                    match_data['team_stats']['away']['possession'] = float(away_pct.group(1))
                                                    logger.info(f"    DEBUG: ✓ Extracted Possession (from table): home={home_pct.group(1)}%, away={away_pct.group(1)}%")
                                            
                                            # Extract passing accuracy
                                            elif ('passing accuracy' in stat_name or ('passing' in stat_name and 'accuracy' in stat_name)) and not match_data['team_stats']['home'].get('passing_accuracy'):
                                                home_passes = re.search(r'(\d+)\s*(?:of|/)\s*(\d+)', home_value)
                                                away_passes = re.search(r'(\d+)\s*(?:of|/)\s*(\d+)', away_value)
                                                if home_passes and away_passes:
                                                    match_data['team_stats']['home']['passes_completed'] = int(home_passes.group(1))
                                                    match_data['team_stats']['home']['passes_attempted'] = int(home_passes.group(2))
                                                    match_data['team_stats']['away']['passes_completed'] = int(away_passes.group(1))
                                                    match_data['team_stats']['away']['passes_attempted'] = int(away_passes.group(2))
                                                    home_pct = re.search(r'(\d+(?:\.\d+)?)\s*%', home_value)
                                                    away_pct = re.search(r'(\d+(?:\.\d+)?)\s*%', away_value)
                                                    if home_pct:
                                                        match_data['team_stats']['home']['passing_accuracy'] = float(home_pct.group(1))
                                                    if away_pct:
                                                        match_data['team_stats']['away']['passing_accuracy'] = float(away_pct.group(1))
                                                    logger.info(f"    DEBUG: ✓ Extracted Passing Accuracy (from table): home={home_passes.group(1)}/{home_passes.group(2)}, away={away_passes.group(1)}/{away_passes.group(2)}")
                                            
                                            # Extract shots
                                            elif 'shot' in stat_name and 'on target' not in stat_name and 'shots on target' not in stat_name and not match_data['team_stats']['home'].get('shots'):
                                                home_num = re.sub(r'[^\d]', '', home_value)
                                                away_num = re.sub(r'[^\d]', '', away_value)
                                                if home_num.isdigit() and away_num.isdigit():
                                                    match_data['team_stats']['home']['shots'] = int(home_num)
                                                    match_data['team_stats']['away']['shots'] = int(away_num)
                                                    logger.info(f"    DEBUG: ✓ Extracted Shots (from table): home={home_num}, away={away_num}")
                                            
                                            # Extract shots on target (format: "10 of 19 — 53%" or "30% — 3 of 10")
                                            elif 'shot' in stat_name and ('on target' in stat_name or 'shots on target' in stat_name) and not match_data['team_stats']['home'].get('shots_on_target'):
                                                # Home: extract first number (shots on target) and second number (total shots)
                                                # Format: "10 of 19 — 53%"
                                                home_sot_match = re.search(r'^(\d+)\s+of\s+(\d+)', home_value)
                                                # Away: extract numbers (format: "30% — 3 of 10")
                                                away_sot_match = re.search(r'—\s*(\d+)\s+of\s+(\d+)', away_value)
                                                if not away_sot_match:
                                                    # Fallback: try different format
                                                    away_sot_match = re.search(r'(\d+)\s+of\s+(\d+)', away_value)
                                                
                                                if home_sot_match:
                                                    match_data['team_stats']['home']['shots_on_target'] = int(home_sot_match.group(1))
                                                    match_data['team_stats']['home']['shots'] = int(home_sot_match.group(2))
                                                if away_sot_match:
                                                    match_data['team_stats']['away']['shots_on_target'] = int(away_sot_match.group(1))
                                                    match_data['team_stats']['away']['shots'] = int(away_sot_match.group(2))
                                                
                                                if home_sot_match and away_sot_match:
                                                    logger.info(f"    DEBUG: ✓ Extracted Shots on Target (from table): home={home_sot_match.group(1)}/{home_sot_match.group(2)}, away={away_sot_match.group(1)}/{away_sot_match.group(2)}")
                                            
                                            # Extract saves (format: "1 of 3 — 33%" or "60% — 6 of 10")
                                            elif 'save' in stat_name and not match_data['team_stats']['home'].get('saves'):
                                                # Home: extract first number (format: "1 of 3 — 33%")
                                                home_match = re.search(r'^(\d+)', home_value)
                                                # Away: extract number after "—" (format: "60% — 6 of 10")
                                                away_match = re.search(r'—\s*(\d+)', away_value)
                                                if not away_match:
                                                    # Fallback: extract first number
                                                    away_match = re.search(r'^(\d+)', away_value)
                                                if home_match and away_match:
                                                    match_data['team_stats']['home']['saves'] = int(home_match.group(1))
                                                    match_data['team_stats']['away']['saves'] = int(away_match.group(1))
                                                    logger.info(f"    DEBUG: ✓ Extracted Saves (from table): home={home_match.group(1)}, away={away_match.group(1)}")
                                    except Exception as e:
                                        logger.info(f"      Error processing stat row with classes: {e}")
                                        import traceback
                                        logger.info(f"      Traceback: {traceback.format_exc()}")
                                        continue
                            except Exception as e:
                                logger.info(f"    Error processing table with classes: {e}")
                                import traceback
                                logger.info(f"    Traceback: {traceback.format_exc()}")
                                continue
                except Exception as e:
                    logger.info(f"    Error extracting basic stats from tables: {e}")
                    import traceback
                    logger.info(f"    Traceback: {traceback.format_exc()}")
            
            # Extract cards (yellow and red) from the Cards section - run regardless of possession extraction
            # Cards are in a row with "Cards" header, followed by a row with two <td> elements
            # Each <td> contains a div with class="cards" which has <span> elements with class="yellow_card" or "red_card"
            if not match_data['team_stats']['home'].get('yellow_cards') or not match_data['team_stats']['home'].get('red_cards'):
                try:
                    # Find tables that might contain cards
                    cards_tables = driver.find_elements(By.XPATH, "//table[.//th[contains(text(), 'Cards')] or .//td[contains(text(), 'Cards')]]")
                    if not cards_tables:
                        # Also try finding tables with team stats
                        cards_tables = driver.find_elements(By.XPATH, "//table[.//td[contains(@class, 'home-value')] and .//td[contains(@class, 'away-value')]]")
                    
                    logger.info(f"    DEBUG: Found {len(cards_tables)} tables that might contain cards")
                    for table in cards_tables:
                        try:
                            # Find the Cards header row
                            cards_header_rows = table.find_elements(By.XPATH, ".//tr[.//th[contains(text(), 'Cards')] or .//td[contains(text(), 'Cards')]]")
                            if cards_header_rows:
                                logger.info(f"      Found Cards header row")
                                # Find the next row (the one with actual card data)
                                for header_row in cards_header_rows:
                                    try:
                                        # Get the next sibling row
                                        next_row = header_row.find_element(By.XPATH, "./following-sibling::tr[1]")
                                        cards_cells = next_row.find_elements(By.XPATH, ".//td")
                                        if len(cards_cells) >= 2:
                                            # First cell is home team, second is away team
                                            home_cards_div = cards_cells[0].find_elements(By.XPATH, ".//div[@class='cards'] | .//div[contains(@class, 'cards')]")
                                            away_cards_div = cards_cells[1].find_elements(By.XPATH, ".//div[@class='cards'] | .//div[contains(@class, 'cards')]")
                                            
                                            if home_cards_div:
                                                home_yellow = len(home_cards_div[0].find_elements(By.XPATH, ".//span[@class='yellow_card'] | .//span[contains(@class, 'yellow_card')]"))
                                                home_red = len(home_cards_div[0].find_elements(By.XPATH, ".//span[@class='red_card'] | .//span[contains(@class, 'red_card')]"))
                                                if home_yellow > 0 or home_red > 0 or not match_data['team_stats']['home'].get('yellow_cards'):
                                                    match_data['team_stats']['home']['yellow_cards'] = home_yellow
                                                    match_data['team_stats']['home']['red_cards'] = home_red
                                                    logger.info(f"      DEBUG: ✓ Extracted Cards (from table): home yellow={home_yellow}, red={home_red}")
                                            
                                            if away_cards_div:
                                                away_yellow = len(away_cards_div[0].find_elements(By.XPATH, ".//span[@class='yellow_card'] | .//span[contains(@class, 'yellow_card')]"))
                                                away_red = len(away_cards_div[0].find_elements(By.XPATH, ".//span[@class='red_card'] | .//span[contains(@class, 'red_card')]"))
                                                if away_yellow > 0 or away_red > 0 or not match_data['team_stats']['away'].get('yellow_cards'):
                                                    match_data['team_stats']['away']['yellow_cards'] = away_yellow
                                                    match_data['team_stats']['away']['red_cards'] = away_red
                                                    logger.info(f"      DEBUG: ✓ Extracted Cards (from table): away yellow={away_yellow}, red={away_red}")
                                    except Exception as e:
                                        logger.debug(f"      Error extracting cards from row: {e}")
                                        continue
                        except Exception as e:
                            logger.debug(f"      Error processing table for cards: {e}")
                            continue
                except Exception as e:
                    logger.debug(f"    Error extracting cards from tables: {e}")
            
            # Method 1.5: Extract from Team Stats table with team name headers (fallback)
            # TEMPORARILY COMMENTED OUT - fixing indentation issues
            # This will be re-enabled once indentation is fixed
            """
            if not stats_extracted_from_table:
                try:
                    # Save HTML snippet for debugging
                    try:
                        team_stats_section = driver.find_element(By.XPATH, "//*[contains(text(), 'Team Stats')]/ancestor::*[position()<=5]")
                        html_snippet = team_stats_section.get_attribute('outerHTML')[:5000]  # First 5000 chars
                        debug_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'current', 'team_stats_debug.html')
                        os.makedirs(os.path.dirname(debug_file), exist_ok=True)
                        with open(debug_file, 'w', encoding='utf-8') as f:
                            f.write(html_snippet)
                        logger.info(f"    DEBUG: Saved Team Stats HTML snippet to {debug_file}")
                    except Exception as e:
                        logger.debug(f"    DEBUG: Could not save HTML snippet: {e}")
                    # First, try finding tables with home-value/away-value classes (most reliable)
                    tables_with_classes = driver.find_elements(By.XPATH, "//table[.//td[contains(@class, 'home-value')] and .//td[contains(@class, 'away-value')]]")
                    logger.info(f"    DEBUG: Searching for tables with home-value/away-value classes...")
                    logger.info(f"    DEBUG: Found {len(tables_with_classes)} tables with home-value/away-value classes")
                
                # Also check all tables on the page to see their structure
                    all_page_tables = driver.find_elements(By.XPATH, "//table")
                    logger.info(f"    DEBUG: Total tables on page: {len(all_page_tables)}")
                    for idx, table in enumerate(all_page_tables[:10]):  # Check first 10 tables
                        try:
                            table_id = table.get_attribute('id') or 'no-id'
                            table_class = table.get_attribute('class') or 'no-class'
                            # Check if it has home-value or away-value classes
                            has_home_value = len(table.find_elements(By.XPATH, ".//td[contains(@class, 'home-value')]")) > 0
                            has_away_value = len(table.find_elements(By.XPATH, ".//td[contains(@class, 'away-value')]")) > 0
                            # Get first few rows to see structure
                            rows = table.find_elements(By.XPATH, ".//tr")[:3]
                            row_preview = []
                            for row in rows:
                                cells = row.find_elements(By.XPATH, ".//td | .//th")
                                cell_texts = [c.text.strip()[:20] for c in cells[:5]]
                                row_preview.append(cell_texts)
                            logger.info(f"    DEBUG: Table {idx+1}: id='{table_id[:30]}', class='{table_class[:50]}', has_home_value={has_home_value}, has_away_value={has_away_value}")
                            logger.info(f"    DEBUG:   First 3 rows preview: {row_preview}")
                        except Exception as e:
                            logger.debug(f"    DEBUG: Error inspecting table {idx+1}: {e}")
                
                    if tables_with_classes:
                        logger.info(f"    Found {len(tables_with_classes)} tables with home-value/away-value classes")
                        for table in tables_with_classes:
                            try:
                                stat_rows = table.find_elements(By.XPATH, ".//tbody//tr | .//tr[position()>1]")
                                for row in stat_rows:
                                    try:
                                        cells = row.find_elements(By.XPATH, ".//td")
                                        if len(cells) < 3:
                                            continue
                                        
                                        stat_name_cell = cells[0]
                                        stat_name = stat_name_cell.text.strip().lower()
                                        
                                        # Find cells with home-value and away-value classes
                                        home_cell = None
                                        away_cell = None
                                        for cell in cells[1:]:
                                            cell_class = (cell.get_attribute('class') or '').lower()
                                            if 'home-value' in cell_class or 'home' in cell_class:
                                                home_cell = cell
                                            elif 'away-value' in cell_class or 'away' in cell_class:
                                                away_cell = cell
                                        
                                        if home_cell and away_cell:
                                            home_value = home_cell.text.strip()
                                            away_value = away_cell.text.strip()
                                        
                                        # Extract numeric values
                                        home_num = re.sub(r'[^\d]', '', home_value)
                                        away_num = re.sub(r'[^\d]', '', away_value)
                                        
                                        if home_num.isdigit() and away_num.isdigit():
                                            home_int = int(home_num)
                                            away_int = int(away_num)
                                            
                                            # Map stat names (same logic as below)
                                            if 'foul' in stat_name:
                                                match_data['team_stats']['home']['fouls'] = home_int
                                                match_data['team_stats']['away']['fouls'] = away_int
                                                stats_extracted_from_table = True
                                                logger.debug(f"      Extracted Fouls (from classes): {home_int}-{away_int}")
                                            elif 'corner' in current_stat_name:
                                                match_data['team_stats']['home']['corners'] = home_int
                                                match_data['team_stats']['away']['corners'] = away_int
                                                stats_extracted_from_table = True
                                                logger.debug(f"      Extracted Corners (from classes): {home_int}-{away_int}")
                                            elif 'cross' in current_stat_name:
                                                match_data['team_stats']['home']['crosses'] = home_int
                                                match_data['team_stats']['away']['crosses'] = away_int
                                                stats_extracted_from_table = True
                                                logger.debug(f"      Extracted Crosses (from classes): {home_int}-{away_int}")
                                            elif 'touch' in current_stat_name:
                                                match_data['team_stats']['home']['touches'] = home_int
                                                match_data['team_stats']['away']['touches'] = away_int
                                                stats_extracted_from_table = True
                                                logger.debug(f"      Extracted Touches (from classes): {home_int}-{away_int}")
                                            elif 'tackle' in current_stat_name:
                                                match_data['team_stats']['home']['tackles'] = home_int
                                                match_data['team_stats']['away']['tackles'] = away_int
                                                stats_extracted_from_table = True
                                                logger.debug(f"      Extracted Tackles (from classes): {home_int}-{away_int}")
                                            elif 'interception' in current_stat_name:
                                                match_data['team_stats']['home']['interceptions'] = home_int
                                                match_data['team_stats']['away']['interceptions'] = away_int
                                                stats_extracted_from_table = True
                                                logger.debug(f"      Extracted Interceptions (from classes): {home_int}-{away_int}")
                                            elif 'aerial' in current_stat_name:
                                                match_data['team_stats']['home']['aerials_won'] = home_int
                                                match_data['team_stats']['away']['aerials_won'] = away_int
                                                stats_extracted_from_table = True
                                                logger.debug(f"      Extracted Aerials Won (from classes): {home_int}-{away_int}")
                                            elif 'clearance' in current_stat_name:
                                                match_data['team_stats']['home']['clearances'] = home_int
                                                match_data['team_stats']['away']['clearances'] = away_int
                                                stats_extracted_from_table = True
                                                logger.debug(f"      Extracted Clearances (from classes): {home_int}-{away_int}")
                                            elif 'offside' in current_stat_name:
                                                match_data['team_stats']['home']['offsides'] = home_int
                                                match_data['team_stats']['away']['offsides'] = away_int
                                                stats_extracted_from_table = True
                                                logger.debug(f"      Extracted Offsides (from classes): {home_int}-{away_int}")
                                            elif 'goal kick' in current_stat_name:
                                                match_data['team_stats']['home']['goal_kicks'] = home_int
                                                match_data['team_stats']['away']['goal_kicks'] = away_int
                                                stats_extracted_from_table = True
                                                logger.debug(f"      Extracted Goal Kicks (from classes): {home_int}-{away_int}")
                                            elif 'throw in' in current_stat_name:
                                                match_data['team_stats']['home']['throw_ins'] = home_int
                                                match_data['team_stats']['away']['throw_ins'] = away_int
                                                stats_extracted_from_table = True
                                                logger.debug(f"      Extracted Throw Ins (from classes): {home_int}-{away_int}")
                                            elif 'long ball' in current_stat_name:
                                                match_data['team_stats']['home']['long_balls'] = home_int
                                                match_data['team_stats']['away']['long_balls'] = away_int
                                                stats_extracted_from_table = True
                                                logger.debug(f"      Extracted Long Balls (from classes): {home_int}-{away_int}")
                                            elif 'yellow card' in current_stat_name:
                                                match_data['team_stats']['home']['yellow_cards'] = home_int
                                                match_data['team_stats']['away']['yellow_cards'] = away_int
                                                stats_extracted_from_table = True
                                                logger.debug(f"      Extracted Yellow Cards (from classes): {home_int}-{away_int}")
                                            elif 'red card' in current_stat_name:
                                                match_data['team_stats']['home']['red_cards'] = home_int
                                                match_data['team_stats']['away']['red_cards'] = away_int
                                                stats_extracted_from_table = True
                                                logger.debug(f"      Extracted Red Cards (from classes): {home_int}-{away_int}")
                                    except Exception as e:
                                        logger.debug(f"      Error processing stat row with classes: {e}")
                                        continue
                            
                                if stats_extracted_from_table:
                                    logger.info(f"    ✓ Successfully extracted team stats from table with home-value/away-value classes")
                                    break
                        except Exception as e:
                            logger.debug(f"    Error processing table with classes: {e}")
                            continue
                
                # If we didn't find tables with classes, try the team name header method
                    if not stats_extracted_from_table:
                    # Get team names from match_data for dynamic search
                    home_team_name = match_data.get('home_team', {}).get('name', '').lower()
                    away_team_name = match_data.get('away_team', {}).get('name', '').lower()
                    
                    # Find tables near "Team Stats" heading
                    team_stats_tables = []
                    try:
                        team_stats_headings = driver.find_elements(By.XPATH, "//h2[contains(text(), 'Team Stats')] | //h3[contains(text(), 'Team Stats')] | //h2[contains(text(), 'Team Statistics')] | //h3[contains(text(), 'Team Statistics')]")
                        logger.info(f"    DEBUG: Found {len(team_stats_headings)} 'Team Stats' headings")
                        for heading in team_stats_headings:
                            # Find tables after the heading (check more tables)
                            following_tables = heading.find_elements(By.XPATH, "./following::table[position()<=10]")
                            logger.info(f"    DEBUG: Found {len(following_tables)} tables following Team Stats heading")
                            team_stats_tables.extend(following_tables)
                    except Exception as e:
                        logger.debug(f"    DEBUG: Error finding Team Stats headings: {e}")
                    
                    # Also try finding tables that contain target stats (Fouls, Corners, etc.)
                    # Look for tables where the first cell of a row contains these stat names
                    target_stats_text = ['Fouls', 'Corners', 'Crosses', 'Touches', 'Tackles', 'Interceptions', 'Aerials Won', 'Clearances']
                    tables_with_target_stats = []
                    try:
                        for stat_text in target_stats_text:
                            # Find tables where first cell of a row contains this stat text
                            stat_tables = driver.find_elements(By.XPATH, f"//table[.//tr/td[1][contains(text(), '{stat_text}')] or .//tr/th[1][contains(text(), '{stat_text}')]]")
                            tables_with_target_stats.extend(stat_tables)
                        # Remove duplicates
                        tables_with_target_stats = list(dict.fromkeys(tables_with_target_stats))
                        logger.info(f"    DEBUG: Found {len(tables_with_target_stats)} tables with target stats in first column")
                        if tables_with_target_stats:
                            team_stats_tables.extend(tables_with_target_stats)
                            # Prioritize these tables
                            team_stats_tables = tables_with_target_stats + [t for t in team_stats_tables if t not in tables_with_target_stats]
                    except Exception as e:
                        logger.debug(f"    DEBUG: Error finding tables with target stats: {e}")
                    
                    # Also try finding tables with team names in headers (more flexible)
                    if not team_stats_tables:
                        # Look for any table with 3+ columns in thead
                        all_tables = driver.find_elements(By.XPATH, "//table[.//thead//th[position()>=2] and .//thead//th[position()>=3]]")
                        logger.info(f"    DEBUG: Fallback: Found {len(all_tables)} tables with 3+ columns in thead")
                        team_stats_tables = all_tables[:5]  # Limit to first 5 to avoid too many
                    
                    logger.info(f"    Found {len(team_stats_tables)} potential team stats tables with headers")
                    
                    # Log details about each table found and identify which ones have team names
                    tables_with_team_names = []
                    for idx, table in enumerate(team_stats_tables):
                        try:
                            table_id = table.get_attribute('id') or 'no-id'
                            # Get header row
                            header_row = table.find_elements(By.XPATH, ".//thead//tr//th | .//tr[1]//th")
                            header_texts = [h.text.strip()[:30] for h in header_row[:5]]
                            # Check if it has team names
                            has_team_names = any(
                                home_team_name in h.text.lower() or away_team_name in h.text.lower() 
                                for h in header_row if h.text.strip()
                            )
                            logger.info(f"    DEBUG: Table {idx+1}: id='{table_id[:30]}', headers={header_texts}, has_team_names={has_team_names}")
                            if has_team_names:
                                tables_with_team_names.append((idx, table))
                        except Exception as e:
                            logger.debug(f"    DEBUG: Error inspecting table {idx+1}: {e}")
                    
                    # Prioritize tables that have team names in headers
                    if tables_with_team_names:
                        logger.info(f"    Found {len(tables_with_team_names)} tables with team names in headers - processing those first")
                        # Reorder: process tables with team names first
                        tables_to_process = [t[1] for t in tables_with_team_names] + [t for i, t in enumerate(team_stats_tables) if i not in [t[0] for t in tables_with_team_names]]
                    else:
                        tables_to_process = team_stats_tables
                    
                    # For the table with team names, extract stats directly from it
                    # But first, check ALL tables to find one with the stats we need (fouls, corners, etc.)
                    logger.info(f"    DEBUG: Checking if we can extract directly from team names table...")
                    logger.info(f"    DEBUG: tables_with_team_names has {len(tables_with_team_names)} entries")
                    
                    # Look for a table that has stats like "Fouls", "Corners", "Crosses", etc.
                    target_stats = ['foul', 'corner', 'cross', 'touch', 'tackle', 'interception', 'aerial', 'clearance']
                    best_table = None
                    best_table_score = 0
                    
                    # Check all tables we found, not just ones with team names
                    all_candidate_tables = [t[1] for t in tables_with_team_names] if tables_with_team_names else []
                    # Also add tables that contain target stats
                    for table in team_stats_tables:
                        if table not in all_candidate_tables:
                            all_candidate_tables.append(table)
                    
                    logger.info(f"    DEBUG: Checking {len(all_candidate_tables)} candidate tables for target stats...")
                    for idx, table in enumerate(all_candidate_tables):
                        try:
                            # Check how many target stats this table has
                            all_text = table.text.lower()
                            score = sum(1 for stat in target_stats if stat in all_text)
                            found_stats = [s for s in target_stats if s in all_text]
                            
                            # Bonus: Check if table has team names in header (more likely to be team stats table)
                            has_team_names = False
                            try:
                                header_row = table.find_elements(By.XPATH, ".//thead//tr//th | .//tr[1]//th")
                                if header_row:
                                    header_texts = [h.text.strip().lower() for h in header_row]
                                    has_team_names = any(home_team_name in txt or away_team_name in txt for txt in header_texts)
                                    if has_team_names:
                                        score += 5  # Big bonus for having team names
                            except:
                                pass
                            
                            logger.info(f"    DEBUG: Table {idx+1} has score {score} (contains {found_stats}, has_team_names={has_team_names})")
                            if score > best_table_score:
                                best_table_score = score
                                best_table = table
                        except Exception as e:
                            logger.debug(f"    DEBUG: Error checking table {idx+1}: {e}")
                    
                    if best_table and best_table_score > 0:
                        logger.info(f"    DEBUG: Using best table with score {best_table_score}")
                        team_names_table = best_table
                    elif tables_with_team_names:
                        logger.info(f"    DEBUG: Attempting direct extraction from team names table...")
                        team_names_table = tables_with_team_names[0][1]  # Get the first table with team names
                        try:
                            logger.info(f"    DEBUG: Getting Row 1 from team names table...")
                            # Get Row 1 which has team names
                            first_row = team_names_table.find_element(By.XPATH, ".//tr[1]")
                            header_cells = first_row.find_elements(By.XPATH, ".//th | .//td")
                            logger.info(f"    DEBUG: Found {len(header_cells)} header cells in Row 1")
                            
                            # Row 1 should have team names - check if it does
                            header_texts = []
                            for cell in header_cells:
                                txt = cell.text.strip()
                                if not txt:
                                    txt = cell.get_attribute('textContent') or cell.get_attribute('innerText') or ""
                                    txt = txt.strip()
                                if not txt:
                                    try:
                                        inner = cell.find_element(By.XPATH, ".//a | .//span | .//strong")
                                        txt = inner.text.strip()
                                    except:
                                        pass
                                header_texts.append(txt)
                            
                            header_texts_lower = [txt.lower() for txt in header_texts]
                            has_team_names = any('liverpool' in txt for txt in header_texts_lower) and any('bournemouth' in txt for txt in header_texts_lower)
                            
                            logger.info(f"    DEBUG: Row 1 cells: {header_texts}, has_team_names={has_team_names}")
                            
                            # If Row 1 has team names (even if only 2 cells), use it as header
                            if has_team_names and len(header_cells) >= 2:
                                # Determine which column is home and which is away
                                col1_is_home = False
                                if len(header_texts_lower) >= 2:
                                    col1_txt = header_texts_lower[0]  # First column (index 0)
                                    col2_txt = header_texts_lower[1]  # Second column (index 1)
                                    
                                    # Check if home team name matches column 1
                                    if home_team_name and (home_team_name in col1_txt or col1_txt in home_team_name or
                                                          any(word in col1_txt for word in home_team_name.split() if len(word) > 3)):
                                        col1_is_home = True
                                    elif home_team_name and (home_team_name in col2_txt or col2_txt in home_team_name or
                                                            any(word in col2_txt for word in home_team_name.split() if len(word) > 3)):
                                        col1_is_home = False  # col2 is home
                                
                                logger.info(f"    Direct extraction from team names table: header={header_texts}, col1_is_home={col1_is_home}")
                                
                                # Try to find a table with thead (team names) and tbody (stats)
                            # First check if this table has a thead with team names
                            thead_rows = team_names_table.find_elements(By.XPATH, ".//thead//tr")
                            tbody_rows = team_names_table.find_elements(By.XPATH, ".//tbody//tr")
                            
                            if thead_rows and tbody_rows:
                                # Standard table structure: thead has team names, tbody has stats
                                logger.info(f"    Found table with thead ({len(thead_rows)} rows) and tbody ({len(tbody_rows)} rows)")
                                header_row = thead_rows[0].find_elements(By.XPATH, ".//th")
                                if len(header_row) >= 3:
                                    # Get team names from header
                                    col1_name = header_row[1].text.strip().lower() if len(header_row) > 1 else ""
                                    col2_name = header_row[2].text.strip().lower() if len(header_row) > 2 else ""
                                    
                                    # Determine which column is home
                                    col1_is_home = False
                                    if home_team_name and (home_team_name in col1_name or col1_name in home_team_name or
                                                          any(word in col1_name for word in home_team_name.split() if len(word) > 3)):
                                        col1_is_home = True
                                    
                                    logger.info(f"    Table header: col1='{col1_name}', col2='{col2_name}', col1_is_home={col1_is_home}")
                                    
                                    # Extract from tbody rows
                                    for row in tbody_rows:
                                        try:
                                            cells = row.find_elements(By.XPATH, ".//td")
                                            if len(cells) < 3:
                                                continue
                                            
                                            stat_name = cells[0].text.strip().lower()
                                            col1_value = cells[1].text.strip() if len(cells) > 1 else ""
                                            col2_value = cells[2].text.strip() if len(cells) > 2 else ""
                                            
                                            # Map to home/away
                                            if col1_is_home:
                                                home_value = col1_value
                                                away_value = col2_value
                                            else:
                                                home_value = col2_value
                                                away_value = col1_value
                                            
                                            # Extract numeric values
                                            home_num = re.sub(r'[^\d]', '', home_value)
                                            away_num = re.sub(r'[^\d]', '', away_value)
                                            
                                            if home_num.isdigit() and away_num.isdigit():
                                                home_int = int(home_num)
                                                away_int = int(away_num)
                                                
                                                logger.info(f"    DEBUG: Processing stat '{stat_name}': home={home_int}, away={away_int}")
                                                
                                                # Map stat names (same logic as below)
                                                if 'foul' in stat_name:
                                                    match_data['team_stats']['home']['fouls'] = home_int
                                                    match_data['team_stats']['away']['fouls'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Fouls: home={home_int}, away={away_int}")
                                                elif 'corner' in stat_name:
                                                    match_data['team_stats']['home']['corners'] = home_int
                                                    match_data['team_stats']['away']['corners'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Corners: home={home_int}, away={away_int}")
                                                elif 'cross' in stat_name:
                                                    match_data['team_stats']['home']['crosses'] = home_int
                                                    match_data['team_stats']['away']['crosses'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Crosses: home={home_int}, away={away_int}")
                                                elif 'touch' in stat_name:
                                                    match_data['team_stats']['home']['touches'] = home_int
                                                    match_data['team_stats']['away']['touches'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Touches: home={home_int}, away={away_int}")
                                                elif 'tackle' in stat_name:
                                                    match_data['team_stats']['home']['tackles'] = home_int
                                                    match_data['team_stats']['away']['tackles'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Tackles: home={home_int}, away={away_int}")
                                                elif 'interception' in stat_name:
                                                    match_data['team_stats']['home']['interceptions'] = home_int
                                                    match_data['team_stats']['away']['interceptions'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Interceptions: home={home_int}, away={away_int}")
                                                elif 'aerial' in stat_name:
                                                    match_data['team_stats']['home']['aerials_won'] = home_int
                                                    match_data['team_stats']['away']['aerials_won'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Aerials Won: home={home_int}, away={away_int}")
                                                elif 'clearance' in stat_name:
                                                    match_data['team_stats']['home']['clearances'] = home_int
                                                    match_data['team_stats']['away']['clearances'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Clearances: home={home_int}, away={away_int}")
                                                elif 'offside' in stat_name:
                                                    match_data['team_stats']['home']['offsides'] = home_int
                                                    match_data['team_stats']['away']['offsides'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Offsides: home={home_int}, away={away_int}")
                                                elif 'goal kick' in stat_name:
                                                    match_data['team_stats']['home']['goal_kicks'] = home_int
                                                    match_data['team_stats']['away']['goal_kicks'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Goal Kicks: home={home_int}, away={away_int}")
                                                elif 'throw in' in stat_name:
                                                    match_data['team_stats']['home']['throw_ins'] = home_int
                                                    match_data['team_stats']['away']['throw_ins'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Throw Ins: home={home_int}, away={away_int}")
                                                elif 'long ball' in stat_name:
                                                    match_data['team_stats']['home']['long_balls'] = home_int
                                                    match_data['team_stats']['away']['long_balls'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Long Balls: home={home_int}, away={away_int}")
                                                elif 'yellow card' in stat_name or ('card' in stat_name and 'yellow' in stat_name):
                                                    match_data['team_stats']['home']['yellow_cards'] = home_int
                                                    match_data['team_stats']['away']['yellow_cards'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Yellow Cards: home={home_int}, away={away_int}")
                                                elif 'red card' in stat_name or ('card' in stat_name and 'red' in stat_name):
                                                    match_data['team_stats']['home']['red_cards'] = home_int
                                                    match_data['team_stats']['away']['red_cards'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Red Cards: home={home_int}, away={away_int}")
                                        except Exception as e:
                                            logger.debug(f"      Error processing tbody row: {e}")
                                            continue
                            
                            # Fallback: Extract stats from all rows (alternating structure)
                            if not stats_extracted_from_table:
                                logger.info(f"    Fallback: Using alternating row structure")
                                # Structure: Row 1 = team names, then alternating: stat name (1 col), values (2 cols)
                                all_rows = team_names_table.find_elements(By.XPATH, ".//tr")
                                logger.info(f"    Processing {len(all_rows)} rows from team names table")
                                
                                current_stat_name = None
                                for row_idx, row in enumerate(all_rows[1:], 1):  # Skip Row 1 (team names)
                                    try:
                                        cells = row.find_elements(By.XPATH, ".//td | .//th")
                                        if len(cells) == 0:
                                            continue
                                        
                                        # If row has 1 cell, it's a stat name row
                                        if len(cells) == 1:
                                            current_stat_name = cells[0].text.strip().lower()
                                            logger.info(f"    DEBUG: Found stat name: '{current_stat_name}'")
                                        # If row has 2 cells, it's a values row for the previous stat
                                        elif len(cells) == 2 and current_stat_name:
                                            # Get values from the 2 cells
                                            col1_value = cells[0].text.strip()
                                            col2_value = cells[1].text.strip()
                                            
                                            logger.debug(f"    DEBUG: Processing stat '{current_stat_name}': col1='{col1_value}', col2='{col2_value}'")
                                            
                                            # Map to home/away based on column order from Row 1
                                            if col1_is_home:
                                                home_value = col1_value
                                                away_value = col2_value
                                            else:
                                                home_value = col2_value
                                                away_value = col1_value
                                            
                                            # Extract numeric values (remove % and other non-digits)
                                            home_num = re.sub(r'[^\d]', '', home_value)
                                            away_num = re.sub(r'[^\d]', '', away_value)
                                            
                                            if home_num.isdigit() and away_num.isdigit():
                                                home_int = int(home_num)
                                                away_int = int(away_num)
                                                
                                                # Map stat names
                                                if 'foul' in current_stat_name:
                                                    match_data['team_stats']['home']['fouls'] = home_int
                                                    match_data['team_stats']['away']['fouls'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Fouls: home={home_int}, away={away_int}")
                                                elif 'corner' in current_stat_name:
                                                    match_data['team_stats']['home']['corners'] = home_int
                                                    match_data['team_stats']['away']['corners'] = away_int
                                                    stats_extracted_from_table = True
                                                    logger.info(f"    DEBUG: ✓ Extracted Corners: home={home_int}, away={away_int}")
                                            elif 'cross' in current_stat_name:
                                                match_data['team_stats']['home']['crosses'] = home_int
                                                match_data['team_stats']['away']['crosses'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Crosses: home={home_int}, away={away_int}")
                                            elif 'touch' in current_stat_name:
                                                match_data['team_stats']['home']['touches'] = home_int
                                                match_data['team_stats']['away']['touches'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Touches: home={home_int}, away={away_int}")
                                            elif 'tackle' in current_stat_name:
                                                match_data['team_stats']['home']['tackles'] = home_int
                                                match_data['team_stats']['away']['tackles'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Tackles: home={home_int}, away={away_int}")
                                            elif 'interception' in current_stat_name:
                                                match_data['team_stats']['home']['interceptions'] = home_int
                                                match_data['team_stats']['away']['interceptions'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Interceptions: home={home_int}, away={away_int}")
                                            elif 'aerial' in current_stat_name:
                                                match_data['team_stats']['home']['aerials_won'] = home_int
                                                match_data['team_stats']['away']['aerials_won'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Aerials Won: home={home_int}, away={away_int}")
                                            elif 'clearance' in current_stat_name:
                                                match_data['team_stats']['home']['clearances'] = home_int
                                                match_data['team_stats']['away']['clearances'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Clearances: home={home_int}, away={away_int}")
                                            elif 'offside' in current_stat_name:
                                                match_data['team_stats']['home']['offsides'] = home_int
                                                match_data['team_stats']['away']['offsides'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Offsides: home={home_int}, away={away_int}")
                                            elif 'goal kick' in current_stat_name:
                                                match_data['team_stats']['home']['goal_kicks'] = home_int
                                                match_data['team_stats']['away']['goal_kicks'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Goal Kicks: home={home_int}, away={away_int}")
                                            elif 'throw in' in current_stat_name:
                                                match_data['team_stats']['home']['throw_ins'] = home_int
                                                match_data['team_stats']['away']['throw_ins'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Throw Ins: home={home_int}, away={away_int}")
                                            elif 'long ball' in current_stat_name:
                                                match_data['team_stats']['home']['long_balls'] = home_int
                                                match_data['team_stats']['away']['long_balls'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Long Balls: home={home_int}, away={away_int}")
                                            elif 'yellow card' in current_stat_name:
                                                match_data['team_stats']['home']['yellow_cards'] = home_int
                                                match_data['team_stats']['away']['yellow_cards'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Yellow Cards: home={home_int}, away={away_int}")
                                            elif 'red card' in current_stat_name:
                                                match_data['team_stats']['home']['red_cards'] = home_int
                                                match_data['team_stats']['away']['red_cards'] = away_int
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted Red Cards: home={home_int}, away={away_int}")
                                    
                                    except Exception as e:
                                        logger.debug(f"      Error processing stat row: {e}")
                                        continue
                                
                                if stats_extracted_from_table:
                                    logger.info(f"    ✓ Successfully extracted team stats directly from team names table")
                        except Exception as e:
                            logger.debug(f"    Error extracting directly from team names table: {e}")
                    
                    # Only continue with other tables if we didn't extract from team names table
                    if not stats_extracted_from_table:
                        for table_idx, table in enumerate(tables_to_process):
                            try:
                            # Log which table we're processing
                                table_id = table.get_attribute('id') or 'no-id'
                                logger.info(f"    Processing table {table_idx+1}/{len(team_stats_tables)}: id='{table_id[:30]}'")
                            
                            # DEBUG: Log all rows in this table to find where team names are
                                if table_idx == 0:  # Only for first table
                                    all_table_rows = table.find_elements(By.XPATH, ".//tr")
                                    logger.info(f"    DEBUG: Table has {len(all_table_rows)} rows")
                                    for row_idx, tr in enumerate(all_table_rows[:10]):
                                        cells = tr.find_elements(By.XPATH, ".//th | .//td")
                                        cell_texts = [c.text.strip()[:20] for c in cells[:5]]
                                        if any('liverpool' in txt.lower() or 'bournemouth' in txt.lower() for txt in cell_texts):
                                            logger.info(f"    DEBUG: Row {row_idx+1} contains team names: {cell_texts}")
                            
                            # Get header row - try to find the row that contains team names
                            # First use the team_names_row we found earlier, then try Row 1, then thead, then search
                                header_row = None
                            
                            # Try -1: Use the team_names_row we found in initial inspection (most reliable)
                            # Check if this is the table with team names by comparing with the original table list
                                is_team_names_table = False
                                if team_names_table_idx is not None:
                                # Find the original index of this table in team_stats_tables
                                    try:
                                        original_idx = team_stats_tables.index(table)
                                        if original_idx == team_names_table_idx:
                                            is_team_names_table = True
                                    except:
                                    # If table not found in original list, check if it's in tables_with_team_names
                                        if any(t[1] == table for t in tables_with_team_names):
                                            is_team_names_table = True
                            
                                if is_team_names_table and team_names_row:
                                    header_row = team_names_row
                                    logger.info(f"    Using pre-found team names row: {[c.text.strip()[:20] for c in header_row[:5]]}")
                            
                            # Try 0: Check Row 1 first (most reliable - we know this is where team names are)
                                if not header_row:
                                    try:
                                        first_row = table.find_element(By.XPATH, ".//tr[1]")
                                    # Try th first, then td if th doesn't work
                                        ths = first_row.find_elements(By.XPATH, ".//th")
                                        if len(ths) < 3:
                                        # Try td elements
                                            tds = first_row.find_elements(By.XPATH, ".//td")
                                            if len(tds) >= 3:
                                            # Use td elements as headers
                                                ths = tds
                                    
                                        if len(ths) >= 3:
                                            header_texts = [th.text.strip() for th in ths]
                                            header_texts_lower = [txt.lower() for txt in header_texts]
                                            logger.info(f"    DEBUG: Row 1 header texts (first 5): {header_texts[:5]}")
                                            col1_txt = header_texts_lower[1] if len(header_texts_lower) > 1 else ""
                                            col2_txt = header_texts_lower[2] if len(header_texts_lower) > 2 else ""
                                        
                                        # Also try getting text from inner elements (links, spans, etc.)
                                        # Team names are often in <a> tags
                                            if not col1_txt or col1_txt not in ['liverpool', 'bournemouth']:
                                                try:
                                                    inner_elem = ths[1].find_element(By.XPATH, ".//a | .//span | .//strong | .//*[text()]")
                                                    col1_txt = inner_elem.text.strip().lower()
                                                    logger.info(f"    DEBUG: Got col1 from inner element: '{col1_txt}'")
                                                except:
                                                # Try getting all text from the cell
                                                    col1_txt = ths[1].get_attribute('textContent').strip().lower() if ths[1].get_attribute('textContent') else col1_txt
                                            if not col2_txt or col2_txt not in ['liverpool', 'bournemouth']:
                                                try:
                                                    inner_elem = ths[2].find_element(By.XPATH, ".//a | .//span | .//strong | .//*[text()]")
                                                    col2_txt = inner_elem.text.strip().lower()
                                                    logger.info(f"    DEBUG: Got col2 from inner element: '{col2_txt}'")
                                                except:
                                                # Try getting all text from the cell
                                                    col2_txt = ths[2].get_attribute('textContent').strip().lower() if ths[2].get_attribute('textContent') else col2_txt
                                        
                                            logger.info(f"    DEBUG: Row 1 extracted: col1='{col1_txt}', col2='{col2_txt}'")
                                        
                                            home_in_col1 = home_team_name and (home_team_name in col1_txt or col1_txt in home_team_name or 
                                                                              any(word in col1_txt for word in home_team_name.split() if len(word) > 3))
                                            home_in_col2 = home_team_name and (home_team_name in col2_txt or col2_txt in home_team_name or
                                                                              any(word in col2_txt for word in home_team_name.split() if len(word) > 3))
                                            away_in_col1 = away_team_name and (away_team_name in col1_txt or col1_txt in away_team_name or
                                                                              any(word in col1_txt for word in away_team_name.split() if len(word) > 3))
                                            away_in_col2 = away_team_name and (away_team_name in col2_txt or col2_txt in away_team_name or
                                                                              any(word in col2_txt for word in away_team_name.split() if len(word) > 3))
                                        
                                            if (home_in_col1 and away_in_col2) or (home_in_col2 and away_in_col1):
                                                header_row = ths
                                                logger.info(f"    Found header row in Row 1 with team names: col1='{header_texts[1] if len(header_texts) > 1 else col1_txt}', col2='{header_texts[2] if len(header_texts) > 2 else col2_txt}'")
                                    except Exception as e:
                                        logger.debug(f"    Error checking Row 1: {e}")
                                        pass
                            
                            # Try 1: Look in thead - find row with BOTH team names as separate columns
                                try:
                                    thead_rows = table.find_elements(By.XPATH, ".//thead//tr")
                                    for tr in thead_rows:
                                        ths = tr.find_elements(By.XPATH, ".//th")
                                        if len(ths) >= 3:
                                        # Check if this row contains BOTH team names as separate columns
                                            header_texts = [th.text.strip() for th in ths]  # Keep original case for exact matching
                                            header_texts_lower = [txt.lower() for txt in header_texts]
                                        
                                        # Look for team names in columns 1 and 2 (after "Stat" column)
                                        # The team stats table should have: [Stat, Team1, Team2, ...]
                                            if len(ths) >= 3:
                                                col1_txt = header_texts_lower[1] if len(header_texts_lower) > 1 else ""
                                                col2_txt = header_texts_lower[2] if len(header_texts_lower) > 2 else ""
                                            
                                            # Check if col1 and col2 contain the team names (exact or partial match)
                                                home_in_col1 = home_team_name and (home_team_name in col1_txt or col1_txt in home_team_name or 
                                                                                  any(word in col1_txt for word in home_team_name.split() if len(word) > 3))
                                                home_in_col2 = home_team_name and (home_team_name in col2_txt or col2_txt in home_team_name or
                                                                                  any(word in col2_txt for word in home_team_name.split() if len(word) > 3))
                                                away_in_col1 = away_team_name and (away_team_name in col1_txt or col1_txt in away_team_name or
                                                                                  any(word in col1_txt for word in away_team_name.split() if len(word) > 3))
                                                away_in_col2 = away_team_name and (away_team_name in col2_txt or col2_txt in away_team_name or
                                                                                  any(word in col2_txt for word in away_team_name.split() if len(word) > 3))
                                            
                                            # Team names should be in col1 and col2 (one in each)
                                                if (home_in_col1 and away_in_col2) or (home_in_col2 and away_in_col1):
                                                    header_row = ths
                                                    logger.info(f"    Found header row in thead with team names in columns: col1='{header_texts[1]}', col2='{header_texts[2]}'")
                                                    break
                                except Exception as e:
                                    logger.debug(f"    Error searching thead: {e}")
                                    pass
                            
                            # Try 2: Look in first few rows of tbody or table - find row with BOTH team names
                                if not header_row:
                                    try:
                                        all_rows = table.find_elements(By.XPATH, ".//tr")
                                        for tr in all_rows[:10]:  # Check first 10 rows
                                            ths = tr.find_elements(By.XPATH, ".//th")
                                            if len(ths) >= 3:
                                                header_texts = [th.text.strip() for th in ths]
                                                header_texts_lower = [txt.lower() for txt in header_texts]
                                            
                                            # Look for team names in columns 1 and 2
                                                if len(ths) >= 3:
                                                    col1_txt = header_texts_lower[1] if len(header_texts_lower) > 1 else ""
                                                    col2_txt = header_texts_lower[2] if len(header_texts_lower) > 2 else ""
                                                
                                                    home_in_col1 = home_team_name and (home_team_name in col1_txt or col1_txt in home_team_name or 
                                                                                      any(word in col1_txt for word in home_team_name.split() if len(word) > 3))
                                                    home_in_col2 = home_team_name and (home_team_name in col2_txt or col2_txt in home_team_name or
                                                                                      any(word in col2_txt for word in home_team_name.split() if len(word) > 3))
                                                    away_in_col1 = away_team_name and (away_team_name in col1_txt or col1_txt in away_team_name or
                                                                                      any(word in col1_txt for word in away_team_name.split() if len(word) > 3))
                                                    away_in_col2 = away_team_name and (away_team_name in col2_txt or col2_txt in away_team_name or
                                                                                      any(word in col2_txt for word in away_team_name.split() if len(word) > 3))
                                                
                                                    if (home_in_col1 and away_in_col2) or (home_in_col2 and away_in_col1):
                                                        header_row = ths
                                                        logger.info(f"    Found header row in table body with team names in columns: col1='{header_texts[1]}', col2='{header_texts[2]}'")
                                                        break
                                    except Exception as e:
                                        logger.debug(f"    Error searching table body: {e}")
                                        pass
                            
                            # Try 3: Fallback to first row with th elements
                                if not header_row:
                                    header_row = table.find_elements(By.XPATH, ".//thead//tr//th | .//tr[1]//th")
                            
                                if not header_row or len(header_row) < 3:
                                    logger.debug(f"    Skipping table - no valid header row found")
                                    continue
                            
                            # Get team names from headers (skip first "Stat" column)
                                col1_name = header_row[1].text.strip().lower() if len(header_row) > 1 else ""
                                col2_name = header_row[2].text.strip().lower() if len(header_row) > 2 else ""
                            
                            # Log all headers for debugging
                                all_headers = [h.text.strip() for h in header_row]
                                logger.info(f"    Table header row ({len(header_row)} columns): {all_headers[:5]}...")
                                logger.info(f"    Checking columns: col1='{col1_name}', col2='{col2_name}'")
                                logger.info(f"    Expected teams: home='{home_team_name}', away='{away_team_name}'")
                            
                            # CRITICAL: Skip this table if it doesn't have team names in the header
                            # Check if either column contains team names
                                has_team_in_header = (
                                    (home_team_name and (home_team_name in col1_name or home_team_name in col2_name)) or
                                    (away_team_name and (away_team_name in col1_name or away_team_name in col2_name)) or
                                    any(home_team_name.split()[0] in h.text.lower() if len(home_team_name.split()) > 0 else False for h in header_row if h.text.strip()) or
                                    any(away_team_name.split()[0] in h.text.lower() if len(away_team_name.split()) > 0 else False for h in header_row if h.text.strip())
                                )
                            
                                if not has_team_in_header:
                                    logger.debug(f"    Skipping table - no team names found in header (col1='{col1_name}', col2='{col2_name}')")
                                    continue
                            
                                logger.info(f"    ✓ Table has team names in header - processing...")
                            
                            # Determine which column is home and which is away
                                col1_is_home = False
                                col2_is_home = False
                            
                            # More flexible team name matching
                                def team_name_matches(team_name, header_text):
                                    if not team_name or not header_text:
                                        return False
                                # Exact match
                                    if team_name == header_text:
                                        return True
                                # Contains match
                                    if team_name in header_text or header_text in team_name:
                                        return True
                                # Word-based matching (for multi-word team names)
                                    team_words = [w for w in team_name.split() if len(w) > 3]
                                    header_words = [w for w in header_text.split() if len(w) > 3]
                                    if team_words and any(tw in header_text for tw in team_words):
                                        return True
                                    if header_words and any(hw in team_name for hw in header_words):
                                        return True
                                    return False
                            
                            # Check if home team name matches column 1
                                if team_name_matches(home_team_name, col1_name):
                                    col1_is_home = True
                                    logger.debug(f"    Matched home team '{home_team_name}' to col1 '{col1_name}'")
                            
                            # Check if home team name matches column 2
                                if team_name_matches(home_team_name, col2_name):
                                    col2_is_home = True
                                    logger.debug(f"    Matched home team '{home_team_name}' to col2 '{col2_name}'")
                            
                            # If we couldn't determine, default to col1=home, col2=away
                                if not col1_is_home and not col2_is_home:
                                    col1_is_home = True
                                    logger.info(f"    Could not verify column order from headers, defaulting to col1=home, col2=away")
                                else:
                                    logger.info(f"    ✓ Team Stats table verified: col1='{col1_name}' (home={col1_is_home}), col2='{col2_name}' (home={col2_is_home})")
                            
                            # Extract stats from table rows
                                stat_rows = table.find_elements(By.XPATH, ".//tbody//tr | .//tr[position()>1]")
                                logger.info(f"    DEBUG: Processing {len(stat_rows)} stat rows from table with headers {header_texts[:3]}")
                                for row_idx, row in enumerate(stat_rows):
                                    try:
                                        cells = row.find_elements(By.XPATH, ".//td")
                                        if len(cells) < 3:
                                            continue
                                    
                                        stat_name_cell = cells[0]
                                        stat_name = stat_name_cell.text.strip().lower()
                                    
                                    # Get values from columns 1 and 2 (skip stat name in column 0)
                                        col1_value = cells[1].text.strip() if len(cells) > 1 else ""
                                        col2_value = cells[2].text.strip() if len(cells) > 2 else ""
                                    
                                    # Debug log for first few rows
                                        if row_idx < 5:
                                            logger.info(f"    DEBUG: Row {row_idx+1}: stat='{stat_name}', col1='{col1_value}', col2='{col2_value}'")
                                    
                                    # Map to home/away based on column order
                                        if col1_is_home:
                                            home_value = col1_value
                                            away_value = col2_value
                                        else:
                                            home_value = col2_value
                                            away_value = col1_value
                                    
                                    # Extract numeric values (remove non-digits)
                                        home_num = re.sub(r'[^\d]', '', home_value)
                                        away_num = re.sub(r'[^\d]', '', away_value)
                                    
                                        if not home_num or not away_num:
                                            continue
                                    
                                        if home_num.isdigit() and away_num.isdigit():
                                            home_int = int(home_num)
                                            away_int = int(away_num)
                                        
                                        # Map stat names to team_stats keys
                                            stat_extracted = False
                                            if 'foul' in stat_name:
                                                match_data['team_stats']['home']['fouls'] = home_int
                                                match_data['team_stats']['away']['fouls'] = away_int
                                                logger.debug(f"      Extracted Fouls: {home_int}-{away_int}")
                                                stat_extracted = True
                                            elif 'corner' in current_stat_name:
                                                match_data['team_stats']['home']['corners'] = home_int
                                                match_data['team_stats']['away']['corners'] = away_int
                                                logger.debug(f"      Extracted Corners: {home_int}-{away_int}")
                                                stat_extracted = True
                                            elif 'cross' in current_stat_name:
                                                match_data['team_stats']['home']['crosses'] = home_int
                                                match_data['team_stats']['away']['crosses'] = away_int
                                                logger.debug(f"      Extracted Crosses: {home_int}-{away_int}")
                                                stat_extracted = True
                                            elif 'touch' in current_stat_name:
                                                match_data['team_stats']['home']['touches'] = home_int
                                                match_data['team_stats']['away']['touches'] = away_int
                                                logger.debug(f"      Extracted Touches: {home_int}-{away_int}")
                                                stat_extracted = True
                                            elif 'tackle' in current_stat_name:
                                                match_data['team_stats']['home']['tackles'] = home_int
                                                match_data['team_stats']['away']['tackles'] = away_int
                                                logger.debug(f"      Extracted Tackles: {home_int}-{away_int}")
                                                stat_extracted = True
                                            elif 'interception' in current_stat_name:
                                                match_data['team_stats']['home']['interceptions'] = home_int
                                                match_data['team_stats']['away']['interceptions'] = away_int
                                                logger.debug(f"      Extracted Interceptions: {home_int}-{away_int}")
                                                stat_extracted = True
                                            elif 'aerial' in current_stat_name:
                                                match_data['team_stats']['home']['aerials_won'] = home_int
                                                match_data['team_stats']['away']['aerials_won'] = away_int
                                                logger.debug(f"      Extracted Aerials Won: {home_int}-{away_int}")
                                                stat_extracted = True
                                            elif 'clearance' in current_stat_name:
                                                match_data['team_stats']['home']['clearances'] = home_int
                                                match_data['team_stats']['away']['clearances'] = away_int
                                                logger.debug(f"      Extracted Clearances: {home_int}-{away_int}")
                                                stat_extracted = True
                                            elif 'offside' in current_stat_name:
                                                match_data['team_stats']['home']['offsides'] = home_int
                                                match_data['team_stats']['away']['offsides'] = away_int
                                                logger.debug(f"      Extracted Offsides: {home_int}-{away_int}")
                                                stat_extracted = True
                                            elif 'goal kick' in current_stat_name:
                                                match_data['team_stats']['home']['goal_kicks'] = home_int
                                                match_data['team_stats']['away']['goal_kicks'] = away_int
                                                logger.debug(f"      Extracted Goal Kicks: {home_int}-{away_int}")
                                                stat_extracted = True
                                            elif 'throw in' in current_stat_name:
                                                match_data['team_stats']['home']['throw_ins'] = home_int
                                                match_data['team_stats']['away']['throw_ins'] = away_int
                                                logger.debug(f"      Extracted Throw Ins: {home_int}-{away_int}")
                                                stat_extracted = True
                                            elif 'long ball' in current_stat_name:
                                                match_data['team_stats']['home']['long_balls'] = home_int
                                                match_data['team_stats']['away']['long_balls'] = away_int
                                                logger.debug(f"      Extracted Long Balls: {home_int}-{away_int}")
                                                stat_extracted = True
                                            elif 'yellow card' in current_stat_name:
                                                match_data['team_stats']['home']['yellow_cards'] = home_int
                                                match_data['team_stats']['away']['yellow_cards'] = away_int
                                                logger.debug(f"      Extracted Yellow Cards: {home_int}-{away_int}")
                                                stat_extracted = True
                                            elif 'red card' in current_stat_name:
                                                match_data['team_stats']['home']['red_cards'] = home_int
                                                match_data['team_stats']['away']['red_cards'] = away_int
                                                logger.debug(f"      Extracted Red Cards: {home_int}-{away_int}")
                                                stat_extracted = True
                                        
                                            if stat_extracted:
                                                stats_extracted_from_table = True
                                                logger.info(f"    DEBUG: ✓ Extracted {stat_name}: home={home_int}, away={away_int}")
                                    except Exception as e:
                                        logger.debug(f"      Error processing stat row: {e}")
                                        continue
                            
                                if stats_extracted_from_table:
                                    logger.info(f"    ✓ Successfully extracted team stats from table with team name headers")
                                    break  # Use first matching table
                            except Exception as e:
                                logger.debug(f"    Error processing table: {e}")
                                continue
                except Exception as e:
                    logger.debug(f"    Error extracting from table with team name headers: {e}")
            """
            
            # Method 1.6: Extract from Team Stats visual table (the one with Fouls, Corners, Crosses, etc.)
            # Only run if Method 1.5 didn't successfully extract stats
            # TEMPORARILY DISABLED - testing Method 1.5 first
            if False:  # Temporarily disabled: and not stats_extracted_from_table:
                pass  # Method 1.6 temporarily disabled to test Method 1.5
                # Original Method 1.6 code commented out below
                # try:
                #     team_stats_heading = driver.find_elements(By.XPATH, "//h2[contains(text(), 'Team Stats')]")
                #     if team_stats_heading:
                #         # First, extract from visual bar charts (Possession, Passing Accuracy, Shots on Target, Saves, Cards)
                #         # These are in rows with <th colspan="2">Stat Name</th> followed by rows with percentages/values
                #         team_stats_container = team_stats_heading[0].find_element(By.XPATH, "./following::table[1]")
                        # visual_rows = team_stats_container.find_elements(By.XPATH, ".//tr")
                        
                        # current_stat_name = None
                        # for row in visual_rows:
                            # Check if this is a stat name row
                            # stat_name_cell = row.find_elements(By.XPATH, ".//th[@colspan='2']")
                            # if stat_name_cell:
                                # current_stat_name = stat_name_cell[0].text.strip().lower()
                                
                                # Get the next row which has the values
                                # try:
                                    # next_row = row.find_element(By.XPATH, "./following-sibling::tr[1]")
                                    # value_cells = next_row.find_elements(By.XPATH, ".//td")
                                    
                                    # if len(value_cells) >= 2:
                                        # home_text = value_cells[0].text.strip()
                                        # away_text = value_cells[1].text.strip()
                                        
                                        # Extract percentages for possession, passing accuracy
                                        # if 'possession' in current_stat_name:
                                            # home_pct = re.search(r'(\d+(?:\.\d+)?)%', home_text)
                                            # away_pct = re.search(r'(\d+(?:\.\d+)?)%', away_text)
                                            # if home_pct and away_pct:
                                                # match_data['team_stats']['home']['possession'] = float(home_pct.group(1))
                                                # match_data['team_stats']['away']['possession'] = float(away_pct.group(1))
                                        
                                        # Extract passing accuracy (format: "430 of 539 passes (80%)")
                                        # elif 'passing' in current_stat_name and 'accuracy' in current_stat_name:
                                            # home_pct = re.search(r'\((\d+(?:\.\d+)?)%\)', home_text)
                                            # away_pct = re.search(r'\((\d+(?:\.\d+)?)%\)', away_text)
                                            # if home_pct and away_pct:
                                                # match_data['team_stats']['home']['passing_accuracy'] = float(home_pct.group(1))
                                                # match_data['team_stats']['away']['passing_accuracy'] = float(away_pct.group(1))
                                            
                                            # Also extract passes completed and attempted
                                            # home_passes = re.search(r'(\d+)\s+of\s+(\d+)', home_text)
                                            # away_passes = re.search(r'(\d+)\s+of\s+(\d+)', away_text)
                                            # if home_passes and away_passes:
                                                # match_data['team_stats']['home']['passes_completed'] = int(home_passes.group(1))
                                                # match_data['team_stats']['home']['passes_attempted'] = int(home_passes.group(2))
                                                # match_data['team_stats']['away']['passes_completed'] = int(away_passes.group(1))
                                                # match_data['team_stats']['away']['passes_attempted'] = int(away_passes.group(2))
                                        
                                        # Extract shots on target (format: "10 of 19 shots (53%)")
                                        # elif 'shot' in current_stat_name and 'target' in current_stat_name:
                                        # home_shots = re.search(r'(\d+)\s+of\s+(\d+)', home_text)
                                        # away_shots = re.search(r'(\d+)\s+of\s+(\d+)', away_text)
                                        # if home_shots and away_shots:
                                            # match_data['team_stats']['home']['shots_on_target'] = int(home_shots.group(1))
                                            # match_data['team_stats']['home']['shots'] = int(home_shots.group(2))
                                            # match_data['team_stats']['away']['shots_on_target'] = int(away_shots.group(1))
                                            # match_data['team_stats']['away']['shots'] = int(away_shots.group(2))
                                    
                                    # Extract saves (format: "1 of 3 saves (33%)")
                                    # elif 'save' in current_stat_name:
                                        # home_saves = re.search(r'(\d+)\s+of\s+(\d+)', home_text)
                                        # away_saves = re.search(r'(\d+)\s+of\s+(\d+)', away_text)
                                        # if home_saves and away_saves:
                                            # match_data['team_stats']['home']['saves'] = int(home_saves.group(1))
                                            # match_data['team_stats']['away']['saves'] = int(away_saves.group(1))
                                    
                                    # Extract cards (format: contains yellow_card and red_card spans)
                                    # elif 'card' in current_stat_name:
                                        # Verify column order for cards table using the header row
                                        # cards_left_is_home = True  # Default
                                        # try:
                                            # Get team names from scorebox (most reliable)
                                            # if not scorebox_home_name or not scorebox_away_name:
                                                # Fallback to match_data
                                                # scorebox_home_name = match_data.get('home_team', {}).get('name', '').lower()
                                                # scorebox_away_name = match_data.get('away_team', {}).get('name', '').lower()
                                            
                                            # Check header row of the main table (first row with team names)
                                            # header_row = team_stats_container.find_elements(By.XPATH, ".//tr[1]//th")
                                            # if len(header_row) >= 2:
                                                # left_header = header_row[0].text.strip().lower()
                                                # right_header = header_row[-1].text.strip().lower()
                                                
                                                # logger.debug(f"      Cards table header: left='{left_header}', right='{right_header}'")
                                                # logger.debug(f"      Expected: home='{scorebox_home_name}', away='{scorebox_away_name}'")
                                                
                                                # Check if home team is in right column
                                                # home_in_left = (scorebox_home_name in left_header or 
                                                               # any(w in left_header for w in scorebox_home_name.split() if len(w) > 3) or
                                                               # left_header in scorebox_home_name)
                                                # home_in_right = (scorebox_home_name in right_header or 
                                                                # any(w in right_header for w in scorebox_home_name.split() if len(w) > 3) or
                                                                # right_header in scorebox_home_name)
                                                
                                                # if home_in_right and not home_in_left:
                                                    # cards_left_is_home = False
                                                    # logger.debug(f"      Cards: Detected swapped columns (home in right)")
                                                # elif home_in_left:
                                                    # cards_left_is_home = True
                                                    # logger.debug(f"      Cards: Confirmed left=home")
                                        # except Exception as e:
                                        #     logger.debug(f"      Cards: Could not verify column order: {e}")
                                        
                                        # Count yellow and red card spans in each cell, using verified column order
                                        # if cards_left_is_home:
                                            # home_yellow = len(value_cells[0].find_elements(By.XPATH, ".//span[contains(@class, 'yellow_card')]"))
                                            # home_red = len(value_cells[0].find_elements(By.XPATH, ".//span[contains(@class, 'red_card')]"))
                                            # away_yellow = len(value_cells[1].find_elements(By.XPATH, ".//span[contains(@class, 'yellow_card')]"))
                                            # away_red = len(value_cells[1].find_elements(By.XPATH, ".//span[contains(@class, 'red_card')]"))
                                        # else:
                                            # Columns are swapped
                                            # away_yellow = len(value_cells[0].find_elements(By.XPATH, ".//span[contains(@class, 'yellow_card')]"))
                                            # away_red = len(value_cells[0].find_elements(By.XPATH, ".//span[contains(@class, 'red_card')]"))
                                            # home_yellow = len(value_cells[1].find_elements(By.XPATH, ".//span[contains(@class, 'yellow_card')]"))
                                            # home_red = len(value_cells[1].find_elements(By.XPATH, ".//span[contains(@class, 'red_card')]"))
                                        
                                        # match_data['team_stats']['home']['yellow_cards'] = home_yellow
                                        # match_data['team_stats']['home']['red_cards'] = home_red
                                        # match_data['team_stats']['away']['yellow_cards'] = away_yellow
                                        # match_data['team_stats']['away']['red_cards'] = away_red
                                        # logger.info(f"      ✓ Extracted Cards: home={home_yellow}Y/{home_red}R, away={away_yellow}Y/{away_red}R (left_is_home={cards_left_is_home})")
                            # except:
                                # pass
                            # continue
                    
                    # Extract from the detailed stats section (3-column format: left=home, middle=stat name, right=away)
                    # Structure: <div><div>Home Value</div><div>Stat Name</div><div>Away Value</div></div>
                    # IMPORTANT: Verify column order by checking for team names or IDs in the table structure
                    # try:
                        # Find the table after the heading
                        # team_stats_table = team_stats_heading[0].find_element(By.XPATH, "./following::table[1]")
                        
                        # Verify which column is home vs away using scorebox team order
                        # sb_team_0 is ALWAYS home, sb_team_1 is ALWAYS away
                        # We can use this to verify the Team Stats table column order
                        # left_is_home = True  # Default assumption: left = home
                        # try:
                            # First, get the actual team names from scorebox (most reliable)
                            # scorebox_home_name = None
                            # scorebox_away_name = None
                            # try:
                                # sb_team_0 = driver.find_element(By.ID, "sb_team_0")
                                # sb_team_1 = driver.find_element(By.ID, "sb_team_1")
                                
                                # Get team name from the link or strong tag (more reliable than text)
                                # try:
                                    # home_link = sb_team_0.find_element(By.XPATH, ".//a[contains(@href, '/squads/')]")
                                    # scorebox_home_name = home_link.text.strip().lower()
                                # except:
                                    # scorebox_home_name = sb_team_0.text.strip().lower()
                                    # Remove score and other text
                                    # scorebox_home_name = re.sub(r'\d+.*', '', scorebox_home_name).strip()
                                
                                # try:
                                    # away_link = sb_team_1.find_element(By.XPATH, ".//a[contains(@href, '/squads/')]")
                                    # scorebox_away_name = away_link.text.strip().lower()
                                # except:
                                    # scorebox_away_name = sb_team_1.text.strip().lower()
                                    # Remove score and other text
                                    # scorebox_away_name = re.sub(r'\d+.*', '', scorebox_away_name).strip()
                                
                                # logger.info(f"    Scorebox teams: home='{scorebox_home_name}' (sb_team_0), away='{scorebox_away_name}' (sb_team_1)")
                            # except Exception as e:
                                # logger.debug(f"    Could not get scorebox teams: {e}")
                                # Fallback to match_data
                                # scorebox_home_name = match_data.get('home_team', {}).get('name', '').lower()
                                # scorebox_away_name = match_data.get('away_team', {}).get('name', '').lower()
                                # logger.debug(f"    Using match_data teams: home='{scorebox_home_name}', away='{scorebox_away_name}'")
                            
                            # Look for the header row with team names - fbref uses <div class="th">Team Name</div>
                            # Structure: <div class="th">Home Team</div><div class="th">&nbsp;</div><div class="th">Away Team</div>
                            # fbref visual team stats: left column = home, right column = away. Force this mapping.
                            # left_is_home = True
                        # except Exception as e:
                            # logger.debug(f"    Could not verify column order: {e}")
                            # left_is_home = True
                        
                        # The team_stats_extra structure has multiple <div> containers
                        # Each container has: header row (team names) + stat rows
                        # Structure: <div id="team_stats_extra">
                        #   <div>
                        #     <div class="th">Home Team</div><div class="th">&nbsp;</div><div class="th">Away Team</div>
                        #     <div>7</div><div>Fouls</div><div>10</div>
                        #     <div>6</div><div>Corners</div><div>7</div>
                        #     ...
                        #   </div>
                        #   <div>...</div>  (more stat groups)
                        # </div>
                        
                        # Find team_stats_extra div (the 3-column visual table)
                        # try:
                            # team_stats_extra = driver.find_element(By.ID, "team_stats_extra")
                        # except:
                            # team_stats_extra = team_stats_table
                        
                        # Get all top-level div containers (each is a group of stats)
                        # stat_groups = team_stats_extra.find_elements(By.XPATH, "./div")
                        
                        # logger.debug(f"    Found {len(stat_groups)} stat groups in team_stats_extra")
                        
                        # for group_idx, stat_group in enumerate(stat_groups):
                            # try:
                                # Get all direct child divs of this group
                                # all_child_divs = stat_group.find_elements(By.XPATH, "./div")
                                
                                # fbref visual team stats: left=home, right=away. Force this per group.
                                # group_left_is_home = True
                                
                                # Skip header row divs, process stat rows
                                # Stat rows can be either:
                                # 1. One div with 3 child divs: <div><div>7</div><div>Fouls</div><div>10</div></div>
                                # 2. Three sibling divs: <div>7</div><div>Fouls</div><div>10</div>
                                
                                # First, try to find sequences of 3 consecutive non-header divs
                                # non_header_divs = [d for d in all_child_divs if 'th' not in (d.get_attribute('class') or '').lower()]
                                
                                # Process in groups of 3
                                # for i in range(0, len(non_header_divs) - 2, 3):
                                    # try:
                                        # Get 3 consecutive divs
                                        # div1 = non_header_divs[i]
                                        # div2 = non_header_divs[i + 1] if i + 1 < len(non_header_divs) else None
                                        # div3 = non_header_divs[i + 2] if i + 2 < len(non_header_divs) else None
                                        
                                        # if div2 and div3:
                                            # text1 = div1.text.strip()
                                            # text2 = div2.text.strip()
                                            # text3 = div3.text.strip()
                                            
                                            # Check if this looks like a stat row: [number, stat_name, number]
                                            # Middle one should be text (stat name), outer ones should be numbers
                                            # if text1 and text2 and text3:
                                                # Check if text1 and text3 are numbers, text2 is stat name
                                                # if re.match(r'^\d+$', text1) and re.match(r'^\d+$', text3) and not re.match(r'^\d+$', text2):
                                                    # This is a stat row: [value, stat_name, value]
                                                    # if group_left_is_home:
                                                        # home_value_text = text1
                                                        # stat_name = text2.lower()
                                                        # away_value_text = text3
                                                    # else:
                                                        # away_value_text = text1
                                                        # stat_name = text2.lower()
                                                        # home_value_text = text3
                                                    
                                                    # Extract numeric values
                                                    # home_num = re.sub(r'[^\d]', '', home_value_text)
                                                    # away_num = re.sub(r'[^\d]', '', away_value_text)
                                                    
                                                    # if home_num.isdigit() and away_num.isdigit():
                                                        # home_int = int(home_num)
                                                        # away_int = int(away_num)
                                                        
                                                        # Map stat names (same logic as below)
                                                        # stat_extracted = False
                                                        # if stat_name == 'fouls':
                                                            # match_data['team_stats']['home']['fouls'] = home_int
                                                            # match_data['team_stats']['away']['fouls'] = away_int
                                                            # stat_extracted = True
                                                        # elif stat_name == 'corners':
                                                            # match_data['team_stats']['home']['corners'] = home_int
                                                            # match_data['team_stats']['away']['corners'] = away_int
                                                            # stat_extracted = True
                                                        # elif stat_name == 'crosses':
                                                            # match_data['team_stats']['home']['crosses'] = home_int
                                                            # match_data['team_stats']['away']['crosses'] = away_int
                                                            # stat_extracted = True
                                                        # elif stat_name == 'touches':
                                                            # match_data['team_stats']['home']['touches'] = home_int
                                                            # match_data['team_stats']['away']['touches'] = away_int
                                                            # stat_extracted = True
                                                        # elif stat_name == 'tackles':
                                                            # match_data['team_stats']['home']['tackles'] = home_int
                                                            # match_data['team_stats']['away']['tackles'] = away_int
                                                            # stat_extracted = True
                                                        # elif stat_name == 'interceptions':
                                                            # match_data['team_stats']['home']['interceptions'] = home_int
                                                            # match_data['team_stats']['away']['interceptions'] = away_int
                                                            # stat_extracted = True
                                                        # elif stat_name == 'aerials won' or stat_name == 'aerials':
                                                            # match_data['team_stats']['home']['aerials_won'] = home_int
                                                            # match_data['team_stats']['away']['aerials_won'] = away_int
                                                            # stat_extracted = True
                                                        # elif stat_name == 'clearances':
                                                            # match_data['team_stats']['home']['clearances'] = home_int
                                                            # match_data['team_stats']['away']['clearances'] = away_int
                                                            # stat_extracted = True
                                                        # elif stat_name == 'offsides' or stat_name == 'offside':
                                                            # match_data['team_stats']['home']['offsides'] = home_int
                                                            # match_data['team_stats']['away']['offsides'] = away_int
                                                            # stat_extracted = True
                                                        # elif stat_name == 'goal kicks' or stat_name == 'goal kicks':
                                                            # match_data['team_stats']['home']['goal_kicks'] = home_int
                                                            # match_data['team_stats']['away']['goal_kicks'] = away_int
                                                            # stat_extracted = True
                                                        # elif stat_name == 'throw ins' or stat_name == 'throw ins':
                                                            # match_data['team_stats']['home']['throw_ins'] = home_int
                                                            # match_data['team_stats']['away']['throw_ins'] = away_int
                                                            # stat_extracted = True
                                                        # elif stat_name == 'long balls' or stat_name == 'long balls':
                                                            # match_data['team_stats']['home']['long_balls'] = home_int
                                                            # match_data['team_stats']['away']['long_balls'] = away_int
                                                            # stat_extracted = True
                                                        
                                                        # if stat_extracted:
                                                            # logger.debug(f"      Extracted {stat_name}: {home_int}-{away_int} (left_is_home={group_left_is_home})")
                                    # except Exception as e:
                                        # logger.debug(f"      Error processing stat row at index {i}: {e}")
                                        # continue
                                
                                # Also try the old method: divs with 3 child divs (in case structure is different)
                                # for div in all_child_divs:
                                    # Skip header divs
                                    # if 'th' in (div.get_attribute('class') or '').lower():
                                        # continue
                                    
                                    # Get direct child divs of this div
                                    # child_divs = div.find_elements(By.XPATH, "./div")
                                    # text_divs = [d for d in child_divs if d.text.strip()]
                                    
                                    # Stat rows have exactly 3 child divs: [value, stat_name, value]
                                    # if len(text_divs) == 3:
                                        # Use group-specific column order
                                        # if group_left_is_home:
                                            # home_value_text = text_divs[0].text.strip()
                                            # stat_name = text_divs[1].text.strip().lower()
                                            # away_value_text = text_divs[2].text.strip()
                                        # else:
                                            # Columns are swapped
                                            # away_value_text = text_divs[0].text.strip()
                                            # stat_name = text_divs[1].text.strip().lower()
                                            # home_value_text = text_divs[2].text.strip()
                                        
                                        # Extract numeric values (remove any non-digit characters)
                                        # home_num = re.sub(r'[^\d]', '', home_value_text)
                                        # away_num = re.sub(r'[^\d]', '', away_value_text)
                                        
                                        # if home_num.isdigit() and away_num.isdigit():
                                            # home_int = int(home_num)
                                            # away_int = int(away_num)
                                            
                                            # Map stat names to team_stats keys
                                            # Use exact matches first, then partial matches
                                            # if stat_name == 'fouls':
                                                # match_data['team_stats']['home']['fouls'] = home_int
                                                # match_data['team_stats']['away']['fouls'] = away_int
                                                # logger.debug(f"      Extracted Fouls: {home_int}-{away_int}")
                                            # elif stat_name == 'corners':
                                                # match_data['team_stats']['home']['corners'] = home_int
                                                # match_data['team_stats']['away']['corners'] = away_int
                                                # logger.debug(f"      Extracted Corners: {home_int}-{away_int}")
                                            # elif stat_name == 'crosses':
                                                # match_data['team_stats']['home']['crosses'] = home_int
                                                # match_data['team_stats']['away']['crosses'] = away_int
                                                # logger.debug(f"      Extracted Crosses: {home_int}-{away_int}")
                                            # elif stat_name == 'touches':
                                                # match_data['team_stats']['home']['touches'] = home_int
                                                # match_data['team_stats']['away']['touches'] = away_int
                                                # logger.debug(f"      Extracted Touches: {home_int}-{away_int}")
                                            # elif stat_name == 'tackles':
                                                # match_data['team_stats']['home']['tackles'] = home_int
                                                # match_data['team_stats']['away']['tackles'] = away_int
                                                # logger.debug(f"      Extracted Tackles: {home_int}-{away_int}")
                                            # elif stat_name == 'interceptions':
                                                # match_data['team_stats']['home']['interceptions'] = home_int
                                                # match_data['team_stats']['away']['interceptions'] = away_int
                                                # logger.debug(f"      Extracted Interceptions: {home_int}-{away_int}")
                                            # elif stat_name == 'aerials won' or stat_name == 'aerials':
                                                # match_data['team_stats']['home']['aerials_won'] = home_int
                                                # match_data['team_stats']['away']['aerials_won'] = away_int
                                                # logger.debug(f"      Extracted Aerials Won: {home_int}-{away_int}")
                                            # elif stat_name == 'clearances':
                                                # match_data['team_stats']['home']['clearances'] = home_int
                                                # match_data['team_stats']['away']['clearances'] = away_int
                                                # logger.debug(f"      Extracted Clearances: {home_int}-{away_int}")
                                            # elif stat_name == 'offsides' or stat_name == 'offside':
                                                # match_data['team_stats']['home']['offsides'] = home_int
                                                # match_data['team_stats']['away']['offsides'] = away_int
                                                # logger.debug(f"      Extracted Offsides: {home_int}-{away_int}")
                                            # elif stat_name == 'goal kicks' or stat_name == 'goal kicks':
                                                # match_data['team_stats']['home']['goal_kicks'] = home_int
                                                # match_data['team_stats']['away']['goal_kicks'] = away_int
                                                # logger.debug(f"      Extracted Goal Kicks: {home_int}-{away_int}")
                                            # elif stat_name == 'throw ins' or stat_name == 'throw ins':
                                                # match_data['team_stats']['home']['throw_ins'] = home_int
                                                # match_data['team_stats']['away']['throw_ins'] = away_int
                                                # logger.debug(f"      Extracted Throw Ins: {home_int}-{away_int}")
                                            # elif stat_name == 'long balls' or stat_name == 'long balls':
                                                # match_data['team_stats']['home']['long_balls'] = home_int
                                                # match_data['team_stats']['away']['long_balls'] = away_int
                                                # logger.debug(f"      Extracted Long Balls: {home_int}-{away_int}")
                                            
                            # except Exception as e:
                                # logger.debug(f"    Error processing stat group {group_idx}: {e}")
                                # continue
                        
                        # Skip the old fallback method - we're using the new method above which processes stat groups correctly
                        # The old method could overwrite correct values with wrong ones if column verification fails
                        # logger.debug(f"    Skipping old fallback method - using new stat group processing")
                    # except Exception as e:
                        # logger.debug(f"    Error extracting from detailed stats section: {e}")
                    
                    # logger.info(f"    ✓ Extracted team stats from Team Stats visual table")
                # except Exception as e:
                #     logger.debug(f"    Error extracting from Team Stats visual table: {e}")
            # else:
            #     logger.info(f"    Skipping Method 1.6 - stats already extracted from table with team name headers")
            
            # Method 2: Try extracting from tables (fallback)
            # TEMPORARILY DISABLED - main extraction from div#team_stats_extra is working
#             if False and not stats_extracted_from_table:
#                 team_stats_tables = driver.find_elements(By.XPATH, "//table[contains(@class, 'stats') or contains(@id, 'stats')]")
#                 if team_stats_tables:
#                     logger.info(f"    Found {len(team_stats_tables)} potential team stats tables")
#                     for table in team_stats_tables[:3]:  # Check first 3 tables
#                         try:
                            # Check if this table has team stats (usually has team names in rows)
#                             rows = table.find_elements(By.TAG_NAME, "tr")
#                             if len(rows) < 2:
#                                 continue
                            
                            # Look for team names - check header row and first data row
#                             header_cells = rows[0].find_elements(By.XPATH, ".//th | .//td")
#                             first_data_row = rows[1] if len(rows) > 1 else None
#                             first_data_cells = first_data_row.find_elements(By.TAG_NAME, "td") if first_data_row else []
                            
                            # Check if table has team names
#                             has_team_name = False
#                             if first_data_cells:
#                                 first_cell_text = first_data_cells[0].text.strip().lower()
#                                 if home_team and (home_team.lower() in first_cell_text or away_team and away_team.lower() in first_cell_text):
#                                     has_team_name = True
                            
                            # Also check header
#                             if not has_team_name and header_cells:
#                                 header_text = ' '.join([c.text.lower() for c in header_cells])
#                                 if 'team' in header_text and len(header_cells) > 2:
#                                     has_team_name = True
                            
#                             if has_team_name:
#                                 logger.info(f"    Found team stats table with team names")
                                # Extract headers - try thead first, then first row
#                                 headers = []
#                                 try:
#                                     thead = table.find_element(By.TAG_NAME, "thead")
#                                     header_rows = thead.find_elements(By.TAG_NAME, "tr")
#                                     if header_rows:
                                        # Get last row (usually has actual column names)
#                                         header_row = header_rows[-1]
#                                         headers = [th.text.strip().lower() for th in header_row.find_elements(By.XPATH, ".//th | .//td")]
#                                 except:
                                    # Fallback: use first row
#                                     if rows:
#                                         headers = [th.text.strip().lower() for th in rows[0].find_elements(By.XPATH, ".//th | .//td")]
                                
#                                 logger.info(f"    Table headers ({len(headers)}): {headers[:10]}")
                                
#                                 for row in rows[1:]:  # Skip header
#                                     cells = row.find_elements(By.XPATH, ".//td | .//th")
#                                     if len(cells) < 2:
#                                         continue
                                    
#                                     team_name = cells[0].text.strip()
#                                     is_home = home_team and home_team.lower() in team_name.lower()
#                                     team_key = 'home' if is_home else 'away'
                                    
                                    # Map headers to stats
#                                     for i, header in enumerate(headers[1:], 1):  # Skip team name column
#                                         if i >= len(cells):
#                                             break
#                                         cell_value = cells[i].text.strip()
                                        
                                        # Map stats based on header
#                                         if 'possession' in header or 'poss' in header:
#                                             if '%' in cell_value:
#                                                 match_data['team_stats'][team_key]['possession'] = float(cell_value.replace('%', ''))
#                                         elif 'pass' in header and 'accuracy' in header:
#                                             if '%' in cell_value:
#                                                 match_data['team_stats'][team_key]['passing_accuracy'] = float(cell_value.replace('%', ''))
#                                         elif 'pass' in header and ('completed' in header or 'cmp' in header):
#                                             if cell_value.isdigit():
#                                                 match_data['team_stats'][team_key]['passes_completed'] = int(cell_value)
#                                         elif 'pass' in header and ('attempted' in header or 'att' in header):
#                                             if cell_value.isdigit():
#                                                 match_data['team_stats'][team_key]['passes_attempted'] = int(cell_value)
#                                         elif 'shot' in header and 'target' in header or 'sot' in header:
#                                             if cell_value.isdigit():
#                                                 match_data['team_stats'][team_key]['shots_on_target'] = int(cell_value)
#                                         elif 'shot' in header and 'target' not in header and 'sot' not in header:
#                                             if cell_value.isdigit():
#                                                 match_data['team_stats'][team_key]['shots'] = int(cell_value)
#                                         elif 'save' in header:
#                                             if cell_value.isdigit():
#                                                 match_data['team_stats'][team_key]['saves'] = int(cell_value)
#                                         elif 'foul' in header or 'fls' in header:
#                                             if cell_value.isdigit():
#                                                 match_data['team_stats'][team_key]['fouls'] = int(cell_value)
#                                         elif 'corner' in header or 'ck' in header:
#                                             if cell_value.isdigit():
#                                                 match_data['team_stats'][team_key]['corners'] = int(cell_value)
#                                         elif 'tackle' in header or 'tkl' in header:
#                                             if cell_value.isdigit():
#                                                 match_data['team_stats'][team_key]['tackles'] = int(cell_value)
#                                     elif 'interception' in header or 'int' in header:
#                                         if cell_value.isdigit():
#                                             match_data['team_stats'][team_key]['interceptions'] = int(cell_value)
                            
#                             logger.info(f"    ✓ Extracted team stats from table")
#                             break
#                     except Exception as e:
#                         logger.debug(f"    Error extracting from table: {e}")
#                         continue
            
            # Method 2: Extract from text (fallback)
            # TEMPORARILY DISABLED - main extraction from div#team_stats_extra is working
            # This method was overwriting correct values with incorrect ones
# if False and not stats_extracted_from_table:
                # Look for Team Stats heading - try multiple XPath patterns
# team_stats_heading = driver.find_elements(By.XPATH, "//*[contains(text(), 'Team Stats') or contains(text(), 'team stats')]")
            
# if not team_stats_heading:
                    # Try case-insensitive search
# team_stats_heading = driver.find_elements(By.XPATH, "//*[translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = 'team stats']")
                
# if team_stats_heading:
# logger.info(f"    Found 'Team Stats' heading")
                # Get the stats container - try multiple approaches
# stats_container = None
# stats_text = ""
                
# for heading in team_stats_heading[:1]:
# try:
                    # Approach 1: Get parent container and all its text
# parent_container = heading.find_element(By.XPATH, "./ancestor::div[contains(@class, 'stats') or contains(@id, 'stats') or contains(@class, 'team')][1]")
# if parent_container:
# stats_text = parent_container.text
# if len(stats_text) > 200:
# stats_container = parent_container
# logger.info(f"    Got stats via ancestor container, length: {len(stats_text)}")
# break
# except:
# pass
                
# try:
                    # Approach 2: Following sibling and its children
# following = heading.find_element(By.XPATH, "./following-sibling::*[1]")
                    # Get all text from this element and its descendants
# stats_text = following.text
# if len(stats_text) > 200:
# stats_container = following
# logger.info(f"    Got stats via following sibling, length: {len(stats_text)}")
# break
# except:
# pass
                
# try:
                    # Approach 3: Parent container
# parent = heading.find_element(By.XPATH, "./parent::*")
# stats_text = parent.text
# if len(stats_text) > 200:
# stats_container = parent
# logger.info(f"    Got stats via parent, length: {len(stats_text)}")
# break
# except:
# pass
                
# try:
                    # Approach 4: Next few divs/sections after heading
# all_elements = driver.find_elements(By.XPATH, "//*")
# heading_idx = -1
# for idx, elem in enumerate(all_elements):
# if elem == heading:
# heading_idx = idx
# break
                    
# if heading_idx >= 0:
                        # Collect text from next several elements
# combined_text = ""
# for i in range(1, min(30, len(all_elements) - heading_idx)):
# try:
# next_elem = all_elements[heading_idx + i]
# if next_elem.tag_name in ['div', 'section', 'table']:
# text = next_elem.text
# combined_text += " " + text
# if len(combined_text) > 500 and ('possession' in combined_text.lower() or 'passes' in combined_text.lower() or 'shots' in combined_text.lower()):
# stats_text = combined_text
# logger.info(f"    Got stats via combined next elements, length: {len(stats_text)}")
# break
# except:
# continue
# if stats_text and len(stats_text) > 200:
# break
# except:
# pass
                
                # If still no stats_text or too short, try getting body text and finding Team Stats section
# if not stats_text or len(stats_text) < 200:
# body_text = driver.find_element(By.TAG_NAME, "body").text
# team_stats_idx = body_text.lower().find('team stats')
# if team_stats_idx >= 0:
                    # Get a larger chunk to ensure we capture all stats
# stats_text = body_text[team_stats_idx:team_stats_idx+10000]  # Get next 10000 chars
# logger.info(f"    Got stats from body text, length: {len(stats_text)}")
                
# if stats_text and len(stats_text) > 50:
# logger.info(f"    Stats text length: {len(stats_text)} chars")
                
                # Debug: log first 1000 chars to see format
# if debug:
# logger.info(f"    Stats text sample (first 1000 chars): {stats_text[:1000]}")
                
                # Extract possession (format: "61%" and "39%")
# possession_match = re.findall(r'(\d+(?:\.\d+)?)\s*%', stats_text)
# if len(possession_match) >= 2:
# match_data['team_stats']['home']['possession'] = float(possession_match[0])
# match_data['team_stats']['away']['possession'] = float(possession_match[1])
# logger.info(f"    ✓ Extracted possession: {possession_match[0]}% vs {possession_match[1]}%")
                
                # Extract passing accuracy (format: "430 of 539 passes (80%)")
                # Look for "passes" or "passing" keyword
# passing_patterns = [
# r'(\d+)\s+of\s+(\d+)\s+passes\s+\((\d+(?:\.\d+)?)%\)',
# r'(\d+)\s+of\s+(\d+)\s+\((\d+(?:\.\d+)?)%\)\s+passes',
# r'(\d+)\s+/\s+(\d+)\s+passes\s+\((\d+(?:\.\d+)?)%\)',
# r'(\d+)\s+of\s+(\d+)\s+\((\d+(?:\.\d+)?)%\)',  # More flexible - just "X of Y (Z%)"
# r'(\d+)\s+passes\s+of\s+(\d+)',  # Alternative format
# ]
                
                # Find passing section
# passing_section = ""
# passing_idx = stats_text.lower().find('passing')
# if passing_idx < 0:
# passing_idx = stats_text.lower().find('passes')
# if passing_idx >= 0:
# passing_section = stats_text[max(0, passing_idx-200):min(len(stats_text), passing_idx+500)]
                
# passing_match = None
                # Search in passing section first
# if passing_section:
# for pattern in passing_patterns:
# matches = re.findall(pattern, passing_section, re.IGNORECASE)
# if len(matches) >= 2:
# passing_match = matches
# logger.info(f"    Found passing accuracy in passing section: {len(matches)} matches")
# break
                
                # If not found, try a more flexible approach - find "passing accuracy" and extract nearby numbers
# if not passing_match:
                    # Look for pattern: "430 of 539" near "passing" or "passes"
# flexible_passing = re.findall(r'(\d+)\s+of\s+(\d+)', stats_text)
                    # Filter to only those near "pass" keyword
# for match in flexible_passing:
# match_str = f"{match[0]} of {match[1]}"
# match_idx = stats_text.find(match_str)
# if match_idx >= 0:
# context = stats_text[max(0, match_idx-100):min(len(stats_text), match_idx+200)].lower()
# if 'pass' in context and 'shot' not in context and 'save' not in context:
# if not passing_match:
# passing_match = []
# passing_match.append(match)
# if len(passing_match) >= 2:
# logger.info(f"    Found passing accuracy via flexible search: {len(passing_match)} matches")
# break
                
# if passing_match and len(passing_match) >= 2:
                    # Handle both 2-tuple and 3-tuple matches
# if len(passing_match[0]) >= 2:
# match_data['team_stats']['home']['passes_completed'] = int(passing_match[0][0])
# match_data['team_stats']['home']['passes_attempted'] = int(passing_match[0][1])
# if len(passing_match[0]) > 2 and passing_match[0][2]:
# match_data['team_stats']['home']['passing_accuracy'] = float(passing_match[0][2])
# else:
                            # Calculate from completed/attempted
# if int(passing_match[0][1]) > 0:
# match_data['team_stats']['home']['passing_accuracy'] = round((int(passing_match[0][0]) / int(passing_match[0][1])) * 100, 1)
                    
# if len(passing_match[1]) >= 2:
# match_data['team_stats']['away']['passes_completed'] = int(passing_match[1][0])
# match_data['team_stats']['away']['passes_attempted'] = int(passing_match[1][1])
# if len(passing_match[1]) > 2 and passing_match[1][2]:
# match_data['team_stats']['away']['passing_accuracy'] = float(passing_match[1][2])
# else:
                            # Calculate from completed/attempted
# if int(passing_match[1][1]) > 0:
# match_data['team_stats']['away']['passing_accuracy'] = round((int(passing_match[1][0]) / int(passing_match[1][1])) * 100, 1)
                    
# logger.info(f"    ✓ Extracted passing accuracy: {passing_match[0][0]}/{passing_match[0][1]} ({match_data['team_stats']['home'].get('passing_accuracy', 'N/A')}%) vs {passing_match[1][0]}/{passing_match[1][1]} ({match_data['team_stats']['away'].get('passing_accuracy', 'N/A')}%)")
                
                # Extract shots on target (format: "10 of 19 shots (53%)" or "10 of 19 (53%)")
# shots_patterns = [
# r'(\d+)\s+of\s+(\d+)\s+shots\s+\((\d+(?:\.\d+)?)%\)',
# r'(\d+)\s+of\s+(\d+)\s+\((\d+(?:\.\d+)?)%\)\s+shots',
# r'(\d+)\s+of\s+(\d+)\s+\((\d+(?:\.\d+)?)%\)',  # More flexible
# r'(\d+)\s+/\s+(\d+)\s+shots\s+\((\d+(?:\.\d+)?)%\)',
# r'(\d+)\s+/\s+(\d+)\s+\((\d+(?:\.\d+)?)%\)'
# ]
                
# shots_match = None
# for pattern in shots_patterns:
# matches = re.findall(pattern, stats_text, re.IGNORECASE)
# if len(matches) >= 2:
# shots_match = matches
# logger.info(f"    Found shots with pattern: {pattern[:50]}...")
# break
                
# if shots_match and len(shots_match) >= 2:
# match_data['team_stats']['home']['shots_on_target'] = int(shots_match[0][0])
# match_data['team_stats']['home']['shots'] = int(shots_match[0][1])
# match_data['team_stats']['away']['shots_on_target'] = int(shots_match[1][0])
# match_data['team_stats']['away']['shots'] = int(shots_match[1][1])
# logger.info(f"    ✓ Extracted shots: {shots_match[0][0]}/{shots_match[0][1]} ({shots_match[0][2]}%) vs {shots_match[1][0]}/{shots_match[1][1]} ({shots_match[1][2]}%)")
                
                # Extract saves (format: "1 of 3 saves (33%)" or "1 of 3 shots faced")
                # Look for "saves" or "shots faced" keyword - must be in context
# saves_patterns = [
# r'(\d+)\s+of\s+(\d+)\s+saves\s+\((\d+(?:\.\d+)?)%\)',
# r'(\d+)\s+of\s+(\d+)\s+shots\s+faced\s+\((\d+(?:\.\d+)?)%\)',
# r'(\d+)\s+of\s+(\d+)\s+(?:saves|shots\s+faced)',  # Must have "saves" or "shots faced" keyword
# r'(\d+)\s+/\s+(\d+)\s+(?:saves|shots\s+faced)',
# ]
                
                # Find saves section - look for "Saves" heading
# saves_section = ""
# saves_idx = stats_text.lower().find('saves')
# if saves_idx < 0:
# saves_idx = stats_text.lower().find('shots faced')
# if saves_idx >= 0:
                    # Get section around "saves" - look for numbers in this context
# saves_section = stats_text[max(0, saves_idx-100):min(len(stats_text), saves_idx+600)]
                
# saves_match = None
                # Only search in saves section, not full text (to avoid matching passing stats)
# if saves_section:
# for pattern in saves_patterns:
# matches = re.findall(pattern, saves_section, re.IGNORECASE)
# if len(matches) >= 2:
# saves_match = matches
# logger.info(f"    Found saves in saves section with pattern: {pattern[:50]}... ({len(matches)} matches)")
# break
                
# if saves_match and len(saves_match) >= 2:
# match_data['team_stats']['home']['saves'] = int(saves_match[0][0])
# match_data['team_stats']['away']['saves'] = int(saves_match[1][0])
# logger.info(f"    ✓ Extracted saves: {saves_match[0][0]} vs {saves_match[1][0]}")
                
                # Extract other stats - try multiple approaches
                # The stats might be in a table format or as text
                # Try to find all numbers that appear after stat labels
                
                # Method 1: Look for stat labels followed by numbers
# stat_labels = {
# 'fouls': ['Fouls', 'fouls'],
# 'corners': ['Corners', 'corners'],
# 'tackles': ['Tackles', 'tackles'],
# 'interceptions': ['Interceptions', 'interceptions'],
# 'aerials_won': ['Aerials Won', 'Aerials', 'aerials'],
# 'clearances': ['Clearances', 'clearances'],
# 'offsides': ['Offsides', 'offsides'],
# 'goal_kicks': ['Goal Kicks', 'goal kicks'],
# 'throw_ins': ['Throw Ins', 'throw ins'],
# 'long_balls': ['Long Balls', 'long balls'],
# 'crosses': ['Crosses', 'crosses'],
# 'touches': ['Touches', 'touches']
# }
                
# for stat_name, labels in stat_labels.items():
# for label in labels:
                        # Try multiple patterns for each stat
# patterns = [
# rf'{label}[:\s]+(\d+)[,\s]+(\d+)',  # "Fouls: 7, 10"
# rf'{label}[:\s]+[A-Za-z\s]+\s+(\d+)[,\s]+[A-Za-z\s]+\s+(\d+)',  # "Fouls: Liverpool 7, Bournemouth 10"
# rf'{label}[:\s]+(\d+)\s+(\d+)',  # "Fouls: 7 10"
# rf'{label}\s+(\d+)\s+(\d+)',  # "Fouls 7 10"
# ]
                        
# for pattern in patterns:
# match = re.search(pattern, stats_text, re.IGNORECASE)
# if match:
# try:
# match_data['team_stats']['home'][stat_name] = int(match.group(1))
# match_data['team_stats']['away'][stat_name] = int(match.group(2))
# logger.info(f"    ✓ Extracted {stat_name}: {match.group(1)} vs {match.group(2)}")
# break
# except:
# continue
# else:
# continue
# break
                
                # Extract cards count (from events we already extracted)
# match_data['team_stats']['home']['yellow_cards'] = len([c for c in match_data['events']['cards'] if c.get('team') == 'home' and c.get('card_type') == 'yellow'])
# match_data['team_stats']['away']['yellow_cards'] = len([c for c in match_data['events']['cards'] if c.get('team') == 'away' and c.get('card_type') == 'yellow'])
# match_data['team_stats']['home']['red_cards'] = len([c for c in match_data['events']['cards'] if c.get('team') == 'home' and c.get('card_type') == 'red'])
# match_data['team_stats']['away']['red_cards'] = len([c for c in match_data['events']['cards'] if c.get('team') == 'away' and c.get('card_type') == 'red'])
                
# logger.info(f"    ✓ Extracted team stats")
# else:
# logger.warning(f"    Could not find team stats container")
# else:
# logger.warning(f"    Could not find 'Team Stats' heading")
        except Exception as e:
            logger.warning(f"  ⚠ Error extracting team stats: {e}")
        
        # Extract additional match info (attendance, referee, venue, captain, manager)
        try:
            page_text = driver.find_element(By.TAG_NAME, "body").text
            
            # Attendance
            attendance_match = re.search(r'Attendance[:\s]+([\d,]+)', page_text, re.IGNORECASE)
            if attendance_match:
                match_data['match_info']['attendance'] = int(attendance_match.group(1).replace(',', ''))
            
            # Referee - improved extraction with multiple methods
            referee_name = None
            
            # Method 1: Search page text
            referee_match = re.search(r'Referee[:\s]+([A-Za-z\s\.\-]+?)(?:\n|$|Manager:|Captain:|Venue:|Attendance:|Referee:)', page_text, re.IGNORECASE | re.MULTILINE)
            if referee_match:
                referee_name = referee_match.group(1).strip()
                logger.info(f"    Found referee in page text: {referee_name}")
            
            # Method 2: Try to extract from HTML elements (more reliable)
            try:
                referee_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Referee:')] | //*[contains(text(), 'referee:')] | //*[contains(text(), 'Referee')]")
                logger.info(f"    Found {len(referee_elements)} elements containing 'Referee'")
                
                for elem in referee_elements:
                    try:
                        elem_text = elem.text.strip()
                        logger.debug(f"    Referee element text: '{elem_text[:200]}'")
                        
                        # Look for "Referee: Name" pattern
                        referee_match = re.search(r'Referee[:\s]+([A-Za-z\s\.\-]+)', elem_text, re.IGNORECASE)
                        if referee_match:
                            potential_referee = referee_match.group(1).strip()
                            # Filter out invalid matches (too short, common words, etc.)
                            if len(potential_referee) > 3 and potential_referee.lower() not in ['referee', 'the', 'and', 'or']:
                                referee_name = potential_referee
                                logger.info(f"    Extracted referee from HTML element: {referee_name}")
                                break
                        
                        # Also try "Name (Referee)" pattern
                        referee_match = re.search(r'([A-Za-z\s\.\-]+)\s*\(Referee\)', elem_text, re.IGNORECASE)
                        if referee_match:
                            potential_referee = referee_match.group(1).strip()
                            if len(potential_referee) > 3:
                                referee_name = potential_referee
                                logger.info(f"    Extracted referee from 'Name (Referee)' pattern: {referee_name}")
                                break
                        
                        # Also try getting text from parent or following sibling
                        try:
                            parent = elem.find_element(By.XPATH, "./parent::*")
                            parent_text = parent.text.strip()
                            referee_match = re.search(r'Referee[:\s]+([A-Za-z\s\.\-]+)', parent_text, re.IGNORECASE)
                            if referee_match:
                                potential_referee = referee_match.group(1).strip()
                                if len(potential_referee) > 3 and potential_referee.lower() not in ['referee', 'the', 'and', 'or']:
                                    referee_name = potential_referee
                                    logger.info(f"    Extracted referee from parent element: {referee_name}")
                                    break
                            
                            # Also try "Name (Referee)" in parent
                            referee_match = re.search(r'([A-Za-z\s\.\-]+)\s*\(Referee\)', parent_text, re.IGNORECASE)
                            if referee_match:
                                potential_referee = referee_match.group(1).strip()
                                if len(potential_referee) > 3:
                                    referee_name = potential_referee
                                    logger.info(f"    Extracted referee from parent 'Name (Referee)' pattern: {referee_name}")
                                    break
                        except:
                            pass
                    except Exception as e:
                        logger.debug(f"    Error processing referee element: {e}")
                        continue
            except Exception as e:
                logger.debug(f"    Error extracting referee from HTML: {e}")
            
            # Method 3: Look for referee in match info sections (similar to venue/attendance)
            if not referee_name:
                try:
                    # Look for elements near venue/attendance info
                    match_info_sections = driver.find_elements(By.XPATH, "//div[contains(@class, 'match-info')] | //div[contains(@class, 'match_info')] | //*[contains(text(), 'Venue:')]/ancestor::div[1]")
                    for section in match_info_sections:
                        section_text = section.text
                        referee_match = re.search(r'Referee[:\s]+([A-Za-z\s\.\-]+)', section_text, re.IGNORECASE)
                        if referee_match:
                            potential_referee = referee_match.group(1).strip()
                            if len(potential_referee) > 3:
                                referee_name = potential_referee
                                logger.info(f"    Extracted referee from match info section: {referee_name}")
                                break
                except Exception as e:
                    logger.debug(f"    Error extracting referee from match info section: {e}")
            
            if referee_name:
                match_data['match_info']['referee'] = referee_name
                logger.info(f"    ✓ Extracted referee: {referee_name}")
            else:
                logger.debug(f"    Could not find referee information on page")
            
            # Venue - improved regex to capture full venue name including commas
            venue_match = re.search(r'Venue[:\s]+([A-Za-z\s,\.]+?)(?:\n|$|</)', page_text, re.IGNORECASE)
            if venue_match:
                match_data['match_info']['venue'] = venue_match.group(1).strip()
            
            # Try to extract venue from HTML elements (more reliable)
            try:
                venue_elements = driver.find_elements(By.XPATH, "//span[contains(text(), 'Venue:')] | //*[contains(text(), 'Venue:')]")
                if venue_elements:
                    venue_text = venue_elements[0].text.strip()
                    venue_match = re.search(r'Venue[:\s]+(.+)', venue_text, re.IGNORECASE)
                    if venue_match:
                        match_data['match_info']['venue'] = venue_match.group(1).strip()
            except:
                pass
            
            # Extract home and away managers and captains separately
            # They are typically in separate sections or columns
            try:
                # Find all elements containing "Manager:" or "Captain:" - try multiple XPath patterns
                manager_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Manager:')] | //*[contains(text(), 'manager:')] | //*[contains(., 'Manager:')]")
                captain_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Captain:')] | //*[contains(text(), 'captain:')] | //*[contains(., 'Captain:')]")
                
                # Also try finding by label/span combinations
                if not manager_elements:
                    manager_elements = driver.find_elements(By.XPATH, "//label[contains(text(), 'Manager')]/following-sibling::* | //span[contains(text(), 'Manager')]/following-sibling::*")
                if not captain_elements:
                    captain_elements = driver.find_elements(By.XPATH, "//label[contains(text(), 'Captain')]/following-sibling::* | //span[contains(text(), 'Captain')]/following-sibling::*")
                
                # Also try finding in divs with specific classes
                if not manager_elements:
                    manager_divs = driver.find_elements(By.XPATH, "//div[contains(@class, 'manager') or contains(@class, 'coach')]")
                    for div in manager_divs:
                        if 'manager' in div.text.lower() or 'coach' in div.text.lower():
                            manager_elements.append(div)
                
                logger.info(f"    Found {len(manager_elements)} manager elements, {len(captain_elements)} captain elements")
                
                # First, try text-based extraction (more reliable for finding both home and away)
                page_text_lower = page_text.lower()
                # Find positions of "Manager:" and "Captain:" in page text
                manager_positions = []
                captain_positions = []
                # Improved regex to capture full names (including multiple words, hyphens, etc.)
                # Stop at newline, end of string, or next label
                for match in re.finditer(r'manager:\s*([A-Za-z\s\.\-]+?)(?:\n|$|Manager:|Captain:|Referee:|Venue:|Attendance:)', page_text, re.IGNORECASE | re.MULTILINE):
                    manager_name = match.group(1).strip()
                    if manager_name and len(manager_name) > 2:  # Filter out very short matches
                        manager_positions.append((match.start(), manager_name))
                for match in re.finditer(r'captain:\s*([A-Za-z\s\.\-]+?)(?:\n|$|Manager:|Captain:|Referee:|Venue:|Attendance:)', page_text, re.IGNORECASE | re.MULTILINE):
                    captain_name = match.group(1).strip()
                    if captain_name and len(captain_name) > 2:  # Filter out very short matches
                        captain_positions.append((match.start(), captain_name))
                
                logger.info(f"    Found {len(manager_positions)} manager positions, {len(captain_positions)} captain positions in page text")
                
                # If we found managers/captains in text, use them (more reliable)
                if manager_positions:
                    # Get unique managers
                    unique_managers = []
                    for pos, name in manager_positions:
                        if name not in unique_managers:
                            unique_managers.append(name)
                    
                    if len(unique_managers) >= 2:
                        match_data['home_team']['manager'] = unique_managers[0]
                        match_data['away_team']['manager'] = unique_managers[1]
                        logger.info(f"    Extracted managers from text: home={unique_managers[0]}, away={unique_managers[1]}")
                    elif len(unique_managers) == 1:
                        match_data['home_team']['manager'] = unique_managers[0]
                        logger.info(f"    Extracted home manager from text: {unique_managers[0]}")
                
                if captain_positions:
                    # Get unique captains
                    unique_captains = []
                    for pos, name in captain_positions:
                        if name not in unique_captains:
                            unique_captains.append(name)
                    
                    if len(unique_captains) >= 2:
                        match_data['home_team']['captain'] = unique_captains[0]
                        match_data['away_team']['captain'] = unique_captains[1]
                        logger.info(f"    Extracted captains from text: home={unique_captains[0]}, away={unique_captains[1]}")
                    elif len(unique_captains) == 1:
                        match_data['home_team']['captain'] = unique_captains[0]
                        logger.info(f"    Extracted home captain from text: {unique_captains[0]}")
                
                # Only use element-based extraction if text-based didn't find both
                if not match_data['home_team'].get('manager') or not match_data['away_team'].get('manager'):
                    logger.info(f"    Text-based extraction incomplete, trying element-based extraction for managers")
                    # Extract managers - should be 2 (home and away)
                    # Get unique manager names from all elements
                    manager_names = []
                    for elem in manager_elements:
                        try:
                            elem_text = elem.text.strip()
                            manager_match = re.search(r'Manager[:\s]+(.+)', elem_text, re.IGNORECASE)
                            if manager_match:
                                manager_name = manager_match.group(1).strip()
                                # Only add if it's a new unique name
                                if manager_name and manager_name not in [m[1] for m in manager_names]:
                                    # Also check position to determine home/away
                                    location = elem.location['x']
                                    manager_names.append((location, manager_name))
                        except:
                            continue
                    
                    # Sort by x position (left = home, right = away)
                    manager_names.sort(key=lambda x: x[0])
                    
                    if len(manager_names) >= 2:
                        # Check if we have unique manager names
                        unique_managers = list(set([m[1] for m in manager_names]))
                        if len(unique_managers) >= 2:
                            # First (leftmost) is home, second (rightmost) is away
                            if not match_data['home_team'].get('manager'):
                                match_data['home_team']['manager'] = manager_names[0][1]
                            if not match_data['away_team'].get('manager'):
                                match_data['away_team']['manager'] = manager_names[1][1]
                            logger.info(f"    Extracted managers from elements: home={match_data['home_team'].get('manager')}, away={match_data['away_team'].get('manager')}")
                    elif len(manager_names) == 1:
                        # Only one found, assume it's home
                        if not match_data['home_team'].get('manager'):
                            match_data['home_team']['manager'] = manager_names[0][1]
                            logger.info(f"    Extracted home manager from elements: {match_data['home_team']['manager']}")
                    elif len(manager_elements) == 1:
                        # Only one found, try to determine if it's home or away by position
                        manager_text = manager_elements[0].text.strip()
                        manager_match = re.search(r'Manager[:\s]+(.+)', manager_text, re.IGNORECASE)
                        if manager_match:
                            # Check if it's in the left or right side of the page (home is usually left)
                            location = manager_elements[0].location['x']
                            page_width = driver.execute_script("return document.body.scrollWidth")
                            if location < page_width / 2:
                                if not match_data['home_team'].get('manager'):
                                    match_data['home_team']['manager'] = manager_match.group(1).strip()
                                    logger.info(f"    Extracted home manager (by position): {match_data['home_team']['manager']}")
                            else:
                                if not match_data['away_team'].get('manager'):
                                    match_data['away_team']['manager'] = manager_match.group(1).strip()
                                    logger.info(f"    Extracted away manager (by position): {match_data['away_team']['manager']}")
                
                # Only use element-based extraction for captains if text-based didn't find both
                if not match_data['home_team'].get('captain') or not match_data['away_team'].get('captain'):
                    logger.info(f"    Text-based extraction incomplete, trying element-based extraction for captains")
                    # Extract captains - should be 2 (home and away)
                    # Get unique captain names from all elements
                    captain_names = []
                    for elem in captain_elements:
                        try:
                            elem_text = elem.text.strip()
                            captain_match = re.search(r'Captain[:\s]+(.+)', elem_text, re.IGNORECASE)
                            if captain_match:
                                captain_name = captain_match.group(1).strip()
                                # Only add if it's a new unique name
                                if captain_name and captain_name not in [c[1] for c in captain_names]:
                                    # Also check position to determine home/away
                                    location = elem.location['x']
                                    captain_names.append((location, captain_name))
                        except:
                            continue
                    
                    # Sort by x position (left = home, right = away)
                    captain_names.sort(key=lambda x: x[0])
                    
                    if len(captain_names) >= 2:
                        # First (leftmost) is home, second (rightmost) is away
                        if not match_data['home_team'].get('captain'):
                            match_data['home_team']['captain'] = captain_names[0][1]
                        if not match_data['away_team'].get('captain'):
                            match_data['away_team']['captain'] = captain_names[1][1]
                        logger.info(f"    Extracted captains from elements: home={match_data['home_team'].get('captain')}, away={match_data['away_team'].get('captain')}")
                    elif len(captain_names) == 1:
                        # Only one found, assume it's home
                        if not match_data['home_team'].get('captain'):
                            match_data['home_team']['captain'] = captain_names[0][1]
                            logger.info(f"    Extracted home captain from elements: {match_data['home_team']['captain']}")
                    elif len(captain_elements) == 1:
                        # Only one found, try to determine if it's home or away by position
                        captain_text = captain_elements[0].text.strip()
                        captain_match = re.search(r'Captain[:\s]+(.+)', captain_text, re.IGNORECASE)
                        if captain_match:
                            # Check if it's in the left or right side of the page (home is usually left)
                            location = captain_elements[0].location['x']
                            page_width = driver.execute_script("return document.body.scrollWidth")
                            if location < page_width / 2:
                                if not match_data['home_team'].get('captain'):
                                    match_data['home_team']['captain'] = captain_match.group(1).strip()
                                    logger.info(f"    Extracted home captain (by position): {match_data['home_team']['captain']}")
                            else:
                                if not match_data['away_team'].get('captain'):
                                    match_data['away_team']['captain'] = captain_match.group(1).strip()
                                    logger.info(f"    Extracted away captain (by position): {match_data['away_team']['captain']}")
            except Exception as e:
                logger.debug(f"    Error extracting managers/captains: {e}")
                import traceback
                logger.debug(f"    Traceback: {traceback.format_exc()}")
        except Exception as e:
            logger.debug(f"  Error extracting additional match info: {e}")
        
        # Fallback: Extract assists from player stats (if player has assists > 0, they had an assist)
        # This runs AFTER player stats are extracted
        logger.info(f"  Extracting assists from player stats (fallback)...")
        try:
            players_with_assists = []
            for player in match_data['player_stats']['home'] + match_data['player_stats']['away']:
                assists_count = player.get('assists', 0)
                if assists_count and assists_count > 0:
                    players_with_assists.append({
                        'player_name': player['player_name'],
                        'player_id': player.get('player_id'),
                        'assists': assists_count,
                        'team': 'home' if player in match_data['player_stats']['home'] else 'away'
                    })
            
            # Try to match assists to goals (assist usually happens at same minute as goal)
            # For now, just add assists without specific minutes (we'll refine this later)
            for player_info in players_with_assists:
                for _ in range(player_info['assists']):
                    # Check if this assist is already recorded
                    existing = any(e.get('player_name') == player_info['player_name'] for e in match_data['events']['assists'])
                    if not existing:
                        # Try to find a goal at a similar time, or use a placeholder
                        # For now, add without minute (we'll improve this)
                        assist_event = {
                            'type': 'assist',
                            'player_name': player_info['player_name'],
                            'player_id': player_info['player_id'],
                            'minute': None,  # Will be matched to goal later
                            'team': player_info['team']
                        }
                        match_data['events']['assists'].append(assist_event)
                        logger.info(f"    ✓ Assist (from stats): {player_info['player_name']} [{player_info['team']}]")
            if players_with_assists:
                logger.info(f"  ✓ Fallback: Added {len(players_with_assists)} assists from player stats")
        except Exception as e:
            logger.debug(f"  Error extracting assists from stats: {e}")
        
        # Extract lineups from actual lineup tables on fbref.com
        logger.info(f"  Extracting lineups from lineup tables...")
        try:
            # Use Selenium to find lineup tables
            # Look for tables with "lineup" or "starting" in ID or class
            lineup_tables = driver.find_elements(By.XPATH, "//table[contains(@id, 'lineup') or contains(@id, 'starting') or contains(@class, 'lineup') or contains(@class, 'starting')]")
            
            # Also look for sections with "Starting XI" or "Lineups" headings
            lineup_sections = driver.find_elements(By.XPATH, "//*[contains(text(), 'Starting XI') or contains(text(), 'Lineups')]")
            
            # Also look for divs or sections containing "Bench" or "Substitutes"
            bench_sections = driver.find_elements(By.XPATH, "//*[contains(text(), 'Bench') or contains(text(), 'Substitutes') or contains(text(), 'Subs')]")
            
            # Look for any elements containing player links that might be in lineup sections
            # This is a broader search to catch all lineup-related content
            all_lineup_containers = driver.find_elements(By.XPATH, "//div[contains(@class, 'lineup')] | //section[contains(@class, 'lineup')] | //div[contains(@id, 'lineup')]")
            
            logger.info(f"    Found {len(lineup_tables)} lineup tables, {len(lineup_sections)} lineup sections, {len(bench_sections)} bench sections, {len(all_lineup_containers)} lineup containers")
            
            home_starting_xi = []
            away_starting_xi = []
            home_subs = []
            away_subs = []
            
            # Method 1: Extract from lineup tables using Selenium
            for table in lineup_tables:
                try:
                    # Determine if home or away
                    table_id = table.get_attribute('id') or ''
                    table_class = table.get_attribute('class') or ''
                    is_home = 'home' in table_id.lower() or 'home' in table_class.lower()
                    is_away = 'away' in table_id.lower() or 'away' in table_class.lower()
                    
                    # If can't determine, try to find team name in table
                    if not is_home and not is_away:
                        table_text = table.text.lower()
                        home_team_name = match_data.get('home_team', {}).get('name', '').lower()
                        away_team_name = match_data.get('away_team', {}).get('name', '').lower()
                        if home_team_name and home_team_name in table_text:
                            is_home = True
                        elif away_team_name and away_team_name in table_text:
                            is_away = True
                    
                    # Get all rows with player links
                    rows = table.find_elements(By.XPATH, ".//tr")
                    in_bench_section = False
                    
                    for row in rows:
                        try:
                            # Check if this row is the "Bench" header
                            header_cells = row.find_elements(By.XPATH, ".//th")
                            if header_cells:
                                header_text = header_cells[0].text.strip().lower()
                                if 'bench' in header_text or 'substitute' in header_text:
                                    in_bench_section = True
                                    continue
                                # If we hit another header (like team name or formation), we're out of bench section
                                elif header_text and ('bench' not in header_text and 'substitute' not in header_text):
                                    in_bench_section = False
                            
                            player_links = row.find_elements(By.XPATH, ".//a[contains(@href, '/players/')]")
                            if not player_links:
                                continue
                            
                            player_link = player_links[0]
                            player_name = player_link.text.strip()
                            href = player_link.get_attribute('href') or ''
                            player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                            player_id = player_id_match.group(1) if player_id_match else None
                            
                            # Try to extract jersey number and position from the row
                            jersey_number = None
                            position = None
                            try:
                                # Look for jersey number in the row (usually in a cell with '#' or number)
                                cells = row.find_elements(By.XPATH, ".//td | .//th")
                                for cell in cells:
                                    cell_text = cell.text.strip()
                                    # Check if this cell contains just a number (likely jersey number)
                                    if cell_text.isdigit() and 1 <= int(cell_text) <= 99:
                                        jersey_number = int(cell_text)
                                    # Check for position abbreviation (GK, DF, MF, FW, etc.)
                                    elif cell_text.upper() in ['GK', 'DF', 'MF', 'FW', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST', 'CF']:
                                        position = cell_text.upper()
                            except:
                                pass
                            
                            # If not found in row, try to get from player_stats
                            if not jersey_number or not position:
                                all_player_stats = match_data['player_stats']['home'] + match_data['player_stats']['away']
                                for player_stat in all_player_stats:
                                    if player_stat.get('player_id') == player_id or player_stat.get('player_name', '').lower() == player_name.lower():
                                        if not jersey_number and player_stat.get('jersey_number'):
                                            jersey_number = player_stat.get('jersey_number')
                                        if not position and player_stat.get('position'):
                                            position = player_stat.get('position')
                                        break
                            
                            # Check if it's a substitute
                            row_class = row.get_attribute('class') or ''
                            row_text = row.text.lower()
                            
                            # Check parent elements for "Substitutes" or "Bench" headings
                            is_sub = in_bench_section  # If we're in bench section, it's a substitute
                            if not is_sub:
                                # Check if row text or class indicates substitute
                                is_sub = 'sub' in row_class.lower() or 'substitute' in row_text or 'bench' in row_text
                            
                            player_data = {
                                'name': player_name,
                                'fbref_id': player_id,
                                'position': position,
                                'jersey_number': jersey_number
                            }
                            
                            if is_home:
                                if is_sub:
                                    if not any(p['name'] == player_name for p in home_subs):
                                        home_subs.append(player_data)
                                else:
                                    if not any(p['name'] == player_name for p in home_starting_xi):
                                        home_starting_xi.append(player_data)
                            elif is_away:
                                if is_sub:
                                    if not any(p['name'] == player_name for p in away_subs):
                                        away_subs.append(player_data)
                                else:
                                    if not any(p['name'] == player_name for p in away_starting_xi):
                                        away_starting_xi.append(player_data)
                        except Exception as e:
                            logger.debug(f"      Error processing lineup row: {e}")
                            continue
                except Exception as e:
                    logger.debug(f"    Error processing lineup table: {e}")
                    continue
            
            # Track starting XI names to avoid duplicates
            home_starting_names = {p['name'] for p in home_starting_xi}
            away_starting_names = {p['name'] for p in away_starting_xi}
            
            # Method 2: Extract from all lineup containers (broader search)
            for container in all_lineup_containers:
                try:
                    # Find all player links in this container
                    player_links = container.find_elements(By.XPATH, ".//a[contains(@href, '/players/')]")
                    
                    # Determine if home or away
                    container_text = container.text.lower()
                    home_team_name = match_data.get('home_team', {}).get('name', '').lower()
                    away_team_name = match_data.get('away_team', {}).get('name', '').lower()
                    
                    is_home_container = home_team_name and home_team_name in container_text
                    is_away_container = away_team_name and away_team_name in container_text
                    
                    # Check if this section contains "Bench" or "Substitute"
                    is_bench_section = 'bench' in container_text or 'substitute' in container_text or 'subs' in container_text
                    
                    for player_link in player_links:
                        try:
                            player_name = player_link.text.strip()
                            if not player_name:
                                continue
                            
                            # Skip if already in starting XI
                            if player_name in home_starting_names or player_name in away_starting_names:
                                continue
                            
                            href = player_link.get_attribute('href') or ''
                            player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                            player_id = player_id_match.group(1) if player_id_match else None
                            
                            # Try to extract jersey number
                            jersey_number = None
                            position = None
                            
                            # Try to get from player_stats
                            all_player_stats = match_data['player_stats']['home'] + match_data['player_stats']['away']
                            for player_stat in all_player_stats:
                                if player_stat.get('player_id') == player_id or player_stat.get('player_name', '').lower() == player_name.lower():
                                    if not jersey_number and player_stat.get('jersey_number'):
                                        jersey_number = player_stat.get('jersey_number')
                                    if not position and player_stat.get('position'):
                                        position = player_stat.get('position')
                                    break
                            
                            player_data = {
                                'name': player_name,
                                'fbref_id': player_id,
                                'position': position,
                                'jersey_number': jersey_number
                            }
                            
                            # If it's a bench section, add to substitutes
                            if is_bench_section:
                                if is_home_container:
                                    if not any(p['name'] == player_name for p in home_subs):
                                        home_subs.append(player_data)
                                elif is_away_container:
                                    if not any(p['name'] == player_name for p in away_subs):
                                        away_subs.append(player_data)
                        except Exception as e:
                            logger.debug(f"      Error processing player link in container: {e}")
                            continue
                except Exception as e:
                    logger.debug(f"    Error processing lineup container: {e}")
                    continue
            
            # Method 3: Extract from bench/substitute sections (find all players listed as substitutes)
            # This ensures we get all bench players, even if they didn't play
            for bench_section in bench_sections:
                try:
                    # Find the parent container that might contain team info
                    # Look for a more specific parent - one that contains lineup/bench info
                    try:
                        parent = bench_section.find_element(By.XPATH, "./ancestor::div[contains(@class, 'lineup') or contains(@id, 'lineup')][1]")
                    except:
                        try:
                            parent = bench_section.find_element(By.XPATH, "./ancestor::section[1]")
                        except:
                            parent = bench_section.find_element(By.XPATH, "./ancestor::div[position()<=5][last()]")
                    
                    # Determine if this is home or away
                    section_text = parent.text.lower() if parent else bench_section.text.lower()
                    home_team_name = match_data.get('home_team', {}).get('name', '').lower()
                    away_team_name = match_data.get('away_team', {}).get('name', '').lower()
                    
                    is_home_section = home_team_name and home_team_name in section_text
                    is_away_section = away_team_name and away_team_name in section_text
                    
                    # If can't determine, check position on page
                    if not is_home_section and not is_away_section:
                        location = bench_section.location['x']
                        page_width = driver.execute_script("return document.body.scrollWidth")
                        is_home_section = location < page_width / 2
                        is_away_section = not is_home_section
                    
                    # Find all player links in this bench section - but limit to nearby elements
                    # Only look in the bench section itself and immediate siblings, not the entire parent
                    search_container = bench_section
                    # Try to find the actual bench list (usually a ul, ol, or div with player links)
                    bench_list = None
                    try:
                        bench_list = bench_section.find_element(By.XPATH, "./following-sibling::*[1] | ./parent::*/following-sibling::*[1]")
                    except:
                        pass
                    
                    if bench_list:
                        bench_player_links = bench_list.find_elements(By.XPATH, ".//a[contains(@href, '/players/')]")
                    else:
                        # Fallback: look in parent but limit scope
                        search_container = parent if parent else bench_section
                        bench_player_links = search_container.find_elements(By.XPATH, ".//a[contains(@href, '/players/')]")
                        # Limit to reasonable number (bench usually has 7-12 players)
                        if len(bench_player_links) > 20:
                            # Too many, probably wrong section - skip
                            logger.debug(f"      Skipping bench section with {len(bench_player_links)} links (too many)")
                            continue
                    
                    logger.info(f"      Found {len(bench_player_links)} player links in bench section")
                    
                    for player_link in bench_player_links:
                        try:
                            player_name = player_link.text.strip()
                            if not player_name:
                                continue
                            
                            href = player_link.get_attribute('href') or ''
                            player_id_match = re.search(r'/players/([a-f0-9]+)/', href)
                            player_id = player_id_match.group(1) if player_id_match else None
                            
                            # Try to extract jersey number from nearby text
                            jersey_number = None
                            position = None
                            
                            # Look for jersey number in the same row or nearby
                            try:
                                row = player_link.find_element(By.XPATH, "./ancestor::tr[1] | ./ancestor::div[1]")
                                row_text = row.text
                                # Look for number at start of line or after player name
                                jersey_match = re.search(r'\b(\d{1,2})\b', row_text)
                                if jersey_match:
                                    jersey_num = int(jersey_match.group(1))
                                    if 1 <= jersey_num <= 99:
                                        jersey_number = jersey_num
                            except:
                                pass
                            
                            # Try to get from player_stats if available
                            if not jersey_number or not position:
                                all_player_stats = match_data['player_stats']['home'] + match_data['player_stats']['away']
                                for player_stat in all_player_stats:
                                    if player_stat.get('player_id') == player_id or player_stat.get('player_name', '').lower() == player_name.lower():
                                        if not jersey_number and player_stat.get('jersey_number'):
                                            jersey_number = player_stat.get('jersey_number')
                                        if not position and player_stat.get('position'):
                                            position = player_stat.get('position')
                                        break
                            
                            # Skip if name looks invalid (too short, common words, etc.)
                            if len(player_name) < 3 or player_name.lower() in ['players', 'player', 'substitute', 'substitutes', 'bench', 'team']:
                                continue
                            
                            player_data = {
                                'name': player_name,
                                'fbref_id': player_id,
                                'position': position,
                                'jersey_number': jersey_number
                            }
                            
                            if is_home_section:
                                if not any(p['name'] == player_name for p in home_subs):
                                    home_subs.append(player_data)
                                    logger.debug(f"      Added home substitute: {player_name}")
                            elif is_away_section:
                                if not any(p['name'] == player_name for p in away_subs):
                                    away_subs.append(player_data)
                                    logger.debug(f"      Added away substitute: {player_name}")
                        except Exception as e:
                            logger.debug(f"      Error processing bench player link: {e}")
                            continue
                except Exception as e:
                    logger.debug(f"    Error processing bench section: {e}")
                    continue
            
            # Method 4: Extract substitutes from player stats (players who played but aren't in starting XI)
            # This is a fallback - only add players who actually played but aren't already in our lists
            # NOTE: We don't add unused substitutes here because they should already be in the bench list from Methods 1, 2, and 3
            home_subs_names = {p['name'] for p in home_subs}
            away_subs_names = {p['name'] for p in away_subs}
            
            for player in match_data['player_stats']['home']:
                player_name = player['player_name']
                # Only add if NOT in starting XI, NOT already in subs list, and played some minutes
                # This catches players who came on but weren't in the bench section for some reason
                if (player_name not in home_starting_names and 
                    player_name not in home_subs_names and 
                    player.get('minutes', 0) > 0):
                    home_subs.append({
                        'name': player_name,
                        'fbref_id': player.get('player_id'),
                        'position': player.get('position'),
                        'jersey_number': player.get('jersey_number')
                    })
            
            for player in match_data['player_stats']['away']:
                player_name = player['player_name']
                # Only add if NOT in starting XI, NOT already in subs list, and played some minutes
                if (player_name not in away_starting_names and 
                    player_name not in away_subs_names and 
                    player.get('minutes', 0) > 0):
                    away_subs.append({
                        'name': player_name,
                        'fbref_id': player.get('player_id'),
                        'position': player.get('position'),
                        'jersey_number': player.get('jersey_number')
                    })
            
            # Method 4: Fallback for starting XI if lineup tables incomplete
            if len(home_starting_xi) < 11 or len(away_starting_xi) < 11:
                logger.info(f"    Lineup tables incomplete, using player stats as fallback...")
                # Get top 11 players by minutes for each team
                home_players = sorted(match_data['player_stats']['home'], 
                                    key=lambda p: p.get('minutes', 0) or 0, reverse=True)[:11]
                away_players = sorted(match_data['player_stats']['away'], 
                                    key=lambda p: p.get('minutes', 0) or 0, reverse=True)[:11]
                
                if len(home_starting_xi) < 11:
                    home_starting_xi = [{
                        'name': p['player_name'],
                        'fbref_id': p.get('player_id'),
                        'position': p.get('position'),
                        'jersey_number': p.get('jersey_number')
                    } for p in home_players]
                
                if len(away_starting_xi) < 11:
                    away_starting_xi = [{
                        'name': p['player_name'],
                        'fbref_id': p.get('player_id'),
                        'position': p.get('position'),
                        'jersey_number': p.get('jersey_number')
                    } for p in away_players]
            
            # CRITICAL: Remove any starting XI players from substitutes list
            home_starting_names = {p['name'] for p in home_starting_xi}
            away_starting_names = {p['name'] for p in away_starting_xi}
            home_subs = [p for p in home_subs if p['name'] not in home_starting_names]
            away_subs = [p for p in away_subs if p['name'] not in away_starting_names]
            
            # Cleanup: Remove duplicates and invalid entries, limit to reasonable number
            def cleanup_subs(subs_list, team_name):
                # Remove duplicates (keep first occurrence)
                seen = set()
                cleaned = []
                for p in subs_list:
                    name = p.get('name', '').strip()
                    if not name or len(name) < 3:
                        continue
                    # Skip invalid names
                    if name.lower() in ['players', 'player', 'substitute', 'substitutes', 'bench', 'team', 'name']:
                        continue
                    if name not in seen:
                        seen.add(name)
                        cleaned.append(p)
                
                # If we have too many (more than 15), prioritize those with more complete data
                if len(cleaned) > 15:
                    # Sort by data completeness (players with jersey numbers and positions first)
                    cleaned.sort(key=lambda p: (
                        p.get('jersey_number') is not None,
                        p.get('position') is not None,
                        p.get('fbref_id') is not None
                    ), reverse=True)
                    # Take top 15
                    cleaned = cleaned[:15]
                    logger.info(f"    Limited {team_name} substitutes to {len(cleaned)} (was {len(subs_list)})")
                
                return cleaned
            
            home_subs = cleanup_subs(home_subs, 'home')
            away_subs = cleanup_subs(away_subs, 'away')
            
            match_data['lineups']['home']['starting_xi'] = home_starting_xi[:11]  # Ensure max 11
            match_data['lineups']['away']['starting_xi'] = away_starting_xi[:11]  # Ensure max 11
            match_data['lineups']['home']['substitutes'] = home_subs
            match_data['lineups']['away']['substitutes'] = away_subs
            
            logger.info(f"    ✓ Extracted {len(home_starting_xi)} home starting XI players")
            logger.info(f"    ✓ Extracted {len(away_starting_xi)} away starting XI players")
            logger.info(f"    ✓ Extracted {len(home_subs)} home substitutes")
            logger.info(f"    ✓ Extracted {len(away_subs)} away substitutes")
        except Exception as e:
            logger.warning(f"  ⚠ Error extracting lineups: {e}")
        
        logger.info(f"    ✓ Extracted comprehensive match data")
        logger.info(f"      - Goals: {len(match_data['events']['goals'])}")
        logger.info(f"      - Starting XI (home): {len(match_data['lineups']['home']['starting_xi'])}")
        logger.info(f"      - Starting XI (away): {len(match_data['lineups']['away']['starting_xi'])}")
        logger.info(f"      - Player stats (home): {len(match_data['player_stats']['home'])}")
        logger.info(f"      - Player stats (away): {len(match_data['player_stats']['away'])}")
        
    except Exception as e:
        logger.error(f"  ✗ Error extracting comprehensive match data: {e}")
        import traceback
        traceback.print_exc()
    
    return match_data


def get_premier_league_clubs() -> Dict[str, Dict[str, str]]:
    """
    Get Premier League clubs with their fbref IDs and name variations
    Returns dict mapping fbref_id to club info
    """
    # These are the 2024-2025 Premier League clubs with their common name variations
    # fbref_id will be extracted from the season schedule page
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
        'Nottingham Forest': {'variations': ['Nottingham Forest', 'Nott\'ham Forest', 'Forest', 'Nott\'ham Forest']},
        'Southampton': {'variations': ['Southampton', 'Saints']},
        'Tottenham': {'variations': ['Tottenham', 'Tottenham Hotspur', 'Spurs']},
        'West Ham': {'variations': ['West Ham', 'West Ham United', 'Hammers']},
        'Wolves': {'variations': ['Wolves', 'Wolverhampton Wanderers', 'Wanderers']},
        # Note: Leeds United, Sunderland, Burnley are NOT in Premier League 2025-2026
        # They should be filtered out
    }


def is_premier_league_club(team_name: str, pl_clubs: Dict[str, Dict[str, str]]) -> bool:
    """Check if a team name matches a Premier League club"""
    team_name_lower = team_name.lower()
    for club_name, club_info in pl_clubs.items():
        if team_name == club_name or team_name_lower == club_name.lower():
            return True
        for variation in club_info.get('variations', []):
            if team_name == variation or team_name_lower == variation.lower():
                return True
        # Also check if team name contains club name
        if club_name.lower() in team_name_lower or team_name_lower in club_name.lower():
            return True
    return False


def scrape_club_matches_comprehensive(driver: webdriver.Chrome, club_fbref_id: str, club_name: str, season: str, delay: float = 2.0) -> List[Dict]:
    """
    Scrape all matches for a specific club (all competitions)
    
    Returns:
        List of match dictionaries
    """
    matches = []
    url = get_club_matches_url(club_fbref_id, season)
    
    try:
        logger.info(f"  Scraping all matches for {club_name}...")
        driver.get(url)
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
        time.sleep(2)
        
        # Find matches table - look for "All Competitions" table
        tables = driver.find_elements(By.XPATH, "//table[contains(@class, 'stats_table')]")
        table = None
        for t in tables:
            # Check if this is the "All Competitions" table
            try:
                caption = t.find_element(By.TAG_NAME, "caption")
                if 'all competitions' in caption.text.lower():
                    table = t
                    break
            except:
                continue
        
        if not table:
            # Fallback to first stats table
            table = tables[0] if tables else None
        
        if not table:
            logger.warning(f"    ⚠ No matches table found for {club_name}")
            return matches
        
        tbody = table.find_element(By.TAG_NAME, "tbody")
        rows = tbody.find_elements(By.TAG_NAME, "tr")
        
        logger.info(f"    Found {len(rows)} match rows for {club_name}")
        
        for row in rows:
            try:
                if row.find_elements(By.TAG_NAME, "th") and not row.find_elements(By.TAG_NAME, "td"):
                    continue
                
                cells = row.find_elements(By.TAG_NAME, "td")
                if len(cells) < 3:
                    continue
                
                # Extract competition, opponent, date, score
                competition = "Unknown"
                opponent = None
                match_date = None
                home_score = None
                away_score = None
                is_home = True
                match_report_url = None
                
                row_text = row.text
                
                # Competition is usually in first column
                if len(cells) > 0:
                    comp_text = cells[0].text.strip().lower()
                    if 'premier league' in comp_text:
                        competition = "Premier League"
                    elif 'champions league' in comp_text or 'ucl' in comp_text:
                        competition = "Champions League"
                    elif 'europa league' in comp_text or 'uel' in comp_text:
                        competition = "Europa League"
                    elif 'conference league' in comp_text or 'ecl' in comp_text:
                        competition = "Conference League"
                    elif 'fa cup' in comp_text:
                        competition = "FA Cup"
                    elif 'league cup' in comp_text or 'carabao' in comp_text:
                        competition = "League Cup"
                    elif 'friendly' in comp_text:
                        competition = "Friendly"
                
                # Find opponent - look for team links
                team_links = row.find_elements(By.XPATH, ".//a[contains(@href, '/squads/')]")
                for link in team_links:
                    link_text = link.text.strip()
                    # Skip if it's the current club
                    if club_name.lower() not in link_text.lower() and link_text.lower() not in club_name.lower():
                        opponent = link_text
                        # Determine home/away from row text
                        row_lower = row_text.lower()
                        club_lower = club_name.lower()
                        opp_lower = opponent.lower()
                        # Check if "vs" or "at" pattern exists
                        if ' vs ' in row_lower or ' v ' in row_lower:
                            # Home team is usually before "vs"
                            parts = re.split(r'\s+vs\s+|\s+v\s+', row_lower, flags=re.IGNORECASE)
                            if len(parts) >= 2:
                                is_home = club_lower in parts[0]
                        elif ' at ' in row_lower:
                            # Away team is usually after "at"
                            parts = row_lower.split(' at ')
                            if len(parts) >= 2:
                                is_home = club_lower not in parts[1]
                        break
                
                # Find date - usually in a date column
                for cell in cells:
                    text = cell.text.strip()
                    date_match = re.search(r'(\d{4}-\d{2}-\d{2})', text)
                    if date_match:
                        match_date = date_match.group(1)
                        break
                
                # Find score - look for score pattern
                for cell in cells:
                    text = cell.text.strip()
                    # Match score patterns like "2-1", "2–1", "W 2-1", etc.
                    score_match = re.search(r'(\d+)[\s–-]+(\d+)', text)
                    if score_match:
                        try:
                            home_score = int(score_match.group(1))
                            away_score = int(score_match.group(2))
                        except:
                            pass
                        break
                
                # Find match report URL - look for match links
                all_links = row.find_elements(By.TAG_NAME, "a")
                for link in all_links:
                    href = link.get_attribute("href") or ""
                    if ('/matches/' in href or '/match-report/' in href) and '/squads/' not in href and '/players/' not in href:
                        match_report_url = href
                        break
                
                if opponent and match_report_url:
                    matches.append({
                        'home_team': club_name if is_home else opponent,
                        'away_team': opponent if is_home else club_name,
                        'match_report_url': match_report_url,
                        'competition': competition,
                        'date': match_date,
                        'home_score': home_score,
                        'away_score': away_score
                    })
            except Exception as e:
                logger.debug(f"    Error processing match row: {e}")
                continue
        
        logger.info(f"    ✓ Extracted {len(matches)} matches for {club_name}")
        
    except Exception as e:
        logger.error(f"  ✗ Error scraping matches for {club_name}: {e}")
        import traceback
        logger.debug(traceback.format_exc())
    
    return matches


def scrape_season_comprehensive(season: str, delay: float = 2.0, limit: int = None, headless: bool = True, include_all_competitions: bool = True, output_dir: str = None, skip_club_matches: bool = False, debug: bool = False, debug_dir: str = None) -> Dict:
    """
    Scrape comprehensive match data for a season
    
    Returns:
        Dictionary with all matches, players, and clubs
    """
    url = get_season_url(season)
    logger.info(f"=" * 80)
    logger.info(f"Scraping {season} season comprehensively from: {url}")
    logger.info(f"=" * 80)
    
    driver = setup_driver(headless=headless)
    
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
    
    # Navigate to the URL immediately after driver setup
    logger.info("")
    logger.info("Navigating to season schedule page...")
    logger.info(f"  URL: {url}")
    
    try:
        driver.get(url)
        time.sleep(3)  # Wait for page to start loading
        current_url = driver.current_url
        logger.info(f"  Current URL: {current_url}")
        logger.info(f"  Current window handle: {driver.current_window_handle}")
        
        # Check if we're on Google or wrong page
        if 'google.com' in current_url.lower():
            logger.error("  ✗ Browser opened to Google instead of fbref.com!")
            logger.error("  This is likely a Chrome/ChromeDriver configuration issue")
            logger.info("  Retrying navigation...")
            time.sleep(2)
            driver.get(url)
            time.sleep(3)
            current_url = driver.current_url
            logger.info(f"  Current URL after retry: {current_url}")
            
            if 'google.com' in current_url.lower():
                logger.error("  ✗ Still on Google. Please check:")
                logger.error("    1. Chrome browser is up to date")
                logger.error("    2. ChromeDriver matches Chrome version")
                logger.error("    3. No browser extensions blocking navigation")
                raise Exception("Failed to navigate to fbref.com - browser keeps opening to Google")
        
        # Log page info
        page_title = driver.title
        logger.info(f"  Page title: {page_title}")
        logger.info(f"  Page loaded successfully")
        
    except Exception as e:
        logger.error(f"✗ Error navigating to URL: {e}")
        raise
    
    # Check for Cloudflare immediately and wait if needed
    page_text = driver.page_source.lower()
    page_title = driver.title.lower()
    current_url_check = driver.current_url.lower()
    
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
    
    is_cloudflare = (
        any(indicator in page_text for indicator in cloudflare_indicators) or
        any(indicator in page_title for indicator in cloudflare_indicators) or
        'just a moment' in page_title.lower() or
        len(page_text) < 5000
    )
    
    # If running in visible mode, give user time to check browser and verify Cloudflare
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
        
        if is_cloudflare:
            logger.warning("  ⚠ CLOUDFLARE CHALLENGE DETECTED!")
            logger.warning("  👤 Please complete the verification in the browser window NOW")
            logger.info("  ⏳ Waiting up to 5 minutes for manual verification...")
            logger.info("  📌 Once verified, the script will continue automatically")
            logger.info("=" * 80)
            logger.info("")
            
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
                    
                    # Positive indicators that page has loaded (more reliable)
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
                    
                    # Strong Cloudflare challenge indicators (only check for actual challenge pages)
                    strong_cloudflare_indicators = [
                        'just a moment',
                        'checking your browser',
                        'verify you are human',
                        'please wait while we verify',
                        'ddos protection by cloudflare',
                        'cf-browser-verification'
                    ]
                    
                    # Check if page has loaded (positive check)
                    has_loaded_content = any(indicator in current_text for indicator in page_loaded_indicators) or \
                                        any(indicator in current_title for indicator in page_loaded_indicators) or \
                                        'fbref' in current_url_check
                    
                    # Check if still on Cloudflare challenge (only strong indicators)
                    still_on_challenge = any(indicator in current_title.lower() for indicator in strong_cloudflare_indicators) or \
                                        ('just a moment' in current_title.lower() and len(current_text) < 10000)
                    
                    # Page is loaded if it has content AND is not on challenge page
                    if has_loaded_content and not still_on_challenge and len(current_text) > 5000:
                        logger.info(f"  ✓ Cloudflare verification completed after {i+1} seconds")
                        logger.info(f"  📄 New page title: {driver.title}")
                        logger.info(f"  🔗 New URL: {driver.current_url[:80]}")
                        logger.info(f"  📊 Page size: {len(current_text)} chars")
                        logger.info("  ✅ Continuing with scraping...")
                        time.sleep(2)
                        break
                    
                    # Log progress every 5 seconds
                    if i % 5 == 0 and i > 0:
                        logger.info(f"  Still waiting... ({i+1}s / 300s)")
                        logger.info(f"  Current page: {driver.title[:60]}")
                        logger.info(f"  Page size: {len(current_text)} chars")
                        logger.info(f"  Has content: {has_loaded_content}, Still challenge: {still_on_challenge}")
                        
                except Exception as e:
                    logger.debug(f"  Error checking page status: {e}")
                    continue
        else:
            logger.info("")
            logger.info("👤 Please check the browser window:")
            logger.info("   1. You should see the fbref.com Premier League schedule page")
            logger.info("   2. If you see a Cloudflare verification (checkbox/challenge), complete it now")
            logger.info("   3. If you see Google, something is wrong - check Chrome settings")
            logger.info("   4. The script will continue automatically in 10 seconds")
            logger.info("=" * 80)
            logger.info("")
            
            for i in range(10, 0, -1):
                logger.info(f"⏳ Starting in {i} seconds... (check browser now!)")
                time.sleep(1)
        
        # Final check
        final_url = driver.current_url
        logger.info("")
        logger.info(f"Final URL check: {final_url}")
        if 'google.com' in final_url.lower():
            logger.error("⚠ Still on Google after pause! The browser may need manual navigation.")
            logger.error("Please manually navigate to the fbref.com URL in the browser window")
        
        logger.info("✅ Starting scraping process...")
        logger.info("")
    
    # Normalize season format (handle 25/26 -> 2025-2026)
    if '/' in season:
        parts = season.split('/')
        year1 = int(parts[0])
        year2 = int(parts[1])
        if year1 < 50:
            year1 = 2000 + year1
        if year2 < 50:
            year2 = 2000 + year2
        season_normalized = f"{year1}-{year2}"
    else:
        season_normalized = season
    
    # Create output directory structure
    if output_dir is None:
        # Get the backend directory (parent of scripts directory)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(script_dir)
        output_dir = os.path.join(backend_dir, "data", season_normalized)
    
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(os.path.join(output_dir, "matches"), exist_ok=True)
    
    logger.info(f"Output directory: {output_dir}")
    logger.info(f"Matches will be saved to: {output_dir}/matches/")
    
    # Data structure - keyed by IDs for easy database filtering
    data = {
        'season': season_normalized,
        'scraped_at': datetime.now().isoformat(),
        'matches': {},  # match_id -> match_info
        'players': {},  # player_id -> player_info
        'clubs': {}     # club_id -> club_info
    }
    
    try:
        logger.info("Loading season schedule page...")
        logger.info(f"  URL: {url}")
        
        max_retries = 3
        for attempt in range(1, max_retries + 1):
            try:
                logger.info(f"  Attempt {attempt}/{max_retries}...")
                logger.info(f"  Navigating to: {url}")
                driver.get(url)
                
                # Verify we're on the correct page
                current_url = driver.current_url
                logger.info(f"  Current URL after navigation: {current_url}")
                
                if 'google.com' in current_url.lower() or 'about:blank' in current_url.lower():
                    logger.warning(f"  ⚠ Browser opened to wrong page: {current_url}")
                    logger.info(f"  Retrying navigation to: {url}")
                    time.sleep(2)
                    driver.get(url)
                    current_url = driver.current_url
                    logger.info(f"  Current URL after retry: {current_url}")
                
                # Wait a bit for Cloudflare check if present
                time.sleep(5)
                
                # Check if we're on a Cloudflare challenge page - more aggressive detection
                page_text = driver.page_source.lower()
                page_title = driver.title.lower()
                current_url = driver.current_url.lower()
                
                # Log what we see for debugging
                logger.debug(f"  Page title: {driver.title}")
                logger.debug(f"  Current URL: {current_url}")
                logger.debug(f"  Page source length: {len(page_text)}")
                
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
                
                # Check page title, URL, and content
                is_cloudflare = (
                    any(indicator in page_text for indicator in cloudflare_indicators) or
                    any(indicator in page_title for indicator in cloudflare_indicators) or
                    any(indicator in current_url for indicator in cloudflare_indicators) or
                    'ray id' in page_text or
                    len(page_text) < 5000  # Very short page might be Cloudflare
                )
                
                if is_cloudflare:
                    if not headless:
                        logger.warning("  ⚠ Cloudflare challenge detected!")
                        logger.warning(f"  📄 Page title: {driver.title}")
                        logger.warning(f"  🔗 Current URL: {current_url[:100]}")
                        logger.warning(f"  🪟 Browser window handle: {driver.current_window_handle}")
                        logger.warning(f"  📊 Total windows: {len(driver.window_handles)}")
                        
                        # If multiple windows, switch to the first one (main window)
                        if len(driver.window_handles) > 1:
                            logger.warning(f"  ⚠ Multiple browser windows detected! Switching to main window...")
                            logger.warning(f"  Window handles: {driver.window_handles}")
                            driver.switch_to.window(driver.window_handles[0])
                            logger.info(f"  ✓ Switched to window: {driver.current_window_handle}")
                            logger.info(f"  Current URL: {driver.current_url}")
                            logger.info(f"  Current title: {driver.title}")
                        
                        logger.info("  👤 Please check the browser window and complete any verification")
                        logger.info("  ⏳ Waiting up to 5 minutes for manual verification...")
                        logger.info("  📌 Once verified, the script will continue automatically")
                        logger.info("  💡 If you see a checkbox or challenge, please complete it now")
                        logger.info("  ⚠ IMPORTANT: Make sure you're verifying in the browser window that shows fbref.com")
                        
                        # Wait for Cloudflare to complete (up to 5 minutes)
                        for i in range(300):
                            time.sleep(1)
                            
                            # Make sure we're on the correct window
                            if len(driver.window_handles) > 1:
                                driver.switch_to.window(driver.window_handles[0])
                            
                            try:
                                current_text = driver.page_source.lower()
                                current_title = driver.title.lower()
                                current_url_check = driver.current_url.lower()
                                
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
                                
                                # Strong Cloudflare challenge indicators
                                strong_cloudflare_indicators = [
                                    'just a moment',
                                    'checking your browser',
                                    'verify you are human',
                                    'please wait while we verify',
                                    'ddos protection by cloudflare',
                                    'cf-browser-verification'
                                ]
                                
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
                                    logger.info("  ✅ Continuing with scraping...")
                                    time.sleep(3)
                                    break
                                
                                if i % 10 == 0 and i > 0:
                                    logger.info(f"  Still waiting for verification... ({i+1}s / 300s)")
                                    logger.info(f"  Current page: {driver.title[:50]}")
                                    logger.info(f"  Current URL: {driver.current_url[:80]}")
                                    logger.info(f"  Page size: {len(current_text)} chars")
                                    logger.info(f"  Has content: {has_loaded_content}, Still challenge: {still_on_challenge}")
                            except Exception as e:
                                logger.debug(f"  Error checking page: {e}")
                                continue
                    else:
                        logger.warning("  ⚠ Cloudflare challenge detected, waiting up to 2 minutes...")
                        # Wait for Cloudflare to complete (up to 2 minutes)
                        for i in range(120):
                            time.sleep(1)
                            current_text = driver.page_source.lower()
                            if not any(indicator in current_text for indicator in cloudflare_indicators):
                                logger.info(f"  ✓ Cloudflare check passed after {i+1} seconds")
                                break
                            if i % 10 == 0 and i > 0:
                                logger.info(f"  Still waiting for Cloudflare... ({i+1}s)")
                else:
                    if not headless:
                        logger.info(f"  ✓ No Cloudflare challenge detected (page: {driver.title[:50]})")
                
                # Wait for page to load with multiple fallback selectors
                page_loaded = False
                for wait_time, selector in [(20, (By.TAG_NAME, "tbody")), 
                                            (20, (By.XPATH, "//table[@id[contains(., 'sched')]]")),
                                            (15, (By.CLASS_NAME, "stats_table")),
                                            (10, (By.TAG_NAME, "table"))]:
                    try:
                        WebDriverWait(driver, wait_time).until(EC.presence_of_element_located(selector))
                        logger.info(f"✓ Page loaded (found element: {selector[1]})")
                        page_loaded = True
                        break
                    except Exception as e:
                        logger.debug(f"  Selector {selector[1]} not found, trying next...")
                        continue
                
                if page_loaded:
                    time.sleep(3)  # Extra wait for dynamic content
                    break
                else:
                    if attempt < max_retries:
                        logger.warning(f"  Attempt {attempt} failed, retrying in 10 seconds...")
                        time.sleep(10)
                    else:
                        logger.error(f"✗ Page load failed after {max_retries} attempts")
                        logger.info(f"  Current URL: {driver.current_url}")
                        logger.info(f"  Page title: {driver.title}")
                        page_source_len = len(driver.page_source)
                        logger.info(f"  Page source length: {page_source_len}")
                        
                        # Check for Cloudflare block
                        if 'access denied' in driver.page_source.lower() or 'blocked' in driver.page_source.lower():
                            logger.error("  ✗ Access denied - Cloudflare is blocking the request")
                            logger.error("  💡 Try running in non-headless mode or wait a few minutes")
                            raise Exception("Cloudflare blocking detected")
                        
                        # Try to continue anyway - maybe the table is there
                        logger.warning("  Attempting to continue despite timeout...")
            except Exception as e:
                if attempt < max_retries:
                    logger.warning(f"  Attempt {attempt} error: {e}, retrying in 10 seconds...")
                    time.sleep(10)
                else:
                    raise
        
        # Find results table - try multiple selectors
        table = None
        table_selectors = [
            (By.XPATH, "//table[@id[contains(., 'sched')]]"),
            (By.XPATH, "//table[contains(@class, 'stats_table')]"),
            (By.XPATH, "//table[contains(@id, 'sched')]"),
            (By.TAG_NAME, "table")
        ]
        
        for selector_type, selector_value in table_selectors:
            try:
                table = driver.find_element(selector_type, selector_value)
                logger.info(f"✓ Found table using: {selector_value}")
                break
            except:
                continue
        
        if not table:
            logger.error("✗ Could not find schedule table with any selector")
            logger.info("  Available tables on page:")
            try:
                all_tables = driver.find_elements(By.TAG_NAME, "table")
                for i, t in enumerate(all_tables[:5]):
                    table_id = t.get_attribute("id") or "no-id"
                    table_class = t.get_attribute("class") or "no-class"
                    logger.info(f"    Table {i+1}: id='{table_id}', class='{table_class}'")
            except:
                pass
            raise Exception("Could not locate schedule table")
        
        tbody = table.find_element(By.TAG_NAME, "tbody")
        all_rows = tbody.find_elements(By.TAG_NAME, "tr")
        
        logger.info(f"✓ Found {len(all_rows)} total rows in results table")
        
        # Get Premier League clubs for filtering
        pl_clubs = get_premier_league_clubs()
        
        # First pass: Collect all match information (team names, URLs) without navigating away
        # This avoids stale element references
        valid_matches = []
        for row in all_rows:
            try:
                # Skip header rows
                if row.find_elements(By.TAG_NAME, "th") and not row.find_elements(By.TAG_NAME, "td"):
                    continue
                
                cells = row.find_elements(By.TAG_NAME, "td")
                if len(cells) < 5:
                    continue
                
                # Check if this row has team links (actual match)
                team_links = row.find_elements(By.XPATH, ".//a[contains(@href, '/squads/')]")
                if len(team_links) < 2:
                    continue
                
                home_team = team_links[0].text.strip()
                away_team = team_links[1].text.strip()
                
                # Extract club fbref IDs for later use
                home_href = team_links[0].get_attribute("href") or ""
                away_href = team_links[1].get_attribute("href") or ""
                home_id_match = re.search(r'/squads/([a-f0-9]+)/', home_href)
                away_id_match = re.search(r'/squads/([a-f0-9]+)/', away_href)
                
                # Find match report URL - look for match links in this row
                # Each row should have exactly one match link
                match_report_url = None
                all_links = row.find_elements(By.TAG_NAME, "a")
                for link in all_links:
                    href = link.get_attribute("href") or ""
                    # Match URLs contain '/matches/' or '/match-report/' but not '/squads/' or '/players/'
                    if ('/matches/' in href or '/match-report/' in href) and '/squads/' not in href and '/players/' not in href:
                        match_report_url = href
                        break  # Take the first match URL found
                
                if match_report_url:
                    # CRITICAL: Only include matches where BOTH teams are Premier League clubs
                    # This ensures we only get Premier League matches from the schedule page
                    home_is_pl = is_premier_league_club(home_team, pl_clubs)
                    away_is_pl = is_premier_league_club(away_team, pl_clubs)
                    
                    if home_is_pl and away_is_pl:
                        # Both teams are PL, so this is a Premier League match
                        valid_matches.append({
                            'home_team': home_team,
                            'away_team': away_team,
                            'match_report_url': match_report_url,
                            'competition': "Premier League",
                            'home_fbref_id': home_id_match.group(1) if home_id_match else None,
                            'away_fbref_id': away_id_match.group(1) if away_id_match else None
                        })
                        logger.debug(f"  ✓ Added PL match: {home_team} vs {away_team}")
                    else:
                        logger.debug(f"  Skipping non-PL match from schedule: {home_team} vs {away_team} (home_is_pl={home_is_pl}, away_is_pl={away_is_pl})")
            except Exception as e:
                logger.debug(f"  Error processing row: {e}")
                continue
        
        pl_matches = len(valid_matches)
        logger.info(f"✓ Found {pl_matches} Premier League matches from season schedule")
        
        # Collect unique Premier League clubs and their fbref IDs
        pl_clubs_with_ids = {}
        for match in valid_matches:
            if match.get('home_fbref_id') and is_premier_league_club(match['home_team'], pl_clubs):
                pl_clubs_with_ids[match['home_team']] = match['home_fbref_id']
            if match.get('away_fbref_id') and is_premier_league_club(match['away_team'], pl_clubs):
                pl_clubs_with_ids[match['away_team']] = match['away_fbref_id']
        
        logger.info(f"  Found {len(pl_clubs_with_ids)} Premier League clubs")
        
        # Step 2: SKIP club pages - we only want Premier League matches
        # The user requested ONLY Premier League games, not cups/European/friendlies
        if skip_club_matches or not include_all_competitions:
            logger.info("")
            logger.info("Step 2: Skipping club pages - only scraping Premier League matches from schedule")
            logger.info(f"  Total Premier League matches found: {len(valid_matches)}")
        else:
            logger.info("")
            logger.info("Step 2: Scraping individual club pages for all competitions (cups, European, friendlies)...")
            seen_match_urls = {m['match_report_url'] for m in valid_matches}  # Track to avoid duplicates
            
            for club_name, club_id in pl_clubs_with_ids.items():
                try:
                    logger.info(f"  Scraping all matches for {club_name}...")
                    club_matches = scrape_club_matches_comprehensive(
                        driver,
                        club_id,
                        club_name,
                        season,
                        delay=delay
                    )
                    
                    # Add matches that aren't duplicates AND involve at least one PL team
                    # For club pages, we want all competitions (FA Cup, League Cup, European, etc.)
                    added_count = 0
                    for club_match in club_matches:
                        # Include if at least one team is a Premier League club
                        home_is_pl = is_premier_league_club(club_match.get('home_team', ''), pl_clubs)
                        away_is_pl = is_premier_league_club(club_match.get('away_team', ''), pl_clubs)
                        involves_pl_team = home_is_pl or away_is_pl
                        
                        if involves_pl_team and club_match['match_report_url'] not in seen_match_urls:
                            # Keep the competition as determined from club page (FA Cup, League Cup, European, etc.)
                            seen_match_urls.add(club_match['match_report_url'])
                            valid_matches.append(club_match)
                            added_count += 1
                    
                    logger.info(f"    ✓ Added {added_count} new matches for {club_name} (all competitions)")
                    
                    # Navigate back to season page
                    driver.get(url)
                    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
                    time.sleep(1)
                except Exception as e:
                    logger.error(f"  ✗ Error scraping matches for {club_name}: {e}")
                    continue
        
        # Count by competition
        competition_counts = {}
        for match in valid_matches:
            comp = match.get('competition', 'Unknown')
            competition_counts[comp] = competition_counts.get(comp, 0) + 1
        
        logger.info("")
        logger.info(f"✓ Total matches found: {len(valid_matches)}")
        for comp, count in sorted(competition_counts.items()):
            logger.info(f"  - {comp}: {count} matches")
        
        # Final filter: Only process matches where BOTH teams are Premier League clubs
        # This ensures we only scrape Premier League matches, not other competitions
        pl_only_matches = []
        for match in valid_matches:
            home_team = match.get('home_team', '')
            away_team = match.get('away_team', '')
            home_is_pl = is_premier_league_club(home_team, pl_clubs)
            away_is_pl = is_premier_league_club(away_team, pl_clubs)
            
            if home_is_pl and away_is_pl:
                # Ensure competition is set to Premier League
                match['competition'] = 'Premier League'
                pl_only_matches.append(match)
            else:
                logger.warning(f"  ⚠ Filtering out match (not both PL teams): {home_team} vs {away_team}")
        
        valid_matches = pl_only_matches
        logger.info(f"✓ Filtered to {len(valid_matches)} Premier League matches only (both teams must be PL clubs)")
        
        # Verify we have the expected number of matches (20 teams × 19 home games = 380)
        expected_matches = 380
        if len(valid_matches) < expected_matches * 0.95:  # Allow 5% tolerance
            logger.warning(f"⚠ WARNING: Found {len(valid_matches)} matches, expected ~{expected_matches}")
            logger.warning(f"  This suggests some matches may be missing!")
        else:
            logger.info(f"✓ Match count looks good: {len(valid_matches)} matches (expected ~{expected_matches})")
        
        if limit:
            valid_matches = valid_matches[:limit]
            logger.info(f"⚠ Limiting to first {limit} matches for testing")
        
        total_matches = len(valid_matches)
        logger.info(f"Processing {total_matches} matches (all competitions involving PL teams)...")
        logger.info("-" * 80)
        
        start_time = time.time()
        
        for match_idx, match_info in enumerate(valid_matches):
            # Calculate progress percentage
            progress_pct = ((match_idx + 1) / total_matches) * 100
            elapsed_time = time.time() - start_time
            avg_time_per_match = elapsed_time / (match_idx + 1) if match_idx > 0 else 0
            remaining_matches = total_matches - (match_idx + 1)
            estimated_remaining = avg_time_per_match * remaining_matches if avg_time_per_match > 0 else 0
            
            progress = f"[{match_idx + 1}/{total_matches}]"
            logger.info("")
            logger.info("=" * 80)
            logger.info(f"{progress} Processing match {match_idx + 1} of {total_matches} ({progress_pct:.1f}% complete)")
            logger.info(f"  Elapsed: {elapsed_time/60:.1f} minutes | Avg: {avg_time_per_match:.1f}s/match | Est. remaining: {estimated_remaining/60:.1f} minutes")
            logger.info("=" * 80)
            
            try:
                home_team = match_info['home_team']
                away_team = match_info['away_team']
                match_report_url = match_info['match_report_url']
                competition = match_info.get('competition', 'Unknown')
                
                logger.info(f"  {progress} Match: {home_team} vs {away_team} ({competition})")
                logger.info(f"  {progress} Extracting comprehensive match data...")
                
                # Extract comprehensive match data
                match_start_time = time.time()
                match_data = extract_comprehensive_match_data(
                    driver,
                    match_report_url,
                    home_team=home_team,
                    away_team=away_team,
                    delay=delay,
                    debug=debug,
                    debug_dir=debug_dir,
                    headless=headless
                )
                match_time = time.time() - match_start_time
                logger.info(f"  ⏱ Match extraction took {match_time:.1f}s")
                
                # Create unique match ID
                match_id = f"{season_normalized}_{match_idx + 1}"
                if match_data['match_info'].get('date'):
                    # Use date + teams for more unique ID
                    date_str = match_data['match_info']['date'].replace('-', '')
                    home_name = match_data['home_team'].get('name', '').replace(' ', '').replace('Utd', 'United')
                    away_name = match_data['away_team'].get('name', '').replace(' ', '').replace('Utd', 'United')
                    match_id = f"{date_str}_{home_name}_vs_{away_name}"
                
                # Add match to data (keyed by match_id)
                match_entry = {
                    'match_id': match_id,
                    'date': match_data['match_info'].get('date'),
                    'competition': competition,
                    'home_team': match_data['home_team'],
                    'away_team': match_data['away_team'],
                    'score': {
                        'home': match_data['match_info'].get('home_score'),
                        'away': match_data['match_info'].get('away_score')
                    },
                    'lineups': match_data['lineups'],
                    'events': match_data['events'],
                    'player_stats': match_data['player_stats'],
                    'team_stats': match_data['team_stats'],
                    'match_info': match_data['match_info']
                }
                
                data['matches'][match_id] = match_entry
                
                # Save individual match file
                match_file = os.path.join(output_dir, "matches", f"match_{match_id}.json")
                try:
                    with open(match_file, 'w', encoding='utf-8') as f:
                        json.dump(match_entry, f, indent=2, ensure_ascii=False)
                    logger.info(f"  ✓ Saved match file: match_{match_id}.json")
                except Exception as e:
                    logger.error(f"  ✗ Error saving match file: {e}")
                
                # Collect unique players and clubs
                for team_key in ['home', 'away']:
                    team_info = match_data[f'{team_key}_team']
                    if team_info.get('fbref_id'):
                        data['clubs'][team_info['fbref_id']] = {
                            'name': team_info['name'],
                            'fbref_id': team_info['fbref_id']
                        }
                
                # Collect players from lineups, events, and stats
                for team_key in ['home', 'away']:
                    for player in match_data['lineups'][team_key]['starting_xi'] + match_data['lineups'][team_key]['substitutes']:
                        if player.get('fbref_id'):
                            data['players'][player['fbref_id']] = {
                                'name': player['name'],
                                'fbref_id': player['fbref_id'],
                                'position': player.get('position')
                            }
                
                for event_list in match_data['events'].values():
                    for event in event_list:
                        if event.get('player_id'):
                            data['players'][event['player_id']] = {
                                'name': event['player_name'],
                                'fbref_id': event['player_id']
                            }
                
                for team_key in ['home', 'away']:
                    for player_stat in match_data['player_stats'][team_key]:
                        if player_stat.get('player_id'):
                            data['players'][player_stat['player_id']] = {
                                'name': player_stat['player_name'],
                                'fbref_id': player_stat['player_id']
                            }
                
                logger.info(f"  {progress} ✓ Match data extracted and added")
                
                # Navigate back to season page
                logger.debug(f"  {progress} Navigating back to season page...")
                driver.get(url)
                WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"  {progress} ✗ Error processing match: {e}")
                # Try to navigate back
                try:
                    driver.get(url)
                    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
                    time.sleep(1)
                except:
                    pass
                continue
            
            logger.info("-" * 80)
        
        # Save master index file with all matches, players, clubs
        index_file = os.path.join(output_dir, "index.json")
        try:
            with open(index_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            logger.info(f"✓ Saved master index file: {index_file}")
        except Exception as e:
            logger.error(f"✗ Error saving index file: {e}")
        
        logger.info("=" * 80)
        logger.info(f"✓ Successfully scraped {len(data['matches'])} matches")
        logger.info(f"  - Unique players: {len(data['players'])}")
        logger.info(f"  - Unique clubs: {len(data['clubs'])}")
        logger.info(f"  - Match files saved to: {output_dir}/matches/")
        logger.info("=" * 80)
        
    except Exception as e:
        logger.error(f"✗ Error scraping season: {e}")
        import traceback
        traceback.print_exc()
    finally:
        logger.info("Closing browser...")
        driver.quit()
        logger.info("✓ Browser closed")
    
    return data


def save_to_json(data: Dict, output_file: str):
    """Save data to JSON file"""
    logger.info(f"Saving data to JSON file: {output_file}")
    os.makedirs(os.path.dirname(output_file) or '.', exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    logger.info(f"✓ Successfully saved data to {output_file}")
    logger.info(f"  - Matches: {len(data['matches'])}")
    logger.info(f"  - Players: {len(data['players'])}")
    logger.info(f"  - Clubs: {len(data['clubs'])}")


def main():
    parser = argparse.ArgumentParser(description='Comprehensive Premier League data scraper from fbref.com')
    parser.add_argument('--season', type=str, help='Season to scrape (e.g., 2024-2025)')
    parser.add_argument('--output', type=str, default='pl_data.json', help='Output JSON file path')
    parser.add_argument('--delay', type=float, default=2.0, help='Delay between requests in seconds')
    parser.add_argument('--limit', type=int, help='Limit number of matches to scrape (for testing)')
    parser.add_argument('--no-headless', action='store_true', help='Run browser in visible mode (recommended to bypass Cloudflare)')
    parser.add_argument('--skip-club-matches', action='store_true', help='Skip scraping individual club pages (faster for testing)')
    parser.add_argument('--debug', action='store_true', help='Save HTML snapshots for debugging')
    parser.add_argument('--debug-dir', type=str, default='backend/debug_html', help='Directory to save debug HTML files')
    
    args = parser.parse_args()
    
    logger.info("Starting comprehensive fbref.com scraper")
    logger.info(f"Arguments: season={args.season}, output={args.output}, delay={args.delay}s, limit={args.limit}")
    if args.skip_club_matches:
        logger.info("  ⚡ Fast mode: Skipping club match pages")
    # Debug directory will be set after backend_dir is determined
    
    if not args.season:
        # Default to 2025-2026 season (25/26)
        season = "25/26"
        logger.info(f"No season specified, using current season: {season}")
    else:
        season = args.season
    
    # Normalize season for output directory
    if '/' in season:
        parts = season.split('/')
        year1 = int(parts[0])
        year2 = int(parts[1])
        if year1 < 50:
            year1 = 2000 + year1
        if year2 < 50:
            year2 = 2000 + year2
        season_normalized = f"{year1}-{year2}"
    else:
        season_normalized = season
    
    # Get the backend directory (parent of scripts directory)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(script_dir)
    output_dir = os.path.join(backend_dir, "data", season_normalized)
    
    # Resolve debug directory path
    if args.debug:
        if args.debug_dir:
            # If relative path, make it relative to backend directory
            if not os.path.isabs(args.debug_dir):
                # Remove 'backend/' prefix if present
                debug_path = args.debug_dir.replace('backend/', '').replace('backend\\', '')
                debug_dir = os.path.join(backend_dir, debug_path)
            else:
                debug_dir = args.debug_dir
        else:
            debug_dir = os.path.join(backend_dir, "debug_html")
        logger.info(f"  🐛 Debug directory: {debug_dir}")
    else:
        debug_dir = None
    
    start_time = time.time()
    
    data = scrape_season_comprehensive(
        season,
        delay=args.delay,
        limit=args.limit,
        headless=not args.no_headless,
        output_dir=output_dir
    )
    
    elapsed_time = time.time() - start_time
    
    if data['matches']:
        logger.info("=" * 80)
        logger.info(f"✓ Scraping complete!")
        logger.info(f"  Total matches: {len(data['matches'])}")
        logger.info(f"  Unique players: {len(data['players'])}")
        logger.info(f"  Unique clubs: {len(data['clubs'])}")
        logger.info(f"  Time elapsed: {elapsed_time:.1f} seconds ({elapsed_time/60:.1f} minutes)")
        logger.info(f"  Output directory: {output_dir}")
        logger.info(f"  - Index file: {output_dir}/index.json")
        logger.info(f"  - Match files: {output_dir}/matches/ ({(len(data['matches']))} files)")
        logger.info("=" * 80)
    else:
        logger.error("✗ No matches scraped.")


if __name__ == '__main__':
    main()

