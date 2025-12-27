# Fantasy Football Overview Page - Developer Handoff

**From**: UI Designer Agent  
**To**: Developer Agent  
**Date**: 2025-12-19  
**Status**: Ready for Implementation  
**Priority**: P0 (Critical)

---

## Overview

This document provides implementation guidance for building the Fantasy Football Overview page (`/fantasy-football`). The page serves as a comprehensive dashboard that gives users everything they need to know about their FPL team at a glance.

**Key Principle**: At-a-glance information with clear action items and quick navigation to detailed features.

---

## Design Specification Reference

**Complete Design Spec**: `docs/features/fantasy-football-overview/fantasy-football-overview-design-spec.md`

This document contains:
- Complete layout specifications (desktop, tablet, mobile)
- Component designs and specifications
- Color schemes and typography
- Responsive breakpoints
- Interaction states
- Accessibility considerations

**Please read the design spec thoroughly before starting implementation.**

---

## Implementation Priority

### Phase 1: Core Sections (P0 - Critical)
1. **Hero Section** - 4 metric cards (Overall Rank, Gameweek, Squad Value, Transfers)
2. **Action Items Section** - Collapsible alerts and reminders
3. **Quick Actions Section** - Navigation buttons to key features

### Phase 2: Performance & Leagues (P1 - High)
4. **Recent Performance Section** - Chart and summary cards
5. **League Standings Summary** - Overall rank + league cards

### Phase 3: Squad & Context-Aware (P1 - High)
6. **Squad Status Section** - Formation, key players, value
7. **Context-Aware Content** - Adapt based on gameweek status

---

## Key Implementation Notes

### 1. Create MetricCard Component

**File**: `frontend/src/components/fantasy-football/MetricCard.tsx`

**Props**:
```typescript
interface MetricCardProps {
  title: string;
  icon?: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  status?: 'live' | 'finished' | 'upcoming';
  color?: 'fpl' | 'team';
}
```

