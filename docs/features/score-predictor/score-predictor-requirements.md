# Score Predictor Feature - Requirements Document
**Date**: 2025-12-21  
**Status**: Planning  
**Priority**: P1  
**Feature**: AI-Powered Score & Goal Scorer Prediction

---

## 🎯 Overview

Build an intelligent score prediction system that analyzes historical match statistics, team form, player performance, and head-to-head records to predict:
1. **Match Scores** (home/away goals)
2. **Goal Scorers** (most likely players to score)
3. **Match Outcome** (win/draw/loss probabilities)
4. **Key Match Events** (cards, substitutions probability)

The system will leverage the extensive match data archive (2015-2026 seasons) to train predictive models and provide accurate forecasts for upcoming fixtures.

---

## 🎯 Objectives

### Primary Goals
1. **Accurate Score Prediction**: Predict final match scores using statistical analysis
2. **Goal Scorer Prediction**: Identify most likely goal scorers for each team
3. **Match Outcome Probability**: Calculate win/draw/loss probabilities
4. **Historical Analysis**: Leverage 10+ seasons of match data for predictions
5. **Form-Based Predictions**: Use recent form, home/away performance, and head-to-head records
6. **Player Performance Analysis**: Analyze individual player scoring patterns and form

### Business Value
- **Enhanced User Engagement**: Users check predictions before matches
- **Competitive Advantage**: Unique feature using historical data analysis
- **Fantasy Football Integration**: Help users make better FPL decisions
- **Premium Feature Potential**: Advanced predictions could be premium feature
- **Data-Driven Insights**: Show users why predictions were made

---

## 👤 User Stories

### As a Fantasy Football Manager

1. **View Match Predictions**
   - As a user, I want to see predicted scores for upcoming fixtures
   - I should see home/away score predictions with confidence levels
   - I should see win/draw/loss probability percentages

2. **See Goal Scorer Predictions**
   - As a user, I want to know which players are most likely to score
   - I should see top 3-5 most likely goal scorers for each team
   - I should see probability percentages for each player

3. **Understand Prediction Reasoning**
   - As a user, I want to understand why certain predictions were made
   - I should see key factors: form, head-to-head, home/away advantage
   - I should see recent performance trends

4. **Compare Predictions with History**
   - As a user, I want to see how accurate past predictions were
   - I should see prediction accuracy metrics
   - I should see which factors were most predictive

5. **Get Predictions for My Team**
   - As a user, I want predictions for my favorite team's matches
   - I should see upcoming fixtures with predictions
   - I should see goal scorer predictions for my team

6. **Use Predictions for FPL Decisions**
   - As a user, I want to use predictions to help with captain/transfer decisions
   - I should see which predicted goal scorers are in my FPL team
   - I should see recommendations based on predictions

---

## 📋 Functional Requirements

### 1. Score Prediction Engine

#### 1.1 Match Score Prediction
- **Input**: Upcoming fixture (home team, away team, date, venue)
- **Output**: 
  - Predicted home score (integer)
  - Predicted away score (integer)
  - Confidence level (0-100%)
  - Most likely scoreline (e.g., "2-1")
  - Alternative scorelines with probabilities

#### 1.2 Prediction Factors
The system must analyze:
- **Team Form** (last 5-10 matches):
  - Goals scored/conceded
  - Win/draw/loss record
  - Clean sheets
  - Average goals per match
- **Home/Away Performance**:
  - Home team's home record
  - Away team's away record
  - Home advantage factor
- **Head-to-Head History**:
  - Historical results between teams
  - Average goals in previous meetings
  - Recent trend (last 3-5 meetings)
- **Team Statistics**:
  - Average possession
  - Shots on target
  - Expected goals (xG) if available
  - Defensive strength
- **Recent Performance**:
  - Goals in last 5 matches
  - Form trend (improving/declining)
  - Injuries/suspensions impact

#### 1.3 Statistical Models
- **Poisson Distribution Model**: For goal prediction (industry standard)
- **Machine Learning Model** (optional Phase 2):
  - Train on historical match data
  - Features: team stats, form, head-to-head, etc.
  - Predict score probabilities
- **Ensemble Approach**: Combine multiple models for better accuracy

### 2. Goal Scorer Prediction

#### 2.1 Player Scoring Probability
- **Input**: Upcoming fixture, team, expected lineup
- **Output**: 
  - List of players with scoring probability
  - Top 3-5 most likely scorers per team
  - Probability percentage for each player
  - Confidence indicators

