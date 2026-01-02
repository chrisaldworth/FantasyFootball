"""
Check all matches for completeness and re-import incomplete ones
"""
import os
import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Tuple

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set database URL
db_url = "postgresql://neondb_owner:npg_gCje9Ad0NbXU@ep-still-moon-absrnhma-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
os.environ["PL_DATABASE_URL"] = db_url
os.environ["DATABASE_URL"] = db_url

from app.core.pl_database import pl_engine
from sqlmodel import Session, select, func
from app.models.pl_data import Match, Team, Player, MatchPlayerStats, MatchEvent, Lineup, TeamStats
from app.services.match_import_service import MatchImportService


def transform_match_data(match_data: Dict[str, Any]) -> Dict[str, Any]:
    """Transform scraped match JSON format to import service format"""
    transformed = {}
    
    # Transform date
    date_str = match_data.get("match_info", {}).get("date") or match_data.get("date", "")
    transformed_date = None
    
    if not date_str:
        return None
    
    date_formats = [
        "%B %d, %Y",      # "December 2, 2023"
        "%Y-%m-%d",        # "2023-12-02"
        "%Y_%m_%d",        # "2023_08_12"
        "%d %B %Y",        # "2 December 2023"
        "%B %d %Y",        # "December 2 2023"
    ]
    
    for fmt in date_formats:
        try:
            parsed_date = datetime.strptime(date_str, fmt)
            transformed_date = parsed_date.strftime("%Y-%m-%d")
            break
        except ValueError:
            continue
    
    if not transformed_date:
        return None
    
    # Get scores
    score_data = match_data.get("score", {})
    match_info_data = match_data.get("match_info", {})
    
    home_score = match_info_data.get("home_score") or score_data.get("home")
    away_score = match_info_data.get("away_score") or score_data.get("away")
    
    transformed["match_info"] = {
        "date": transformed_date,
        "home_score": home_score,
        "away_score": away_score,
        "attendance": match_info_data.get("attendance"),
        "referee": match_info_data.get("referee"),
        "venue": match_info_data.get("venue"),
    }
    
    transformed["home_team"] = match_data.get("home_team", {})
    transformed["away_team"] = match_data.get("away_team", {})
    transformed["lineups"] = match_data.get("lineups", {})
    transformed["player_stats"] = match_data.get("player_stats", {})
    
    # Transform team_stats
    team_stats_data = match_data.get("team_stats", {})
    if team_stats_data:
        transformed_team_stats = {}
        for side in ["home", "away"]:
            if side in team_stats_data:
                side_stats = team_stats_data[side].copy()
                if "passes_completed" in side_stats:
                    side_stats["passes"] = side_stats.pop("passes_completed")
                elif "passes_attempted" in side_stats:
                    side_stats["passes"] = side_stats.pop("passes_attempted")
                if "passing_accuracy" in side_stats:
                    side_stats["pass_accuracy"] = side_stats.pop("passing_accuracy")
                transformed_team_stats[side] = side_stats
        transformed["team_stats"] = transformed_team_stats
    else:
        transformed["team_stats"] = {}
    
    # Transform events
    events_data = match_data.get("events", {})
    if events_data:
        transformed_events = {
            "goals": events_data.get("goals", []),
            "cards": events_data.get("cards", []),
            "substitutions": [],
        }
        
        for sub in events_data.get("substitutions", []):
            player_out_name = sub.get("player_name")
            player_out_id = sub.get("player_id")
            player_in_name = sub.get("substituted_for")
            
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


def check_match_completeness(session: Session, match: Match) -> Tuple[bool, List[str]]:
    """Check if a match has all required data. Returns (is_complete, missing_items)"""
    missing = []
    
    # Check scores (0 is valid, only None is missing)
    if match.score_home is None or match.score_away is None:
        missing.append("scores")
    
    # Check player stats
    player_stats_count = session.exec(
        select(func.count(MatchPlayerStats.id)).where(MatchPlayerStats.match_id == match.id)
    ).one()
    if player_stats_count == 0:
        missing.append("player_stats")
    
    # Check team stats
    team_stats_count = session.exec(
        select(func.count(TeamStats.id)).where(TeamStats.match_id == match.id)
    ).one()
    if team_stats_count == 0:
        missing.append("team_stats")
    
    # Check events (goals, cards, substitutions)
    events_count = session.exec(
        select(func.count(MatchEvent.id)).where(MatchEvent.match_id == match.id)
    ).one()
    if events_count == 0:
        missing.append("events")
    
    # Check lineups
    lineups_count = session.exec(
        select(func.count(Lineup.id)).where(Lineup.match_id == match.id)
    ).one()
    if lineups_count == 0:
        missing.append("lineups")
    
    return (len(missing) == 0, missing)


