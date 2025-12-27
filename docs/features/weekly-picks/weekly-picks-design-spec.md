# Weekly Picks - Design Specifications

**Date**: 2025-12-21  
**Designer**: UI Designer Agent  
**Status**: ✅ Design Complete  
**Priority**: P0 (New Feature - Engagement & Retention)  
**For**: Developer Agent

---

## Overview

Complete design specifications for the Footmate Weekly Picks feature. This document provides detailed layouts, component specs, responsive breakpoints, and implementation guidance for all 6 screens and 10 components.

**Reference Documents**:
- Requirements: `weekly-picks-complete-design-brief.md`
- Handoff: `weekly-picks-handoff-ui-designer.md`
- Current Implementation: None (new feature)

---

## Design Answers

### 1. Pick Submission Flow
**Answer**: **Multi-step wizard** (3 steps) - Better UX for mobile, clear progress, reduces cognitive load

### 2. Score Input
**Answer**: **Number inputs with team context** - Simple, fast, clear. Team names/logos visible above inputs.

### 3. Player Selection
**Answer**: **Search-first with filters** - Most users know who they want. Filters for team/position as secondary.

### 4. Results Display
**Answer**: **Summary-first with expandable details** - Quick overview, drill down for details.

### 5. Leaderboard
**Answer**: **Hybrid (cards on mobile, table on desktop)** - Touch-friendly on mobile, efficient on desktop.

### 6. Quick Pick
**Answer**: **Show reasoning briefly** - "Based on form, fixtures, and value" with option to see more.

### 7. Visual Style
**Answer**: **Professional with game elements** - Football-native, clean, modern. Not childish but engaging.

### 8. Mobile vs Desktop
**Answer**: **Responsive adaptation** - Same content, optimized layouts for each breakpoint.

### 9. Private Leagues
**Answer**: **Prominent but not intrusive** - Clear "Create League" button, easy to find but doesn't dominate.

### 10. Statistics Display
**Answer**: **Dashboard view with drill-down** - Overview dashboard, expandable sections for details.

### 11. Charts
**Answer**: **Line charts for trends, bar charts for comparisons** - Simple, mobile-friendly, interactive tooltips.

### 12. League Invites
**Answer**: **Code + link (both)** - Code for manual entry, link for easy sharing. Email optional (Phase 2).

---

## Screen 1: Weekly Picks Main Page

### Logged-Out State

**Layout**:
```
┌─────────────────────────────────┐
│ TopNavigation (minimal)          │
├─────────────────────────────────┤
│                                 │
│ HERO SECTION                    │
│ - Feature intro                 │
│ - "Pick 3 scores. Pick 3..."   │
│ - Sample picks (blurred)        │
│ - CTA: "Sign up to play"        │
│                                 │
├─────────────────────────────────┤
│                                 │
│ SAMPLE LEADERBOARD              │
│ - Top 5 (blurred)               │
│ - "Join thousands competing"    │
│                                 │
├─────────────────────────────────┤
│                                 │
│ HOW IT WORKS                    │
│ - 3 steps visual                │
│ - Scoring explanation           │
│                                 │
├─────────────────────────────────┤
│                                 │
│ FINAL CTA                       │
│ - "Start Making Picks"          │
│                                 │
└─────────────────────────────────┘
```

**Design**:
- Hero: Large headline, value prop, blurred sample picks
- Sample leaderboard: Top 5 users (blurred), social proof
- How it works: 3-step visual guide
- CTA: Prominent sign-up button

---

### Logged-In State

**Layout**:
```
┌─────────────────────────────────┐
│ TopNavigation                   │
├─────────────────────────────────┤
│                                 │
│ HEADER SECTION                  │
│ - Gameweek #X                   │
│ - Countdown Timer               │
│ - Pick Status: X/6              │
│                                 │
├─────────────────────────────────┤
│                                 │
│ QUICK STATS (if picks made)     │
│ - Current Points                │
│ - Current Rank                   │
│ - League Position               │
│                                 │
├─────────────────────────────────┤
│                                 │
│ ACTION SECTION                  │
│ - [Make Your Picks]             │
│ - [Edit Your Picks]             │
│ - [View Results]                │
│ - [Quick Pick]                  │
│                                 │
├─────────────────────────────────┤
│                                 │
│ QUICK LINKS                     │
│ - View Leaderboard              │
│ - My Leagues                    │
│ - Statistics                    │
│                                 │
└─────────────────────────────────┘
```

