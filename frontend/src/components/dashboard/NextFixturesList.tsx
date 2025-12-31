'use client';

import TeamLogoEnhanced from '@/components/TeamLogoEnhanced';

interface NextFixturesListProps {
  fixtures: Array<{
    date: string;
    homeTeam: string;
    homeTeamId: number | null;
    awayTeam: string;
    awayTeamId: number | null;
    isHome: boolean;
  }>;
  favoriteTeamName?: string;
}

export default function NextFixturesList({ fixtures, favoriteTeamName }: NextFixturesListProps) {
  if (fixtures.length === 0) {
    return null;
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="glass rounded-xl p-1.5 sm:p-6">
      <h3 className="text-xs sm:text-xl font-semibold text-white mb-1.5 sm:mb-4">
        Next 5 Fixtures
        {favoriteTeamName && <span className="text-[var(--pl-text-muted)] text-[10px] sm:text-base"> - {favoriteTeamName}</span>}
      </h3>
      <div className="space-y-1 sm:space-y-3">
        {fixtures.map((fixture, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-1.5 sm:p-3 bg-[var(--pl-dark)]/50 rounded-lg border border-white/10 hover:border-[var(--pl-green)]/30 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Home Team */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {fixture.homeTeamId && (
                  <TeamLogoEnhanced teamId={fixture.homeTeamId} size={24} style="shield" />
                )}
                <span className={`text-sm font-medium ${fixture.isHome ? 'text-[var(--pl-green)]' : 'text-white'}`}>
                  {fixture.homeTeam}
                </span>
              </div>
              
              <span className="text-[var(--pl-text-muted)] text-sm">vs</span>
              
              {/* Away Team */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {fixture.awayTeamId && (
                  <TeamLogoEnhanced teamId={fixture.awayTeamId} size={24} style="shield" />
                )}
                <span className={`text-sm font-medium ${!fixture.isHome ? 'text-[var(--pl-green)]' : 'text-white'}`}>
                  {fixture.awayTeam}
                </span>
              </div>
            </div>
            
            {/* Date */}
            <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] flex-shrink-0 ml-4">
              {formatDate(fixture.date)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


