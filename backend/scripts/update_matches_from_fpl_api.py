#!/usr/bin/env python3
"""
Update match data from Fantasy Premier League (FPL) API
This is faster and more reliable than web scraping

The FPL API provides:
- All fixtures for the season
- Match results (scores, finished status)
- Team information
- Kickoff times
- Live match data

Usage:
    python scripts/update_matches_from_fpl_api.py [--days DAYS] [--season SEASON] [--gameweek GW]
    
Options:
    --days: Number of days back to update (default: 7)
    --season: Season to update (default: current season)
    --gameweek: Specific gameweek to update (optional)
"""

import argparse
import sys
import asyncio
from pathlib import Path
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
import json

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.fpl_service import fpl_service
from app.services.match_import_service import MatchImportService
from app.core.pl_database import pl_engine, create_pl_db_and_tables
from sqlmodel import Session, select
from app.models.pl_data import Match, Team


def get_current_season() -> str:
    """Get current Premier League season"""
    now = datetime.now()
    if now.month >= 8:
        return f"{now.year}-{now.year + 1}"
    else:
        return f"{now.year - 1}-{now.year}"


def fpl_team_id_to_name(team_id: int, teams_map: Dict[int, Dict]) -> str:
    """Convert FPL team ID to team name"""
    team = teams_map.get(team_id, {})
    return team.get("name", f"Team {team_id}")


def fpl_fixture_to_match_data(fixture: Dict[str, Any], teams_map: Dict[int, Dict], season: str) -> Dict[str, Any]:
    """Convert FPL fixture format to match data format expected by import service"""
    
    home_team_id = fixture.get("team_h")
    away_team_id = fixture.get("team_a")
    home_team_name = fpl_team_id_to_name(home_team_id, teams_map) if home_team_id else "Unknown"
    away_team_name = fpl_team_id_to_name(away_team_id, teams_map) if away_team_id else "Unknown"
    
    # Parse kickoff time
    kickoff_time_str = fixture.get("kickoff_time")
    match_date = None
    if kickoff_time_str:
        try:
            # FPL API format: "2024-12-26T15:00:00Z"
            match_date = datetime.fromisoformat(kickoff_time_str.replace('Z', '+00:00'))
        except:
            pass
    
    if not match_date:
        # Fallback to event deadline or current date
        match_date = datetime.now(timezone.utc)
    
    # Get scores
    home_score = fixture.get("team_h_score")
    away_score = fixture.get("team_a_score")
    
    # Determine status
    finished = fixture.get("finished", False)
    started = fixture.get("started", False)
    
    if finished:
        status = "finished"
    elif started:
        status = "live"
    else:
        status = "scheduled"
    
    # Format match data
    match_data = {
        "match_info": {
            "date": match_date.strftime("%Y-%m-%d"),
            "home_score": home_score,
            "away_score": away_score,
            "status": status,
            "venue": None,  # FPL API doesn't provide venue
            "referee": None,  # FPL API doesn't provide referee
            "attendance": None,
            "home_manager": None,
            "away_manager": None,
            "home_captain": None,
            "away_captain": None,
        },
        "home_team": {
            "name": home_team_name,
            "fbref_id": f"fpl_{home_team_id}",  # Use FPL ID as fbref_id
        },
        "away_team": {
            "name": away_team_name,
            "fbref_id": f"fpl_{away_team_id}",  # Use FPL ID as fbref_id
        },
        # FPL API doesn't provide detailed stats, lineups, events
        # These would need to be filled from other sources or left empty
        "home_team_stats": {},
        "away_team_stats": {},
        "events": [],
        "lineups": {
            "home": [],
            "away": [],
        },
    }
    
    return match_data


