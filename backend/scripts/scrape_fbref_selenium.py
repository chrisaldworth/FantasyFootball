#!/usr/bin/env python3
"""
Selenium-based scraper for Premier League historical results from fbref.com
Uses browser automation to bypass anti-scraping protection.

Usage:
    python scripts/scrape_fbref_selenium.py [--season SEASON] [--output OUTPUT_FILE] [--limit LIMIT]
    
Example:
    python scripts/scrape_fbref_selenium.py --season 2023-2024 --output pl_results_2023_2024.csv --limit 10
"""

import argparse
import csv
import time
import random
from datetime import datetime
from typing import List, Dict, Optional
import sys
import os
import logging

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
except ImportError:
    print("Error: selenium is not installed. Install it with: pip install selenium")
    print("Also install ChromeDriver: brew install chromedriver (on macOS) or download from https://chromedriver.chromium.org/")
    sys.exit(1)

# Add parent directory to path to import app modules if needed
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


def get_season_url(season: str) -> str:
    """Get the fbref.com URL for a specific Premier League season"""
    season_slug = season.replace('-', '-')
    return f"https://fbref.com/en/comps/9/{season_slug}/schedule/{season_slug}-Premier-League-Scores-and-Fixtures"


def setup_driver(headless: bool = True):
    """Setup Chrome WebDriver with appropriate options"""
    logger.info("Setting up Chrome WebDriver...")
    chrome_options = Options()
    if headless:
        chrome_options.add_argument('--headless')
        logger.info("Running in headless mode")
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        # Execute script to remove webdriver property
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        logger.info("✓ Chrome WebDriver initialized successfully")
        return driver
    except Exception as e:
        logger.error(f"Error setting up Chrome driver: {e}")
        logger.error("Make sure ChromeDriver is installed and in your PATH")
        logger.error("On macOS: brew install chromedriver")
        logger.error("Or download from: https://chromedriver.chromium.org/")
        raise


