# Remove Team Theme Colors - Implementation Guide

**Date**: 2025-12-19  
**Priority**: P0 (Critical)  
**Status**: ⚠️ **NOT YET IMPLEMENTED** - Design Complete, Implementation Needed

---

## Overview

The team theme color system needs to be completely removed from the application. Currently, the app dynamically changes colors based on the user's favorite team selection. This should be replaced with a consistent app color scheme.

**Current State**: Team theme system is active and used throughout the app  
**Target State**: Consistent app colors, no team-based theming

---

## Current Team Theme System

### Components Using Team Theme

1. **TeamThemeProvider** (`frontend/src/lib/team-theme-context.tsx`)
   - Provides theme context to entire app
   - Sets CSS variables based on favorite team
   - Used in `layout.tsx` to wrap entire app

2. **CSS Variables Set by Theme**:
   - `--team-primary` - Main team color
   - `--team-secondary` - Secondary team color
   - `--team-accent` - Accent team color
   - `--team-text` - Text color
   - `--team-text-on-primary` - Text on primary background
   - `--team-text-on-secondary` - Text on secondary background
   - `--team-bg-gradient` - Background gradient with team colors
   - `--team-bg-color` - Background color

3. **Components Using Team Theme** (60+ instances found):
   - `TeamLogo.tsx` - Uses theme for logo display
   - `SideNavigation.tsx` - Uses theme colors
   - `BottomNavigation.tsx` - Uses theme colors
   - `FixtureTicker.tsx` - Uses theme colors
   - `MetricsSummary.tsx` - Uses theme colors
   - `LiveRank.tsx` - Uses theme colors
   - `RankChart.tsx` - Uses theme colors
   - `PointsChart.tsx` - Uses theme colors
   - `FormComparisonChart.tsx` - Uses theme colors
   - `PersonalizedNewsFeed.tsx` - Uses theme colors
   - `NewsFilterButtons.tsx` - Uses theme colors
   - `NewsSortDropdown.tsx` - Uses theme colors
   - `NewsTypeBadge.tsx` - Uses theme colors
   - `EmptyTeamNews.tsx` - Uses theme colors
   - `MetricCard.tsx` - Uses theme colors (with FPL differentiation)
   - All "My Team" pages - Use theme colors
   - Many test files - Mock team theme

---

## Implementation Plan

### Phase 1: Replace CSS Variables with Default Colors

**Goal**: Replace all `--team-*` CSS variables with default app colors

**Default App Colors** (from `globals.css`):
- `--pl-green: #00ff87` (use instead of `--team-primary`)
- `--pl-cyan: #04f5ff` (use instead of `--team-secondary`)
- `--pl-pink: #e90052` (use instead of `--team-accent`)
- `--pl-text: #f8f8f8` (use instead of `--team-text`)
- `--pl-dark: #0d0d0d` (use instead of `--team-bg-color`)

**Steps**:
1. Update `globals.css` to set default values for team CSS variables
2. Remove dynamic CSS variable setting from `TeamThemeProvider`
3. Update all components to use default colors

### Phase 2: Update TeamThemeProvider

**Option A: Remove Provider Entirely** (Recommended)
- Remove `TeamThemeProvider` from `layout.tsx`
- Remove `useTeamTheme()` hook usage
- Keep team logo/name functionality (just remove colors)

**Option B: Keep Provider but Return Default Theme**
- Modify `TeamThemeProvider` to always return default theme
- Keep hook for team name/logo access
- Remove color-related functionality

**Recommendation**: Option A - Remove provider entirely, create separate hook for team info if needed

### Phase 3: Update All Components

**Replacements**:
- `var(--team-primary)` → `var(--pl-green)` or `var(--fpl-primary)` (for FPL sections)
- `var(--team-secondary)` → `var(--pl-cyan)` or `var(--fpl-secondary)`
- `var(--team-accent)` → `var(--pl-pink)` or `var(--fpl-accent)`
- `var(--team-text)` → `var(--pl-text)`
- `var(--team-text-on-primary)` → `var(--pl-text)` or `var(--fpl-text-on-primary)`
- `var(--team-text-on-secondary)` → `var(--pl-text)`
- `var(--team-bg-gradient)` → Default gradient (no team colors)
- `var(--team-bg-color)` → `var(--pl-dark)`

