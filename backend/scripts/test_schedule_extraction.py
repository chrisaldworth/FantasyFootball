#!/usr/bin/env python3
"""
Test script to verify schedule table extraction is working correctly
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scrape_fbref_comprehensive import (
    get_season_url,
    get_premier_league_clubs,
    is_premier_league_club,
    setup_driver
)
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import re
from collections import defaultdict

def test_schedule_extraction(season: str = "25/26"):
    """Test extracting matches from the Premier League schedule page"""
    
    url = get_season_url(season)
    print("=" * 80)
    print(f"Testing schedule extraction for {season} season")
    print(f"URL: {url}")
    print("=" * 80)
    
    driver = setup_driver(headless=True)
    
    try:
        print("\nLoading schedule page...")
        driver.get(url)
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
        time.sleep(3)
        print("✓ Page loaded")
        
        # Find schedule table
        table = None
        try:
            table = driver.find_element(By.XPATH, "//table[@id[contains(., 'sched')]]")
            print("✓ Found schedule table by ID")
        except:
            table = driver.find_element(By.XPATH, "//table[contains(@class, 'stats_table')]")
            print("✓ Found schedule table by class")
        
        tbody = table.find_element(By.TAG_NAME, "tbody")
        all_rows = tbody.find_elements(By.TAG_NAME, "tr")
        print(f"✓ Found {len(all_rows)} total rows")
        
        # Get PL clubs
        pl_clubs = get_premier_league_clubs()
        
        # Analyze rows
        date_headers = []
        match_rows = []
        other_rows = []
        
        for row_idx, row in enumerate(all_rows):
            th_cells = row.find_elements(By.TAG_NAME, "th")
            td_cells = row.find_elements(By.TAG_NAME, "td")
            
            if th_cells and not td_cells:
                date_text = th_cells[0].text.strip() if th_cells else ""
                date_headers.append((row_idx, date_text))
            elif len(td_cells) >= 5:
                team_links = row.find_elements(By.XPATH, ".//a[contains(@href, '/squads/')]")
                if len(team_links) >= 2:
                    home_team = team_links[0].text.strip()
                    away_team = team_links[1].text.strip()
                    home_is_pl = is_premier_league_club(home_team, pl_clubs)
                    away_is_pl = is_premier_league_club(away_team, pl_clubs)
                    
                    if home_is_pl and away_is_pl:
                        match_rows.append((row_idx, home_team, away_team, "PL"))
                    else:
                        other_rows.append((row_idx, home_team, away_team, f"home_pl={home_is_pl}, away_pl={away_is_pl}"))
                else:
                    other_rows.append((row_idx, "No team links", "", ""))
            else:
                other_rows.append((row_idx, f"{len(td_cells)} cells", "", ""))
        
        print(f"\nRow Analysis:")
        print(f"  Date headers: {len(date_headers)}")
        print(f"  PL match rows: {len(match_rows)}")
        print(f"  Other rows: {len(other_rows)}")
        
        # Group matches by date
        matches_by_date = defaultdict(list)
        current_date = None
        
        for row_idx, row in enumerate(all_rows):
            th_cells = row.find_elements(By.TAG_NAME, "th")
            td_cells = row.find_elements(By.TAG_NAME, "td")
            
            if th_cells and not td_cells:
                current_date = th_cells[0].text.strip()
            elif len(td_cells) >= 5:
                team_links = row.find_elements(By.XPATH, ".//a[contains(@href, '/squads/')]")
                if len(team_links) >= 2:
                    home_team = team_links[0].text.strip()
                    away_team = team_links[1].text.strip()
                    home_is_pl = is_premier_league_club(home_team, pl_clubs)
                    away_is_pl = is_premier_league_club(away_team, pl_clubs)
                    
                    if home_is_pl and away_is_pl and current_date:
                        matches_by_date[current_date].append(f"{home_team} vs {away_team}")
        
        print(f"\nPL Matches by Date (first 20 dates):")
        for date, matches in list(matches_by_date.items())[:20]:
            print(f"  {date}: {len(matches)} matches")
            if len(matches) > 1:
                for match in matches:
                    print(f"    - {match}")
        
        # Check for dates with multiple matches
        multi_match_dates = {date: matches for date, matches in matches_by_date.items() if len(matches) > 1}
        print(f"\n✓ Dates with multiple PL matches: {len(multi_match_dates)}")
        if multi_match_dates:
            print("  Examples:")
            for date, matches in list(multi_match_dates.items())[:5]:
                print(f"    {date}: {len(matches)} matches")
        
        print(f"\n✓ Total PL matches found: {len(match_rows)}")
        print(f"✓ Expected: ~380 matches (20 teams × 19 home games = 380)")
        
        if len(match_rows) < 350:
            print(f"\n⚠ WARNING: Found only {len(match_rows)} PL matches, expected ~380")
            print("  This suggests some matches are being missed!")
        
        if other_rows:
            print(f"\n⚠ Non-PL matches found: {len(other_rows)}")
            print("  First 10:")
            for row_idx, home, away, reason in other_rows[:10]:
                print(f"    Row {row_idx}: {home} vs {away} ({reason})")
        
    finally:
        driver.quit()

if __name__ == '__main__':
    test_schedule_extraction("25/26")