def scrape_match_details_selenium(driver: webdriver.Chrome, match_url: str, home_team: str = None, away_team: str = None, delay: float = 2.0) -> Dict[str, any]:
    """
    Scrape detailed match information from a match report page using Selenium
    
    Args:
        driver: Selenium WebDriver instance
        match_url: Full URL to the match report page
        home_team: Home team name
        away_team: Away team name
        delay: Delay before request
    
    Returns:
        Dictionary with match details (goal scorers, assists, cards, etc.)
    """
    if not match_url:
        return {}
    
    details = {}
    home_scorers = []
    away_scorers = []
    home_assists = []
    away_assists = []
    home_cards = []
    away_cards = []
    
    try:
        # Random delay to appear more human-like
        wait_time = delay + random.uniform(0.5, 2.0)
        logger.debug(f"  Waiting {wait_time:.1f}s before loading match page...")
        time.sleep(wait_time)
        
        # Step 1: Navigate to the match page (might be date-only URL)
        logger.debug(f"  Step 1: Loading match page: {match_url}")
        driver.get(match_url)
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        time.sleep(1)
        
        # Check if URL is date-only (e.g., /en/matches/2023-08-11)
        # If so, find the specific match on the date page
        if home_team and away_team and len(match_url.split('/')) <= 5:
            logger.debug(f"  Date-only URL detected, finding specific match for {home_team} vs {away_team}...")
            
            # Find the specific match link on the date page
            # Need to find Premier League match specifically (not women's, youth, etc.)
            normalized_home = home_team.lower().replace("'", "").replace(" ", "-")
            normalized_away = away_team.lower().replace("'", "").replace(" ", "-")
            
            # Look for match links that contain both team names and are Premier League
            match_links = driver.find_elements(By.XPATH, "//a[contains(@href, '/matches/') and not(contains(@href, '/squads/')) and not(contains(@href, '/players/'))]")
            
            best_match = None
            for link in match_links:
                href = link.get_attribute("href") or ""
                link_text = link.text.lower()
                
                # Check if this is a Premier League match
                # Premier League matches usually have "Premier League" in the URL or nearby text
                parent_text = ""
                try:
                    parent = link.find_element(By.XPATH, "./..")
                    parent_text = parent.text.lower()
                except:
                    pass
                
                # Prioritize matches that:
                # 1. Have both team names in URL or text
                # 2. Are Premier League (not women's, youth, etc.)
                has_both_teams = (normalized_home in href.lower() and normalized_away in href.lower()) or \
                                (home_team.lower() in link_text and away_team.lower() in link_text) or \
                                (home_team.lower() in parent_text and away_team.lower() in parent_text)
                
                is_premier_league = "premier league" in href.lower() or "premier league" in link_text or "premier league" in parent_text
                is_not_womens = "women" not in href.lower() and "women" not in link_text and "women" not in parent_text
                is_not_youth = "youth" not in href.lower() and "youth" not in link_text
                
                if has_both_teams and is_not_womens and is_not_youth:
                    if is_premier_league:
                        best_match = link
                        logger.debug(f"  Found Premier League match link: {href}")
                        break
                    elif not best_match:  # Keep as fallback if no Premier League match found
                        best_match = link
            
            if best_match:
                logger.debug(f"  Clicking match link...")
                match_url = best_match.get_attribute("href")
                driver.get(match_url)  # Use get() instead of click() for reliability
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
                time.sleep(1)
            else:
                logger.warning(f"  Could not find Premier League match link on date page")
                return {}
        
        # Step 2: Find and click the "Match Report" link on the match page
        logger.debug(f"  Step 2: Looking for 'Match Report' link...")
        match_report_link = None
        
        # Try various ways to find the match report link
        # Look for links with text containing "Match Report" or "Report"
        report_links = driver.find_elements(By.XPATH, "//a[contains(text(), 'Match Report') or contains(text(), 'Report') or contains(@href, '/match-report/')]")
        
        for link in report_links:
            href = link.get_attribute("href") or ""
            link_text = link.text.strip().lower()
            # Exclude navigation and other non-report links
            if '/match-report/' in href or ('match' in link_text and 'report' in link_text):
                match_report_link = link
                logger.debug(f"  Found Match Report link: {href}")
                break
        
        if not match_report_link:
            # Try finding by href pattern
            all_links = driver.find_elements(By.TAG_NAME, "a")
            for link in all_links:
                href = link.get_attribute("href") or ""
                if '/match-report/' in href:
                    match_report_link = link
                    logger.debug(f"  Found Match Report link by href: {href}")
                    break
        
        if match_report_link:
            logger.debug(f"  Clicking Match Report link...")
            match_report_url = match_report_link.get_attribute("href")
            driver.get(match_report_url)  # Use get() instead of click() for reliability
            
            # Wait for match report page to load
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            time.sleep(2)  # Additional delay for match report page
            logger.debug("  Match report page loaded, extracting goal scorers...")
        else:
            logger.warning(f"  Could not find Match Report link, trying to extract from current page...")
            time.sleep(1)
        
        # Look for goal scorers in various possible locations
        # fbref.com typically has goal scorers in tables or divs with specific classes
        
        # Method 1: Look for "Scorers" section or table on match report page
        try:
            # fbref.com match report pages have goal scorers in specific sections
            # Look for divs with id containing "events" or "scorers"
            events_sections = driver.find_elements(By.XPATH, "//div[contains(@id, 'events') or contains(@id, 'scorers') or contains(@class, 'events')]")
            
            # Also try to find tables with scorer information
            scorer_tables = driver.find_elements(By.XPATH, "//table[contains(@class, 'stats_table') or contains(@id, 'scorers') or contains(@id, 'events')]")
            
            # Also try finding by header text
            if not scorer_tables:
                all_tables = driver.find_elements(By.TAG_NAME, "table")
                for table in all_tables:
                    try:
                        headers = table.find_elements(By.TAG_NAME, "th")
                        header_text = ' '.join([h.text.lower() for h in headers])
                        if 'scorer' in header_text or ('goal' in header_text and 'time' in header_text) or 'minute' in header_text:
                            scorer_tables.append(table)
                    except:
                        continue
            
            logger.debug(f"  Found {len(events_sections)} events sections and {len(scorer_tables)} potential scorer tables")
            
            # First, try extracting from events sections (divs)
            if events_sections:
                for section in events_sections:
                    # Look for goal events in the section
                    goal_elements = section.find_elements(By.XPATH, ".//div[contains(@class, 'event') or contains(text(), 'Goal')] | .//span[contains(text(), 'Goal')]")
                    for elem in goal_elements:
                        try:
                            # Find player link
                            player_link = elem.find_element(By.XPATH, ".//a[contains(@href, '/players/')]")
                            if player_link:
                                player_name = player_link.text.strip()
                                # Extract time
                                elem_text = elem.text
                                time_match = re.search(r"(\d+['\+]?|\d+\s*min)", elem_text)
                                time_str = time_match.group(1) if time_match else None
                                
                                # Determine home/away
                                parent = elem.find_element(By.XPATH, "./..")
                                parent_classes = parent.get_attribute("class") or ""
                                is_home = "home" in parent_classes.lower()
                                
                                scorer_text = player_name
                                if time_str:
                                    scorer_text += f" {time_str}"
                                
                                if is_home:
                                    home_scorers.append(scorer_text)
                                else:
                                    away_scorers.append(scorer_text)
                        except:
                            continue
            
            for table in scorer_tables:
                rows = table.find_elements(By.TAG_NAME, "tr")
                for row in rows[1:]:  # Skip header
                    try:
                        cells = row.find_elements(By.TAG_NAME, "td")
                        if len(cells) < 2:
                            continue
                        
                        # Look for player links
                        player_links = row.find_elements(By.XPATH, ".//a[contains(@href, '/players/')]")
                        if not player_links:
                            continue
                        
                        player_name = player_links[0].text.strip()
                        
                        # Extract time from cells
                        time_str = None
                        for cell in cells:
                            cell_text = cell.text.strip()
                            if "'" in cell_text or "+" in cell_text or "min" in cell_text.lower():
                                time_str = cell_text
                                break
                        
                        # Determine if home or away (usually based on table position or class)
                        row_classes = row.get_attribute("class") or ""
                        parent_classes = row.find_element(By.XPATH, "./..").get_attribute("class") or ""
                        is_home = "home" in row_classes.lower() or "home" in parent_classes.lower()
                        
                        # Check if this is a goal (look for goal indicators)
                        row_text = row.text.lower()
                        if "goal" in row_text or "⚽" in row_text or any(cell.text.strip() == "⚽" for cell in cells):
                            scorer_text = player_name
                            if time_str:
                                scorer_text += f" {time_str}"
                            if is_home:
                                home_scorers.append(scorer_text)
                            else:
                                away_scorers.append(scorer_text)
                        
                        # Check for assists
                        elif "assist" in row_text:
                            assist_text = player_name
                            if time_str:
                                assist_text += f" {time_str}"
                            if is_home:
                                home_assists.append(assist_text)
                            else:
                                away_assists.append(assist_text)
                        
                        # Check for cards
                        elif "yellow" in row_text or "red" in row_text or "card" in row_text:
                            card_type = "R" if "red" in row_text else "Y"
                            card_text = f"{player_name} ({card_type})"
                            if time_str:
                                card_text += f" {time_str}"
                            if is_home:
                                home_cards.append(card_text)
                            else:
                                away_cards.append(card_text)
                    except Exception as e:
                        continue
        except Exception as e:
            pass
        
        # Method 2: Look for event lists or divs with goal information
        try:
            # Look for divs containing goal information
            event_divs = driver.find_elements(By.XPATH, "//div[contains(@class, 'event') or contains(@id, 'events')]")
            
            for div in event_divs:
                try:
                    # Look for player links
                    player_links = div.find_elements(By.XPATH, ".//a[contains(@href, '/players/')]")
                    if not player_links:
                        continue
                    
                    player_name = player_links[0].text.strip()
                    div_text = div.text.lower()
                    
                    # Extract time
                    time_match = None
                    import re
                    time_match = re.search(r"(\d+['\+]?|\d+\s*min)", div.text)
                    time_str = time_match.group(1) if time_match else None
                    
                    # Determine home/away
                    parent = div.find_element(By.XPATH, "./..")
                    parent_classes = parent.get_attribute("class") or ""
                    is_home = "home" in parent_classes.lower()
                    
                    # Check event type
                    if "goal" in div_text or "⚽" in div_text:
                        scorer_text = player_name
                        if time_str:
                            scorer_text += f" {time_str}"
                        if is_home:
                            home_scorers.append(scorer_text)
                        else:
                            away_scorers.append(scorer_text)
                    elif "assist" in div_text:
                        assist_text = player_name
                        if time_str:
                            assist_text += f" {time_str}"
                        if is_home:
                            home_assists.append(assist_text)
                        else:
                            away_assists.append(assist_text)
                    elif "yellow" in div_text or "red" in div_text:
                        card_type = "R" if "red" in div_text else "Y"
                        card_text = f"{player_name} ({card_type})"
                        if time_str:
                            card_text += f" {time_str}"
                        if is_home:
                            home_cards.append(card_text)
                        else:
                            away_cards.append(card_text)
                except Exception:
                    continue
        except Exception:
            pass
        
        # Store results
        if home_scorers:
            details['home_scorers'] = '; '.join(home_scorers)
            logger.debug(f"    Found {len(home_scorers)} home scorers")
        if away_scorers:
            details['away_scorers'] = '; '.join(away_scorers)
            logger.debug(f"    Found {len(away_scorers)} away scorers")
        if home_assists:
            details['home_assists'] = '; '.join(home_assists)
        if away_assists:
            details['away_assists'] = '; '.join(away_assists)
        if home_cards:
            details['home_cards'] = '; '.join(home_cards)
        if away_cards:
            details['away_cards'] = '; '.join(away_cards)
        
        if details.get('home_scorers') or details.get('away_scorers'):
            logger.info(f"    ✓ Found goal scorers: {len(home_scorers)} home, {len(away_scorers)} away")
        
    except TimeoutException:
        logger.warning(f"  ⚠ Timeout loading match page: {match_url}")
    except Exception as e:
        logger.error(f"  ✗ Error scraping match details: {e}")
    
    return details