**Design**:
- Header: Gameweek number, countdown (prominent), pick status
- Quick stats: Cards showing current performance
- Action buttons: Primary CTA based on state
- Quick links: Secondary navigation

**States**:
1. **No picks submitted**: "Make Your Picks" button prominent
2. **Picks submitted (before lock)**: "Edit Your Picks" + countdown
3. **Picks locked (gameweek in progress)**: "View Live Results" + live points
4. **Gameweek finished**: "View Results" + total points summary

---

## Screen 2: Pick Submission Flow (3 Steps)

### Step 1: Score Predictions

**Layout**:
```
┌─────────────────────────────────┐
│ [Back] Step 1 of 3              │
│ Progress: ████░░░░░░ 33%        │
├─────────────────────────────────┤
│                                 │
│ Select 3 Fixtures               │
│ (1/3 selected)                  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Fixture Card]              │ │
│ │ Arsenal vs Liverpool        │ │
│ │ [Select]                     │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Repeat for all fixtures]       │
│                                 │
├─────────────────────────────────┤
│                                 │
│ SELECTED FIXTURES (3)           │
│ ┌─────────────────────────────┐ │
│ │ Arsenal vs Liverpool        │ │
│ │ [Home] [0] - [0] [Away]     │ │
│ │ [Remove]                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Continue to Step 2]            │
│                                 │
└─────────────────────────────────┘
```

**Design**:
- Progress indicator: Top of screen, clear step number
- Fixture list: Scrollable cards, selectable
- Selected fixtures: Fixed section at bottom with score inputs
- Score inputs: Number inputs (0-10), team names visible
- Validation: Cannot select same fixture twice, must select 3

**Interaction**:
- Tap fixture card → Adds to selected section
- Tap selected fixture → Removes from selection
- Input scores → Real-time validation
- Continue button → Enabled when 3 fixtures selected with scores

---

### Step 2: Player Picks

**Layout**:
```
┌─────────────────────────────────┐
│ [Back] Step 2 of 3               │
│ Progress: ████████░░ 67%         │
├─────────────────────────────────┤
│                                 │
│ Select 3 Players                │
│ (1/3 selected)                  │
│                                 │
│ [Search Players...]              │
│ [Filter: Team | Position]       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Player Card]               │ │
│ │ [Photo] Name                │ │
│ │ Team | Position             │ │
│ │ Form: 8.2                   │ │
│ │ [Select]                     │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Scrollable player list]         │
│                                 │
├─────────────────────────────────┤
│                                 │
│ SELECTED PLAYERS (2/3)           │
│ ┌─────────────────────────────┐ │
│ │ [Photo] Player Name         │ │
│ │ Team Name                   │ │
│ │ [Remove]                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Continue to Step 3]             │
│                                 │
└─────────────────────────────────┘
```

**Design**:
- Search bar: Prominent, autocomplete
- Filters: Team dropdown, Position buttons
- Player cards: Photo, name, team, position, form
- Selected players: Fixed section at bottom
- Team conflict: Visual warning if same team selected

**Interaction**:
- Search → Filters player list
- Tap player card → Adds to selected (if team not conflict)
- Team conflict → Shows warning, prevents selection
- Remove → Removes from selected
- Continue → Enabled when 3 players selected (different teams)

---

### Step 3: Review & Submit

