# Fantasy Football Overview - Test Files Documentation

**Feature**: Fantasy Football Overview Page  
**Date**: 2025-12-19  
**Tester Agent**: Test Creation

---

## Overview

This document lists all test files created for the Fantasy Football Overview feature, their purpose, and what they test.

---

## Test Files Structure

```
frontend/src/
├── components/
│   └── fantasy-football/
│       └── __tests__/
│           ├── MetricCard.test.tsx
│           ├── AlertCard.test.tsx
│           ├── ActionItemsSection.test.tsx
│           ├── PerformanceChart.test.tsx
│           ├── LeagueCard.test.tsx
│           └── QuickActionButton.test.tsx
├── app/
│   └── fantasy-football/
│       └── __tests__/
│           └── page.test.tsx
└── utils/
    └── __tests__/
        └── fantasyFootballCalculations.test.ts
```

---

## Component Test Files

### 1. MetricCard.test.tsx

**Purpose**: Test the MetricCard component that displays key metrics with icons, values, and change indicators.

**Tests**:
- Basic rendering with required props
- Icon display and accessibility
- Subtitle rendering
- Change indicators (up, down, neutral)
- Status badges (live, finished, upcoming)
- Color themes (FPL, team)
- Value formatting (numeric and string)
- CSS class application

**Dependencies**: None (pure component)

---

### 2. AlertCard.test.tsx

**Purpose**: Test the AlertCard component that displays individual alerts with priority-based styling.

**Tests**:
- Basic rendering
- Priority styling (high, medium, low)
- Action link rendering
- Action button rendering
- Icon accessibility
- Arrow icon rendering

**Dependencies**: Next.js Link component

---

### 3. ActionItemsSection.test.tsx

**Purpose**: Test the ActionItemsSection component that displays a collapsible list of alerts.

**Tests**:
- Title and icon rendering
- Alert count badge
- Expansion/collapse functionality
- Alert sorting by priority
- Empty state rendering
- ARIA attributes
- Chevron icon rotation

**Dependencies**: AlertCard component

---

### 4. PerformanceChart.test.tsx

**Purpose**: Test the PerformanceChart component that displays performance data with charts and stats.

**Tests**:
- Rendering with history data
- Empty state handling
- Time range selection
- Time range button switching
- Stats calculation
- Chart component integration

**Dependencies**: PointsChart, RankChart (mocked)

---

### 5. LeagueCard.test.tsx

**Purpose**: Test the LeagueCard component that displays league standings information.

**Tests**:
- Basic rendering
- Link functionality
- League type display
- Rank formatting
- Rank change indicators
- Color application

**Dependencies**: Next.js Link component

---

### 6. QuickActionButton.test.tsx

**Purpose**: Test the QuickActionButton component that provides quick navigation to key features.

**Tests**:
- Basic rendering
- Link functionality
- Variant styling
- Badge rendering
- Icon accessibility
- Layout and styling

**Dependencies**: Next.js Link component

---

## Integration Test Files

### 7. page.test.tsx

**Purpose**: Test the main Fantasy Football Overview page integration.

**Tests**:
- Loading state
- Error state
- No team state
- Data fetching
- Component integration
- Section rendering
- Empty state handling

**Dependencies**: 
- All component mocks
- Auth context mock
- API mocks
- Next.js navigation mock

---

## Utility Test Files

### 8. fantasyFootballCalculations.test.ts

**Purpose**: Test utility functions and calculations used in the overview page.

**Tests**:
- Rank change calculations
- Value change calculations
- Gameweek status detection
- Alert generation logic
- Free transfers calculation
- League data transformation

**Dependencies**: None (pure functions)

---

## Running Tests

### Run All Tests
```bash
cd frontend
npm test
```

### Run Specific Test File
```bash
cd frontend
npm test MetricCard
npm test ActionItemsSection
npm test PerformanceChart
```

### Run Tests in Watch Mode
```bash
cd frontend
npm test -- --watch
```

### Run Tests with Coverage
```bash
cd frontend
npm test -- --coverage
```

---

## Test Coverage Goals

- **Component Tests**: 100% coverage of component props and states
- **Integration Tests**: All page states and data flows
- **Utility Tests**: All calculation functions

---

## Mock Strategy

### API Mocks
- `fplApi.getTeam()` - Returns mock team data
- `fplApi.getTeamHistory()` - Returns mock history data
- `fplApi.getBootstrap()` - Returns mock bootstrap data
- `fplApi.getTeamPicks()` - Returns mock picks data

### Context Mocks
- `useAuth()` - Returns mock user data
- `useRouter()` - Returns mock router functions

### Component Mocks
- Chart components (PointsChart, RankChart)
- Navigation components (SubNavigation)
- Page header components (FPLPageHeader)

---

## Test Data

### Mock Team Data
```typescript
{
  id: 12345,
  name: 'Test Team',
  summary_overall_points: 1000,
  summary_overall_rank: 50000,
  // ... more fields
}
```

### Mock History Data
```typescript
{
  current: [
    { event: 1, points: 50, overall_rank: 1000000 },
    // ... more entries
  ]
}
```

### Mock Bootstrap Data
```typescript
{
  events: [
    { id: 10, is_current: true, finished: false, deadline_time: '...' }
  ],
  elements: [
    { id: 1, web_name: 'Player 1', news: '', chance_of_playing_next_round: 100 }
  ]
}
```

---

## Best Practices Followed

1. ✅ **Isolation**: Each test is independent
2. ✅ **Mocking**: External dependencies are mocked
3. ✅ **Accessibility**: ARIA attributes are tested
4. ✅ **Edge Cases**: Empty states and error cases covered
5. ✅ **Descriptive Names**: Test names clearly describe what they test
6. ✅ **Cleanup**: Tests clean up after themselves

---

## Maintenance

When updating components:
1. Update corresponding test file
2. Add tests for new features
3. Update mocks if dependencies change
4. Run tests to ensure nothing breaks

---

**Status**: ✅ **All test files created and documented**  
**Total Test Files**: 8  
**Total Test Cases**: 134+



