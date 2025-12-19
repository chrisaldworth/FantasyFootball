'use client';

import { useMemo } from 'react';

interface HistoryEntry {
  event: number;
  points: number;
  total_points: number;
  overall_rank: number;
}

interface FPLHistory {
  current: HistoryEntry[];
}

interface MetricsSummaryProps {
  history: FPLHistory | null;
  timeRange: 'all' | 'last10' | 'last5';
}

export default function MetricsSummary({ history, timeRange }: MetricsSummaryProps) {

  const metrics = useMemo(() => {
    if (!history?.current || history.current.length === 0) {
      return {
        totalPoints: 0,
        averagePoints: 0,
        bestGameweek: null as { event: number; points: number } | null,
        worstGameweek: null as { event: number; points: number } | null,
      };
    }

    // Filter by time range
    let filteredHistory = [...history.current];
    if (timeRange === 'last10') {
      filteredHistory = filteredHistory.slice(-10);
    } else if (timeRange === 'last5') {
      filteredHistory = filteredHistory.slice(-5);
    }

    if (filteredHistory.length === 0) {
      return {
        totalPoints: 0,
        averagePoints: 0,
        bestGameweek: null,
        worstGameweek: null,
      };
    }

    const totalPoints = filteredHistory[filteredHistory.length - 1]?.total_points || 0;
    const pointsArray = filteredHistory.map((entry) => entry.points);
    const averagePoints = pointsArray.length > 0
      ? Math.round(pointsArray.reduce((sum, p) => sum + p, 0) / pointsArray.length)
      : 0;

    const bestGameweek = filteredHistory.reduce((best, current) => 
      current.points > best.points ? current : best,
      filteredHistory[0]
    );

    const worstGameweek = filteredHistory.reduce((worst, current) => 
      current.points < worst.points ? current : worst,
      filteredHistory[0]
    );

    return {
      totalPoints,
      averagePoints,
      bestGameweek: { event: bestGameweek.event, points: bestGameweek.points },
      worstGameweek: { event: worstGameweek.event, points: worstGameweek.points },
    };
  }, [history, timeRange]);

  const primaryColor = 'var(--pl-green)';

  if (!history?.current || history.current.length === 0) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass rounded-xl p-4">
            <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">Loading...</div>
            <div className="h-8 bg-[var(--pl-dark)]/50 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" role="region" aria-label="Performance Metrics Summary">
      {/* Total Points */}
      <div className="glass rounded-xl p-4 hover:scale-105 transition-transform">
        <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">Total Points</div>
        <div 
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: primaryColor }}
        >
          {metrics.totalPoints.toLocaleString()}
        </div>
      </div>

      {/* Average Points */}
      <div className="glass rounded-xl p-4 hover:scale-105 transition-transform">
        <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">Average Points</div>
        <div 
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: primaryColor }}
        >
          {metrics.averagePoints}
        </div>
      </div>

      {/* Best Gameweek */}
      <div className="glass rounded-xl p-4 hover:scale-105 transition-transform">
        <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">Best GW</div>
        {metrics.bestGameweek ? (
          <div>
            <div 
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: primaryColor }}
            >
              {metrics.bestGameweek.points}
            </div>
            <div className="text-xs text-[var(--pl-text-muted)] mt-1">
              GW {metrics.bestGameweek.event}
            </div>
          </div>
        ) : (
          <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-text-muted)]">-</div>
        )}
      </div>

      {/* Worst Gameweek */}
      <div className="glass rounded-xl p-4 hover:scale-105 transition-transform">
        <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">Worst GW</div>
        {metrics.worstGameweek ? (
          <div>
            <div 
              className="text-2xl sm:text-3xl font-bold text-[var(--pl-pink)]"
            >
              {metrics.worstGameweek.points}
            </div>
            <div className="text-xs text-[var(--pl-text-muted)] mt-1">
              GW {metrics.worstGameweek.event}
            </div>
          </div>
        ) : (
          <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-text-muted)]">-</div>
        )}
      </div>
    </div>
  );
}


