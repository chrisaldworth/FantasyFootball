'use client';

import Link from 'next/link';

interface UserStatsBarProps {
  // FPL Stats
  fplRank?: number | null;
  fplRankChange?: number | null;
  fplPoints?: number | null;
  fplPointsBehindLeader?: number | null;
  
  // Prediction Stats
  predictionAccuracy?: number | null;
  predictionStreak?: number | null;
  correctPredictions?: number | null;
  totalPredictions?: number | null;
  
  // Weekly Picks Stats
  weeklyPicksStreak?: number | null;
  weeklyPicksRank?: number | null;
  totalPicksPoints?: number | null;
  
  // Engagement
  daysActive?: number | null;
  lastActive?: string | null;
}

export default function UserStatsBar({
  fplRank,
  fplRankChange,
  fplPoints,
  fplPointsBehindLeader,
  predictionAccuracy,
  predictionStreak,
  correctPredictions,
  totalPredictions,
  weeklyPicksStreak,
  weeklyPicksRank,
  totalPicksPoints,
  daysActive,
}: UserStatsBarProps) {
  
  // Only show if we have at least some stats
  const hasAnyStats = fplRank || predictionAccuracy || weeklyPicksStreak || weeklyPicksRank || daysActive;
  
  if (!hasAnyStats) {
    return null;
  }

  const formatRank = (rank: number) => {
    if (rank >= 1000000) {
      return `${(rank / 1000000).toFixed(1)}M`;
    } else if (rank >= 1000) {
      return `${(rank / 1000).toFixed(0)}K`;
    }
    return rank.toLocaleString();
  };

  return (
    <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* FPL Rank */}
        {fplRank && (
          <Link href="/fantasy-football" className="group">
            <div className="text-center p-2 sm:p-3 rounded-lg bg-[var(--pl-cyan)]/10 group-hover:bg-[var(--pl-cyan)]/20 transition-colors">
              <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)] mb-0.5">FPL Rank</div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-lg sm:text-2xl font-black text-[var(--pl-cyan)]">
                  #{formatRank(fplRank)}
                </span>
                {fplRankChange !== null && fplRankChange !== undefined && fplRankChange !== 0 && (
                  <span className={`text-xs font-bold ${fplRankChange > 0 ? 'text-[var(--pl-green)]' : 'text-[var(--pl-pink)]'}`}>
                    {fplRankChange > 0 ? '↑' : '↓'}{Math.abs(fplRankChange).toLocaleString()}
                  </span>
                )}
              </div>
              {fplPoints && (
                <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)]">{fplPoints} pts</div>
              )}
            </div>
          </Link>
        )}

        {/* Prediction Accuracy */}
        {predictionAccuracy !== null && predictionAccuracy !== undefined && (
          <Link href="/predictions" className="group">
            <div className="text-center p-2 sm:p-3 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
              <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)] mb-0.5">Prediction Acc.</div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-lg sm:text-2xl font-black text-purple-400">
                  {predictionAccuracy}%
                </span>
                {predictionStreak && predictionStreak > 0 && (
                  <span className="text-xs">🔥</span>
                )}
              </div>
              {correctPredictions !== null && totalPredictions !== null && (
                <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)]">{correctPredictions}/{totalPredictions} correct</div>
              )}
            </div>
          </Link>
        )}

        {/* Weekly Picks */}
        {(weeklyPicksStreak !== null || weeklyPicksRank !== null) && (
          <Link href="/weekly-picks" className="group">
            <div className="text-center p-2 sm:p-3 rounded-lg bg-[var(--pl-green)]/10 group-hover:bg-[var(--pl-green)]/20 transition-colors">
              <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)] mb-0.5">Weekly Picks</div>
              <div className="flex items-center justify-center gap-1">
                {weeklyPicksRank ? (
                  <span className="text-lg sm:text-2xl font-black text-[var(--pl-green)]">
                    #{weeklyPicksRank}
                  </span>
                ) : weeklyPicksStreak && weeklyPicksStreak > 0 ? (
                  <>
                    <span className="text-lg sm:text-2xl font-black text-[var(--pl-green)]">
                      {weeklyPicksStreak}
                    </span>
                    <span className="text-xs">🔥</span>
                  </>
                ) : (
                  <span className="text-lg sm:text-2xl font-black text-[var(--pl-green)]">
                    0
                  </span>
                )}
              </div>
              <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)]">
                {weeklyPicksRank ? 'Overall Rank' : 'Week Streak'}
              </div>
            </div>
          </Link>
        )}

        {/* Days Active / Engagement */}
        {daysActive !== null && daysActive !== undefined && (
          <div className="text-center p-2 sm:p-3 rounded-lg bg-amber-500/10">
            <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)] mb-0.5">Days Active</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-lg sm:text-2xl font-black text-amber-400">
                {daysActive}
              </span>
              {daysActive >= 7 && <span className="text-xs">⭐</span>}
            </div>
            <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)]">
              {daysActive >= 30 ? 'Dedicated Fan!' : daysActive >= 7 ? 'Keep it up!' : 'Getting started'}
            </div>
          </div>
        )}
      </div>

      {/* Motivational Message */}
      {fplPointsBehindLeader && fplPointsBehindLeader > 0 && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 text-center">
          <span className="text-xs sm:text-sm text-[var(--pl-text-muted)]">
            Only <span className="font-bold text-[var(--pl-green)]">{fplPointsBehindLeader} pts</span> behind your league leader! 📈
          </span>
        </div>
      )}
    </div>
  );
}
