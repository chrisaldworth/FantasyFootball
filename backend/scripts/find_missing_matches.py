#!/usr/bin/env python3
"""
Find missing matches for a season by comparing scraped files with expected fixtures
Usage: python scripts/find_missing_matches.py --season 2023-2024
"""

import argparse
import json
import os
from pathlib import Path
from typing import Set, List, Dict
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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
    else:
        season_slug = season
    
    return f"https://fbref.com/en/comps/9/{season_slug}/schedule/{season_slug}-Premier-League-Scores-and-Fixtures"


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


def get_expected_fixtures(season: str, headless: bool = True) -> List[Dict]:
    """Get all expected fixtures from fbref.com schedule page"""
    logger.info(f"Fetching fixtures from fbref.com for season {season}")
    
    url = get_season_url(season)
    logger.info(f"URL: {url}")
    
    driver = setup_driver(headless)
    
    try:
        driver.get(url)
        
        # Wait for page to load
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.TAG_NAME, "table"))
        )
        
        # Find the fixtures table
        table = driver.find_element(By.ID, "sched_2023-2024_9_1")  # Adjust ID based on season
        
        # Get all match rows
        rows = table.find_elements(By.TAG_NAME, "tr")
        
        fixtures = []
        for row in rows:
            try:
                # Skip header rows
                if 'thead' in row.get_attribute('class') or '':
                    continue
                
                cells = row.find_elements(By.TAG_NAME, "td")
                if len(cells) < 4:
                    continue
                
                # Extract date
                date_cell = cells[0]
                date_text = date_cell.text.strip()
                if not date_text or date_text == 'Date':
                    continue
                
                # Extract teams
                home_team = cells[2].text.strip()
                away_team = cells[4].text.strip()
                
                # Extract match report link if available
                match_link = None
                try:
                    link_elem = cells[5].find_element(By.TAG_NAME, "a")
                    match_link = link_elem.get_attribute('href')
                except:
                    pass
                
                if home_team and away_team:
                    fixtures.append({
                        'date': date_text,
                        'home_team': home_team,
                        'away_team': away_team,
                        'match_link': match_link,
                    })
            except Exception as e:
                logger.debug(f"Error parsing row: {e}")
                continue
        
        logger.info(f"Found {len(fixtures)} expected fixtures")
        return fixtures
        
    finally:
        driver.quit()


def get_scraped_matches(season: str, data_dir: Path) -> Set[str]:
    """Get set of already scraped matches"""
    matches_dir = data_dir / season / "matches"
    
    if not matches_dir.exists():
        return set()
    
    scraped = set()
    for match_file in matches_dir.glob("*.json"):
        # Extract match identifier from filename
        # Format: match_2023_08_12_Arsenal_vs_Nottham_Forest.json
        filename = match_file.stem
        scraped.add(filename)
    
    return scraped


def normalize_match_name(date: str, home: str, away: str) -> str:
    """Create normalized match filename"""
    # Parse date and format as YYYY_MM_DD
    from datetime import datetime
    try:
        # Try different date formats
        for fmt in ['%Y-%m-%d', '%a %b %d, %Y', '%b %d, %Y', '%d %b %Y']:
            try:
                dt = datetime.strptime(date, fmt)
                date_str = dt.strftime('%Y_%m_%d')
                break
            except:
                continue
        else:
            logger.warning(f"Could not parse date: {date}")
            date_str = date.replace('-', '_').replace('/', '_')
    except:
        date_str = date.replace('-', '_').replace('/', '_')
    
    # Normalize team names
    home_norm = home.replace(' ', '_').replace('.', '').replace("'", "")
    away_norm = away.replace(' ', '_').replace('.', '').replace("'", "")
    
    return f"match_{date_str}_{home_norm}_vs_{away_norm}"


def main():
    parser = argparse.ArgumentParser(description="Find missing matches for a season")
    parser.add_argument("--season", required=True, help="Season (e.g., 2023-2024 or 23/24)")
    parser.add_argument("--data-dir", default="data", help="Data directory")
    parser.add_argument("--no-headless", action="store_true", help="Run browser in visible mode")
    args = parser.parse_args()
    
    # Resolve paths
    script_dir = Path(__file__).parent.parent
    if Path(args.data_dir).is_absolute():
        data_dir = Path(args.data_dir)
    else:
        data_dir = script_dir / args.data_dir
    
    logger.info(f"Finding missing matches for season: {args.season}")
    logger.info(f"Data directory: {data_dir}")
    
    # Get expected fixtures
    expected_fixtures = get_expected_fixtures(args.season, headless=not args.no_headless)
    
    # Get scraped matches
    scraped_matches = get_scraped_matches(args.season, data_dir)
    logger.info(f"Already scraped: {len(scraped_matches)} matches")
    
    # Find missing matches
    missing = []
    for fixture in expected_fixtures:
        match_name = normalize_match_name(
            fixture['date'],
            fixture['home_team'],
            fixture['away_team']
        )
        
        # Check if any scraped match starts with this pattern (flexible matching)
        found = False
        for scraped in scraped_matches:
            if match_name.lower() in scraped.lower() or scraped.lower() in match_name.lower():
                found = True
                break
        
        if not found:
            missing.append({
                'date': fixture['date'],
                'home_team': fixture['home_team'],
                'away_team': fixture['away_team'],
                'match_link': fixture.get('match_link'),
                'expected_filename': match_name,
            })
    
    logger.info(f"\n{'='*60}")
    logger.info(f"Missing Matches: {len(missing)}")
    logger.info(f"{'='*60}")
    
    if missing:
        print("\nMissing matches:")
        for i, match in enumerate(missing[:20], 1):  # Show first 20
            print(f"{i}. {match['date']}: {match['home_team']} vs {match['away_team']}")
        if len(missing) > 20:
            print(f"... and {len(missing) - 20} more")
        
        # Save to JSON
        output_file = data_dir / args.season / "missing_matches.json"
        output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(output_file, 'w') as f:
            json.dump(missing, f, indent=2)
        logger.info(f"\nSaved missing matches list to: {output_file}")
    else:
        logger.info("No missing matches found!")
    
    return len(missing)


if __name__ == "__main__":
    sys.exit(main())


