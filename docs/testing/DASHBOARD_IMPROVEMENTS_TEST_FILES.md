# Dashboard Improvements - Test Files Documentation

**Feature**: Dashboard Improvements  
**Date**: 2025-12-19  
**Tester Agent**: Test Creation

---

## Overview

This document lists all test files created for the Dashboard Improvements feature, their purpose, and what they test.

---

## Test Files Structure

```
frontend/src/
├── components/
│   ├── dashboard/
│   │   └── __tests__/
│   │       ├── FavoriteTeamSelector.test.tsx
│   │       ├── MatchCountdown.test.tsx
│   │       ├── FPLInjuryAlerts.test.tsx
│   │       ├── FavoriteTeamInjuryAlerts.test.tsx
│   │       └── QuickRecommendations.test.tsx
│   └── news/
│       └── __tests__/
│           └── NewsContextBadge.test.tsx
```

---

## Component Test Files

### 1. FavoriteTeamSelector.test.tsx

**Purpose**: Test the FavoriteTeamSelector component that allows users to select their favorite team.

**Tests**:
- Basic rendering with/without current team
- Dropdown open/close functionality
- Team fetching from API
- Team selection and callback
- API fallback (football API → FPL API)
- Loading and empty states
- ARIA attributes
- Outside click handling
- Chevron icon rotation

**Dependencies**: 
- Auth context (mocked)
- Football API (mocked)
- FPL API (mocked)

---

### 2. MatchCountdown.test.tsx

**Purpose**: Test the MatchCountdown component that displays minutes until next match.

**Tests**:
- Countdown calculation and display
- Home/away match display
- Timer updates every minute
- Match link rendering
- String/Date date format handling
- Past date handling (returns null)
- Interval cleanup

**Dependencies**: Next.js Link (mocked)

---

### 3. FPLInjuryAlerts.test.tsx

**Purpose**: Test the FPLInjuryAlerts component that displays injured players from FPL squad.

**Tests**:
- Empty state (returns null)
- Section header rendering
- Player list rendering
- Team and chance of playing display
- Links to transfers page
- Styling application
- Icon display

**Dependencies**: Next.js Link (mocked)

---

### 4. FavoriteTeamInjuryAlerts.test.tsx

**Purpose**: Test the FavoriteTeamInjuryAlerts component that displays injured players from favorite team with photos.

**Tests**:
- Empty state (returns null)
- Section header with team name
- Player list rendering
- Position display
- Chance of playing display
- Player photo display and URL generation
- Photo placeholder when missing
- Photo load error handling
- Injury status display
- Styling application

**Dependencies**: None (pure component)

---

### 5. QuickRecommendations.test.tsx

**Purpose**: Test the QuickRecommendations component that displays transfer and captain recommendations.

**Tests**:
- Empty state (returns null when no recommendations)
- Section header rendering
- Transfer recommendation display
- Captain recommendation display
- Both recommendations display
- Links to transfers/captain pages
- Icon display
- Styling application

**Dependencies**: Next.js Link (mocked)

---

### 6. NewsContextBadge.test.tsx

**Purpose**: Test the NewsContextBadge component that displays context badges on news cards.

**Tests**:
- All badge types (favorite-team, fpl-player, trending, breaking)
- FPL player badge with/without player name
- Color application for each type
- Styling classes
- Player name handling

**Dependencies**: None (pure component)

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
npm test FavoriteTeamSelector
npm test MatchCountdown
npm test FPLInjuryAlerts
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
- **Edge Cases**: All edge cases covered (empty states, errors, null values)
- **Accessibility**: ARIA attributes and keyboard navigation

---

## Mock Strategy

### API Mocks
- `footballApi.getUkTeams()` - Returns mock teams data
- `fplApi.getBootstrap()` - Returns mock FPL teams data
- `useAuth()` - Returns mock auth context with updateFavoriteTeamId

### Component Mocks
- Next.js Link component
- Auth context hooks

---

## Test Data

### Mock Teams
```typescript
[
  { id: 1, name: 'Arsenal' },
  { id: 2, name: 'Chelsea' }
]
```

### Mock Injured Players
```typescript
[
  {
    id: 1,
    name: 'Player One',
    team: 'Arsenal',
    injuryStatus: 'Injured',
    chanceOfPlaying: 25
  }
]
```

### Mock Recommendations
```typescript
{
  transferRecommendation: {
    playerIn: { id: 1, name: 'Player In' },
    playerOut: { id: 2, name: 'Player Out' },
    reason: 'Better form'
  },
  captainRecommendation: {
    player: { id: 3, name: 'Captain Player' },
    reason: 'High expected points'
  }
}
```

---

## Best Practices Followed

1. ✅ **Isolation**: Each test is independent
2. ✅ **Mocking**: External dependencies are mocked
3. ✅ **Accessibility**: ARIA attributes are tested
4. ✅ **Edge Cases**: Empty states and error cases covered
5. ✅ **Descriptive Names**: Test names clearly describe what they test
6. ✅ **Cleanup**: Tests clean up after themselves (timers, event listeners)

---

## Maintenance

When updating components:
1. Update corresponding test file
2. Add tests for new features
3. Update mocks if dependencies change
4. Run tests to ensure nothing breaks

---

**Status**: ✅ **All test files created and documented**  
**Total Test Files**: 6  
**Total Test Cases**: 80+



