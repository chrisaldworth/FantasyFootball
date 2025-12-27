'use client';

import { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
}

export default function MetricCard({
  label,
  value,
  trend,
  trendValue,
  icon,
}: MetricCardProps) {
  return (
    <div className="rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#999999]">{label}</span>
        {icon && <div className="text-[#10b981]">{icon}</div>}
      </div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      {trend && trendValue && (
        <div className={`text-sm flex items-center gap-1 ${
          trend === 'up' ? 'text-[#10b981]' : 
          trend === 'down' ? 'text-[#ef4444]' : 
          'text-[#999999]'
        }`}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trendValue}
        </div>
      )}
    </div>
  );
}

