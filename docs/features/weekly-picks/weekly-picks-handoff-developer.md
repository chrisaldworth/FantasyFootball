# Weekly Picks - Developer Handoff

**Date**: 2025-12-21  
**From**: UI Designer Agent  
**To**: Developer Agent  
**Status**: ✅ Design Complete, Ready for Implementation  
**Priority**: P0 (New Feature - Engagement & Retention)

---

## Overview

Complete implementation guide for the Footmate Weekly Picks feature. This document provides step-by-step instructions, code examples, and implementation details for all 6 screens and 10 components.

**Reference Documents**:
- Design Specification: `weekly-picks-design-spec.md` ⭐ **START HERE**
- Requirements: `weekly-picks-complete-design-brief.md`
- Handoff: `weekly-picks-handoff-ui-designer.md`

---

## Design Specification

**Full Design Spec**: `docs/features/weekly-picks/weekly-picks-design-spec.md`

**Key Design Decisions**:
- Multi-step wizard for pick submission (3 steps)
- Number inputs for score predictions (with team context)
- Search-first player selection (with filters)
- Summary-first results display (expandable details)
- Hybrid leaderboard (cards on mobile, table on desktop)
- Professional football-native aesthetic

---

## Implementation Tasks

### Task 1: Create Base Components (10 Components)

#### Component 1: ScorePredictionInput

**File**: `frontend/src/components/weekly-picks/ScorePredictionInput.tsx`

**Props**:
```typescript
interface ScorePredictionInputProps {
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore: number;
  awayScore: number;
  onChange: (home: number, away: number) => void;
  disabled?: boolean;
}
```

**Implementation**:
```tsx
'use client';

import { useState } from 'react';

export default function ScorePredictionInput({
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  homeScore,
  awayScore,
  onChange,
  disabled = false,
}: ScorePredictionInputProps) {
  const [home, setHome] = useState(homeScore);
  const [away, setAway] = useState(awayScore);

  const handleHomeChange = (value: number) => {
    if (value >= 0 && value <= 10) {
      setHome(value);
      onChange(value, away);
    }
  };

  const handleAwayChange = (value: number) => {
    if (value >= 0 && value <= 10) {
      setAway(value);
      onChange(home, value);
    }
  };

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {homeLogo && (
            <img src={homeLogo} alt={homeTeam} className="w-12 h-12 object-contain" />
          )}
          <span className="text-sm font-medium text-center">{homeTeam}</span>
          <input
            type="number"
            min="0"
            max="10"
            value={home}
            onChange={(e) => handleHomeChange(parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="w-16 h-16 text-center text-2xl font-bold rounded-lg border-2 border-[var(--pl-green)]/30 bg-[var(--pl-dark)]/50 focus:border-[var(--pl-green)] focus:outline-none"
          />
        </div>

        {/* Separator */}
        <div className="text-2xl font-bold text-[var(--pl-text-muted)]">-</div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {awayLogo && (
            <img src={awayLogo} alt={awayTeam} className="w-12 h-12 object-contain" />
          )}
          <span className="text-sm font-medium text-center">{awayTeam}</span>
          <input
            type="number"
            min="0"
            max="10"
            value={away}
            onChange={(e) => handleAwayChange(parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="w-16 h-16 text-center text-2xl font-bold rounded-lg border-2 border-[var(--pl-green)]/30 bg-[var(--pl-dark)]/50 focus:border-[var(--pl-green)] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
```

---

#### Component 2: PlayerSelectionCard

**File**: `frontend/src/components/weekly-picks/PlayerSelectionCard.tsx`

**Props**:
```typescript
interface PlayerSelectionCardProps {
  player: {
    id: number;
    name: string;
    photo?: string;
    team: string;
    teamId: number;
    position: string;
    form?: number;
  };
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onDeselect: () => void;
}
```

**Implementation**:
```tsx
'use client';

export default function PlayerSelectionCard({
  player,
  selected,
  disabled = false,
  onSelect,
  onDeselect,
}: PlayerSelectionCardProps) {
  const handleClick = () => {
    if (disabled) return;
    if (selected) {
      onDeselect();
    } else {
      onSelect();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        glass rounded-xl p-4 w-full text-left transition-all
        ${selected ? 'border-2 border-[var(--pl-green)] bg-[var(--pl-green)]/10' : 'border border-white/10'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:border-[var(--pl-green)]/50 cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]
      `}
    >
      <div className="flex items-center gap-4">
        {/* Player Photo */}
        {player.photo ? (
          <img
            src={player.photo}
            alt={player.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[var(--pl-card)] flex items-center justify-center">
            <span className="text-xl">⚽</span>
          </div>
        )}

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">{player.name}</div>
          <div className="text-sm text-[var(--pl-text-muted)]">
            {player.team} • {player.position}
          </div>
          {player.form && (
            <div className="text-xs text-[var(--pl-green)] mt-1">
              Form: {player.form}
            </div>
          )}
        </div>

        {/* Selection Indicator */}
        {selected && (
          <div className="w-6 h-6 rounded-full bg-[var(--pl-green)] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {disabled && !selected && (
          <div className="text-xs text-[var(--pl-pink)]">
            Team already selected
          </div>
        )}
      </div>
    </button>
  );
}
```

---

#### Component 3: PickProgressIndicator

**File**: `frontend/src/components/weekly-picks/PickProgressIndicator.tsx`

**Props**:
```typescript
interface PickProgressIndicatorProps {
  scorePredictions: number; // 0-3
  playerPicks: number; // 0-3
  total: number; // 0-6
}
```

**Implementation**:
```tsx
'use client';

