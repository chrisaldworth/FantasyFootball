'use client';

interface MetricCardProps {
  title: string;
  icon?: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  status?: 'live' | 'finished' | 'upcoming';
  color?: 'fpl' | 'team';
}

export default function MetricCard({
  title,
  icon,
  value,
  subtitle,
  change,
  status,
  color = 'fpl',
}: MetricCardProps) {
  const isFPL = color === 'fpl';
  const borderColor = isFPL ? 'border-[var(--fpl-primary)]' : 'border-[var(--pl-green)]';
  const bgColor = isFPL ? 'bg-[var(--fpl-primary)]/10' : 'bg-[var(--pl-green)]/10';
  const textColor = isFPL ? 'text-[var(--fpl-primary)]' : 'text-[var(--pl-green)]';

  const changeColor = change?.direction === 'up' 
    ? 'text-[var(--pl-green)]' 
    : change?.direction === 'down' 
    ? 'text-[var(--pl-pink)]' 
    : 'text-[var(--pl-text-muted)]';

  const changeIcon = change?.direction === 'up' 
    ? '↑' 
    : change?.direction === 'down' 
    ? '↓' 
    : '→';

  return (
    <div className={`rounded-2xl border-2 ${borderColor} ${bgColor} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl" aria-hidden="true">{icon}</span>}
          <h3 className="text-sm font-semibold text-[var(--pl-text-muted)]">{title}</h3>
        </div>
        {status && (
          <span className={`text-xs px-2 py-1 rounded ${
            status === 'live' 
              ? 'bg-[var(--pl-pink)] text-white animate-pulse' 
              : status === 'finished' 
              ? 'bg-[var(--pl-text-muted)] text-white' 
              : 'bg-[var(--pl-cyan)] text-white'
          }`}>
            {status.toUpperCase()}
          </span>
        )}
      </div>
      <div className={`text-3xl sm:text-4xl font-bold ${textColor} mb-2`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-sm text-[var(--pl-text-muted)] mb-2">
          {subtitle}
        </div>
      )}
      {change && (
        <div className={`text-sm font-medium ${changeColor} flex items-center gap-1`}>
          <span aria-hidden="true">{changeIcon}</span>
          <span>{Math.abs(change.value).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

