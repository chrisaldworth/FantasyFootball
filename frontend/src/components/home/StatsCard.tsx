'use client';

interface StatsCardProps {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export default function StatsCard({
  value,
  label,
  trend,
  trendValue,
}: StatsCardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-[var(--pl-green)]'
      : trend === 'down'
      ? 'text-[var(--pl-pink)]'
      : 'text-[var(--pl-text-muted)]';

  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-bold text-gradient-primary mb-1">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">
        {label}
      </div>
      {trend && trendValue && (
        <div className={`text-xs ${trendColor} flex items-center justify-center gap-1`}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trendValue}
        </div>
      )}
    </div>
  );
}

