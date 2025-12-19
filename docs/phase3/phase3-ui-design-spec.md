# Phase 3 UI Design Specification

**Designer**: UI Designer Agent  
**Date**: Current  
**Status**: Ready for Implementation  
**Target Platform**: Web (Mobile-first, responsive)

---

## Design Overview

This document provides complete UI/UX specifications for Phase 3 features: Live Rank Display and Analytics Dashboard. All designs follow existing design system patterns, team theming, and WCAG AA accessibility standards.

---

## 1. Live Rank Display Component

### Screen: Dashboard - Live Rank Section
**Purpose**: Display real-time overall and gameweek rank with auto-refresh during live gameweeks

**Location**: Top of dashboard, below team header, above FPL stats overview cards

**Layout**:
```
┌─────────────────────────────────────────┐
│  📊 Live Rank                           │
│  ─────────────────────────────────────  │
│                                         │
│  Overall Rank                          │
│  #12,345  ↑ 234                        │
│                                         │
│  Gameweek Rank (if live)                │
│  #5,678  ↓ 12                          │
│                                         │
│  Last updated: 2:45 PM                  │
│  🔄 Auto-refreshing...                  │
└─────────────────────────────────────────┘
```

**Key Components**:
- Rank display cards (overall + gameweek)
- Rank change indicators (↑ green, ↓ red, → gray)
- Last updated timestamp
- Auto-refresh indicator
- Loading skeleton state
- Error state

**States**:
- **Loading**: Skeleton with animated shimmer
- **Loaded (Live)**: Shows both ranks with change indicators, auto-refresh active
- **Loaded (Not Live)**: Shows overall rank only, no auto-refresh
- **Error**: Error message with retry button
- **No Data**: "No rank data available"

**Edge Cases**:
- First gameweek (no previous rank to compare)
- Network error during refresh
- User navigates away during refresh
- Gameweek just finished (transition from live to not live)

**Component Spec**:

| Component | Variants | States | Props/Inputs | Validation | A11y | Notes |
|-----------|----------|--------|--------------|------------|------|-------|
| LiveRank | Default | Loading, Loaded (Live), Loaded (Not Live), Error, No Data | `teamId: number`, `currentGameweek: number`, `isLive: boolean` | Valid teamId, valid gameweek | ARIA labels, live region for updates | Auto-refresh every 60s when live |

**Visual Design**:
- **Card Style**: `glass rounded-2xl p-6`
- **Overall Rank**: 
  - Font: `text-3xl sm:text-4xl font-bold`
  - Color: `text-[var(--team-primary)]` or `text-[var(--pl-green)]`
- **Gameweek Rank**: 
  - Font: `text-2xl sm:text-3xl font-bold`
  - Color: `text-[var(--pl-cyan)]`
- **Rank Change Indicator**:
  - ↑ (up): `text-[var(--pl-green)]`
  - ↓ (down): `text-[var(--pl-pink)]`
  - → (unchanged): `text-[var(--pl-text-muted)]`
- **Spacing**: `mb-4` between sections, `gap-4` for grid

**Interaction Notes**:
- No user interaction required (auto-refreshes)
- Refresh indicator shows pulsing animation
- Smooth transitions when rank updates
- Screen reader announces rank changes (live region)

**Accessibility**:
- ARIA live region for rank updates
- Semantic HTML structure
- High contrast text (WCAG AA)
- Focus visible on any interactive elements

---

## 2. Analytics Dashboard

### Screen: Analytics Tab
**Purpose**: Comprehensive view of team performance metrics and trends

**Location**: New "Analytics" tab in dashboard tab navigation

