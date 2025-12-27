#!/usr/bin/env python3
"""
Inspect team stats structure from a match report page
"""
import sys
import os
import time
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import undetected_chromedriver as uc
    USE_UC = True
except ImportError:
    USE_UC = False
    print("Warning: undetected-chromedriver not available, using standard Chrome")

def setup_driver(headless=False):
    """Setup Chrome driver"""
    if USE_UC:
        options = uc.ChromeOptions()
        if headless:
            options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        driver = uc.Chrome(options=options, version_main=None)
    else:
        from selenium.webdriver.chrome.options import Options
        options = Options()
        if headless:
            options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        driver = webdriver.Chrome(options=options)
    
    return driver

def inspect_team_stats(driver, match_url):
    """Inspect team stats structure from match report"""
    print(f"\n{'='*80}")
    print(f"Inspecting team stats from: {match_url}")
    print(f"{'='*80}\n")
    
    driver.get(match_url)
    time.sleep(5)
    
    # Wait for page to load
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    except TimeoutException:
        print("✗ Timeout waiting for page")
        return
    
    time.sleep(3)
    
    # Find Team Stats section
    print("Looking for Team Stats section...")
    
    # Method 1: Look for h2 with "Team Stats"
    team_stats_heading = None
    try:
        headings = driver.find_elements(By.XPATH, "//h2[contains(text(), 'Team Stats')]")
        if headings:
            team_stats_heading = headings[0]
            print(f"✓ Found Team Stats heading: {team_stats_heading.text}")
        else:
            print("✗ No Team Stats heading found")
    except Exception as e:
        print(f"✗ Error finding heading: {e}")
    
    if not team_stats_heading:
        return
    
    # Find the table after the heading
    try:
        team_stats_table = team_stats_heading.find_element(By.XPATH, "./following::table[1]")
        print(f"✓ Found Team Stats table")
    except:
        print("✗ Could not find table after heading")
        return
    
    # Get the table HTML
    table_html = team_stats_table.get_attribute('outerHTML')
    
    # Look for team_stats_extra div (the 3-column visual table)
    print("\n" + "="*80)
    print("Looking for team_stats_extra div (3-column visual table)...")
    print("="*80)
    
    try:
        team_stats_extra = driver.find_element(By.ID, "team_stats_extra")
        print("✓ Found team_stats_extra div")
        
        # Get all divs with class="th" (header row with team names)
        header_divs = team_stats_extra.find_elements(By.XPATH, ".//div[@class='th']")
        print(f"\nHeader row (team names):")
        for idx, div in enumerate(header_divs):
            text = div.text.strip()
            if text and text != '&nbsp;':
                print(f"  Column {idx}: '{text}'")
        
        # Get all stat rows (divs with 3 child divs)
        all_divs = team_stats_extra.find_elements(By.XPATH, ".//div")
        
        print(f"\n{'='*80}")
        print("Stat rows (3-column format):")
        print(f"{'='*80}")
        
        stat_count = 0
        for div in all_divs:
            try:
                # Get direct child divs only
                child_divs = div.find_elements(By.XPATH, "./div")
                text_divs = [d for d in child_divs if d.text.strip()]
                
                if len(text_divs) == 3:
                    stat_count += 1
                    left_value = text_divs[0].text.strip()
                    stat_name = text_divs[1].text.strip()
                    right_value = text_divs[2].text.strip()
                    
                    print(f"\nStat #{stat_count}: {stat_name}")
                    print(f"  Left column:  '{left_value}'")
                    print(f"  Right column: '{right_value}'")
                    
                    # Get HTML for debugging
                    left_html = text_divs[0].get_attribute('outerHTML')[:150]
                    right_html = text_divs[2].get_attribute('outerHTML')[:150]
                    print(f"  Left HTML:  {left_html}...")
                    print(f"  Right HTML: {right_html}...")
                    
                    if stat_count >= 15:  # Show first 15 stats
                        break
            except:
                continue
        
        # Also check the main Team Stats table structure
        print(f"\n{'='*80}")
        print("Main Team Stats table structure:")
        print(f"{'='*80}")
        
        # Get table rows
        rows = team_stats_table.find_elements(By.TAG_NAME, "tr")
        print(f"Found {len(rows)} rows in main table")
        
        # Check header row for team names
        header_row = team_stats_table.find_elements(By.XPATH, ".//tr[1]//th")
        if header_row:
            print("\nHeader row:")
            for idx, th in enumerate(header_row):
                print(f"  Column {idx}: '{th.text.strip()}'")
        
    except Exception as e:
        print(f"✗ Error inspecting team_stats_extra: {e}")
        import traceback
        traceback.print_exc()
    
    # Save HTML for inspection
    print(f"\n{'='*80}")
    print("Saving HTML for manual inspection...")
    print(f"{'='*80}")
    
    try:
        page_source = driver.page_source
        output_file = "team_stats_inspection.html"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(page_source)
        print(f"✓ Saved page HTML to: {output_file}")
    except Exception as e:
        print(f"✗ Error saving HTML: {e}")

if __name__ == "__main__":
    # Use the Aston Villa vs Newcastle match
    # First, let's find the actual match URL from the JSON file
    import json
    json_file = "backend/data/2025-2026/matches/match_2025_08_16_Aston_Villa_vs_Newcastle_Utd.json"
    match_url = None
    
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)
            match_info = data.get('match_info', {})
            fbref_url = match_info.get('fbref_url')
            if fbref_url:
                match_url = fbref_url
                print(f"✓ Using match URL from JSON: {match_url}")
    except Exception as e:
        print(f"Could not read JSON file: {e}")
    
    if not match_url:
        # Try to construct from team names and date
        match_url = "https://fbref.com/en/comps/9/2025-2026/schedule/2025-2026-Premier-League-Scores-and-Fixtures"
        print(f"⚠ No URL in JSON, will need to find match from schedule page")
        print(f"Using schedule page: {match_url}")
    
    print("Starting team stats inspection...")
    print("This will open a browser window - please check for Cloudflare verification if needed")
    
    driver = setup_driver(headless=False)
    
    try:
        inspect_team_stats(driver, match_url)
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        input("\nPress Enter to close browser...")
        driver.quit()

