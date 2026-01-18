# AI Prediction Accuracy Analysis

## Executive Summary

This document analyzes the current AI prediction system and provides recommendations for improving accuracy. The key finding is that **AI predictions are NOT currently stored in the database**, which prevents systematic accuracy analysis and model improvement.

## Current State Analysis

### What IS Stored in the Database

1. **User Score Predictions** (`score_predictions` table):
   - `predicted_home_score`, `predicted_away_score` - User's prediction
   - `actual_home_score`, `actual_away_score` - Actual result after match
   - `points` - Points awarded based on accuracy
   - `breakdown` - JSON breakdown of scoring (exact score, correct result, etc.)

2. **Match Data** (`matches` table in PL database):
   - Historical match results
   - Team statistics
   - Match events (goals, cards, etc.)

### What is NOT Stored

**AI Predictions are calculated on-demand** and only cached in memory for 1 hour. This means:
- ❌ No historical record of what the AI predicted before matches
- ❌ No ability to track accuracy over time
- ❌ No data for model comparison/improvement
- ❌ Cannot analyze which factors led to good/bad predictions

### Current AI Prediction Algorithm

The `PredictionService` uses these factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Team Form | 50% | Goals scored/conceded in last 10 matches |
| Elo Ratings | 30% | Dynamic ratings updated after each match |
| Head-to-Head | 10% | Historical results between the two teams |
| Base Rate | 10% | League average goals (1.35 per team) |

Additional adjustments:
- **Home Advantage**: +0.25 xG for home team
- **Player Availability**: FPL API injury/suspension data
- **Poisson Distribution**: Convert xG to scoreline probabilities

## Accuracy Analysis (Current Method)

The `/predictions/accuracy` endpoint calculates accuracy by regenerating predictions for finished matches. From the code:

```python
# Accuracy Types:
- Exact Score: Predicted score == Actual score
- Correct Outcome: Predicted W/D/L == Actual W/D/L
- Wrong: Neither exact nor correct outcome

# Overall Accuracy Formula:
- Exact scores: 100 points each
- Correct outcome (wrong score): 50 points each
- Wrong outcome: 0 points
overall_accuracy = (total_points / (total * 100)) * 100
```

### Limitations of Current Approach

1. **Hindsight Bias**: Re-calculating predictions uses data that may have changed
2. **No Time-Stamped Data**: Can't verify what was predicted before the match
3. **Memory-Only Cache**: Predictions lost after 1 hour or server restart
4. **No Factor Attribution**: Can't identify which factors contributed to accuracy

## Recommendations for Improvement

### 1. Store AI Predictions (CRITICAL)

Create a new table to store predictions before matches:

```sql
CREATE TABLE ai_predictions (
    id UUID PRIMARY KEY,
    fixture_id INT NOT NULL,           -- FPL fixture ID
    match_id UUID,                      -- Reference to matches table
    home_team_id INT NOT NULL,
    away_team_id INT NOT NULL,
    
    -- Prediction outputs
    predicted_home_score INT NOT NULL,
    predicted_away_score INT NOT NULL,
    home_win_probability DECIMAL(5,2),
    draw_probability DECIMAL(5,2),
    away_win_probability DECIMAL(5,2),
    confidence INT,
    
    -- Model inputs (for analysis)
    home_xg DECIMAL(4,2),
    away_xg DECIMAL(4,2),
    home_elo DECIMAL(8,2),
    away_elo DECIMAL(8,2),
    home_form_json JSONB,
    away_form_json JSONB,
    h2h_data JSONB,
    
    -- Actual results (filled after match)
    actual_home_score INT,
    actual_away_score INT,
    is_exact_match BOOLEAN,
    is_outcome_correct BOOLEAN,
    
    -- Metadata
    prediction_timestamp TIMESTAMP NOT NULL,
    match_date DATE NOT NULL,
    gameweek INT,
    season VARCHAR(20),
    model_version VARCHAR(50) DEFAULT 'v1',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_predictions_fixture ON ai_predictions(fixture_id);
CREATE INDEX idx_ai_predictions_season ON ai_predictions(season, gameweek);
CREATE INDEX idx_ai_predictions_outcome ON ai_predictions(is_exact_match, is_outcome_correct);
```

### 2. Improve Model Accuracy

