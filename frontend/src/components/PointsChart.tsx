'use client';

import { useMemo } from 'react';

interface HistoryEntry {
  event: number;
  points: number;
}

interface FPLHistory {
  current: HistoryEntry[];
}

interface PointsChartProps {
  history: FPLHistory | null;
  timeRange: 'all' | 'last10' | 'last5';
}

export default function PointsChart({ history, timeRange }: PointsChartProps) {
  const chartData = useMemo(() => {
    if (!history?.current || history.current.length === 0) return [];

    let filteredHistory = [...history.current];
    if (timeRange === 'last10') {
      filteredHistory = filteredHistory.slice(-10);
    } else if (timeRange === 'last5') {
      filteredHistory = filteredHistory.slice(-5);
    }

    return filteredHistory.map((entry) => ({
      gameweek: entry.event,
      points: entry.points,
    }));
  }, [history, timeRange]);

  const primaryColor = 'var(--pl-green)';

  if (!history?.current || history.current.length === 0) {
    return (
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4">Points Per Gameweek</h3>
        <div className="h-64 sm:h-80 flex items-center justify-center text-[var(--pl-text-muted)]">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <div>No data available</div>
          </div>
        </div>
      </div>
    );
  }

  // Check if recharts is available
  let ChartComponent: any = null;
  try {
    // Dynamic import to handle case where recharts isn't installed
    const recharts = require('recharts');
    const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = recharts;
    ChartComponent = { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer };
  } catch (e) {
    // recharts not installed - fallback to SVG
    return (
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4">Points Per Gameweek</h3>
        <div className="h-64 sm:h-80 flex items-center justify-center">
          <SimpleSVGChart data={chartData} color={primaryColor} />
        </div>
      </div>
    );
  }

  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = ChartComponent;

  return (
    <div className="glass rounded-xl p-4 sm:p-6" role="region" aria-label="Points Per Gameweek Chart">
      <h3 className="text-lg sm:text-xl font-bold mb-4">Points Per Gameweek</h3>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="gameweek" 
              stroke="var(--pl-text-muted)"
              tick={{ fill: 'var(--pl-text-muted)', fontSize: 12 }}
              label={{ value: 'Gameweek', position: 'insideBottom', offset: -5, fill: 'var(--pl-text-muted)' }}
            />
            <YAxis 
              stroke="var(--pl-text-muted)"
              tick={{ fill: 'var(--pl-text-muted)', fontSize: 12 }}
              label={{ value: 'Points', angle: -90, position: 'insideLeft', fill: 'var(--pl-text-muted)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--pl-dark)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
              }}
              labelStyle={{ color: 'var(--pl-text-muted)' }}
              formatter={(value: number) => [`${value} pts`, 'Points']}
              labelFormatter={(label: string | number) => `GW ${label}`}
            />
            <Line
              type="monotone"
              dataKey="points"
              stroke={primaryColor}
              strokeWidth={2.5}
              dot={{ fill: primaryColor, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Fallback SVG chart component
function SimpleSVGChart({ data, color }: { data: Array<{ gameweek: number; points: number }>, color: string }) {
  if (data.length === 0) {
    return <div className="text-[var(--pl-text-muted)]">No data available</div>;
  }

  const maxPoints = Math.max(...data.map(d => d.points), 0);
  const minPoints = Math.min(...data.map(d => d.points), 0);
  const range = maxPoints - minPoints || 1;
  const padding = 40;
  const graphHeight = 200;
  const graphWidth = Math.max(400, data.length * 30);
  const startX = 60;

  const points = data.map((entry, i) => {
    const x = startX + (i / Math.max(data.length - 1, 1)) * (graphWidth - startX - 20);
    const y = padding + graphHeight - ((entry.points - minPoints) / range) * graphHeight;
    return { x, y, ...entry };
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg width={graphWidth} height={300} viewBox={`0 0 ${graphWidth} 300`} className="overflow-visible">
        <defs>
          <linearGradient id="pointsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const value = minPoints + (range / 4) * i;
          const y = padding + graphHeight - ((value - minPoints) / range) * graphHeight;
          return (
            <g key={`grid-${i}`}>
              <line
                x1={startX}
                y1={y}
                x2={graphWidth - 20}
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
                {Math.round(value)}
              </text>
            </g>
          );
        })}

        {/* Area under curve */}
        <path
          d={`M ${startX} ${padding + graphHeight} ${points.map(p => `L ${p.x} ${p.y}`).join(' ')} L ${graphWidth - 20} ${padding + graphHeight} Z`}
          fill="url(#pointsGradient)"
        />

        {/* Line */}
        <path
          d={`M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <g key={`point-${i}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
            />
            {i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 8) === 0 ? (
              <text
                x={point.x}
                y={padding + graphHeight + 18}
                fill="var(--pl-text-muted)"
                fontSize="10"
                textAnchor="middle"
              >
                GW{point.gameweek}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}