**Layout** (Mobile - 1 column):
```
┌─────────────────────────────────────────┐
│  [All Season ▼]  Time Range Selector   │
├─────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│  │Total│ │Avg  │ │Best │ │Worst│     │
│  │Pts  │ │Pts  │ │GW   │ │GW   │     │
│  └─────┘ └─────┘ └─────┘ └─────┘     │
├─────────────────────────────────────────┤
│  Points Per Gameweek                    │
│  [Line Chart]                           │
├─────────────────────────────────────────┤
│  Rank Progression                       │
│  [Line Chart - Inverted Y]              │
├─────────────────────────────────────────┤
│  Form vs Average                        │
│  [Comparison Chart]                     │
├─────────────────────────────────────────┤
│  Squad Value Over Time                  │
│  [Existing Graph]                       │
├─────────────────────────────────────────┤
│  Chip Usage Timeline                    │
│  [Timeline Visualization]               │
└─────────────────────────────────────────┘
```

**Layout** (Desktop - 2-3 columns):
```
┌─────────────────────────────────────────────────────────────┐
│  [All Season ▼]  Time Range Selector                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                           │
│  │Total│ │Avg  │ │Best │ │Worst│                           │
│  │Pts  │ │Pts  │ │GW   │ │GW   │                           │
│  └─────┘ └─────┘ └─────┘ └─────┘                           │
├──────────────────────────┬──────────────────────────────────┤
│  Points Per Gameweek      │  Rank Progression               │
│  [Line Chart]             │  [Line Chart - Inverted Y]      │
├──────────────────────────┼──────────────────────────────────┤
│  Form vs Average          │  Squad Value Over Time          │
│  [Comparison Chart]      │  [Existing Graph]               │
├──────────────────────────┴──────────────────────────────────┤
│  Chip Usage Timeline                                         │
│  [Timeline Visualization - Full Width]                        │
└─────────────────────────────────────────────────────────────┘
```

**Key Components**:
1. Time Range Selector
2. Metrics Summary Cards (4 cards)
3. Points Chart
4. Rank Chart
5. Form Comparison Chart
6. Squad Value Graph (existing)
7. Chip Usage Timeline

**States**:
- **Loading**: Skeleton loaders for all charts
- **Loaded**: All charts rendered with data
- **Error**: Error message with retry
- **No Data**: "No analytics data available"
- **Filtering**: Charts update smoothly when time range changes

**Edge Cases**:
- Single gameweek (charts show single point)
- No chips used (empty timeline)
- Missing data for some gameweeks
- Very long season (chart readability)

---

## 3. Component Specifications

### 3.1 Time Range Selector

**Component**: `TimeRangeSelector`

| Property | Value |
|----------|-------|
| **Variants** | Dropdown, Button Group (mobile: dropdown, desktop: button group) |
| **States** | Default, Active, Disabled |
| **Props** | `value: string`, `onChange: (range: string) => void`, `options: Array<{value: string, label: string}>` |
| **Options** | "All Season", "Last 10 GWs", "Last 5 GWs" |
| **Default** | "All Season" |
| **Validation** | Must be valid option |
| **A11y** | Keyboard navigation, ARIA labels, focus visible |
| **Notes** | Mobile: Native select dropdown. Desktop: Button group with active state |

**Visual Design**:
- Mobile: `select` element styled with `input-field` class
- Desktop: Button group with `bg-[var(--pl-dark)]/50` background
- Active button: `bg-[var(--team-primary)]` or `bg-[var(--pl-green)]`
- Spacing: `mb-6` below selector

---

### 3.2 Metrics Summary Cards

**Component**: `MetricsSummary`

| Property | Value |
|----------|-------|
| **Variants** | 4 cards: Total Points, Average Points, Best GW, Worst GW |
| **States** | Loading (skeleton), Loaded, Error |
| **Props** | `history: FPLHistory`, `timeRange: string` |
| **Layout** | Grid: `grid-cols-2 lg:grid-cols-4 gap-4` |
| **Card Style** | `glass rounded-xl p-4` |
| **A11y** | Semantic structure, ARIA labels |

**Card Design**:
```
┌─────────────────┐
│  Total Points   │  (label: text-sm text-[var(--pl-text-muted)])
│  1,234          │  (value: text-2xl font-bold)
└─────────────────┘
```

**Visual Design**:
- Label: `text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1`
- Value: `text-2xl sm:text-3xl font-bold`
- Value color: `text-[var(--team-primary)]` or `text-[var(--pl-green)]`
- Card background: `glass rounded-xl p-4`
- Hover: Subtle scale on hover (desktop only)

