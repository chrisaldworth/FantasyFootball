#!/usr/bin/env python3
"""
Test script to inspect fixture score extraction from fbref.com schedule page
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

def inspect_fixture_row(driver, url):
    """Inspect a single fixture row to see score structure"""
    print(f"\n{'='*80}")
    print(f"Inspecting fixture page: {url}")
    print(f"{'='*80}\n")
    
    driver.get(url)
    time.sleep(5)
    
    # Wait for table
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
    except TimeoutException:
        print("✗ Timeout waiting for table")
        return
    
    time.sleep(2)
    
    # Find the schedule table
    table = None
    table_selectors = [
        "//table[@id='sched_2025-2026_9_1']",
        "//table[contains(@id, 'sched_')]",
        "//table[.//th[contains(text(), 'Wk') or contains(text(), 'Week')]]",
        "//table//tbody"
    ]
    
    for selector in table_selectors:
        try:
            table = driver.find_element(By.XPATH, selector)
            print(f"✓ Found table with selector: {selector}")
            break
        except:
            continue
    
    if not table:
        print("✗ Could not find schedule table")
        return
    
    # Get first few rows
    rows = table.find_elements(By.XPATH, ".//tbody//tr")
    print(f"\nFound {len(rows)} rows in table")
    
    # Inspect first 5 rows that have scores
    inspected = 0
    for idx, row in enumerate(rows[:20]):
        cells = row.find_elements(By.TAG_NAME, "td")
        if len(cells) < 4:
            continue
        
        # Check if this row has a score (has numbers that look like scores)
        row_text = row.text
        has_score = re.search(r'\d+[\s:–-]+\d+', row_text)
        
        if has_score:
            inspected += 1
            print(f"\n{'='*60}")
            print(f"ROW {idx + 1} (Fixture #{inspected}):")
            print(f"{'='*60}")
            print(f"Full row text: {row_text}")
            print(f"\nCell breakdown:")
            
            for cell_idx, cell in enumerate(cells):
                cell_text = cell.text.strip()
                cell_html = cell.get_attribute('outerHTML')[:200]  # First 200 chars
                print(f"  Cell {cell_idx}: '{cell_text}'")
                print(f"    HTML: {cell_html}...")
                
                # Check for score patterns
                score_match = re.search(r'(\d+)[\s:–-]+(\d+)', cell_text)
                if score_match:
                    score1 = int(score_match.group(1))
                    score2 = int(score_match.group(2))
                    print(f"    ⚠ Found score pattern: {score1}-{score2}")
                    if 0 <= score1 <= 15 and 0 <= score2 <= 15:
                        print(f"    ✓ Valid score: {score1}-{score2}")
                    else:
                        print(f"    ✗ Invalid score (likely date): {score1}-{score2}")
            
            # Look for match report link
            links = row.find_elements(By.TAG_NAME, "a")
            match_report_link = None
            for link in links:
                href = link.get_attribute('href')
                if href and '/matches/' in href and len(href.split('/matches/')[1].split('/')[0]) == 8:
                    match_report_link = href
                    print(f"\n  ✓ Match report link: {match_report_link}")
                    break
            
            if inspected >= 3:
                break
    
    print(f"\n{'='*80}")
    print("Inspection complete!")
    print(f"{'='*80}\n")

if __name__ == "__main__":
    url = "https://fbref.com/en/comps/9/2025-2026/schedule/2025-2026-Premier-League-Scores-and-Fixtures"
    
    print("Starting fixture score inspection...")
    print("This will open a browser window - please check for Cloudflare verification if needed")
    
    driver = setup_driver(headless=False)
    
    try:
        inspect_fixture_row(driver, url)
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        input("\nPress Enter to close browser...")
        driver.quit()


