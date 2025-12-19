'use client';

import { useMemo } from 'react';

interface HistoryEntry {
  event: number;
  points: number;
}

interface FPLHistory {
  current: HistoryEntry[];
}

interface FormComparisonChartProps {
  history: FPLHistory | null;
  timeRange: 'all' | 'last10' | 'last5';
  averagePoints?: number[]; // Optional: average points per gameweek from backend
}

export default function FormComparisonChart({ history, timeRange, averagePoints }: FormComparisonChartProps) {
  const chartData = useMemo(() => {
    if (!history?.current || history.current.length === 0) return [];

    let filteredHistory = [...history.current];
    if (timeRange === 'last10') {
      filteredHistory = filteredHistory.slice(-10);
    } else if (timeRange === 'last5') {
      filteredHistory = filteredHistory.slice(-5);
    }

    return filteredHistory.map((entry, index) => ({
      gameweek: entry.event,
      userPoints: entry.points,
      averagePoints: averagePoints?.[index] || null, // Use provided average or null
    }));
  }, [history, timeRange, averagePoints]);

  const primaryColor = 'var(--pl-green)';
  const neutralColor = 'var(--pl-text-muted)';

  if (!history?.current || history.current.length === 0) {
    return (
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4">Form vs Average</h3>
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
    const recharts = require('recharts');
    const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } = recharts;
    ChartComponent = { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend };
  } catch (e) {
    // recharts not installed - show message
    return (
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4">Form vs Average</h3>
        <div className="h-64 sm:h-80 flex items-center justify-center">
          <div className="text-center text-[var(--pl-text-muted)]">
            <div className="text-2xl mb-2">📊</div>
            <div>Chart library required</div>
            <div className="text-sm mt-2">Install recharts to view comparison</div>
          </div>
        </div>
      </div>
    );
  }

  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } = ChartComponent;

  const hasAverageData = averagePoints && averagePoints.length > 0;

  return (
    <div className="glass rounded-xl p-4 sm:p-6" role="region" aria-label="Form Comparison Chart">
      <h3 className="text-lg sm:text-xl font-bold mb-4">Form vs Average</h3>
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
              formatter={(value: number, name: string) => {
                if (name === 'userPoints') return [`${value} pts`, 'Your Points'];
                if (name === 'averagePoints') return [`${value} pts`, 'Average Points'];
                return [value, name];
              }}
              labelFormatter={(label: string | number) => `GW ${label}`}
            />
            <Legend 
              wrapperStyle={{ color: 'var(--pl-text-muted)', fontSize: '12px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="userPoints"
              name="Your Points"
              stroke={primaryColor}
              strokeWidth={2.5}
              dot={{ fill: primaryColor, r: 4 }}
              activeDot={{ r: 6 }}
            />
            {hasAverageData && (
              <Line
                type="monotone"
                dataKey="averagePoints"
                name="Average Points"
                stroke={neutralColor}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: neutralColor, r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {!hasAverageData && (
        <p className="text-xs text-[var(--pl-text-muted)] mt-2 text-center">
          Average points data not available
        </p>
      )}
    </div>
  );
}