Based on football analytics research, consider adding:

#### A. xG (Expected Goals) Data
- Current: Estimated from historical goals
- Improvement: Use actual xG data from stats providers

#### B. Team Strength Indicators
- Shots on target ratio
- Possession statistics
- Pass completion rates

#### C. Player Impact
- Key player absence weighting (especially strikers/playmakers)
- Manager impact (new manager bounce)

#### D. Contextual Factors
- Fixture congestion (matches in last 7 days)
- European competition fatigue
- Derby/rivalry boost
- Late-season motivation (relegation, title race)

### 3. Algorithm Improvements

#### Current Weights (review recommended):
```
Form: 50% → Consider reducing to 40%
Elo: 30% → Consider increasing to 35%
H2H: 10% → Consider reducing to 5% (small sample size)
Base: 10% → Consider increasing to 15%
Recency: Add decay factor (more recent matches weighted higher)
```

#### Suggested New Model:
```python
home_xg = (
    form_factor * 0.35 +          # Recent form (last 5-10 matches)
    elo_factor * 0.35 +            # Long-term team strength
    context_factor * 0.15 +        # Fixture context (home/away, fatigue)
    player_availability * 0.10 +   # Key player status
    base_rate * 0.05               # League baseline
)
```

### 4. Accuracy Tracking Dashboard

Create analytics endpoints:

```
GET /admin/predictions/accuracy
- Overall accuracy rate
- Accuracy by confidence level
- Accuracy by team
- Accuracy by gameweek

GET /admin/predictions/analysis
- Which factors correlate with accuracy
- Model performance over time
- Comparison with bookmaker odds (if available)
```

### 5. A/B Testing Framework

Enable model experimentation:
- Store model version with each prediction
- Compare accuracy across versions
- Gradually roll out improvements

## Implementation Priority

| Priority | Task | Impact |
|----------|------|--------|
| 🔴 HIGH | Store AI predictions in database | Enables all analysis |
| 🔴 HIGH | Create accuracy tracking API | Measure improvement |
| 🟡 MEDIUM | Add contextual factors | Improve accuracy |
| 🟡 MEDIUM | Tune model weights | Improve accuracy |
| 🟢 LOW | A/B testing framework | Enable experimentation |

## Sample Accuracy Queries (After Implementation)

```sql
-- Overall accuracy by season
SELECT 
    season,
    COUNT(*) as total_predictions,
    SUM(CASE WHEN is_exact_match THEN 1 ELSE 0 END) as exact_matches,
    SUM(CASE WHEN is_outcome_correct THEN 1 ELSE 0 END) as correct_outcomes,
    ROUND(AVG(CASE WHEN is_exact_match THEN 100.0 
              WHEN is_outcome_correct THEN 50.0 
              ELSE 0 END), 2) as accuracy_score
FROM ai_predictions 
WHERE actual_home_score IS NOT NULL
GROUP BY season;

-- Accuracy by confidence level
SELECT 
    CASE 
        WHEN confidence >= 80 THEN 'High (80+)'
        WHEN confidence >= 60 THEN 'Medium (60-79)'
        ELSE 'Low (<60)'
    END as confidence_band,
    COUNT(*) as predictions,
    ROUND(AVG(CASE WHEN is_outcome_correct THEN 100.0 ELSE 0 END), 2) as outcome_accuracy
FROM ai_predictions 
WHERE actual_home_score IS NOT NULL
GROUP BY confidence_band;

-- Factor correlation analysis
SELECT 
    CASE WHEN ABS(home_elo - away_elo) > 100 THEN 'Large Elo Gap' ELSE 'Close Elo' END as elo_gap,
    ROUND(AVG(CASE WHEN is_outcome_correct THEN 100.0 ELSE 0 END), 2) as accuracy
FROM ai_predictions 
WHERE actual_home_score IS NOT NULL
GROUP BY elo_gap;
```

## Next Steps

1. **Immediate**: Create `ai_predictions` table and model
2. **Immediate**: Modify prediction endpoint to store predictions
3. **Short-term**: Create background job to update actual results
4. **Short-term**: Build accuracy analytics API
5. **Medium-term**: Add contextual factors to model
6. **Long-term**: Implement A/B testing and model comparison

---

*Document created: January 2026*
*Author: AI Developer Agent*
