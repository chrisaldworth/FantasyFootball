# Phase 3 - Jira-Ready Tickets

---

## Ticket 1: Live Rank Display Component

**Summary**: Create LiveRank component to display overall and gameweek rank with real-time updates

**Description**:
Implement a component that displays the user's current overall rank and gameweek rank (when live) on the dashboard. The component should auto-refresh every 60 seconds during live gameweeks and show rank change indicators.

**Acceptance Criteria (Given/When/Then)**:
- **Given** a user is on the dashboard during a live gameweek
- **When** the page loads
- **Then** they see overall rank, gameweek rank, rank change indicator (↑/↓), and "Last updated" timestamp
- **Given** the component is displayed
- **When** 60 seconds pass during a live gameweek
- **Then** the rank data auto-refreshes
- **Given** a user views the component outside a live gameweek
- **When** the page loads
- **Then** they see overall rank from last completed gameweek and no gameweek rank

**Priority**: P0 (Critical)
**Labels**: `frontend`, `dashboard`, `phase3`, `live-data`
**Dependencies**: None
**Estimate**: M (Medium - 3-5 days)
**Notes for QA**:
- Test during live gameweek vs. outside live gameweek
- Verify auto-refresh works correctly
- Test loading and error states
- Verify rank formatting (commas for thousands)
- Test on mobile devices

**Files to Create/Modify**:
- `frontend/src/components/LiveRank.tsx` (new)
- `frontend/src/app/dashboard/page.tsx` (modify - add component)

---

## Ticket 2: Analytics Dashboard - Points Chart

**Summary**: Create PointsChart component showing points per gameweek

**Description**:
Implement a line chart component that displays the user's points for each gameweek. The chart should be responsive, use team theming, and support time range filtering.

**Acceptance Criteria (Given/When/Then)**:
- **Given** a user views the analytics dashboard
- **When** the page loads
- **Then** they see a line chart showing points for all gameweeks
- **Given** a user selects a different time range
- **When** they change the time range selector
- **Then** the chart updates to show only data for that range
- **Given** a user hovers over a data point
- **When** they move their cursor over the chart
- **Then** they see a tooltip with gameweek number and points

**Priority**: P1 (High)
**Labels**: `frontend`, `analytics`, `phase3`, `charts`
**Dependencies**: Ticket 3 (Analytics Dashboard container)
**Estimate**: S (Small - 2-3 days)
**Notes for QA**:
- Test with different data ranges (all season, last 10, last 5)
- Verify chart is responsive on mobile
- Test hover tooltips
- Verify team theming is applied
- Test with edge cases (no data, single gameweek)

**Files to Create/Modify**:
- `frontend/src/components/PointsChart.tsx` (new)
- `frontend/src/components/AnalyticsDashboard.tsx` (modify - integrate chart)

---

## Ticket 3: Analytics Dashboard - Rank Progression Chart

**Summary**: Create RankChart component showing rank progression over time

**Description**:
Implement a line chart that displays the user's overall rank progression. The Y-axis should be inverted (lower rank = higher on chart) for better UX. Chart should be responsive and themed.

**Acceptance Criteria (Given/When/Then)**:
- **Given** a user views the analytics dashboard
- **When** the page loads
- **Then** they see a line chart showing rank progression with inverted Y-axis
- **Given** a user hovers over a data point
- **When** they move their cursor over the chart
- **Then** they see a tooltip with gameweek number and rank
- **Given** a user selects a different time range
- **When** they change the time range selector
- **Then** the chart updates to show only data for that range

**Priority**: P1 (High)
**Labels**: `frontend`, `analytics`, `phase3`, `charts`
**Dependencies**: Ticket 3 (Analytics Dashboard container)
**Estimate**: S (Small - 2-3 days)
**Notes for QA**:
- Verify Y-axis is inverted (rank 1 at top, higher ranks at bottom)
- Test with different data ranges
- Verify chart is responsive
- Test hover tooltips
- Verify team theming

