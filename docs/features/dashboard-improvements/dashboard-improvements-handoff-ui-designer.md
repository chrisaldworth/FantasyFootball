# Dashboard Improvements - Handoff to UI Designer
**Date**: 2025-12-19  
**From**: Product and Project Manager Agent  
**To**: UI Designer Agent  
**Status**: Ready for Design

---

## Overview

The user has requested multiple dashboard improvements to enhance clarity, personalization, and user experience. These are focused on branding, team selection, match information, alerts, recommendations, and news display.

---

## Requirements Document

**Full Requirements**: [dashboard-improvements-requirements.md](./dashboard-improvements-requirements.md)

Please review the complete requirements document for detailed specifications.

---

## Key Design Requirements

### 1. Header Branding & Team Selection (P0)
- **Site Name**: Replace "F" logo with "Football Companion" text
- **Favorite Team Display**: "My favourite team: [Team Name]"
- **Team Dropdown**: Dropdown to select favorite team
- **Layout**: Site name on left, favorite team selector on right (or below on mobile)

### 2. Next Match Countdown (P0)
- **Display**: "Your next Team's match is in X minutes against [Opponent]"
- **Real-time Updates**: Countdown updates every minute
- **Opponent**: Opponent name clearly shown, home/away indicator
- **Layout**: Prominent card/section in hero area

### 3. FPL Injury Alerts (P0)
- **Section Header**: "FPL Squad Injury Concerns" or "Fantasy Football Injury Alerts"
- **Injury List**: Injured players from FPL squad
- **Player Cards**: Player name, team, injury status, action button
- **Layout**: Clearly labeled as FPL-related

### 4. Favorite Team Injury Alerts (P0)
- **Section Header**: "My Team Injury Concerns" or "Favorite Team Injuries"
- **Injury List with Photos**: Injured players from favorite team with photos
- **Player Cards**: Player photo (large), name, position, injury status
- **Layout**: Separate section from FPL alerts, with player photos

### 5. Quick Recommendations (P0)
- **Transfer Recommendation**: Top transfer suggestion with reason
- **Captain Recommendation**: Top captain suggestion with reason
- **Recommendation Cards**: Visual cards with action buttons
- **Layout**: "Quick Recommendations" section in Fantasy Football area

### 6. Remove Team Theme Colors (P0)
- **Remove Theme**: Remove team theme color schemes
- **Default Colors**: Use consistent app color scheme
- **Consistency**: No dynamic color changes based on favorite team

### 7. Fix Personalized News (P0)
- **Bug Fix**: Ensure favorite team news shows in personalized news
- **Display**: News about favorite team and FPL squad players
- **Layout**: Existing personalized news section (fix backend/frontend)

### 8. News Context (P1)
- **Context Badges**: Badge/tag on each news card
- **Context Types**: "Your favorite team", "Your FPL player: [Name]", "Trending", "Breaking"
- **Visual Indicators**: Color-coded badges, clear text
- **Layout**: Context badge visible on news card (top-right or below title)

---

## Design Principles

### Clarity
- Clear labeling: FPL vs Favorite Team
- Clear site branding: "Football Companion"
- Clear context: Why news is shown

### Separation
- FPL alerts separate from favorite team alerts
- Visual distinction between sections
- Clear boundaries

### Consistency
- No team theme colors
- Consistent color scheme
- Consistent design patterns

### Personalization
- Easy team selection
- Personalized recommendations
- Contextual news

---

## Existing Components to Reference

### Current Dashboard Structure
- `HeroSection` - Hero area component
- `DashboardSection` - Section containers
- `FavoriteTeamSection` - Favorite team section
- Alert components - Current alert display
- News components - Current news display

### Design Patterns
- Glass morphism styling (consistent with app)
- Card-based layouts
- Responsive design patterns
- Existing color scheme (without team themes)

---

## Responsive Design Requirements

### Desktop (> 1024px)
- Header: Site name left, favorite team right
- Countdown: Large, prominent
- Alerts: Side-by-side or stacked
- Recommendations: Grid layout

### Tablet (768px - 1024px)
- Header: Site name left, favorite team below or right
- Countdown: Medium size
- Alerts: Stacked
- Recommendations: 2-column grid

### Mobile (< 768px)
- Header: Stacked (site name top, favorite team below)
- Countdown: Full width
- Alerts: Stacked, full width
- Recommendations: Single column
- Touch-friendly dropdown

---

## Accessibility Requirements

- **WCAG AA Compliance**: All color contrasts meet WCAG AA standards
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Touch Targets**: Minimum 44x44px for all interactive elements
- **Dropdown**: Accessible dropdown with keyboard navigation

---

## Design Deliverables

Please create:

1. **Design Specifications Document** (`dashboard-improvements-design-spec.md`)
   - Header design (site name, favorite team dropdown)
   - Countdown display design
   - Alert section designs (FPL vs Favorite Team)
   - Recommendation card designs
   - News context badge designs
   - Color scheme (without team themes)
   - Responsive breakpoints
   - Interaction states

2. **Visual Mockups** (optional but recommended)
   - Header with site name and dropdown
   - Countdown display
   - Alert sections (FPL and Favorite Team)
   - Recommendations section
   - News with context badges
   - Mobile layouts

---

## Key Design Questions

1. **Header Layout**: How should site name and favorite team be arranged? (Horizontal or vertical on mobile?)
2. **Countdown Display**: What style? (Large numbers, progress bar, text-based?)
3. **Alert Separation**: How to visually distinguish FPL vs Favorite Team alerts? (Colors, borders, icons?)
4. **Player Photos**: What size for favorite team injury photos? (Thumbnails, medium, large?)
5. **Recommendations**: What style for recommendation cards? (Simple cards, detailed cards, minimal?)
6. **News Context**: What style for context badges? (Small tags, colored backgrounds, icons?)
7. **Color Scheme**: What default colors to use? (Keep existing app colors?)

---

## Next Steps

1. **Review Requirements**: Read the full requirements document
2. **Review Current Dashboard**: Check existing components and structure
3. **Create Design Spec**: Design all improvements
4. **Hand off to Developer**: Create handoff document with design specifications

---

**Status**: ✅ Ready for UI Designer  
**Priority**: P0 (Critical)  
**Estimated Design Time**: 3-4 hours

---

**Handing off to UI Designer Agent. Please activate UI Designer Agent and review `docs/features/dashboard-improvements/dashboard-improvements-handoff-ui-designer.md`**

