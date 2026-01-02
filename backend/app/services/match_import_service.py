"""
Match Import Service
Service for importing match data from JSON files
Can be used by scripts or API endpoints
"""
from pathlib import Path
from typing import Dict, Any, List, Optional
from sqlmodel import Session, select
from uuid import uuid4
from datetime import datetime
import json

from app.core.pl_database import pl_engine, create_pl_db_and_tables
from app.models.pl_data import (
    Team,
    Player,
    Match,
    MatchPlayerStats,
    MatchEvent,
    Lineup,
    TeamStats,
)


class MatchImportService:
    """Service for importing match data from JSON files"""
    
    def __init__(self, season: str, data_dir: Path):
        self.season = season
        self.data_dir = data_dir
        self.match_dir = data_dir / season / "matches"
        self.teams_cache: Dict[str, Team] = {}
        self.players_cache: Dict[str, Player] = {}
        self.stats_imported = 0
        self.errors: List[str] = []
    
    def _parse_minute(self, minute_str: Any) -> Optional[int]:
        """Parse minute string, handling injury time notation like '90+2'"""
        if not minute_str:
            return None
        if isinstance(minute_str, int):
            return minute_str
        minute_str = str(minute_str).strip()
        # Handle injury time notation like "90+2" -> extract base minute (90)
        if "+" in minute_str:
            minute_str = minute_str.split("+")[0]
        try:
            return int(minute_str)
        except (ValueError, TypeError):
            return None
        
    def get_or_create_team(self, session: Session, name: str, fbref_id: Optional[str] = None) -> Team:
        """Get existing team or create new one"""
        # Generate fallback fbref_id if missing (use name-based hash)
        if not fbref_id or not fbref_id.strip():
            import hashlib
            fbref_id = hashlib.md5(name.lower().encode()).hexdigest()[:8]
        
        cache_key = fbref_id
        if cache_key in self.teams_cache:
            return self.teams_cache[cache_key]
        
        statement = select(Team).where(Team.fbref_id == fbref_id)
        team = session.exec(statement).first()
        
        if not team:
            team = Team(
                id=uuid4(),
                fbref_id=fbref_id,
                name=name,
            )
            session.add(team)
            session.commit()
            session.refresh(team)
        
        self.teams_cache[cache_key] = team
        return team
    
    def get_or_create_player(self, session: Session, name: str, fbref_id: str, 
                            position: str = None, team_id: str = None) -> Player:
        """Get existing player or create new one"""
        cache_key = fbref_id
        if cache_key in self.players_cache:
            return self.players_cache[cache_key]
        
        statement = select(Player).where(Player.fbref_id == fbref_id)
        player = session.exec(statement).first()
        
        if not player:
            player = Player(
                id=uuid4(),
                fbref_id=fbref_id,
                name=name,
                position=position,
                current_team_id=team_id,
            )
            session.add(player)
            session.commit()
            session.refresh(player)
        
        self.players_cache[cache_key] = player
        return player
    
    def import_match(self, session: Session, match_data: Dict[str, Any]) -> Match:
        """Import a single match from JSON data"""
        match_info = match_data.get("match_info", {})
        home_team_data = match_data.get("home_team", {})
        away_team_data = match_data.get("away_team", {})
        
        # Get or create teams
        home_team = self.get_or_create_team(
            session,
            home_team_data.get("name", ""),
            home_team_data.get("fbref_id", "")
        )
        away_team = self.get_or_create_team(
            session,
            away_team_data.get("name", ""),
            away_team_data.get("fbref_id", "")
        )
        
        # Parse date
        from datetime import datetime
        date_str = match_info.get("date", "")
        match_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        
        # Check if match already exists
        statement = select(Match).where(
            Match.match_date == match_date,
            Match.home_team_id == home_team.id,
            Match.away_team_id == away_team.id,
            Match.season == self.season
        )
        existing_match = session.exec(statement).first()
        
        if existing_match:
            return existing_match  # Skip if already exists
        
        # Create match
        # Handle scores - 0 is a valid score, so check for None explicitly
        home_score = match_info.get("home_score")
        away_score = match_info.get("away_score")
        # If scores are None, try to get from score object (for backwards compatibility)
        if home_score is None:
            home_score = match_data.get("score", {}).get("home")
        if away_score is None:
            away_score = match_data.get("score", {}).get("away")
        
        match = Match(
            id=uuid4(),
            season=self.season,
            match_date=match_date,
            home_team_id=home_team.id,
            away_team_id=away_team.id,
            score_home=home_score,
            score_away=away_score,
            status="finished",
            venue=match_info.get("venue"),
            referee=match_info.get("referee"),
            attendance=match_info.get("attendance"),
            home_manager=home_team_data.get("manager"),
            away_manager=away_team_data.get("manager"),
            home_captain=home_team_data.get("captain"),
            away_captain=away_team_data.get("captain"),
        )
        session.add(match)
        session.commit()
        session.refresh(match)
        
        # Import related data with error handling
        try:
            self._import_lineups(session, match, match_data.get("lineups", {}), home_team, away_team)
        except Exception as e:
            print(f"[Import] Error importing lineups: {e}")
        
        try:
            self._import_events(session, match, match_data.get("events", {}), home_team, away_team)
        except Exception as e:
            print(f"[Import] Error importing events: {e}")
            import traceback
            traceback.print_exc()
        
        try:
            self._import_player_stats(session, match, match_data.get("player_stats", {}), home_team, away_team)
        except Exception as e:
            print(f"[Import] Error importing player stats: {e}")
            import traceback
            traceback.print_exc()
        
        try:
            self._import_team_stats(session, match, match_data.get("team_stats", {}), home_team, away_team)
        except Exception as e:
            print(f"[Import] Error importing team stats: {e}")
        
        session.commit()
        return match
    
    def _import_lineups(self, session: Session, match: Match, lineups_data: Dict[str, Any],
                       home_team: Team, away_team: Team):
        """Import lineups"""
        if "home" in lineups_data:
            home_lineup = lineups_data["home"]
            lineup = Lineup(
                id=uuid4(),
                match_id=match.id,
                team_id=home_team.id,
                is_home=True,
                formation=home_lineup.get("formation"),
                starting_xi=home_lineup.get("starting_xi", []),
                substitutes=home_lineup.get("substitutes", []),
            )
            session.add(lineup)
        
        if "away" in lineups_data:
            away_lineup = lineups_data["away"]
            lineup = Lineup(
                id=uuid4(),
                match_id=match.id,
                team_id=away_team.id,
                is_home=False,
                formation=away_lineup.get("formation"),
                starting_xi=away_lineup.get("starting_xi", []),
                substitutes=away_lineup.get("substitutes", []),
            )
            session.add(lineup)
    
    def _import_events(self, session: Session, match: Match, events_data: Dict[str, Any],
                      home_team: Team, away_team: Team):
        """Import match events"""
        # Import goals
        for goal in events_data.get("goals", []):
            player_id = goal.get("player_id")
            player = None
            if player_id:
                statement = select(Player).where(Player.fbref_id == player_id)
                player = session.exec(statement).first()
            
            team = home_team if goal.get("team") == "home" else away_team
            minute = self._parse_minute(goal.get("minute"))
            
            event = MatchEvent(
                id=uuid4(),
                match_id=match.id,
                event_type="goal",
                minute=minute,
                player_id=player.id if player else None,
                team_id=team.id,
                details={
                    "player_name": goal.get("player_name"),
                    "assist_player": goal.get("assist_player"),
                    "assist_player_id": goal.get("assist_player_id"),
                }
            )
            session.add(event)
        
        # Import cards
        for card in events_data.get("cards", []):
            player_id = card.get("player_id")
            player = None
            if player_id:
                statement = select(Player).where(Player.fbref_id == player_id)
                player = session.exec(statement).first()
            
            team = home_team if card.get("team") == "home" else away_team
            minute = self._parse_minute(card.get("minute"))
            
            event = MatchEvent(
                id=uuid4(),
                match_id=match.id,
                event_type="card",
                minute=minute,
                player_id=player.id if player else None,
                team_id=team.id,
                details={
                    "card_type": card.get("card_type") or card.get("type"),
                    "player_name": card.get("player_name"),
                }
            )
            session.add(event)
        
        # Import substitutions
        for sub in events_data.get("substitutions", []):
            player_in_id = sub.get("player_in_id")
            player_out_id = sub.get("player_out_id")
            
            player_in = None
            player_out = None
            
            if player_in_id:
                statement = select(Player).where(Player.fbref_id == player_in_id)
                player_in = session.exec(statement).first()
            if player_out_id:
                statement = select(Player).where(Player.fbref_id == player_out_id)
                player_out = session.exec(statement).first()
            
            team = home_team if sub.get("team") == "home" else away_team
            minute = self._parse_minute(sub.get("minute"))
            
            event = MatchEvent(
                id=uuid4(),
                match_id=match.id,
                event_type="substitution",
                minute=minute,
                player_id=player_out.id if player_out else None,
                team_id=team.id,
                details={
                    "player_in_name": sub.get("player_in"),
                    "player_in_id": player_in_id,
                    "player_out_name": sub.get("player_out"),
                    "player_out_id": player_out_id,
                }
            )
            session.add(event)
    
    def _import_player_stats(self, session: Session, match: Match, player_stats_data: Dict[str, Any],
                            home_team: Team, away_team: Team):
        """Import player statistics"""
        # Home team stats
        for stat in player_stats_data.get("home", []):
            player = self.get_or_create_player(
                session,
                stat.get("player_name", ""),
                stat.get("player_id", ""),
                stat.get("position"),
                home_team.id,
            )
            
            stats = MatchPlayerStats(
                id=uuid4(),
                match_id=match.id,
                player_id=player.id,
                team_id=home_team.id,
                minutes=stat.get("minutes"),
                goals=stat.get("goals", 0),
                assists=stat.get("assists", 0),
                shots=stat.get("shots"),
                shots_on_target=stat.get("shots_on_target"),
                passes=stat.get("passes"),
                pass_accuracy=stat.get("pass_accuracy"),
                tackles=stat.get("tackles"),
                interceptions=stat.get("interceptions"),
                fouls=stat.get("fouls"),
                cards=stat.get("cards"),
            )
            session.add(stats)
        
        # Away team stats
        for stat in player_stats_data.get("away", []):
            player = self.get_or_create_player(
                session,
                stat.get("player_name", ""),
                stat.get("player_id", ""),
                stat.get("position"),
                away_team.id,
            )
            
            stats = MatchPlayerStats(
                id=uuid4(),
                match_id=match.id,
                player_id=player.id,
                team_id=away_team.id,
                minutes=stat.get("minutes"),
                goals=stat.get("goals", 0),
                assists=stat.get("assists", 0),
                shots=stat.get("shots"),
                shots_on_target=stat.get("shots_on_target"),
                passes=stat.get("passes"),
                pass_accuracy=stat.get("pass_accuracy"),
                tackles=stat.get("tackles"),
                interceptions=stat.get("interceptions"),
                fouls=stat.get("fouls"),
                cards=stat.get("cards"),
            )
            session.add(stats)
    
    def _import_team_stats(self, session: Session, match: Match, team_stats_data: Dict[str, Any],
                          home_team: Team, away_team: Team):
        """Import team statistics"""
        if "home" in team_stats_data:
            home_stats = team_stats_data["home"]
            stats = TeamStats(
                id=uuid4(),
                match_id=match.id,
                team_id=home_team.id,
                is_home=True,
                possession=home_stats.get("possession"),
                passes=home_stats.get("passes"),
                pass_accuracy=home_stats.get("pass_accuracy"),
                shots=home_stats.get("shots"),
                shots_on_target=home_stats.get("shots_on_target"),
                tackles=home_stats.get("tackles"),
                interceptions=home_stats.get("interceptions"),
                clearances=home_stats.get("clearances"),
            )
            session.add(stats)
        
        if "away" in team_stats_data:
            away_stats = team_stats_data["away"]
            stats = TeamStats(
                id=uuid4(),
                match_id=match.id,
                team_id=away_team.id,
                is_home=False,
                possession=away_stats.get("possession"),
                passes=away_stats.get("passes"),
                pass_accuracy=away_stats.get("pass_accuracy"),
                shots=away_stats.get("shots"),
                shots_on_target=away_stats.get("shots_on_target"),
                tackles=away_stats.get("tackles"),
                interceptions=away_stats.get("interceptions"),
                clearances=away_stats.get("clearances"),
            )
            session.add(stats)
    
    def run(self) -> Dict[str, Any]:
        """Run the import process"""
        print(f"\n{'='*60}")
        print(f"Importing Match Data for Season: {self.season}")
        print(f"{'='*60}\n")
        
        # Verify tables exist (don't try to create to avoid metadata conflicts)
        from sqlalchemy import inspect
        from app.core.pl_database import pl_engine
        inspector = inspect(pl_engine)
        existing_tables = inspector.get_table_names()
        expected_tables = ["teams", "players", "matches", "match_player_stats", "match_events", "lineups", "team_stats"]
        missing_tables = set(expected_tables) - set(existing_tables)
        
        if missing_tables:
            print(f"[Import] Missing tables detected: {missing_tables}")
            print("[Import] Attempting to create missing tables...")
            try:
                create_pl_db_and_tables()
            except Exception as e:
                error_str = str(e)
                if "already defined" in error_str:
                    # Metadata conflict - this happens when models are imported multiple times
                    # The error occurs during model class definition, not table creation
                    # Check if tables actually exist in database
                    print(f"[Import] Metadata conflict during model import: {error_str[:200]}")
                    inspector = inspect(pl_engine)
                    actual_tables = inspector.get_table_names()
                    still_missing = set(missing_tables) - set(actual_tables)
                    if still_missing:
                        # Tables are actually missing - this is a real problem
                        raise Exception(f"Tables missing in database and cannot be created due to metadata conflict: {still_missing}. Please restart the service to clear metadata cache.")
                    else:
                        print("[Import] All required tables exist despite metadata conflict, continuing")
                else:
                    raise
        else:
            print("[Import] All PL data tables exist, proceeding with import")
        
        # Get all match files
        match_files = sorted(self.match_dir.glob("*.json"))
        total_matches = len(match_files)
        
        print(f"Found {total_matches} match files\n")
        
        from app.core.pl_database import pl_engine
        from sqlmodel import Session
        
        with Session(pl_engine) as session:
            for i, match_file in enumerate(match_files, 1):
                print(f"[{i}/{total_matches}] Processing: {match_file.name}")
                
                try:
                    with open(match_file, 'r', encoding='utf-8') as f:
                        match_data = json.load(f)
                    
                    match = self.import_match(session, match_data)
                    if match:
                        self.stats_imported += 1
                        print(f"  ✓ Imported: {match_file.name}")
                    else:
                        print(f"  - Skipped (already exists): {match_file.name}")
                        
                except Exception as e:
                    error_msg = f"Error processing {match_file.name}: {str(e)}"
                    print(f"  ✗ ERROR: {error_msg}")
                    self.errors.append(error_msg)
                    session.rollback()
        
        return {
            "imported": self.stats_imported,
            "total": total_matches,
            "errors": self.errors,
        }

