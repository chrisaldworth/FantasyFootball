# Score Predictor - Design Specifications

**Date**: 2025-12-21  
**Designer**: UI Designer Agent  
**Status**: ✅ Design Complete  
**Priority**: P1 (Score Predictor - AI-Powered Match Predictions)  
**For**: Developer Agent

---

## Overview

Complete design specifications for the Score Predictor feature. This document provides detailed layouts, component specs, data visualization designs, and implementation guidance for all 5 components.

**Reference Documents**:
- Requirements: `score-predictor-requirements.md`
- Handoff: `score-predictor-handoff-ui-designer.md`
- Current Implementation: Match fixtures and details exist, predictions are new

---

## Design Answers

### 1. Score Display
**Answer**: **Large scoreline format (e.g., "2-1")** - Most prominent element, 48-64px font size, centered. Shows "Predicted: 2-1" label above. Alternative scores shown below in smaller text.

### 2. Probability Visualization
**Answer**: **Horizontal bars with percentages** - Progress bars showing probability (0-100%), color-coded (green = high, yellow = medium, red = low). Percentage text on right side of bar.

### 3. Confidence Indicator
**Answer**: **Badge + color border** - Confidence badge (High/Medium/Low) with color-coded border around card. High = green border, Medium = yellow, Low = gray/red.

### 4. Goal Scorer Layout
**Answer**: **Vertical list with horizontal probability bars** - Each player in a row with photo, name, position badge, probability bar, and percentage. Top 3-5 players per team, ranked 1-5.

### 5. Form Visualization
**Answer**: **Mini line chart + trend arrows** - Small sparkline chart showing last 5 matches form, plus trend arrow (↑ improving, ↓ declining, → stable).

### 6. Color Coding
**Answer**: **Gradient scale for confidence/probability**:
- High confidence (70-100%): Green (`#10b981`)
- Medium confidence (40-69%): Yellow/Orange (`#f59e0b`)
- Low confidence (0-39%): Red/Gray (`#ef4444`)

### 7. Data Density
**Answer**: **Progressive disclosure** - Card shows: score, outcome probabilities, confidence, 2-3 key factors. Full details in modal with charts, H2H, stats.

### 8. Comparison Views
**Answer**: **Side-by-side bars** - Team stats compared using horizontal bars (home team left, away team right). Color-coded by team colors.

### 9. Accuracy Display
**Answer**: **Before/After comparison** - Show predicted score vs actual score side-by-side. Green checkmark if exact match, yellow if outcome correct, red if wrong. Accuracy percentage badge.

### 10. Mobile Optimization
**Answer**: **Stacked layout, simplified cards** - Single column, stacked information, bottom sheet for details. Simplified probability bars, smaller fonts, touch-friendly.

---

## Component 1: MatchPredictionCard

### Props
```typescript
interface MatchPredictionCardProps {
  fixture: {
    id: number;
    homeTeam: { id: number; name: string; logo?: string };
    awayTeam: { id: number; name: string; logo?: string };
    date: string;
    venue?: string;
  };
  prediction: {
    predictedHomeScore: number;
    predictedAwayScore: number;
    confidence: number; // 0-100
    homeWinProbability: number;
    drawProbability: number;
    awayWinProbability: number;
    keyFactors: string[];
    alternativeScores?: Array<{ home: number; away: number; probability: number }>;
  };
  actualResult?: {
    homeScore: number;
    awayScore: number;
  };
  onViewDetails: () => void;
}
```

### Design
```
┌─────────────────────────────────────────────┐
│ [High Confidence]  Sat 15:00  [Venue]      │
├─────────────────────────────────────────────┤
│                                              │
│         Arsenal vs Liverpool                │
│                                              │
│            Predicted: 2-1                   │
│                                              │
│  Home Win: [████████░░] 45%                 │
│  Draw:     [█████░░░░░] 25%                 │
│  Away Win: [██████░░░░] 30%                 │
│                                              │
│  Key Factors:                                │
│  • Arsenal strong home form (W4, D1)         │
│  • Liverpool poor away record (L2, D1)       │
│  • H2H: Arsenal won last 2 at home          │
│                                              │
│              [View Details]                  │
└─────────────────────────────────────────────┘
```

