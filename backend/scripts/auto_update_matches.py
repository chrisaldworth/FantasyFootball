#!/usr/bin/env python3
"""
Automated match data updater
Scrapes recent matches from fbref.com and imports them into the database
Can be run manually or scheduled (cron, systemd timer, etc.)

Usage:
    python scripts/auto_update_matches.py [--days DAYS] [--season SEASON] [--import-only]
    
Options:
    --days: Number of days back to scrape (default: 7)
    --season: Season to scrape (default: current season)
    --import-only: Only import existing JSON files, don't scrape
    --no-headless: Run browser in visible mode (for debugging)
"""

import argparse
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional
import json

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.match_import_service import MatchImportService


def get_current_season() -> str:
    """Get current Premier League season"""
    now = datetime.now()
    # Premier League season runs from August to May
    if now.month >= 8:
        # August onwards = current year to next year
        return f"{now.year}-{now.year + 1}"
    else:
        # January to July = previous year to current year
        return f"{now.year - 1}-{now.year}"


def get_matches_in_date_range(data_dir: Path, season: str, start_date: datetime, end_date: datetime) -> list:
    """Get list of match JSON files in date range"""
    matches_dir = data_dir / season / "matches"
    if not matches_dir.exists():
        return []
    
    matches = []
    for match_file in matches_dir.glob("match_*.json"):
        try:
            # Parse date from filename: match_2024_12_26_Team1_vs_Team2.json
            parts = match_file.stem.split("_")
            if len(parts) >= 4:
                year = int(parts[1])
                month = int(parts[2])
                day = int(parts[3])
                match_date = datetime(year, month, day)
                
                if start_date <= match_date <= end_date:
                    matches.append(match_file)
        except (ValueError, IndexError):
            continue
    
    return matches


def update_from_fpl_api(season: str, days: int, gameweek: Optional[int] = None):
    """Update matches from FPL API (faster and more reliable than scraping)"""
    import subprocess
    
    print(f"\n{'='*60}")
    print(f"Updating Matches from FPL API")
    print(f"{'='*60}")
    print(f"Season: {season}")
    if gameweek:
        print(f"Gameweek: {gameweek}")
    else:
        print(f"Days back: {days}")
    print(f"{'='*60}\n")
    
    try:
        fpl_script = Path(__file__).parent / "update_matches_from_fpl_api.py"
        if not fpl_script.exists():
            print(f"Error: FPL API script not found: {fpl_script}")
            return False
        
        cmd = [
            sys.executable,
            str(fpl_script),
            "--season", season,
        ]
        
        if gameweek:
            cmd.extend(["--gameweek", str(gameweek)])
        else:
            cmd.extend(["--days", str(days)])
        
        print(f"Running FPL API updater...")
        print(f"Command: {' '.join(cmd)}\n")
        
        result = subprocess.run(cmd, cwd=Path(__file__).parent.parent)
        
        if result.returncode != 0:
            print(f"Error: FPL API updater exited with code {result.returncode}")
            return False
        
        print("\n✅ FPL API update complete!")
        return True
        
    except Exception as e:
        print(f"Error running FPL API updater: {e}")
        import traceback
        traceback.print_exc()
        return False


def scrape_recent_matches(season: str, days: int, data_dir: Path, headless: bool = True):
    """Scrape matches from fbref.com for the season
    
    Note: The scraper scrapes all matches for the season, not just recent ones.
    The date filtering happens during import.
    
    This is a fallback option - FPL API is preferred.
    """
    from datetime import datetime, timedelta
    
    print(f"\n{'='*60}")
    print(f"Scraping Matches from fbref.com (Fallback)")
    print(f"{'='*60}")
    print(f"Season: {season}")
    print(f"Note: Scraper will get all matches for season")
    print(f"Date filtering (last {days} days) will happen during import")
    print(f"Data directory: {data_dir}")
    print(f"{'='*60}\n")
    
    # Import and run scraper
    try:
        # Import scraper module
        scraper_path = Path(__file__).parent / "scrape_fbref_comprehensive.py"
        if not scraper_path.exists():
            print(f"Error: Scraper script not found: {scraper_path}")
            return False
        
        # Run scraper (it will scrape all matches for the season)
        import subprocess
        
        cmd = [
            sys.executable,
            str(scraper_path),
            "--season", season,
        ]
        
        if not headless:
            cmd.append("--no-headless")
        
        print(f"\nRunning scraper...")
        print(f"Command: {' '.join(cmd)}\n")
        print("Note: This may take a while as it scrapes all matches for the season")
        print("Only matches in the date range will be imported.\n")
        
        result = subprocess.run(cmd, cwd=Path(__file__).parent.parent)
        
        if result.returncode != 0:
            print(f"Error: Scraper exited with code {result.returncode}")
            return False
        
        print("\n✅ Scraping complete!")
        print("Matches will be filtered by date range during import.")
        return True
        
    except Exception as e:
        print(f"Error running scraper: {e}")
        import traceback
        traceback.print_exc()
        return False