**FPL vs My Team Differentiation**:
- FPL sections: Use `--fpl-*` colors
- My Team sections: Use `--pl-*` colors (default app colors)
- Navigation: Use `--pl-*` colors

### Phase 4: Update Background Gradient

**Current**: Background gradient includes team colors  
**Target**: Consistent gradient without team colors

**Update `globals.css`**:
```css
body {
  background-color: var(--pl-dark);
  background-image: linear-gradient(135deg, var(--pl-dark) 0%, #1a0a1d 50%, var(--pl-dark) 100%);
  /* Remove team-bg-gradient usage */
}
```

### Phase 5: Update Tests

- Remove team theme mocks from tests
- Update test expectations to use default colors
- Update color differentiation tests

---

## Detailed Component Updates

### 1. Remove TeamThemeProvider from Layout

**File**: `frontend/src/app/layout.tsx`

**Before**:
```tsx
<TeamThemeProvider>
  {children}
</TeamThemeProvider>
```

**After**:
```tsx
{children}
```

**Remove import**:
```tsx
// Remove this line
import { TeamThemeProvider } from "@/lib/team-theme-context";
```

### 2. Update Components Using useTeamTheme()

**Pattern to Replace**:
```tsx
// Before
const { theme } = useTeamTheme();
const color = theme?.primary || '#00ff87';

// After
const color = '#00ff87'; // or var(--pl-green)
```

**Components to Update**:
- `TeamLogo.tsx` - Remove theme usage, keep team logo functionality
- `SideNavigation.tsx` - Use default colors
- `BottomNavigation.tsx` - Use default colors
- `FixtureTicker.tsx` - Use default colors
- All chart components - Use default colors
- All news components - Use default colors
- All "My Team" pages - Use default colors

### 3. Update CSS Variable Usage

**Find and Replace Pattern**:
```bash
# Find all instances
grep -r "var(--team-" frontend/src/

# Replace with default colors
# Use search/replace in IDE or sed command
```

**Replacement Map**:
- `var(--team-primary)` → `var(--pl-green)` (or `var(--fpl-primary)` for FPL)
- `var(--team-secondary)` → `var(--pl-cyan)` (or `var(--fpl-secondary)` for FPL)
- `var(--team-accent)` → `var(--pl-pink)` (or `var(--fpl-accent)` for FPL)
- `var(--team-text)` → `var(--pl-text)`
- `var(--team-text-on-primary)` → `var(--pl-text)` (or `var(--fpl-text-on-primary)` for FPL)
- `var(--team-text-on-secondary)` → `var(--pl-text)`
- `var(--team-bg-gradient)` → Default gradient
- `var(--team-bg-color)` → `var(--pl-dark)`

### 4. Update MetricCard Component

**File**: `frontend/src/components/fantasy-football/MetricCard.tsx`

**Current Logic**:
```tsx
const borderColor = isFPL ? 'border-[var(--fpl-primary)]' : 'border-[var(--team-primary)]';
const bgColor = isFPL ? 'bg-[var(--fpl-primary)]/10' : 'bg-[var(--team-primary)]/10';
const textColor = isFPL ? 'text-[var(--fpl-primary)]' : 'text-[var(--team-primary)]';
```

**Updated Logic**:
```tsx
// For My Team sections, use default app colors (not FPL colors)
const borderColor = isFPL ? 'border-[var(--fpl-primary)]' : 'border-[var(--pl-green)]';
const bgColor = isFPL ? 'bg-[var(--fpl-primary)]/10' : 'bg-[var(--pl-green)]/10';
const textColor = isFPL ? 'text-[var(--fpl-primary)]' : 'text-[var(--pl-green)]';
```

### 5. Update globals.css

**File**: `frontend/src/app/globals.css`

**Update CSS Variables**:
```css
:root {
  /* Remove or comment out team theme variables */
  /* --team-primary: var(--pl-green); */
  /* --team-secondary: var(--pl-cyan); */
  /* etc. */
  
  /* Keep default app colors */
  --pl-green: #00ff87;
  --pl-cyan: #04f5ff;
  --pl-pink: #e90052;
  /* etc. */
}

body {
  /* Remove team-bg-gradient, use default */
  background-color: var(--pl-dark);
  background-image: linear-gradient(135deg, var(--pl-dark) 0%, #1a0a1d 50%, var(--pl-dark) 100%);
}

::-webkit-scrollbar-thumb {
  /* Use default color instead of team-primary */
  background: var(--pl-green);
}

::-webkit-scrollbar-thumb:hover {
  /* Use default color instead of team-accent */
  background: var(--pl-pink);
}
```

