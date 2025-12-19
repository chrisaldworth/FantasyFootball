'use client';

interface ContentTypeBadgeProps {
  type: 'fpl' | 'team';
  label?: string;
  teamName?: string;
  teamLogo?: string;
  position?: 'top-right' | 'top-left';
}

export default function ContentTypeBadge({
  type,
  label,
  teamName,
  teamLogo,
  position = 'top-right',
}: ContentTypeBadgeProps) {
  const isFPL = type === 'fpl';

  const bgColor = isFPL
    ? 'bg-[var(--fpl-primary)]'
    : 'bg-[var(--team-primary)]';

  const textColor = isFPL
    ? 'text-[var(--fpl-text-on-primary)]'
    : 'text-[var(--team-text-on-primary)]';

  const icon = isFPL ? '⚽' : (teamLogo ? null : '🏆');
  const displayLabel = label || (isFPL ? 'FPL' : (teamName || 'TEAM'));

  const positionClass = position === 'top-right'
    ? 'top-4 right-4'
    : 'top-4 left-4';

  return (
    <div
      className={`absolute ${positionClass} flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold uppercase ${bgColor} ${textColor} z-10`}
      aria-label={isFPL ? 'Fantasy Football content' : `${teamName || 'Team'} content`}
    >
      {icon && <span className="text-base" aria-hidden="true">{icon}</span>}
      {teamLogo && !icon && (
        <img src={teamLogo} alt={teamName || 'Team'} className="w-4 h-4 object-contain" aria-hidden="true" />
      )}
      <span>{displayLabel}</span>
    </div>
  );
}