def import_matches(season: str, data_dir: Path, date_range: tuple = None):
    """Import scraped matches into database"""
    print(f"\n{'='*60}")
    print(f"Importing Matches to Database")
    print(f"{'='*60}")
    print(f"Season: {season}")
    print(f"Data directory: {data_dir}")
    if date_range:
        print(f"Date range: {date_range[0].strftime('%Y-%m-%d')} to {date_range[1].strftime('%Y-%m-%d')}")
    print(f"{'='*60}\n")
    
    try:
        # Create import service
        import_service = MatchImportService(season=season, data_dir=data_dir)
        
        # If date range specified, filter matches
        if date_range:
            matches_dir = data_dir / season / "matches"
            if not matches_dir.exists():
                print(f"⚠️  Matches directory not found: {matches_dir}")
                return False
                
            start_date, end_date = date_range
            matches = get_matches_in_date_range(data_dir, season, start_date, end_date)
            print(f"Found {len(matches)} matches in date range")
            
            if not matches:
                print("⚠️  No matches found in date range")
                return True  # Not an error, just no matches
            
            # Import each match
            from app.core.pl_database import pl_engine
            from sqlmodel import Session
            
            imported = 0
            skipped = 0
            errors = []
            with Session(pl_engine) as session:
                for match_file in matches:
                    try:
                        with open(match_file, 'r') as f:
                            match_data = json.load(f)
                        existing_match = import_service.import_match(session, match_data)
                        if existing_match and hasattr(existing_match, 'id'):
                            # Match was created
                            session.commit()
                            imported += 1
                            print(f"  ✓ Imported: {match_file.name}")
                        else:
                            # Match already exists (returned existing match)
                            skipped += 1
                            print(f"  - Skipped (already exists): {match_file.name}")
                    except Exception as e:
                        session.rollback()
                        error_msg = f"{match_file.name}: {str(e)}"
                        errors.append(error_msg)
                        print(f"  ✗ ERROR: {error_msg}")
            
            print(f"\n✅ Import Summary:")
            print(f"  Imported: {imported}")
            print(f"  Skipped: {skipped}")
            print(f"  Errors: {len(errors)}")
            if errors:
                print(f"\n⚠️  Errors encountered:")
                for error in errors[:5]:
                    print(f"  - {error}")
                if len(errors) > 5:
                    print(f"  ... and {len(errors) - 5} more errors")
            return len(errors) == 0
        else:
            # Import all matches for season
            result = import_service.run()
            print(f"\n✅ Import Summary:")
            print(f"  Total: {result['total']}")
            print(f"  Imported: {result['imported']}")
            print(f"  Errors: {len(result['errors'])}")
            return result['imported'] > 0 and len(result['errors']) == 0
            
    except Exception as e:
        print(f"Error importing matches: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Automated match data updater - scrape and import recent matches"
    )
    parser.add_argument(
        "--days",
        type=int,
        default=7,
        help="Number of days back to scrape (default: 7)"
    )
    parser.add_argument(
        "--season",
        type=str,
        default=None,
        help="Season to scrape (e.g., 2024-2025). Default: current season"
    )
    parser.add_argument(
        "--import-only",
        action="store_true",
        help="Only import existing JSON files, don't scrape"
    )
    parser.add_argument(
        "--use-fpl-api",
        action="store_true",
        help="Use FPL API instead of scraping (recommended - faster and more reliable)"
    )
    parser.add_argument(
        "--use-scraper",
        action="store_true",
        help="Use fbref scraper instead of FPL API (fallback option)"
    )
    parser.add_argument(
        "--no-headless",
        action="store_true",
        help="Run browser in visible mode (for debugging, only for scraper)"
    )
    parser.add_argument(
        "--data-dir",
        type=str,
        default="data",
        help="Data directory path (relative to backend/)"
    )
    
    args = parser.parse_args()
    
    # Determine season
    season = args.season or get_current_season()
    
    # Resolve data directory
    script_dir = Path(__file__).parent.parent
    if Path(args.data_dir).is_absolute():
        data_dir = Path(args.data_dir)
    else:
        data_dir = script_dir / args.data_dir
    
    if not data_dir.exists():
        print(f"Error: Data directory not found: {data_dir}")
        sys.exit(1)
    
    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=args.days)
    
    success = True
    
    # Step 1: Update matches (unless import-only)
    if not args.import_only:
        # Prefer FPL API unless explicitly using scraper
        if args.use_scraper:
            # Use fbref scraper
            success = scrape_recent_matches(
                season=season,
                days=args.days,
                data_dir=data_dir,
                headless=not args.no_headless
            )
            if not success:
                print("⚠️  Scraping had errors, but continuing with import...")
        else:
            # Use FPL API (default and recommended)
            success = update_from_fpl_api(
                season=season,
                days=args.days
            )
            if not success:
                print("⚠️  FPL API update had errors")
            # FPL API updates directly to database, so skip import step
            if success:
                print("\n✅ Match update complete! (FPL API updates database directly)")
                sys.exit(0)
    
    # Step 2: Import matches
    import_success = import_matches(
        season=season,
        data_dir=data_dir,
        date_range=(start_date, end_date) if not args.import_only else None
    )
    
    if not import_success:
        success = False
    
    # Summary
    print(f"\n{'='*60}")
    if success:
        print("✅ Match update complete!")
    else:
        print("⚠️  Match update completed with errors")
    print(f"{'='*60}\n")
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

