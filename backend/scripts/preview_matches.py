#!/usr/bin/env python3
"""
Preview script to list all matches that will be scraped without actually scraping them
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scrape_fbref_comprehensive import (
    get_season_url,
    get_premier_league_clubs,
    is_premier_league_club,
    scrape_club_matches_comprehensive,
    setup_driver
)
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import re
from collections import defaultdict

def preview_matches(season: str = "25/26", delay: float = 1.0):
    """Preview all matches that will be scraped"""
    
    url = get_season_url(season)
    print("=" * 80)
    print(f"Previewing matches for {season} season")
    print(f"URL: {url}")
    print("=" * 80)
    
    driver = setup_driver(headless=True)
    
    try:
        print("\nLoading season schedule page...")
        driver.get(url)
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
        time.sleep(2)
        print("✓ Page loaded")
        
        # Find results table
        table = driver.find_element(By.XPATH, "//table[@id[contains(., 'sched')] or contains(@class, 'stats_table')]")
        tbody = table.find_element(By.TAG_NAME, "tbody")
        all_rows = tbody.find_elements(By.TAG_NAME, "tr")
        
        print(f"✓ Found {len(all_rows)} total rows in results table")
        
        # Get Premier League clubs for filtering
        pl_clubs = get_premier_league_clubs()
        
        # Collect matches from season schedule
        valid_matches = []
        for row in all_rows:
            try:
                if row.find_elements(By.TAG_NAME, "th") and not row.find_elements(By.TAG_NAME, "td"):
                    continue
                
                cells = row.find_elements(By.TAG_NAME, "td")
                if len(cells) < 5:
                    continue
                
                team_links = row.find_elements(By.XPATH, ".//a[contains(@href, '/squads/')]")
                if len(team_links) < 2:
                    continue
                
                home_team = team_links[0].text.strip()
                away_team = team_links[1].text.strip()
                
                home_href = team_links[0].get_attribute("href") or ""
                away_href = team_links[1].get_attribute("href") or ""
                home_id_match = re.search(r'/squads/([a-f0-9]+)/', home_href)
                away_id_match = re.search(r'/squads/([a-f0-9]+)/', away_href)
                
                match_report_url = None
                all_links = row.find_elements(By.TAG_NAME, "a")
                for link in all_links:
                    href = link.get_attribute("href") or ""
                    if ('/matches/' in href or '/match-report/' in href) and '/squads/' not in href and '/players/' not in href:
                        url_parts = href.split('/')
                        if len(url_parts) > 4 or 'match' in link.text.lower():
                            match_report_url = href
                            if len(url_parts) > 5:
                                break
                
                if match_report_url:
                    home_is_pl = is_premier_league_club(home_team, pl_clubs)
                    away_is_pl = is_premier_league_club(away_team, pl_clubs)
                    
                    if home_is_pl or away_is_pl:
                        if home_is_pl and away_is_pl:
                            competition = "Premier League"
                        else:
                            competition = "Unknown"
                        
                        valid_matches.append({
                            'home_team': home_team,
                            'away_team': away_team,
                            'match_report_url': match_report_url,
                            'competition': competition,
                            'home_fbref_id': home_id_match.group(1) if home_id_match else None,
                            'away_fbref_id': away_id_match.group(1) if away_id_match else None
                        })
            except Exception as e:
                continue
        
        print(f"\n✓ Found {len(valid_matches)} matches from season schedule involving PL teams")
        
        # Collect unique Premier League clubs
        pl_clubs_with_ids = {}
        for match in valid_matches:
            if match.get('home_fbref_id') and is_premier_league_club(match['home_team'], pl_clubs):
                pl_clubs_with_ids[match['home_team']] = match['home_fbref_id']
            if match.get('away_fbref_id') and is_premier_league_club(match['away_team'], pl_clubs):
                pl_clubs_with_ids[match['away_team']] = match['away_fbref_id']
        
        print(f"✓ Found {len(pl_clubs_with_ids)} Premier League clubs")
        
        # Collect matches from club pages
        print("\n" + "=" * 80)
        print("Step 2: Collecting matches from individual club pages...")
        print("=" * 80)
        
        seen_match_urls = {m['match_report_url'] for m in valid_matches}
        
        for club_name, club_id in pl_clubs_with_ids.items():
            try:
                print(f"  Checking {club_name}...")
                club_matches = scrape_club_matches_comprehensive(
                    driver,
                    club_id,
                    club_name,
                    season,
                    delay=delay
                )
                
                added_count = 0
                for club_match in club_matches:
                    home_is_pl = is_premier_league_club(club_match.get('home_team', ''), pl_clubs)
                    away_is_pl = is_premier_league_club(club_match.get('away_team', ''), pl_clubs)
                    involves_pl_team = home_is_pl or away_is_pl
                    
                    if involves_pl_team and club_match['match_report_url'] not in seen_match_urls:
                        seen_match_urls.add(club_match['match_report_url'])
                        valid_matches.append(club_match)
                        added_count += 1
                
                if added_count > 0:
                    print(f"    ✓ Added {added_count} new matches for {club_name}")
                
                driver.get(url)
                WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
                time.sleep(1)
            except Exception as e:
                print(f"    ✗ Error: {e}")
                continue
        
        # Final filter
        pl_team_matches = []
        for match in valid_matches:
            home_team = match.get('home_team', '')
            away_team = match.get('away_team', '')
            home_is_pl = is_premier_league_club(home_team, pl_clubs)
            away_is_pl = is_premier_league_club(away_team, pl_clubs)
            
            if home_is_pl or away_is_pl:
                if home_is_pl and away_is_pl and match.get('competition', '').lower() == 'unknown':
                    match['competition'] = 'Premier League'
                pl_team_matches.append(match)
        
        valid_matches = pl_team_matches
        
        # Group by competition
        by_competition = defaultdict(list)
        for match in valid_matches:
            comp = match.get('competition', 'Unknown')
            by_competition[comp].append(match)
        
        # Display summary
        print("\n" + "=" * 80)
        print("MATCH PREVIEW SUMMARY")
        print("=" * 80)
        print(f"\nTotal matches to scrape: {len(valid_matches)}")
        print("\nBreakdown by competition:")
        for comp in sorted(by_competition.keys()):
            print(f"  - {comp}: {len(by_competition[comp])} matches")
        
        # Display all matches grouped by competition
        print("\n" + "=" * 80)
        print("ALL MATCHES TO BE SCRAPED:")
        print("=" * 80)
        
        for comp in sorted(by_competition.keys()):
            print(f"\n{comp} ({len(by_competition[comp])} matches):")
            print("-" * 80)
            for i, match in enumerate(by_competition[comp], 1):
                home = match['home_team']
                away = match['away_team']
                home_pl = "✓" if is_premier_league_club(home, pl_clubs) else " "
                away_pl = "✓" if is_premier_league_club(away, pl_clubs) else " "
                print(f"  {i:3d}. {home_pl} {home:30s} vs {away_pl} {away:30s}")
        
        print("\n" + "=" * 80)
        print(f"Total: {len(valid_matches)} matches")
        print("=" * 80)
        
    finally:
        driver.quit()

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Preview matches that will be scraped')
    parser.add_argument('--season', type=str, default='25/26', help='Season to preview')
    parser.add_argument('--delay', type=float, default=1.0, help='Delay between requests')
    args = parser.parse_args()
    
    preview_matches(args.season, args.delay)



