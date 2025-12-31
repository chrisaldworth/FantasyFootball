#!/usr/bin/env python3
"""
Quick script to check how many match report links are on the fbref.com schedule page
Usage: python scripts/check_fbref_match_count.py --season 2023-2024
"""

import argparse
import sys
import time
import re

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    from selenium.common.exceptions import TimeoutException
except ImportError:
    print("Error: selenium is not installed. Install it with: pip install selenium")
    sys.exit(1)

import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


def setup_driver(headless: bool = True):
    """Setup Chrome WebDriver"""
    chrome_options = Options()
    if headless:
        chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    try:
        import undetected_chromedriver as uc
        uc_options = uc.ChromeOptions()
        if headless:
            uc_options.add_argument('--headless=new')
        driver = uc.Chrome(options=uc_options, version_main=None)
        return driver
    except:
        from selenium.webdriver.chrome.service import Service
        service = Service()
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver


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
    else:
        season_slug = season
    
    return f"https://fbref.com/en/comps/9/{season_slug}/schedule/{season_slug}-Premier-League-Scores-and-Fixtures"


def main():
    parser = argparse.ArgumentParser(description="Check match count on fbref.com schedule page")
    parser.add_argument("--season", default="2023-2024", help="Season (e.g., 2023-2024)")
    parser.add_argument("--no-headless", action="store_true", help="Run browser in visible mode")
    args = parser.parse_args()
    
    url = get_season_url(args.season)
    logger.info(f"Checking: {url}")
    
    driver = setup_driver(headless=not args.no_headless)
    
    try:
        driver.get(url)
        
        # Wait for page to load and handle Cloudflare
        if not args.no_headless:
            logger.info("Browser opened - please complete Cloudflare if needed")
            logger.info("Waiting 15 seconds for Cloudflare verification...")
            time.sleep(15)
        else:
            time.sleep(5)
        
        # Wait for table with longer timeout
        try:
            WebDriverWait(driver, 60).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )
        except TimeoutException:
            logger.error("Timeout waiting for page to load. Page title: " + driver.title)
            logger.error("Current URL: " + driver.current_url)
            if "just a moment" in driver.title.lower() or "checking" in driver.title.lower():
                logger.error("Still on Cloudflare challenge page. Please run with --no-headless to complete verification manually.")
            return 1
        
        time.sleep(3)
        
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
            return 1
        
        # Get all rows
        tbody = table.find_element(By.TAG_NAME, "tbody")
        rows = tbody.find_elements(By.TAG_NAME, "tr")
        logger.info(f"Found {len(rows)} rows in table")
        
        # Count matches with report links
        matches_with_reports = 0
        matches_without_reports = 0
        all_match_links = []
        
        # Get Premier League clubs for filtering
        pl_clubs = {
            'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton',
            'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich',
            'Leicester', 'Liverpool', 'Manchester City', 'Manchester Utd',
            'Newcastle Utd', 'Nottingham Forest', 'Southampton', 'Tottenham',
            'West Ham', 'Wolves'
        }
        
        for row in rows:
            try:
                # Skip header rows
                if row.find_elements(By.TAG_NAME, "th") and not row.find_elements(By.TAG_NAME, "td"):
                    continue
                
                cells = row.find_elements(By.TAG_NAME, "td")
                if len(cells) < 5:
                    continue
                
                # Check for team links
                team_links = row.find_elements(By.XPATH, ".//a[contains(@href, '/squads/')]")
                if len(team_links) < 2:
                    continue
                
                home_team = team_links[0].text.strip()
                away_team = team_links[1].text.strip()
                
                # Only count Premier League matches
                if home_team not in pl_clubs or away_team not in pl_clubs:
                    continue
                
                # Check for match report link
                all_links = row.find_elements(By.TAG_NAME, "a")
                has_match_report = False
                
                for link in all_links:
                    href = link.get_attribute("href") or ""
                    # Match report URLs have: /matches/{8-char hex_id}/
                    if re.search(r'/matches/([a-f0-9]{8})/', href) and '/squads/' not in href and '/players/' not in href:
                        has_match_report = True
                        all_match_links.append({
                            'home': home_team,
                            'away': away_team,
                            'url': href
                        })
                        break
                
                if has_match_report:
                    matches_with_reports += 1
                else:
                    matches_without_reports += 1
                    logger.debug(f"No match report: {home_team} vs {away_team}")
                    
            except Exception as e:
                logger.debug(f"Error processing row: {e}")
                continue
        
        logger.info("")
        logger.info("=" * 80)
        logger.info("RESULTS")
        logger.info("=" * 80)
        logger.info(f"Total Premier League matches found: {matches_with_reports + matches_without_reports}")
        logger.info(f"  - Matches WITH match report links: {matches_with_reports}")
        logger.info(f"  - Matches WITHOUT match report links: {matches_without_reports}")
        logger.info(f"")
        logger.info(f"Expected for full season: 380 matches")
        logger.info(f"Missing: {380 - (matches_with_reports + matches_without_reports)} matches")
        logger.info("=" * 80)
        
        if matches_with_reports + matches_without_reports < 380:
            logger.warning(f"⚠ Only found {matches_with_reports + matches_without_reports} matches, expected 380")
            logger.warning("This suggests some matches are missing from the schedule page")
        elif matches_with_reports < 380:
            logger.warning(f"⚠ Found all {matches_with_reports + matches_without_reports} matches, but only {matches_with_reports} have match reports")
            logger.warning("Some matches may not have match reports available yet")
        else:
            logger.info(f"✓ Found all 380 matches with match reports!")
        
        return 0
        
    finally:
        driver.quit()


if __name__ == "__main__":
    sys.exit(main())