---

### 3.3 Points Chart

**Component**: `PointsChart`

| Property | Value |
|----------|-------|
| **Chart Type** | Line chart |
| **Data Source** | `history.current[]` |
| **X-Axis** | Gameweek number |
| **Y-Axis** | Points |
| **Props** | `history: FPLHistory`, `timeRange: string` |
| **States** | Loading, Loaded, Error, No Data |
| **A11y** | ARIA label, descriptive title, data table alternative |

**Visual Design**:
- Container: `glass rounded-xl p-4 sm:p-6`
- Chart height: `h-64 sm:h-80` (responsive)
- Line color: `var(--team-primary)` or `var(--pl-green)`
- Grid lines: `rgba(255,255,255,0.1)`
- Data points: Circles with hover tooltips
- Tooltip: Shows gameweek and points

**Interaction**:
- Hover: Tooltip with gameweek number and points
- Mobile: Tap to show tooltip
- Smooth animation on data change

---

### 3.4 Rank Chart

**Component**: `RankChart`

| Property | Value |
|----------|-------|
| **Chart Type** | Line chart (inverted Y-axis) |
| **Data Source** | `history.current[].overall_rank` |
| **X-Axis** | Gameweek number |
| **Y-Axis** | Rank (inverted: rank 1 at top) |
| **Props** | `history: FPLHistory`, `timeRange: string` |
| **States** | Loading, Loaded, Error, No Data |
| **A11y** | ARIA label, descriptive title, note about inverted axis |

**Visual Design**:
- Same as PointsChart but with inverted Y-axis
- Line color: `var(--team-secondary)` or `var(--pl-cyan)`
- Y-axis labels: Formatted ranks (e.g., "1,234")
- Note: Small text explaining "Lower rank = better (rank 1 at top)"

**Special Logic**:
- Y-axis inverted: `domain={['dataMax', 'dataMin']}` or equivalent
- Handle edge case: rank 1 should be at top visually

---

### 3.5 Form Comparison Chart

**Component**: `FormComparisonChart`

| Property | Value |
|----------|-------|
| **Chart Type** | Dual line chart or grouped bar chart |
| **Data Source** | User points vs. average points per GW |
| **X-Axis** | Gameweek number |
| **Y-Axis** | Points |
| **Props** | `history: FPLHistory`, `timeRange: string`, `averagePoints: number[]` (from backend) |
| **States** | Loading, Loaded, Error, No Data |
| **A11y** | ARIA label, legend, color coding explained |

**Visual Design**:
- Two lines: User (team primary color), Average (neutral gray)
- Legend: "Your Points" and "Average Points"
- Tooltip: Shows both values
- Chart height: `h-64 sm:h-80`

**Data Note**:
- May need backend endpoint for average points per gameweek
- Fallback: Show user points only if average unavailable

---

### 3.6 Chip Usage Timeline

**Component**: `ChipUsageTimeline`

| Property | Value |
|----------|-------|
| **Visualization Type** | Horizontal timeline with markers |
| **Data Source** | `history.chips[]` |
| **Props** | `chips: Array<{name: string, event: number}>`, `totalGameweeks: number` |
| **States** | Loading, Loaded, Empty (no chips used), Error |
| **A11y** | ARIA label, list structure, tooltips |

**Visual Design**:
```
GW 1 ──────●────── GW 5 ──────●────── GW 10 ──────●────── GW 20
           WC                  FH                  BB
```

**Layout**:
- Horizontal timeline with gameweek markers
- Chip icons/markers at used gameweeks
- Chip labels below markers
- Responsive: Scrollable on mobile if needed

**Chip Icons**:
- Wildcard (WC): 🃏 or custom icon
- Free Hit (FH): 🔄 or custom icon
- Bench Boost (BB): 📈 or custom icon
- Triple Captain (TC): 👑 or custom icon

**Visual Design**:
- Timeline line: `border-t-2 border-[var(--pl-text-muted)]/30`
- Chip markers: Colored circles with icons
- Chip colors: Different colors per chip type
- Container: `glass rounded-xl p-4 sm:p-6`
- Height: `h-32 sm:h-40` (responsive)

