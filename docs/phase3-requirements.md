# Phase 3 Requirements - Analytics & Live Rank

**Status**: Ready for Implementation  
**Assigned to**: UI Designer Agent  
**Priority**: High  
**Target Completion**: 2 weeks

---

## Background

Phase 3 focuses on completing the MVP polish by adding analytics capabilities and live rank display. These features enhance user engagement by providing real-time feedback and historical performance insights.

---

## Problem Statement

1. **Live Rank**: Users cannot see their current rank during live gameweeks, making it difficult to track performance in real-time.
2. **Analytics**: No consolidated view of team performance trends, making it hard to identify patterns and improvement areas.

---

## Goals

1. Display live overall rank and gameweek rank with real-time updates
2. Create a comprehensive analytics dashboard showing key performance metrics
3. Ensure all new components follow existing design system and team theming
4. Maintain WCAG AA accessibility standards
5. Optimize for mobile-first responsive design

## Non-Goals

- Premium feature gating (Phase 4)
- Advanced predictive analytics (Phase 4)
- Historical data beyond current season

---

## Target Users & Primary Journeys

### Primary User: Active FPL Manager
- **Journey 1**: Check live rank during gameweek
  - User opens dashboard during live matches
  - Sees current overall rank and gameweek rank
  - Sees rank change indicators (↑/↓)
  - Auto-refreshes every 60 seconds

- **Journey 2**: Review team performance analytics
  - User navigates to analytics page/tab
  - Views points per gameweek chart
  - Reviews rank progression over time
  - Compares form vs. average
  - Checks chip usage history

---

## Requirements

### Functional Requirements

#### FR-1: Live Rank Display
- **FR-1.1**: Display overall rank on dashboard
- **FR-1.2**: Display gameweek rank when matches are live
- **FR-1.3**: Show rank change (↑/↓) with visual indicators
- **FR-1.4**: Auto-refresh every 60 seconds during live gameweeks
- **FR-1.5**: Show "Last updated" timestamp
- **FR-1.6**: Handle loading states gracefully
- **FR-1.7**: Display rank in formatted format (e.g., "1,234" not "1234")

#### FR-2: Analytics Dashboard
- **FR-2.1**: Points per gameweek line chart
- **FR-2.2**: Rank progression line chart (inverse Y-axis for better UX)
- **FR-2.3**: Squad value over time (integrate existing graph)
- **FR-2.4**: Form vs. average comparison chart
- **FR-2.5**: Chip usage tracking (WC, FH, BB, TC) with visual timeline
- **FR-2.6**: Key metrics summary cards (total points, average points, best/worst GW)
- **FR-2.7**: Time range selector (all season, last 10 GWs, last 5 GWs)

### Non-Functional Requirements

#### NFR-1: Performance
- Dashboard load time < 2 seconds
- Chart rendering < 500ms
- Smooth animations (60fps)

#### NFR-2: Accessibility
- WCAG AA contrast compliance (4.5:1 minimum)
- Keyboard navigation support
- Screen reader friendly
- ARIA labels for charts

#### NFR-3: Responsive Design
- Mobile-first approach
- Breakpoints: mobile (320px+), tablet (768px+), desktop (1024px+)
- Touch-friendly controls (min 44x44px)
- Charts responsive to container width

#### NFR-4: Visual Consistency
- Use existing team theming system
- Follow existing component patterns
- Match design language from dashboard
- Consistent spacing and typography

---

## Acceptance Criteria

### AC-1: Live Rank Display
**Given** a user is on the dashboard during a live gameweek  
**When** the page loads  
**Then** they see:
- Overall rank displayed prominently
- Gameweek rank displayed (if matches are live)
- Rank change indicator (↑ green, ↓ red, → gray)
- "Last updated" timestamp
- Auto-refresh every 60 seconds

**Given** a user is on the dashboard outside a live gameweek  
**When** the page loads  
**Then** they see:
- Overall rank from last completed gameweek
- No gameweek rank (or "Not available")
- No auto-refresh indicator

