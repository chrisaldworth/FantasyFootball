'use client';

import { useState, useEffect } from 'react';
import { footballApi } from '@/lib/api';

interface OpponentFormStatsProps {
  favoriteTeamId: number;
  opponentTeamId: number;
  opponentName: string;
}

interface GoalInfo {
  player: string;
  minute: number;
  assist?: string;
}

interface HeadToHeadMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  result: 'W' | 'D' | 'L';
  competition: string;
  homeGoals?: GoalInfo[];
  awayGoals?: GoalInfo[];
}

interface FormMatch {
  date: string;
  opponent: string;
  isHome: boolean;
  result: 'W' | 'D' | 'L';
  score: string;
  competition: string;
}

// Team logos are fetched via footballApi.getTeamInfo() - no need for hardcoded URLs

export default function OpponentFormStats({
  favoriteTeamId,
  opponentTeamId,
  opponentName,
}: OpponentFormStatsProps) {
  const [headToHead, setHeadToHead] = useState<HeadToHeadMatch[]>([]);
  const [opponentForm, setOpponentForm] = useState<FormMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!favoriteTeamId || !opponentTeamId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get favorite team name for matching
        const favoriteTeamInfo = await footballApi.getTeamInfo(favoriteTeamId);
        const favoriteTeamName = favoriteTeamInfo?.name || '';
        
        // Fetch head-to-head data from dedicated endpoint (tries database first, then API-FOOTBALL/FPL)
        // Request more matches to get better historical coverage from database
        const h2hData = await footballApi.getHeadToHead(favoriteTeamId, opponentTeamId, 20);
        const h2hMatches: HeadToHeadMatch[] = [];
        
        if (h2hData?.matches && h2hData.matches.length > 0) {
          for (const match of h2hData.matches) {
            // Only include finished matches (accept both 'FT' and 'finished' status)
            const isFinished = match.status === 'FT' || match.status === 'finished' || match.status?.toLowerCase() === 'finished';
            if (!isFinished || match.homeScore === null || match.awayScore === null) {
              continue;
            }
            
            // Determine if favorite team was home or away
            const isHome = match.homeTeam.toLowerCase() === favoriteTeamName.toLowerCase() ||
                          match.homeTeam.toLowerCase().includes(favoriteTeamName.toLowerCase());
            
            let result: 'W' | 'D' | 'L' = 'D';
            if (isHome) {
              result = match.homeScore > match.awayScore ? 'W' : match.homeScore < match.awayScore ? 'L' : 'D';
            } else {
              result = match.awayScore > match.homeScore ? 'W' : match.awayScore < match.homeScore ? 'L' : 'D';
            }
            
            h2hMatches.push({
              date: match.date || '',
              homeTeam: match.homeTeam || '',
              awayTeam: match.awayTeam || '',
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              result,
              competition: match.competition || 'Premier League',
              homeGoals: match.homeGoals || [],
              awayGoals: match.awayGoals || [],
            });
          }
        }
        
        // Fallback: Also try to get from current season fixtures if no historical data
        if (h2hMatches.length === 0) {
          const allTeamFixtures = await footballApi.getAllFixtures(favoriteTeamId);
          const allFixturesList = allTeamFixtures?.fixtures || [];
          
          for (const fixture of allFixturesList) {
            const homeId = fixture.teams?.home?.id;
            const awayId = fixture.teams?.away?.id;

            if (
              (homeId === favoriteTeamId && awayId === opponentTeamId) ||
              (homeId === opponentTeamId && awayId === favoriteTeamId)
            ) {
              if (fixture.fixture?.status?.short === 'FT') {
                const isHome = homeId === favoriteTeamId;
                const homeScore = fixture.goals?.home;
                const awayScore = fixture.goals?.away;
                
                if (homeScore !== null && awayScore !== null) {
                  let result: 'W' | 'D' | 'L' = 'D';
                  if (isHome) {
                    result = homeScore > awayScore ? 'W' : homeScore < awayScore ? 'L' : 'D';
                  } else {
                    result = awayScore > homeScore ? 'W' : awayScore < homeScore ? 'L' : 'D';
                  }
                  
                  h2hMatches.push({
                    date: fixture.fixture?.date || '',
                    homeTeam: fixture.teams?.home?.name || '',
                    awayTeam: fixture.teams?.away?.name || '',
                    homeScore,
                    awayScore,
                    result,
                    competition: fixture.league?.name || 'Premier League',
                    homeGoals: [], // FPL API doesn't provide goal scorer details
                    awayGoals: [],
                  });
                }
              }
            }
          }
        }

        // Sort by date (most recent first) and take last 10 (show more if database has them)
        h2hMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // Show up to 10 matches if available (database should have more historical data)
        const matchesToShow = Math.min(h2hMatches.length, 10);
        setHeadToHead(h2hMatches.slice(0, matchesToShow).reverse()); // Show oldest to newest

        // Fetch opponent's recent form (last 5 matches)
        // Use getRecentResults which now includes API-FOOTBALL data for better historical coverage
        const opponentResults = await footballApi.getRecentResults(180, opponentTeamId); // Last 6 months
        const opponentFixtures = opponentResults?.results || [];
        
        const formMatches: FormMatch[] = [];

        // Sort by date and take last 5 completed matches
        opponentFixtures
          .filter((f: any) => {
            // Handle both FPL format and API-FOOTBALL format
            const status = f.fixture?.status?.short || f.status;
            return status === 'FT';
          })
          .sort((a: any, b: any) => {
            const dateA = a.fixture?.date || a.date || '';
            const dateB = b.fixture?.date || b.date || '';
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          })
          .slice(0, 5)
          .forEach((fixture: any) => {
            // Handle both formats
            const homeId = fixture.teams?.home?.id;
            const awayId = fixture.teams?.away?.id;
            const isHome = homeId === opponentTeamId;
            const opponent = isHome 
              ? (fixture.teams?.away?.name || 'Unknown')
              : (fixture.teams?.home?.name || 'Unknown');
            const homeScore = fixture.goals?.home;
            const awayScore = fixture.goals?.away;
            
            let result: 'W' | 'D' | 'L' = 'D';
            if (homeScore !== null && awayScore !== null) {
              if (isHome) {
                result = homeScore > awayScore ? 'W' : homeScore < awayScore ? 'L' : 'D';
              } else {
                result = awayScore > homeScore ? 'W' : awayScore < homeScore ? 'L' : 'D';
              }
            }

            formMatches.push({
              date: fixture.fixture?.date || fixture.date || '',
              opponent: opponent || 'Unknown',
              isHome,
              result,
              score: `${homeScore ?? '-'}-${awayScore ?? '-'}`,
              competition: fixture.league?.name || 'Premier League',
            });
          });

        setOpponentForm(formMatches);
      } catch (err: any) {
        console.error('[OpponentFormStats] Error fetching data:', err);
        setError(err.message || 'Failed to load opponent stats');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [favoriteTeamId, opponentTeamId]);

  if (loading) {
    return (
      <div className="glass rounded-xl p-2 sm:p-6">
        <div className="text-xs sm:text-sm text-[var(--pl-text-muted)]">Loading opponent stats...</div>
      </div>
    );
  }

  if (error) {
    return null; // Fail silently
  }

  const h2hWins = headToHead.filter((m) => m.result === 'W').length;
  const h2hDraws = headToHead.filter((m) => m.result === 'D').length;
  const h2hLosses = headToHead.filter((m) => m.result === 'L').length;

  const formWins = opponentForm.filter((m) => m.result === 'W').length;
  const formDraws = opponentForm.filter((m) => m.result === 'D').length;
  const formLosses = opponentForm.filter((m) => m.result === 'L').length;

  return (
    <div className="glass rounded-xl p-2 sm:p-6 space-y-3 sm:space-y-6">
      <div className="text-sm sm:text-lg font-semibold text-white mb-2 sm:mb-4">
        vs {opponentName}
      </div>

      {/* Head-to-Head History */}
      {headToHead.length > 0 && (
        <div>
          <div className="text-xs sm:text-sm font-semibold text-[var(--pl-text-muted)] mb-2 sm:mb-3">
            Head-to-Head (Last {headToHead.length} matches)
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 mb-2 sm:mb-4">
            <div className="text-center p-2 rounded-lg bg-[var(--pl-green)]/20">
              <div className="text-lg font-bold text-[var(--pl-green)]">{h2hWins}</div>
              <div className="text-xs text-[var(--pl-text-muted)]">Wins</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-[var(--pl-yellow)]/20">
              <div className="text-lg font-bold text-[var(--pl-yellow)]">{h2hDraws}</div>
              <div className="text-xs text-[var(--pl-text-muted)]">Draws</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-[var(--pl-pink)]/20">
              <div className="text-lg font-bold text-[var(--pl-pink)]">{h2hLosses}</div>
              <div className="text-xs text-[var(--pl-text-muted)]">Losses</div>
            </div>
          </div>

          {/* Match History */}
          <div className="space-y-2">
            {headToHead.map((match, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg flex items-center justify-between ${
                  match.result === 'W'
                    ? 'bg-[var(--pl-green)]/10 border border-[var(--pl-green)]/30'
                    : match.result === 'L'
                    ? 'bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30'
                    : 'bg-[var(--pl-yellow)]/10 border border-[var(--pl-yellow)]/30'
                }`}
              >
                <div className="flex-1">
                  <div className="text-xs text-[var(--pl-text-muted)]">
                    {new Date(match.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-sm font-medium text-white">
                    {match.homeTeam} {match.homeScore !== null ? match.homeScore : '-'} -{' '}
                    {match.awayScore !== null ? match.awayScore : '-'} {match.awayTeam}
                  </div>
                  {/* Goal Scorers */}
                  {(match.homeGoals && match.homeGoals.length > 0) || (match.awayGoals && match.awayGoals.length > 0) ? (
                    <div className="mt-2 space-y-1">
                      {/* Home Goals */}
                      {match.homeGoals && match.homeGoals.length > 0 && (
                        <div className="text-xs text-[var(--pl-text-muted)]">
                          <span className="font-semibold">{match.homeTeam}:</span>{' '}
                          {match.homeGoals.map((goal, gIdx) => (
                            <span key={gIdx}>
                              {goal.player} {goal.minute}'
                              {goal.assist && ` (${goal.assist})`}
                              {gIdx < match.homeGoals!.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Away Goals */}
                      {match.awayGoals && match.awayGoals.length > 0 && (
                        <div className="text-xs text-[var(--pl-text-muted)]">
                          <span className="font-semibold">{match.awayTeam}:</span>{' '}
                          {match.awayGoals.map((goal, gIdx) => (
                            <span key={gIdx}>
                              {goal.player} {goal.minute}'
                              {goal.assist && ` (${goal.assist})`}
                              {gIdx < match.awayGoals!.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                <div
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    match.result === 'W'
                      ? 'bg-[var(--pl-green)] text-white'
                      : match.result === 'L'
                      ? 'bg-[var(--pl-pink)] text-white'
                      : 'bg-[var(--pl-yellow)] text-black'
                  }`}
                >
                  {match.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opponent Form */}
      {opponentForm.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <div className="text-sm font-semibold text-[var(--pl-text-muted)] mb-3">
            {opponentName} Recent Form (Last {opponentForm.length} matches)
          </div>

          {/* Form Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 rounded-lg bg-[var(--pl-green)]/20">
              <div className="text-lg font-bold text-[var(--pl-green)]">{formWins}</div>
              <div className="text-xs text-[var(--pl-text-muted)]">Wins</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-[var(--pl-yellow)]/20">
              <div className="text-lg font-bold text-[var(--pl-yellow)]">{formDraws}</div>
              <div className="text-xs text-[var(--pl-text-muted)]">Draws</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-[var(--pl-pink)]/20">
              <div className="text-lg font-bold text-[var(--pl-pink)]">{formLosses}</div>
              <div className="text-xs text-[var(--pl-text-muted)]">Losses</div>
            </div>
          </div>

          {/* Form Bar */}
          <div className="flex gap-1 mb-4">
            {opponentForm.map((match, idx) => (
              <div
                key={idx}
                className={`flex-1 h-8 rounded-lg ${
                  match.result === 'W'
                    ? 'bg-[var(--pl-green)]'
                    : match.result === 'L'
                    ? 'bg-[var(--pl-pink)]'
                    : 'bg-[var(--pl-yellow)]'
                }`}
                title={`${match.opponent} ${match.score} ${match.result === 'W' ? 'W' : match.result === 'L' ? 'L' : 'D'}`}
              />
            ))}
          </div>

          {/* Form Matches */}
          <div className="space-y-2">
            {opponentForm.map((match, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg flex items-center justify-between ${
                  match.result === 'W'
                    ? 'bg-[var(--pl-green)]/10 border border-[var(--pl-green)]/30'
                    : match.result === 'L'
                    ? 'bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30'
                    : 'bg-[var(--pl-yellow)]/10 border border-[var(--pl-yellow)]/30'
                }`}
              >
                <div className="flex-1">
                  <div className="text-xs text-[var(--pl-text-muted)]">
                    {new Date(match.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                  <div className="text-sm font-medium text-white">
                    {match.isHome ? 'vs' : 'at'} {match.opponent} {match.score}
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    match.result === 'W'
                      ? 'bg-[var(--pl-green)] text-white'
                      : match.result === 'L'
                      ? 'bg-[var(--pl-pink)] text-white'
                      : 'bg-[var(--pl-yellow)] text-black'
                  }`}
                >
                  {match.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {headToHead.length === 0 && opponentForm.length === 0 && (
        <div className="text-sm text-[var(--pl-text-muted)] text-center py-4">
          No historical data available
        </div>
      )}
    </div>
  );
}