### States

1. **Upcoming Match** (Default):
   - Shows predicted score prominently
   - Confidence badge at top
   - Outcome probabilities with bars
   - Key factors listed
   - "View Details" button

2. **Completed Match** (With Result):
   - Shows predicted vs actual side-by-side
   - Accuracy indicator (✓/✗)
   - Actual score highlighted
   - Prediction accuracy percentage

3. **High Confidence** (70%+):
   - Green border (`border-[var(--pl-green)]`)
   - "High Confidence" badge (green)
   - Bold predicted score

4. **Medium Confidence** (40-69%):
   - Yellow border (`border-yellow-500`)
   - "Medium Confidence" badge (yellow)
   - Standard styling

5. **Low Confidence** (<40%):
   - Gray/red border (`border-gray-500`)
   - "Low Confidence" badge (gray)
   - Muted colors

### Visual Specifications
- **Card**: Glass morphism, rounded-xl, padding: 16px
- **Predicted Score**: 48px font, bold, centered
- **Team Names**: 18px, bold
- **Probability Bars**: Height 8px, rounded, color-coded
- **Confidence Badge**: Top-right, 12px text, rounded-full
- **Hover**: Scale 1.02, shadow increase

---

## Component 2: GoalScorerPredictions

### Props
```typescript
interface GoalScorerPredictionsProps {
  homeTeamScorers: Array<{
    playerId: number;
    playerName: string;
    photo?: string;
    position: string;
    probability: number; // 0-100
    form: number; // Last 5 matches average
    trend: 'up' | 'down' | 'stable';
  }>;
  awayTeamScorers: Array<{
    // Same structure
  }>;
  homeTeamName: string;
  awayTeamName: string;
}
```

### Design
```
┌─────────────────────────────────────────────┐
│ Most Likely Goal Scorers                    │
├─────────────────────────────────────────────┤
│ Arsenal                    Liverpool        │
│ ┌──────────┐              ┌──────────┐     │
│ │ [Photo]  │              │ [Photo]  │     │
│ │ Saka     │              │ Salah    │     │
│ │ MID      │              │ FWD      │     │
│ │ [████] 45%│             │ [███] 38%│     │
│ │ ↑ Hot    │              │ ↑ Hot    │     │
│ └──────────┘              └──────────┘     │
│ ┌──────────┐              ┌──────────┐     │
│ │ Odegaard │              │ Nunez    │     │
│ │ [███] 32%│             │ [██] 25%│     │
│ └──────────┘              └──────────┘     │
└─────────────────────────────────────────────┘
```

### Layout
- **Two columns**: Home team (left), Away team (right)
- **Each player row**:
  - Player photo (circular, 40px)
  - Player name (bold)
  - Position badge (GK/DEF/MID/FWD)
  - Probability bar (horizontal, color-coded)
  - Probability percentage
  - Form indicator (🔥 Hot, ❄️ Cold, or trend arrow)

### Visual Specifications
- **Player Photo**: 40x40px, circular, border
- **Probability Bar**: Height 6px, rounded, gradient fill
- **Form Badge**: Small badge with emoji or arrow
- **Ranking**: Subtle number (1, 2, 3) or visual hierarchy

---

## Component 3: PredictionDetailsModal

### Props
```typescript
interface PredictionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixture: Fixture;
  prediction: MatchPrediction;
  teamForm: {
    home: Array<{ date: string; goalsFor: number; goalsAgainst: number; result: string }>;
    away: Array<{ date: string; goalsFor: number; goalsAgainst: number; result: string }>;
  };
  headToHead: Array<{ date: string; homeScore: number; awayScore: number; result: string }>;
  statistics: {
    home: { avgGoals: number; avgConceded: number; form: number };
    away: { avgGoals: number; avgConceded: number; form: number };
  };
}
```

### Layout (Tabs)

**Tab 1: Summary**
- Predicted score (large)
- Outcome probabilities
- Confidence breakdown
- Key factors (detailed)

**Tab 2: Team Form**
- Line charts: Goals scored/conceded (last 5-10 matches)
- Win/Draw/Loss record
- Form trend indicators

