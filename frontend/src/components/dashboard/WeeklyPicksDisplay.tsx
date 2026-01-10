'use client';

import Link from 'next/link';
import { useEffect, useState, memo, useCallback } from 'react';
import { weeklyPicksApi, fplApi } from '@/lib/api';
import TeamLogoEnhanced from '@/components/TeamLogoEnhanced';

interface WeeklyPicksDisplayProps {
  userId?: number;
}

interface ScorePrediction {
  fixtureId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeam?: string;
  awayTeam?: string;
  homeScore: number;
  awayScore: number;
  actualHomeScore?: number;
  actualAwayScore?: number;
  points?: number;
}

interface PlayerPick {
  playerId: number;
  fixtureId: number;
  playerName?: string;
  playerPhoto?: string;
  teamName?: string;
  teamId?: number;
  position?: string;
  points?: number;
  fplPoints?: number;
}

interface PicksData {
  gameweek: number;
  deadline: Date | null;
  isLocked: boolean;
  scorePredictions: ScorePrediction[];
  playerPicks: PlayerPick[];
  totalPoints?: number;
}

interface StatsData {
  totalSeasonPoints: number;
  previousWeekPoints: number;
  previousWeekGameweek: number | null;
  weeklyRank: number | null;
  seasonRank: number | null;
  averagePoints: number;
  totalGameweeks: number;
}

