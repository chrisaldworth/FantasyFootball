'use client';

import { useState } from 'react';
import MetricsSummary from './MetricsSummary';
import PointsChart from './PointsChart';
import RankChart from './RankChart';
import FormComparisonChart from './FormComparisonChart';
import ChipUsageTimeline from './ChipUsageTimeline';
import SquadValueGraph from './SquadValueGraph';
import { useAuth } from '@/lib/auth-context';

interface HistoryEntry {
  event: number;
  points: number;
  total_points: number;
  overall_rank: number;
}

interface Chip {
  name: string;
  event: number;
}

interface FPLHistory {
  current: HistoryEntry[];
  chips: Chip[];
}

interface AnalyticsDashboardProps {
  history: FPLHistory | null;
  totalGameweeks: number;
}

type TimeRange = 'all' | 'last10' | 'last5';

export default function AnalyticsDashboard({ history, totalGameweeks }: AnalyticsDashboardProps) {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  if (!history) {
    return (
      <div className="space-y-6">
        <div className="glass rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
          <p className="text-[var(--pl-text-muted)]">
            Complete a gameweek to see your analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="main" aria-label="Analytics Dashboard">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">Analytics</h2>
        
        {/* Desktop: Button Group */}
        <div className="hidden sm:flex gap-2 p-1 rounded-lg bg-[var(--pl-dark)]/50">
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              timeRange === 'all'
                ? 'bg-[var(--pl-green)] text-[var(--pl-dark)]'
                : 'text-[var(--pl-text-muted)] hover:text-white'
            }`}
            aria-pressed={timeRange === 'all'}
          >
            All Season
          </button>
          <button
            onClick={() => setTimeRange('last10')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              timeRange === 'last10'
                ? 'bg-[var(--pl-green)] text-[var(--pl-dark)]'
                : 'text-[var(--pl-text-muted)] hover:text-white'
            }`}
            aria-pressed={timeRange === 'last10'}
          >
            Last 10 GWs
          </button>
          <button
            onClick={() => setTimeRange('last5')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              timeRange === 'last5'
                ? 'bg-[var(--pl-green)] text-[var(--pl-dark)]'
                : 'text-[var(--pl-text-muted)] hover:text-white'
            }`}
            aria-pressed={timeRange === 'last5'}
          >
            Last 5 GWs
          </button>
        </div>

        {/* Mobile: Select Dropdown */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          className="sm:hidden input-field text-sm"
          aria-label="Select time range"
        >
          <option value="all">All Season</option>
          <option value="last10">Last 10 GWs</option>
          <option value="last5">Last 5 GWs</option>
        </select>
      </div>

      {/* Metrics Summary Cards */}
      <MetricsSummary history={history} timeRange={timeRange} />

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Points Chart */}
        <PointsChart history={history} timeRange={timeRange} />

        {/* Rank Chart */}
        <RankChart history={history} timeRange={timeRange} />

        {/* Form Comparison Chart */}
        <FormComparisonChart history={history} timeRange={timeRange} />

        {/* Squad Value Graph */}
        {user?.fpl_team_id && (
          <SquadValueGraph teamId={user.fpl_team_id} />
        )}
      </div>

      {/* Chip Usage Timeline (Full Width) */}
      <ChipUsageTimeline chips={history.chips} totalGameweeks={totalGameweeks} />
    </div>
  );
}