**Implementation**:
```tsx
export default function MetricCard({
  title,
  icon,
  value,
  subtitle,
  change,
  status,
  color = 'fpl',
}: MetricCardProps) {
  const isFPL = color === 'fpl';
  const borderColor = isFPL ? 'border-[var(--fpl-primary)]' : 'border-[var(--team-primary)]';
  const bgColor = isFPL ? 'bg-[var(--fpl-primary)]/10' : 'bg-[var(--team-primary)]/10';
  const textColor = isFPL ? 'text-[var(--fpl-primary)]' : 'text-[var(--team-primary)]';

  const changeColor = change?.direction === 'up' 
    ? 'text-[var(--pl-green)]' 
    : change?.direction === 'down' 
    ? 'text-[var(--pl-pink)]' 
    : 'text-[var(--pl-text-muted)]';

  const changeIcon = change?.direction === 'up' 
    ? '↑' 
    : change?.direction === 'down' 
    ? '↓' 
    : '→';

  return (
    <div className={`rounded-2xl border-2 ${borderColor} ${bgColor} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <h3 className="text-sm font-semibold text-[var(--pl-text-muted)]">{title}</h3>
        </div>
        {status && (
          <span className={`text-xs px-2 py-1 rounded ${
            status === 'live' 
              ? 'bg-[var(--pl-pink)] text-white animate-pulse' 
              : status === 'finished' 
              ? 'bg-[var(--pl-text-muted)] text-white' 
              : 'bg-[var(--pl-cyan)] text-white'
          }`}>
            {status.toUpperCase()}
          </span>
        )}
      </div>
      <div className={`text-3xl sm:text-4xl font-bold ${textColor} mb-2`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-sm text-[var(--pl-text-muted)] mb-2">
          {subtitle}
        </div>
      )}
      {change && (
        <div className={`text-sm font-medium ${changeColor} flex items-center gap-1`}>
          <span>{changeIcon}</span>
          <span>{Math.abs(change.value).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
```

---

### 2. Create ActionItemsSection Component

**File**: `frontend/src/components/fantasy-football/ActionItemsSection.tsx`

**Props**:
```typescript
interface AlertCardProps {
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

interface ActionItemsSectionProps {
  alerts: AlertCardProps[];
  defaultExpanded?: boolean;
}
```

**Implementation**:
```tsx
export default function ActionItemsSection({ 
  alerts, 
  defaultExpanded = true 
}: ActionItemsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const priorityColors = {
    high: 'border-[var(--pl-pink)] bg-[var(--pl-pink)]/10',
    medium: 'border-[var(--pl-yellow)] bg-[var(--pl-yellow)]/10',
    low: 'border-[var(--pl-cyan)] bg-[var(--pl-cyan)]/10',
  };

  const sortedAlerts = alerts.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="glass rounded-2xl p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          <h2 className="text-xl font-bold">Action Items & Alerts</h2>
          {alerts.length > 0 && (
            <span className="px-2 py-1 rounded-full bg-[var(--pl-pink)] text-white text-xs">
              {alerts.length}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="space-y-3">
          {sortedAlerts.length === 0 ? (
            <div className="text-center py-8 text-[var(--pl-text-muted)]">
              <p>No action items at this time.</p>
            </div>
          ) : (
            sortedAlerts.map((alert, index) => (
              <AlertCard key={index} {...alert} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AlertCard({
  priority,
  icon,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
}: AlertCardProps) {
  const priorityColor = priorityColors[priority];

  return (
    <div className={`rounded-xl border-2 ${priorityColor} p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-[var(--pl-text-muted)] mb-3">{message}</p>
          {(actionLabel && actionHref) && (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--fpl-primary)] hover:underline"
            >
              <span>{actionLabel}</span>
              <span>→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### 3. Create PerformanceChart Component

**File**: `frontend/src/components/fantasy-football/PerformanceChart.tsx`

**Props**:
```typescript
interface PerformanceChartProps {
  history: HistoryEntry[];
  timeRange?: 'last5' | 'last10' | 'all';
}
```

**Implementation**:
```tsx
export default function PerformanceChart({ 
  history, 
  timeRange = 'last5' 
}: PerformanceChartProps) {
  const filteredHistory = useMemo(() => {
    if (timeRange === 'last5') return history.slice(-5);
    if (timeRange === 'last10') return history.slice(-10);
    return history;
  }, [history, timeRange]);

  // Use existing chart components or create new ones
  // Points line: green (#00ff87)
  // Rank line: cyan (#04f5ff)
  // Highlight best/worst gameweeks

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">Recent Performance</h2>
      {/* Chart implementation */}
      <PointsChart history={filteredHistory} />
      <RankChart history={filteredHistory} />
    </div>
  );
}
```

---

### 4. Create LeagueCard Component

**File**: `frontend/src/components/fantasy-football/LeagueCard.tsx`

**Props**:
```typescript
interface LeagueCardProps {
  leagueName: string;
  rank: number;
  totalTeams: number;
  rankChange?: number;
  leagueType: 'classic' | 'h2h' | 'cup';
  href: string;
}
```

**Implementation**:
```tsx
export default function LeagueCard({
  leagueName,
  rank,
  totalTeams,
  rankChange,
  leagueType,
  href,
}: LeagueCardProps) {
  const rankChangeColor = rankChange && rankChange > 0
    ? 'text-[var(--pl-green)]'
    : rankChange && rankChange < 0
    ? 'text-[var(--pl-pink)]'
    : 'text-[var(--pl-text-muted)]';

  const rankChangeIcon = rankChange && rankChange > 0
    ? '↑'
    : rankChange && rankChange < 0
    ? '↓'
    : '→';

  return (
    <Link
      href={href}
      className="glass rounded-xl p-4 hover:bg-[var(--pl-card-hover)] transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{leagueName}</h3>
        <span className="text-xs text-[var(--pl-text-muted)]">
          {leagueType === 'classic' ? 'Classic' : leagueType === 'h2h' ? 'H2H' : 'Cup'}
        </span>
      </div>
      <div className="text-2xl font-bold text-[var(--fpl-primary)] mb-1">
        #{rank.toLocaleString()}
      </div>
      <div className="text-sm text-[var(--pl-text-muted)] mb-2">
        Out of {totalTeams.toLocaleString()} teams
      </div>
      {rankChange !== undefined && (
        <div className={`text-sm font-medium ${rankChangeColor} flex items-center gap-1`}>
          <span>{rankChangeIcon}</span>
          <span>{Math.abs(rankChange)}</span>
        </div>
      )}
    </Link>
  );
}
```

---

### 5. Create QuickActionButton Component

**File**: `frontend/src/components/fantasy-football/QuickActionButton.tsx`

**Props**:
```typescript
interface QuickActionButtonProps {
  icon: string;
  label: string;
  href: string;
  badge?: boolean;
  variant?: 'primary' | 'outlined';
}
```

**Implementation**:
```tsx
export default function QuickActionButton({
  icon,
  label,
  href,
  badge,
  variant = 'outlined',
}: QuickActionButtonProps) {
  const baseClasses = 'w-full h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative';
  const variantClasses = variant === 'primary'
    ? 'bg-[var(--fpl-primary)] text-[var(--fpl-text-on-primary)] hover:opacity-90'
    : 'border-2 border-[var(--fpl-primary)] text-[var(--fpl-primary)] hover:bg-[var(--fpl-primary)]/10';

  return (
    <Link href={href} className={`${baseClasses} ${variantClasses}`}>
      {badge && (
        <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[var(--pl-pink)]" />
      )}
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}
```

---

### 6. Main Overview Page

**File**: `frontend/src/app/fantasy-football/page.tsx`

**Implementation Structure**:
```tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fplApi } from '@/lib/api';
import MetricCard from '@/components/fantasy-football/MetricCard';
import ActionItemsSection from '@/components/fantasy-football/ActionItemsSection';
import PerformanceChart from '@/components/fantasy-football/PerformanceChart';
import LeagueCard from '@/components/fantasy-football/LeagueCard';
import QuickActionButton from '@/components/fantasy-football/QuickActionButton';
import FPLPageHeader from '@/components/pages/FPLPageHeader';

export default function FantasyFootballOverviewPage() {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [picksData, setPicksData] = useState(null);
  const [bootstrapData, setBootstrapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.fpl_team_id) {
      fetchData();
    }
  }, [user?.fpl_team_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data in parallel
      const [team, history, bootstrap, currentGW] = await Promise.all([
        fplApi.getTeam(user.fpl_team_id),
        fplApi.getTeamHistory(user.fpl_team_id),
        fplApi.getBootstrap(),
        fplApi.getBootstrap().then(data => {
          const currentEvent = data.events.find((e: any) => e.is_current);
          return currentEvent?.id || null;
        }),
      ]);

      setTeamData(team);
      setHistoryData(history);
      setBootstrapData(bootstrap);

      if (currentGW) {
        const picks = await fplApi.getTeamPicks(user.fpl_team_id, currentGW);
        setPicksData(picks);
      }
    } catch (err) {
      console.error('Failed to fetch FPL data:', err);
      setError('Failed to load FPL data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate alerts
  const alerts = useMemo(() => {
    // Calculate injuries, captain reminders, etc.
    // Return array of AlertCardProps
  }, [teamData, picksData, bootstrapData]);

  // Calculate gameweek status
  const gameweekStatus = useMemo(() => {
    // Determine if before/during/after deadline
    // Return 'before' | 'during' | 'after' | 'between'
  }, [bootstrapData]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!user?.fpl_team_id) {
    return <NoFPLTeamState />;
  }

  return (
    <div className="min-h-screen">
      <FPLPageHeader
        title="Fantasy Football"
        subtitle="Overview of your FPL team"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Hero Section - Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Overall Rank"
            icon="📊"
            value={`#${teamData.summary_overall_rank?.toLocaleString() || '-'}`}
            subtitle={`${teamData.summary_overall_points || 0} points`}
            change={calculateRankChange(historyData)}
            color="fpl"
          />
          <MetricCard
            title={`Gameweek ${currentGameweek || '-'}`}
            icon="📅"
            value={`${gameweekPoints || 0} points`}
            subtitle={`Rank: #${gameweekRank?.toLocaleString() || '-'}`}
            status={gameweekStatus === 'during' ? 'live' : gameweekStatus === 'after' ? 'finished' : 'upcoming'}
            color="fpl"
          />
          <MetricCard
            title="Squad Value"
            icon="💰"
            value={`£${(teamData.value / 10).toFixed(1)}m`}
            subtitle={`Purchased: £${(teamData.value / 10).toFixed(1)}m`}
            change={calculateValueChange(teamData)}
            color="fpl"
          />
          <MetricCard
            title="Transfers"
            icon="🔄"
            value={`${freeTransfers || 0} Free Transfer${freeTransfers !== 1 ? 's' : ''}`}
            subtitle={transferCost > 0 ? `Cost: £${transferCost}` : undefined}
            color="fpl"
          />
        </div>

        {/* Action Items & Alerts */}
        <ActionItemsSection alerts={alerts} />

        {/* Recent Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart history={historyData?.current || []} />
          </div>
          <div className="space-y-4">
            {/* Performance Summary Cards */}
          </div>
        </div>

        {/* League Standings Summary */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">League Standings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Rank Card */}
            <div className="glass rounded-2xl p-6 border-3 border-[var(--fpl-primary)]">
              {/* Overall rank display */}
            </div>
            {/* League Cards */}
            {leagues.map(league => (
              <LeagueCard key={league.id} {...league} />
            ))}
          </div>
        </div>

        {/* Squad Status */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Squad Status</h2>
          {/* Squad summary, key players, value */}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <QuickActionButton
            icon="🔄"
            label="Make Transfers"
            href="/fantasy-football/transfers"
            variant="primary"
          />
          <QuickActionButton
            icon="👑"
            label="Pick Captain"
            href="/fantasy-football/captain"
            variant="primary"
            badge={!captainSet}
          />
          <QuickActionButton
            icon="⚽"
            label="View Squad"
            href="/fantasy-football/squad"
          />
          <QuickActionButton
            icon="📈"
            label="View Analytics"
            href="/fantasy-football/analytics"
          />
          <QuickActionButton
            icon="🏆"
            label="View Leagues"
            href="/fantasy-football/leagues"
          />
          <QuickActionButton
            icon="📰"
            label="View News"
            href="/fantasy-football/news"
          />
        </div>
      </div>
    </div>
  );
}
```

---

## Component Structure

**New Components**:
```
frontend/src/components/fantasy-football/
  ├── MetricCard.tsx (new)
  ├── ActionItemsSection.tsx (new)
  ├── AlertCard.tsx (new)
  ├── PerformanceChart.tsx (new)
  ├── LeagueCard.tsx (new)
  └── QuickActionButton.tsx (new)
```

**New Page**:
```
frontend/src/app/fantasy-football/
  └── page.tsx (update existing)
```

---

## Data Fetching Strategy

### Parallel API Calls
```typescript
const [team, history, bootstrap] = await Promise.all([
  fplApi.getTeam(teamId),
  fplApi.getTeamHistory(teamId),
  fplApi.getBootstrap(),
]);
```

### Caching
- Cache bootstrap data (changes infrequently)
- Cache history data (only updates after gameweek)
- Refresh team data on page load

### Error Handling
- Show partial data if some APIs fail
- Display error messages for failed sections
- Provide retry buttons

---

## Context-Aware Content

### Gameweek Status Detection
```typescript
const getGameweekStatus = (bootstrap: BootstrapData) => {
  const currentEvent = bootstrap.events.find(e => e.is_current);
  if (!currentEvent) return 'between';
  
  const now = new Date();
  const deadline = new Date(currentEvent.deadline_time);
  const finished = currentEvent.finished;
  
  if (finished) return 'after';
  if (now < deadline) return 'before';
  return 'during';
};
```

### Conditional Rendering
```tsx
{gameweekStatus === 'before' && (
  <DeadlineCountdown deadline={deadline} />
)}
{gameweekStatus === 'during' && (
  <LivePointsDisplay points={livePoints} />
)}
{gameweekStatus === 'after' && (
  <FinalStatsDisplay stats={finalStats} />
)}
```

---

## Testing Requirements

### Visual Testing
- [ ] Hero section displays correctly (4 cards)
- [ ] Action items section collapsible and displays alerts
- [ ] Performance chart renders correctly
- [ ] League cards display correctly
- [ ] Squad status section shows correct information
- [ ] Quick actions grid displays correctly

### Functional Testing
- [ ] All metric cards show correct data
- [ ] Alert cards link to correct pages
- [ ] Performance chart shows last 5-6 gameweeks
- [ ] League cards link to league pages
- [ ] Quick actions navigate to correct pages
- [ ] Context-aware content adapts correctly

### Responsive Testing
- [ ] Desktop layout (4-column hero, side-by-side performance)
- [ ] Tablet layout (2x2 hero, stacked performance)
- [ ] Mobile layout (stacked everything)
- [ ] Touch targets adequate (44x44px minimum)

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces sections
- [ ] Focus states visible
- [ ] ARIA labels present
- [ ] Color contrast passes WCAG AA

---

## Success Criteria

Implementation is complete when:
- ✅ Hero section with 4 metric cards working
- ✅ Action items section with alerts working
- ✅ Performance chart displaying correctly
- ✅ League standings summary working
- ✅ Squad status section working
- ✅ Quick actions navigating correctly
- ✅ Context-aware content adapting correctly
- ✅ All components responsive (320px - 1920px)
- ✅ WCAG AA compliance maintained
- ✅ All tests passing

---

## Questions or Issues?

If you encounter any issues or need clarification:

1. **Design Questions**: Refer to `docs/features/fantasy-football-overview/fantasy-football-overview-design-spec.md`
2. **Requirements Questions**: Ask Product and Project Agent
3. **Technical Questions**: Use your best judgment, document decisions
4. **Component Questions**: Follow existing component patterns

---

## Next Steps

1. **Review Design Spec**: Read the complete design specification
2. **Plan Implementation**: Break down into tasks, estimate effort
3. **Start Implementation**: Begin with MetricCard component
4. **Test Continuously**: Test as you build
5. **Hand off to Tester**: Create test plan when complete

---

**Good luck with implementation! 🚀**

**Remember**: Focus on at-a-glance information, clear action items, and quick navigation to detailed features!

---

**Handoff Complete!**



