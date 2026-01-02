# Score Predictor - Designer Handoff
**Date**: 2025-12-21  
**Status**: Ready for Design  
**Priority**: P1  
**Handoff From**: Product & Project Management  
**Handoff To**: UI/UX Designer

---

## 🎯 Quick Overview

**Feature**: Score Predictor - AI-powered match score and goal scorer predictions using historical match data analysis.

**Objective**: Design intuitive, data-rich prediction displays that show match scores, goal scorers, probabilities, and key factors in a clear, engaging way.

**Full Requirements**: See `score-predictor-requirements.md` for complete requirements.

---

## 📋 What You Need to Design

### Core Components (5 Components)

1. **MatchPredictionCard Component**
   - Main prediction display for a single match
   - Shows predicted score, outcome probabilities, key factors
   - Compact card format for lists

2. **GoalScorerPredictions Component**
   - Lists predicted goal scorers with probabilities
   - Shows top 3-5 players per team
   - Visual probability indicators

3. **PredictionDetailsModal Component**
   - Full detailed analysis view
   - Team form charts, head-to-head history
   - Statistical breakdown
   - Modal/overlay format

4. **PredictionAccuracyWidget Component**
   - Shows prediction accuracy metrics
   - Historical accuracy chart
   - Recent predictions performance

5. **FixturesWithPredictions Component**
   - List/grid of upcoming fixtures with predictions
   - Quick view format
   - Filterable by team/gameweek

---

## 🎨 Key Design Requirements

### Visual Style
- **Data-Rich**: Display probabilities, percentages, statistics clearly
- **Football-Native**: Feels integrated with match/fixture displays
- **Confidence Indicators**: Visual cues for prediction confidence
- **Probability Visualization**: Use charts, bars, percentages effectively
- **Clean & Modern**: Not cluttered despite data density

### Brand Colors
- **Primary**: `--pl-green` (Fotmate brand)
- **Confidence Colors**: 
  - High confidence: Green
  - Medium confidence: Yellow/Orange
  - Low confidence: Red/Gray
- **Probability Bars**: Use gradient or color scale
- **Team Colors**: Consider using team colors where appropriate

### Key Principles
- **Clarity**: Predictions should be immediately clear
- **Transparency**: Show confidence levels and key factors
- **Visual Hierarchy**: Most important info (score) most prominent
- **Data Visualization**: Use charts/graphs for form, probabilities
- **Mobile-Friendly**: Works on small screens with lots of data

---

## 🧩 Components to Design

### 1. MatchPredictionCard

**Layout**:
- Header: Home Team vs Away Team, Date
- Main: Large predicted score (e.g., "2-1")
- Confidence badge/indicator
- Outcome probabilities (Home Win / Draw / Away Win)
- Key factors (bullet points or icons)
- Action: "View Details" button

**States**:
- Default: Upcoming match prediction
- Completed: Show actual result vs prediction
- High confidence: Highlighted border/background
- Low confidence: Muted colors

**Information Hierarchy**:
1. Predicted score (largest, most prominent)
2. Outcome probabilities
3. Confidence level
4. Key factors
5. Details link

### 2. GoalScorerPredictions

**Layout**:
- Section header: "Most Likely Goal Scorers"
- Two columns: Home Team | Away Team
- Each player:
  - Photo/avatar
  - Name
  - Position badge
  - Probability bar + percentage
  - Form indicator (hot/cold badge)
- Top 3-5 players per team

**Visual Elements**:
- Probability bars (horizontal bars showing %)
- Form badges (🔥 Hot, ❄️ Cold, or trend arrows)
- Position icons (GK, DEF, MID, FWD)
- Ranking numbers (1, 2, 3)

**States**:
- Default: Predictions before match
- Completed: Highlight actual scorers (if predicted correctly)

### 3. PredictionDetailsModal

**Layout**:
- Modal/overlay format
- Tabs or sections:
  1. **Prediction Summary**: Score, probabilities, confidence
  2. **Team Form**: Charts showing recent form
  3. **Head-to-Head**: Historical results between teams
  4. **Statistics**: Team comparison (goals, form, etc.)
  5. **Goal Scorers**: Full list with detailed probabilities

**Charts/Visualizations**:
- Team form line chart (last 5-10 matches)
- Goals scored/conceded bar chart
- Head-to-head results timeline
- Team statistics comparison (side-by-side bars)
- Probability distribution chart

**Information Density**:
- Dense but organized
- Use tabs/sections to organize
- Charts for visual data
- Tables for detailed stats