#### 2.2 Goal Scorer Factors
The system must analyze:
- **Player Scoring History**:
  - Goals this season
  - Goals in last 5-10 matches
  - Goals per 90 minutes
  - Scoring frequency
- **Form**:
  - Recent goals (last 5 matches)
  - Goals in last 10 matches
  - Scoring streak/run
- **Against This Opponent**:
  - Historical goals against this team
  - Performance in previous meetings
- **Home/Away Scoring**:
  - Goals at home vs away
  - Scoring rate by venue
- **Player Position & Role**:
  - Forward vs midfielder vs defender
  - Expected goals (xG) if available
  - Shot frequency
  - Shots on target percentage
- **Team Performance**:
  - Team's recent goal-scoring form
  - Expected team goals
  - Attacking strength
- **Opponent Defense**:
  - Goals conceded by opponent
  - Clean sheets conceded
  - Defensive weakness

#### 2.3 Goal Scorer Algorithm
1. Calculate base scoring probability from historical data
2. Apply form multiplier (recent performance)
3. Apply opponent defense factor
4. Apply home/away factor
5. Apply position/role factor
6. Normalize probabilities to sum to expected team goals

### 3. Match Outcome Prediction

#### 3.1 Win/Draw/Loss Probabilities
- **Home Win Probability**: Percentage chance of home team winning
- **Draw Probability**: Percentage chance of draw
- **Away Win Probability**: Percentage chance of away team winning
- **Most Likely Outcome**: Highlighted result

#### 3.2 Outcome Factors
- Predicted score difference
- Historical head-to-head results
- Team form (recent results)
- Home advantage
- Team strength comparison

### 4. Historical Data Analysis

#### 4.1 Data Sources
- **Match Archive**: All matches from 2015-2026 seasons
- **Match Data Includes**:
  - Final scores
  - Goal scorers and assists
  - Player statistics
  - Team statistics
  - Lineups
  - Events (cards, substitutions)
  - Venue information

#### 4.2 Data Processing
- **Team Performance Aggregation**:
  - Calculate team averages (goals scored/conceded)
  - Home/away splits
  - Form calculations
  - Head-to-head statistics
- **Player Performance Aggregation**:
  - Player scoring rates
  - Goals per match
  - Scoring streaks
  - Performance by opponent
- **Statistical Features**:
  - Rolling averages (last 5, 10 matches)
  - Weighted averages (recent matches weighted more)
  - Trend analysis (improving/declining)

### 5. Prediction Display

#### 5.1 Match Prediction Card
- **Match Information**:
  - Home team vs Away team
  - Date and time
  - Venue
- **Score Prediction**:
  - Large display: "2-1" (predicted)
  - Confidence percentage
  - Alternative scores with probabilities
- **Outcome Probabilities**:
  - Home Win: 45%
  - Draw: 25%
  - Away Win: 30%
- **Key Factors**:
  - Bullet points showing main reasons
  - Form indicators
  - Head-to-head summary

#### 5.2 Goal Scorer Predictions
- **Home Team Scorers**:
  - Top 3-5 players with probabilities
  - Player photo/name
  - Probability percentage
  - Recent form indicator
- **Away Team Scorers**:
  - Same format as home team
- **Visual Indicators**:
  - Probability bars
  - Form badges (hot/cold)
  - Position icons

#### 5.3 Prediction Details View
- **Full Analysis**:
  - Detailed breakdown of factors
  - Team form charts
  - Head-to-head history
  - Recent match results
  - Statistical comparison
- **Confidence Breakdown**:
  - Why prediction confidence is high/low
  - Key uncertainties
  - Factors that could change prediction

### 6. Prediction Accuracy Tracking

#### 6.1 Accuracy Metrics
- **Score Prediction Accuracy**:
  - Exact score correct %
  - Correct outcome (win/draw/loss) %
  - Goals difference accuracy
- **Goal Scorer Accuracy**:
  - Top scorer correctly predicted %
  - Any predicted scorer scored %
  - Average probability of actual scorers
- **Model Performance**:
  - Track accuracy over time
  - Identify best/worst performing factors
  - Model improvement metrics

#### 6.2 Historical Accuracy Display
- Show users prediction accuracy
- Display "Last 10 predictions" accuracy
- Show which predictions were most/least accurate
- Explain why predictions were wrong

### 7. Integration Points