**Files to Create/Modify**:
- `frontend/src/components/RankChart.tsx` (new)
- `frontend/src/components/AnalyticsDashboard.tsx` (modify - integrate chart)

---

## Ticket 4: Analytics Dashboard - Form Comparison Chart

**Summary**: Create FormComparisonChart showing user form vs. average

**Description**:
Implement a comparison chart (line or bar) that shows the user's points per gameweek compared to the average points across all FPL managers. This helps users understand their performance relative to others.

**Acceptance Criteria (Given/When/Then)**:
- **Given** a user views the analytics dashboard
- **When** the page loads
- **Then** they see a chart showing their points vs. average points per gameweek
- **Given** a user hovers over a data point
- **When** they move their cursor over the chart
- **Then** they see a tooltip with gameweek, their points, and average points
- **Given** a user selects a different time range
- **When** they change the time range selector
- **Then** the chart updates to show only data for that range

**Priority**: P2 (Medium)
**Labels**: `frontend`, `analytics`, `phase3`, `charts`
**Dependencies**: Ticket 3 (Analytics Dashboard container), Backend API for average points
**Estimate**: M (Medium - 3-4 days)
**Notes for QA**:
- Verify average points data is accurate
- Test comparison visualization (two lines or grouped bars)
- Test with different data ranges
- Verify chart is responsive
- Test hover tooltips

**Files to Create/Modify**:
- `frontend/src/components/FormComparisonChart.tsx` (new)
- `frontend/src/components/AnalyticsDashboard.tsx` (modify - integrate chart)
- `backend/app/api/fpl.py` (modify - add average points endpoint if needed)

---

## Ticket 5: Analytics Dashboard - Chip Usage Timeline

**Summary**: Create ChipUsageTimeline component showing when chips were used

**Description**:
Implement a timeline visualization showing when the user used their chips (Wildcard, Free Hit, Bench Boost, Triple Captain). This helps users track chip strategy and plan future usage.

**Acceptance Criteria (Given/When/Then)**:
- **Given** a user views the analytics dashboard
- **When** the page loads
- **Then** they see a timeline showing chip usage with gameweek markers
- **Given** a user has used chips
- **When** they view the timeline
- **Then** they see icons/labels for each chip used at the correct gameweek
- **Given** a user hovers over a chip marker
- **When** they move their cursor over it
- **Then** they see a tooltip with chip name and gameweek number

**Priority**: P2 (Medium)
**Labels**: `frontend`, `analytics`, `phase3`, `visualization`
**Dependencies**: Ticket 3 (Analytics Dashboard container)
**Estimate**: S (Small - 2-3 days)
**Notes for QA**:
- Test with users who have used chips vs. haven't
- Verify chip icons are clear and distinguishable
- Test timeline layout on mobile
- Verify gameweek markers are accurate
- Test hover tooltips

**Files to Create/Modify**:
- `frontend/src/components/ChipUsageTimeline.tsx` (new)
- `frontend/src/components/AnalyticsDashboard.tsx` (modify - integrate component)

---

## Ticket 6: Analytics Dashboard - Metrics Summary Cards

**Summary**: Create MetricsSummary component with key performance indicators

**Description**:
Implement summary cards showing key metrics: total points, average points per gameweek, best gameweek, worst gameweek, and current rank. Cards should be visually consistent and use team theming.

**Acceptance Criteria (Given/When/Then)**:
- **Given** a user views the analytics dashboard
- **When** the page loads
- **Then** they see summary cards showing total points, average points, best GW, worst GW, and current rank
- **Given** a user selects a different time range
- **When** they change the time range selector
- **Then** the summary cards update to reflect data for that range (where applicable)
- **Given** a user views on mobile
- **When** they scroll the page
- **Then** the cards are readable and properly spaced

**Priority**: P1 (High)
**Labels**: `frontend`, `analytics`, `phase3`, `ui-components`
**Dependencies**: Ticket 3 (Analytics Dashboard container)
**Estimate**: S (Small - 1-2 days)
**Notes for QA**:
- Verify all metrics are calculated correctly
- Test with different data ranges
- Verify cards are responsive
- Test with edge cases (no data, single gameweek)
- Verify team theming is applied

