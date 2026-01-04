"""
Prediction Service
AI-powered match score and goal scorer predictions using historical data analysis

Enhanced with:
- Poisson distribution for realistic score probabilities
- Elo ratings for team strength estimation
- Player availability factors from FPL API
"""
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, date, timedelta
from sqlmodel import Session, select, func, and_, or_
from collections import defaultdict
from functools import lru_cache
import hashlib
import json
import math

# Try to import scipy for Poisson distribution
try:
    from scipy.stats import poisson
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False
    print("[PredictionService] scipy not available, using fallback probability calculation")

from app.core.pl_database import get_pl_session
from app.models.pl_data import Match, Team, Player, MatchEvent, MatchPlayerStats
from app.services.fpl_service import fpl_service

# Simple in-memory cache for predictions (TTL: 1 hour)
_prediction_cache: Dict[str, Tuple[Any, datetime]] = {}
CACHE_TTL = timedelta(hours=1)

# Elo ratings cache (recalculated periodically)
_elo_ratings_cache: Dict[str, Tuple[Dict[str, float], datetime]] = {}
ELO_CACHE_TTL = timedelta(hours=6)

# Base Elo rating for new teams
BASE_ELO = 1500
# K-factor for Elo updates (higher = more volatile)
ELO_K_FACTOR = 32
# Home advantage in Elo points
HOME_ELO_ADVANTAGE = 65


