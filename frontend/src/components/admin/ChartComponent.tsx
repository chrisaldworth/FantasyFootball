'use client';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartComponentProps {
  type: 'line' | 'bar' | 'pie';
  data: any[];
  dataKey: string;
  nameKey?: string;
  title?: string;
  height?: number;
  colors?: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
}

const DEFAULT_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ChartComponent({
  type,
  data,
  dataKey,
  nameKey = 'name',
  title,
  height = 300,
  colors = DEFAULT_COLORS,
  xAxisLabel,
  yAxisLabel,
  showLegend = true,
  showGrid = true,
}: ChartComponentProps) {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />}
              <XAxis 
                dataKey={nameKey} 
                stroke="#999999"
                label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, fill: '#999999' } : undefined}
              />
              <YAxis 
                stroke="#999999"
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#999999' } : undefined}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                labelStyle={{ color: '#999999' }}
              />
              {showLegend && <Legend wrapperStyle={{ color: '#999999' }} />}
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={colors[0]} 
                strokeWidth={2}
                dot={{ fill: colors[0], r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />}
              <XAxis 
                dataKey={nameKey} 
                stroke="#999999"
                label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, fill: '#999999' } : undefined}
              />
              <YAxis 
                stroke="#999999"
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#999999' } : undefined}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                labelStyle={{ color: '#999999' }}
              />
              {showLegend && <Legend wrapperStyle={{ color: '#999999' }} />}
              <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              {showLegend && <Legend wrapperStyle={{ color: '#999999' }} />}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      {renderChart()}
    </div>
  );
}

