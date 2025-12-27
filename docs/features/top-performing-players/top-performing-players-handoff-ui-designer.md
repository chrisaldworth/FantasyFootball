# Top Performing Players - Handoff to UI Designer
**Date**: 2025-12-19  
**From**: Product and Project Manager Agent  
**To**: UI Designer Agent  
**Status**: Ready for Design

---

## Overview

Add a "Top Performing Players" section to the dashboard that displays the favorite team's top 3 performing players with key stats (goals, assists, ratings, appearances). This should be visually engaging and help users quickly see who's performing well for their favorite team.

---

## Requirements Document

**Full Requirements**: This feature is part of Dashboard Improvements  
**Reference**: `docs/features/dashboard-improvements/dashboard-improvements-requirements.md` (Story 2b, FR2b)

---

## Key Design Requirements

### Feature: Top 3 Performing Players Display

**Location**: Dashboard, below head-to-head section or in "My Team" section

**Priority**: P1 (High)

---

## Functional Requirements

### 1. Section Header
- **Title**: "Top Performers" or "My Team's Top Players"
- **Subtitle**: Season/current period indicator (e.g., "2024/25 Season")
- **Clear indication**: These are favorite team players (not FPL players)

### 2. Top 3 Players Display
Each player card should show:

**Required Elements**:
- **Player Photo**: Large, prominent photo (if available)
- **Player Name**: Full name or display name
- **Position**: Player position (GK, DEF, MID, FWD)
- **Ranking Indicator**: #1, #2, #3 badge or number

**Key Stats** (all visible or primary/secondary):
- **Goals**: Season total goals scored
- **Assists**: Season total assists
- **Rating**: Average rating (if available)
- **Appearances**: Number of appearances/matches played
- **Minutes**: Minutes played (optional)

