'use client';

import { useState, useEffect } from 'react';
import { fplApi } from '@/lib/api';

interface HistoryData {
  current: Array<{
    event: number;
    points: number;
    total_points: number;
    rank: number;
    rank_sort: number;
    overall_rank: number;
    bank: number;
    value: number; // Squad value in tenths (e.g., 1000 = £100.0m)
    event_transfers: number;
    event_transfers_cost: number;
    points_on_bench: number;
  }>;
  past: Array<any>;
  chips: Array<any>;
}

interface SquadValueGraphProps {
  teamId: number;
}

export default function SquadValueGraph({ teamId }: SquadValueGraphProps) {
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [teamId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fplApi.getTeamHistory(teamId);
      setHistory(data);
    } catch (err: any) {
      console.error('Failed to fetch history:', err);
      setError(err.message || 'Failed to load squad value history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Squad Value Over Time</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Squad Value Over Time</h3>
        <div className="h-64 flex items-center justify-center text-[var(--pl-text-muted)]">
          <div className="text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <div>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!history?.current || history.current.length === 0) {
    return (
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Squad Value Over Time</h3>
        <div className="h-64 flex items-center justify-center text-[var(--pl-text-muted)]">
          No history data available
        </div>
      </div>
    );
  }

  // Prepare data for the graph
  const graphData = history.current.map((entry) => ({
    gameweek: entry.event,
    value: entry.value / 10, // Convert from tenths to millions (e.g., 1000 -> 100.0)
    bank: entry.bank / 10, // Convert bank from tenths
    totalValue: (entry.value + entry.bank) / 10, // Total squad value including bank
  }));

  // Calculate stats
  const currentValue = graphData[graphData.length - 1]?.value || 0;
  const startingValue = graphData[0]?.value || 0;
  const valueChange = currentValue - startingValue;
  const maxValue = Math.max(...graphData.map(d => d.value));
  const minValue = Math.min(...graphData.map(d => d.value));

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <h3 className="text-lg sm:text-xl font-bold">Squad Value Over Time</h3>
        <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--pl-green)]"></div>
            <span className="text-[var(--pl-text-muted)]">Squad Value</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-[var(--pl-dark)]/50 rounded-lg p-3">
          <div className="text-xs text-[var(--pl-text-muted)] mb-1">Current Value</div>
          <div className="text-lg sm:text-xl font-bold">£{currentValue.toFixed(1)}m</div>
        </div>
        <div className="bg-[var(--pl-dark)]/50 rounded-lg p-3">
          <div className="text-xs text-[var(--pl-text-muted)] mb-1">Starting Value</div>
          <div className="text-lg sm:text-xl font-bold">£{startingValue.toFixed(1)}m</div>
        </div>
        <div className={`bg-[var(--pl-dark)]/50 rounded-lg p-3 ${valueChange >= 0 ? 'text-[var(--pl-green)]' : 'text-[var(--pl-pink)]'}`}>
          <div className="text-xs text-[var(--pl-text-muted)] mb-1">Change</div>
          <div className="text-lg sm:text-xl font-bold">
            {valueChange >= 0 ? '+' : ''}£{valueChange.toFixed(1)}m
          </div>
        </div>
        <div className="bg-[var(--pl-dark)]/50 rounded-lg p-3">
          <div className="text-xs text-[var(--pl-text-muted)] mb-1">Peak Value</div>
          <div className="text-lg sm:text-xl font-bold">£{maxValue.toFixed(1)}m</div>
        </div>
      </div>

      {/* Simple SVG Graph (no external dependencies) */}
      <div className="relative w-full overflow-x-auto">
        <div style={{ height: '300px', minWidth: '600px' }}>
          <svg width="100%" height="100%" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet" className="overflow-visible">
            <defs>
              <linearGradient id={`valueGradient-${teamId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--pl-green)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--pl-green)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {(() => {
              const min = Math.floor(minValue);
              const max = Math.ceil(maxValue);
              const range = max - min || 1; // Prevent division by zero
              const steps = 5;
              const step = range / steps;
              const padding = 40;
              const graphHeight = 220;
              const graphWidth = 520;
              const startX = 60;

              // Calculate points
              const points = graphData.map((entry, i) => {
                const x = startX + (i / Math.max(graphData.length - 1, 1)) * graphWidth;
                const y = padding + graphHeight - ((entry.value - min) / range) * graphHeight;
                return { x, y, entry };
              });

              return (
                <>
                  {/* Grid lines and Y-axis labels */}
                  {Array.from({ length: steps + 1 }).map((_, i) => {
                    const value = min + (step * i);
                    const y = padding + graphHeight - ((value - min) / range) * graphHeight;
                    return (
                      <g key={`grid-${i}`}>
                        <line
                          x1={startX}
                          y1={y}
                          x2={startX + graphWidth}
                          y2={y}
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="1"
                        />
                        <text
                          x={startX - 10}
                          y={y + 4}
                          fill="var(--pl-text-muted)"
                          fontSize="11"
                          textAnchor="end"
                        >
                          £{value.toFixed(1)}m
                        </text>
                      </g>
                    );
                  })}

                  {/* X-axis line */}
                  <line
                    x1={startX}
                    y1={padding + graphHeight}
                    x2={startX + graphWidth}
                    y2={padding + graphHeight}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                  />

                  {/* Area under curve */}
                  <path
                    d={`M ${startX} ${padding + graphHeight} ${points.map(p => `L ${p.x} ${p.y}`).join(' ')} L ${startX + graphWidth} ${padding + graphHeight} Z`}
                    fill={`url(#valueGradient-${teamId})`}
                  />

                  {/* Line */}
                  <path
                    d={`M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                    fill="none"
                    stroke="var(--pl-green)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data points and X-axis labels */}
                  {points.map((point, i) => {
                    const showLabel = i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 8) === 0;
                    
                    return (
                      <g key={`point-${i}`}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          fill="var(--pl-green)"
                          className="hover:r-5 transition-all cursor-pointer"
                        />
                        {showLabel && (
                          <text
                            x={point.x}
                            y={padding + graphHeight + 18}
                            fill="var(--pl-text-muted)"
                            fontSize="10"
                            textAnchor="middle"
                          >
                            GW{point.entry.gameweek}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Gameweek markers */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--pl-text-muted)]">
        <div>Showing {graphData.length} gameweeks</div>
        {valueChange > 0 && (
          <div className="text-[var(--pl-green)]">
            Value increased by £{valueChange.toFixed(1)}m
          </div>
        )}
        {valueChange < 0 && (
          <div className="text-[var(--pl-pink)]">
            Value decreased by £{Math.abs(valueChange).toFixed(1)}m
          </div>
        )}
        {valueChange === 0 && (
          <div className="text-[var(--pl-text-muted)]">
            Value unchanged
          </div>
        )}
      </div>
    </div>
  );
}

