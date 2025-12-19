# Dashboard Improvements - Requirements
**Date**: 2025-12-19  
**Priority**: P0 (Critical)  
**Status**: Requirements Phase  
**Feature**: Dashboard UI/UX Improvements

---

## Executive Summary

**User Request**: Multiple dashboard improvements to enhance clarity, personalization, and user experience.

**Implementation Status**: Many features are already implemented. This document identifies what's done and what still needs work.

**Already Implemented** ✅:
1. TopNavigation with Fotmate logo and favorite team dropdown
2. Match countdown with opponent
3. Head-to-head history and opponent form
4. FPL injury alerts (clearly labeled)
5. Favorite team injury alerts (with photos)
6. Top performing players section
7. Fantasy Football overview page

**Needs Work** ⚠️:
1. Quick Recommendations: Component exists but logic missing (TODO in code)
2. Personalized News: Component exists, needs backend review for favorite team news
3. News Context Badges: Not yet implemented
4. Team Theme Colors: Needs review/removal
5. Navigation Consistency: Audit needed across all pages

**Solution**: Complete remaining features and fix any issues with existing implementations.

---

## Problem Statement

### Current Issues
1. **Quick Recommendations**: Component exists but recommendation logic is missing (TODO comments in code)
2. **Personalized News**: Component exists but favorite team news may not be showing (needs backend review)
3. **News Context Badges**: Not implemented - no explanation why articles are shown
4. **Team Theme Colors**: Needs review to ensure removal
5. **Navigation Consistency**: Some pages may still be missing TopNavigation (needs audit)

### Already Resolved ✅
1. **Header**: ✅ TopNavigation with Fotmate logo and favorite team dropdown implemented
2. **Next Match**: ✅ MatchCountdown component shows countdown and opponent
3. **Key Alerts**: ✅ FPLInjuryAlerts component clearly labeled
4. **My Team Injuries**: ✅ FavoriteTeamInjuryAlerts component with photos implemented
5. **Head-to-Head & Form**: ✅ OpponentFormStats component implemented
6. **Top Performers**: ✅ TopPerformersSection component implemented

### User Need
- Clear site branding ("Football Companion")
- Easy favorite team selection
- Clear countdown to next match
- Separate FPL vs favorite team injury alerts
- Quick recommendations visible
- No team theme colors
- Working personalized news
- Context for news articles

---

## Goals & Objectives

### Primary Goals
1. **Clear Branding**: Site name visible, not just logo
2. **Easy Team Selection**: Dropdown to change favorite team
3. **Better Match Info**: Clear countdown and opponent
4. **Separate Alerts**: FPL vs favorite team injuries clearly separated
5. **Quick Recommendations**: Transfer and captain suggestions visible
6. **Simplified Theming**: Remove team color schemes
7. **Working News**: Fix personalized news bug
8. **News Context**: Explain why articles are shown

### Success Metrics
- Users can easily identify site name
- Users can change favorite team in < 2 clicks
- Match countdown is clear and accurate
- Injury alerts are clearly categorized
- Recommendations are visible and actionable
- No team theme color issues
- Personalized news shows favorite team news
- News context is clear

---

## User Stories

### Story 1: Header Branding & Team Selection
**As a** user  
**I want** to see "Fotmate" as the site name and easily select my favorite team  
**So that** I know what site I'm on and can change my team preference

**Status**: ✅ **ALREADY IMPLEMENTED**
- TopNavigation component uses Fotmate logo
- FavoriteTeamSelector component implemented
- Dropdown to select favorite team works
- Team selection saves immediately

**Acceptance Criteria** (All Met):
- ✅ Header shows "Fotmate" logo
- ✅ Favorite team selector displayed
- ✅ Dropdown list to select favorite team
- ✅ Team selection saves immediately
- ✅ Team name updates after selection

### Story 2: Next Match Countdown
**As a** user  
**I want** to see my next team's match countdown in minutes with the opponent  
**So that** I know exactly when the match is and who they're playing