**Performance Badges**:
- Top scorer badge/icon (if #1 in goals)
- Top assister badge/icon (if #1 in assists)
- High rating indicator (if rating > threshold)

**Additional Elements**:
- Form indicator (last 5 matches - W/D/L or form bar)
- Recent performance highlight (optional)

### 3. Ranking Display
- **Visual Hierarchy**: #1 player slightly larger or highlighted
- **Ranking Indicators**: Clear #1, #2, #3 badges
- **Optional**: Gold/silver/bronze color scheme
- **Comparison**: Visual comparison between players (optional)

### 4. Layout Options

**Desktop**:
- 3 cards in a horizontal row
- Equal width or #1 slightly larger
- Side-by-side comparison

**Tablet**:
- 3 cards in a row (may need to be smaller)
- Or 2+1 layout

**Mobile**:
- Stacked vertically
- Full width cards
- Scrollable if needed

---

## Design Principles

### Visual Hierarchy
1. **#1 Player**: Most prominent (larger, highlighted, or special styling)
2. **#2 & #3 Players**: Equal prominence but secondary to #1
3. **Stats**: Primary stats (goals, assists) more prominent than secondary

### Information Architecture
- **Primary Info**: Player photo, name, position, ranking
- **Key Stats**: Goals, assists (most important)
- **Secondary Stats**: Rating, appearances, minutes
- **Context**: Form indicator, performance badges

### Visual Design
- **Player Photos**: Large, prominent, high quality
- **Stats Display**: Clear, scannable numbers
- **Badges**: Distinctive but not overwhelming
- **Colors**: Use app color scheme, optional gold/silver/bronze for rankings

---

## Design Questions to Consider

1. **Card Style**: 
   - Simple cards with photo and stats?
   - Podium style (tiered heights)?
   - Medal/podium visual?

2. **Stats Display**:
   - All stats visible at once?
   - Primary stats prominent, secondary on hover/expand?
   - Tabs/filters for different stat types?

3. **Ranking Visual**:
   - How to indicate #1, #2, #3? (Badges, numbers, colors, size?)
   - Should #1 be visually distinct? (Larger, highlighted, special border?)

4. **Player Photos**:
   - What size? (Large thumbnails, medium, small?)
   - Circular or rounded square?
   - Border/ring effects?

5. **Performance Badges**:
   - What style? (Icons, text badges, colored indicators?)
   - Where to place? (Top corner, below photo, next to name?)

6. **Form Indicator**:
   - How to show? (Form bar, W/D/L icons, trend arrow?)
   - Where to place? (Below stats, integrated with card?)

7. **Layout**:
   - Horizontal row or vertical stack?
   - Equal width or #1 larger?
   - Spacing between cards?

8. **Interaction**:
   - Clickable cards? (Link to full player stats?)
   - Hover effects?
   - Expandable details?

---

## Data Requirements

### Stats Needed
- Goals (season total)
- Assists (season total)
- Rating (average rating, if available)
- Appearances (matches played)
- Minutes (optional)
- Form (last 5 matches - W/D/L)

### Ranking Logic
1. **Primary**: Goals scored (highest first)
2. **Secondary**: Assists (if goals equal)
3. **Tertiary**: Average rating (if goals and assists equal)
4. **Alternative**: Combined score (goals × 2 + assists × 1.5 + rating × 0.1)

### Data Sources
- `footballApi.getTeamPlayers(teamId)` - Get team players
- `footballApi.getPlayerStats(playerId)` - Get player stats
- Or use FPL API: Filter by `player.team === user.favorite_team_id`
- May need new endpoint: `/football/team-top-players/{team_id}`

---

## Responsive Design Requirements

### Desktop (> 1024px)
- 3 cards in horizontal row
- Large player photos (120-150px)
- All stats visible
- Hover effects for interaction

### Tablet (768px - 1024px)
- 3 cards in row (may be smaller)
- Medium player photos (100-120px)
- Primary stats visible, secondary on expand

### Mobile (< 768px)
- Stacked vertically
- Full width cards
- Large touch targets (44x44px minimum)
- Primary stats visible, scroll for more

---

## Accessibility Requirements

- **WCAG AA Compliance**: All color contrasts meet WCAG AA standards
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Screen Readers**: Proper ARIA labels for player names, stats, rankings
- **Touch Targets**: Minimum 44x44px for all interactive elements
- **Text Sizing**: Minimum 14px for body text on mobile

---

## Design Deliverables

Please create:

1. **Design Specifications Document** (`top-performing-players-design-spec.md`)
   - Complete layout specifications
   - Player card designs
   - Stats display format
   - Ranking visual indicators
   - Performance badge designs
   - Responsive breakpoints
   - Interaction states
   - Accessibility considerations

2. **Visual Mockups** (optional but recommended)
   - Desktop layout (3 cards in row)
   - Tablet layout
   - Mobile layout (stacked)
   - #1 player highlighted version
   - With/without badges
   - Hover/interaction states

3. **Component Specifications**
   - Player card component design
   - Stats display component
   - Ranking badge component
   - Performance badge component
   - Form indicator component

---

## Integration Points

### Where It Fits
- **Location**: Dashboard, below head-to-head section or in "My Team" section
- **Context**: Part of favorite team information
- **Relationship**: Complements head-to-head stats and opponent form

### Related Components
- Head-to-head history section (above or adjacent)
- Opponent form section (above or adjacent)
- Favorite team section (could be part of this)
- Player detail modals (if cards are clickable)

---

## Acceptance Criteria for Design

- [ ] Top 3 players clearly displayed
- [ ] Player photos prominent and high quality
- [ ] Key stats (goals, assists) clearly visible
- [ ] Ranking (#1, #2, #3) clearly indicated
- [ ] Performance badges designed and placed
- [ ] Responsive design for all breakpoints
- [ ] Visual hierarchy (#1 player distinct)
- [ ] Accessibility requirements met
- [ ] Design follows existing app patterns
- [ ] Design specifications document created

---

## Next Steps

1. **Review Requirements**: Read the full requirements in dashboard improvements document
2. **Review Existing Components**: Check existing player card components and design patterns
3. **Create Design Spec**: Design all components and layouts
4. **Create Mockups**: Visual mockups for all breakpoints
5. **Hand off to Developer**: Create handoff document with design specifications

---

**Status**: ✅ Ready for UI Designer  
**Priority**: P1 (High)  
**Estimated Design Time**: 2-3 hours

---

**Handing off to UI Designer Agent. Please activate UI Designer Agent and review `docs/features/top-performing-players/top-performing-players-handoff-ui-designer.md`**



