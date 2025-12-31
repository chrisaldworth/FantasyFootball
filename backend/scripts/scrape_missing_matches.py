#!/usr/bin/env python3
"""
Scrape only missing matches for a season
1. Gets all expected fixtures from fbref.com using the workflow script
2. Compares with existing scraped files
3. Scrapes only the missing matches using the comprehensive scraper

Usage:
    python scripts/scrape_missing_matches.py --season 2023-2024
    python scripts/scrape_missing_matches.py --season 23/24 --no-headless
"""

import argparse
import json
import os
import re
import subprocess
from pathlib import Path
from typing import List, Dict, Set
from datetime import datetime
import sys

import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


def normalize_team_name_for_file(name: str) -> str:
    """Normalize team name for filename matching"""
    # Remove common suffixes
    name = name.replace(' FC', '').replace(' United', ' Utd').replace(' City', '')
    # Replace spaces and special chars
    name = name.replace(' ', '_').replace('.', '').replace("'", "").replace('-', '_')
    # Handle special cases
    name = name.replace('Nottham_Forest', 'Nottham_Forest')  # Keep as is
    return name


def get_existing_matches(season: str, data_dir: Path) -> Set[str]:
    """Get set of already scraped matches (normalized for comparison)"""
    matches_dir = data_dir / season / "matches"
    
    if not matches_dir.exists():
        return set()
    
    existing = set()
    for match_file in matches_dir.glob("*.json"):
        filename = match_file.stem.lower()  # match_2023_08_12_Arsenal_vs_Nottham_Forest
        existing.add(filename)
    
    return existing


