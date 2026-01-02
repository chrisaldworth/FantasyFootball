"""
Quick script to check import progress
"""
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set database URL
db_url = "postgresql://neondb_owner:npg_gCje9Ad0NbXU@ep-still-moon-absrnhma-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
os.environ["PL_DATABASE_URL"] = db_url
os.environ["DATABASE_URL"] = db_url

from app.core.pl_database import pl_engine
from sqlmodel import Session, select, func
from app.models.pl_data import Match, Team, Player, MatchPlayerStats, MatchEvent

with Session(pl_engine) as session:
    # Count matches
    match_count = session.exec(select(func.count(Match.id))).one()
    
    # Count teams
    team_count = session.exec(select(func.count(Team.id))).one()
    
    # Count players
    player_count = session.exec(select(func.count(Player.id))).one()
    
    # Count player stats
    stats_count = session.exec(select(func.count(MatchPlayerStats.id))).one()
    
    # Count events
    events_count = session.exec(select(func.count(MatchEvent.id))).one()
    
    # Get matches by season
    matches_2023_2024 = session.exec(
        select(func.count(Match.id)).where(Match.season == "2023-2024")
    ).one()
    
    print(f"\n{'='*60}")
    print("Import Progress Check")
    print(f"{'='*60}\n")
    print(f"Total matches in database: {match_count}")
    print(f"Matches for 2023-2024 season: {matches_2023_2024}")
    print(f"Total teams: {team_count}")
    print(f"Total players: {player_count}")
    print(f"Total player stats records: {stats_count}")
    print(f"Total match events: {events_count}")
    print(f"\n{'='*60}\n")
    
    # Show some recent matches
    recent_matches = session.exec(
        select(Match)
        .where(Match.season == "2023-2024")
        .order_by(Match.match_date.desc())
        .limit(5)
    ).all()
    
    if recent_matches:
        print("Most recent matches imported:")
        for match in recent_matches:
            home_team = session.exec(select(Team).where(Team.id == match.home_team_id)).first()
            away_team = session.exec(select(Team).where(Team.id == match.away_team_id)).first()
            print(f"  - {match.match_date}: {home_team.name if home_team else 'Unknown'} vs {away_team.name if away_team else 'Unknown'} ({match.score_home}-{match.score_away})")
        print()