class PredictionService:
    """Service for generating match predictions with advanced algorithms"""
    
    def __init__(self, session: Session):
        self.pl_session = session
        self._fpl_data_cache: Dict[str, Any] = {}
    
    async def predict_match_score(
        self,
        home_team_id: str,
        away_team_id: str,
        season: str,
        match_date: date,
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """
        Predict match score using advanced algorithms:
        - Poisson distribution for score probabilities
        - Elo ratings for team strength
        - Player availability adjustments
        
        Returns comprehensive prediction with probabilities for each scoreline.
        """
        # Check cache
        if use_cache:
            cache_key = f"pred_v2_{home_team_id}_{away_team_id}_{season}_{match_date.isoformat()}"
            if cache_key in _prediction_cache:
                cached_result, cached_time = _prediction_cache[cache_key]
                if datetime.now() - cached_time < CACHE_TTL:
                    return cached_result
                else:
                    del _prediction_cache[cache_key]
        
        from uuid import UUID
        try:
            home_uuid = UUID(home_team_id) if isinstance(home_team_id, str) else home_team_id
            away_uuid = UUID(away_team_id) if isinstance(away_team_id, str) else away_team_id
        except (ValueError, TypeError):
            home_uuid = home_team_id
            away_uuid = away_team_id
        
        home_team = self.pl_session.get(Team, home_uuid)
        away_team = self.pl_session.get(Team, away_uuid)
        
        if not home_team or not away_team:
            raise ValueError("Team not found")
        
        # 1. Get Elo ratings for both teams
        elo_ratings = self._calculate_elo_ratings(season, match_date)
        home_elo = elo_ratings.get(str(home_team.id), BASE_ELO)
        away_elo = elo_ratings.get(str(away_team.id), BASE_ELO)
        
        # 2. Get team form (last 10 matches)
        home_form = self._get_team_form(home_team_id, season, match_date, is_home=True)
        away_form = self._get_team_form(away_team_id, season, match_date, is_home=False)
        
        # 3. Get player availability factor (async call wrapped)
        home_availability = 1.0
        away_availability = 1.0
        try:
            # Get FPL team IDs from fbref_id (format: "fpl_X")
            home_fpl_id = self._extract_fpl_team_id(home_team.fbref_id)
            away_fpl_id = self._extract_fpl_team_id(away_team.fbref_id)
            
            if home_fpl_id and away_fpl_id:
                home_availability = await self._get_player_availability_factor(home_fpl_id)
                away_availability = await self._get_player_availability_factor(away_fpl_id)
        except Exception as e:
            print(f"[PredictionService] Error getting availability: {e}")
        
        # 4. Get head-to-head history
        h2h_matches = self._get_head_to_head(home_team_id, away_team_id, match_date)
        
        # 5. Calculate expected goals using Elo + form + availability
        home_xg, away_xg = self._calculate_expected_goals(
            home_elo, away_elo,
            home_form, away_form,
            home_availability, away_availability,
            h2h_matches
        )
        
        # 6. Calculate score probabilities using Poisson distribution
        if SCIPY_AVAILABLE:
            score_probs = self._calculate_poisson_probabilities(home_xg, away_xg)
        else:
            score_probs = self._calculate_fallback_probabilities(home_xg, away_xg)
        
        # 7. Get most likely score and outcome probabilities
        most_likely_score = max(score_probs.items(), key=lambda x: x[1])
        predicted_home, predicted_away = most_likely_score[0]
        
        # Calculate outcome probabilities from score matrix
        home_win_prob = sum(prob for (h, a), prob in score_probs.items() if h > a) * 100
        draw_prob = sum(prob for (h, a), prob in score_probs.items() if h == a) * 100
        away_win_prob = sum(prob for (h, a), prob in score_probs.items() if h < a) * 100
        
        # Normalize to ensure they sum to 100
        total_prob = home_win_prob + draw_prob + away_win_prob
        if total_prob > 0:
            home_win_prob = round(home_win_prob * 100 / total_prob)
            draw_prob = round(draw_prob * 100 / total_prob)
            away_win_prob = 100 - home_win_prob - draw_prob
        
        # 8. Calculate confidence based on multiple factors
        confidence = self._calculate_confidence_v2(
            home_form, away_form, h2h_matches,
            home_elo, away_elo, home_availability, away_availability
        )
        
        # 9. Generate key factors
        key_factors = self._generate_key_factors_v2(
            home_team, away_team, home_form, away_form, h2h_matches,
            home_elo, away_elo, home_availability, away_availability
        )
        
        # 10. Generate alternative scores from probability matrix
        alternative_scores = self._get_top_scorelines(score_probs, n=6)
        
        result = {
            "predictedHomeScore": predicted_home,
            "predictedAwayScore": predicted_away,
            "confidence": confidence,
            "homeWinProbability": home_win_prob,
            "drawProbability": draw_prob,
            "awayWinProbability": away_win_prob,
            "keyFactors": key_factors,
            "alternativeScores": alternative_scores,
            # New fields for enhanced predictions
            "expectedGoals": {
                "home": round(home_xg, 2),
                "away": round(away_xg, 2),
            },
            "eloRatings": {
                "home": round(home_elo),
                "away": round(away_elo),
                "difference": round(home_elo - away_elo),
            },
            "availability": {
                "home": round(home_availability * 100),
                "away": round(away_availability * 100),
            },
        }
        
        # Cache result
        if use_cache:
            cache_key = f"pred_v2_{home_team_id}_{away_team_id}_{season}_{match_date.isoformat()}"
            _prediction_cache[cache_key] = (result, datetime.now())
            if len(_prediction_cache) > 1000:
                sorted_cache = sorted(_prediction_cache.items(), key=lambda x: x[1][1])
                for key, _ in sorted_cache[:500]:
                    del _prediction_cache[key]
        
        return result
    
    def _calculate_elo_ratings(self, season: str, before_date: date) -> Dict[str, float]:
        """
        Calculate Elo ratings for all teams based on match results.
        Uses a simplified calculation that updates ratings after each match.
        """
        cache_key = f"{season}_{before_date.isoformat()}"
        
        # Check cache
        if cache_key in _elo_ratings_cache:
            cached_ratings, cached_time = _elo_ratings_cache[cache_key]
            if datetime.now() - cached_time < ELO_CACHE_TTL:
                return cached_ratings
        
        # Initialize all teams with base rating
        ratings: Dict[str, float] = {}
        
        # Get all finished matches in season before the date
        query = select(Match).where(
            and_(
                Match.season == season,
                Match.match_date < before_date,
                Match.status == "finished"
            )
        ).order_by(Match.match_date.asc())
        
        matches = self.pl_session.exec(query).all()
        
        for match in matches:
            home_id = str(match.home_team_id)
            away_id = str(match.away_team_id)
            
            # Initialize ratings if not exists
            if home_id not in ratings:
                ratings[home_id] = BASE_ELO
            if away_id not in ratings:
                ratings[away_id] = BASE_ELO
            
            # Get current ratings (with home advantage)
            home_rating = ratings[home_id] + HOME_ELO_ADVANTAGE
            away_rating = ratings[away_id]
            
            # Calculate expected scores
            home_expected = 1 / (1 + 10 ** ((away_rating - home_rating) / 400))
            away_expected = 1 - home_expected
            
            # Get actual result (1 = win, 0.5 = draw, 0 = loss)
            home_score = match.score_home or 0
            away_score = match.score_away or 0
            
            if home_score > away_score:
                home_actual, away_actual = 1.0, 0.0
            elif home_score < away_score:
                home_actual, away_actual = 0.0, 1.0
            else:
                home_actual, away_actual = 0.5, 0.5
            
            # Update ratings
            ratings[home_id] += ELO_K_FACTOR * (home_actual - home_expected)
            ratings[away_id] += ELO_K_FACTOR * (away_actual - away_expected)
        
        # Cache the ratings
        _elo_ratings_cache[cache_key] = (ratings, datetime.now())
        
        return ratings
    
    async def _get_player_availability_factor(self, fpl_team_id: int) -> float:
        """
        Calculate team strength factor based on player availability.
        Uses FPL API to get injury/suspension status.
        
        Returns a factor between 0.7 and 1.0:
        - 1.0 = all players available
        - Lower values = key players missing
        """
        try:
            bootstrap = await fpl_service.get_bootstrap_static()
            elements = bootstrap.get('elements', [])
            
            # Filter players for this team
            team_players = [p for p in elements if p.get('team') == fpl_team_id]
            
            if not team_players:
                return 1.0
            
            # Weight players by their value (now_cost) and points contribution
            total_weighted_value = 0
            available_weighted_value = 0
            
            for player in team_players:
                # Combine value and total points for importance weighting
                value = player.get('now_cost', 50)  # Price in 0.1m
                points = player.get('total_points', 0)
                minutes = player.get('minutes', 0)
                
                # Calculate importance score
                # Higher value + more points + more minutes = more important
                importance = value + (points * 2) + (minutes / 90)
                
                total_weighted_value += importance
                
                # Check availability status
                # 'a' = available, 'd' = doubtful, 'i' = injured, 's' = suspended, 'u' = unavailable
                status = player.get('status', 'a')
                chance = player.get('chance_of_playing_next_round')
                
                if status == 'a':
                    available_weighted_value += importance
                elif status == 'd':
                    # Doubtful - use chance percentage if available
                    if chance is not None:
                        available_weighted_value += importance * (chance / 100)
                    else:
                        available_weighted_value += importance * 0.5
                elif status in ['i', 's', 'u']:
                    # Injured/suspended/unavailable - 0 contribution
                    pass
                else:
                    # Unknown status - assume available
                    available_weighted_value += importance
            
            if total_weighted_value == 0:
                return 1.0
            
            # Calculate availability factor (minimum 0.7 to avoid extreme adjustments)
            factor = available_weighted_value / total_weighted_value
            return max(0.7, min(1.0, factor))
            
        except Exception as e:
            print(f"[PredictionService] Error calculating availability: {e}")
            return 1.0
    
    def _extract_fpl_team_id(self, fbref_id: Optional[str]) -> Optional[int]:
        """Extract FPL team ID from fbref_id (format: 'fpl_X')"""
        if not fbref_id:
            return None
        if fbref_id.startswith('fpl_'):
            try:
                return int(fbref_id.replace('fpl_', ''))
            except ValueError:
                return None
        return None
    
    def _calculate_expected_goals(
        self,
        home_elo: float,
        away_elo: float,
        home_form: Dict,
        away_form: Dict,
        home_availability: float,
        away_availability: float,
        h2h_matches: List[Dict]
    ) -> Tuple[float, float]:
        """
        Calculate expected goals for each team using multiple factors:
        - Elo rating difference
        - Recent form (goals scored/conceded)
        - Player availability
        - Head-to-head history
        """
        # Base expected goals from league average
        LEAGUE_AVG_GOALS = 1.35  # Average goals per team in PL
        
        # 1. Elo-based adjustment (stronger team expected to score more)
        elo_diff = (home_elo + HOME_ELO_ADVANTAGE) - away_elo
        # Convert Elo difference to goal expectancy adjustment
        # Every 100 Elo points ≈ 0.15 goal difference
        home_elo_adj = elo_diff * 0.0015
        away_elo_adj = -elo_diff * 0.0015
        
        # 2. Form-based expected goals
        home_attack = home_form.get('avg_goals_for', LEAGUE_AVG_GOALS)
        home_defense = home_form.get('avg_goals_against', LEAGUE_AVG_GOALS)
        away_attack = away_form.get('avg_goals_for', LEAGUE_AVG_GOALS)
        away_defense = away_form.get('avg_goals_against', LEAGUE_AVG_GOALS)
        
        # Attack strength vs defense weakness
        home_form_xg = (home_attack / LEAGUE_AVG_GOALS) * (away_defense / LEAGUE_AVG_GOALS) * LEAGUE_AVG_GOALS
        away_form_xg = (away_attack / LEAGUE_AVG_GOALS) * (home_defense / LEAGUE_AVG_GOALS) * LEAGUE_AVG_GOALS
        
        # 3. H2H adjustment (if available)
        h2h_adj_home = 0
        h2h_adj_away = 0
        if h2h_matches:
            h2h_home_avg = sum(m['home_score'] for m in h2h_matches) / len(h2h_matches)
            h2h_away_avg = sum(m['away_score'] for m in h2h_matches) / len(h2h_matches)
            h2h_adj_home = (h2h_home_avg - LEAGUE_AVG_GOALS) * 0.15
            h2h_adj_away = (h2h_away_avg - LEAGUE_AVG_GOALS) * 0.15
        
        # 4. Combine all factors
        # Weights: Form 50%, Elo 30%, H2H 10%, Base 10%
        home_xg = (
            home_form_xg * 0.50 +
            (LEAGUE_AVG_GOALS + home_elo_adj) * 0.30 +
            (LEAGUE_AVG_GOALS + h2h_adj_home) * 0.10 +
            LEAGUE_AVG_GOALS * 0.10
        )
        
        away_xg = (
            away_form_xg * 0.50 +
            (LEAGUE_AVG_GOALS + away_elo_adj) * 0.30 +
            (LEAGUE_AVG_GOALS + h2h_adj_away) * 0.10 +
            LEAGUE_AVG_GOALS * 0.10
        )
        
        # 5. Apply home advantage (+0.25 goals typical in PL)
        home_xg += 0.25
        away_xg -= 0.1
        
        # 6. Apply availability adjustments
        home_xg *= home_availability
        away_xg *= away_availability
        
        # Also adjust defense (missing defenders = more goals conceded)
        away_xg *= (2 - home_availability)  # If home is at 0.8, away gets 1.2x boost
        home_xg *= (2 - away_availability)
        
        # Clamp to reasonable range
        home_xg = max(0.5, min(4.0, home_xg))
        away_xg = max(0.3, min(3.5, away_xg))
        
        return home_xg, away_xg
    
    def _calculate_poisson_probabilities(
        self,
        home_xg: float,
        away_xg: float,
        max_goals: int = 7
    ) -> Dict[Tuple[int, int], float]:
        """
        Calculate probability of each scoreline using Poisson distribution.
        
        Poisson is appropriate for goal scoring as:
        - Goals are independent events
        - Average rate is known (xG)
        - Events occur in fixed interval (90 mins)
        """
        probabilities = {}
        
        for home_goals in range(max_goals):
            for away_goals in range(max_goals):
                # P(X=k) = (λ^k * e^-λ) / k!
                prob = poisson.pmf(home_goals, home_xg) * poisson.pmf(away_goals, away_xg)
                probabilities[(home_goals, away_goals)] = prob
        
        return probabilities
    
    def _calculate_fallback_probabilities(
        self,
        home_xg: float,
        away_xg: float,
        max_goals: int = 7
    ) -> Dict[Tuple[int, int], float]:
        """
        Fallback probability calculation if scipy is not available.
        Uses manual Poisson formula.
        """
        def poisson_pmf(k: int, lambda_val: float) -> float:
            """Calculate Poisson probability mass function"""
            return (lambda_val ** k) * math.exp(-lambda_val) / math.factorial(k)
        
        probabilities = {}
        
        for home_goals in range(max_goals):
            for away_goals in range(max_goals):
                prob = poisson_pmf(home_goals, home_xg) * poisson_pmf(away_goals, away_xg)
                probabilities[(home_goals, away_goals)] = prob
        
        return probabilities
    
    def _get_top_scorelines(
        self,
        score_probs: Dict[Tuple[int, int], float],
        n: int = 6
    ) -> List[Dict[str, Any]]:
        """Get top N most likely scorelines"""
        sorted_scores = sorted(score_probs.items(), key=lambda x: x[1], reverse=True)
        
        return [
            {
                'home': score[0],
                'away': score[1],
                'probability': round(prob * 100, 1)
            }
            for score, prob in sorted_scores[:n]
        ]
    
    def _calculate_confidence_v2(
        self,
        home_form: Dict,
        away_form: Dict,
        h2h_matches: List[Dict],
        home_elo: float,
        away_elo: float,
        home_availability: float,
        away_availability: float
    ) -> int:
        """
        Calculate prediction confidence using multiple factors.
        Returns 0-100 confidence score.
        """
        confidence = 40  # Base confidence
        
        # 1. Data availability (+20 max)
        if home_form.get('matches_played', 0) >= 5:
            confidence += 5
        if away_form.get('matches_played', 0) >= 5:
            confidence += 5
        if h2h_matches:
            confidence += 5
        if home_form.get('matches_played', 0) >= 10:
            confidence += 5
        
        # 2. Form consistency (+15 max)
        home_consistency = abs(home_form.get('wins', 0) - home_form.get('losses', 0))
        away_consistency = abs(away_form.get('wins', 0) - away_form.get('losses', 0))
        if home_consistency >= 3:
            confidence += 5
        if away_consistency >= 3:
            confidence += 5
        if home_consistency >= 5 or away_consistency >= 5:
            confidence += 5
        
        # 3. Elo difference clarity (+10 max)
        elo_diff = abs(home_elo - away_elo)
        if elo_diff >= 50:
            confidence += 3
        if elo_diff >= 100:
            confidence += 4
        if elo_diff >= 150:
            confidence += 3
        
        # 4. Team availability (+10 max)
        if home_availability >= 0.95 and away_availability >= 0.95:
            confidence += 10
        elif home_availability >= 0.85 and away_availability >= 0.85:
            confidence += 5
        
        # 5. Penalty for uncertainty (-10 max)
        if home_availability < 0.8 or away_availability < 0.8:
            confidence -= 5
        if home_form.get('matches_played', 0) < 3 or away_form.get('matches_played', 0) < 3:
            confidence -= 5
        
        return max(20, min(95, confidence))
    
    def _generate_key_factors_v2(
        self,
        home_team: Team,
        away_team: Team,
        home_form: Dict,
        away_form: Dict,
        h2h_matches: List[Dict],
        home_elo: float,
        away_elo: float,
        home_availability: float,
        away_availability: float
    ) -> List[str]:
        """Generate key factors with enhanced information"""
        factors = []
        
        # Elo rating comparison
        elo_diff = home_elo - away_elo
        if elo_diff > 100:
            factors.append(f"{home_team.name} rated {int(elo_diff)} Elo points higher")
        elif elo_diff < -100:
            factors.append(f"{away_team.name} rated {int(-elo_diff)} Elo points higher")
        
        # Form
        home_wins = home_form.get('wins', 0)
        home_losses = home_form.get('losses', 0)
        away_wins = away_form.get('wins', 0)
        away_losses = away_form.get('losses', 0)
        
        if home_wins >= 6:
            factors.append(f"{home_team.name} in excellent form ({home_wins}W from last 10)")
        elif home_losses >= 6:
            factors.append(f"{home_team.name} struggling ({home_losses}L from last 10)")
        
        if away_wins >= 6:
            factors.append(f"{away_team.name} in excellent form ({away_wins}W from last 10)")
        elif away_losses >= 6:
            factors.append(f"{away_team.name} struggling ({away_losses}L from last 10)")
        
        # Goals
        home_avg_for = home_form.get('avg_goals_for', 0)
        away_avg_against = away_form.get('avg_goals_against', 0)
        
        if home_avg_for >= 2.0:
            factors.append(f"{home_team.name} averaging {home_avg_for:.1f} goals at home")
        if away_avg_against >= 2.0:
            factors.append(f"{away_team.name} conceding {away_avg_against:.1f} goals away")
        
        # H2H
        if h2h_matches:
            home_wins_h2h = sum(1 for m in h2h_matches if m['home_score'] > m['away_score'])
            if home_wins_h2h >= len(h2h_matches) * 0.6:
                factors.append(f"{home_team.name} won {home_wins_h2h}/{len(h2h_matches)} recent meetings")
            elif home_wins_h2h <= len(h2h_matches) * 0.2:
                factors.append(f"{away_team.name} dominant in recent meetings")
        
        # Availability
        if home_availability < 0.85:
            factors.append(f"{home_team.name} missing key players ({int((1-home_availability)*100)}% unavailable)")
        if away_availability < 0.85:
            factors.append(f"{away_team.name} missing key players ({int((1-away_availability)*100)}% unavailable)")
        
        # Home advantage
        factors.append(f"Home advantage: +0.25 expected goals for {home_team.name}")
        
        return factors[:6]  # Limit to 6 factors
    
    # ============ Original methods (updated) ============
    
    def predict_goal_scorers(
        self,
        home_team_id: str,
        away_team_id: str,
        season: str,
        match_date: date,
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Predict most likely goal scorers for each team"""
        home_recent_matches = self._get_recent_matches(home_team_id, season, match_date, limit=10)
        away_recent_matches = self._get_recent_matches(away_team_id, season, match_date, limit=10)
        
        home_scorers = self._get_player_scoring_stats(home_team_id, home_recent_matches)
        away_scorers = self._get_player_scoring_stats(away_team_id, away_recent_matches)
        
        home_def_strength = self._get_defensive_strength(home_team_id, season, match_date, is_home=True)
        away_def_strength = self._get_defensive_strength(away_team_id, season, match_date, is_home=False)
        
        for scorer in home_scorers:
            scorer['probability'] = min(100, scorer['probability'] * (1 + (1 - away_def_strength) * 0.2))
        
        for scorer in away_scorers:
            scorer['probability'] = min(100, scorer['probability'] * (1 + (1 - home_def_strength) * 0.2))
        
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
                'avg_goals_for': 1.35,
                'avg_goals_against': 1.35,
                'wins': 0,
                'draws': 0,
                'losses': 0,
                'matches_played': 0,
            }
        
        weighted_goals_for = 0
        weighted_goals_against = 0
        total_weight = 0
        wins = 0
        draws = 0
        losses = 0
        
        for idx, match in enumerate(matches):
            weight = 1.0 - (idx * 0.5 / len(matches)) if len(matches) > 1 else 1.0
            weight = max(0.5, weight)
            
            if match.home_team_id == team_uuid:
                goals_for_val = match.score_home or 0
                goals_against_val = match.score_away or 0
            else:
                goals_for_val = match.score_away or 0
                goals_against_val = match.score_home or 0
            
            weighted_goals_for += goals_for_val * weight
            weighted_goals_against += goals_against_val * weight
            total_weight += weight
            
            if goals_for_val > goals_against_val:
                wins += 1
            elif goals_for_val == goals_against_val:
                draws += 1
            else:
                losses += 1
        
        return {
            'avg_goals_for': weighted_goals_for / total_weight if total_weight > 0 else 1.35,
            'avg_goals_against': weighted_goals_against / total_weight if total_weight > 0 else 1.35,
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
            if match.home_team_id == home_uuid:
                h2h.append({
                    'date': match.match_date.isoformat() if match.match_date else '',
                    'home_score': match.score_home or 0,
                    'away_score': match.score_away or 0,
                })
            else:
                h2h.append({
                    'date': match.match_date.isoformat() if match.match_date else '',
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
        
        query = select(MatchEvent).where(
            and_(
                MatchEvent.match_id.in_(match_ids),
                MatchEvent.event_type == "goal",
                MatchEvent.team_id == team_uuid,
            )
        )
        
        goal_events = self.pl_session.exec(query).all()
        
        player_goals = defaultdict(int)
        player_names = {}
        
        for event in goal_events:
            if event.player_id:
                player_goals[str(event.player_id)] += 1
                player_name = event.details.get('player_name', 'Unknown') if event.details else 'Unknown'
                if player_name != 'Unknown':
                    player_names[str(event.player_id)] = player_name
        
        scorers = []
        for player_id_str, goals in player_goals.items():
            from uuid import UUID
            try:
                player_uuid = UUID(player_id_str)
                player = self.pl_session.get(Player, player_uuid)
            except (ValueError, TypeError):
                player = self.pl_session.get(Player, player_id_str)
            
            if player:
                probability = min(100, (goals / len(recent_matches)) * 100 * 2) if recent_matches else 0
                
                position_boost = 1.0
                if player.position in ['FW', 'FWD', 'ST', 'F']:
                    position_boost = 1.3
                elif player.position in ['MF', 'MID', 'AM', 'CM', 'M']:
                    position_boost = 1.1
                
                probability = min(100, probability * position_boost)
                
                form: str = 'neutral'
                if goals >= 3:
                    form = 'hot'
                elif goals == 0:
                    form = 'cold'
                
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
        avg_conceded = form.get('avg_goals_against', 1.35)
        strength = max(0, min(1, 1 - (avg_conceded / 3)))
        return strength
    
    def get_team_form_data(
        self,
        team_id: str,
        season: str,
        before_date: date,
        is_home: bool,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Get team form data for charts"""
        from uuid import UUID
        team_uuid = UUID(team_id) if isinstance(team_id, str) and len(team_id) == 36 else team_id
        
        matches = self._get_recent_matches(team_id, season, before_date, limit=limit)
        
        form_data = []
        for match in reversed(matches):
            if match.home_team_id == team_uuid:
                opponent_team = self.pl_session.get(Team, match.away_team_id)
                opponent_name = opponent_team.name if opponent_team else "Unknown"
                form_data.append({
                    'match': f"vs {opponent_name}",
                    'goalsFor': match.score_home or 0,
                    'goalsAgainst': match.score_away or 0,
                    'result': 'W' if (match.score_home or 0) > (match.score_away or 0) else ('D' if (match.score_home or 0) == (match.score_away or 0) else 'L'),
                })
            else:
                opponent_team = self.pl_session.get(Team, match.home_team_id)
                opponent_name = opponent_team.name if opponent_team else "Unknown"
                form_data.append({
                    'match': f"@ {opponent_name}",
                    'goalsFor': match.score_away or 0,
                    'goalsAgainst': match.score_home or 0,
                    'result': 'W' if (match.score_away or 0) > (match.score_home or 0) else ('D' if (match.score_away or 0) == (match.score_home or 0) else 'L'),
                })
        
        return form_data
