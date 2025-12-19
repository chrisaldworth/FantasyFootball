'use client';

interface NewsTypeBadgeProps {
  type: 'team' | 'player';
  teamLogo?: string; // For team news
  playerName?: string; // For player news (optional, for accessibility)
}

export default function NewsTypeBadge({ type, teamLogo, playerName }: NewsTypeBadgeProps) {
  const ariaLabel = type === 'team' 
    ? 'Team news' 
    : `Player news${playerName ? `: ${playerName}` : ''}`;

  if (type === 'team') {
    return (
      <div
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold uppercase"
        style={{
          backgroundColor: 'var(--team-primary)',
          color: 'var(--team-text-on-primary)',
        }}
        aria-label={ariaLabel}
      >
        {teamLogo && (
          <img
            src={teamLogo}
            alt=""
            className="w-4 h-4 object-contain"
            aria-hidden="true"
          />
        )}
        <span>TEAM</span>
      </div>
    );
  }

  // Player badge
  return (
    <div
      className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold uppercase bg-[#00ff87]/20 text-white border border-[#00ff87]"
      aria-label={ariaLabel}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      <span>PLAYER</span>
    </div>
  );
}