---

## Files to Update

### Core Files
1. ✅ `frontend/src/lib/team-theme-context.tsx` - Remove or simplify
2. ✅ `frontend/src/app/layout.tsx` - Remove TeamThemeProvider
3. ✅ `frontend/src/app/globals.css` - Update CSS variables

### Component Files (60+ files)
1. `frontend/src/components/TeamLogo.tsx`
2. `frontend/src/components/navigation/SideNavigation.tsx`
3. `frontend/src/components/navigation/BottomNavigation.tsx`
4. `frontend/src/components/FixtureTicker.tsx`
5. `frontend/src/components/MetricsSummary.tsx`
6. `frontend/src/components/LiveRank.tsx`
7. `frontend/src/components/RankChart.tsx`
8. `frontend/src/components/PointsChart.tsx`
9. `frontend/src/components/FormComparisonChart.tsx`
10. `frontend/src/components/news/PersonalizedNewsFeed.tsx`
11. `frontend/src/components/news/NewsFilterButtons.tsx`
12. `frontend/src/components/news/NewsSortDropdown.tsx`
13. `frontend/src/components/news/NewsTypeBadge.tsx`
14. `frontend/src/components/news/EmptyTeamNews.tsx`
15. `frontend/src/components/fantasy-football/MetricCard.tsx`
16. All "My Team" page components
17. All test files using team theme mocks

---

## Testing Checklist

After implementation, verify:

- [ ] No team theme colors appear in UI
- [ ] All components use consistent app colors
- [ ] Background gradient is consistent (no team colors)
- [ ] Navigation uses default colors
- [ ] FPL sections use FPL colors (green/cyan/pink)
- [ ] My Team sections use default app colors (green/cyan/pink)
- [ ] No console errors about missing theme
- [ ] All pages load correctly
- [ ] Color contrast meets WCAG AA standards
- [ ] Tests pass with updated color expectations

---

## Migration Strategy

### Step 1: Update globals.css
- Set default values for team CSS variables
- Update body background to use default gradient

### Step 2: Update TeamThemeProvider
- Remove CSS variable setting logic
- Keep team info (name, logo) if needed
- Or remove provider entirely

### Step 3: Update Components (Batch 1 - Core)
- Update navigation components
- Update layout components
- Update core dashboard components

### Step 4: Update Components (Batch 2 - Features)
- Update chart components
- Update news components
- Update "My Team" pages

### Step 5: Update Tests
- Remove team theme mocks
- Update color expectations
- Run test suite

### Step 6: Remove TeamThemeProvider
- Remove from layout.tsx
- Remove unused imports
- Clean up unused code

---

## Color Mapping Reference

### For FPL Sections
- Primary: `var(--fpl-primary)` = `#00ff87` (green)
- Secondary: `var(--fpl-secondary)` = `#04f5ff` (cyan)
- Accent: `var(--fpl-accent)` = `#e90052` (pink)
- Text: `var(--pl-text)` = `#f8f8f8` (white)
- Text on Primary: `var(--fpl-text-on-primary)` = `#0d0d0d` (dark)

### For My Team Sections
- Primary: `var(--pl-green)` = `#00ff87` (green)
- Secondary: `var(--pl-cyan)` = `#04f5ff` (cyan)
- Accent: `var(--pl-pink)` = `#e90052` (pink)
- Text: `var(--pl-text)` = `#f8f8f8` (white)

### For Navigation/General
- Use `var(--pl-*)` colors (default app colors)

---

## Important Notes

1. **Team Info Still Needed**: Team name and logo functionality should remain - only remove color theming
2. **FPL Differentiation**: FPL sections should use `--fpl-*` colors, not `--pl-*` colors
3. **My Team Sections**: Use default app colors (`--pl-*`), not FPL colors
4. **Consistency**: All users see the same colors regardless of favorite team
5. **Accessibility**: Ensure color contrast meets WCAG AA standards with default colors

---

## Status

**Current**: ⚠️ **NOT IMPLEMENTED** - Team theme system is still active  
**Design**: ✅ Complete  
**Implementation**: ❌ Not started

**Next Step**: Developer should implement removal following this guide.

---

**Priority**: P0 (Critical) - User explicitly requested removal of team theme colors