#### 7.1 FPL Integration
- **Player Recommendations**:
  - Highlight predicted goal scorers in FPL team
  - Suggest captain based on predictions
  - Transfer recommendations based on upcoming fixtures
- **Fixture Difficulty**:
  - Use predictions to adjust FDR (Fixture Difficulty Rating)
  - Show predicted goals for/against

#### 7.2 Dashboard Integration
- **Upcoming Fixtures Widget**:
  - Show next 5-10 fixtures with predictions
  - Quick access to predictions
- **Favorite Team Predictions**:
  - Dedicated section for user's favorite team
  - Upcoming matches with predictions

#### 7.3 Match Details Integration
- Show predictions in match detail views
- Compare predictions with actual results (after match)
- Show prediction accuracy for completed matches

---

## 🔒 Technical Requirements

### Backend

#### Database Schema

```python
class MatchPrediction(SQLModel, table=True):
    __tablename__ = "match_predictions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    fixture_id: Optional[int] = Field(index=True)  # FPL fixture ID
    home_team_id: int = Field(index=True)
    away_team_id: int = Field(index=True)
    match_date: datetime = Field(index=True)
    
    # Score predictions
    predicted_home_score: int
    predicted_away_score: int
    confidence_score: float  # 0-100
    
    # Outcome probabilities
    home_win_probability: float  # 0-100
    draw_probability: float  # 0-100
    away_win_probability: float  # 0-100
    
    # Prediction factors (stored as JSON)
    prediction_factors: Dict[str, Any]  # Form, H2H, etc.
    
    # Actual result (filled after match)
    actual_home_score: Optional[int] = None
    actual_away_score: Optional[int] = None
    prediction_accuracy: Optional[float] = None  # Calculated after match
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class GoalScorerPrediction(SQLModel, table=True):
    __tablename__ = "goal_scorer_predictions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    match_prediction_id: int = Field(foreign_key="match_predictions.id", index=True)
    player_id: int = Field(index=True)  # FPL player ID or fbref ID
    player_name: str
    team_id: int  # home or away
    is_home: bool
    
    # Prediction
    scoring_probability: float  # 0-100
    rank: int  # Rank among predicted scorers (1 = most likely)
    
    # Actual result (filled after match)
    actually_scored: Optional[bool] = None
    goals_scored: Optional[int] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PredictionAccuracy(SQLModel, table=True):
    __tablename__ = "prediction_accuracy"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    match_prediction_id: int = Field(foreign_key="match_predictions.id", index=True)
    
    # Accuracy metrics
    score_exact_match: bool  # Exact score correct
    outcome_correct: bool  # Win/draw/loss correct
    goals_difference_error: int  # Actual difference - predicted difference
    
    # Goal scorer accuracy
    top_scorer_correct: bool
    any_predicted_scorer_scored: bool
    actual_scorers_in_prediction: int  # How many actual scorers were predicted
    
    calculated_at: datetime = Field(default_factory=datetime.utcnow)
```

#### API Endpoints

1. **Get Predictions for Fixtures**
   - `GET /api/predictions/fixtures`
   - Query params: `gameweek`, `team_id`, `date_from`, `date_to`
   - Response: List of match predictions with goal scorer predictions

2. **Get Prediction for Single Match**
   - `GET /api/predictions/match/{fixture_id}`
   - Response: Full prediction with detailed analysis

3. **Generate Prediction**
   - `POST /api/predictions/generate`
   - Body: `{ "fixture_id": int, "home_team_id": int, "away_team_id": int, "match_date": datetime }`
   - Response: Generated prediction

4. **Get Prediction Accuracy**
   - `GET /api/predictions/accuracy`
   - Query params: `limit`, `team_id`
   - Response: Historical accuracy metrics

5. **Get Goal Scorer Predictions**
   - `GET /api/predictions/goal-scorers/{fixture_id}`
   - Response: List of predicted goal scorers with probabilities

#### Prediction Service

