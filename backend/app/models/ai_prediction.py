"""
AI Prediction Model
Stores AI-generated match predictions for accuracy tracking and analysis
"""
from typing import Optional, Dict, Any
from datetime import datetime, date as date_type, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, JSON, Index
from sqlalchemy import Date


def get_utc_now() -> datetime:
    """Get current UTC datetime"""
    return datetime.now(timezone.utc)


class AIPrediction(SQLModel, table=True):
    """
    Stores AI predictions before matches for accuracy analysis.
    
    This table enables:
    - Tracking prediction accuracy over time
    - Analyzing which factors contribute to accurate predictions
    - A/B testing different model versions
    - Identifying areas for model improvement
    """
    __tablename__ = "ai_predictions"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    
    # Match identification
    fixture_id: int = Field(index=True)  # FPL fixture ID
    match_id: Optional[UUID] = Field(default=None, foreign_key="matches.id", index=True)
    home_team_id: int = Field(index=True)  # FPL team ID
    away_team_id: int = Field(index=True)  # FPL team ID
    home_team_name: Optional[str] = None
    away_team_name: Optional[str] = None
    
    # AI Prediction outputs
    predicted_home_score: int
    predicted_away_score: int
    home_win_probability: Optional[float] = None  # 0-100
    draw_probability: Optional[float] = None  # 0-100
    away_win_probability: Optional[float] = None  # 0-100
    confidence: Optional[int] = None  # 0-100
    
    # Model inputs (stored for analysis)
    home_xg: Optional[float] = None  # Expected goals
    away_xg: Optional[float] = None
    home_elo: Optional[float] = None  # Elo rating at prediction time
    away_elo: Optional[float] = None
    home_availability: Optional[float] = None  # Player availability factor 0-1
    away_availability: Optional[float] = None
    
    # Detailed model inputs as JSON for full analysis
    model_inputs: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    # Contains: home_form, away_form, h2h_data, key_factors, alternative_scores
    
    # Actual results (filled after match finishes)
    actual_home_score: Optional[int] = None
    actual_away_score: Optional[int] = None
    
    # Accuracy metrics (calculated after match)
    is_exact_match: Optional[bool] = None
    is_outcome_correct: Optional[bool] = None
    score_difference: Optional[int] = None  # Absolute diff between predicted and actual total goals
    accuracy_score: Optional[float] = None  # Weighted accuracy score (0-100)
    
    # Metadata
    prediction_timestamp: datetime = Field(default_factory=get_utc_now)
    match_date: date_type = Field(sa_column=Column(Date))
    gameweek: Optional[int] = Field(default=None, index=True)
    season: str = Field(index=True)  # e.g., "2025-2026"
    model_version: str = Field(default="v1.0")  # For A/B testing
    
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)
    
    __table_args__ = (
        Index("idx_ai_pred_season_gw", "season", "gameweek"),
        Index("idx_ai_pred_accuracy", "is_exact_match", "is_outcome_correct"),
        Index("idx_ai_pred_confidence", "confidence"),
        {'extend_existing': True}
    )
    
    def calculate_accuracy(self) -> None:
        """
        Calculate accuracy metrics after actual results are available.
        Call this method after setting actual_home_score and actual_away_score.
        """
        if self.actual_home_score is None or self.actual_away_score is None:
            return
        
        # Exact match
        self.is_exact_match = (
            self.predicted_home_score == self.actual_home_score and
            self.predicted_away_score == self.actual_away_score
        )
        
        # Outcome correct (win/draw/loss)
        predicted_outcome = (
            "home" if self.predicted_home_score > self.predicted_away_score
            else "away" if self.predicted_home_score < self.predicted_away_score
            else "draw"
        )
        actual_outcome = (
            "home" if self.actual_home_score > self.actual_away_score
            else "away" if self.actual_home_score < self.actual_away_score
            else "draw"
        )
        self.is_outcome_correct = predicted_outcome == actual_outcome
        
        # Score difference (how far off the prediction was)
        predicted_total = self.predicted_home_score + self.predicted_away_score
        actual_total = self.actual_home_score + self.actual_away_score
        self.score_difference = abs(predicted_total - actual_total)
        
        # Weighted accuracy score
        # Exact: 100, Outcome correct: 50, Close score (within 1): 25
        if self.is_exact_match:
            self.accuracy_score = 100.0
        elif self.is_outcome_correct:
            # Bonus for being close to exact score
            home_diff = abs(self.predicted_home_score - self.actual_home_score)
            away_diff = abs(self.predicted_away_score - self.actual_away_score)
            if home_diff <= 1 and away_diff <= 1:
                self.accuracy_score = 75.0  # Close but not exact
            else:
                self.accuracy_score = 50.0  # Correct outcome only
        else:
            # Wrong outcome, but maybe close on goals
            if self.score_difference <= 1:
                self.accuracy_score = 25.0
            else:
                self.accuracy_score = 0.0
        
        self.updated_at = get_utc_now()


class AIPredictionAccuracySummary(SQLModel, table=True):
    """
    Aggregated accuracy statistics per season/gameweek.
    Updated periodically by a background job for fast dashboard queries.
    """
    __tablename__ = "ai_prediction_accuracy_summary"
    
    id: int = Field(default=None, primary_key=True)
    
    season: str = Field(index=True)
    gameweek: Optional[int] = Field(default=None, index=True)  # NULL for season totals
    
    # Counts
    total_predictions: int = Field(default=0)
    exact_matches: int = Field(default=0)
    correct_outcomes: int = Field(default=0)
    
    # Percentages
    exact_match_rate: float = Field(default=0.0)  # 0-100
    outcome_accuracy_rate: float = Field(default=0.0)  # 0-100
    overall_accuracy_score: float = Field(default=0.0)  # Weighted average
    
    # Confidence analysis
    high_confidence_accuracy: Optional[float] = None  # Accuracy when confidence >= 80
    medium_confidence_accuracy: Optional[float] = None  # Accuracy when 60 <= confidence < 80
    low_confidence_accuracy: Optional[float] = None  # Accuracy when confidence < 60
    
    # Model performance
    avg_predicted_goals: Optional[float] = None
    avg_actual_goals: Optional[float] = None
    avg_goal_difference: Optional[float] = None  # How far off predictions are
    
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)
    
    __table_args__ = (
        Index("idx_accuracy_summary_season_gw", "season", "gameweek"),
        {'extend_existing': True}
    )
