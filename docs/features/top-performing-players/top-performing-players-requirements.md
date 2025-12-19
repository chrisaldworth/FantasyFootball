# Top Performing Players - Requirements
**Date**: 2025-12-19  
**Priority**: P1 (High)  
**Status**: Requirements Phase  
**Feature**: Top Performing Players Display

---

## Executive Summary

**User Request**: Show favorite team's top 3 performing players on the dashboard with key stats (goals, assists, ratings, appearances).

**Current State**: No display of favorite team's top performers on dashboard.

**Solution**: Add a "Top Performing Players" section showing the top 3 players with their key statistics, photos, and performance indicators.

---

## Problem Statement

### Current State
- No way to quickly see favorite team's top performers
- Users have to navigate to team pages to see player stats
- No quick overview of who's performing well

### User Need
- Quick view of favorite team's best players
- Key stats at a glance (goals, assists, ratings)
- Visual display with player photos
- Clear ranking (#1, #2, #3)

---

## Goals & Objectives

### Primary Goals
1. **Quick Overview**: Show top 3 performers at a glance
2. **Key Stats**: Display goals, assists, ratings, appearances
3. **Visual Appeal**: Player photos and clear ranking
4. **Engagement**: Help users stay connected to their favorite team

### Success Metrics
- Users can quickly identify top performers
- Stats are clear and scannable
- Visual design is engaging
- Section is used regularly

---

## User Story

### Story: Top Performing Players
**As a** football fan  
**I want** to see my favorite team's top 3 performing players with their stats  
**So that** I can quickly see who's performing well for my team

**Acceptance Criteria**:
- Shows top 3 performing players from favorite team
- Displays key stats: goals, assists, ratings, appearances
- Shows player photos
- Shows player names and positions
- Visual indicators (top scorer badge, top assister badge, etc.)
- Clear indication these are favorite team players
- Links to full player stats (optional)

---

## Functional Requirements

### FR1: Top 3 Players Display
**Priority**: P1 (High)

**Description**: Display top 3 performing players from favorite team

**Components**:
1. **Player Cards** (3 cards)
   - Player photo (large, prominent)
   - Player name
   - Position
   - Ranking indicator (#1, #2, #3)
   - Key stats:
     - Goals (season total)
     - Assists (season total)
     - Rating (average rating)
     - Appearances
     - Minutes (optional)
   - Performance badges
   - Form indicator

2. **Section Header**
   - "Top Performers" or "My Team's Top Players"
   - Season indicator

3. **Ranking Display**
   - #1, #2, #3 indicators
   - Visual hierarchy (#1 more prominent)

**Layout**: 
- Desktop: 3 cards in horizontal row
- Mobile: Stacked vertically

**Data Sources**:
- `footballApi.getTeamPlayers(teamId)` - Get team players
- `footballApi.getPlayerStats(playerId)` - Get player stats
- Or use FPL API: Filter by `player.team === user.favorite_team_id`

**Ranking Logic**:
1. Primary: Goals scored (highest first)
2. Secondary: Assists (if goals equal)
3. Tertiary: Average rating (if goals and assists equal)
4. Alternative: Combined score (goals × 2 + assists × 1.5 + rating × 0.1)

---

## Technical Requirements

### API Endpoints
- May need: `/football/team-top-players/{team_id}`
- Or calculate from existing player data
- Cache results (stats don't change frequently)

### Data Structure
```typescript
interface TopPlayer {
  id: number;
  name: string;
  position: string;
  photo: string;
  goals: number;
  assists: number;
  rating: number;
  appearances: number;
  minutes: number;
  form: string; // "WWDLW" or similar
  rank: 1 | 2 | 3;
}
```

---

## Design Considerations

### Visual Hierarchy
- #1 player most prominent
- #2 and #3 equal but secondary
- Primary stats (goals, assists) more prominent

### Layout Options
- Horizontal row (desktop)
- Vertical stack (mobile)
- Podium style (optional)

### Stats Display
- All visible or primary/secondary
- Clear, scannable numbers
- Icons for goals/assists

---

## Acceptance Criteria

### Must Have (P1)
- [ ] Top 3 players displayed
- [ ] Player photos shown
- [ ] Key stats visible (goals, assists, ratings)
- [ ] Ranking indicators (#1, #2, #3)
- [ ] Responsive design
- [ ] Clear indication these are favorite team players

### Should Have (P2)
- [ ] Performance badges
- [ ] Form indicators
- [ ] Clickable cards (link to full stats)
- [ ] Visual hierarchy (#1 highlighted)

---

## Out of Scope

- Full player detail pages (link only)
- More than 3 players (top 3 only)
- Historical comparisons
- FPL player stats (favorite team only)

---

## Next Steps

1. **UI Designer**: Create design specifications
2. **Developer**: Implement based on design specs
3. **Tester**: Test against acceptance criteria

---

**Document Status**: ✅ Requirements Complete  
**Next**: Hand off to UI Designer Agent