def find_match_json_file(match: Match, session: Session, match_dir: Path) -> Path:
    """Find the JSON file for a match"""
    home_team = session.exec(select(Team).where(Team.id == match.home_team_id)).first()
    away_team = session.exec(select(Team).where(Team.id == match.away_team_id)).first()
    
    if not home_team or not away_team:
        return None
    
    # Try different filename patterns
    date_str = match.match_date.strftime("%B %d, %Y")
    date_str_alt = match.match_date.strftime("%Y_%m_%d")
    date_str_alt2 = match.match_date.strftime("%Y-%m-%d")
    
    home_name = home_team.name.replace(" ", "").replace("&", "&")
    away_name = away_team.name.replace(" ", "").replace("&", "&")
    
    patterns = [
        f"match_{date_str}_{home_name}_vs_{away_name}.json",
        f"match_{date_str_alt}_{home_name}_vs_{away_name}.json",
        f"match_{date_str_alt2}_{home_name}_vs_{away_name}.json",
        f"match_{date_str}_{home_name.replace(' ', '')}_vs_{away_name.replace(' ', '')}.json",
    ]
    
    # Also try with different team name formats
    home_variations = [
        home_team.name,
        home_team.name.replace(" ", ""),
        home_team.name.replace(" ", "_"),
        home_team.name.replace(" & ", "&"),
    ]
    away_variations = [
        away_team.name,
        away_team.name.replace(" ", ""),
        away_team.name.replace(" ", "_"),
        away_team.name.replace(" & ", "&"),
    ]
    
    for home_var in home_variations:
        for away_var in away_variations:
            for date_var in [date_str, date_str_alt, date_str_alt2]:
                pattern = f"match_{date_var}_{home_var}_vs_{away_var}.json"
                file_path = match_dir / pattern
                if file_path.exists():
                    return file_path
    
    # Try searching all files for matching teams and date
    for json_file in match_dir.glob("*.json"):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            home_data = data.get("home_team", {})
            away_data = data.get("away_team", {})
            match_info = data.get("match_info", {})
            
            # Check if teams match
            if (home_data.get("name") == home_team.name or 
                home_data.get("fbref_id") == home_team.fbref_id):
                if (away_data.get("name") == away_team.name or 
                    away_data.get("fbref_id") == away_team.fbref_id):
                    # Check date
                    file_date_str = match_info.get("date") or data.get("date", "")
                    if file_date_str:
                        try:
                            # Try to parse and compare dates
                            for fmt in ["%B %d, %Y", "%Y-%m-%d", "%Y_%m_%d"]:
                                try:
                                    file_date = datetime.strptime(file_date_str, fmt).date()
                                    if file_date == match.match_date:
                                        return json_file
                                except ValueError:
                                    continue
                        except:
                            pass
        except:
            continue
    
    return None


