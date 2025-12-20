#!/usr/bin/env python3
"""
Script to scrape Premier League historical results from fbref.com
and save to CSV file.

Usage:
    python scripts/scrape_fbref_results.py [--season SEASON] [--output OUTPUT_FILE]
    
Example:
    python scripts/scrape_fbref_results.py --season 2023-2024 --output pl_results_2023_2024.csv
"""

import argparse
import csv
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List, Dict, Optional
import sys
import os

# Add parent directory to path to import app modules if needed
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def get_season_url(season: str) -> str:
    """Get the fbref.com URL for a specific Premier League season"""
    # fbref.com URL format: https://fbref.com/en/comps/9/{season}/schedule/{season}-Premier-League-Scores-and-Fixtures
    # Season format: 2023-2024
    season_slug = season.replace('-', '-')
    return f"https://fbref.com/en/comps/9/{season_slug}/schedule/{season_slug}-Premier-League-Scores-and-Fixtures"


def scrape_season_results(season: str, delay: float = 1.0) -> List[Dict[str, str]]:
    """
    Scrape all match results for a Premier League season from fbref.com
    
    Args:
        season: Season in format "2023-2024"
        delay: Delay between requests in seconds (to be respectful)
    
    Returns:
        List of dictionaries containing match data
    """
    url = get_season_url(season)
    print(f"Scraping {season} season from: {url}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Error fetching page: {e}")
        return []
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find the results table - fbref.com uses specific table IDs
    # The main results table is typically in a table with id containing "sched"
    results_table = soup.find('table', {'id': lambda x: x and 'sched' in x.lower()})
    
    if not results_table:
        # Try alternative table selectors
        results_table = soup.find('table', class_=lambda x: x and 'stats_table' in str(x).lower())
    
    if not results_table:
        print("Could not find results table on page")
        print("Page title:", soup.find('title'))
        # Save HTML for debugging
        with open('debug_fbref.html', 'w', encoding='utf-8') as f:
            f.write(str(soup))
        print("Saved page HTML to debug_fbref.html for inspection")
        return []
    
    matches = []
    tbody = results_table.find('tbody')
    if not tbody:
        print("No tbody found in table")
        return []
    
    rows = tbody.find_all('tr')
    print(f"Found {len(rows)} rows in results table")
    
    # Get header row to identify column positions
    thead = results_table.find('thead')
    headers = []
    if thead:
        header_row = thead.find('tr')
        if header_row:
            headers = [th.get_text(strip=True) for th in header_row.find_all(['th', 'td'])]
            print(f"Table headers: {headers}")
    
    for row_idx, row in enumerate(rows):
        # Skip header rows
        if row.find('th') and not row.find('td'):
            continue
        
        cells = row.find_all(['td', 'th'])
        if len(cells) < 5:  # Need at least date, teams, score
            continue
        
        try:
            match_data = {'season': season}
            
            # Extract data from cells
            cell_data = []
            for cell in cells:
                # Get text and check for links (team names are usually links)
                text = cell.get_text(strip=True)
                link = cell.find('a')
                cell_data.append({
                    'text': text,
                    'link': link.get('href') if link else None,
                    'is_team': link and '/squads/' in (link.get('href') or '')
                })
            
            # Find team names (links with /squads/)
            team_links = row.find_all('a', href=lambda x: x and '/squads/' in x)
            if len(team_links) >= 2:
                match_data['home_team'] = team_links[0].get_text(strip=True)
                match_data['away_team'] = team_links[1].get_text(strip=True)
            else:
                # Try to find teams in cell text
                for i, cell in enumerate(cells):
                    text = cell.get_text(strip=True)
                    link = cell.find('a', href=lambda x: x and '/squads/' in x)
                    if link and not match_data.get('home_team'):
                        match_data['home_team'] = link.get_text(strip=True)
                    elif link and not match_data.get('away_team'):
                        match_data['away_team'] = link.get_text(strip=True)
            
            # Find date (usually in a specific format)
            for cell in cells:
                text = cell.get_text(strip=True)
                # Date format: "2023-08-11" or "Aug 11, 2023" or similar
                if ('-' in text and len(text) >= 8) or (',' in text and any(char.isdigit() for char in text)):
                    # Check if it looks like a date
                    if any(char.isdigit() for char in text[:4]):  # Year in first 4 chars
                        match_data['date'] = text
                        break
            
            # Find score (contains format like "2–1" or "2-1" or "W" or "L" or "D")
            for cell in cells:
                text = cell.get_text(strip=True)
                # Score format: "2–1" (en dash) or "2-1" (hyphen) or "W"/"L"/"D"
                if '–' in text or (text.count('-') == 1 and any(char.isdigit() for char in text)):
                    # Split score
                    score_parts = text.replace('–', '-').split('-')
                    if len(score_parts) == 2:
                        try:
                            match_data['home_score'] = score_parts[0].strip()
                            match_data['away_score'] = score_parts[1].strip()
                        except:
                            pass
                    break
                elif text in ['W', 'L', 'D']:
                    # Postponed or cancelled match
                    match_data['result'] = text
                    break
            
            # Find week/gameweek (usually first column if it's a number)
            first_cell = cells[0].get_text(strip=True)
            if first_cell.isdigit():
                match_data['week'] = first_cell
            
            # Find attendance, venue, referee if available
            for i, cell in enumerate(cells):
                text = cell.get_text(strip=True)
                # Attendance is usually a number with comma
                if ',' in text and text.replace(',', '').isdigit():
                    match_data['attendance'] = text
                # Referee names are usually longer text without numbers
                elif len(text) > 5 and not any(char.isdigit() for char in text) and ' ' in text:
                    if 'attendance' not in match_data or match_data.get('attendance') != text:
                        match_data['referee'] = text
            
            # Only add if we have essential data
            if match_data.get('home_team') and match_data.get('away_team'):
                matches.append(match_data)
            else:
                print(f"Row {row_idx + 1}: Missing team data - {match_data}")
        
        except Exception as e:
            print(f"Error parsing row {row_idx + 1}: {e}")
            import traceback
            traceback.print_exc()
            continue
    
    print(f"Found {len(matches)} matches for {season}")
    return matches