**Files to Create/Modify**:
- `frontend/src/components/MetricsSummary.tsx` (new)
- `frontend/src/components/AnalyticsDashboard.tsx` (modify - integrate component)

---

## Ticket 7: Analytics Dashboard - Main Container & Integration

**Summary**: Create AnalyticsDashboard component and integrate into dashboard

**Description**:
Create the main analytics dashboard container that brings together all analytics components. Add a new "Analytics" tab to the dashboard and integrate the analytics view. Include time range selector and ensure responsive layout.

**Acceptance Criteria (Given/When/Then)**:
- **Given** a user is on the dashboard
- **When** they click the "Analytics" tab
- **Then** they see the analytics dashboard with all components
- **Given** a user views the analytics dashboard
- **When** the page loads
- **Then** they see time range selector (default: all season)
- **Given** a user selects a different time range
- **When** they change the selector
- **Then** all charts and metrics update to show data for that range
- **Given** a user views on mobile
- **When** they scroll the page
- **Then** all components are readable and properly laid out

**Priority**: P0 (Critical)
**Labels**: `frontend`, `analytics`, `phase3`, `dashboard`, `integration`
**Dependencies**: Tickets 2, 3, 4, 5, 6 (all chart components)
**Estimate**: M (Medium - 3-4 days)
**Notes for QA**:
- Test tab navigation
- Test time range selector functionality
- Verify all components are integrated correctly
- Test responsive layout on all breakpoints
- Test loading and error states
- Verify team theming is applied throughout

**Files to Create/Modify**:
- `frontend/src/components/AnalyticsDashboard.tsx` (new)
- `frontend/src/app/dashboard/page.tsx` (modify - add Analytics tab)
- `frontend/src/app/globals.css` (modify - add analytics-specific styles if needed)

---

## Ticket 8: Integrate Squad Value Graph into Analytics Dashboard

**Summary**: Integrate existing SquadValueGraph component into analytics dashboard

**Description**:
The SquadValueGraph component already exists. Integrate it into the analytics dashboard to provide a complete view of team performance over time.

**Acceptance Criteria (Given/When/Then)**:
- **Given** a user views the analytics dashboard
- **When** the page loads
- **Then** they see the squad value graph integrated with other analytics
- **Given** a user selects a different time range
- **When** they change the time range selector
- **Then** the squad value graph updates to show data for that range (if applicable)
- **Given** a user views on mobile
- **When** they scroll to the graph
- **Then** the graph is readable and responsive

**Priority**: P1 (High)
**Labels**: `frontend`, `analytics`, `phase3`, `integration`
**Dependencies**: Ticket 7 (Analytics Dashboard container), Existing SquadValueGraph component
**Estimate**: XS (Extra Small - 1 day)
**Notes for QA**:
- Verify graph integrates seamlessly
- Test with time range selector
- Verify responsive behavior
- Test with existing graph functionality

**Files to Create/Modify**:
- `frontend/src/components/AnalyticsDashboard.tsx` (modify - import and integrate SquadValueGraph)
- `frontend/src/components/SquadValueGraph.tsx` (modify - add time range filtering if needed)

---

## Summary

**Total Tickets**: 8  
**Total Estimate**: ~3 weeks (with parallel work on independent tickets)

**Critical Path**:
1. Ticket 1 (Live Rank) - Can be done in parallel
2. Ticket 7 (Analytics Container) - Blocks other analytics tickets
3. Tickets 2-6 (Charts) - Can be done in parallel after Ticket 7
4. Ticket 8 (Squad Value Integration) - Quick integration

**Recommended Sprint Plan**:
- **Sprint 1 (Week 1)**: Tickets 1, 7 (foundation)
- **Sprint 2 (Week 2)**: Tickets 2, 3, 6 (core charts and metrics)
- **Sprint 3 (Week 3)**: Tickets 4, 5, 8 (enhancements and integration)

