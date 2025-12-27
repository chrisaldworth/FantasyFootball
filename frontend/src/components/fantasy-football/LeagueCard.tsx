'use client';

import Link from 'next/link';

interface LeagueCardProps {
  leagueName: string;
  rank: number;
  totalTeams: number;
  rankChange?: number;
  leagueType: 'classic' | 'h2h' | 'cup';
  href: string;
}

export default function LeagueCard({
  leagueName,
  rank,
  totalTeams,
  rankChange,
  leagueType,
  href,
}: LeagueCardProps) {
  const rankChangeColor = rankChange && rankChange > 0
    ? 'text-[var(--pl-green)]'
    : rankChange && rankChange < 0
    ? 'text-[var(--pl-pink)]'
    : 'text-[var(--pl-text-muted)]';

  const rankChangeIcon = rankChange && rankChange > 0
    ? '↑'
    : rankChange && rankChange < 0
    ? '↓'
    : '→';

  return (
    <Link
      href={href}
      className="glass rounded-xl p-4 hover:bg-[var(--pl-card-hover)] transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{leagueName}</h3>
        <span className="text-xs text-[var(--pl-text-muted)]">
          {leagueType === 'classic' ? 'Classic' : leagueType === 'h2h' ? 'H2H' : 'Cup'}
        </span>
      </div>
      <div className="text-2xl font-bold text-[var(--fpl-primary)] mb-1">
        #{rank.toLocaleString()}
      </div>
      <div className="text-sm text-[var(--pl-text-muted)] mb-2">
        Out of {totalTeams.toLocaleString()} teams
      </div>
      {rankChange !== undefined && (
        <div className={`text-sm font-medium ${rankChangeColor} flex items-center gap-1`}>
          <span aria-hidden="true">{rankChangeIcon}</span>
          <span>{Math.abs(rankChange)}</span>
        </div>
      )}
    </Link>
  );
}



