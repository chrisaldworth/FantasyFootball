'use client';

interface SectionHeaderProps {
  type: 'fpl' | 'team';
  title: string;
  subtitle?: string;
  icon?: string;
  teamLogo?: string;
  teamName?: string;
  className?: string;
}

export default function SectionHeader({
  type,
  title,
  subtitle,
  icon,
  teamLogo,
  teamName,
  className = '',
}: SectionHeaderProps) {
  const isFPL = type === 'fpl';

  const defaultIcon = isFPL ? '⚽' : '🏆';
  const displayIcon = icon || (teamLogo ? null : defaultIcon);

  const borderColor = isFPL
    ? 'border-[var(--fpl-primary)]'
    : 'border-[var(--team-primary)]';

  const bgColor = isFPL
    ? 'bg-[var(--fpl-bg-tint)]'
    : 'bg-[var(--team-primary)]/10';

  const textColor = isFPL
    ? 'text-[var(--fpl-primary)]'
    : 'text-[var(--team-primary)]';

  return (
    <div className={`px-4 sm:px-6 py-4 border-b-[3px] ${borderColor} ${bgColor} ${className}`}>
      <div className="flex items-center gap-3">
        {displayIcon && (
          <span className="text-3xl sm:text-4xl" aria-hidden="true">{displayIcon}</span>
        )}
        {teamLogo && !displayIcon && (
          <img
            src={teamLogo}
            alt={teamName || 'Team'}
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            aria-hidden="true"
          />
        )}
        <div>
          <h2 className={`text-xl sm:text-2xl font-bold ${textColor}`}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-[var(--pl-text-muted)]">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