export default function PickProgressIndicator({
  scorePredictions,
  playerPicks,
  total,
}: PickProgressIndicatorProps) {
  const percentage = (total / 6) * 100;

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--pl-text-muted)]">
            Progress: {total}/6 picks made
          </span>
          <span className="text-sm font-bold text-[var(--pl-green)]">
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="w-full h-2 bg-[var(--pl-card)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--pl-green)] to-[var(--pl-cyan)] transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {scorePredictions === 3 ? (
            <svg className="w-5 h-5 text-[var(--pl-green)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-[var(--pl-text-muted)]" />
          )}
          <span className="text-sm">
            Score Predictions ({scorePredictions}/3)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {playerPicks === 3 ? (
            <svg className="w-5 h-5 text-[var(--pl-green)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-[var(--pl-text-muted)]" />
          )}
          <span className="text-sm">
            Player Picks ({playerPicks}/3)
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

#### Component 4: CountdownTimer

**File**: `frontend/src/components/weekly-picks/CountdownTimer.tsx`

**Props**:
```typescript
interface CountdownTimerProps {
  deadline: Date;
  onExpire?: () => void;
}
```

**Implementation**:
```tsx
'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer({
  deadline,
  onExpire,
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const deadlineTime = new Date(deadline).getTime();
      const difference = deadlineTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        if (onExpire) onExpire();
        return;
      }

      setTimeRemaining({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  if (isExpired) {
    return (
      <div className="text-center">
        <div className="text-lg font-bold text-[var(--pl-pink)]">Picks Locked</div>
      </div>
    );
  }

  const totalHours = timeRemaining.days * 24 + timeRemaining.hours;
  const isUrgent = totalHours < 1;
  const isWarning = totalHours < 24;

  return (
    <div className={`text-center ${isUrgent ? 'text-[var(--pl-pink)] animate-pulse' : isWarning ? 'text-yellow-400' : 'text-[var(--pl-green)]'}`}>
      <div className="text-sm font-medium mb-2">Time until lock:</div>
      <div className="text-2xl sm:text-3xl font-bold">
        {timeRemaining.days > 0 && `${timeRemaining.days}d `}
        {timeRemaining.hours}h {timeRemaining.minutes}m
      </div>
    </div>
  );
}
```

---

#### Component 5: PointsBreakdownCard

**File**: `frontend/src/components/weekly-picks/PointsBreakdownCard.tsx`

**Implementation**: See design spec for full details. Shows prediction vs actual, points breakdown.

---

#### Component 6: LeaderboardRow

**File**: `frontend/src/components/weekly-picks/LeaderboardRow.tsx`

**Implementation**: See design spec for full details. Displays rank, user, points, movement.

---

#### Component 7: LeagueCard

**File**: `frontend/src/components/weekly-picks/LeagueCard.tsx`

**Implementation**: See design spec for full details. Displays league info, member count, rank.

---

#### Component 8: StatCard

**File**: `frontend/src/components/weekly-picks/StatCard.tsx`

**Implementation**: See design spec for full details. Displays single statistic with trend.

---

#### Component 9: ChartComponent

**File**: `frontend/src/components/weekly-picks/ChartComponent.tsx`

**Implementation**: Use Chart.js or Recharts library. See design spec for details.

---

#### Component 10: InviteCodeDisplay

**File**: `frontend/src/components/weekly-picks/InviteCodeDisplay.tsx`

**Implementation**: See design spec for full details. Displays league code with copy/share.

---

### Task 2: Create Screen Components

#### Screen 1: WeeklyPicksMainPage

**File**: `frontend/src/app/weekly-picks/page.tsx`

**Implementation**: See design spec for layout. Handles logged-out and logged-in states.

---

#### Screen 2: PickSubmissionFlow

**File**: `frontend/src/app/weekly-picks/make-picks/page.tsx`

**Implementation**: Multi-step wizard (3 steps). See design spec for each step.

---

#### Screen 3: ResultsLeaderboard

**File**: `frontend/src/app/weekly-picks/results/page.tsx`

**Implementation**: Results breakdown + leaderboard. See design spec.

---

#### Screen 4: HistoryPastWeeks

**File**: `frontend/src/app/weekly-picks/history/page.tsx`

**Implementation**: Week selector + season summary. See design spec.

---

#### Screen 5: PrivateLeagues

**File**: `frontend/src/app/weekly-picks/leagues/page.tsx`

**Implementation**: League list + detail + create flow. See design spec.

---

#### Screen 6: StatisticsAnalytics

**File**: `frontend/src/app/weekly-picks/statistics/page.tsx`

**Implementation**: Overview dashboard + analytics. See design spec.

---

## API Integration

### Required Endpoints

1. **Submit Picks**: `POST /api/weekly-picks/submit`
2. **Get Picks**: `GET /api/weekly-picks/{gameweek}`
3. **Get Results**: `GET /api/weekly-picks/{gameweek}/results`
4. **Get Leaderboard**: `GET /api/weekly-picks/leaderboard`
5. **Create League**: `POST /api/weekly-picks/leagues`
6. **Get Statistics**: `GET /api/weekly-picks/statistics`

---

## Testing Checklist

### Functionality
- [ ] Pick submission works (3 scores, 3 players)
- [ ] Validation works (one player per team, 3 different fixtures)
- [ ] Countdown timer works correctly
- [ ] Results display correctly
- [ ] Leaderboard updates correctly
- [ ] League creation works
- [ ] Statistics calculate correctly

### Responsive
- [ ] Mobile (320px) - All screens work
- [ ] Tablet (768px) - Layouts adapt
- [ ] Desktop (1024px) - Multi-column layouts work

### Accessibility
- [ ] WCAG AA contrast ratios
- [ ] Keyboard navigation works
- [ ] Screen reader support
- [ ] Touch targets 44x44pt minimum

---

**Handoff Complete** ✅  
**Ready for Implementation** 🚀