**Interaction**:
- Hover/tap chip marker: Tooltip with chip name and gameweek
- Smooth scroll on mobile if timeline is long

---

## 4. Design Tokens & Spacing

### Colors
- **Primary**: `var(--team-primary)` (fallback: `var(--pl-green)`)
- **Secondary**: `var(--team-secondary)` (fallback: `var(--pl-cyan)`)
- **Accent**: `var(--team-accent)` (fallback: `var(--pl-purple)`)
- **Success/Up**: `var(--pl-green)`
- **Error/Down**: `var(--pl-pink)`
- **Neutral**: `var(--pl-text-muted)`
- **Background**: `glass` class (semi-transparent with backdrop blur)
- **Card Background**: `bg-[var(--pl-dark)]/50`

### Typography
- **Heading 1**: `text-2xl sm:text-3xl font-bold`
- **Heading 2**: `text-xl sm:text-2xl font-bold`
- **Heading 3**: `text-lg sm:text-xl font-semibold`
- **Body**: `text-sm sm:text-base`
- **Small**: `text-xs sm:text-sm`
- **Muted**: `text-[var(--pl-text-muted)]`

### Spacing
- **Section Gap**: `gap-6` or `space-y-6`
- **Card Padding**: `p-4 sm:p-6`
- **Grid Gap**: `gap-4`
- **Component Margin**: `mb-4` or `mb-6`

### Breakpoints
- **Mobile**: `320px+` (default)
- **Tablet**: `768px+` (`sm:`)
- **Desktop**: `1024px+` (`lg:`)

### Border Radius
- **Cards**: `rounded-xl` or `rounded-2xl`
- **Buttons**: `rounded-md` or `rounded-lg`
- **Inputs**: `rounded-lg`

---

## 5. Interaction Patterns

### Chart Interactions
- **Hover**: Show tooltip with data point details
- **Mobile Tap**: Show tooltip on tap (or modal with details)
- **Animation**: Smooth transitions when data changes (300ms)
- **Loading**: Skeleton loader with shimmer effect

### Time Range Selection
- **Desktop**: Button group with active state
- **Mobile**: Native select dropdown
- **Change**: Smooth chart updates (no full page reload)
- **Feedback**: Loading state during update

### Auto-Refresh (Live Rank)
- **Interval**: 60 seconds during live gameweeks
- **Indicator**: Pulsing animation or spinner
- **Update**: Smooth fade-in transition
- **Error Handling**: Retry with exponential backoff

---

## 6. Accessibility Checklist

### WCAG AA Compliance
- ✅ Color contrast: 4.5:1 for text, 3:1 for UI
- ✅ Keyboard navigation: All interactive elements accessible
- ✅ Screen reader: ARIA labels, live regions, semantic HTML
- ✅ Focus states: Visible focus indicators
- ✅ Touch targets: Minimum 44x44px on mobile

### Specific A11y Features
- **Charts**: ARIA labels, descriptive titles, data table alternatives
- **Live Rank**: ARIA live region for updates
- **Time Selector**: Keyboard navigation, ARIA labels
- **Tooltips**: Accessible via keyboard, screen reader friendly

---

## 7. Responsive Behavior

### Mobile (320px - 767px)
- Single column layout
- Stacked charts (full width)
- Native select for time range
- Touch-friendly controls (44px min)
- Horizontal scroll for timeline if needed
- Simplified tooltips (tap to show)

### Tablet (768px - 1023px)
- 2-column grid for summary cards
- Charts: 1 column or 2 columns (depending on size)
- Button group for time range
- Larger touch targets

### Desktop (1024px+)
- 2-3 column grid layouts
- Side-by-side charts where appropriate
- Button group for time range
- Hover interactions enabled
- Full tooltip functionality

---

## 8. Performance Targets

- **Dashboard Load**: < 2 seconds
- **Chart Rendering**: < 500ms per chart
- **Time Range Change**: < 300ms update
- **Auto-Refresh**: < 100ms UI update
- **Animations**: 60fps smooth