### 4. PredictionAccuracyWidget

**Layout**:
- Header: "Prediction Accuracy"
- Key metrics:
  - Overall accuracy %
  - Score exact match %
  - Outcome correct %
  - Goal scorer accuracy %
- Chart: Accuracy over time (line chart)
- Recent predictions: List with accuracy indicators

**Visual Elements**:
- Large percentage displays
- Accuracy trend chart
- Color coding: Green (good), Yellow (ok), Red (poor)
- Success/failure indicators (✓/✗)

### 5. FixturesWithPredictions

**Layout**:
- List or grid of fixture cards
- Each card: MatchPredictionCard (compact version)
- Filters: Team, Gameweek, Date range
- Sort options: Date, Confidence, Team

**Responsive**:
- Desktop: 2-3 column grid
- Tablet: 2 column grid
- Mobile: Single column list

---

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

**Adaptations**:
- Mobile: Stacked layout, simplified cards, bottom sheet for details
- Tablet: 2-column grid, medium detail level
- Desktop: Full detail, side-by-side comparisons, expanded charts

---

## 🎯 Design Questions to Answer

1. **Score Display**: How to show predicted score? Large numbers? Scoreline format?
2. **Probability Visualization**: Bars? Circles? Numbers? Combination?
3. **Confidence Indicator**: Badge? Color? Icon? Text?
4. **Goal Scorer Layout**: Horizontal list? Vertical cards? Grid?
5. **Form Visualization**: Line chart? Bar chart? Trend arrows?
6. **Color Coding**: How to use colors for confidence/probability?
7. **Data Density**: How much info on card vs details view?
8. **Comparison Views**: How to show team comparison side-by-side?
9. **Accuracy Display**: How to show prediction vs actual result?
10. **Mobile Optimization**: How to simplify for mobile while keeping key info?

---

## ✅ Deliverables Required

### Required
1. **Component Designs** (all 5 components with states)
2. **Layout Definitions** (card layouts, modal layout, list layout)
3. **Visual Design Specs** (colors, typography, spacing)
4. **Data Visualization Specs** (charts, graphs, probability bars)
5. **Interaction States** (default, hover, active, loading, error)
6. **Responsive Breakpoints** (mobile, tablet, desktop)
7. **Empty States** (no predictions, loading, error)
8. **Accuracy Display** (how to show prediction vs actual)

### Optional (Nice to Have)
- High-fidelity mockups (Figma, Sketch, etc.)
- Interactive prototype
- Animation specifications (for probability bars, charts)
- Micro-interactions (hover effects, transitions)

---

## 📊 Key Features to Highlight

### Score Prediction
- **Clear Display**: Predicted score immediately visible
- **Confidence**: Show how confident the prediction is
- **Alternatives**: Show other likely scorelines
- **Reasoning**: Explain why this prediction was made

### Goal Scorer Prediction
- **Top Scorers**: Clearly show most likely scorers
- **Probabilities**: Visual probability indicators
- **Form**: Show recent form/trends
- **Ranking**: Clear ranking (1st, 2nd, 3rd most likely)

### Analysis & Details
- **Team Form**: Visual charts showing recent performance
- **Head-to-Head**: Historical results between teams
- **Statistics**: Detailed team/player statistics
- **Factors**: Key factors that influenced prediction

### Accuracy Tracking
- **Metrics**: Overall accuracy percentages
- **Trends**: Accuracy over time
- **Feedback**: Show which predictions were right/wrong
- **Learning**: Help users understand prediction quality

---

## 🔄 User Flows to Design

### Flow 1: View Predictions for Upcoming Fixtures
1. User navigates to "Predictions" section
2. Sees list of upcoming fixtures with predictions
3. Each fixture shows predicted score and confidence
4. User clicks on a fixture
5. Sees detailed prediction with goal scorers
6. Can view full analysis in modal

### Flow 2: View Prediction Details
1. User clicks "View Details" on prediction card
2. Modal opens with full analysis
3. User can navigate tabs: Summary, Form, H2H, Stats, Scorers
4. Sees charts, statistics, detailed breakdown
5. Closes modal to return to list

### Flow 3: Check Prediction Accuracy
1. User views completed match
2. Sees actual result vs prediction
3. Accuracy indicator shows if prediction was correct
4. Can view accuracy metrics for all predictions
5. Sees accuracy trends over time

