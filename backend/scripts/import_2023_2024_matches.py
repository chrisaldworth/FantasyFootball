"""
Import 2023-2024 match data to cloud database
Transforms JSON format to match import service expectations

Usage:
  python scripts/import_2023_2024_matches.py --db-url your_cloud_database_url
  Or set PL_DATABASE_URL environment variable
"""
import argparse
import os
import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

# Parse arguments FIRST, before any imports
parser = argparse.ArgumentParser(description="Import 2023-2024 match data into cloud database")
parser.add_argument("--db-url", help="Cloud database URL (or use PL_DATABASE_URL env var)")
parser.add_argument("--data-dir", default="data", help="Data directory path (relative to backend/)")
parser.add_argument("--season", default="2023-2024", help="Season")
args = parser.parse_args()

# Override DATABASE_URL if provided - MUST be done BEFORE importing any app modules
if args.db_url:
    os.environ["PL_DATABASE_URL"] = args.db_url
    os.environ["DATABASE_URL"] = args.db_url
    print(f"[Script] Using provided database URL: {args.db_url[:50]}...")

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.match_import_service import MatchImportService


def transform_match_data(match_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transform scraped match JSON format to import service format
    
    Input format:
    - date: "December 2, 2023"
    - score: {home: 2, away: 1}
    - home_team: {name, fbref_id, manager, captain}
    - away_team: {name, fbref_id, manager, captain}
    
    Output format:
    - match_info: {date: "2023-12-02", home_score: 2, away_score: 1, ...}
    - home_team: {name, fbref_id, manager, captain}
    - away_team: {name, fbref_id, manager, captain}
    """
    transformed = {}
    
    # Transform date from various formats to "2023-12-02"
    date_str = match_data.get("match_info", {}).get("date") or match_data.get("date", "")
    transformed_date = None
    
    if not date_str:
        print(f"  ⚠ Warning: No date found in match data, skipping match")
        return None
    
    # Try multiple date formats
    date_formats = [
        "%B %d, %Y",      # "December 2, 2023"
        "%Y-%m-%d",        # "2023-12-02"
        "%Y_%m_%d",        # "2023_08_12"
        "%d %B %Y",        # "2 December 2023"
        "%B %d %Y",        # "December 2 2023" (no comma)
    ]
    
    for fmt in date_formats:
        try:
            parsed_date = datetime.strptime(date_str, fmt)
            transformed_date = parsed_date.strftime("%Y-%m-%d")
            break
        except ValueError:
            continue
    
    if not transformed_date:
        print(f"  ⚠ Warning: Could not parse date '{date_str}', skipping match")
        return None
    
    # Get scores from either score object or match_info
    score_data = match_data.get("score", {})
    match_info_data = match_data.get("match_info", {})
    
    home_score = match_info_data.get("home_score") or score_data.get("home")
    away_score = match_info_data.get("away_score") or score_data.get("away")
    
    # Build transformed match_info
    transformed["match_info"] = {
        "date": transformed_date,
        "home_score": home_score,
        "away_score": away_score,
        "attendance": match_info_data.get("attendance"),
        "referee": match_info_data.get("referee"),
        "venue": match_info_data.get("venue"),
    }
    
    # Copy team data (already in correct format)
    transformed["home_team"] = match_data.get("home_team", {})
    transformed["away_team"] = match_data.get("away_team", {})
    
    # Copy other data
    transformed["lineups"] = match_data.get("lineups", {})
    transformed["player_stats"] = match_data.get("player_stats", {})
    
    # Transform team_stats - convert passes_completed/passes_attempted to passes, passing_accuracy to pass_accuracy
    team_stats_data = match_data.get("team_stats", {})
    if team_stats_data:
        transformed_team_stats = {}
        for side in ["home", "away"]:
            if side in team_stats_data:
                side_stats = team_stats_data[side].copy()
                # Convert passes_completed to passes (or use passes_attempted if completed not available)
                if "passes_completed" in side_stats:
                    side_stats["passes"] = side_stats.pop("passes_completed")
                elif "passes_attempted" in side_stats:
                    side_stats["passes"] = side_stats.pop("passes_attempted")
                # Convert passing_accuracy to pass_accuracy
                if "passing_accuracy" in side_stats:
                    side_stats["pass_accuracy"] = side_stats.pop("passing_accuracy")
                transformed_team_stats[side] = side_stats
        transformed["team_stats"] = transformed_team_stats
    else:
        transformed["team_stats"] = {}
    
    # Transform events - fix substitutions format
    events_data = match_data.get("events", {})
    if events_data:
        transformed_events = {
            "goals": events_data.get("goals", []),
            "cards": events_data.get("cards", []),
            "substitutions": [],
        }
        
        # Transform substitutions from {player_name, player_id, substituted_for} 
        # to {player_out, player_out_id, player_in, player_in_id}
        for sub in events_data.get("substitutions", []):
            # The JSON has: player_name (going out), player_id (going out), substituted_for (name of player coming in)
            # We need to find the player_in_id from the lineups or player stats
            player_out_name = sub.get("player_name")
            player_out_id = sub.get("player_id")
            player_in_name = sub.get("substituted_for")
            
            # Try to find player_in_id from lineups
            player_in_id = None
            all_lineups = []
            if transformed["lineups"].get("home"):
                all_lineups.extend(transformed["lineups"]["home"].get("starting_xi", []))
                all_lineups.extend(transformed["lineups"]["home"].get("substitutes", []))
            if transformed["lineups"].get("away"):
                all_lineups.extend(transformed["lineups"]["away"].get("starting_xi", []))
                all_lineups.extend(transformed["lineups"]["away"].get("substitutes", []))
            
            for player in all_lineups:
                if player.get("name") == player_in_name:
                    player_in_id = player.get("fbref_id")
                    break
            
            transformed_events["substitutions"].append({
                "player_out": player_out_name,
                "player_out_id": player_out_id,
                "player_in": player_in_name,
                "player_in_id": player_in_id,
                "minute": sub.get("minute"),
                "team": sub.get("team"),
            })
        
        transformed["events"] = transformed_events
    else:
        transformed["events"] = {}
    
    return transformed


def main():
    """Main function to run the import"""
    
    # Resolve data directory path
    script_dir = Path(__file__).parent.parent
    if Path(args.data_dir).is_absolute():
        data_dir = Path(args.data_dir)
    else:
        data_dir = script_dir / args.data_dir
    
    if not data_dir.exists():
        print(f"Error: Data directory not found: {data_dir}")
        sys.exit(1)
    
    # Show which database we're using
    db_url = args.db_url or os.environ.get("PL_DATABASE_URL") or os.environ.get("DATABASE_URL", "default from .env")
    db_display = db_url[:50] + "..." if len(db_url) > 50 else db_url
    print(f"\n{'='*60}")
    print(f"Importing Match Data for Season: {args.season}")
    print(f"{'='*60}\n")
    print(f"Database: {db_display}")
    print(f"Data directory: {data_dir}\n")
    
    # Get match files
    match_dir = data_dir / args.season / "matches"
    if not match_dir.exists():
        print(f"Error: Match directory not found: {match_dir}")
        sys.exit(1)
    
    match_files = sorted(match_dir.glob("*.json"))
    total_matches = len(match_files)
    
    print(f"Found {total_matches} match files\n")
    
    if total_matches == 0:
        print("No match files found. Exiting.")
        sys.exit(1)
    
    # Create import service
    import_service = MatchImportService(season=args.season, data_dir=data_dir)
    
    # Import each match with transformation
    from app.core.pl_database import pl_engine
    from sqlmodel import Session
    
    imported = 0
    skipped = 0
    errors = []
    
    with Session(pl_engine) as session:
        for i, match_file in enumerate(match_files, 1):
            print(f"[{i}/{total_matches}] Processing: {match_file.name}")
            
            try:
                # Load and transform match data
                with open(match_file, 'r', encoding='utf-8') as f:
                    raw_data = json.load(f)
                
                transformed_data = transform_match_data(raw_data)
                if not transformed_data:
                    print(f"  - Skipped (transformation failed): {match_file.name}")
                    skipped += 1
                    continue
                
                # Check if match already exists before importing
                from datetime import datetime
                from sqlmodel import select
                from app.models.pl_data import Match
                
                match_info = transformed_data.get("match_info", {})
                home_team_data = transformed_data.get("home_team", {})
                away_team_data = transformed_data.get("away_team", {})
                
                # Get teams
                home_team = import_service.get_or_create_team(
                    session,
                    home_team_data.get("name", ""),
                    home_team_data.get("fbref_id", "")
                )
                away_team = import_service.get_or_create_team(
                    session,
                    away_team_data.get("name", ""),
                    away_team_data.get("fbref_id", "")
                )
                
                # Check if match exists
                date_str = match_info.get("date", "")
                match_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                
                existing_match = session.exec(
                    select(Match).where(
                        Match.match_date == match_date,
                        Match.home_team_id == home_team.id,
                        Match.away_team_id == away_team.id,
                        Match.season == import_service.season
                    )
                ).first()
                
                if existing_match:
                    skipped += 1
                    print(f"  - Skipped (already exists): {match_file.name}")
                else:
                    # Import using the service
                    match = import_service.import_match(session, transformed_data)
                    if match:
                        imported += 1
                        print(f"  ✓ Imported: {match_file.name}")
                    else:
                        skipped += 1
                        print(f"  - Skipped: {match_file.name}")
                    
            except Exception as e:
                error_msg = f"Error processing {match_file.name}: {str(e)}"
                print(f"  ✗ ERROR: {error_msg}")
                errors.append(error_msg)
                session.rollback()
                import traceback
                traceback.print_exc()
    
    # Print summary
    print(f"\n{'='*60}")
    print("Import Summary")
    print(f"{'='*60}")
    print(f"Total matches processed: {total_matches}")
    print(f"Successfully imported: {imported}")
    print(f"Skipped: {skipped}")
    print(f"Errors: {len(errors)}")
    
    if errors:
        print("\nErrors encountered:")
        for error in errors[:10]:  # Show first 10 errors
            print(f"  - {error}")
        if len(errors) > 10:
            print(f"  ... and {len(errors) - 10} more errors")
    
    print(f"\n{'='*60}\n")
    
    # Exit with error code if there were errors
    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