**Status**: ✅ **ALREADY IMPLEMENTED**
- MatchCountdown component implemented
- Shows countdown in minutes
- Shows opponent (home/away)
- Real-time updates

**Acceptance Criteria** (All Met):
- ✅ Shows countdown to next match
- ✅ Countdown updates in real-time
- ✅ Opponent name clearly displayed
- ✅ Match date/time shown

### Story 2a: Head-to-Head History & Opponent Form
**As a** football fan  
**I want** to see recent results against the next opponent and their current form  
**So that** I can understand the historical context and how they're performing

**Status**: ✅ **ALREADY IMPLEMENTED**
- OpponentFormStats component implemented
- Shows head-to-head history
- Shows opponent form
- Shows league position

**Acceptance Criteria** (All Met):
- ✅ Shows last 3-5 matches against opponent
- ✅ Displays results (W/D/L) and scores
- ✅ Shows opponent's recent form (last 5 matches)
- ✅ Shows opponent's league position
- ✅ Visual indicators (win/loss streaks, form indicators)
- ✅ Clear separation between head-to-head and form stats

### Story 2b: Top Performing Players
**As a** football fan  
**I want** to see my favorite team's top 3 performing players with their stats  
**So that** I can quickly see who's performing well for my team

**Status**: ✅ **ALREADY IMPLEMENTED**
- TopPerformersSection component implemented
- Shows top 3 players with stats
- Player photos displayed

**Acceptance Criteria** (All Met):
- ✅ Shows top 3 performing players from favorite team
- ✅ Displays key stats: goals, assists, ratings, appearances
- ✅ Shows player photos
- ✅ Shows player names and positions
- ✅ Visual indicators (ranking, badges)
- ✅ Clear indication these are favorite team players

### Story 3: FPL Injury Alerts
**As an** FPL manager  
**I want** to see injury concerns for my FPL squad players  
**So that** I know which of my players have injury issues

**Status**: ✅ **ALREADY IMPLEMENTED**
- FPLInjuryAlerts component implemented
- Clearly labeled as FPL-related
- Shows injured players from FPL squad

**Acceptance Criteria** (All Met):
- ✅ "Key Alerts" section clearly labeled as FPL-related
- ✅ Shows "FPL Squad Injury Concerns"
- ✅ Lists injured players from user's FPL squad
- ✅ Shows player names and injury status
- ✅ Links to transfer assistant

### Story 4: Favorite Team Injury Alerts
**As a** football fan  
**I want** to see injury concerns for my favorite team players with photos  
**So that** I know which players from my team are injured

**Status**: ✅ **ALREADY IMPLEMENTED**
- FavoriteTeamInjuryAlerts component implemented
- Shows injured players with photos
- Separate from FPL alerts

**Acceptance Criteria** (All Met):
- ✅ "My Team Injury Concerns" section separate from FPL alerts
- ✅ Lists injured players from favorite team
- ✅ Shows player photos (if available)
- ✅ Shows player names, positions, injury status
- ✅ Clear indication these are favorite team players

### Story 5: Quick Recommendations
**As an** FPL manager  
**I want** to see quick transfer and captain recommendations on the dashboard  
**So that** I can quickly see suggested actions

**Status**: ⚠️ **PARTIALLY IMPLEMENTED**
- QuickRecommendations component exists
- **Missing**: Recommendation logic (TODO comments in code)
- Component shows empty/undefined recommendations

**Acceptance Criteria**:
- ✅ "Quick Recommendations" section in Fantasy Football area
- ❌ Shows top transfer suggestion (logic missing)
- ❌ Shows captain recommendation (logic missing)
- ✅ Quick action buttons to implement (component ready)
- ✅ Links to full transfer assistant/captain pick (component ready)

### Story 6: Remove Team Theme Colors
**As a** user  
**I want** the app to not use team theme color schemes  
**So that** the design is consistent regardless of favorite team

**Acceptance Criteria**:
- Team theme colors removed from UI
- Consistent color scheme throughout app
- No dynamic color changes based on favorite team
- Default app colors used everywhere

