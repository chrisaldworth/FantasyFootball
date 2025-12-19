# Fantasy Football Overview Page - Requirements
**Date**: 2025-12-19  
**Priority**: P0 (Critical)  
**Status**: Requirements Phase  
**Feature**: Fantasy Football Overview Page

---

## Executive Summary

**User Request**: Create a comprehensive Fantasy Football overview page that gives users a big overview of everything they need to know about their FPL team.

**Current State**: The Fantasy Football overview page (`/fantasy-football`) exists but only shows "Fantasy Football overview coming soon..."

**Solution**: Build a comprehensive overview page that displays:
- Key metrics and rankings
- Recent performance trends
- Action items and alerts
- Quick access to key features
- League standings summary
- Squad status and value
- Upcoming deadlines and decisions

---

## Problem Statement

### Current State
- Fantasy Football overview page is a placeholder
- Users have to navigate to multiple pages to get a complete picture of their FPL team
- No single place to see "what do I need to know about my FPL team right now?"
- Dashboard mixes FPL and favorite team content, making it hard to focus on FPL

### User Need
- **Single Source of Truth**: One page that shows everything important about their FPL team
- **At-a-Glance Information**: Key metrics, rankings, and status visible immediately
- **Action-Oriented**: Clear indication of what needs attention (transfers, captain, injuries, etc.)
- **Quick Navigation**: Easy access to detailed pages (squad, transfers, captain, analytics, leagues, news)
- **Context-Aware**: Shows relevant information based on gameweek status (before deadline, during gameweek, after deadline)

---

## Goals & Objectives

### Primary Goals
1. **Comprehensive Overview**: Show all key FPL information in one place
2. **Actionable Insights**: Highlight what users need to do (transfers, captain pick, etc.)
3. **Performance Tracking**: Show recent performance and trends
4. **Quick Access**: Easy navigation to detailed features
5. **Context-Aware**: Adapt content based on gameweek status

### Success Metrics
- **Completeness**: Users can see all key FPL information without navigating away
- **Action Clarity**: Users immediately know what actions they need to take
- **Time to Insight**: Users can understand their FPL status in < 10 seconds
- **Engagement**: Users visit overview page regularly (daily during active gameweeks)

---

## User Stories

### Story 1: Key Metrics at a Glance
**As an** FPL manager  
**I want** to see my key metrics (points, rank, gameweek performance) immediately  
**So that** I can quickly assess my team's status

**Acceptance Criteria**:
- Overall points and rank displayed prominently
- Current gameweek points and rank displayed
- Rank change indicators (up/down arrows with change)
- Squad value and bank balance visible
- Transfers remaining for the gameweek

### Story 2: Action Items and Alerts
**As an** FPL manager  
**I want** to see what actions I need to take (transfers, captain pick, injuries)  
**So that** I don't miss important deadlines or opportunities

**Acceptance Criteria**:
- Alert section showing:
  - Players with injuries or doubts
  - Players not starting
  - Transfer recommendations
  - Captain not set (if deadline approaching)
  - Chips available to use
- Countdown to next deadline (if applicable)
- Priority indicators (urgent, important, informational)

### Story 3: Recent Performance
**As an** FPL manager  
**I want** to see my recent gameweek performance and trends  
**So that** I can understand if my team is improving or declining

**Acceptance Criteria**:
- Last 5-6 gameweeks performance chart
- Points trend (increasing/decreasing)
- Rank trend (improving/declining)
- Average points per gameweek
- Best/worst gameweek highlighted

### Story 4: League Standings Summary
**As an** FPL manager  
**I want** to see my position in key leagues at a glance  
**So that** I know how I'm performing compared to others

**Acceptance Criteria**:
- Top 3-5 leagues displayed (classic and h2h)
- Rank in each league
- Rank change indicators
- Quick link to full leagues page
- Overall rank prominently displayed

### Story 5: Squad Status
**As an** FPL manager  
**I want** to see my squad status (value, formation, key players)  
**So that** I can quickly assess my team composition

**Acceptance Criteria**:
- Squad value (current vs purchased)
- Formation display
- Key players summary (top scorers, captain, vice-captain)
- Bench players visible
- Quick link to full squad page

### Story 6: Quick Actions
**As an** FPL manager  
**I want** quick access to key features from the overview  
**So that** I can take actions without navigating through menus

**Acceptance Criteria**:
- Quick action buttons/links:
  - Make Transfers
  - Pick Captain
  - View Squad
  - View Analytics
  - View Leagues
  - View News
- Context-aware actions (e.g., "Set Captain" if not set)

### Story 7: Context-Aware Content
**As an** FPL manager  
**I want** the overview to show relevant information based on gameweek status  
**So that** I see what's most important right now

**Acceptance Criteria**:
- **Before Deadline**: Show countdown, transfer recommendations, captain pick reminder
- **During Gameweek**: Show live points, player performance, rank changes
- **After Deadline**: Show final points, rank, what went well/badly
- **Between Gameweeks**: Show upcoming fixtures, transfer planning, chip strategy

---

## Functional Requirements

### FR1: Hero Section - Key Metrics
**Priority**: P0 (Critical)

