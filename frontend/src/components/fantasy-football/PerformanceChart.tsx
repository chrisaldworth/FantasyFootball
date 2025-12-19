'use client';

import { useMemo, useState } from 'react';
import PointsChart from '@/components/PointsChart';
import RankChart from '@/components/RankChart';

interface HistoryEntry {
  event: number;
  points: number;
  total_points: number;
  overall_rank: number;
  rank: number;
}

interface PerformanceChartProps {
  history: HistoryEntry[] | null;
  timeRange?: 'last5' | 'last10' | 'all';
}

export default function PerformanceChart({ 
  history, 
  timeRange: initialTimeRange = 'last5' 
}: PerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<'last5' | 'last10' | 'all'>(initialTimeRange);

  const historyData = useMemo(() => {
    if (!history || history.length === 0) return null;
    
    return {
      current: history,
    };
  }, [history]);

  const stats = useMemo(() => {
    if (!history || history.length === 0) return null;

    const filtered = timeRange === 'last5' 
      ? history.slice(-5) 
      : timeRange === 'last10' 
      ? history.slice(-10) 
      : history;

    if (filtered.length === 0) return null;

    const points = filtered.map(h => h.points);
    const avgPoints = points.reduce((a, b) => a + b, 0) / points.length;
    const bestGW = filtered.reduce((best, curr) => curr.points > best.points ? curr : best);
    const worstGW = filtered.reduce((worst, curr) => curr.points < worst.points ? curr : worst);
    const totalPoints = filtered.reduce((sum, h) => sum + h.points, 0);

    return {
      avgPoints: Math.round(avgPoints * 10) / 10,
      bestGW: { event: bestGW.event, points: bestGW.points },
      worstGW: { event: worstGW.event, points: worstGW.points },
      totalPoints,
    };
  }, [history, timeRange]);

  if (!history || history.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Recent Performance</h2>
        <div className="h-64 flex items-center justify-center text-[var(--pl-text-muted)]">
          <p>No performance data available</p>
        </div>
      </div>
    );
  }

  const chartTimeRange = timeRange === 'last5' ? 'last5' : timeRange === 'last10' ? 'last10' : 'all';

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Performance</h2>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setTimeRange('last5')}
            className={`px-3 py-1 rounded transition-colors ${
              timeRange === 'last5' 
                ? 'bg-[var(--fpl-primary)] text-[var(--fpl-text-on-primary)]' 
                : 'bg-[var(--pl-card)] text-[var(--pl-text-muted)] hover:bg-[var(--pl-card-hover)]'
            }`}
          >
            Last 5
          </button>
          <button
            onClick={() => setTimeRange('last10')}
            className={`px-3 py-1 rounded transition-colors ${
              timeRange === 'last10' 
                ? 'bg-[var(--fpl-primary)] text-[var(--fpl-text-on-primary)]' 
                : 'bg-[var(--pl-card)] text-[var(--pl-text-muted)] hover:bg-[var(--pl-card-hover)]'
            }`}
          >
            Last 10
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        <PointsChart history={historyData} timeRange={chartTimeRange} />
        <RankChart history={historyData} timeRange={chartTimeRange} />
        
        {stats && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--pl-border)]">
            <div className="text-center">
              <div className="text-sm text-[var(--pl-text-muted)] mb-1">Avg Points</div>
              <div className="text-2xl font-bold text-[var(--fpl-primary)]">
                {stats.avgPoints}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-[var(--pl-text-muted)] mb-1">Best GW</div>
              <div className="text-2xl font-bold text-[var(--pl-green)]">
                GW{stats.bestGW.event}: {stats.bestGW.points}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-[var(--pl-text-muted)] mb-1">Worst GW</div>
              <div className="text-2xl font-bold text-[var(--pl-pink)]">
                GW{stats.worstGW.event}: {stats.worstGW.points}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