### Story 7: Fix Personalized News
**As a** user  
**I want** to see news about my favorite team in the personalized news section  
**So that** I get relevant news about my team

**Status**: ⚠️ **NEEDS REVIEW**
- PersonalizedNewsFeed component exists
- Fetches from `/api/football/personalized-news`
- **Issue**: User reports favorite team news not showing
- **Needs**: Backend API review to ensure favorite team news is included

**Acceptance Criteria**:
- ⚠️ Personalized news section shows favorite team news (needs backend review)
- ✅ News articles about favorite team displayed (if backend provides)
- ✅ News about FPL squad players displayed
- ✅ No duplicate news items
- ✅ News updates regularly

### Story 8: News Context
**As a** user  
**I want** to know why a news article is being shown to me  
**So that** I understand the relevance

**Status**: ❌ **NOT IMPLEMENTED**
- PersonalizedNewsFeed component has context logic in code
- **Missing**: Context badges not displayed in UI
- Context is calculated but not shown to user

**Acceptance Criteria**:
- ❌ Each news article shows context badge/tag (not displayed)
- ✅ Context explains: "Your favorite team", "Your FPL player", "Trending", etc. (logic exists)
- ❌ Context visible on news card (not displayed)
- ❌ Clear visual indicator (not implemented)

---

## Functional Requirements

### FR1: Header Branding & Team Selection
**Priority**: ✅ **COMPLETE**

**Status**: ✅ **ALREADY IMPLEMENTED**
- TopNavigation component uses Fotmate logo
- FavoriteTeamSelector component implemented and working
- Dropdown to select favorite team functional

**Implementation**:
- Component: `frontend/src/components/navigation/TopNavigation.tsx`
- Favorite Team Selector: `frontend/src/components/dashboard/FavoriteTeamSelector.tsx`
- Logo: `frontend/src/components/Logo.tsx` (uses Fotmate logo from `/logo/`)

**No Action Required**: This feature is complete and working.

---

### FR2: Next Match Countdown
**Priority**: ✅ **COMPLETE**

**Status**: ✅ **ALREADY IMPLEMENTED**
- MatchCountdown component fully implemented
- Shows countdown in minutes
- Shows opponent (home/away)
- Real-time updates

**Implementation**:
- Component: `frontend/src/components/dashboard/MatchCountdown.tsx`
- Used on: Dashboard page
- Data: Fetches from `footballApi.getUpcomingFixtures()`

**No Action Required**: This feature is complete and working.

---

### FR2a: Head-to-Head History & Opponent Form
**Priority**: ✅ **COMPLETE**

**Status**: ✅ **ALREADY IMPLEMENTED**
- OpponentFormStats component fully implemented
- Shows head-to-head history (last 3-5 matches)
- Shows opponent form (last 5 matches)
- Shows league position

**Implementation**:
- Component: `frontend/src/components/dashboard/OpponentFormStats.tsx`
- Used on: Dashboard page (below MatchCountdown)
- Data: Fetches from football API

**No Action Required**: This feature is complete and working.

**Components**:
1. **Head-to-Head History Section**
   - Last 3-5 matches between favorite team and opponent
   - Results display:
     - Match date
     - Score (e.g., "2-1", "0-0")
     - Result indicator (W/D/L)
     - Competition (Premier League, Cup, etc.)
     - Home/Away indicator
   - Summary stats:
     - Wins/Draws/Losses count
     - Goals for/against
     - Win percentage

2. **Opponent Form Section**
   - Recent form (last 5 matches)
   - Form indicator (W/D/L for each match)
   - Visual form bar/chart
   - Points earned in last 5 matches
   - Goals scored/conceded in last 5 matches

3. **Opponent League Stats**
   - Current league position
   - Points total
   - Recent league form (last 5 league matches)
   - Home/Away form (if applicable)