**Tab 3: Head-to-Head**
- Timeline of previous meetings
- Results table
- Average goals in H2H matches
- Recent trend

**Tab 4: Statistics**
- Side-by-side comparison bars:
  - Avg goals scored
  - Avg goals conceded
  - Form rating
  - Home/away performance
- Team strengths/weaknesses

**Tab 5: Goal Scorers**
- Full goal scorer predictions
- Detailed probabilities
- Player form charts
- Historical scoring vs opponent

### Visual Specifications
- **Modal**: Full-screen on mobile, centered on desktop
- **Tabs**: Horizontal tabs, active tab highlighted
- **Charts**: Line charts for form, bar charts for comparisons
- **Tables**: Clean, readable, alternating row colors

---

## Component 4: PredictionAccuracyWidget

### Props
```typescript
interface PredictionAccuracyWidgetProps {
  accuracy: {
    overallAccuracy: number; // 0-100
    scoreExactMatch: number; // 0-100
    outcomeCorrect: number; // 0-100
    goalScorerAccuracy: number; // 0-100
  };
  recentPredictions: Array<{
    fixture: string;
    predicted: string;
    actual: string;
    correct: boolean;
    accuracy: number;
  }>;
  accuracyTrend: Array<{ date: string; accuracy: number }>; // Last 10 predictions
}
```

### Design
```
┌─────────────────────────────────────────────┐
│ Prediction Accuracy                         │
├─────────────────────────────────────────────┤
│ Overall: [████████] 72%                    │
│ Score Exact: [█████] 45%                    │
│ Outcome: [█████████] 85%                    │
│ Scorers: [██████] 60%                       │
│                                              │
│ [Accuracy Trend Chart - Line Chart]         │
│                                              │
│ Recent Predictions:                         │
│ ✓ Arsenal 2-1 (Predicted: 2-1) 100%        │
│ ✗ Liverpool 1-0 (Predicted: 2-1) 50%        │
│ ✓ Man City 3-0 (Predicted: 3-0) 100%       │
└─────────────────────────────────────────────┘
```

### Visual Specifications
- **Accuracy Bars**: Horizontal progress bars, color-coded
- **Trend Chart**: Line chart showing accuracy over time
- **Recent List**: Compact list with ✓/✗ indicators
- **Color Coding**: Green (good), Yellow (ok), Red (poor)

---

## Component 5: FixturesWithPredictions

### Props
```typescript
interface FixturesWithPredictionsProps {
  fixtures: Array<{
    fixture: Fixture;
    prediction: MatchPrediction;
  }>;
  filters: {
    teamId?: number;
    gameweek?: number;
    dateFrom?: string;
    dateTo?: string;
  };
  onFilterChange: (filters: Filters) => void;
}
```

### Layout
- **Header**: Title, filter dropdowns, sort options
- **Grid**: 2-3 columns (desktop), 1 column (mobile)
- **Each card**: MatchPredictionCard (compact version)
- **Empty state**: "No predictions available"

### Filters
- Team dropdown
- Gameweek dropdown
- Date range picker
- Sort: Date, Confidence, Team

---

## Data Visualization Specifications

### Probability Bars
- **Type**: Horizontal progress bar
- **Height**: 8px (default), 6px (compact)
- **Colors**: Gradient from low to high
  - 0-39%: Red (`#ef4444`)
  - 40-69%: Yellow (`#f59e0b`)
  - 70-100%: Green (`#10b981`)
- **Animation**: Smooth fill on load
- **Text**: Percentage on right side

### Form Charts
- **Type**: Mini line chart (sparkline)
- **Data**: Last 5-10 matches
- **Y-axis**: Goals scored/conceded
- **X-axis**: Match number
- **Colors**: Team colors
- **Trend**: Arrow indicator (↑↓→)

### Comparison Bars
- **Type**: Side-by-side horizontal bars
- **Layout**: Home team (left), Away team (right)
- **Colors**: Team primary colors
- **Labels**: Stat name, value
- **Height**: 12px per bar

### Accuracy Trend Chart
- **Type**: Line chart
- **Data**: Last 10-20 predictions
- **Y-axis**: Accuracy percentage (0-100%)
- **X-axis**: Prediction date
- **Color**: Green line, area fill
- **Points**: Marked with dots