**Description**: Display the most important FPL metrics prominently at the top

**Components**:
1. **Overall Rank Card**
   - Overall rank (formatted: #123,456)
   - Overall points
   - Rank change indicator (up/down with number)
   - Visual indicator (green for good, red for bad)

2. **Current Gameweek Card**
   - Gameweek number
   - Gameweek points
   - Gameweek rank
   - Rank change indicator
   - Status (Live, Finished, Upcoming)

3. **Squad Value Card**
   - Current squad value (£XXX.Xm)
   - Purchased value (£XXX.Xm)
   - Value change (+£X.Xm or -£X.Xm)
   - Bank balance (£X.Xm)

4. **Transfers Card**
   - Transfers remaining this gameweek
   - Transfer cost (if any)
   - Free transfers available
   - Chip status (if active)

**Layout**: 4-column grid on desktop, 2x2 grid on tablet, stacked on mobile

**Data Sources**:
- `fplApi.getMyTeam()` - Team data
- `fplApi.getMyHistory()` - History data
- `fplApi.getMyPicks(gameweek)` - Current gameweek picks

---

### FR2: Action Items & Alerts Section
**Priority**: P0 (Critical)

**Description**: Show what users need to do or be aware of

**Alert Types**:
1. **Injury Alerts** (High Priority)
   - Players with injuries or doubts
   - Chance of playing < 75%
   - Red/yellow indicators
   - Link to transfer assistant

2. **Transfer Recommendations** (Medium Priority)
   - Players not starting
   - Price changes (risers/fallers in squad)
   - Form recommendations
   - Link to transfer assistant

3. **Captain Reminder** (High Priority - if deadline approaching)
   - Captain not set
   - Countdown to deadline
   - Link to captain pick

4. **Chip Availability** (Low Priority)
   - Chips available to use
   - Recommendations on when to use
   - Link to chip activation

5. **Deadline Countdown** (High Priority - if deadline approaching)
   - Time until next deadline
   - Visual countdown timer
   - What needs to be done before deadline

**Layout**: Collapsible section with priority-based ordering
- High priority alerts at top (red/orange)
- Medium priority in middle (yellow)
- Low priority at bottom (blue/info)

**Data Sources**:
- `fplApi.getBootstrap()` - Player data (injuries, news)
- `fplApi.getMyPicks(gameweek)` - Current squad
- `fplApi.getMyTeam()` - Team status

---

### FR3: Recent Performance Section
**Priority**: P1 (High)

**Description**: Show recent gameweek performance and trends

**Components**:
1. **Performance Chart**
   - Last 5-6 gameweeks
   - Points per gameweek (line chart)
   - Rank per gameweek (line chart)
   - Visual indicators for best/worst gameweek

2. **Performance Summary**
   - Average points per gameweek
   - Best gameweek (points and rank)
   - Worst gameweek (points and rank)
   - Trend indicator (improving/declining)

3. **Quick Stats**
   - Total transfers made
   - Total transfer cost
   - Chips used
   - Points on bench (total)

**Layout**: Chart on left, summary cards on right (desktop), stacked (mobile)

**Data Sources**:
- `fplApi.getMyHistory()` - History data

---

### FR4: League Standings Summary
**Priority**: P1 (High)

**Description**: Show position in key leagues

**Components**:
1. **Overall Rank** (Prominent)
   - Overall rank (#123,456)
   - Total players
   - Percentile

2. **Key Leagues** (Top 3-5)
   - League name
   - Rank in league
   - Rank change (up/down)
   - Total teams in league
   - Quick link to league page

3. **League Types**
   - Classic leagues
   - Head-to-head leagues
   - Cup status (if applicable)

**Layout**: Overall rank card + league cards in grid

**Data Sources**:
- `fplApi.getMyTeam()` - League data
- `fplApi.getLeague(leagueId)` - Detailed league data (optional)

---

### FR5: Squad Status Section
**Priority**: P1 (High)

**Description**: Show current squad composition and status

**Components**:
1. **Squad Summary**
   - Formation (e.g., "4-4-2")
   - Total players (15)
   - Starting XI players
   - Bench players

2. **Key Players**
   - Captain (name, points, multiplier)
   - Vice-captain (name, points)
   - Top scorer this gameweek
   - Top scorer overall

3. **Squad Value**
   - Current value
   - Purchased value
   - Value change
   - Bank balance

4. **Quick Squad View**
   - Mini pitch view (optional)
   - Or player list with key stats

**Layout**: Summary cards + key players + value info

**Data Sources**:
- `fplApi.getMyPicks(gameweek)` - Current picks
- `fplApi.getBootstrap()` - Player data
- `fplApi.getLiveGameweek(gameweek)` - Live stats (if available)

---

### FR6: Quick Actions Section
**Priority**: P1 (High)

**Description**: Quick access to key features

**Actions**:
1. **Make Transfers** - Link to transfers page
2. **Pick Captain** - Link to captain page
3. **View Squad** - Link to squad page
4. **View Analytics** - Link to analytics page
5. **View Leagues** - Link to leagues page
6. **View News** - Link to news page

**Layout**: Button grid (3x2 on desktop, 2x3 on mobile)

**Context-Aware**:
- Highlight actions that need attention (e.g., "Set Captain" if not set)
- Show countdown for time-sensitive actions

---

### FR7: Context-Aware Content
**Priority**: P1 (High)

**Description**: Show relevant content based on gameweek status

**Contexts**:
1. **Before Deadline** (Deadline countdown active)
   - Countdown timer
   - Transfer recommendations
   - Captain pick reminder
   - Chip recommendations

2. **During Gameweek** (Gameweek in progress)
   - Live points
   - Player performance (live)
   - Rank changes (live)
   - Next fixture info

3. **After Deadline** (Gameweek finished)
   - Final points
   - Final rank
   - What went well/badly
   - Transfer planning for next gameweek

4. **Between Gameweeks** (No active gameweek)
   - Upcoming fixtures
   - Transfer planning
   - Chip strategy
   - Price change monitoring

**Implementation**: Conditional rendering based on gameweek status

**Data Sources**:
- `fplApi.getBootstrap()` - Events (gameweek status)
- `fplApi.getFixtures()` - Upcoming fixtures
- `fplApi.getLiveGameweek(gameweek)` - Live data (if available)

---

## Technical Requirements

### Data Requirements
- **Team Data**: Overall points, rank, gameweek points, squad value, bank balance
- **History Data**: Last 5-6 gameweeks performance
- **Picks Data**: Current gameweek squad, captain, vice-captain
- **Bootstrap Data**: Players, teams, events (for gameweek status)
- **Live Data**: Current gameweek live points (if available)
- **League Data**: League standings and ranks

### API Endpoints
- `GET /api/fpl/my-team` - Team data
- `GET /api/fpl/my-team/history` - History data
- `GET /api/fpl/my-team/picks/{gameweek}` - Current picks
- `GET /api/fpl/bootstrap` - Bootstrap data
- `GET /api/fpl/live/{gameweek}` - Live data (if available)
- `GET /api/fpl/league/{leagueId}` - League data (optional)

### Performance Requirements
- **Load Time**: Page should load in < 2 seconds
- **Data Fetching**: Parallel API calls where possible
- **Caching**: Cache bootstrap data (changes infrequently)
- **Error Handling**: Graceful degradation if some data fails to load

### Responsive Design
- **Desktop**: Full layout with all sections visible
- **Tablet**: 2-column layouts where appropriate
- **Mobile**: Stacked layout, collapsible sections

---

## Design Considerations

### Visual Hierarchy
1. **Hero Section** - Most important metrics (rank, points)
2. **Action Items** - What needs attention (alerts, countdown)
3. **Performance** - Recent trends and stats
4. **Leagues** - League standings
5. **Squad** - Team composition
6. **Quick Actions** - Navigation to detailed pages

### Color Coding
- **Green**: Positive (rank up, points increase, good performance)
- **Red**: Negative (rank down, points decrease, alerts)
- **Yellow/Orange**: Warnings (injuries, deadlines approaching)
- **Blue**: Informational (general info, links)

### Icons and Indicators
- Up/down arrows for rank changes
- Alert icons for action items
- Status indicators (live, finished, upcoming)
- Quick action icons

---

## Acceptance Criteria

### Must Have (P0)
- [ ] Hero section with key metrics (rank, points, value, transfers)
- [ ] Action items section with alerts (injuries, captain, deadlines)
- [ ] Recent performance section (last 5-6 gameweeks)
- [ ] League standings summary (top 3-5 leagues)
- [ ] Quick actions section (links to key features)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Error handling (graceful degradation)

### Should Have (P1)
- [ ] Squad status section (formation, key players, value)
- [ ] Context-aware content (before/during/after gameweek)
- [ ] Performance charts (points and rank trends)
- [ ] Deadline countdown timer
- [ ] Chip availability and recommendations

### Nice to Have (P2)
- [ ] Mini pitch view in squad section
- [ ] Transfer recommendations based on form
- [ ] Price change alerts
- [ ] Comparison with previous seasons
- [ ] Achievement badges

---

## Out of Scope

- Detailed player analysis (handled by squad page)
- Detailed transfer recommendations (handled by transfers page)
- Detailed analytics (handled by analytics page)
- Detailed league views (handled by leagues page)
- Making transfers directly from overview (redirects to transfers page)
- Setting captain directly from overview (redirects to captain page)

---

## Dependencies

- FPL API endpoints must be working
- User must have FPL team ID linked
- Bootstrap data must be available
- History data must be available

---

## Success Criteria

1. **Completeness**: Users can see all key FPL information without navigating away
2. **Action Clarity**: Users immediately know what actions they need to take
3. **Time to Insight**: Users can understand their FPL status in < 10 seconds
4. **Engagement**: Users visit overview page regularly (daily during active gameweeks)
5. **User Satisfaction**: Users find the overview page useful and informative

---

## Next Steps

1. **UI Designer**: Create design specifications for the overview page
2. **Developer**: Implement the overview page based on design specs
3. **Tester**: Test the overview page against acceptance criteria

---

**Document Status**: ✅ Requirements Complete  
**Next**: Hand off to UI Designer Agent

