'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartComponentProps {
  type: 'line' | 'bar';
  data: Array<{ x: string | number; y: number }>;
  xLabel?: string;
  yLabel?: string;
  title?: string;
}

export default function ChartComponent({
  type,
  data,
  xLabel,
  yLabel,
  title,
}: ChartComponentProps) {
  // Transform data for recharts
  const chartData = data.map((d) => ({
    name: String(d.x),
    value: d.y,
  }));

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--pl-text-muted)"
                style={{ fontSize: '12px' }}
                label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5, style: { fill: 'var(--pl-text-muted)' } } : undefined}
              />
              <YAxis 
                stroke="var(--pl-text-muted)"
                style={{ fontSize: '12px' }}
                label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', style: { fill: 'var(--pl-text-muted)' } } : undefined}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--pl-card)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'var(--pl-text)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="var(--pl-green)" 
                strokeWidth={2}
                dot={{ fill: 'var(--pl-green)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--pl-text-muted)"
                style={{ fontSize: '12px' }}
                label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5, style: { fill: 'var(--pl-text-muted)' } } : undefined}
              />
              <YAxis 
                stroke="var(--pl-text-muted)"
                style={{ fontSize: '12px' }}
                label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', style: { fill: 'var(--pl-text-muted)' } } : undefined}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--pl-card)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'var(--pl-text)'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="var(--pl-green)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

