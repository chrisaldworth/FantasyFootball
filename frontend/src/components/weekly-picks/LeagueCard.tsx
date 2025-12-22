'use client';

interface LeagueCardProps {
  league: {
    id: number;
    name: string;
    memberCount: number;
    yourRank: number;
    type: 'weekly' | 'seasonal' | 'both';
  };
  onClick: () => void;
}

export default function LeagueCard({
  league,
  onClick,
}: LeagueCardProps) {
  const getTypeBadge = () => {
    if (league.type === 'both') {
      return (
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded bg-[var(--pl-green)]/20 text-[var(--pl-green)] text-xs font-medium">
            Weekly
          </span>
          <span className="px-2 py-1 rounded bg-[var(--pl-cyan)]/20 text-[var(--pl-cyan)] text-xs font-medium">
            Seasonal
          </span>
        </div>
      );
    }
    if (league.type === 'weekly') {
      return (
        <span className="px-2 py-1 rounded bg-[var(--pl-green)]/20 text-[var(--pl-green)] text-xs font-medium">
          Weekly
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded bg-[var(--pl-cyan)]/20 text-[var(--pl-cyan)] text-xs font-medium">
        Seasonal
      </span>
    );
  };

  return (
    <button
      onClick={onClick}
      className="glass rounded-xl p-4 sm:p-6 w-full text-left transition-all hover:scale-[1.02] hover:border-[var(--pl-green)]/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">{league.name}</h3>
        {getTypeBadge()}
      </div>
      
      <div className="text-sm text-[var(--pl-text-muted)] mb-3">
        {league.memberCount} {league.memberCount === 1 ? 'member' : 'members'} • Your rank: #{league.yourRank}
      </div>

      <div className="text-sm text-[var(--pl-green)] font-medium">
        View League →
      </div>
    </button>
  );
}