def scrape_season_results_selenium(season: str, delay: float = 2.0, include_details: bool = True, limit: int = None, headless: bool = True) -> List[Dict[str, str]]:
    """
    Scrape all match results for a Premier League season from fbref.com using Selenium
    
    Args:
        season: Season in format "2023-2024"
        delay: Delay between requests in seconds
        include_details: Whether to scrape match details (goal scorers, etc.)
        limit: Limit number of matches to scrape (for testing)
        headless: Run browser in headless mode
    
    Returns:
        List of dictionaries containing match data
    """
    url = get_season_url(season)
    logger.info(f"=" * 80)
    logger.info(f"Scraping {season} season from: {url}")
    logger.info(f"=" * 80)
    
    driver = setup_driver(headless=headless)
    matches = []
    
    try:
        # Navigate to season page
        logger.info("Loading season schedule page...")
        driver.get(url)
        
        # Wait for page to load
        logger.info("Waiting for page to load...")
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.TAG_NAME, "tbody"))
        )
        
        time.sleep(2)  # Additional delay for JavaScript
        logger.info("✓ Page loaded successfully")
        
        # Find the results table
        logger.info("Finding results table...")
        try:
            table = driver.find_element(By.XPATH, "//table[@id[contains(., 'sched')] or contains(@class, 'stats_table')]")
        except NoSuchElementException:
            # Try alternative selector
            table = driver.find_element(By.TAG_NAME, "table")
        
        tbody = table.find_element(By.TAG_NAME, "tbody")
        rows = tbody.find_elements(By.TAG_NAME, "tr")
        
        logger.info(f"✓ Found {len(rows)} rows in results table")
        
        if limit:
            rows = rows[:limit]
            logger.info(f"⚠ Limiting to first {limit} matches for testing")
        
        total_rows = len(rows)
        logger.info(f"Processing {total_rows} matches...")
        logger.info("-" * 80)
        
        for row_idx in range(total_rows):
            progress = f"[{row_idx + 1}/{total_rows}]"
            logger.info(f"{progress} Processing match {row_idx + 1}...")
            try:
                # Re-find the table and row each time to avoid stale element references
                # This is necessary because we navigate away for match details
                table = driver.find_element(By.XPATH, "//table[@id[contains(., 'sched')] or contains(@class, 'stats_table')]")
                tbody = table.find_element(By.TAG_NAME, "tbody")
                current_rows = tbody.find_elements(By.TAG_NAME, "tr")
                
                if row_idx >= len(current_rows):
                    logger.warning(f"  {progress} Row index {row_idx} out of range, skipping...")
                    continue
                
                row = current_rows[row_idx]
                
                # Skip header rows
                if row.find_elements(By.TAG_NAME, "th") and not row.find_elements(By.TAG_NAME, "td"):
                    continue
                
                cells = row.find_elements(By.TAG_NAME, "td")
                if len(cells) < 5:
                    continue
                
                match_data = {'season': season}
                
                # Find team names (links with /squads/)
                team_links = row.find_elements(By.XPATH, ".//a[contains(@href, '/squads/')]")
                if len(team_links) >= 2:
                    match_data['home_team'] = team_links[0].text.strip()
                    match_data['away_team'] = team_links[1].text.strip()
                else:
                    continue
                
                # Find date
                for cell in cells:
                    text = cell.text.strip()
                    if ('-' in text and len(text) >= 8) or (',' in text and any(char.isdigit() for char in text)):
                        if any(char.isdigit() for char in text[:4]):
                            match_data['date'] = text
                            break
                
                # Find score
                for cell in cells:
                    text = cell.text.strip()
                    if '–' in text or (text.count('-') == 1 and any(char.isdigit() for char in text)):
                        score_parts = text.replace('–', '-').split('-')
                        if len(score_parts) == 2:
                            match_data['home_score'] = score_parts[0].strip()
                            match_data['away_score'] = score_parts[1].strip()
                        break
                    elif text in ['W', 'L', 'D']:
                        match_data['result'] = text
                        break
                
                # Find week
                first_cell = cells[0].text.strip()
                if first_cell.isdigit():
                    match_data['week'] = first_cell
                
                # Find match report link
                match_report_url = None
                all_links = row.find_elements(By.TAG_NAME, "a")
                for link in all_links:
                    href = link.get_attribute("href") or ""
                    link_text = link.text.strip().lower()
                    # Look for match report links - prefer full URLs over date-only
                    if ('/matches/' in href or '/match-report/' in href) and '/squads/' not in href and '/players/' not in href:
                        # Check if it's a full match URL (has more path segments) or if link text indicates it's a match report
                        url_parts = href.split('/')
                        is_full_url = len(url_parts) > 5  # Full URLs have more segments
                        if is_full_url or 'match' in link_text or 'report' in link_text:
                            match_report_url = href
                            # Prefer full URLs over date-only
                            if is_full_url:
                                break
                
                if match_report_url:
                    match_data['match_report_url'] = match_report_url
                
                # Find attendance and referee
                for cell in cells:
                    text = cell.text.strip()
                    if ',' in text and text.replace(',', '').isdigit():
                        match_data['attendance'] = text
                    elif len(text) > 5 and not any(char.isdigit() for char in text) and ' ' in text:
                        if 'attendance' not in match_data or match_data.get('attendance') != text:
                            match_data['referee'] = text
                
                # Only add if we have essential data
                if match_data.get('home_team') and match_data.get('away_team'):
                    match_info = f"{match_data['home_team']} vs {match_data['away_team']}"
                    if match_data.get('home_score') and match_data.get('away_score'):
                        match_info += f" ({match_data['home_score']}-{match_data['away_score']})"
                    logger.info(f"  {progress} Match: {match_info}")
                    
                    # If include_details is True and we have a match report URL, scrape details
                    if include_details and match_data.get('match_report_url'):
                        logger.info(f"  {progress} Scraping match details...")
                        details = scrape_match_details_selenium(
                            driver,
                            match_data['match_report_url'],
                            home_team=match_data.get('home_team'),
                            away_team=match_data.get('away_team'),
                            delay=delay
                        )
                        if details:
                            match_data.update(details)
                            if not (details.get('home_scorers') or details.get('away_scorers')):
                                logger.warning(f"  {progress} ⚠ No goal scorers found for this match")
                        else:
                            logger.warning(f"  {progress} ⚠ No match details extracted")
                        
                        # Navigate back to the season page after scraping details
                        logger.debug(f"  {progress} Navigating back to season page...")
                        driver.get(url)
                        WebDriverWait(driver, 10).until(
                            EC.presence_of_element_located((By.TAG_NAME, "tbody"))
                        )
                        time.sleep(1)  # Small delay for page to stabilize
                    else:
                        if not include_details:
                            logger.debug(f"  {progress} Skipping details (--no-details flag)")
                        elif not match_data.get('match_report_url'):
                            logger.warning(f"  {progress} ⚠ No match report URL found")
                    
                    matches.append(match_data)
                    logger.info(f"  {progress} ✓ Match added to results")
                else:
                    logger.warning(f"  {progress} ⚠ Skipping row - missing team data")
            
            except Exception as e:
                logger.error(f"  {progress} ✗ Error parsing row {row_idx + 1}: {e}")
                # Try to navigate back to season page if we're on a different page
                try:
                    current_url = driver.current_url
                    if '/matches/' in current_url or '/match-report/' in current_url:
                        logger.debug(f"  {progress} Navigating back to season page after error...")
                        driver.get(url)
                        WebDriverWait(driver, 10).until(
                            EC.presence_of_element_located((By.TAG_NAME, "tbody"))
                        )
                        time.sleep(1)
                except:
                    pass
                continue
            
            logger.info("-" * 80)
        
        logger.info("=" * 80)
        logger.info(f"✓ Successfully scraped {len(matches)} matches for {season}")
        
        # Summary statistics
        if include_details:
            matches_with_scorers = sum(1 for m in matches if m.get('home_scorers') or m.get('away_scorers'))
            logger.info(f"  - Matches with goal scorers: {matches_with_scorers}/{len(matches)}")
        
        logger.info("=" * 80)
        
    except Exception as e:
        logger.error(f"✗ Error scraping season: {e}")
        import traceback
        traceback.print_exc()
    finally:
        logger.info("Closing browser...")
        driver.quit()
        logger.info("✓ Browser closed")
    
    return matches