async def update_matches_from_fpl(
    season: str,
    days: Optional[int] = None,
    gameweek: Optional[int] = None
) -> Dict[str, Any]:
    """Update matches from FPL API"""
    
    print(f"\n{'='*60}")
    print(f"Updating Matches from FPL API")
    print(f"{'='*60}")
    print(f"Season: {season}")
    if gameweek:
        print(f"Gameweek: {gameweek}")
    elif days:
        print(f"Days back: {days}")
    print(f"{'='*60}\n")
    
    try:
        # Get bootstrap data for teams
        print("Fetching team data from FPL API...")
        bootstrap = await fpl_service.get_bootstrap_static()
        teams = bootstrap.get("teams", [])
        teams_map = {team["id"]: team for team in teams}
        print(f"✓ Found {len(teams_map)} teams\n")
        
        # Get fixtures
        print("Fetching fixtures from FPL API...")
        if gameweek:
            fixtures = await fpl_service.get_gameweek_fixtures(gameweek)
            print(f"✓ Found {len(fixtures)} fixtures for gameweek {gameweek}\n")
        else:
            fixtures = await fpl_service.get_fixtures()
            print(f"✓ Found {len(fixtures)} fixtures for season\n")
        
        # Filter by date if days specified
        if days and not gameweek:
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
            filtered_fixtures = []
            for fixture in fixtures:
                kickoff_time_str = fixture.get("kickoff_time")
                if kickoff_time_str:
                    try:
                        kickoff = datetime.fromisoformat(kickoff_time_str.replace('Z', '+00:00'))
                        if kickoff >= cutoff_date:
                            filtered_fixtures.append(fixture)
                    except:
                        pass
            fixtures = filtered_fixtures
            print(f"✓ Filtered to {len(fixtures)} fixtures in last {days} days\n")
        
        if not fixtures:
            print("⚠️  No fixtures found matching criteria")
            return {"imported": 0, "total": 0, "errors": []}
        
        # Create import service
        data_dir = Path(__file__).parent.parent / "data"
        import_service = MatchImportService(season=season, data_dir=data_dir)
        
        # Ensure database tables exist
        print("Ensuring database tables exist...")
        create_pl_db_and_tables()
        print("✓ Database ready\n")
        
        # Import matches
        imported = 0
        updated = 0
        skipped = 0
        errors = []
        
        print(f"Importing {len(fixtures)} matches...\n")
        
        with Session(pl_engine) as session:
            for i, fixture in enumerate(fixtures, 1):
                try:
                    # Convert FPL fixture to match data format
                    match_data = fpl_fixture_to_match_data(fixture, teams_map, season)
                    
                    # Check if match already exists
                    match_date = datetime.fromisoformat(match_data["match_info"]["date"]).date()
                    home_team_name = match_data["home_team"]["name"]
                    away_team_name = match_data["away_team"]["name"]
                    
                    # Get or create teams
                    home_team = import_service.get_or_create_team(
                        session, home_team_name, match_data["home_team"]["fbref_id"]
                    )
                    away_team = import_service.get_or_create_team(
                        session, away_team_name, match_data["away_team"]["fbref_id"]
                    )
                    
                    # Check if match exists
                    existing_match = session.exec(
                        select(Match).where(
                            Match.match_date == match_date,
                            Match.home_team_id == home_team.id,
                            Match.away_team_id == away_team.id,
                            Match.season == season
                        )
                    ).first()
                    
                    if existing_match:
                        # Update existing match
                        existing_match.score_home = match_data["match_info"]["home_score"]
                        existing_match.score_away = match_data["match_info"]["away_score"]
                        existing_match.status = match_data["match_info"]["status"]
                        session.add(existing_match)
                        session.commit()
                        updated += 1
                        print(f"[{i}/{len(fixtures)}] ✓ Updated: {home_team_name} vs {away_team_name} ({match_date})")
                    else:
                        # Import new match
                        match = import_service.import_match(session, match_data)
                        if match:
                            session.commit()
                            imported += 1
                            print(f"[{i}/{len(fixtures)}] ✓ Imported: {home_team_name} vs {away_team_name} ({match_date})")
                        else:
                            skipped += 1
                            print(f"[{i}/{len(fixtures)}] - Skipped: {home_team_name} vs {away_team_name} ({match_date})")
                    
                except Exception as e:
                    session.rollback()
                    error_msg = f"Fixture {fixture.get('id', 'unknown')}: {str(e)}"
                    errors.append(error_msg)
                    print(f"[{i}/{len(fixtures)}] ✗ ERROR: {error_msg}")
        
        # Summary
        print(f"\n{'='*60}")
        print("Import Summary")
        print(f"{'='*60}")
        print(f"Total fixtures: {len(fixtures)}")
        print(f"Imported: {imported}")
        print(f"Updated: {updated}")
        print(f"Skipped: {skipped}")
        print(f"Errors: {len(errors)}")
        if errors:
            print(f"\nErrors:")
            for error in errors[:10]:
                print(f"  - {error}")
            if len(errors) > 10:
                print(f"  ... and {len(errors) - 10} more")
        print(f"{'='*60}\n")
        
        return {
            "imported": imported,
            "updated": updated,
            "total": len(fixtures),
            "errors": errors
        }
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return {"imported": 0, "updated": 0, "total": 0, "errors": [str(e)]}
    finally:
        await fpl_service.close()


def main():
    parser = argparse.ArgumentParser(
        description="Update match data from FPL API"
    )
    parser.add_argument(
        "--days",
        type=int,
        default=7,
        help="Number of days back to update (default: 7)"
    )
    parser.add_argument(
        "--season",
        type=str,
        default=None,
        help="Season to update (e.g., 2024-2025). Default: current season"
    )
    parser.add_argument(
        "--gameweek",
        type=int,
        default=None,
        help="Specific gameweek to update (optional)"
    )
    
    args = parser.parse_args()
    
    # Determine season
    season = args.season or get_current_season()
    
    # Run async function
    result = asyncio.run(update_matches_from_fpl(
        season=season,
        days=args.days if not args.gameweek else None,
        gameweek=args.gameweek
    ))
    
    # Exit with error code if there were errors
    sys.exit(0 if result["errors"] == [] else 1)


if __name__ == "__main__":
    main()