**Layout**:
```
┌─────────────────────────────────┐
│ [Back] Step 3 of 3               │
│ Progress: ████████████ 100%      │
├─────────────────────────────────┤
│                                 │
│ Review Your Picks               │
│                                 │
│ SCORE PREDICTIONS (3)           │
│ ┌─────────────────────────────┐ │
│ │ Arsenal 2 - 1 Liverpool    │ │
│ │ [Edit]                      │ │
│ └─────────────────────────────┘ │
│ [Repeat for 3 predictions]       │
│                                 │
│ PLAYER PICKS (3)                │
│ ┌─────────────────────────────┐ │
│ │ [Photo] Player Name         │ │
│ │ Team Name                   │ │
│ │ [Edit]                      │ │
│ └─────────────────────────────┘ │
│ [Repeat for 3 players]           │
│                                 │
├─────────────────────────────────┤
│                                 │
│ ⚠️ Picks will lock at:          │
│ [Deadline countdown]             │
│                                 │
│ [Lock My Picks] (Primary)        │
│                                 │
└─────────────────────────────────┘
```

**Design**:
- Summary cards: All picks displayed clearly
- Edit buttons: Return to specific step
- Deadline warning: Prominent countdown
- Submit button: Large, clear, primary CTA

**Interaction**:
- Edit → Returns to specific step
- Lock My Picks → Confirms submission, shows success
- Success → Redirects to main page with confirmation

---

## Screen 3: Results & Leaderboard

### Results Section

**Layout**:
```
┌─────────────────────────────────┐
│ Gameweek X Results               │
├─────────────────────────────────┤
│                                 │
│ YOUR TOTAL POINTS               │
│ [Large Number] 42               │
│ Rank: #1,234                     │
│                                 │
├─────────────────────────────────┤
│                                 │
│ SCORING BREAKDOWN                │
│                                 │
│ Score Predictions (18 pts)      │
│ ┌─────────────────────────────┐ │
│ │ Arsenal 2-1 Liverpool       │ │
│ │ Predicted: 2-1              │ │
│ │ Actual: 2-1 ✓               │ │
│ │ Points: 12 (exact score)    │ │
│ └─────────────────────────────┘ │
│ [Expandable for all 3]          │
│                                 │
│ Player Picks (15 FPL pts)       │
│ ┌─────────────────────────────┐ │
│ │ [Photo] Player Name         │ │
│ │ FPL Points: 8               │ │
│ └─────────────────────────────┘ │
│ [Expandable for all 3]          │
│                                 │
│ Combo Multiplier                │
│ ×1.25 (applied)                 │
│                                 │
│ Total: 42 points                │
│                                 │
├─────────────────────────────────┤
│                                 │
│ LEADERBOARD                      │
│ [League Selector]               │
│                                 │
│ #1  User1  65 pts  ↑2            │
│ #2  User2  58 pts  ↓1            │
│ #3  You    42 pts  ↑5  [YOU]    │
│ ...                              │
│                                 │
└─────────────────────────────────┘
```

**Design**:
- Total points: Large, prominent display
- Breakdown: Expandable cards for each pick
- Visual indicators: ✓ for correct, ✗ for incorrect
- Leaderboard: Scrollable, your position highlighted

---

## Screen 4: History & Past Weeks

