# Fantasy Football Overview Page - Handoff to UI Designer
**Date**: 2025-12-19  
**From**: Product and Project Manager Agent  
**To**: UI Designer Agent  
**Status**: Ready for Design

---

## Overview

The Fantasy Football overview page (`/fantasy-football`) currently shows "Fantasy Football overview coming soon..." and needs to be built as a comprehensive overview page that gives users everything they need to know about their FPL team at a glance.

---

## Requirements Document

**Full Requirements**: [fantasy-football-overview-requirements.md](./fantasy-football-overview-requirements.md)

Please review the complete requirements document for detailed specifications.

---

## Key Design Requirements

### 1. Hero Section - Key Metrics (P0)
Display the most important FPL metrics prominently:
- **Overall Rank Card**: Overall rank, points, rank change indicator
- **Current Gameweek Card**: Gameweek number, points, rank, status
- **Squad Value Card**: Current value, purchased value, value change, bank balance
- **Transfers Card**: Transfers remaining, transfer cost, free transfers, chip status

**Layout**: 4-column grid on desktop, 2x2 grid on tablet, stacked on mobile

### 2. Action Items & Alerts Section (P0)
Show what users need to do or be aware of:
- **Injury Alerts** (High Priority - Red/Yellow)
- **Transfer Recommendations** (Medium Priority - Yellow)
- **Captain Reminder** (High Priority - if deadline approaching)
- **Chip Availability** (Low Priority - Blue/Info)
- **Deadline Countdown** (High Priority - if deadline approaching)

**Layout**: Collapsible section with priority-based ordering

### 3. Recent Performance Section (P1)
Show recent gameweek performance and trends:
- **Performance Chart**: Last 5-6 gameweeks (points and rank)
- **Performance Summary**: Average points, best/worst gameweek, trend indicator
- **Quick Stats**: Total transfers, transfer cost, chips used, points on bench

**Layout**: Chart on left, summary cards on right (desktop), stacked (mobile)

### 4. League Standings Summary (P1)
Show position in key leagues:
- **Overall Rank** (Prominent)
- **Key Leagues** (Top 3-5) with rank, rank change, quick link
- **League Types**: Classic, H2H, Cup

**Layout**: Overall rank card + league cards in grid

### 5. Squad Status Section (P1)
Show current squad composition:
- **Squad Summary**: Formation, total players, starting XI, bench
- **Key Players**: Captain, vice-captain, top scorers
- **Squad Value**: Current value, purchased value, value change, bank balance
- **Quick Squad View**: Mini pitch view or player list

**Layout**: Summary cards + key players + value info

### 6. Quick Actions Section (P1)
Quick access to key features:
- Make Transfers
- Pick Captain
- View Squad
- View Analytics
- View Leagues
- View News

**Layout**: Button grid (3x2 on desktop, 2x3 on mobile)

### 7. Context-Aware Content (P1)
Show relevant content based on gameweek status:
- **Before Deadline**: Countdown, transfer recommendations, captain reminder
- **During Gameweek**: Live points, player performance, rank changes
- **After Deadline**: Final points, rank, what went well/badly
- **Between Gameweeks**: Upcoming fixtures, transfer planning, chip strategy

---

## Design Principles

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

## Existing Components to Reference

### Components Available
- `LiveRank` - Displays overall and gameweek rank with change indicators
- `AnalyticsDashboard` - Analytics charts and visualizations
- `TeamPitch` - Squad visualization (can be mini version)
- `QuickActionsBar` - Quick action buttons (can be adapted)
- `DashboardSection` - Section containers
- `ThemedSection` - Themed section containers

### Design Patterns
- Follow existing dashboard design patterns
- Use glass morphism styling (consistent with app)
- Use team theme colors where appropriate
- Follow mobile-first responsive design

---

## Data Available

### API Endpoints
- `GET /api/fpl/my-team` - Team data (points, rank, value, transfers)
- `GET /api/fpl/my-team/history` - History data (last 5-6 gameweeks)
- `GET /api/fpl/my-team/picks/{gameweek}` - Current picks (squad, captain)
- `GET /api/fpl/bootstrap` - Bootstrap data (players, teams, events)
- `GET /api/fpl/live/{gameweek}` - Live data (if available)
- `GET /api/fpl/league/{leagueId}` - League data (optional)

### Data Structure
See requirements document for detailed data structures.

---

## Responsive Design Requirements

### Desktop (> 1024px)
- Full layout with all sections visible
- 4-column grid for hero metrics
- Side-by-side layouts for charts and summaries
- Full-width sections

### Tablet (768px - 1024px)
- 2-column layouts where appropriate
- 2x2 grid for hero metrics
- Stacked charts and summaries
- Collapsible sections

### Mobile (< 768px)
- Stacked layout
- Single column for hero metrics
- Collapsible sections
- Touch-friendly buttons (44x44px minimum)
- Readable text (14px minimum)

---

## Accessibility Requirements

- **WCAG AA Compliance**: All color contrasts meet WCAG AA standards
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Touch Targets**: Minimum 44x44px for all interactive elements
- **Text Sizing**: Minimum 14px for body text on mobile

---

## Design Deliverables

Please create:

1. **Design Specifications Document** (`fantasy-football-overview-design-spec.md`)
   - Complete layout specifications
   - Component designs
   - Color schemes and typography
   - Responsive breakpoints
   - Interaction states
   - Accessibility considerations

2. **Visual Mockups** (optional but recommended)
   - Desktop layout
   - Tablet layout
   - Mobile layout
   - Key states (before deadline, during gameweek, after deadline)

---

## Acceptance Criteria for Design

- [ ] All sections from requirements are designed
- [ ] Visual hierarchy is clear
- [ ] Color coding is consistent and accessible
- [ ] Responsive design for all breakpoints
- [ ] Accessibility requirements met
- [ ] Design follows existing app patterns
- [ ] Design specifications document created

---

## Questions to Consider

1. **Hero Section Layout**: How should the 4 metric cards be arranged? Equal size or highlight overall rank?
2. **Action Items**: Should alerts be expandable cards or a list? How to prioritize visually?
3. **Performance Chart**: What chart type (line, bar, area)? Should points and rank be on same chart or separate?
4. **Squad View**: Mini pitch view or simplified list? How much detail to show?
5. **Quick Actions**: Icon buttons or text buttons? How to indicate context-aware actions?
6. **Context-Aware Content**: How to visually distinguish different gameweek states?

---

## Next Steps

1. **Review Requirements**: Read the full requirements document
2. **Review Existing Components**: Check available components and design patterns
3. **Create Design Spec**: Design all sections and components
4. **Hand off to Developer**: Create handoff document with design specifications

---

**Status**: ✅ Ready for UI Designer  
**Priority**: P0 (Critical)  
**Estimated Design Time**: 2-3 hours

---

**Handing off to UI Designer Agent. Please activate UI Designer Agent and review `docs/features/fantasy-football-overview/fantasy-football-overview-handoff-ui-designer.md`**