```python
class ScorePredictionService:
    """Service for generating match score predictions"""
    
    def __init__(self):
        self.match_data_service = MatchDataService()
        self.team_stats_service = TeamStatsService()
        self.player_stats_service = PlayerStatsService()
    
    async def predict_match_score(
        self, 
        home_team_id: int, 
        away_team_id: int, 
        match_date: datetime
    ) -> MatchPrediction:
        """Generate score prediction for a match"""
        # 1. Get team form (last 5-10 matches)
        # 2. Get head-to-head history
        # 3. Get home/away performance
        # 4. Calculate expected goals using Poisson model
        # 5. Generate prediction with confidence
        pass
    
    async def predict_goal_scorers(
        self,
        team_id: int,
        opponent_id: int,
        is_home: bool,
        match_date: datetime
    ) -> List[GoalScorerPrediction]:
        """Predict most likely goal scorers"""
        # 1. Get expected team goals
        # 2. Get player scoring history
        # 3. Get player form
        # 4. Calculate scoring probabilities
        # 5. Rank players by probability
        pass
    
    def _calculate_expected_goals(
        self,
        team_id: int,
        opponent_id: int,
        is_home: bool
    ) -> float:
        """Calculate expected goals using Poisson distribution"""
        # Use team's average goals scored and opponent's average goals conceded
        # Apply home/away factors
        # Apply form multipliers
        pass
    
    def _get_team_form(self, team_id: int, matches: int = 5) -> Dict:
        """Get team's recent form"""
        pass
    
    def _get_head_to_head(self, team1_id: int, team2_id: int) -> Dict:
        """Get head-to-head statistics"""
        pass
```

#### Data Processing Service

```python
class MatchDataService:
    """Service for processing historical match data"""
    
    async def load_match_data(self, season: str) -> List[Dict]:
        """Load all matches for a season from JSON files"""
        pass
    
    async def aggregate_team_stats(self, team_id: int) -> Dict:
        """Calculate aggregated team statistics"""
        pass
    
    async def aggregate_player_stats(self, player_id: int) -> Dict:
        """Calculate aggregated player statistics"""
        pass
    
    async def get_team_form(self, team_id: int, last_n: int = 5) -> List[Dict]:
        """Get team's last N matches with results"""
        pass
    
    async def get_head_to_head(
        self, 
        team1_id: int, 
        team2_id: int
    ) -> List[Dict]:
        """Get all historical matches between two teams"""
        pass
```

### Frontend

#### Components

1. **MatchPredictionCard Component**
   - Displays predicted score and outcome probabilities
   - Shows key factors
   - Links to detailed view

2. **GoalScorerPredictions Component**
   - Lists predicted goal scorers with probabilities
   - Visual probability indicators
   - Player photos and form badges

3. **PredictionDetailsModal Component**
   - Full analysis breakdown
   - Team form charts
   - Head-to-head history
   - Statistical comparison

4. **PredictionAccuracyWidget Component**
   - Shows prediction accuracy metrics
   - Historical accuracy chart
   - Recent predictions accuracy

5. **FixturesWithPredictions Component**
   - List of upcoming fixtures with predictions
   - Quick view of predictions
   - Filter by team/gameweek

#### API Integration
- Add methods to `api.ts`:
  - `getMatchPredictions(filters)`
  - `getMatchPrediction(fixtureId)`
  - `getGoalScorerPredictions(fixtureId)`
  - `getPredictionAccuracy()`

---

## 📊 Data Requirements

### Historical Match Data
- **Available Data**: 2015-2016 through 2025-2026 seasons
- **Data Per Match**:
  - Final score
  - Goal scorers and assists
  - Player statistics (goals, assists, shots, passes, etc.)
  - Team statistics (possession, shots, passes, etc.)
  - Lineups
  - Venue information
  - Date and referee

### Team Data Needed
- Team ID mapping (FPL IDs, fbref IDs, team names)
- Historical team performance
- Home/away performance splits
- Form calculations
- Head-to-head records

### Player Data Needed
- Player ID mapping (FPL IDs, fbref IDs)
- Historical scoring records
- Goals per match statistics
- Form calculations
- Position and role information

### FPL Data Integration
- Current season player data (form, goals, assists)
- Fixture information
- Team information
- Player availability (injuries, suspensions)

---

## 🧮 Prediction Algorithms

### 1. Score Prediction: Poisson Model

**Basic Poisson Model**:
```
Expected Goals (Home) = (Home Team Avg Goals Scored) × (Home Factor) × (Form Multiplier)
Expected Goals (Away) = (Away Team Avg Goals Scored) × (Away Factor) × (Form Multiplier) × (Opponent Defense Factor)
```

**Probability Calculation**:
```
P(Home = h, Away = a) = Poisson(h, λ_home) × Poisson(a, λ_away)
```