### Optimization Strategies
- Lazy load charts (load on tab switch)
- Memoize chart data processing
- Debounce time range changes
- Virtualize long lists if needed
- Use CSS transforms for animations

---

## 9. Developer Handoff Notes

### Chart Library
- **Recommended**: `recharts` (React-friendly, good mobile support)
- **Alternative**: `chart.js` with `react-chartjs-2`
- **Install**: `npm install recharts`

### Component Structure
```
frontend/src/components/
  ├── LiveRank.tsx
  ├── AnalyticsDashboard.tsx
  ├── PointsChart.tsx
  ├── RankChart.tsx
  ├── FormComparisonChart.tsx
  ├── ChipUsageTimeline.tsx
  └── MetricsSummary.tsx
```

### Integration Points
- Dashboard: Add "Analytics" tab to existing tab navigation
- Use existing `fplApi.getTeamHistory()` for data
- Use `TeamThemeProvider` for theming
- Follow existing error handling patterns
- Use existing loading/error state components

### Dependencies
- `recharts` (or alternative chart library)
- Existing: `@/lib/api`, `@/lib/team-theme-context`

### Copy/Text
- "Live Rank" (heading)
- "Overall Rank" (label)
- "Gameweek Rank" (label)
- "Last updated: {time}" (timestamp)
- "Auto-refreshing..." (indicator)
- "Analytics" (tab name)
- "All Season", "Last 10 GWs", "Last 5 GWs" (time range options)
- "Total Points", "Average Points", "Best GW", "Worst GW" (metric labels)
- "Points Per Gameweek", "Rank Progression", "Form vs Average", "Chip Usage" (chart titles)

---

## 10. Edge Cases & Error States

### No Data
- Show friendly message: "No analytics data available yet"
- Icon: 📊 or relevant emoji
- Suggestion: "Complete a gameweek to see your analytics"

### Loading States
- Skeleton loaders matching component structure
- Shimmer animation
- Show for 200ms minimum (prevent flash)

### Error States
- Error message with retry button
- Icon: ⚠️
- Message: "Failed to load analytics. Please try again."
- Retry: Calls same fetch function

### Network Issues
- Graceful degradation
- Show cached data if available
- Retry with exponential backoff

### Empty States
- No chips used: "No chips used yet"
- Single gameweek: Charts show single point with note
- Missing gameweeks: Interpolate or show gaps

---

## 11. Analytics Events (for Tracking)

Track these events for product analytics:
- `analytics_tab_viewed` - When user opens Analytics tab
- `live_rank_refreshed` - When rank auto-refreshes
- `time_range_changed` - When user changes time range
- `chart_hovered` - When user hovers over chart (desktop)
- `chart_tapped` - When user taps chart (mobile)
- `chip_timeline_viewed` - When chip timeline is viewed

---

## 12. Testing Checklist

### Visual Testing
- [ ] All components render correctly
- [ ] Team theming applied throughout
- [ ] WCAG AA contrast verified (use contrast checker)
- [ ] Responsive on 320px, 768px, 1024px+
- [ ] Charts readable on all screen sizes

### Functional Testing
- [ ] Auto-refresh works during live gameweeks
- [ ] Time range selector updates all charts
- [ ] Loading states display correctly
- [ ] Error states handle gracefully
- [ ] Charts are touch-friendly on mobile

### Performance Testing
- [ ] Dashboard loads < 2s
- [ ] Charts render < 500ms
- [ ] Smooth animations (60fps)
- [ ] No layout shift during load

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces updates
- [ ] Focus states visible
- [ ] ARIA labels present
- [ ] Color contrast passes WCAG AA

---

## Next Steps

1. Review and approve this spec
2. Install chart library (`recharts`)
3. Implement components in order:
   - LiveRank (can be done in parallel)
   - AnalyticsDashboard container
   - MetricsSummary
   - PointsChart
   - RankChart
   - FormComparisonChart
   - ChipUsageTimeline
4. Integrate into dashboard
5. Test thoroughly
6. Deploy

---

**End of Design Specification**