def match_filename_exists(date_str: str, home_team: str, away_team: str, existing_matches: Set[str]) -> bool:
    """Check if a match file already exists"""
    # Normalize date to YYYY_MM_DD format
    try:
        # Try parsing various date formats
        date_obj = None
        for fmt in ['%Y-%m-%d', '%a %b %d, %Y', '%b %d, %Y', '%d %b %Y']:
            try:
                date_obj = datetime.strptime(date_str.split()[0] if ' ' in date_str else date_str, fmt)
                break
            except:
                continue
        
        if not date_obj:
            return False
        
        date_formatted = date_obj.strftime('%Y_%m_%d')
        
        # Normalize team names
        home_norm = normalize_team_name_for_file(home_team).lower()
        away_norm = normalize_team_name_for_file(away_team).lower()
        
        # Create possible filename patterns
        patterns = [
            f"match_{date_formatted}_{home_norm}_vs_{away_norm}",
            f"match_{date_formatted}_{away_norm}_vs_{home_norm}",  # In case order is different
        ]
        
        # Check if any pattern matches existing files
        for pattern in patterns:
            for existing in existing_matches:
                # Flexible matching - check if key parts match
                if (date_formatted in existing and 
                    (home_norm[:10] in existing or away_norm[:10] in existing) and
                    (away_norm[:10] in existing or home_norm[:10] in existing)):
                    return True
        
        return False
    except Exception as e:
        logger.debug(f"Error checking match existence: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Scrape only missing matches for a season")
    parser.add_argument("--season", required=True, help="Season (e.g., 2023-2024 or 23/24)")
    parser.add_argument("--data-dir", default="data", help="Data directory")
    parser.add_argument("--no-headless", action="store_true", help="Run browser in visible mode")
    parser.add_argument("--skip-approval", action="store_true", help="Skip fixture approval step")
    args = parser.parse_args()
    
    # Resolve paths
    script_dir = Path(__file__).parent.parent
    if Path(args.data_dir).is_absolute():
        data_dir = Path(args.data_dir)
    else:
        data_dir = script_dir / args.data_dir
    
    # Normalize season
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
    
    logger.info(f"Finding and scraping missing matches for season: {season_normalized}")
    logger.info(f"Data directory: {data_dir}")
    
    # Get existing matches
    existing_matches = get_existing_matches(season_normalized, data_dir)
    logger.info(f"Found {len(existing_matches)} existing match files")
    
    # Step 1: Use workflow script to extract fixtures (but don't scrape yet)
    logger.info("\n" + "="*80)
    logger.info("Step 1: Extracting fixtures from fbref.com...")
    logger.info("="*80)
    
    # Run workflow script to get fixtures list
    workflow_script = script_dir / "scripts" / "scrape_fixtures_workflow.py"
    
    # First, let's create a modified version that outputs fixtures to JSON
    # Or we can use the workflow script with --skip-approval and parse its output
    # Actually, simpler: use the comprehensive scraper but modify it to skip existing
    
    # Better approach: Create a fixtures list file first
    logger.info("Extracting fixtures list...")
    logger.info("(This will open a browser - please complete Cloudflare if needed)")
    
    # Use Python to import and run the fixture extraction
    try:
        # Import the workflow script functions
        import importlib.util
        spec = importlib.util.spec_from_file_location("scrape_fixtures_workflow", workflow_script)
        workflow_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(workflow_module)
        
        # Setup driver
        driver = workflow_module.setup_driver(headless=not args.no_headless)
        
        try:
            # Get fixtures
            url = workflow_module.get_season_url(args.season)
            fixtures, detected_season = workflow_module.extract_fixtures_from_schedule(
                driver, url, headless=not args.no_headless
            )
            
            if not fixtures:
                logger.error("Failed to extract fixtures from fbref.com")
                return 1
            
            logger.info(f"Found {len(fixtures)} total fixtures")
            
            # Include ALL fixtures (even without match reports) to find missing ones
            logger.info(f"Found {len(fixtures)} total fixtures")
            
            # Find missing matches - check ALL fixtures, not just those with match reports
            missing_fixtures = []
            fixtures_with_reports = []
            fixtures_without_reports = []
            
            for fixture in fixtures:
                if fixture.get('match_report_url'):
                    fixtures_with_reports.append(fixture)
                else:
                    fixtures_without_reports.append(fixture)
            
            logger.info(f"  - {len(fixtures_with_reports)} fixtures with match report URLs")
            logger.info(f"  - {len(fixtures_without_reports)} fixtures without match report URLs")
            
            # Check which fixtures with reports are missing
            for fixture in fixtures_with_reports:
                date_str = fixture.get('date', '')
                home_team = fixture.get('home_team', '')
                away_team = fixture.get('away_team', '')
                
                if not match_filename_exists(date_str, home_team, away_team, existing_matches):
                    missing_fixtures.append(fixture)
            
            logger.info(f"\n{'='*60}")
            logger.info(f"Missing Matches: {len(missing_fixtures)}")
            logger.info(f"{'='*60}")
            
            # Also check fixtures without reports - they might be missing too
            logger.info(f"\nChecking fixtures without match reports...")
            missing_without_reports = []
            for fixture in fixtures_without_reports:
                date_str = fixture.get('date', '')
                home_team = fixture.get('home_team', '')
                away_team = fixture.get('away_team', '')
                
                if not match_filename_exists(date_str, home_team, away_team, existing_matches):
                    missing_without_reports.append(fixture)
            
            if missing_without_reports:
                logger.info(f"Found {len(missing_without_reports)} fixtures without match reports that are also missing from files")
                logger.info("These matches may not have match reports on fbref.com yet, or may need to be scraped differently")
            
            if not missing_fixtures and not missing_without_reports:
                logger.info("✓ No missing matches found! All matches are already scraped.")
                logger.info(f"\nNote: Found {len(fixtures)} total fixtures, but expected 380 for a full season.")
                logger.info("This suggests some matches may not be available on fbref.com, or the extraction missed some.")
                return 0
            
            # Show missing matches
            logger.info("\nMissing matches:")
            for i, fixture in enumerate(missing_fixtures[:20], 1):
                logger.info(f"  {i}. {fixture.get('date', 'Unknown')}: {fixture.get('home_team', '?')} vs {fixture.get('away_team', '?')}")
            if len(missing_fixtures) > 20:
                logger.info(f"  ... and {len(missing_fixtures) - 20} more")
            
            # Save missing fixtures to a JSON file for the scraper
            missing_file = data_dir / season_normalized / "missing_fixtures.json"
            missing_file.parent.mkdir(parents=True, exist_ok=True)
            with open(missing_file, 'w') as f:
                json.dump(missing_fixtures, f, indent=2)
            logger.info(f"\nSaved missing fixtures list to: {missing_file}")
            
            total_missing = len(missing_fixtures) + len(missing_without_reports)
            logger.info(f"\nReady to scrape {len(missing_fixtures)} missing matches with match reports.")
            if missing_without_reports:
                logger.info(f"Note: {len(missing_without_reports)} fixtures without match reports are also missing.")
                logger.info("These cannot be scraped until match reports are available on fbref.com.")
            
            if not missing_fixtures:
                logger.info("\nNo missing matches with match reports found.")
                logger.info("The missing matches may not have match reports available yet.")
                return 0
            
            # Option: Scrape them now using the comprehensive scraper
            logger.info("\n" + "="*80)
            logger.info("Step 2: Scraping missing matches...")
            logger.info("="*80)
            
            # Import comprehensive scraper functions
            comprehensive_script = script_dir / "scripts" / "scrape_fbref_comprehensive.py"
            spec2 = importlib.util.spec_from_file_location("scrape_fbref_comprehensive", comprehensive_script)
            comprehensive_module = importlib.util.module_from_spec(spec2)
            spec2.loader.exec_module(comprehensive_module)
            
            scraped_count = 0
            failed_count = 0
            output_dir = data_dir / season_normalized
            matches_dir = output_dir / "matches"
            matches_dir.mkdir(parents=True, exist_ok=True)
            
            for idx, fixture in enumerate(missing_fixtures, 1):
                logger.info("")
                logger.info("=" * 80)
                logger.info(f"[{idx}/{len(missing_fixtures)}] Scraping: {fixture.get('home_team')} vs {fixture.get('away_team')}")
                logger.info("=" * 80)
                
                try:
                    match_url = fixture['match_report_url']
                    home_team = fixture.get('home_team', '')
                    away_team = fixture.get('away_team', '')
                    
                    # Extract match data
                    match_data = comprehensive_module.extract_comprehensive_match_data(
                        driver,
                        match_url,
                        home_team=home_team,
                        away_team=away_team,
                        delay=2.0,
                        debug=False,
                        debug_dir=None,
                        headless=not args.no_headless
                    )
                    
                    # Create match filename
                    date_str = match_data['match_info'].get('date', '').replace('-', '_')
                    home_name = normalize_team_name_for_file(home_team)
                    away_name = normalize_team_name_for_file(away_team)
                    match_filename = f"match_{date_str}_{home_name}_vs_{away_name}.json"
                    match_file = matches_dir / match_filename
                    
                    # Create match entry
                    match_entry = {
                        'match_id': f"{season_normalized}_{idx}",
                        'date': match_data['match_info'].get('date'),
                        'competition': fixture.get('competition', 'Premier League'),
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
                    
                    # Save match file
                    with open(match_file, 'w', encoding='utf-8') as f:
                        json.dump(match_entry, f, indent=2, ensure_ascii=False)
                    
                    logger.info(f"✓ Saved: {match_filename}")
                    scraped_count += 1
                    
                    # Delay between matches
                    if idx < len(missing_fixtures):
                        time.sleep(2.0)
                        
                except Exception as e:
                    logger.error(f"✗ Error scraping match: {e}")
                    import traceback
                    logger.error(traceback.format_exc())
                    failed_count += 1
                    continue
            
            logger.info("")
            logger.info("=" * 80)
            logger.info(f"Scraping Complete!")
            logger.info(f"  Successfully scraped: {scraped_count}")
            logger.info(f"  Failed: {failed_count}")
            logger.info(f"  Total missing: {len(missing_fixtures)}")
            logger.info("=" * 80)
            
            return 0 if failed_count == 0 else 1
            
        finally:
            driver.quit()
            
    except Exception as e:
        logger.error(f"Error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return 1


if __name__ == "__main__":
    import time
    sys.exit(main())
