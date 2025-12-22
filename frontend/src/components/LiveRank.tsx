'use client';

import { useState, useEffect } from 'react';
import { fplApi } from '@/lib/api';

interface LeagueRank {
  id: number;
  name: string;
  entry_rank: number;
  entry_last_rank: number;
  league_type: string;
}

interface LiveRankProps {
  teamId: number;
  currentGameweek: number | null;
  isLive: boolean;
  leagues?: {
    classic?: LeagueRank[];
    h2h?: LeagueRank[];
  };
}

interface RankData {
  overallRank: number;
  gameweekRank: number | null;
  previousOverallRank: number | null;
  previousGameweekRank: number | null;
  lastUpdated: Date;
}

export default function LiveRank({ teamId, currentGameweek, isLive, leagues }: LiveRankProps) {
  const [rankData, setRankData] = useState<RankData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRankData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      setError(null);

      const [teamData, previousTeamData] = await Promise.all([
        fplApi.getTeam(teamId),
        // Get previous gameweek data for comparison
        currentGameweek && currentGameweek > 1
          ? fplApi.getTeam(teamId).catch(() => null) // Will use current data's previous rank
          : Promise.resolve(null),
      ]);

      const overallRank = teamData.summary_overall_rank || 0;
      const gameweekRank = isLive ? (teamData.summary_event_rank || null) : null;

      // Get previous ranks from team data if available
      // Note: FPL API doesn't directly provide previous ranks, so we'll calculate from history if needed
      const previousOverallRank = null; // Will be calculated from history if needed
      const previousGameweekRank = null;

      setRankData({
        overallRank,
        gameweekRank,
        previousOverallRank,
        previousGameweekRank,
        lastUpdated: new Date(),
      });
    } catch (err: any) {
      console.error('Failed to fetch rank data:', err);
      setError('Failed to load rank data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRankData();
  }, [teamId, currentGameweek]);

  // Auto-refresh every 60 seconds during live gameweeks
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      fetchRankData(true);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [isLive, teamId, currentGameweek]);

  const formatRank = (rank: number) => {
    return rank.toLocaleString();
  };

  const getRankChange = (current: number, previous: number | null): { change: number; direction: 'up' | 'down' | 'same' } => {
    if (previous === null) return { change: 0, direction: 'same' };
    const change = previous - current; // Positive = moved up (better rank), Negative = moved down (worse rank)
    if (change > 0) return { change, direction: 'up' };
    if (change < 0) return { change: Math.abs(change), direction: 'down' };
    return { change: 0, direction: 'same' };
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-[var(--pl-dark)]/50 rounded mb-4 w-32"></div>
          <div className="h-12 bg-[var(--pl-dark)]/50 rounded mb-4"></div>
          <div className="h-8 bg-[var(--pl-dark)]/50 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-[var(--pl-text-muted)] mb-4">{error}</div>
          <button
            onClick={() => fetchRankData()}
            className="btn-primary px-4 py-2 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!rankData) {
    return (
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="text-center text-[var(--pl-text-muted)]">
          No rank data available
        </div>
      </div>
    );
  }

  const overallChange = getRankChange(rankData.overallRank, rankData.previousOverallRank);
  const gameweekChange = rankData.gameweekRank && rankData.previousGameweekRank
    ? getRankChange(rankData.gameweekRank, rankData.previousGameweekRank)
    : null;

  const primaryColor = 'var(--pl-green)';
  const secondaryColor = 'var(--pl-cyan)';

  return (
    <div className="glass rounded-2xl p-6 mb-6" role="region" aria-label="Live Rank">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <span>📊</span>
          Live Rank
        </h2>
        {isLive && isRefreshing && (
          <div className="flex items-center gap-2 text-sm text-[var(--pl-text-muted)]">
            <div className="w-4 h-4 border-2 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin"></div>
            <span>Refreshing...</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Overall Rank */}
        <div>
          <div className="text-sm text-[var(--pl-text-muted)] mb-2">Overall Rank</div>
          <div className="flex items-baseline gap-3">
            <div 
              className="text-3xl sm:text-4xl font-bold"
              style={{ color: primaryColor }}
            >
              #{formatRank(rankData.overallRank)}
            </div>
            {overallChange.change > 0 && (
              <div className="flex items-center gap-1 text-[var(--pl-green)] text-lg font-medium">
                <span>↑</span>
                <span>{overallChange.change}</span>
              </div>
            )}
            {overallChange.direction === 'down' && overallChange.change > 0 && (
              <div className="flex items-center gap-1 text-[var(--pl-pink)] text-lg font-medium">
                <span>↓</span>
                <span>{overallChange.change}</span>
              </div>
            )}
            {overallChange.direction === 'same' && overallChange.change === 0 && (
              <div className="flex items-center gap-1 text-[var(--pl-text-muted)] text-lg font-medium">
                <span>→</span>
                <span>No change</span>
              </div>
            )}
          </div>
        </div>

        {/* Gameweek Rank (only if live) */}
        {isLive && rankData.gameweekRank !== null && (
          <div>
            <div className="text-sm text-[var(--pl-text-muted)] mb-2">Gameweek Rank</div>
            <div className="flex items-baseline gap-3">
              <div 
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: secondaryColor }}
              >
                #{formatRank(rankData.gameweekRank)}
              </div>
              {gameweekChange && gameweekChange.change > 0 && (
                <div className="flex items-center gap-1 text-[var(--pl-green)] text-lg font-medium">
                  <span>↑</span>
                  <span>{gameweekChange.change}</span>
                </div>
              )}
              {gameweekChange && gameweekChange.direction === 'down' && gameweekChange.change > 0 && (
                <div className="flex items-center gap-1 text-[var(--pl-pink)] text-lg font-medium">
                  <span>↓</span>
                  <span>{gameweekChange.change}</span>
                </div>
              )}
              {gameweekChange && gameweekChange.direction === 'same' && gameweekChange.change === 0 && (
                <div className="flex items-center gap-1 text-[var(--pl-text-muted)] text-lg font-medium">
                  <span>→</span>
                  <span>No change</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* League Ranks */}
        {leagues && ((leagues.classic && leagues.classic.length > 0) || (leagues.h2h && leagues.h2h.length > 0)) && (
          <div>
            <div className="text-sm text-[var(--pl-text-muted)] mb-3">League Ranks</div>
            <div className="space-y-2">
              {/* Classic Leagues - Show top 3 */}
              {leagues.classic && leagues.classic.length > 0 && (
                <>
                  {leagues.classic
                    .sort((a, b) => a.entry_rank - b.entry_rank)
                    .slice(0, 3)
                    .map((league) => {
                      const rankChange = league.entry_last_rank - league.entry_rank;
                      const changeDirection = rankChange > 0 ? 'up' : rankChange < 0 ? 'down' : 'same';
                      const changeValue = Math.abs(rankChange);
                      
                      return (
                        <div 
                          key={league.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[var(--pl-dark)]/30 hover:bg-[var(--pl-dark)]/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-lg">🏆</span>
                            <span className="text-sm font-medium text-white truncate">{league.name}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-base font-bold" style={{ color: secondaryColor }}>
                              #{formatRank(league.entry_rank)}
                            </span>
                            {changeValue > 0 && (
                              <span 
                                className={`text-xs font-medium ${
                                  changeDirection === 'up' 
                                    ? 'text-[var(--pl-green)]' 
                                    : changeDirection === 'down'
                                    ? 'text-[var(--pl-pink)]'
                                    : 'text-[var(--pl-text-muted)]'
                                }`}
                              >
                                {changeDirection === 'up' ? '↑' : changeDirection === 'down' ? '↓' : '→'} {changeValue}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </>
              )}
              
              {/* H2H Leagues - Show top 2 */}
              {leagues.h2h && leagues.h2h.length > 0 && (
                <>
                  {leagues.h2h
                    .sort((a, b) => a.entry_rank - b.entry_rank)
                    .slice(0, 2)
                    .map((league) => {
                      const rankChange = league.entry_last_rank - league.entry_rank;
                      const changeDirection = rankChange > 0 ? 'up' : rankChange < 0 ? 'down' : 'same';
                      const changeValue = Math.abs(rankChange);
                      
                      return (
                        <div 
                          key={league.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[var(--pl-dark)]/30 hover:bg-[var(--pl-dark)]/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-lg">⚔️</span>
                            <span className="text-sm font-medium text-white truncate">{league.name}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-base font-bold" style={{ color: secondaryColor }}>
                              #{formatRank(league.entry_rank)}
                            </span>
                            {changeValue > 0 && (
                              <span 
                                className={`text-xs font-medium ${
                                  changeDirection === 'up' 
                                    ? 'text-[var(--pl-green)]' 
                                    : changeDirection === 'down'
                                    ? 'text-[var(--pl-pink)]'
                                    : 'text-[var(--pl-text-muted)]'
                                }`}
                              >
                                {changeDirection === 'up' ? '↑' : changeDirection === 'down' ? '↓' : '→'} {changeValue}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </>
              )}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="pt-4 border-t border-[var(--pl-dark)]/50">
          <div className="flex items-center justify-between text-sm text-[var(--pl-text-muted)]">
            <span>Last updated: {formatTime(rankData.lastUpdated)}</span>
            {isLive && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[var(--pl-green)] rounded-full animate-pulse"></span>
                <span>Auto-refreshing</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Screen reader live region for updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {rankData && `Overall rank: ${formatRank(rankData.overallRank)}. ${isLive && rankData.gameweekRank ? `Gameweek rank: ${formatRank(rankData.gameweekRank)}.` : ''}`}
      </div>
    </div>
  );
}


