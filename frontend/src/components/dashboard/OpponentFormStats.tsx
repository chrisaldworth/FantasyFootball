'use client';

import { useState, useEffect } from 'react';
import { footballApi } from '@/lib/api';

interface OpponentFormStatsProps {
  favoriteTeamId: number;
  opponentTeamId: number;
  opponentName: string;
}

interface HeadToHeadMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  result: 'W' | 'D' | 'L';
  competition: string;
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

        // Fetch all fixtures for the favorite team (use getAllFixtures for comprehensive data)
        // This includes both past and future fixtures for the entire season
        const allTeamFixtures = await footballApi.getAllFixtures(favoriteTeamId);
        // Backend returns { fixtures: [], past: [], future: [] }
        const allFixturesList = allTeamFixtures?.fixtures || [];

        // Filter for head-to-head matches (fixtures involving both teams)
        const h2hMatches: HeadToHeadMatch[] = [];

        for (const fixture of allFixturesList) {
          const homeId = fixture.teams?.home?.id;
          const awayId = fixture.teams?.away?.id;

          // Check if this fixture involves both teams
          if (
            (homeId === favoriteTeamId && awayId === opponentTeamId) ||
            (homeId === opponentTeamId && awayId === favoriteTeamId)
          ) {
            const isHome = homeId === favoriteTeamId;
            const homeScore = fixture.goals?.home;
            const awayScore = fixture.goals?.away;
            
            let result: 'W' | 'D' | 'L' = 'D';
            // Only calculate result for finished matches
            if (fixture.fixture?.status?.short === 'FT' && homeScore !== null && awayScore !== null) {
              if (isHome) {
                result = homeScore > awayScore ? 'W' : homeScore < awayScore ? 'L' : 'D';
              } else {
                result = awayScore > homeScore ? 'W' : awayScore < homeScore ? 'L' : 'D';
              }
            } else if (fixture.fixture?.status?.short !== 'FT') {
              // Skip upcoming matches for head-to-head history
              continue;
            }

            h2hMatches.push({
              date: fixture.fixture?.date || '',
              homeTeam: fixture.teams?.home?.name || '',
              awayTeam: fixture.teams?.away?.name || '',
              homeScore,
              awayScore,
              result,
              competition: fixture.league?.name || 'Premier League',
            });
          }
        }

        // Sort by date (most recent first) and take last 5
        h2hMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHeadToHead(h2hMatches.slice(0, 5).reverse()); // Show oldest to newest

        // Fetch opponent's recent form (last 5 matches)
        const opponentFixtures = await footballApi.getRecentResults(90, opponentTeamId); // Last 3 months
        const allOpponentUpcoming = await footballApi.getUpcomingFixtures(90);
        
        // Filter upcoming fixtures to only include those involving opponent team
        const opponentUpcoming = {
          fixtures: (allOpponentUpcoming?.fixtures || []).filter((f: any) => {
            const homeId = f.teams?.home?.id;
            const awayId = f.teams?.away?.id;
            return homeId === opponentTeamId || awayId === opponentTeamId;
          }),
        };
        
        const formMatches: FormMatch[] = [];
        const allOpponentMatches = [
          ...(opponentFixtures?.fixtures || []),
          ...(opponentUpcoming?.fixtures || []),
        ];

        // Sort by date and take last 5 completed matches
        allOpponentMatches
          .filter((f) => f.fixture?.status?.short === 'FT') // Only finished matches
          .sort((a, b) => new Date(b.fixture?.date || '').getTime() - new Date(a.fixture?.date || '').getTime())
          .slice(0, 5)
          .forEach((fixture) => {
            const isHome = fixture.teams?.home?.id === opponentTeamId;
            const opponent = isHome ? fixture.teams?.away?.name : fixture.teams?.home?.name;
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
              date: fixture.fixture?.date || '',
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
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="text-sm text-[var(--pl-text-muted)]">Loading opponent stats...</div>
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
    <div className="glass rounded-xl p-4 sm:p-6 space-y-6">
      <div className="text-lg font-semibold text-white mb-4">
        vs {opponentName}
      </div>

      {/* Head-to-Head History */}
      {headToHead.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-[var(--pl-text-muted)] mb-3">
            Head-to-Head (Last {headToHead.length} matches)
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 rounded bg-[var(--pl-green)]/20">
              <div className="text-lg font-bold text-[var(--pl-green)]">{h2hWins}</div>
              <div className="text-xs text-[var(--pl-text-muted)]">Wins</div>
            </div>
            <div className="text-center p-2 rounded bg-yellow-500/20">
              <div className="text-lg font-bold text-yellow-500">{h2hDraws}</div>
              <div className="text-xs text-[var(--pl-text-muted)]">Draws</div>
            </div>
            <div className="text-center p-2 rounded bg-[var(--pl-pink)]/20">
              <div className="text-lg font-bold text-[var(--pl-pink)]">{h2hLosses}</div>
              <div className="text-xs text-[var(--pl-text-muted)]">Losses</div>
            </div>
          </div>

          {/* Match History */}
          <div className="space-y-2">
            {headToHead.map((match, idx) => (
              <div
                key={idx}
                className={`p-2 rounded flex items-center justify-between ${
                  match.result === 'W'
                    ? 'bg-[var(--pl-green)]/10 border border-[var(--pl-green)]/30'
                    : match.result === 'L'
                    ? 'bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30'
                    : 'bg-yellow-500/10 border border-yellow-500/30'
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
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    match.result === 'W'
                      ? 'bg-[var(--pl-green)] text-white'
                      : match.result === 'L'
                      ? 'bg-[var(--pl-pink)] text-white'
                      : 'bg-yellow-500 text-black'
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
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 rounded bg-[var(--pl-green)]/20">
              <div className="text-lg font-bold text-[var(--pl-green)]">{formWins}</div>
              <div className="text-xs text-[var(--pl-text-muted)]">Wins</div>
            </div>
            <div className="text-center p-2 rounded bg-yellow-500/20">
              <div className="text-lg font-bold text-yellow-500">{formDraws}</div>
              <div className="text-xs text-[var(--pl-text-muted)]">Draws</div>
            </div>
            <div className="text-center p-2 rounded bg-[var(--pl-pink)]/20">
              <div className="text-lg font-bold text-[var(--pl-pink)]">{formLosses}</div>
              <div className="text-xs text-[var(--pl-text-muted)]">Losses</div>
            </div>
          </div>

          {/* Form Bar */}
          <div className="flex gap-1 mb-4">
            {opponentForm.map((match, idx) => (
              <div
                key={idx}
                className={`flex-1 h-8 rounded ${
                  match.result === 'W'
                    ? 'bg-[var(--pl-green)]'
                    : match.result === 'L'
                    ? 'bg-[var(--pl-pink)]'
                    : 'bg-yellow-500'
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
                className={`p-2 rounded flex items-center justify-between ${
                  match.result === 'W'
                    ? 'bg-[var(--pl-green)]/10 border border-[var(--pl-green)]/30'
                    : match.result === 'L'
                    ? 'bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30'
                    : 'bg-yellow-500/10 border border-yellow-500/30'
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
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    match.result === 'W'
                      ? 'bg-[var(--pl-green)] text-white'
                      : match.result === 'L'
                      ? 'bg-[var(--pl-pink)] text-white'
                      : 'bg-yellow-500 text-black'
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