---

## Responsive Design

### Mobile (320px - 767px)
- **MatchPredictionCard**: Full width, stacked layout
- **GoalScorerPredictions**: Single column, stacked teams
- **PredictionDetailsModal**: Bottom sheet, full-screen
- **Probability Bars**: Smaller, simplified
- **Charts**: Simplified, smaller

### Tablet (768px - 1023px)
- **MatchPredictionCard**: 2-column grid
- **GoalScorerPredictions**: 2 columns (side-by-side teams)
- **PredictionDetailsModal**: Centered modal, medium size
- **Charts**: Medium size

### Desktop (1024px+)
- **MatchPredictionCard**: 3-column grid
- **GoalScorerPredictions**: Full 2-column layout
- **PredictionDetailsModal**: Large centered modal
- **Charts**: Full size, detailed

---

## Color & Typography

### Colors
- **High Confidence**: `#10b981` (green)
- **Medium Confidence**: `#f59e0b` (yellow/orange)
- **Low Confidence**: `#ef4444` (red)
- **Probability Bars**: Gradient scale
- **Team Colors**: Use team primary colors where appropriate
- **Background**: Glass morphism (`rgba(26, 26, 46, 0.7)`)

### Typography
- **Predicted Score**: 48px (desktop), 36px (mobile), bold
- **Team Names**: 18px, bold
- **Probabilities**: 14px, medium
- **Key Factors**: 12px, regular
- **Labels**: 10px, regular, muted

---

## Interaction States

### MatchPredictionCard
- **Default**: Standard appearance
- **Hover**: Scale 1.02, shadow increase, border highlight
- **Click**: Opens details modal
- **Loading**: Skeleton card

### Probability Bars
- **Default**: Filled to percentage
- **Hover**: Slight brightness increase
- **Animation**: Smooth fill on load (0.5s)

### Goal Scorer Rows
- **Default**: Standard row
- **Hover**: Background highlight
- **Click**: (Optional) Player details

---

## Empty States

### No Predictions Available
- **Icon**: Chart/analytics icon
- **Heading**: "No Predictions Available"
- **Message**: "Predictions will be generated for upcoming fixtures"
- **CTA**: (Optional) "Refresh" button

### Loading
- **Skeleton Cards**: Match card layout
- **Shimmer Animation**: Loading effect
- **Count**: 3-6 skeleton cards

### Error
- **Icon**: Error icon
- **Message**: "Failed to load predictions"
- **CTA**: "Retry" button

---

## Accuracy Display (Completed Matches)

### Design
```
┌─────────────────────────────────────────────┐
│ Predicted: 2-1    ✓    Actual: 2-1          │
│ Confidence: 75%   Accuracy: 100%            │
└─────────────────────────────────────────────┘
```

### Indicators
- **Exact Match**: Green checkmark, "100%"
- **Outcome Correct**: Yellow checkmark, "50%"
- **Wrong**: Red X, "0%"

### Visual
- Side-by-side comparison
- Color-coded accuracy badge
- Clear visual distinction

---

## Integration Points

### Where Predictions Appear

1. **Fixtures List**: Prediction card next to each fixture
2. **Match Details**: Prediction section in match modal
3. **Dashboard**: Upcoming fixtures widget with predictions
4. **Favorite Team**: Dedicated predictions section
5. **Weekly Picks**: Use predictions for pick recommendations

### FPL Integration
- Highlight predicted goal scorers in user's FPL team
- Show captain recommendations based on predictions
- Transfer suggestions based on upcoming fixture predictions

---

## Accessibility

### Probability Bars
- **ARIA Label**: "Probability: [percentage]%"
- **Keyboard**: Tab to bar, shows tooltip
- **Screen Reader**: Announces percentage

### Charts
- **ARIA Label**: "Team form chart showing [data]"
- **Data Table**: Alternative text representation
- **Keyboard**: Full navigation support

### Cards
- **ARIA Label**: "Match prediction for [home] vs [away]"
- **Keyboard**: Tab to card, Enter to view details
- **Focus**: Clear focus indicator

---

**Design Specification Complete** ✅  
**Ready for Developer Implementation** 🚀