4. **Visual Indicators**
   - Color coding (green for wins, red for losses, yellow for draws)
   - Form indicators (streaks, trends)
   - Win/loss streaks
   - Visual comparison (favorite team vs opponent)

**Layout**: Below the countdown, expandable section or always visible
- Head-to-head history on left (or top on mobile)
- Opponent form on right (or bottom on mobile)
- League stats below or integrated

**Data Sources**:
- `footballApi.getHeadToHead(teamId, opponentId)` - Get head-to-head history (may need to create)
- `footballApi.getTeamFixtures(teamId)` - Get recent fixtures, filter for opponent
- `footballApi.getTeamForm(teamId)` - Get team form (may need to create)
- `footballApi.getTeamStandings(teamId)` - Get league position
- Filter fixtures by opponent team ID
- Calculate form from recent results

**Implementation Notes**:
- May need to create new API endpoints:
  - `/football/head-to-head/{team_id}/{opponent_id}` - Head-to-head history
  - `/football/team-form/{team_id}` - Team form (last 5 matches)
- Or calculate from existing fixtures API by filtering
- Cache results for performance (form doesn't change frequently)

**Display Format**:
- **Head-to-Head**: List of recent matches with scores
- **Form**: Visual form bar (W/D/L indicators) or list
- **Stats**: Summary cards with key metrics

---

### FR2b: Top Performing Players
**Priority**: ✅ **COMPLETE**

**Status**: ✅ **ALREADY IMPLEMENTED**
- TopPerformersSection component fully implemented
- Shows top 3 players with goals, assists, ratings, appearances
- Player photos displayed
- Ranking indicators

**Implementation**:
- Component: `frontend/src/components/dashboard/TopPerformersSection.tsx`
- Used on: Dashboard page (in My Team section)
- Data: Fetches from FPL API and football API

**No Action Required**: This feature is complete and working.

**Components**:
1. **Section Header**
   - "Top Performers" or "My Team's Top Players"
   - Clear indication these are favorite team players
   - Season/current period indicator

2. **Top 3 Players Display**
   - Player cards showing:
     - Player photo (large, prominent)
     - Player name
     - Position
     - Key stats:
       - Goals (season total)
       - Assists (season total)
       - Rating (average rating)
       - Appearances
       - Minutes played (optional)
     - Performance badges (top scorer, top assister, etc.)
     - Form indicator (last 5 matches)

3. **Ranking Display**
   - #1, #2, #3 indicators
   - Visual ranking (gold, silver, bronze colors optional)
   - Performance comparison (optional)

4. **Stats Display Options**
   - **Option 1**: All stats visible on card
   - **Option 2**: Primary stat prominent, others on hover/expand
   - **Option 3**: Tabs/filters for different stat types (goals, assists, ratings)

5. **Visual Indicators**
   - Top scorer badge/icon
   - Top assister badge/icon
   - High rating indicator
   - Form trend (improving/declining)
   - Recent performance highlight

**Layout**: Below head-to-head section or in "My Team" section
- 3 cards in a row (desktop)
- Stacked on mobile
- Compact but informative

**Data Sources**:
- `footballApi.getTeamPlayers(teamId)` - Get team players
- `footballApi.getPlayerStats(playerId)` - Get player stats (if available)
- Or use FPL API: Filter by `player.team === user.favorite_team_id`
- Calculate top performers based on:
  - Goals (primary)
  - Assists (secondary)
  - Rating (if available)
  - Combined metric (goals + assists + rating)

**Ranking Logic**:
1. **Primary**: Goals scored (highest first)
2. **Secondary**: Assists (if goals equal)
3. **Tertiary**: Average rating (if goals and assists equal)
4. **Alternative**: Combined score (goals × 2 + assists × 1.5 + rating × 0.1)

**Display Format**:
- **Player Cards**: Large cards with photo, name, position, key stats
- **Stats Layout**: Primary stat prominent, secondary stats visible
- **Visual Hierarchy**: #1 player slightly larger or highlighted

**Implementation Notes**:
- May need to create new API endpoint: `/football/team-top-players/{team_id}`
- Or calculate from existing player data
- Cache results (stats don't change frequently during season)
- Update after each matchday

---

### FR3: FPL Injury Alerts
**Priority**: ✅ **COMPLETE**

**Status**: ✅ **ALREADY IMPLEMENTED**
- FPLInjuryAlerts component fully implemented
- Clearly labeled as FPL-related
- Shows injured players from FPL squad

**Implementation**:
- Component: `frontend/src/components/dashboard/FPLInjuryAlerts.tsx`
- Used on: Dashboard page
- Data: Filters FPL squad players with injuries

**No Action Required**: This feature is complete and working.

**Components**:
1. **Section Header**
   - "FPL Squad Injury Concerns" or "Fantasy Football Injury Alerts"
   - Clear indication these are FPL-related

2. **Injury List**
   - List of injured players from user's FPL squad
   - Player name
   - Injury status/news
   - Chance of playing (if available)
   - Link to transfer assistant

3. **Player Cards**
   - Player name
   - Team
   - Injury status
   - Action button (View Transfer Options)

**Layout**: Alert section clearly labeled as FPL-related

**Data Sources**:
- `fplApi.getMyPicks(gameweek)` - Get user's squad
- `fplApi.getBootstrap()` - Get player injury data
- Filter: `userSquadPlayerIds.includes(p.id) && isInjured(p)`

---

### FR4: Favorite Team Injury Alerts
**Priority**: ✅ **COMPLETE**

**Status**: ✅ **ALREADY IMPLEMENTED**
- FavoriteTeamInjuryAlerts component fully implemented
- Shows injured players from favorite team with photos
- Separate from FPL alerts

**Implementation**:
- Component: `frontend/src/components/dashboard/FavoriteTeamInjuryAlerts.tsx`
- Used on: Dashboard page
- Data: Filters favorite team players with injuries

**No Action Required**: This feature is complete and working.

**Components**:
1. **Section Header**
   - "My Team Injury Concerns" or "Favorite Team Injuries"
   - Clear indication these are favorite team players

2. **Injury List with Photos**
   - List of injured players from favorite team
   - Player photos (if available)
   - Player name
   - Position
   - Injury status/news
   - Chance of playing (if available)

3. **Player Cards**
   - Player photo (large, prominent)
   - Player name
   - Position
   - Injury status
   - Team logo/badge

**Layout**: Separate section from FPL alerts, with player photos

**Data Sources**:
- `footballApi.getTeamPlayers(teamId)` - Get team players
- `footballApi.getPlayerInjuries()` - Get injury data (if available)
- Or use FPL API: Filter by `player.team === user.favorite_team_id && isInjured(p)`
- Player photos from FPL API or Football API

---

### FR5: Quick Recommendations
**Priority**: ⚠️ **NEEDS IMPLEMENTATION**

**Status**: ⚠️ **PARTIALLY IMPLEMENTED**
- QuickRecommendations component exists
- **Missing**: Recommendation logic (TODO comments in code)
- Currently shows `undefined` for recommendations

**Implementation Needed**:
1. Transfer recommendation algorithm or API endpoint
2. Captain recommendation algorithm or API endpoint
3. Connect recommendations to QuickRecommendations component

**Current Code**:
```typescript
<QuickRecommendations
  transferRecommendation={undefined} // TODO: Add transfer recommendation logic
  captainRecommendation={undefined} // TODO: Add captain recommendation logic
/>
```

**Action Required**: Implement recommendation logic or API endpoints.

**Components**:
1. **Transfer Recommendation**
   - Top transfer suggestion
   - "Transfer In: [Player Name]"
   - "Transfer Out: [Player Name]"
   - Reason (form, fixtures, value, etc.)
   - Quick action button

2. **Captain Recommendation**
   - Top captain suggestion
   - "Captain: [Player Name]"
   - Reason (form, fixtures, xG, etc.)
   - Quick action button

3. **Recommendation Cards**
   - Visual cards for each recommendation
   - Player photos (optional)
   - Clear action buttons
   - Links to full assistant

**Layout**: "Quick Recommendations" section in Fantasy Football area

**Data Sources**:
- Transfer recommendation algorithm (existing or new)
- Captain recommendation algorithm (existing or new)
- `fplApi.getBootstrap()` - Player data
- `fplApi.getMyPicks(gameweek)` - Current squad

**Implementation**:
- Use existing transfer assistant logic (simplified)
- Use existing captain pick logic (simplified)
- Or create quick recommendation API endpoint

---

### FR6: Remove Team Theme Colors
**Priority**: ⚠️ **NEEDS REVIEW**

**Status**: ⚠️ **NEEDS VERIFICATION**
- Team theme system exists (`useTeamTheme`)
- **Needs**: Review if still being used, remove if present
- Check: `frontend/src/lib/team-theme-context.tsx`

**Action Required**: 
1. Audit codebase for `useTeamTheme` usage
2. Remove team theme colors if still in use
3. Ensure consistent app color scheme

**Components**:
1. **Remove Theme Context**
   - Remove or disable `TeamThemeProvider`
   - Remove theme-based color changes
   - Use default app colors

2. **Default Colors**
   - Use consistent app color scheme
   - No dynamic color changes
   - Consistent across all users

3. **Color Scheme**
   - Use existing CSS variables
   - Default app colors (green, pink, cyan, purple, etc.)
   - No team-specific colors

**Implementation**:
- Remove `useTeamTheme()` usage (or make it return default)
- Remove theme-based styling
- Use default color scheme throughout

---

### FR7: Fix Personalized News
**Priority**: ⚠️ **NEEDS REVIEW**

**Status**: ⚠️ **NEEDS BACKEND REVIEW**
- PersonalizedNewsFeed component exists and works
- Fetches from `/api/football/personalized-news`
- **Issue**: User reports favorite team news not showing
- **Needs**: Backend API review

**Current Implementation**:
- Component: `frontend/src/components/news/PersonalizedNewsFeed.tsx`
- API: `footballApi.getPersonalizedNews()`
- Backend: `backend/app/api/football.py` - `/football/personalized-news` endpoint

**Action Required**:
1. Review backend API `/football/personalized-news`
2. Verify `favorite_team_news` is included in response
3. Check `news_service.py` logic for favorite team news
4. Test API response includes favorite team news
5. Fix if missing

**Data Sources**:
- `footballApi.getPersonalizedNews()` - Get personalized news
- Should include: FPL squad player news + favorite team news

**Implementation**:
- Review and fix backend news service
- Update API endpoint if needed
- Test frontend display

---

### FR8: News Context
**Priority**: ⚠️ **NEEDS IMPLEMENTATION**

**Status**: ⚠️ **NOT IMPLEMENTED**
- PersonalizedNewsFeed component calculates context
- Context logic exists in code
- **Missing**: Context badges not displayed in UI

**Current Implementation**:
- Component calculates context: 'favorite-team', 'fpl-player', 'trending', 'breaking'
- Context is stored in news items but not displayed

**Action Required**:
1. Update PersonalizedNewsCard component to display context badges
2. Add visual badges/tags showing context
3. Style context badges (color-coded)
4. Ensure context is visible on news cards

**Components**:
1. **Context Badges**
   - Badge/tag on each news card
   - Context text: "Your favorite team", "Your FPL player", "Trending", etc.

2. **Context Types**:
   - "Your favorite team" - News about favorite team
   - "Your FPL player: [Player Name]" - News about FPL squad player
   - "Trending" - Popular news
   - "Breaking" - Breaking news

3. **Visual Indicators**
   - Color-coded badges
   - Icons (optional)
   - Clear text

**Layout**: Context badge visible on news card (top-right or below title)

**Data Sources**:
- News API response should include context
- Or calculate context on frontend based on:
  - Favorite team ID
  - FPL squad player IDs
  - News source/type

---

## Technical Requirements

### API Changes

1. **News API**
   - Fix `/football/personalized-news` to include favorite team news
   - Add context field to news items
   - Update `news_service.py`

2. **Team Selection**
   - `authApi.updateFavoriteTeamId(teamId)` - Already exists
   - `footballApi.getTeams()` - Get team list (may need to add)

3. **Recommendations**
   - May need new endpoint: `/api/fpl/quick-recommendations`
   - Or use existing transfer assistant/captain pick logic

### Frontend Changes

1. **Header Component**
   - Update to show "Football Companion"
   - Add favorite team dropdown
   - Remove team theme usage

2. **Dashboard Components**
   - Update next match countdown display
   - Separate FPL vs favorite team alerts
   - Add quick recommendations section
   - Add news context badges
   - Remove theme color usage

3. **News Components**
   - Fix personalized news display
   - Add context badges
   - Ensure favorite team news shows

---

## Design Considerations

### Header Design
- Site name: "Football Companion" (prominent)
- Favorite team: "My favourite team: [Team Name]" with dropdown
- Clean, simple layout
- Mobile-friendly dropdown

### Countdown Display
- Large, clear countdown
- Opponent name prominent
- Real-time updates
- Visual countdown (optional animation)

### Alert Sections
- Clear separation: FPL vs Favorite Team
- Visual distinction (different colors/borders)
- Player photos in favorite team section
- Action buttons for FPL alerts

### Recommendations
- Visual cards
- Clear player names
- Reason text
- Action buttons
- Links to full assistants

### News Context
- Small badges/tags
- Color-coded
- Clear text
- Non-intrusive

---

## Acceptance Criteria

### Already Complete ✅
- [x] Header shows "Fotmate" logo (TopNavigation component)
- [x] Favorite team dropdown works and saves (FavoriteTeamSelector)
- [x] Next match countdown shows minutes and opponent (MatchCountdown)
- [x] Head-to-head history and opponent form (OpponentFormStats)
- [x] Top 3 performing players (TopPerformersSection)
- [x] FPL injury alerts clearly labeled (FPLInjuryAlerts)
- [x] Favorite team injuries shown with photos (FavoriteTeamInjuryAlerts)

### Still Needs Work ⚠️
- [ ] Quick recommendations logic implemented (component exists, logic missing)
- [ ] Team theme colors removed (needs review)
- [ ] Personalized news shows favorite team news (needs backend review)
- [ ] News context badges displayed (not implemented)

### Should Have (P1)
- [ ] Team logos in dropdown
- [ ] Match venue in countdown
- [ ] Player photos in FPL alerts (optional)
- [ ] Multiple recommendation options
- [ ] News context icons
- [ ] Head-to-head history (last 3-5 matches)
- [ ] Opponent form display (last 5 matches)
- [ ] Opponent league position and stats
- [ ] Visual form indicators
- [ ] Top 3 performing players from favorite team
- [ ] Player stats display (goals, assists, ratings)
- [ ] Player photos in top performers section

---

## Out of Scope

- Full transfer assistant on dashboard (quick recommendation only)
- Full captain pick on dashboard (quick recommendation only)
- News article full content on dashboard (links to full page)
- Team theme color customization (removing, not replacing)

---

## Dependencies

- News API fix (backend)
- Team list API (if not exists)
- Recommendation algorithms (existing or new)
- Player photo APIs (existing)

---

## Success Criteria

1. **Clarity**: Users can easily identify site name and change favorite team
2. **Information**: Match countdown and opponent clearly visible
3. **Separation**: FPL vs favorite team alerts clearly separated
4. **Recommendations**: Quick recommendations visible and actionable
5. **Consistency**: No team theme colors, consistent design
6. **News**: Personalized news works correctly with context

---

## Next Steps

1. **UI Designer**: Create design specifications for all improvements
2. **Developer**: Implement changes based on design specs
3. **Tester**: Test all improvements against acceptance criteria

---

**Document Status**: ✅ Requirements Complete  
**Next**: Hand off to UI Designer Agent