def main():
    season = "2023-2024"
    data_dir = Path(__file__).parent.parent / "data"
    match_dir = data_dir / season / "matches"
    
    print(f"\n{'='*60}")
    print("Checking Match Completeness")
    print(f"{'='*60}\n")
    
    with Session(pl_engine) as session:
        # Get all matches for the season
        matches = session.exec(
            select(Match).where(Match.season == season)
        ).all()
        
        print(f"Total matches in database: {len(matches)}\n")
        
        incomplete_matches = []
        
        for i, match in enumerate(matches, 1):
            is_complete, missing = check_match_completeness(session, match)
            
            if not is_complete:
                home_team = session.exec(select(Team).where(Team.id == match.home_team_id)).first()
                away_team = session.exec(select(Team).where(Team.id == match.away_team_id)).first()
                
                incomplete_matches.append((match, missing, home_team, away_team))
                
                if i <= 10 or len(incomplete_matches) <= 10:  # Show first 10
                    print(f"  ⚠ Incomplete: {match.match_date} - {home_team.name if home_team else 'Unknown'} vs {away_team.name if away_team else 'Unknown'}")
                    print(f"     Missing: {', '.join(missing)}")
        
        print(f"\n{'='*60}")
        print(f"Found {len(incomplete_matches)} incomplete matches")
        print(f"{'='*60}\n")
        
        if not incomplete_matches:
            print("✅ All matches are complete!\n")
            return
        
        # Try to find and re-import incomplete matches
        print("Attempting to find JSON files and re-import...\n")
        
        import_service = MatchImportService(season=season, data_dir=data_dir)
        fixed = 0
        not_found = 0
        errors = []
        
        for match, missing, home_team, away_team in incomplete_matches:
            print(f"Processing: {match.match_date} - {home_team.name if home_team else 'Unknown'} vs {away_team.name if away_team else 'Unknown'}")
            print(f"  Missing: {', '.join(missing)}")
            
            # Find JSON file
            json_file = find_match_json_file(match, session, match_dir)
            
            if not json_file:
                print(f"  ✗ JSON file not found")
                not_found += 1
                continue
            
            print(f"  ✓ Found: {json_file.name}")
            
            try:
                # Load and transform
                with open(json_file, 'r', encoding='utf-8') as f:
                    raw_data = json.load(f)
                
                transformed_data = transform_match_data(raw_data)
                if not transformed_data:
                    print(f"  ✗ Failed to transform data")
                    errors.append(f"{json_file.name}: transformation failed")
                    continue
                
                # Delete existing match data (we'll re-import)
                # Delete related records first (in correct order to avoid FK violations)
                from sqlalchemy import delete
                
                # Delete in order: player_stats, events, lineups, team_stats, then match
                session.exec(delete(MatchPlayerStats).where(MatchPlayerStats.match_id == match.id))
                session.exec(delete(MatchEvent).where(MatchEvent.match_id == match.id))
                session.exec(delete(Lineup).where(Lineup.match_id == match.id))
                session.exec(delete(TeamStats).where(TeamStats.match_id == match.id))
                
                # Now delete the match
                session.exec(delete(Match).where(Match.id == match.id))
                session.commit()
                
                # Re-import with error handling
                try:
                    new_match = import_service.import_match(session, transformed_data)
                    if new_match:
                        # Commit and refresh to ensure data is saved
                        session.commit()
                        session.refresh(new_match)
                        
                        # Verify the match was actually imported with data
                        is_complete_after, missing_after = check_match_completeness(session, new_match)
                        if is_complete_after:
                            print(f"  ✓ Re-imported successfully (now complete)")
                            fixed += 1
                        else:
                            print(f"  ⚠ Re-imported but still missing: {', '.join(missing_after)}")
                            # Check if JSON actually has the data
                            has_scores = transformed_data.get("match_info", {}).get("home_score") is not None
                            has_player_stats = len(transformed_data.get("player_stats", {}).get("home", [])) > 0
                            has_events = len(transformed_data.get("events", {}).get("goals", [])) > 0
                            
                            if "scores" in missing_after and not has_scores:
                                print(f"     (Note: JSON file also missing scores)")
                            if "player_stats" in missing_after and not has_player_stats:
                                print(f"     (Note: JSON file also missing player_stats)")
                            if "events" in missing_after and not has_events:
                                print(f"     (Note: JSON file also missing events)")
                            
                            fixed += 1
                            errors.append(f"{json_file.name}: re-imported but still missing {', '.join(missing_after)}")
                    else:
                        print(f"  ✗ Re-import failed (returned None)")
                        errors.append(f"{json_file.name}: re-import failed (returned None)")
                except Exception as e:
                    print(f"  ✗ Re-import error: {str(e)}")
                    errors.append(f"{json_file.name}: {str(e)}")
                    session.rollback()
                    import traceback
                    traceback.print_exc()
                    
            except Exception as e:
                print(f"  ✗ Error: {str(e)}")
                errors.append(f"{json_file.name}: {str(e)}")
                session.rollback()
        
        print(f"\n{'='*60}")
        print("Re-import Summary")
        print(f"{'='*60}")
        print(f"Incomplete matches found: {len(incomplete_matches)}")
        print(f"Successfully fixed: {fixed}")
        print(f"JSON files not found: {not_found}")
        print(f"Errors: {len(errors)}")
        
        if errors:
            print("\nErrors:")
            for error in errors[:10]:
                print(f"  - {error}")
        
        print(f"\n{'='*60}\n")


if __name__ == "__main__":
    main()
