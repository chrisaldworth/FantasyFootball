"""
Check for duplicate matches in the database
"""
import os
import sys
from pathlib import Path
from collections import Counter

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set database URL
db_url = "postgresql://neondb_owner:npg_gCje9Ad0NbXU@ep-still-moon-absrnhma-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
os.environ["PL_DATABASE_URL"] = db_url
os.environ["DATABASE_URL"] = db_url

from app.core.pl_database import pl_engine
from sqlmodel import Session, select, func
from app.models.pl_data import Match, Team

with Session(pl_engine) as session:
    # Get all 2023-2024 matches
    matches = session.exec(
        select(Match)
        .where(Match.season == "2023-2024")
    ).all()
    
    print(f"\n{'='*60}")
    print("Duplicate Match Check")
    print(f"{'='*60}\n")
    print(f"Total matches for 2023-2024: {len(matches)}\n")
    
    # Check for duplicates based on date + home_team + away_team
    match_keys = []
    for match in matches:
        home_team = session.exec(select(Team).where(Team.id == match.home_team_id)).first()
        away_team = session.exec(select(Team).where(Team.id == match.away_team_id)).first()
        key = (match.match_date, match.home_team_id, match.away_team_id)
        match_keys.append((key, match.id, home_team.name if home_team else "Unknown", away_team.name if away_team else "Unknown"))
    
    # Count occurrences
    key_counts = Counter([key for key, _, _, _ in match_keys])
    duplicates = {k: v for k, v in key_counts.items() if v > 1}
    
    if duplicates:
        print(f"⚠️  WARNING: Found {len(duplicates)} duplicate match keys!\n")
        for (date, home_id, away_id), count in duplicates.items():
            home_team = session.exec(select(Team).where(Team.id == home_id)).first()
            away_team = session.exec(select(Team).where(Team.id == away_id)).first()
            print(f"  Duplicate ({count} matches): {date} - {home_team.name if home_team else 'Unknown'} vs {away_team.name if away_team else 'Unknown'}")
            
            # Show all match IDs for this duplicate
            for key, match_id, home_name, away_name in match_keys:
                if key == (date, home_id, away_id):
                    match = session.exec(select(Match).where(Match.id == match_id)).first()
                    print(f"    - Match ID: {match_id}, Created: {match.created_at if match else 'N/A'}")
        print()
    else:
        print("✅ No duplicates found! All matches are unique.\n")
    
    # Also check by match ID uniqueness
    match_ids = [match.id for match in matches]
    duplicate_ids = [mid for mid, count in Counter(match_ids).items() if count > 1]
    if duplicate_ids:
        print(f"⚠️  WARNING: Found {len(duplicate_ids)} duplicate match IDs!")
    else:
        print("✅ All match IDs are unique.\n")
    
    print(f"{'='*60}\n")
