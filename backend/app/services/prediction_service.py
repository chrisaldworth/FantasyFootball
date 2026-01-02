"""
Prediction Service
AI-powered match score and goal scorer predictions using historical data analysis
"""
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, date, timedelta
from sqlmodel import Session, select, func, and_, or_
from collections import defaultdict
from functools import lru_cache
import hashlib
import json

from app.core.pl_database import get_pl_session
from app.models.pl_data import Match, Team, Player, MatchEvent, MatchPlayerStats
from app.services.fpl_service import fpl_service

# Simple in-memory cache for predictions (TTL: 1 hour)
_prediction_cache: Dict[str, Tuple[Any, datetime]] = {}
CACHE_TTL = timedelta(hours=1)


class PredictionService:
    """Service for generating match predictions"""
    
    def __init__(self, session: Session):
        self.pl_session = session
    
    def predict_match_score(
        self,
        home_team_id: str,
        away_team_id: str,
        season: str,
        match_date: date,
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """
        Predict match score using historical data analysis
        
        Factors considered:
        - Team form (last 5-10 matches)
        - Home/away performance
        - Head-to-head history
        - Goals scored/conceded averages
        - Recent defensive strength
        """
        # Check cache
        if use_cache:
            cache_key = f"pred_{home_team_id}_{away_team_id}_{season}_{match_date.isoformat()}"
            if cache_key in _prediction_cache:
                cached_result, cached_time = _prediction_cache[cache_key]
                if datetime.now() - cached_time < CACHE_TTL:
                    return cached_result
                else:
                    # Expired, remove from cache
                    del _prediction_cache[cache_key]
        
        from uuid import UUID
        try:
            home_uuid = UUID(home_team_id) if isinstance(home_team_id, str) else home_team_id
            away_uuid = UUID(away_team_id) if isinstance(away_team_id, str) else away_team_id
        except (ValueError, TypeError):
            # If UUID conversion fails, try as string
            home_uuid = home_team_id
            away_uuid = away_team_id
        
        home_team = self.pl_session.get(Team, home_uuid)
        away_team = self.pl_session.get(Team, away_uuid)
        
        if not home_team or not away_team:
            raise ValueError("Team not found")
        
        # Get team form (last 10 matches)
        home_form = self._get_team_form(home_team_id, season, match_date, is_home=True)
        away_form = self._get_team_form(away_team_id, season, match_date, is_home=False)
        
        # Get head-to-head history
        h2h_matches = self._get_head_to_head(home_team_id, away_team_id, match_date)
        
        # Calculate average goals
        home_avg_goals_for = home_form.get('avg_goals_for', 1.5)
        home_avg_goals_against = home_form.get('avg_goals_against', 1.2)
        away_avg_goals_for = away_form.get('avg_goals_for', 1.3)
        away_avg_goals_against = away_form.get('avg_goals_against', 1.4)
        
        # Home advantage factor (typically +0.3 goals)
        home_advantage = 0.3
        
        # Calculate predicted scores
        predicted_home = max(0, round(
            (home_avg_goals_for + away_avg_goals_against) / 2 + home_advantage
        ))
        predicted_away = max(0, round(
            (away_avg_goals_for + home_avg_goals_against) / 2 - home_advantage * 0.5
        ))
        
        # Adjust based on H2H if available
        if h2h_matches:
            h2h_home_avg = sum(m['home_score'] for m in h2h_matches) / len(h2h_matches)
            h2h_away_avg = sum(m['away_score'] for m in h2h_matches) / len(h2h_matches)
            predicted_home = round((predicted_home + h2h_home_avg) / 2)
            predicted_away = round((predicted_away + h2h_away_avg) / 2)
        
        # Calculate outcome probabilities
        home_win_prob, draw_prob, away_win_prob = self._calculate_outcome_probabilities(
            predicted_home, predicted_away, home_form, away_form
        )
        
        # Calculate confidence (based on form consistency and data availability)
        confidence = self._calculate_confidence(home_form, away_form, h2h_matches)
        
        # Generate key factors
        key_factors = self._generate_key_factors(
            home_team, away_team, home_form, away_form, h2h_matches
        )
        
        # Generate alternative scores
        alternative_scores = self._generate_alternative_scores(
            predicted_home, predicted_away, home_form, away_form
        )
        
        result = {
            "predictedHomeScore": predicted_home,
            "predictedAwayScore": predicted_away,
            "confidence": confidence,
            "homeWinProbability": home_win_prob,
            "drawProbability": draw_prob,
            "awayWinProbability": away_win_prob,
            "keyFactors": key_factors,
            "alternativeScores": alternative_scores,
        }
        
        # Cache result
        if use_cache:
            cache_key = f"pred_{home_team_id}_{away_team_id}_{season}_{match_date.isoformat()}"
            _prediction_cache[cache_key] = (result, datetime.now())
            # Limit cache size (keep last 1000 entries)
            if len(_prediction_cache) > 1000:
                # Remove oldest entries
                sorted_cache = sorted(_prediction_cache.items(), key=lambda x: x[1][1])
                for key, _ in sorted_cache[:500]:
                    del _prediction_cache[key]
        
        return result
    
    def predict_goal_scorers(
        self,
        home_team_id: str,
        away_team_id: str,
        season: str,
        match_date: date,
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Predict most likely goal scorers for each team
        
        Factors:
        - Player scoring history
        - Recent form (last 5 matches)
        - Position (forwards more likely)
        - Opponent defensive strength
        """
        # Get recent matches for both teams
        home_recent_matches = self._get_recent_matches(home_team_id, season, match_date, limit=10)
        away_recent_matches = self._get_recent_matches(away_team_id, season, match_date, limit=10)
        
        # Get player scoring stats
        home_scorers = self._get_player_scoring_stats(home_team_id, home_recent_matches)
        away_scorers = self._get_player_scoring_stats(away_team_id, away_recent_matches)
        
        # Calculate opponent defensive strength
        home_def_strength = self._get_defensive_strength(home_team_id, season, match_date, is_home=True)
        away_def_strength = self._get_defensive_strength(away_team_id, season, match_date, is_home=False)
        
        # Adjust probabilities based on opponent strength
        for scorer in home_scorers:
            scorer['probability'] = min(100, scorer['probability'] * (1 + (1 - away_def_strength) * 0.2))
        
        for scorer in away_scorers:
            scorer['probability'] = min(100, scorer['probability'] * (1 + (1 - home_def_strength) * 0.2))
        
        # Sort by probability and return top 5
        home_scorers.sort(key=lambda x: x['probability'], reverse=True)
        away_scorers.sort(key=lambda x: x['probability'], reverse=True)
        
        return {
            "homeScorers": home_scorers[:5],
            "awayScorers": away_scorers[:5],
        }
    
    def _get_team_form(
        self,
        team_id: str,
        season: str,
        before_date: date,
        is_home: bool,
        limit: int = 10
    ) -> Dict[str, float]:
        """Get team form statistics"""
        from uuid import UUID
        team_uuid = UUID(team_id) if isinstance(team_id, str) and len(team_id) == 36 else team_id
        
        # Build query based on home/away
        if is_home:
            query = select(Match).where(
                and_(
                    Match.season == season,
                    Match.match_date < before_date,
                    Match.status == "finished",
                    Match.home_team_id == team_uuid
                )
            )
        else:
            query = select(Match).where(
                and_(
                    Match.season == season,
                    Match.match_date < before_date,
                    Match.status == "finished",
                    Match.away_team_id == team_uuid
                )
            )
        
        query = query.order_by(Match.match_date.desc()).limit(limit)
        
        matches = self.pl_session.exec(query).all()
        
        if not matches:
            return {
                'avg_goals_for': 1.5,
                'avg_goals_against': 1.2,
                'wins': 0,
                'draws': 0,
                'losses': 0,
            }
        
        goals_for = []
        goals_against = []
        wins = 0
        draws = 0
        losses = 0
        
        for match in matches:
            if match.home_team_id == team_id:
                goals_for.append(match.score_home or 0)
                goals_against.append(match.score_away or 0)
                if (match.score_home or 0) > (match.score_away or 0):
                    wins += 1
                elif (match.score_home or 0) == (match.score_away or 0):
                    draws += 1
                else:
                    losses += 1
            else:
                goals_for.append(match.score_away or 0)
                goals_against.append(match.score_home or 0)
                if (match.score_away or 0) > (match.score_home or 0):
                    wins += 1
                elif (match.score_away or 0) == (match.score_home or 0):
                    draws += 1
                else:
                    losses += 1
        
        return {
            'avg_goals_for': sum(goals_for) / len(goals_for) if goals_for else 1.5,
            'avg_goals_against': sum(goals_against) / len(goals_against) if goals_against else 1.2,
            'wins': wins,
            'draws': draws,
            'losses': losses,
            'matches_played': len(matches),
        }
    
    def _get_head_to_head(
        self,
        home_team_id: str,
        away_team_id: str,
        before_date: date,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get head-to-head match history"""
        from uuid import UUID
        home_uuid = UUID(home_team_id) if isinstance(home_team_id, str) and len(home_team_id) == 36 else home_team_id
        away_uuid = UUID(away_team_id) if isinstance(away_team_id, str) and len(away_team_id) == 36 else away_team_id
        
        query = select(Match).where(
            and_(
                Match.match_date < before_date,
                Match.status == "finished",
                or_(
                    and_(Match.home_team_id == home_uuid, Match.away_team_id == away_uuid),
                    and_(Match.home_team_id == away_uuid, Match.away_team_id == home_uuid),
                )
            )
        ).order_by(Match.match_date.desc()).limit(limit)
        
        matches = self.pl_session.exec(query).all()
        
        h2h = []
        for match in matches:
            if match.home_team_id == home_team_id:
                h2h.append({
                    'date': match.match_date.isoformat(),
                    'home_score': match.score_home or 0,
                    'away_score': match.score_away or 0,
                })
            else:
                h2h.append({
                    'date': match.match_date.isoformat(),
                    'home_score': match.score_away or 0,
                    'away_score': match.score_home or 0,
                })
        
        return h2h
    
    def _get_recent_matches(
        self,
        team_id: str,
        season: str,
        before_date: date,
        limit: int = 10
    ) -> List[Match]:
        """Get recent matches for a team"""
        from uuid import UUID
        team_uuid = UUID(team_id) if isinstance(team_id, str) and len(team_id) == 36 else team_id
        
        query = select(Match).where(
            and_(
                Match.season == season,
                Match.match_date < before_date,
                Match.status == "finished",
                or_(Match.home_team_id == team_uuid, Match.away_team_id == team_uuid)
            )
        ).order_by(Match.match_date.desc()).limit(limit)
        
        return list(self.pl_session.exec(query).all())
    
    def _get_player_scoring_stats(
        self,
        team_id: str,
        recent_matches: List[Match]
    ) -> List[Dict[str, Any]]:
        """Get player scoring statistics from recent matches"""
        if not recent_matches:
            return []
        
        match_ids = [match.id for match in recent_matches]
        
        from uuid import UUID
        team_uuid = UUID(team_id) if isinstance(team_id, str) and len(team_id) == 36 else team_id
        
        # Get goal events for these matches
        query = select(MatchEvent).where(
            and_(
                MatchEvent.match_id.in_(match_ids),
                MatchEvent.event_type == "goal",
                MatchEvent.team_id == team_uuid,
            )
        )
        
        goal_events = self.pl_session.exec(query).all()
        
        # Count goals per player
        player_goals = defaultdict(int)
        player_names = {}
        
        for event in goal_events:
            if event.player_id:
                player_goals[str(event.player_id)] += 1
                player_name = event.details.get('player_name', 'Unknown')
                if player_name != 'Unknown':
                    player_names[str(event.player_id)] = player_name
        
        # Get player details
        scorers = []
        for player_id_str, goals in player_goals.items():
            from uuid import UUID
            try:
                player_uuid = UUID(player_id_str)
                player = self.pl_session.get(Player, player_uuid)
            except (ValueError, TypeError):
                # Try as string if UUID conversion fails
                player = self.pl_session.get(Player, player_id_str)
            
            if player:
                # Calculate probability based on goals in last matches
                probability = min(100, (goals / len(recent_matches)) * 100 * 2) if recent_matches else 0
                
                # Adjust for position (forwards get boost)
                position_boost = 1.0
                if player.position in ['FW', 'FWD', 'ST', 'F']:
                    position_boost = 1.3
                elif player.position in ['MF', 'MID', 'AM', 'CM', 'M']:
                    position_boost = 1.1
                
                probability = min(100, probability * position_boost)
                
                # Determine form
                form: str = 'neutral'
                if goals >= 3:
                    form = 'hot'
                elif goals == 0:
                    form = 'cold'
                
                # Try to get FPL player ID from fbref_id if it's numeric
                player_id_int = 0
                if player.fbref_id and player.fbref_id.isdigit():
                    try:
                        player_id_int = int(player.fbref_id)
                    except:
                        pass
                
                scorers.append({
                    'playerId': player_id_int,
                    'playerName': player.name,
                    'position': player.position or 'MID',
                    'probability': round(probability, 1),
                    'form': form,
                    'recentGoals': goals,
                })
        
        return scorers
    
    def _get_defensive_strength(
        self,
        team_id: str,
        season: str,
        before_date: date,
        is_home: bool
    ) -> float:
        """Get defensive strength (0-1, where 1 is strongest)"""
        form = self._get_team_form(team_id, season, before_date, is_home, limit=10)
        avg_conceded = form.get('avg_goals_against', 1.5)
        
        # Normalize to 0-1 scale (assuming 0-3 goals conceded range)
        strength = max(0, min(1, 1 - (avg_conceded / 3)))
        return strength
    
    def _calculate_outcome_probabilities(
        self,
        predicted_home: int,
        predicted_away: int,
        home_form: Dict,
        away_form: Dict
    ) -> Tuple[int, int, int]:
        """Calculate win/draw/loss probabilities"""
        # Base probabilities from predicted score
        if predicted_home > predicted_away:
            home_win_base = 60
            draw_base = 20
            away_win_base = 20
        elif predicted_home < predicted_away:
            home_win_base = 20
            draw_base = 20
            away_win_base = 60
        else:
            home_win_base = 30
            draw_base = 40
            away_win_base = 30
        
        # Adjust based on form
        home_form_factor = (home_form.get('wins', 0) - home_form.get('losses', 0)) * 2
        away_form_factor = (away_form.get('wins', 0) - away_form.get('losses', 0)) * 2
        
        home_win_prob = max(5, min(95, home_win_base + home_form_factor - away_form_factor))
        away_win_prob = max(5, min(95, away_win_base - home_form_factor + away_form_factor))
        draw_prob = 100 - home_win_prob - away_win_prob
        
        # Ensure probabilities sum to 100
        total = home_win_prob + draw_prob + away_win_prob
        if total != 100:
            home_win_prob = round(home_win_prob * 100 / total)
            draw_prob = round(draw_prob * 100 / total)
            away_win_prob = 100 - home_win_prob - draw_prob
        
        return home_win_prob, draw_prob, away_win_prob
    
    def _calculate_confidence(
        self,
        home_form: Dict,
        away_form: Dict,
        h2h_matches: List[Dict]
    ) -> int:
        """Calculate prediction confidence (0-100)"""
        confidence = 50  # Base confidence
        
        # More matches = higher confidence
        if home_form.get('matches_played', 0) >= 5:
            confidence += 10
        if away_form.get('matches_played', 0) >= 5:
            confidence += 10
        
        # H2H data available
        if h2h_matches:
            confidence += 15
        
        # Form consistency (wins vs losses)
        home_consistency = abs(home_form.get('wins', 0) - home_form.get('losses', 0))
        away_consistency = abs(away_form.get('wins', 0) - away_form.get('losses', 0))
        if home_consistency >= 3 or away_consistency >= 3:
            confidence += 10
        
        return min(100, confidence)
    
    def _generate_key_factors(
        self,
        home_team: Team,
        away_team: Team,
        home_form: Dict,
        away_form: Dict,
        h2h_matches: List[Dict]
    ) -> List[str]:
        """Generate key factors influencing the prediction"""
        factors = []
        
        # Home form
        home_wins = home_form.get('wins', 0)
        home_losses = home_form.get('losses', 0)
        if home_wins > home_losses + 2:
            factors.append(f"{home_team.name} strong home form ({home_wins}W, {home_losses}L in last matches)")
        elif home_losses > home_wins + 2:
            factors.append(f"{home_team.name} poor home form ({home_wins}W, {home_losses}L in last matches)")
        
        # Away form
        away_wins = away_form.get('wins', 0)
        away_losses = away_form.get('losses', 0)
        if away_wins > away_losses + 2:
            factors.append(f"{away_team.name} strong away form ({away_wins}W, {away_losses}L in last matches)")
        elif away_losses > away_wins + 2:
            factors.append(f"{away_team.name} poor away form ({away_wins}W, {away_losses}L in last matches)")
        
        # Goals
        home_avg_for = home_form.get('avg_goals_for', 0)
        away_avg_against = away_form.get('avg_goals_against', 0)
        if home_avg_for > 2.0:
            factors.append(f"{home_team.name} averaging {home_avg_for:.1f} goals per match")
        if away_avg_against > 1.5:
            factors.append(f"{away_team.name} conceding {away_avg_against:.1f} goals per match on average")
        
        # H2H
        if h2h_matches:
            home_wins_h2h = sum(1 for m in h2h_matches if m['home_score'] > m['away_score'])
            if home_wins_h2h >= len(h2h_matches) * 0.6:
                factors.append(f"{home_team.name} won {home_wins_h2h} of last {len(h2h_matches)} meetings")
        
        return factors[:5]  # Limit to 5 factors
    
    def _generate_alternative_scores(
        self,
        predicted_home: int,
        predicted_away: int,
        home_form: Dict,
        away_form: Dict
    ) -> List[Dict[str, Any]]:
        """Generate alternative likely scorelines"""
        alternatives = []
        
        # Generate variations around predicted score
        variations = [
            (predicted_home, predicted_away, 30),
            (predicted_home + 1, predicted_away, 20),
            (predicted_home, predicted_away + 1, 20),
            (predicted_home - 1, predicted_away, 15),
            (predicted_home, predicted_away - 1, 15),
            (predicted_home + 1, predicted_away + 1, 10),
        ]
        
        for home, away, prob in variations:
            if home >= 0 and away >= 0:
                alternatives.append({
                    'home': home,
                    'away': away,
                    'probability': prob,
                })
        
        # Sort by probability
        alternatives.sort(key=lambda x: x['probability'], reverse=True)
        return alternatives[:6]
    
    def get_team_form_data(
        self,
        team_id: str,
        season: str,
        before_date: date,
        is_home: bool,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Get team form data for charts"""
        matches = self._get_recent_matches(team_id, season, before_date, limit=limit)
        
        form_data = []
        for match in reversed(matches):  # Reverse to show chronological order
            if match.home_team_id == team_id:
                form_data.append({
                    'match': f"vs {match.away_team_id}",
                    'goalsFor': match.score_home or 0,
                    'goalsAgainst': match.score_away or 0,
                    'result': 'W' if (match.score_home or 0) > (match.score_away or 0) else ('D' if (match.score_home or 0) == (match.score_away or 0) else 'L'),
                })
            else:
                form_data.append({
                    'match': f"@ {match.home_team_id}",
                    'goalsFor': match.score_away or 0,
                    'goalsAgainst': match.score_home or 0,
                    'result': 'W' if (match.score_away or 0) > (match.score_home or 0) else ('D' if (match.score_away or 0) == (match.score_home or 0) else 'L'),
                })
        
        return form_data


# Note: PredictionService requires a session, create instances in endpoints