def save_to_csv(matches: List[Dict[str, str]], output_file: str):
    """Save matches to CSV file"""
    if not matches:
        logger.warning("No data to write to CSV.")
        return
    
    logger.info(f"Saving {len(matches)} matches to CSV file: {output_file}")
    
    # Get all unique keys from all matches
    all_keys = set()
    for row in matches:
        all_keys.update(row.keys())
    
    # Define a preferred order for common keys
    preferred_order = [
        'season', 'week', 'date', 'home_team', 'away_team', 
        'home_score', 'away_score', 'result', 'home_scorers', 'away_scorers',
        'home_assists', 'away_assists', 'home_cards', 'away_cards',
        'attendance', 'venue', 'referee', 'match_report_url', 'notes'
    ]
    
    # Create final headers list
    headers = [key for key in preferred_order if key in all_keys]
    remaining_keys = sorted([key for key in all_keys if key not in preferred_order])
    headers.extend(remaining_keys)
    
    os.makedirs(os.path.dirname(output_file) or '.', exist_ok=True)
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=headers)
        writer.writeheader()
        writer.writerows(matches)
    logger.info(f"✓ Successfully saved {len(matches)} matches to {output_file}")


def main():
    parser = argparse.ArgumentParser(description='Scrape Premier League results from fbref.com using Selenium')
    parser.add_argument('--season', type=str, help='Season to scrape (e.g., 2023-2024)')
    parser.add_argument('--output', type=str, default='pl_results.csv', help='Output CSV file path')
    parser.add_argument('--delay', type=float, default=2.0, help='Delay between requests in seconds')
    parser.add_argument('--no-details', action='store_true', help='Skip scraping match details (goal scorers, etc.)')
    parser.add_argument('--limit', type=int, help='Limit number of matches to scrape (for testing)')
    parser.add_argument('--no-headless', action='store_true', help='Run browser in visible mode (for debugging)')
    
    args = parser.parse_args()
    
    logger.info("Starting fbref.com scraper with Selenium")
    logger.info(f"Arguments: season={args.season}, output={args.output}, delay={args.delay}s, limit={args.limit}, details={not args.no_details}")
    
    if not args.season:
        # Default to current season
        current_year = datetime.now().year
        current_month = datetime.now().month
        if current_month >= 8:
            season = f"{current_year}-{current_year + 1}"
        else:
            season = f"{current_year - 1}-{current_year}"
        logger.info(f"No season specified, using current season: {season}")
    else:
        season = args.season
    
    start_time = time.time()
    
    matches = scrape_season_results_selenium(
        season, 
        delay=args.delay, 
        include_details=not args.no_details, 
        limit=args.limit,
        headless=not args.no_headless
    )
    
    elapsed_time = time.time() - start_time
    
    if matches:
        save_to_csv(matches, args.output)
        logger.info("=" * 80)
        logger.info(f"✓ Scraping complete!")
        logger.info(f"  Total matches: {len(matches)}")
        logger.info(f"  Time elapsed: {elapsed_time:.1f} seconds ({elapsed_time/60:.1f} minutes)")
        logger.info(f"  Output file: {args.output}")
        logger.info("=" * 80)
    else:
        logger.error("✗ No matches found. Check the season URL and page structure.")


if __name__ == '__main__':
    main()