### Flow 4: Use Predictions for FPL
1. User views predictions for upcoming gameweek
2. Sees goal scorer predictions
3. Highlights which predicted scorers are in their FPL team
4. Gets captain/transfer recommendations
5. Makes FPL decisions based on predictions

---

## 🎨 Design Considerations

### Data Visualization
- **Probability Bars**: Horizontal bars showing percentage
- **Charts**: Line charts for form, bar charts for comparisons
- **Color Scales**: Use color to indicate confidence/probability
- **Icons**: Use icons for form (🔥❄️), position, outcomes

### Information Architecture
- **Progressive Disclosure**: Basic info on card, details in modal
- **Grouping**: Group related information (form, H2H, stats)
- **Hierarchy**: Most important info (score) most prominent
- **Scanability**: Easy to scan and find key information

### Mobile Optimization
- **Simplified Cards**: Less info on mobile cards
- **Bottom Sheets**: Use bottom sheets for details on mobile
- **Touch Targets**: Large touch targets for interactions
- **Swipe Actions**: Consider swipe for navigation

### Accessibility
- **WCAG AA Compliance**: 4.5:1 contrast ratio
- **Screen Reader Support**: Proper labels for charts/data
- **Keyboard Navigation**: Full keyboard support
- **Color Blindness**: Don't rely solely on color

### Performance
- **Loading States**: Show skeletons/loading for async data
- **Error Handling**: Clear error messages
- **Optimistic Updates**: Show predictions immediately
- **Caching**: Predictions should be cached

---

## 📚 Reference Materials

### Full Documentation
- **Complete Requirements**: `score-predictor-requirements.md`
  - Full feature requirements
  - Technical specifications
  - Algorithm details
  - Acceptance criteria

### Existing Code
- **Match Components**: Check existing match/fixture display components
- **Dashboard**: Review dashboard data visualization patterns
- **FPL Components**: Review FPL player/team display components
- **Design System**: CSS variables, Tailwind classes

### Similar Features
- **Betting Odds Displays**: Similar probability/outcome displays
- **Fantasy Sports Predictions**: Similar prediction interfaces
- **Sports Analytics Dashboards**: Data-rich sports interfaces

---

## ⚠️ Important Constraints

### Technical
- **Existing Tech Stack**: Next.js, React, Tailwind CSS
- **Chart Library**: Need to choose (Recharts, Chart.js, etc.)
- **Data Format**: Predictions come from backend API
- **Performance**: Must handle many predictions efficiently

### Scope
- **MVP Focus**: Core prediction display first
- **Mobile-First**: Ensure great mobile experience
- **Data Density**: Balance information with clarity

### UX
- **Confidence Transparency**: Always show confidence levels
- **No Over-Promise**: Make clear predictions are estimates
- **Educational**: Help users understand predictions

---

## 🎯 Success Criteria

Your design is successful if:
- ✅ **Clear**: Predicted scores immediately obvious
- ✅ **Informative**: Key factors and reasoning visible
- ✅ **Visual**: Probabilities and data visualized effectively
- ✅ **Trustworthy**: Confidence levels clear and transparent
- ✅ **Mobile-Friendly**: Works perfectly on mobile devices
- ✅ **Engaging**: Users want to check predictions regularly
- ✅ **Developer-Ready**: Clear specs, implementable

---

## 📅 Timeline

**Estimated Design Time**: 2-3 weeks

**Phases**:
1. **Week 1**: Core components (MatchPredictionCard, GoalScorerPredictions)
2. **Week 2**: Details modal, accuracy widget, fixtures list
3. **Week 3**: Polish, responsive design, animations

---

## 🚀 Next Steps

1. **Review this handoff** (understand scope and objectives)
2. **Read full requirements** (`score-predictor-requirements.md`)
3. **Review existing match/fixture UI** (understand current patterns)
4. **Answer design questions** (clarify with stakeholders if needed)
5. **Create design specifications** (layout, wireframes, visual design)
6. **Review with stakeholders** (get approval)
7. **Hand off to Developer** (create implementation handoff document)

---

## 📞 Questions?

**Contact**: Product Manager  
**Full Requirements**: `docs/features/score-predictor/score-predictor-requirements.md`

---

**Document Status**: ✅ Ready for Designer  
**Next**: Begin design work

---

## 🎨 Quick Reference: Key Numbers

- **Top 3-5** goal scorers predicted per team
- **0-100%** probability ranges for predictions
- **5-10 matches** used for form calculations
- **2+ seasons** of historical data analyzed
- **WCAG AA** accessibility requirement

---

**Good luck with the design! 🎨⚽📊**