const WeeklyPicksDisplay = memo(function WeeklyPicksDisplay({ userId }: WeeklyPicksDisplayProps) {
  const [currentPicks, setCurrentPicks] = useState<PicksData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamsMap, setTeamsMap] = useState<Record<number, { name: string; shortName: string }>>({});
  const [playersMap, setPlayersMap] = useState<Record<number, { name: string; photo: string; team: number; position: string }>>({});
  const [expandedSection, setExpandedSection] = useState<'scores' | 'players' | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch bootstrap data for teams and players
      const bootstrap = await fplApi.getBootstrap();
      if (!bootstrap || !Array.isArray(bootstrap.events)) {
        setLoading(false);
        return;
      }

      // Build teams map
      const teams: Record<number, { name: string; shortName: string }> = {};
      (bootstrap.teams || []).forEach((t: any) => {
        teams[t.id] = { name: t.name, shortName: t.short_name };
      });
      setTeamsMap(teams);

      // Build players map
      const players: Record<number, { name: string; photo: string; team: number; position: string }> = {};
      const positionMap: { [key: number]: string } = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };
      (bootstrap.elements || []).forEach((p: any) => {
        players[p.id] = {
          name: p.web_name,
          photo: `https://resources.premierleague.com/premierleague/photos/players/110x140/p${p.code}.png`,
          team: p.team,
          position: positionMap[p.element_type] || 'Unknown',
        };
      });
      setPlayersMap(players);

      const events = bootstrap.events;
      const now = new Date();

      // Find current and next gameweek
      const currentEvent = events.find((e: any) => e?.is_current === true);
      const allEvents = events.filter((e: any) => e && !e.finished).sort((a: any, b: any) => (a?.id || 0) - (b?.id || 0));
      const nextEvent = allEvents.find((e: any) => e?.id && e.id > (currentEvent?.id || 0));

      // Determine which gameweek to show picks for (next open one, or current if it's still open)
      let targetEvent = nextEvent;
      if (currentEvent) {
        const currentDeadline = new Date(currentEvent.deadline_time);
        if (now < currentDeadline) {
          targetEvent = currentEvent;
        }
      }

      // Fetch picks for target gameweek
      if (targetEvent && typeof targetEvent.id === 'number') {
        try {
          const picks = await weeklyPicksApi.getPicks(targetEvent.id);
          const deadline = new Date(targetEvent.deadline_time);

          if (picks && (picks.scorePredictions?.length > 0 || picks.playerPicks?.length > 0)) {
            // Enrich score predictions with team names
            const enrichedScorePredictions: ScorePrediction[] = (picks.scorePredictions || []).map((sp: any) => ({
              ...sp,
              homeTeam: teams[sp.homeTeamId]?.shortName || 'TBD',
              awayTeam: teams[sp.awayTeamId]?.shortName || 'TBD',
            }));

            // Enrich player picks with player info
            const enrichedPlayerPicks: PlayerPick[] = (picks.playerPicks || []).map((pp: any) => {
              const player = players[pp.playerId];
              return {
                ...pp,
                playerName: player?.name || 'Unknown',
                playerPhoto: player?.photo,
                teamName: teams[player?.team]?.shortName || 'TBD',
                teamId: player?.team,
                position: player?.position,
              };
            });

            setCurrentPicks({
              gameweek: targetEvent.id,
              deadline,
              isLocked: now >= deadline,
              scorePredictions: enrichedScorePredictions,
              playerPicks: enrichedPlayerPicks,
            });
          } else {
            // No picks yet
            setCurrentPicks({
              gameweek: targetEvent.id,
              deadline,
              isLocked: now >= deadline,
              scorePredictions: [],
              playerPicks: [],
            });
          }
        } catch (error) {
          console.error('[WeeklyPicksDisplay] Error fetching picks:', error);
          if (targetEvent) {
            setCurrentPicks({
              gameweek: targetEvent.id,
              deadline: new Date(targetEvent.deadline_time),
              isLocked: now >= new Date(targetEvent.deadline_time),
              scorePredictions: [],
              playerPicks: [],
            });
          }
        }
      }

      // Fetch history for season stats and previous week points
      try {
        const history = await weeklyPicksApi.getHistory();
        if (history && Array.isArray(history) && history.length > 0) {
          const totalSeasonPoints = history.reduce((sum: number, h: any) => sum + (h.totalPoints || 0), 0);
          const averagePoints = totalSeasonPoints / history.length;

          // Find previous completed week
          const sortedHistory = [...history].sort((a: any, b: any) => (b.gameweek || 0) - (a.gameweek || 0));
          const previousWeek = sortedHistory[0];

          setStats({
            totalSeasonPoints,
            previousWeekPoints: previousWeek?.totalPoints || 0,
            previousWeekGameweek: previousWeek?.gameweek || null,
            weeklyRank: previousWeek?.rank || null,
            seasonRank: null, // Would need a separate API call
            averagePoints: Math.round(averagePoints * 10) / 10,
            totalGameweeks: history.length,
          });
        } else {
          setStats({
            totalSeasonPoints: 0,
            previousWeekPoints: 0,
            previousWeekGameweek: null,
            weeklyRank: null,
            seasonRank: null,
            averagePoints: 0,
            totalGameweeks: 0,
          });
        }
      } catch (error) {
        console.error('[WeeklyPicksDisplay] Error fetching history:', error);
        setStats({
          totalSeasonPoints: 0,
          previousWeekPoints: 0,
          previousWeekGameweek: null,
          weeklyRank: null,
          seasonRank: null,
          averagePoints: 0,
          totalGameweeks: 0,
        });
      }
    } catch (error) {
      console.error('[WeeklyPicksDisplay] Error:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!userId || loading) {
    return (
      <div className="glass rounded-xl p-4 sm:p-6 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-white/10 rounded"></div>
      </div>
    );
  }

  if (!currentPicks) {
    return null;
  }

  const hasPicks = currentPicks.scorePredictions.length > 0 || currentPicks.playerPicks.length > 0;
  const isComplete = currentPicks.scorePredictions.length === 3 && currentPicks.playerPicks.length === 3;
  const timeUntilDeadline = currentPicks.deadline ? currentPicks.deadline.getTime() - Date.now() : 0;
  const hoursUntilDeadline = Math.floor(timeUntilDeadline / (1000 * 60 * 60));
  const isUrgent = hoursUntilDeadline > 0 && hoursUntilDeadline < 24;

  return (
    <div className="space-y-4">
      {/* Main Card - Current/Next Week Picks */}
      <div className={`glass rounded-xl overflow-hidden ${isUrgent && !isComplete ? 'ring-2 ring-yellow-400/50' : ''}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--pl-green)]/20 to-[var(--pl-cyan)]/20 p-4 sm:p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[var(--pl-green)] to-[var(--pl-cyan)] flex items-center justify-center text-xl sm:text-2xl">
                🎯
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white">Weekly Picks</h3>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--pl-text-muted)]">
                  <span>Gameweek {currentPicks.gameweek}</span>
                  {currentPicks.isLocked ? (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--pl-pink)]/20 text-[var(--pl-pink)] text-xs">
                      Locked
                    </span>
                  ) : isComplete ? (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--pl-green)]/20 text-[var(--pl-green)] text-xs">
                      Complete ✓
                    </span>
                  ) : hasPicks ? (
                    <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 text-xs">
                      {currentPicks.scorePredictions.length + currentPicks.playerPicks.length}/6 picks
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--pl-cyan)]/20 text-[var(--pl-cyan)] text-xs">
                      Make picks
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Edit/Make Picks Button */}
            {!currentPicks.isLocked && (
              <Link
                href={`/weekly-picks/make-picks?gameweek=${currentPicks.gameweek}`}
                className="px-4 py-2 rounded-lg bg-[var(--pl-green)] hover:bg-[var(--pl-green)]/80 text-white font-medium text-sm transition-colors flex items-center gap-2"
              >
                {hasPicks ? (
                  <>
                    <span className="hidden sm:inline">Edit</span>
                    <span>✏️</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Make Picks</span>
                    <span>→</span>
                  </>
                )}
              </Link>
            )}
          </div>

          {/* Deadline Warning */}
          {!currentPicks.isLocked && currentPicks.deadline && (
            <div className={`mt-3 flex items-center gap-2 text-xs sm:text-sm ${isUrgent ? 'text-yellow-400' : 'text-[var(--pl-text-muted)]'}`}>
              <span>⏰</span>
              <span>
                Deadline: {currentPicks.deadline.toLocaleDateString('en-GB', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {isUrgent && <span className="ml-2 font-semibold">({hoursUntilDeadline}h left!)</span>}
              </span>
            </div>
          )}
        </div>

        {/* Picks Content */}
        {hasPicks ? (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Score Predictions Section */}
            {currentPicks.scorePredictions.length > 0 && (
              <div>
                <button
                  onClick={() => setExpandedSection(expandedSection === 'scores' ? null : 'scores')}
                  className="w-full flex items-center justify-between text-left mb-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base">⚽</span>
                    <span className="text-sm sm:text-base font-semibold text-white">
                      Score Predictions ({currentPicks.scorePredictions.length}/3)
                    </span>
                  </div>
                  <span className={`text-[var(--pl-text-muted)] transition-transform ${expandedSection === 'scores' ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* Compact preview or expanded view */}
                {expandedSection === 'scores' ? (
                  <div className="space-y-2">
                    {currentPicks.scorePredictions.map((sp, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[var(--pl-dark)]/50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <TeamLogoEnhanced teamId={sp.homeTeamId} size={24} style="shield" />
                          <span className="text-xs sm:text-sm font-medium">{sp.homeTeam}</span>
                        </div>
                        <div className="px-3 py-1 bg-[var(--pl-green)]/20 rounded-lg">
                          <span className="text-sm sm:text-base font-bold text-[var(--pl-green)]">
                            {sp.homeScore} - {sp.awayScore}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="text-xs sm:text-sm font-medium">{sp.awayTeam}</span>
                          <TeamLogoEnhanced teamId={sp.awayTeamId} size={24} style="shield" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentPicks.scorePredictions.map((sp, index) => (
                      <div key={index} className="flex items-center gap-1 px-2 py-1 bg-[var(--pl-dark)]/50 rounded-lg text-xs sm:text-sm">
                        <span>{sp.homeTeam}</span>
                        <span className="font-bold text-[var(--pl-green)]">{sp.homeScore}-{sp.awayScore}</span>
                        <span>{sp.awayTeam}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Player Picks Section */}
            {currentPicks.playerPicks.length > 0 && (
              <div>
                <button
                  onClick={() => setExpandedSection(expandedSection === 'players' ? null : 'players')}
                  className="w-full flex items-center justify-between text-left mb-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base">👤</span>
                    <span className="text-sm sm:text-base font-semibold text-white">
                      Player Picks ({currentPicks.playerPicks.length}/3)
                    </span>
                  </div>
                  <span className={`text-[var(--pl-text-muted)] transition-transform ${expandedSection === 'players' ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* Compact preview or expanded view */}
                {expandedSection === 'players' ? (
                  <div className="space-y-2">
                    {currentPicks.playerPicks.map((pp, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-[var(--pl-dark)]/50 rounded-lg">
                        {pp.playerPhoto && (
                          <img
                            src={pp.playerPhoto}
                            alt={pp.playerName}
                            className="w-10 h-10 rounded-full object-cover bg-[var(--pl-card)]"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-sm sm:text-base">{pp.playerName}</div>
                          <div className="text-xs text-[var(--pl-text-muted)]">
                            {pp.teamName} • {pp.position}
                          </div>
                        </div>
                        {pp.teamId && <TeamLogoEnhanced teamId={pp.teamId} size={24} style="shield" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentPicks.playerPicks.map((pp, index) => (
                      <div key={index} className="flex items-center gap-2 px-2 py-1 bg-[var(--pl-dark)]/50 rounded-lg text-xs sm:text-sm">
                        <span className="font-medium">{pp.playerName}</span>
                        <span className="text-[var(--pl-text-muted)]">({pp.teamName})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Incomplete Warning */}
            {!isComplete && !currentPicks.isLocked && (
              <div className="flex items-center gap-2 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg text-yellow-400 text-xs sm:text-sm">
                <span>⚠️</span>
                <span>
                  Complete your picks! You need {3 - currentPicks.scorePredictions.length} more score predictions and {3 - currentPicks.playerPicks.length} more player picks.
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Empty State - No Picks Yet */
          <div className="p-6 sm:p-8 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h4 className="font-semibold text-lg mb-2">No picks yet for GW{currentPicks.gameweek}</h4>
            <p className="text-sm text-[var(--pl-text-muted)] mb-4">
              Predict 3 scores and pick 3 players to compete for the top of the leaderboard!
            </p>
            {!currentPicks.isLocked && (
              <Link
                href={`/weekly-picks/make-picks?gameweek=${currentPicks.gameweek}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[var(--pl-green)] to-[var(--pl-cyan)] hover:opacity-90 text-white font-semibold transition-opacity"
              >
                <span>Make Your Picks</span>
                <span>→</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* Previous Week Points */}
          <div className="glass rounded-xl p-3 sm:p-4 text-center">
            <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)] mb-1">
              {stats.previousWeekGameweek ? `GW${stats.previousWeekGameweek}` : 'Last Week'}
            </div>
            <div className="text-lg sm:text-2xl font-bold text-[var(--pl-cyan)]">
              {stats.previousWeekPoints}
            </div>
            <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)]">pts</div>
          </div>

          {/* Total Season Points */}
          <div className="glass rounded-xl p-3 sm:p-4 text-center bg-gradient-to-br from-[var(--pl-green)]/10 to-transparent">
            <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)] mb-1">Season Total</div>
            <div className="text-lg sm:text-2xl font-bold text-[var(--pl-green)]">
              {stats.totalSeasonPoints}
            </div>
            <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)]">pts</div>
          </div>

          {/* Average */}
          <div className="glass rounded-xl p-3 sm:p-4 text-center">
            <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)] mb-1">Average</div>
            <div className="text-lg sm:text-2xl font-bold text-white">
              {stats.averagePoints}
            </div>
            <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)]">per GW</div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/weekly-picks/results"
          className="flex-1 sm:flex-none px-4 py-2 glass rounded-lg text-center text-xs sm:text-sm font-medium hover:bg-white/5 transition-colors"
        >
          🏆 Leaderboard
        </Link>
        <Link
          href="/weekly-picks/history"
          className="flex-1 sm:flex-none px-4 py-2 glass rounded-lg text-center text-xs sm:text-sm font-medium hover:bg-white/5 transition-colors"
        >
          📊 History
        </Link>
        <Link
          href="/weekly-picks/leagues"
          className="flex-1 sm:flex-none px-4 py-2 glass rounded-lg text-center text-xs sm:text-sm font-medium hover:bg-white/5 transition-colors"
        >
          👥 Leagues
        </Link>
      </div>
    </div>
  );
});

export default WeeklyPicksDisplay;
