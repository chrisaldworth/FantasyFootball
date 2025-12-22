'use client';

interface DashboardHeaderProps {
  userName: string;
  rank?: number;
  points?: number;
  gameweek?: number;
}

export default function DashboardHeader({
  userName,
  rank,
  points,
  gameweek,
}: DashboardHeaderProps) {
  const formatRank = (rank?: number) => {
    if (!rank) return 'N/A';
    return `#${rank.toLocaleString()}`;
  };

  const formatPoints = (points?: number) => {
    if (!points) return 'N/A';
    return points.toLocaleString();
  };

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">
        Welcome back, {userName}
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gradient-primary mb-1">
            {formatRank(rank)}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)]">Rank</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gradient-primary mb-1">
            {formatPoints(points)}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)]">Points</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gradient-primary mb-1">
            GW {gameweek || 'N/A'}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)]">Gameweek</div>
        </div>
      </div>
    </div>
  );
}