**Layout**:
```
┌─────────────────────────────────┐
│ Weekly Picks History             │
├─────────────────────────────────┤
│                                 │
│ [Week Selector Dropdown]        │
│ Gameweek X                      │
│                                 │
├─────────────────────────────────┤
│                                 │
│ SELECTED WEEK                    │
│ - Picks made                    │
│ - Points earned                 │
│ - Rank that week                │
│                                 │
├─────────────────────────────────┤
│                                 │
│ SEASON SUMMARY                   │
│ ┌─────────────────────────────┐ │
│ │ Total Points: 420           │ │
│ │ Avg per Week: 35           │ │
│ │ Best Week: 58 (GW 5)        │ │
│ │ Current Rank: #1,234        │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Design**:
- Week selector: Dropdown or tabs
- Selected week: Full details of picks and results
- Season summary: Key metrics cards

---

## Screen 5: Private Leagues

### League List View

**Layout**:
```
┌─────────────────────────────────┐
│ My Private Leagues               │
├─────────────────────────────────┤
│                                 │
│ [Create New League] (Primary)    │
│                                 │
├─────────────────────────────────┤
│                                 │
│ MY LEAGUES (3)                   │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ League Name                 │ │
│ │ 12 members | Your rank: #3  │ │
│ │ Weekly + Seasonal           │ │
│ │ [View League]               │ │
│ └─────────────────────────────┘ │
│ [Repeat for each league]         │
│                                 │
└─────────────────────────────────┘
```

**Design**:
- Create button: Prominent, primary CTA
- League cards: Name, member count, your rank, type
- Tap card → Opens league detail

---

### League Detail View

**Layout**:
```
┌─────────────────────────────────┐
│ [Back] League Name               │
├─────────────────────────────────┤
│                                 │
│ LEAGUE INFO                     │
│ - Code: ABC123                  │
│ - 12 members                    │
│ - Weekly + Seasonal            │
│ [Share Code] [Invite]           │
│                                 │
├─────────────────────────────────┤
│                                 │
│ LEADERBOARD                      │
│ #1  User1  65 pts               │
│ #2  User2  58 pts               │
│ #3  You    42 pts  [YOU]        │
│ ...                              │
│                                 │
├─────────────────────────────────┤
│                                 │
│ MEMBERS (12)                     │
│ [Avatar] User1                   │
│ [Avatar] User2                   │
│ ...                              │
│                                 │
└─────────────────────────────────┘
```

**Design**:
- League header: Name, code, member count
- Share options: Code display, copy button, invite link
- Leaderboard: Same as public but filtered
- Members list: Avatars, names

---

### Create League Flow

**Layout**:
```
┌─────────────────────────────────┐
│ Create New League                │
├─────────────────────────────────┤
│                                 │
│ Step 1: League Details           │
│ - League Name [input]            │
│ - Description [textarea]         │
│ [Continue]                       │
│                                 │
├─────────────────────────────────┤
│                                 │
│ Step 2: League Type              │
│ ○ Weekly only                   │
│ ○ Seasonal only                 │
│ ● Both (recommended)            │
│ [Continue]                       │
│                                 │
├─────────────────────────────────┤
│                                 │
│ Step 3: Generate Code            │
│ Code: ABC123                     │
│ [Copy] [Share Link]             │
│ [Finish]                         │
│                                 │
└─────────────────────────────────┘
```

**Design**:
- Multi-step form: Clear progress
- League name: Required, validation
- Type selection: Radio buttons
- Code generation: Auto-generated, copyable

---

## Screen 6: Statistics & Analytics

### Overview Dashboard

**Layout**:
```
┌─────────────────────────────────┐
│ My Statistics                    │
├─────────────────────────────────┤
│                                 │
│ KEY METRICS                     │
│ ┌─────────┐ ┌─────────┐        │
│ │ 420     │ │ 35      │        │
│ │ Total   │ │ Avg/Week│        │
│ └─────────┘ └─────────┘        │
│ [More metric cards]             │
│                                 │
├─────────────────────────────────┤
│                                 │
│ PERFORMANCE TRENDS               │
│ [Line Chart: Points Over Time]  │
│                                 │
│ [Line Chart: Rank Over Time]    │
│                                 │
├─────────────────────────────────┤
│                                 │
│ SCORE PREDICTION ANALYTICS       │
│ - Accuracy: 65%                 │
│ - Exact scores: 12              │
│ - Avg points: 6.2               │
│ [Expand for details]             │
│                                 │
├─────────────────────────────────┤
│                                 │
│ PLAYER PICK ANALYTICS            │
│ - Avg FPL points: 7.5          │
│ - Success rate: 78%             │
│ [Expand for details]            │
│                                 │
└─────────────────────────────────┘
```

**Design**:
- Metric cards: Large numbers, clear labels
- Charts: Interactive, responsive
- Expandable sections: Summary first, details on expand

---

## Component Specifications

### Component 1: Score Prediction Input

**Props**:
```typescript
interface ScorePredictionInputProps {
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore: number;
  awayScore: number;
  onChange: (home: number, away: number) => void;
  disabled?: boolean;
}
```

**Design**:
```
┌─────────────────────────────┐
│ [Home Logo] Home Team       │
│ [0] - [0]                   │
│ [Away Logo] Away Team       │
└─────────────────────────────┘
```

**Styling**:
- Inputs: Large, centered, number type (0-10)
- Team names: Above/below inputs
- Logos: Small, next to team names
- Border: Highlighted when focused

**States**:
- Default: Gray border
- Focused: Green border, glow
- Valid: Green checkmark
- Invalid: Red border, error message

---

### Component 2: Player Selection Card

**Props**:
```typescript
interface PlayerSelectionCardProps {
  player: {
    id: number;
    name: string;
    photo?: string;
    team: string;
    teamId: number;
    position: string;
    form?: number;
  };
  selected: boolean;
  disabled?: boolean; // Team conflict
  onSelect: () => void;
  onDeselect: () => void;
}
```

**Design**:
```
┌─────────────────────────────┐
│ [Photo] Player Name          │
│ Team | Position             │
│ Form: 8.2                   │
│ [Select Button]              │
└─────────────────────────────┘
```

**Styling**:
- Card: Glass morphism, rounded
- Photo: Circular, 48x48px
- Selected: Green border, checkmark
- Disabled: Grayed out, "Team already selected" message

**States**:
- Default: White border
- Hover: Scale 1.02, glow
- Selected: Green border, checkmark icon
- Disabled: Opacity 0.5, no interaction

---

### Component 3: Pick Progress Indicator

**Props**:
```typescript
interface PickProgressIndicatorProps {
  scorePredictions: number; // 0-3
  playerPicks: number; // 0-3
  total: number; // 0-6
}
```

**Design**:
```
Progress: 4/6 picks made
[████████░░] 67%

