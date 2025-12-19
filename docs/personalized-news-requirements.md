# Personalized News Feature - Requirements
**Date**: 2025-12-19  
**Priority**: P1 (High)  
**Status**: Requirements Phase

---

## Executive Summary

Users want the news section to be tailored towards:
1. **Their chosen favorite team** (team they're a fan of)
2. **News about their Fantasy Football team** (players in their FPL squad)

Currently, news only shows favorite team news. We need to expand this to include personalized FPL team news based on the players in the user's squad.

---

## Problem Statement

### Current State
- News section only shows news for the user's favorite team
- No news about FPL squad players
- Users miss important news about their fantasy team players (injuries, transfers, form)

### User Need
- See news about favorite team (already working)
- See news about players in their FPL squad
- Combined view of both news types
- Clear distinction between team news and FPL player news

---

## Goals & Objectives

### Primary Goals
1. **Personalized News Feed**: Show news relevant to user's FPL squad players
2. **Combined View**: Display both favorite team news and FPL player news together
3. **Clear Categorization**: Users can distinguish between team news and player news
4. **Relevance**: Only show news about players actually in their squad

### Success Metrics
- **Engagement**: 30% increase in news section views
- **Relevance**: 80% of news items are relevant to user's teams/players
- **User Satisfaction**: 4.5+ star rating for news feature

---

## User Stories

### Story 1: Favorite Team News (Already Implemented)
**As a** football fan  
**I want** to see news about my favorite team  
**So that** I can stay updated on my team's latest developments

**Acceptance Criteria**:
- ✅ News shows for favorite team (already working)
- ✅ News is categorized (transfers, injuries, matches, etc.)
- ✅ News is analyzed and highlighted

### Story 2: FPL Squad Player News (New)
**As an** FPL manager  
**I want** to see news about players in my FPL squad  
**So that** I can make informed decisions about transfers and captaincy

**Acceptance Criteria**:
- News is fetched for all players in user's current FPL squad
- News includes injuries, transfers, form updates
- News is prioritized by importance (injuries > transfers > general)
- News shows player name and their team

### Story 3: Combined News View (New)
**As a** user  
**I want** to see both favorite team news and FPL player news in one place  
**So that** I don't have to check multiple sections

**Acceptance Criteria**:
- News feed shows both types of news
- Clear visual distinction between team news and player news
- Option to filter by type (team only, players only, all)
- News sorted by relevance and recency

---

## Functional Requirements

### FR1: FPL Squad Player News Fetching
**Priority**: P1 (High)

**Description**: Backend should fetch news for all players in user's FPL squad

**Requirements**:
1. Get user's current FPL squad (from FPL API)
2. Extract player names from squad
3. Search RSS feeds for news about those players
4. Match player names in news articles (full name and last name)
5. Categorize news (injuries, transfers, form, etc.)
6. Prioritize by importance (injuries highest priority)

**Technical Notes**:
- Use existing `news_service.py` but extend to support player name matching
- Player names from FPL API: `first_name` + `second_name` (e.g., "Mohamed Salah")
- Search for both full name and last name in news articles
- Cache results to avoid excessive API calls

---

### FR2: Combined News Endpoint
**Priority**: P1 (High)

**Description**: Create API endpoint that returns both favorite team news and FPL player news

**Requirements**:
1. Endpoint: `GET /api/football/personalized-news`
2. Requires authentication (user must be logged in)
3. Returns:
   - Favorite team news (if favorite team selected)
   - FPL squad player news (if FPL team linked)
   - Combined, sorted by relevance and date
   - News type indicator ("team" or "player")
   - Player name for player news

**Response Format**:
```json
{
  "favorite_team_news": {
    "overview": "...",
    "highlights": [...],
    "big_news": [...],
    "categories": {...},
    "total_count": 10
  },
  "fpl_player_news": {
    "overview": "...",
    "highlights": [...],
    "big_news": [...],
    "categories": {...},
    "total_count": 15,
    "players_covered": ["Mohamed Salah", "Erling Haaland", ...]
  },
  "combined_news": [
    {
      "id": "...",
      "title": "...",
      "summary": "...",
      "type": "team" | "player",
      "player_name": "..." (if type is "player"),
      "categories": [...],
      "importance_score": 10,
      "publishedAt": "...",
      "source": "...",
      "url": "..."
    }
  ],
  "total_count": 25
}
```

---

### FR3: News Component Enhancement
**Priority**: P1 (High)

**Description**: Update frontend news component to show both types of news

**Requirements**:
1. Display combined news feed
2. Visual distinction between team news and player news:
   - Badge/icon for news type
   - Different color coding
   - Player name shown for player news
3. Filter options:
   - "All News" (default)
   - "Favorite Team Only"
   - "FPL Players Only"
4. Sort options:
   - "Most Recent" (default)
   - "Most Important"
   - "By Category"

**UI Components Needed**:
- News type badge (Team/Player)
- Player name display for player news
- Filter buttons/tabs
- Sort dropdown

---

### FR4: Player News Matching
**Priority**: P1 (High)

**Description**: Accurately match player names in news articles

**Requirements**:
1. Match full name: "Mohamed Salah" in article
2. Match last name: "Salah" in article (common in news)
3. Handle name variations (e.g., "Mo Salah")
4. Avoid false positives (common names)
5. Prioritize exact matches over partial matches

**Edge Cases**:
- Players with common last names (e.g., "Smith")
- Players with multiple name formats
- Players who recently transferred teams
- Players with special characters in names

---

## Non-Functional Requirements

### NFR1: Performance
- News fetching should complete in < 3 seconds
- Cache news results for 1 hour
- Limit news items to 50 per request

### NFR2: Accuracy
- Player name matching accuracy: > 90%
- False positive rate: < 5%
- News relevance: > 80% of items should be relevant

### NFR3: User Experience
- Loading states for news fetching
- Error handling for failed requests
- Empty states when no news available
- Clear visual distinction between news types

---

## Technical Considerations

### Backend Changes Needed
1. **Extend `news_service.py`**:
   - Add `_is_player_related()` method for player name matching
   - Add `get_player_news()` method
   - Add `get_personalized_news()` method (combines team + player news)

2. **New API Endpoint**:
   - `GET /api/football/personalized-news` (requires auth)
   - Get user's favorite team ID
   - Get user's FPL team ID
   - Fetch team news
   - Fetch FPL squad and player news
   - Combine and return

3. **Player Name Matching**:
   - Use FPL API to get player names
   - Match against news article text
   - Handle name variations

### Frontend Changes Needed
1. **Update `TeamNewsOverview.tsx`**:
   - Add filter options
   - Add news type badges
   - Display player names for player news
   - Handle combined news feed

2. **New API Client Method**:
   - `getPersonalizedNews()` in `api.ts`

3. **UI Enhancements**:
   - News type badges
   - Filter buttons
   - Player name display
   - Sort options

---

## User Experience Flow

### Scenario 1: User with Favorite Team + FPL Team
1. User logs in
2. Dashboard shows personalized news section
3. News feed displays:
   - Favorite team news (with "Team" badge)
   - FPL player news (with "Player" badge + player name)
4. User can filter by type
5. User clicks on news item → opens in new tab

### Scenario 2: User with Only Favorite Team
1. User logs in (no FPL team linked)
2. Dashboard shows favorite team news only
3. Message: "Link your FPL team to see player news"

### Scenario 3: User with Only FPL Team
1. User logs in (no favorite team selected)
2. Dashboard shows FPL player news only
3. Message: "Select a favorite team to see team news"

---

## Design Considerations

### Visual Distinction
- **Team News**: Use team colors/badge
- **Player News**: Use player icon + name
- **Badges**: Clear "Team" vs "Player" labels
- **Color Coding**: Different colors for each type

### Layout
- Combined feed with clear separation
- Filter buttons at top
- Sort dropdown
- News cards show type clearly

### Mobile Considerations
- Filter buttons scrollable on mobile
- News cards stack vertically
- Player names clearly visible
- Touch-friendly filter buttons

---

## Acceptance Criteria

### Backend
- [ ] `get_personalized_news()` method implemented
- [ ] Player name matching works accurately (>90%)
- [ ] API endpoint returns combined news
- [ ] News is categorized and prioritized
- [ ] Performance targets met (< 3s)

### Frontend
- [ ] News component shows both types
- [ ] Visual distinction clear (badges, colors)
- [ ] Filter options work
- [ ] Sort options work
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Empty states shown
- [ ] Mobile responsive

### Integration
- [ ] Works with existing favorite team news
- [ ] Works with existing FPL team data
- [ ] No breaking changes to existing features
- [ ] Backward compatible

---

## Risks & Mitigation

### Risk 1: Player Name Matching Accuracy
**Probability**: Medium  
**Impact**: High  
**Mitigation**:
- Use full name + last name matching
- Test with common player names
- Manual review of false positives
- Iterate on matching algorithm

### Risk 2: Performance Issues
**Probability**: Medium  
**Impact**: Medium  
**Mitigation**:
- Cache news results
- Limit number of players checked
- Async processing
- Rate limiting

### Risk 3: Too Much News
**Probability**: Low  
**Impact**: Low  
**Mitigation**:
- Limit total news items (50 max)
- Prioritize by importance
- Filter options for users
- "Show More" pagination

---

## Dependencies

### Internal
- Existing `news_service.py` (extend, don't replace)
- Existing FPL API integration
- Existing user authentication
- Existing favorite team selection

### External
- RSS feeds (already in use)
- FPL API (already in use)

---

## Implementation Phases

### Phase 1: Backend - Player News Matching
**Priority**: P1  
**Duration**: 1 week

1. Extend `news_service.py` with player matching
2. Add `get_player_news()` method
3. Test player name matching accuracy
4. Create `get_personalized_news()` method

### Phase 2: Backend - API Endpoint
**Priority**: P1  
**Duration**: 1 week

1. Create `/api/football/personalized-news` endpoint
2. Integrate with user authentication
3. Get user's favorite team and FPL team
4. Combine news and return
5. Test endpoint

### Phase 3: Frontend - Component Updates
**Priority**: P1  
**Duration**: 1 week

1. Update `TeamNewsOverview.tsx`
2. Add filter options
3. Add news type badges
4. Add player name display
5. Test UI/UX

### Phase 4: Testing & Polish
**Priority**: P1  
**Duration**: 3 days

1. End-to-end testing
2. Performance testing
3. User acceptance testing
4. Bug fixes
5. Documentation

---

## Next Steps

1. ✅ **Requirements Document Created** - This document
2. ⏳ **Hand off to UI Designer Agent** - Create design specifications
3. ⏳ **Hand off to Developer Agent** - Implement backend and frontend
4. ⏳ **Hand off to Tester Agent** - Test implementation

---

**Document Status**: Ready for Review  
**Priority**: P1 (High)  
**Next Action**: Hand off to UI Designer Agent for design specifications