### AC-2: Analytics Dashboard
**Given** a user navigates to the analytics page/tab  
**When** the page loads  
**Then** they see:
- Points per gameweek line chart with all gameweeks
- Rank progression chart (inverse Y-axis)
- Squad value graph (existing component)
- Form vs. average comparison
- Chip usage timeline
- Summary cards with key metrics
- Time range selector (default: all season)

**Given** a user selects a different time range  
**When** they change the selector  
**Then** all charts update to show data for that range

**Given** a user views charts on mobile  
**When** they interact with the page  
**Then** charts are readable and touch-friendly

---

## UX Notes

### Live Rank Component
- **Location**: Top of dashboard, below team name/header
- **Layout**: Card-based design with team-themed colors
- **Visual Hierarchy**: 
  - Overall rank: Large, prominent (24-32px font)
  - Gameweek rank: Medium (18-20px font)
  - Rank change: Icon + number, color-coded
- **States**: Loading skeleton, error state, no data state

### Analytics Dashboard
- **Layout**: Grid-based (1 column mobile, 2-3 columns desktop)
- **Charts**: Use consistent chart library (recharts or similar)
- **Color Scheme**: Use team theme colors for primary data, neutral for comparisons
- **Interactions**: 
  - Hover tooltips on charts
  - Click to drill down (future enhancement)
  - Smooth transitions between time ranges

---

## Technical Notes

### Data Sources
- **Live Rank**: `team.summary_overall_rank`, `team.summary_event_rank` from FPL API
- **History Data**: `history.current[]` array from FPL API
- **Chip Usage**: `history.chips[]` array from FPL API

### Components to Create
1. `LiveRank.tsx` - Live rank display component
2. `AnalyticsDashboard.tsx` - Main analytics dashboard
3. `PointsChart.tsx` - Points per gameweek chart
4. `RankChart.tsx` - Rank progression chart
5. `FormComparisonChart.tsx` - Form vs. average chart
6. `ChipUsageTimeline.tsx` - Chip usage visualization
7. `MetricsSummary.tsx` - Summary cards component

### Integration Points
- Use existing `fplApi` from `@/lib/api`
- Integrate with `TeamThemeProvider` for theming
- Use existing dashboard layout patterns
- Follow existing error handling patterns

---

## Risks / Dependencies

### Risks
- **FPL API rate limits**: Mitigate with caching and efficient polling
- **Chart library performance**: Test with large datasets, consider virtualization
- **Mobile chart readability**: Ensure touch interactions and responsive sizing

### Dependencies
- FPL API availability (already integrated)
- Chart library selection (recharts recommended)
- Existing team theming system (already implemented)

---

## Metrics / Telemetry

### Success Metrics
- **Engagement**: % of users viewing analytics page weekly
- **Retention**: Users who check live rank during gameweeks
- **Performance**: Page load time < 2s (target)

### Events to Track
- `analytics_page_viewed`
- `live_rank_refreshed`
- `time_range_changed`
- `chart_interaction` (hover, click)

---

## Rollout & Support

### Rollout Plan
1. **Development**: 2 weeks
2. **Testing**: 3 days (manual + automated)
3. **Staging**: 2 days
4. **Production**: Gradual rollout (10% → 50% → 100%)

### Support Considerations
- Monitor API rate limit usage
- Track chart rendering performance
- User feedback collection mechanism

---

## Open Questions

1. Should analytics be a separate page or a tab on dashboard? **Decision**: Tab on dashboard (consistent with existing pattern)
2. How many gameweeks to show by default? **Decision**: All season, with option to filter
3. Should charts be interactive (drill-down)? **Decision**: Hover tooltips only for MVP, drill-down in Phase 4

---

## Related Tickets

- **Parent Epic**: Phase 3 Completion
- **Dependencies**: None
- **Blocks**: Phase 4 Premium Features

