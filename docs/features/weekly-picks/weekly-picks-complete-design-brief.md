# Footmate Weekly Picks - Complete Design Brief
**Date**: 2025-12-21  
**Status**: Ready for Design  
**Priority**: P0 (New Feature - Engagement & Retention)  
**For**: UI/UX Designer

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Feature Overview](#feature-overview)
3. [User Requirements](#user-requirements)
4. [Game Mechanics & Scoring](#game-mechanics--scoring)
5. [Design Requirements](#design-requirements)
6. [User Flows](#user-flows)
7. [Screen Requirements](#screen-requirements)
8. [Component Specifications](#component-specifications)
9. [Home Screen Integration](#home-screen-integration)
10. [MVP Scope](#mvp-scope)
11. [Success Metrics](#success-metrics)
12. [Reference Materials](#reference-materials)

---

## Executive Summary

### Feature Name
**Footmate Weekly Picks**

### Objective
Introduce a weekly, skill-based game mechanic that increases user engagement, retention, and competition by allowing users to earn Footmate Points through:
- Predicting football match scores
- Selecting players who earn real Fantasy Premier League (FPL) points

### Key Principles
- **Simple to understand** - Clear rules, transparent scoring
- **Fair and transparent** - Uses official FPL data, no hidden mechanics
- **Closely aligned with existing fantasy football behaviour** - Leverages FPL knowledge
- **Suitable for all ages** - Non-gambling, skill-based competition

### Success Criteria
- ✅ Users understand the game in < 30 seconds
- ✅ Pick submission process takes < 2 minutes
- ✅ Scoring is clear and transparent
- ✅ Encourages weekly return engagement
- ✅ Mobile-first, fully responsive

---

## Feature Overview

### What It Is
A weekly game where users:
1. **Predict 3 match scores** (exact score predictions)
2. **Pick 3 players** (who earn real FPL points)
3. **Earn Footmate Points** based on accuracy and player performance
4. **Compete in leagues** (weekly and seasonal)

### Target Users
- Fantasy Premier League players
- Casual football fans
- Youth and family leagues
- Users seeking engagement beyond their FPL team performance

### Value Proposition
"Pick 3 scores. Pick 3 players. Earn real FPL points."

### Leagues & Rankings
- **Weekly leagues** (reset each gameweek)
- **Seasonal leagues** (cumulative points)
- **Combined leagues** (both weekly and seasonal rankings)
- **Private leagues** (invite-based, user-created)
- **Global public leagues** (all users)

### Statistics & Analytics
- **Performance tracking** (points over time, rank over time)
- **Accuracy metrics** (score prediction accuracy, player pick success)
- **Comparative analytics** (vs. average, vs. top 10%)
- **Trend analysis** (improving/declining performance)
- **Insights** (AI-generated recommendations, if available)

---

## User Requirements

### Weekly Game Structure

#### User Picks (Per Gameweek)
Each user must submit:

**3 Match Score Predictions**:
- Exact score predictions (e.g., 2-1)
- Each pick must be from a different fixture
- Format: Home Goals - Away Goals

**3 Player Picks**:
- Any eligible player in that gameweek
- Maximum of one player per real-life team
- Players earn official FPL points

#### Pick Lock Deadline
- **First kickoff of the gameweek**
- Picks cannot be changed after deadline
- Clear countdown timer displayed

#### Reset Cycle
- Picks reset every gameweek
- Users must submit new picks each week
- Previous week's points are locked and displayed

---

## Game Mechanics & Scoring

### Score Prediction Points (Component-Based)

Points are awarded for each correctly predicted component of a match score.

#### Scoring Breakdown (Per Match)

| Condition | Points |
|-----------|--------|
| Correct home team goals | 3 |
| Correct away team goals | 3 |
| Correct match result (W/D/L) | +2 bonus |
| Exact score (both goals correct) | +4 bonus |

**Maximum points per score pick: 12**

#### Scoring Examples

**Example 1**:
- Prediction: 1-0
- Actual: 0-0
- → Correct away goals (0) = **3 points**

**Example 2**:
- Prediction: 2-1
- Actual: 2-0
- → Correct home goals (3) + correct result (2) = **5 points**

**Example 3**:
- Prediction: 1-1
- Actual: 1-1
- → All components correct = **12 points**

---

### Player Pick Points (FPL-Sourced)

- Player picks earn **official Fantasy Premier League points**
- Points are pulled directly from the FPL API
- Includes all standard FPL scoring (positive and negative)
- If a player does not play, they score 0 points
- **No custom scoring or multipliers apply to individual players**

---

### Weekly Combo Multiplier

A weekly combo multiplier is applied if:
- At least one score prediction earns points, **AND**
- At least one player pick scores ≥5 FPL points

**Multiplier**: ×1.25 applied to total weekly points

**Example**:
- Score predictions: 8 points
- Player picks: 15 FPL points
- Combo multiplier: ×1.25 (both conditions met)
- **Total**: (8 + 15) × 1.25 = **28.75 → 29 points** (rounded)

---

### Weekly Total Calculation

```
(Score Prediction Points + Player Pick Points) × Combo Multiplier
```

Final score is rounded to the nearest whole number.

---

## Design Requirements

### Visual Design
- **Clear, game-like interface** (but not childish)
- **Football-native aesthetic** (aligns with Fotmate branding)
- **Score prediction UI** (easy to input scores)
- **Player selection UI** (similar to FPL team selection)
- **Progress indicators** (pick completion status)
- **Countdown timers** (deadline awareness)

### Information Architecture
- **Pick submission flow** (step-by-step, clear)
- **Results display** (transparent scoring breakdown)
- **Leaderboards** (rankings, points, movement)
- **History** (previous weeks' picks and scores)

### User Experience
- **Quick Pick option** ("Auto Pick for Me" - anti-friction)
- **Edit before lock** (users can change picks)
- **Clear deadline** (countdown, warnings)
- **Transparent scoring** (show how points were calculated)

### Responsiveness
- **Mobile-first** (primary platform)
- **Tablet optimization** (larger screens)
- **Desktop support** (full functionality)

### Accessibility
- **WCAG AA compliance** (4.5:1 contrast)
- **Touch-friendly targets** (44x44pt minimum)
- **Screen reader support** (semantic HTML, ARIA)
- **Clear typography** (readable scores, player names)

---

## User Flows

### Flow 1: First-Time User - Making Picks

1. **Land on Weekly Picks page** (from home screen or navigation)
2. **See introduction/explanation** (if first time)
3. **Start making picks**:
   - **Step 1**: Select 3 fixtures for score predictions
   - **Step 2**: Input score predictions (home - away)
   - **Step 3**: Select 3 players (one per team)
4. **Review picks** (summary screen)
5. **Submit picks** (locked until deadline)
6. **See confirmation** (picks saved, countdown to lock)

### Flow 2: Returning User - Viewing Results

1. **Land on Weekly Picks page** (after gameweek)
2. **See results summary** (total points, rank)
3. **View detailed breakdown**:
   - Score predictions: Which were correct, points earned
   - Player picks: FPL points earned, total
   - Combo multiplier: Applied or not
4. **View leaderboard** (rank, movement, league position)
5. **Make next week's picks** (if new gameweek started)

### Flow 3: Quick Pick (Anti-Friction)

1. **Land on Weekly Picks page**
2. **See "Auto Pick for Me" button**
3. **Click button** (generates picks using Footmate insights)
4. **Review auto-generated picks** (can see reasoning)
5. **Edit picks** (if desired, before lock)
6. **Submit picks** (same as manual flow)

### Flow 4: Create & Join Private League

1. **Navigate to Leagues section** (from main picks page or navigation)
2. **Click "Create New League"**
3. **Fill league details**:
   - League name
   - Description (optional)
   - League type (weekly, seasonal, both)
4. **Generate league code** (auto-generated)
5. **Invite members**:
   - Share league code
   - Copy invite link
   - Send invites via email (optional)
6. **League created** (redirect to league detail page)

**Join League Flow**:
1. **Receive invite** (code or link)
2. **Enter league code** (or click link)
3. **See league preview** (name, members, type)
4. **Join league** (confirm)
5. **Redirected to league leaderboard**

### Flow 5: View Statistics & Analytics

1. **Navigate to Statistics section** (from main picks page or navigation)
2. **See overview dashboard** (key metrics)
3. **Explore different analytics**:
   - Performance trends (charts)
   - Score prediction analytics
   - Player pick analytics
   - Combo multiplier stats
   - Comparative analytics
4. **View insights** (AI-generated recommendations, if available)
5. **Export data** (optional, Phase 2)

---

## Screen Requirements

### Screen 1: Weekly Picks Main Page

**Logged-Out Users**:
- Feature introduction
- Sample picks (locked/blurred)
- Sample leaderboard
- CTA: "Sign up to make your picks"

**Logged-In Users**:
- **Header Section**:
  - Current gameweek number
  - Countdown to pick lock
  - Pick completion status (e.g., "2/6 picks made")
  
- **Quick Stats** (if picks submitted):
  - Current points (if gameweek in progress)
  - Current rank
  - League position

- **Action Section**:
  - "Make Your Picks" button (if not submitted)
  - "Edit Your Picks" button (if submitted, before lock)
  - "View Results" button (if gameweek finished)

---

### Screen 2: Pick Submission Flow

#### Step 1: Score Predictions
- **Fixture List** (all matches in gameweek)
- **Selection Interface**:
  - Select 3 different fixtures
  - For each selected fixture:
    - Home team name/logo
    - Score input (home goals - away goals)
    - Away team name/logo
- **Progress Indicator**: "1/3 score predictions"
- **Validation**: Cannot select same fixture twice

#### Step 2: Player Picks
- **Player Selection Interface**:
  - Search/filter players
  - Team filter (to ensure one per team)
  - Player cards showing:
    - Player name, photo
    - Team, position
    - Recent form (optional)
    - FPL price (optional)
- **Selected Players List**:
  - Shows selected players
  - Team indicator (prevents duplicate teams)
  - Remove option
- **Progress Indicator**: "2/3 players selected"
- **Validation**: Maximum one player per team

#### Step 3: Review & Submit
- **Summary Screen**:
  - Score predictions summary (3 matches, predicted scores)
  - Player picks summary (3 players, teams)
  - "Auto Pick" option (if not used)
- **Submit Button**: "Lock My Picks"
- **Warning**: "Picks will be locked at [deadline time]"

---

### Screen 3: Results & Leaderboard

#### Results Section
- **Weekly Total Points** (large, prominent)
- **Scoring Breakdown**:
  - **Score Predictions**:
    - Match 1: Predicted X-Y, Actual A-B, Points earned
    - Match 2: Predicted X-Y, Actual A-B, Points earned
    - Match 3: Predicted X-Y, Actual A-B, Points earned
    - Subtotal: X points
  - **Player Picks**:
    - Player 1: X FPL points
    - Player 2: X FPL points
    - Player 3: X FPL points
    - Subtotal: X FPL points
  - **Combo Multiplier**: ×1.25 (if applied) or "Not applied"
  - **Total**: Final points

#### Leaderboard Section
- **League Selector** (dropdown or tabs):
  - Global (all users)
  - My Private Leagues (list)
  - "Join League" option
- **Leaderboard Table**:
  - Rank
  - User name/avatar
  - Total points
  - Rank movement (↑↓)
- **Your Position** (highlighted)
- **Filter Options**: Weekly, Seasonal, League type
- **League Actions** (if viewing private league):
  - Share league code
  - Invite members
  - League settings (if admin)

---

### Screen 4: History & Past Weeks

- **Week Selector** (dropdown or tabs)
- **Selected Week Display**:
  - Picks made (scores, players)
  - Points earned
  - Rank that week
  - Leaderboard snapshot
- **Season Summary**:
  - Total points (cumulative)
  - Average points per week
  - Best week
  - Current season rank

---

### Screen 5: Private Leagues

#### League List View
- **My Leagues Section**:
  - Leagues user is member of
  - League name, member count, current rank
  - "Create New League" button
- **League Cards**:
  - League name
  - Member count (e.g., "12 members")
  - Your rank in league
  - League type (weekly, seasonal, or both)
  - Last updated timestamp

#### League Detail View
- **League Header**:
  - League name
  - League code (for invites)
  - Member count
  - League type (weekly/seasonal/both)
  - Settings (if user is admin)
- **Leaderboard**:
  - Same as public leaderboard but filtered to league members
  - Member avatars/names
  - Points, rank, movement
- **Members List**:
  - All league members
  - Invite status (pending, active)
  - Admin controls (if applicable)
- **Invite Section**:
  - Share league code
  - Copy invite link
  - Invite via email (optional)

#### Create League Flow
- **Step 1**: League Name & Description
- **Step 2**: League Type (Weekly, Seasonal, or Both)
- **Step 3**: Privacy Settings (Private/Public)
- **Step 4**: Generate League Code
- **Step 5**: Invite Members (optional, can do later)

---

### Screen 6: Statistics & Analytics

#### Overview Dashboard
- **Key Metrics Cards**:
  - Total points (season)
  - Average points per week
  - Best week (points and rank)
  - Current rank (global and leagues)
  - Weeks played / total weeks
  - Win rate (top 10% finishes)

#### Performance Trends
- **Points Over Time Chart**:
  - Line graph showing weekly points
  - Trend line (improving/declining)
  - Average line reference
- **Rank Over Time Chart**:
  - Line graph showing weekly rank
  - Best rank achieved
  - Current rank

#### Score Prediction Analytics
- **Accuracy Metrics**:
  - Total score predictions made
  - Exact scores predicted (count and %)
  - Correct result predictions (W/D/L accuracy)
  - Correct goal predictions (home/away)
  - Average points per score prediction
- **Best/Worst Predictions**:
  - Highest scoring prediction (12 points)
  - Most common prediction type
  - Prediction accuracy by fixture difficulty

#### Player Pick Analytics
- **Player Performance**:
  - Total player picks made
  - Average FPL points per pick
  - Highest scoring pick
  - Players picked most often
  - Teams picked from (distribution)
- **Pick Success Rate**:
  - Picks scoring ≥5 FPL points (%)
  - Picks scoring ≥10 FPL points (%)
  - Zero-point picks (didn't play)

#### Combo Multiplier Stats
- **Multiplier Frequency**:
  - Weeks multiplier applied (%)
  - Average bonus points from multiplier
  - Best multiplier week
- **Conditions Met**:
  - Score prediction success rate
  - Player pick success rate (≥5 points)

#### Comparative Analytics
- **Vs. Average**:
  - Your average vs. global average
  - Your rank percentile
  - Performance vs. top 10%
- **League Comparisons**:
  - Your rank in each league
  - Points difference to league leader
  - Points difference to next rank

#### Insights & Recommendations
- **AI-Generated Insights** (optional):
  - "You perform better when picking [team] players"
  - "Your score predictions are most accurate for [team] matches"
  - "Consider diversifying your player picks"

---

## Component Specifications

### Component 1: Score Prediction Input
- **Purpose**: Input home and away goals
- **Design**: 
  - Two number inputs (home - away)
  - Team names/logos visible
  - Clear visual separation
  - Validation (0-10 range, reasonable scores)
- **States**: Default, Focused, Valid, Invalid

### Component 2: Player Selection Card
- **Purpose**: Display player for selection
- **Design**:
  - Player photo
  - Player name
  - Team name/logo
  - Position
  - Selected state indicator
  - Team conflict warning (if team already selected)
- **States**: Default, Hover, Selected, Disabled (team conflict)

### Component 3: Pick Progress Indicator
- **Purpose**: Show completion status
- **Design**:
  - Progress bar or checklist
  - "X/6 picks made"
  - Visual indicators for:
    - Score predictions (3)
    - Player picks (3)
- **States**: Incomplete, Complete, Locked

### Component 4: Countdown Timer
- **Purpose**: Show time until pick lock
- **Design**:
  - Days, hours, minutes remaining
  - Visual urgency (color changes as deadline approaches)
  - Warning states (24h, 1h, 15min remaining)
- **States**: Normal, Warning, Urgent

### Component 5: Points Breakdown Card
- **Purpose**: Show how points were calculated
- **Design**:
  - Match/player name
  - Prediction vs. actual
  - Points breakdown (component-by-component)
  - Total points for that pick
- **Visual**: Clear, scannable, transparent

### Component 6: Leaderboard Row
- **Purpose**: Display user rank and points
- **Design**:
  - Rank number
  - User avatar/name
  - Total points
  - Rank movement indicator (↑↓)
  - Highlight for current user
- **States**: Default, Current User, Top 3 (special styling)

### Component 7: League Card
- **Purpose**: Display league information
- **Design**:
  - League name
  - Member count
  - Your rank in league
  - League type indicator (weekly/seasonal/both)
  - Quick stats (leader points, your points)
- **States**: Default, Hover, Selected

### Component 8: Stat Card
- **Purpose**: Display a single statistic
- **Design**:
  - Stat label
  - Stat value (large, prominent)
  - Optional: Trend indicator (↑↓)
  - Optional: Comparison (vs. average)
- **States**: Default, Highlighted

### Component 9: Chart Component
- **Purpose**: Display performance trends
- **Design**:
  - Line chart or bar chart
  - X-axis (weeks/dates)
  - Y-axis (points/rank)
  - Interactive tooltips
  - Responsive sizing
- **Types**: Points over time, Rank over time, Accuracy trends

### Component 10: Invite Code Display
- **Purpose**: Show league invite code
- **Design**:
  - League code (large, copyable)
  - "Copy" button
  - Share options (link, email)
  - QR code (optional, for mobile)
- **States**: Default, Copied (feedback)

---

## Home Screen Integration

### Logged-Out Users
- **Display Section**: "Weekly Picks"
- **Content**:
  - Sample weekly picks (locked/blurred)
  - Sample leaderboard (top 5, blurred)
  - Feature description
- **CTA**: "Pick 3 scores. Pick 3 players. Earn real FPL points. Sign up free."

### Logged-In Users
- **Display Section**: "My Weekly Picks"
- **Content**:
  - **If picks not submitted**:
    - Countdown to pick lock
    - Pick completion status (X/6)
    - "Make Your Picks" button
  - **If picks submitted** (before deadline):
    - "Picks locked" indicator
    - Countdown to first kickoff
    - "View Your Picks" link
  - **If gameweek in progress**:
    - Live points tracker
    - Current rank
    - "View Live Results" button
  - **If gameweek finished**:
    - Total points earned
    - Rank this week
    - League position snapshot
    - "View Full Results" button

---

## MVP Scope

### Included (Phase 1)
- ✅ Weekly picks submission (3 scores, 3 players)
- ✅ Component-based score scoring
- ✅ FPL-sourced player points
- ✅ Combo multiplier calculation
- ✅ Basic leaderboards (weekly, seasonal)
- ✅ **Private leagues (invite-based)**
- ✅ **User statistics & analytics**
- ✅ Pick lock deadline enforcement
- ✅ Results display with breakdown
- ✅ Home screen integration

### Excluded (Phase 2+)
- ❌ Achievements/badges
- ❌ Advanced multipliers
- ❌ Social sharing
- ❌ Sponsored challenges
- ❌ Pick history deep dive (basic history included)

---

## Guardrails & Edge Cases

### Validation Rules
- **One player per real-life team** (enforced in UI)
- **Three different fixtures** (cannot select same fixture twice)
- **Picks locked at deadline** (no changes after first kickoff)
- **Score range validation** (0-10 goals, reasonable limits)

### Postponed Matches
- **Automatic void** (if match postponed before deadline)
- **Carry-over option** (if match postponed after deadline, user can pick replacement)
- **Clear communication** (notify users of postponements)

### Score Finalization
- **FPL official finalization** (scores finalised once FPL officially finalises the gameweek)
- **No manual overrides** (use official FPL data only)

### Error Handling
- **Network errors** (retry submission, save locally)
- **API errors** (graceful degradation, show cached data)
- **Deadline missed** (clear message, show next week's picks)

---

## Success Metrics

### Engagement Metrics
- **% of active users submitting weekly picks** (Target: 60%+)
- **Week-on-week return rate** (Target: 70%+)
- **Average picks completion time** (Target: < 2 minutes)

### Competition Metrics
- **League creation rate** (Target: 20%+ of users)
- **League join rate** (Target: 40%+ of users in at least one league)
- **Average leagues per user** (Target: 1.5+)
- **Leaderboard views per user** (Target: 3+ per week)
- **Private league engagement** (Target: 50%+ of league members active weekly)
- **Social sharing** (Phase 2, if implemented)

### Analytics Usage Metrics
- **Statistics page views** (Target: 30%+ of users view stats weekly)
- **Time spent on analytics** (Target: 2+ minutes per session)
- **Chart interactions** (Target: 50%+ of users interact with charts)

### User Experience Metrics
- **Pick submission success rate** (Target: 95%+)
- **Time to first pick** (Target: < 30 seconds)
- **League creation completion rate** (Target: 90%+)
- **User satisfaction** (qualitative feedback)

---

## Technical Constraints

### Data Sources
- **FPL API**: Player points, fixtures, gameweeks
- **Internal Database**: User picks, scores, leaderboards
- **Real-time Updates**: Live points during gameweek

### Performance
- **Fast pick submission** (< 1 second response)
- **Real-time leaderboard updates** (during gameweek)
- **Optimized player search** (filtering, pagination)

### Integration
- **Auth system** (existing)
- **FPL data integration** (existing)
- **Home screen integration** (new)

---

## Design Questions to Answer

1. **Pick Submission Flow**: Single page or multi-step wizard?
2. **Score Input**: Number inputs, sliders, or visual selector?
3. **Player Selection**: Search-first or browse-first?
4. **Results Display**: Detailed breakdown or summary-first?
5. **Leaderboard**: Table, cards, or hybrid?
6. **Quick Pick**: How much AI insight to show?
7. **Visual Style**: Game-like or professional?
8. **Mobile vs Desktop**: Different layouts or responsive adaptation?
9. **Private Leagues**: How prominent should league creation be?
10. **Statistics Display**: Dashboard view or separate detailed pages?
11. **Charts**: Which chart types work best for mobile?
12. **League Invites**: Email, link, or code-based (or all)?

---

## Reference Materials

### Existing Features
- **FPL Team Selection**: Reference for player selection UI
- **Fixture Display**: Reference for match display
- **Leaderboards**: Reference for ranking displays

### Branding
- **Fotmate Brand Colors**: `--pl-green`, `--pl-cyan`, `--pl-pink`, `--pl-purple`
- **Logo**: `frontend/src/components/Logo.tsx`
- **Design System**: Tailwind CSS, existing components

### Code References
- **FPL API Integration**: `frontend/src/lib/api.ts`
- **Auth Context**: `frontend/src/lib/auth-context.tsx`
- **Navigation**: `frontend/src/components/navigation/`

---

## Next Steps

1. **Review this brief** (understand scope and requirements)
2. **Answer design questions** (clarify with stakeholders if needed)
3. **Create design specifications** (wireframes, visual design, components)
4. **Review with stakeholders** (get approval)
5. **Hand off to Developer** (create implementation handoff document)

---

## Success Criteria Summary

Your design is successful if:
- ✅ **Users understand the game in < 30 seconds** (clear explanation)
- ✅ **Pick submission takes < 2 minutes** (efficient flow)
- ✅ **Scoring is transparent** (clear breakdown)
- ✅ **Encourages weekly return** (engagement hooks)
- ✅ **Mobile-first and responsive** (works on all devices)
- ✅ **Football-native aesthetic** (aligns with Fotmate branding)
- ✅ **Developer-ready** (clear specs, implementable)

---

**Document Status**: ✅ Complete Design Brief  
**Ready For**: UI/UX Designer to begin design work

---

**Questions?** Contact the Product Manager or refer to the feature requirements.