def scrape_multiple_seasons(start_season: int, end_season: int) -> List[Dict[str, str]]:
    """Scrape multiple seasons"""
    all_matches = []
    
    for year in range(start_season, end_season + 1):
        season = f"{year}-{year + 1}"
        matches = scrape_season_results(season)
        all_matches.extend(matches)
        time.sleep(2)  # Be respectful with delays
    
    return all_matches


def save_to_csv(matches: List[Dict[str, str]], output_file: str):
    """Save matches to CSV file"""
    if not matches:
        print("No matches to save")
        return
    
    # Get all unique keys from all matches
    fieldnames = set()
    for match in matches:
        fieldnames.update(match.keys())
    
    fieldnames = sorted(list(fieldnames))
    
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(matches)
    
    print(f"Saved {len(matches)} matches to {output_file}")


def main():
    parser = argparse.ArgumentParser(description='Scrape Premier League results from fbref.com')
    parser.add_argument('--season', type=str, help='Season to scrape (e.g., 2023-2024). If not provided, scrapes current season')
    parser.add_argument('--start-season', type=int, help='Start year for multi-season scrape (e.g., 2020)')
    parser.add_argument('--end-season', type=int, help='End year for multi-season scrape (e.g., 2023)')
    parser.add_argument('--output', type=str, default='pl_results.csv', help='Output CSV file path')
    parser.add_argument('--delay', type=float, default=1.0, help='Delay between requests in seconds')
    
    args = parser.parse_args()
    
    matches = []
    
    if args.start_season and args.end_season:
        # Multi-season scrape
        matches = scrape_multiple_seasons(args.start_season, args.end_season)
    elif args.season:
        # Single season
        matches = scrape_season_results(args.season, delay=args.delay)
    else:
        # Current season (default)
        current_year = datetime.now().year
        current_month = datetime.now().month
        # Premier League season runs from August to May
        if current_month >= 8:
            season = f"{current_year}-{current_year + 1}"
        else:
            season = f"{current_year - 1}-{current_year}"
        
        print(f"No season specified, using current season: {season}")
        matches = scrape_season_results(season, delay=args.delay)
    
    if matches:
        save_to_csv(matches, args.output)
        print(f"\nSuccessfully scraped {len(matches)} matches")
    else:
        print("No matches found. The page structure may have changed or the season may not exist.")


if __name__ == '__main__':
    main()