**Factors**:
- Home advantage: ~1.2x multiplier for home team
- Form multiplier: Based on recent 5 matches (0.8x to 1.3x)
- Opponent defense: Based on goals conceded average
- Head-to-head: Adjust based on historical results

### 2. Goal Scorer Prediction

**Base Probability**:
```
P(Player Scores) = (Player Goals per 90) × (Expected Team Goals) / (Team Avg Goals per 90)
```

**Multipliers**:
- Form multiplier: Recent goals / average goals
- Opponent defense: Opponent goals conceded / league average
- Home/away: Player's home/away scoring rate
- Position: Forward (1.5x), Midfielder (0.8x), Defender (0.3x)

**Normalization**:
- Sum of all player probabilities ≈ Expected team goals
- Rank players by probability
- Top 3-5 shown to users

### 3. Outcome Probability

**From Score Prediction**:
```
P(Home Win) = Sum of all score probabilities where home > away
P(Draw) = Sum of all score probabilities where home = away
P(Away Win) = Sum of all score probabilities where home < away
```

---

## ✅ Acceptance Criteria

### Score Prediction
- ✅ Predictions generated for all upcoming fixtures
- ✅ Confidence scores calculated and displayed
- ✅ Alternative scorelines shown with probabilities
- ✅ Outcome probabilities (win/draw/loss) calculated correctly
- ✅ Predictions use historical data (at least 2 seasons)
- ✅ Home/away factors applied correctly
- ✅ Form calculations accurate

### Goal Scorer Prediction
- ✅ Top 3-5 goal scorers predicted for each team
- ✅ Probabilities calculated and displayed
- ✅ Players ranked by likelihood
- ✅ Form and history factors applied
- ✅ Position/role considered in predictions

### Data Processing
- ✅ Historical match data loaded and processed
- ✅ Team statistics aggregated correctly
- ✅ Player statistics aggregated correctly
- ✅ Head-to-head records calculated
- ✅ Form calculations accurate

### Accuracy Tracking
- ✅ Prediction accuracy calculated after matches
- ✅ Accuracy metrics displayed to users
- ✅ Historical accuracy tracked over time
- ✅ Model performance monitored

### User Experience
- ✅ Predictions displayed clearly and intuitively
- ✅ Key factors explained to users
- ✅ Predictions accessible from fixtures list
- ✅ Detailed analysis available on demand
- ✅ Mobile-responsive design

---

## 🚀 Implementation Phases

### Phase 1: MVP - Basic Score Prediction
- Load and process historical match data
- Implement basic Poisson model for score prediction
- Calculate outcome probabilities
- Display predictions for upcoming fixtures
- Basic accuracy tracking

### Phase 2: Goal Scorer Prediction
- Implement goal scorer prediction algorithm
- Calculate player scoring probabilities
- Display top predicted scorers
- Integrate with FPL player data

### Phase 3: Enhanced Features
- Machine learning model (optional)
- Advanced form calculations
- Detailed prediction analysis
- Prediction accuracy dashboard
- User-facing accuracy metrics

### Phase 4: Advanced Analytics
- Prediction confidence breakdown
- Factor importance analysis
- Model comparison and selection
- Real-time prediction updates
- Historical prediction archive

---

## 📝 Notes

- **Data Quality**: Ensure match data is complete and accurate
- **Team ID Mapping**: Need consistent team ID mapping across seasons
- **Player ID Mapping**: Need consistent player ID mapping (FPL ↔ fbref)
- **Performance**: Prediction generation should be fast (< 2 seconds)
- **Caching**: Cache predictions and aggregated statistics
- **Updates**: Regenerate predictions when new match data available
- **Confidence**: Be transparent about prediction confidence
- **Disclaimers**: Include disclaimers that predictions are estimates

---

## 🎯 Success Metrics

### Prediction Accuracy
- Score prediction accuracy (exact match %)
- Outcome prediction accuracy (win/draw/loss %)
- Goal scorer prediction accuracy (top scorer correct %)
- Average goals difference error

### User Engagement
- % of users viewing predictions
- Predictions viewed per user
- Time spent on prediction pages
- Predictions shared/saved

### Business Metrics
- Feature adoption rate
- User retention for prediction users
- Premium conversion (if premium feature)

---

## 📚 Related Features

- Weekly Picks (can use predictions)
- FPL Team Management
- Match Details
- Dashboard
- Follow Players

---

**Document Status**: ✅ Requirements Complete  
**Next**: Create UI Designer handoff document