✓ Score Predictions (2/3)
✓ Player Picks (2/3)
```

**Styling**:
- Progress bar: Green gradient
- Checklist: Icons for completed
- Numbers: Large, prominent

**States**:
- Incomplete: Gray progress bar
- Complete: Green progress bar, all checkmarks
- Locked: Disabled, "Picks Locked" message

---

### Component 4: Countdown Timer

**Props**:
```typescript
interface CountdownTimerProps {
  deadline: Date;
  onExpire?: () => void;
}
```

**Design**:
```
Time until lock: 2d 5h 23m
[Visual countdown circle]
```

**Styling**:
- Large numbers: Bold, prominent
- Visual: Circular progress or countdown
- Color: Green → Yellow → Red as deadline approaches

**States**:
- Normal (>24h): Green
- Warning (24h-1h): Yellow
- Urgent (<1h): Red, pulsing

---

### Component 5: Points Breakdown Card

**Props**:
```typescript
interface PointsBreakdownCardProps {
  type: 'score' | 'player';
  prediction?: {
    home: number;
    away: number;
  };
  actual?: {
    home: number;
    away: number;
  };
  player?: {
    name: string;
    photo?: string;
    fplPoints: number;
  };
  points: number;
  breakdown?: {
    homeGoals: number;
    awayGoals: number;
    result: number;
    exactScore: number;
  };
}
```

**Design**:
```
┌─────────────────────────────┐
│ Arsenal 2-1 Liverpool       │
│ Predicted: 2-1              │
│ Actual: 2-1 ✓              │
│                             │
│ Breakdown:                  │
│ Home goals: 3 pts           │
│ Away goals: 3 pts           │
│ Result: 2 pts               │
│ Exact score: 4 pts          │
│                             │
│ Total: 12 points            │
└─────────────────────────────┘
```

**Styling**:
- Card: Glass morphism
- Correct: Green checkmark
- Incorrect: Red X
- Breakdown: Expandable details

---

### Component 6: Leaderboard Row

**Props**:
```typescript
interface LeaderboardRowProps {
  rank: number;
  user: {
    name: string;
    avatar?: string;
  };
  points: number;
  movement?: number; // Positive = up, negative = down
  isCurrentUser?: boolean;
}
```

**Design**:
```
#3  [Avatar] User Name  42 pts  ↑5
```

**Styling**:
- Rank: Large, bold
- Avatar: Circular, 32x32px
- Points: Right-aligned
- Movement: Arrow + number, color-coded
- Current user: Highlighted background

**States**:
- Default: White background
- Current user: Green tint
- Top 3: Special styling (gold/silver/bronze)

---

### Component 7: League Card

**Props**:
```typescript
interface LeagueCardProps {
  league: {
    id: number;
    name: string;
    memberCount: number;
    yourRank: number;
    type: 'weekly' | 'seasonal' | 'both';
  };
  onClick: () => void;
}
```

**Design**:
```
┌─────────────────────────────┐
│ League Name                 │
│ 12 members | Your rank: #3  │
│ Weekly + Seasonal           │
│ [View League]               │
└─────────────────────────────┘
```

**Styling**:
- Card: Glass morphism, rounded
- Hover: Scale 1.02, glow
- Type badges: Color-coded

---

### Component 8: Stat Card

**Props**:
```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  comparison?: string; // "vs. average"
}
```

**Design**:
```
┌─────────────────────────────┐
│ Total Points                │
│ 420                         │
│ ↑ 5% vs. average            │
└─────────────────────────────┘
```

**Styling**:
- Value: Large, bold, prominent
- Label: Smaller, muted
- Trend: Arrow + color (green up, red down)

---

### Component 9: Chart Component

**Props**:
```typescript
interface ChartComponentProps {
  type: 'line' | 'bar';
  data: Array<{ x: string | number; y: number }>;
  xLabel?: string;
  yLabel?: string;
  title?: string;
}
```

**Design**:
- Line chart: For trends over time
- Bar chart: For comparisons
- Interactive: Tooltips on hover/tap
- Responsive: Adapts to screen size

**Libraries**: Chart.js or Recharts (React)

---

### Component 10: Invite Code Display

**Props**:
```typescript
interface InviteCodeDisplayProps {
  code: string;
  leagueName: string;
  onCopy: () => void;
  onShare: () => void;
}
```

**Design**:
```
┌─────────────────────────────┐
│ League: League Name          │
│                             │
│ Code: ABC123                 │
│ [Copy] [Share Link]          │
│                             │
│ [QR Code] (optional)        │
└─────────────────────────────┘
```

**Styling**:
- Code: Large, monospace font
- Copy button: Primary CTA
- Share: Secondary button
- Feedback: "Copied!" message

**States**:
- Default: Code visible
- Copied: "Copied!" message, checkmark

---

## Responsive Design

### Mobile (320px - 767px)
- Single column layouts
- Bottom navigation
- Touch-optimized (44x44pt targets)
- Stacked cards
- Simplified charts

### Tablet (768px - 1023px)
- 2-column grids where appropriate
- Larger touch targets
- More content visible

### Desktop (1024px+)
- Multi-column layouts
- Tables for leaderboards
- Hover states
- More information density
- Side-by-side comparisons

---

## Color & Typography

### Colors
- Primary: `var(--pl-green)` - CTAs, success
- Secondary: `var(--pl-cyan)` - Secondary actions
- Accent: `var(--pl-pink)` - Highlights, warnings
- Tertiary: `var(--pl-purple)` - Premium features

### Typography
- Headings: Bold, large
- Body: Regular, readable
- Numbers: Monospace for scores
- Labels: Small, muted

---

## Interaction States

### Buttons
- Default: Base color
- Hover: Lighter, scale 1.02
- Active: Darker, scale 0.98
- Disabled: Opacity 0.5

### Cards
- Default: Glass morphism
- Hover: Scale 1.02, glow
- Selected: Green border, checkmark
- Disabled: Grayed out

---

**Design Specification Complete** ✅  
**Ready for Developer Implementation** 🚀


