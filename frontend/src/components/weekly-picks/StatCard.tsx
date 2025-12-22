'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  comparison?: string; // "vs. average"
}

export default function StatCard({
  label,
  value,
  trend,
  trendValue,
  comparison,
}: StatCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-[var(--pl-green)]';
    if (trend === 'down') return 'text-[var(--pl-pink)]';
    return 'text-[var(--pl-text-muted)]';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '—';
  };

  return (
    <div className="glass rounded-xl p-4 sm:p-6 text-center">
      <div className="text-2xl sm:text-3xl font-bold text-gradient-primary mb-2">
        {value}
      </div>
      <div className="text-sm text-[var(--pl-text-muted)] mb-2">
        {label}
      </div>
      {trend && trendValue && (
        <div className={`text-xs ${getTrendColor()} flex items-center justify-center gap-1`}>
          <span>{getTrendIcon()}</span>
          <span>{trendValue}</span>
          {comparison && (
            <span className="text-[var(--pl-text-muted)] ml-1">vs. {comparison}</span>
          )}
        </div>
      )}
    </div>
  );
}

