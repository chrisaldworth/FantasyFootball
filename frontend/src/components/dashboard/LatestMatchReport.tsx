'use client';

import React, { useEffect, useState } from 'react';
import { footballApi } from '@/lib/api';

interface MatchReport {
  match: {
    fixture_id: number;
    date: string;
    formatted_date: string;
    days_ago: number | null;
    league: string;
    venue: string;
  };
  teams: {
    favorite_team: {
      id: number;
      name: string;
      is_home: boolean;
      score: number | null;
    };
    opponent: {
      name: string;
      is_home: boolean;
      score: number | null;
    };
  };
  result: 'win' | 'loss' | 'draw';
  score: string | null;
  highlights: {
    goals: Array<{
      player: string;
      minute: number;
      is_favorite_team: boolean;
      assist: string | null;
      detail: string;
    }>;
    assists: Array<{
      player: string;
      minute: number;
      is_favorite_team: boolean;
    }>;
    cards: Array<{
      player: string;
      minute: number;
      type: string;
      is_favorite_team: boolean;
    }>;
  };
  statistics: {
    favorite_team: {
      possession?: number | null;
      shots_total?: number | null;
      shots_on_goal?: number | null;
      corners?: number | null;
      fouls?: number | null;
      goals?: number | null;
    };
    opponent: {
      possession?: number | null;
      shots_total?: number | null;
      shots_on_goal?: number | null;
      goals?: number | null;
    };
  };
  summary: string;
}

export default function LatestMatchReport() {
  const [matchReport, setMatchReport] = useState<MatchReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatchReport();
  }, []);

  const fetchMatchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await footballApi.getLatestMatchReport();
      
      if (data.error) {
        setError(data.message || data.error);
        return;
      }
      
      setMatchReport(data);
    } catch (err: any) {
      console.error('Failed to fetch latest match report:', err);
      setError('Failed to load match report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !matchReport) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-bold mb-4 text-white">What's Important Right Now</h2>
        <div className="text-center py-8">
          <p className="text-[var(--pl-text-muted)]">
            {error || 'No match data available'}
          </p>
          {error && (
            <button
              onClick={fetchMatchReport}
              className="mt-4 px-4 py-2 bg-[var(--pl-green)] text-white rounded-lg hover:bg-[var(--pl-green)]/80 transition-colors text-sm"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const { match, teams, result, score, highlights, statistics, summary } = matchReport;

  // Get result color
  const resultColor = result === 'win' ? 'text-green-400' : result === 'loss' ? 'text-red-400' : 'text-yellow-400';
  const resultBg = result === 'win' ? 'bg-green-500/20' : result === 'loss' ? 'bg-red-500/20' : 'bg-yellow-500/20';
  const resultIcon = result === 'win' ? '✓' : result === 'loss' ? '✗' : '=';

  // Get favorite team goals
  const favoriteTeamGoals = highlights.goals.filter(g => g.is_favorite_team);
  const opponentGoals = highlights.goals.filter(g => !g.is_favorite_team);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">What's Important Right Now</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${resultBg} ${resultColor}`}>
          {resultIcon} {result.toUpperCase()}
        </div>
      </div>

      {/* Match Header */}
      <div className="mb-6">
        <div className="text-sm text-[var(--pl-text-muted)] mb-2">
          {match.league} • {match.venue} • {match.formatted_date}
          {match.days_ago !== null && match.days_ago <= 7 && (
            <span className="ml-2">({match.days_ago} day{match.days_ago !== 1 ? 's' : ''} ago)</span>
          )}
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-4 my-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{teams.favorite_team.name}</div>
            <div className="text-3xl font-bold text-[var(--pl-green)] mt-1">
              {teams.favorite_team.score ?? '-'}
            </div>
          </div>
          <div className="text-2xl font-bold text-white">-</div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{teams.opponent.name}</div>
            <div className="text-3xl font-bold text-[var(--pl-text-muted)] mt-1">
              {teams.opponent.score ?? '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-white/5 rounded-xl">
        <p className="text-white font-medium">{summary}</p>
      </div>

      {/* Goals */}
      {favoriteTeamGoals.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--pl-text-muted)] mb-2">
            {teams.favorite_team.name} Goals
          </h3>
          <div className="space-y-2">
            {favoriteTeamGoals.map((goal, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-[var(--pl-green)]/20 rounded-full flex items-center justify-center font-bold text-[var(--pl-green)]">
                  {goal.minute}'
                </div>
                <div className="flex-1">
                  <span className="text-white font-medium">{goal.player}</span>
                  {goal.assist && (
                    <span className="text-[var(--pl-text-muted)] ml-2">
                      (assist: {goal.assist})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Statistics */}
      {(statistics.favorite_team.possession !== null || 
        statistics.favorite_team.shots_total !== null ||
        statistics.favorite_team.corners !== null) && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="text-sm font-semibold text-[var(--pl-text-muted)] mb-4">
            Match Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {statistics.favorite_team.possession !== null && statistics.opponent.possession !== null && (
              <div>
                <div className="text-xs text-[var(--pl-text-muted)] mb-1">Possession</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/10 rounded-full h-2 relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-[var(--pl-green)]"
                      style={{ width: `${statistics.favorite_team.possession}%` }}
                    />
                  </div>
                  <div className="text-sm font-semibold text-white w-12 text-right">
                    {statistics.favorite_team.possession}%
                  </div>
                </div>
              </div>
            )}
            {statistics.favorite_team.shots_total !== null && (
              <div>
                <div className="text-xs text-[var(--pl-text-muted)] mb-1">Total Shots</div>
                <div className="text-lg font-bold text-white">
                  {statistics.favorite_team.shots_total}
                  {statistics.opponent.shots_total !== null && (
                    <span className="text-sm font-normal text-[var(--pl-text-muted)] ml-2">
                      vs {statistics.opponent.shots_total}
                    </span>
                  )}
                </div>
              </div>
            )}
            {statistics.favorite_team.shots_on_goal !== null && (
              <div>
                <div className="text-xs text-[var(--pl-text-muted)] mb-1">Shots on Target</div>
                <div className="text-lg font-bold text-white">
                  {statistics.favorite_team.shots_on_goal}
                  {statistics.opponent.shots_on_goal !== null && (
                    <span className="text-sm font-normal text-[var(--pl-text-muted)] ml-2">
                      vs {statistics.opponent.shots_on_goal}
                    </span>
                  )}
                </div>
              </div>
            )}
            {statistics.favorite_team.corners !== null && (
              <div>
                <div className="text-xs text-[var(--pl-text-muted)] mb-1">Corners</div>
                <div className="text-lg font-bold text-white">
                  {statistics.favorite_team.corners}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


