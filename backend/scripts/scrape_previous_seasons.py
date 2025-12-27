#!/usr/bin/env python3
"""
Script to scrape multiple previous Premier League seasons
Runs the comprehensive scraper for each season sequentially
"""

import subprocess
import sys
import os
import time
from datetime import datetime

# Get the script directory
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
scraper_script = os.path.join(script_dir, "scrape_fbref_comprehensive.py")

# Try to use venv Python if available
venv_python = os.path.join(backend_dir, "venv", "bin", "python3")
if os.path.exists(venv_python):
    python_executable = venv_python
    print(f"Using venv Python: {python_executable}")
else:
    python_executable = sys.executable
    print(f"Using system Python: {python_executable}")

# Previous seasons to scrape (most recent first)
SEASONS = [
    "2023-2024",
    "2022-2023",
    "2021-2022",
    "2020-2021",
    "2019-2020",
    "2018-2019",
    "2017-2018",
    "2016-2017",
    "2015-2016",
]

def scrape_season(season: str) -> bool:
    """Scrape a single season"""
    print(f"\n{'='*80}")
    print(f"Starting scrape for season: {season}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*80}\n")
    
    try:
        # Run the scraper with appropriate options
        # Using headless mode (default), 2 second delay, no limit (scrape all matches)
        cmd = [
            python_executable,
            scraper_script,
            "--season", season,
            "--delay", "2.0"
        ]
        
        result = subprocess.run(
            cmd,
            cwd=backend_dir,
            check=True,
            capture_output=False,  # Show output in real-time
            text=True
        )
        
        print(f"\n✓ Successfully completed scraping for {season}")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"\n✗ Error scraping {season}: {e}")
        return False
    except Exception as e:
        print(f"\n✗ Unexpected error scraping {season}: {e}")
        return False

def main():
    """Main function to scrape all previous seasons"""
    start_time = time.time()
    
    print(f"\n{'='*80}")
    print(f"PREVIOUS SEASONS SCRAPER")
    print(f"Starting at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Seasons to scrape: {len(SEASONS)}")
    print(f"{'='*80}\n")
    
    successful = []
    failed = []
    
    for season in SEASONS:
        # Check if season data already exists
        season_dir = os.path.join(backend_dir, "data", season)
        if os.path.exists(season_dir) and os.path.exists(os.path.join(season_dir, "index.json")):
            print(f"⚠️  Season {season} already exists, skipping...")
            continue
        
        success = scrape_season(season)
        
        if success:
            successful.append(season)
        else:
            failed.append(season)
            # Continue with next season even if one fails
            print(f"Continuing with next season...")
        
        # Small delay between seasons
        if season != SEASONS[-1]:  # Don't delay after last season
            print(f"\nWaiting 5 seconds before next season...\n")
            time.sleep(5)
    
    elapsed_time = time.time() - start_time
    
    print(f"\n{'='*80}")
    print(f"SCRAPING COMPLETE")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total time: {elapsed_time/60:.1f} minutes ({elapsed_time/3600:.1f} hours)")
    print(f"Successful: {len(successful)} seasons")
    if successful:
        print(f"  - {', '.join(successful)}")
    print(f"Failed: {len(failed)} seasons")
    if failed:
        print(f"  - {', '.join(failed)}")
    print(f"{'='*80}\n")

if __name__ == '__main__':
    main()

