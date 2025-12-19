# Dashboard Improvements - Requirements
**Date**: 2025-12-19  
**Priority**: P0 (Critical)  
**Status**: Requirements Phase  
**Feature**: Dashboard UI/UX Improvements

---

## Executive Summary

**User Request**: Multiple dashboard improvements to enhance clarity, personalization, and user experience:
1. Header: Change logo to "Fotmate" (site name) and add favorite team dropdown
2. Next Match: Show countdown in minutes with opponent
3. Key Alerts: Clarify FPL injury concerns
4. My Team Injuries: Show favorite team players with injuries and photos
5. Quick Recommendations: Show transfer and captain suggestions in Fantasy Football section
6. Remove team theme color schemes
7. Fix personalized news: Show favorite team news
8. Team news context: Explain why news articles are shown

**Current State**: Dashboard has various issues with clarity, personalization, and missing features.

**Solution**: Comprehensive dashboard improvements focusing on clarity, personalization, and better information display.

---

## Problem Statement

### Current Issues
1. **Header**: Shows "F" logo instead of "Fotmate" site name, no easy way to change favorite team
2. **Next Match**: Doesn't show countdown in minutes or clear opponent
3. **Key Alerts**: Not clear that injuries are FPL-related
4. **My Team Injuries**: Not shown separately, no player photos
5. **Quick Recommendations**: No transfer/captain suggestions visible on dashboard
6. **Team Theme Colors**: User wants removed
7. **Personalized News**: Bug - favorite team news not showing
8. **Team News Context**: No explanation why articles are shown

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

**Acceptance Criteria**:
- Header shows "Fotmate" logo/text instead of "F" logo
- "My favourite team: [Team Name]" displayed
- Dropdown list to select favorite team
- Team selection saves immediately
- Team name updates after selection

### Story 2: Next Match Countdown
**As a** user  
**I want** to see my next team's match countdown in minutes with the opponent  
**So that** I know exactly when the match is and who they're playing

**Acceptance Criteria**:
- Shows "Your next Team's match is in X minutes against [Opponent]"
- Countdown updates in real-time
- Opponent name clearly displayed
- Match date/time also shown (optional)

### Story 3: FPL Injury Alerts
**As an** FPL manager  
**I want** to see injury concerns for my FPL squad players  
**So that** I know which of my players have injury issues

**Acceptance Criteria**:
- "Key Alerts" section clearly labeled as FPL-related
- Shows "FPL Squad Injury Concerns" or similar
- Lists injured players from user's FPL squad
- Shows player names and injury status
- Links to transfer assistant

### Story 4: Favorite Team Injury Alerts
**As a** football fan  
**I want** to see injury concerns for my favorite team players with photos  
**So that** I know which players from my team are injured

**Acceptance Criteria**:
- "My Team Injury Concerns" section separate from FPL alerts
- Lists injured players from favorite team
- Shows player photos (if available)
- Shows player names, positions, injury status
- Clear indication these are favorite team players

### Story 5: Quick Recommendations
**As an** FPL manager  
**I want** to see quick transfer and captain recommendations on the dashboard  
**So that** I can quickly see suggested actions

**Acceptance Criteria**:
- "Quick Recommendations" section in Fantasy Football area
- Shows top transfer suggestion (player in, player out, reason)
- Shows captain recommendation (player, reason)
- Quick action buttons to implement
- Links to full transfer assistant/captain pick

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

**Acceptance Criteria**:
- Personalized news section shows favorite team news
- News articles about favorite team displayed
- News about FPL squad players displayed
- No duplicate news items
- News updates regularly

### Story 8: News Context
**As a** user  
**I want** to know why a news article is being shown to me  
**So that** I understand the relevance

**Acceptance Criteria**:
- Each news article shows context badge/tag
- Context explains: "Your favorite team", "Your FPL player", "Trending", etc.
- Context visible on news card
- Clear visual indicator

---

## Functional Requirements

### FR1: Header Branding & Team Selection
**Priority**: P0 (Critical)

**Description**: Update header to show site name and favorite team dropdown

**Components**:
1. **Site Name/Logo**
   - Replace "F" logo with "Fotmate" logo (when available) or "Fotmate" text
   - Use Fotmate logo (to be designed)
   - Prominent site branding

2. **Favorite Team Display**
   - "My favourite team: [Team Name]"
   - Team name clickable/editable
   - Dropdown to select team

3. **Team Selection Dropdown**
   - List of all Premier League teams
   - Team logos/icons in dropdown
   - Search/filter functionality (optional)
   - Save on selection
   - Update immediately

**Layout**: Header with site name on left, favorite team selector on right (or below on mobile)

**Data Sources**:
- `authApi.updateFavoriteTeamId(teamId)` - Update favorite team
- `footballApi.getTeams()` - Get team list
- User's current `favorite_team_id`

---

### FR2: Next Match Countdown
**Priority**: P0 (Critical)

**Description**: Show countdown to next favorite team match in minutes

**Components**:
1. **Countdown Display**
   - "Your next Team's match is in X minutes against [Opponent]"
   - Real-time countdown (updates every minute)
   - Match date/time also shown
   - Match venue (optional)

2. **Opponent Display**
   - Opponent team name clearly shown
   - Home/Away indicator
   - Opponent logo (optional)

3. **Match Link**
   - Link to full match details
   - Link to fixture page

**Layout**: Prominent card/section in hero area or top of dashboard

**Data Sources**:
- `footballApi.getUpcomingFixtures()` - Get upcoming fixtures
- Filter by `user.favorite_team_id`
- Calculate time difference

---

### FR3: FPL Injury Alerts
**Priority**: P0 (Critical)

**Description**: Clearly show FPL squad injury concerns

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
**Priority**: P0 (Critical)

**Description**: Show favorite team player injuries with photos

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
**Priority**: P0 (Critical)

**Description**: Show transfer and captain recommendations in Fantasy Football section

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
**Priority**: P0 (Critical)

**Description**: Remove team theme color schemes from UI

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
**Priority**: P0 (Critical)

**Description**: Fix bug where favorite team news doesn't show in personalized news

**Current Issue**: Personalized news section never shows team news for favorite team

**Fix Required**:
1. **Check News Service**
   - Review `news_service.py` logic
   - Ensure favorite team news is included
   - Check filtering logic

2. **Update News API**
   - Ensure `/football/personalized-news` includes favorite team
   - Check `get_fpl_player_news` function
   - Add favorite team news to response

3. **Frontend Display**
   - Ensure personalized news displays favorite team news
   - Check filtering/display logic
   - Verify API calls

**Data Sources**:
- `footballApi.getPersonalizedNews()` - Get personalized news
- Should include: FPL squad player news + favorite team news

**Implementation**:
- Review and fix backend news service
- Update API endpoint if needed
- Test frontend display

---

### FR8: News Context
**Priority**: P1 (High)

**Description**: Show why each news article is being displayed

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

### Must Have (P0)
- [ ] Header shows "Fotmate" logo/text instead of "F" logo
- [ ] Favorite team dropdown works and saves
- [ ] Next match countdown shows minutes and opponent
- [ ] FPL injury alerts clearly labeled
- [ ] Favorite team injuries shown with photos
- [ ] Quick recommendations visible in Fantasy Football section
- [ ] Team theme colors removed
- [ ] Personalized news shows favorite team news
- [ ] News context badges displayed

### Should Have (P1)
- [ ] Team logos in dropdown
- [ ] Match venue in countdown
- [ ] Player photos in FPL alerts (optional)
- [ ] Multiple recommendation options
- [ ] News context icons

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

