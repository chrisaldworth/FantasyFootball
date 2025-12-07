'use client';

import { useState, useEffect, useMemo } from 'react';
import { fplApi } from '@/lib/api';

interface PlayerHistory {
  round: number;
  total_points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  bonus: number;
  fixture: number;
  opponent_team: number;
  was_home: boolean;
}

interface PlayerFixture {
  event: number;
  opponent_team?: number;
  team_a?: number;
  team_h?: number;
  difficulty: number;
  is_home: boolean;
}

interface PlayerData {
  id: number;
  web_name: string;
  team: number;
  element_type: number;
  form: string;
  now_cost: number;
  total_points: number;
  points_per_game?: string;
  selected_by_percent?: string;
  goals_scored?: number;
  assists?: number;
  clean_sheets?: number;
  bonus?: number;
  expected_goals?: string;
  expected_assists?: string;
  ict_index?: string;
  influence?: string;
  creativity?: string;
  threat?: string;
  status?: string;
  chance_of_playing_next_round?: number | null;
}

interface CaptainPickModalProps {
  picks: {
    element: number;
    position: number;
    multiplier: number;
    is_captain: boolean;
    is_vice_captain: boolean;
  }[];
  players: PlayerData[];
  teams: { id: number; short_name: string; name: string }[];
  onClose: () => void;
}

interface CaptainCandidate {
  player: PlayerData;
  pick: CaptainPickModalProps['picks'][0];
  form: number;
  avgLast5: number;
  nextFixture: PlayerFixture | null;
  isHome: boolean;
  opponent: string;
  opponentId: number;
  fdr: number;
  historyVsOpponent: PlayerHistory[];
  avgVsOpponent: number;
  captaincyScore: number;
  reasons: string[];
  isCurrent: boolean;
}

const POSITION_NAMES: Record<number, string> = {
  1: 'GK',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
};

const POSITION_COLORS: Record<number, string> = {
  1: 'bg-yellow-500',
  2: 'bg-blue-500',
  3: 'bg-green-500',
  4: 'bg-red-500',
};

export default function CaptainPickModal({
  picks,
  players,
  teams,
  onClose,
}: CaptainPickModalProps) {
  const [playerHistories, setPlayerHistories] = useState<Record<number, PlayerHistory[]>>({});
  const [playerFixtures, setPlayerFixtures] = useState<Record<number, PlayerFixture[]>>({});
  const [loading, setLoading] = useState(true);

  // Only consider starting XI (positions 1-11)
  const startingPicks = picks.filter((p) => p.position <= 11);

  useEffect(() => {
    fetchPlayerData();
  }, [picks]);

  const fetchPlayerData = async () => {
    setLoading(true);
    try {
      const histories: Record<number, PlayerHistory[]> = {};
      const fixtures: Record<number, PlayerFixture[]> = {};

      // Fetch player summaries in batches
      const batchSize = 5;
      for (let i = 0; i < startingPicks.length; i += batchSize) {
        const batch = startingPicks.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async (pick) => {
            try {
              const data = await fplApi.getPlayer(pick.element);
              return {
                id: pick.element,
                history: data.history || [],
                fixtures: data.fixtures || [],
              };
            } catch (err) {
              console.error(`Failed to fetch player ${pick.element}:`, err);
              return { id: pick.element, history: [], fixtures: [] };
            }
          })
        );

        results.forEach((result) => {
          histories[result.id] = result.history;
          fixtures[result.id] = result.fixtures;
        });
      }

      setPlayerHistories(histories);
      setPlayerFixtures(fixtures);
    } catch (err) {
      console.error('Failed to fetch player data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTeamName = (teamId: number) => {
    if (!teamId) return 'TBD';
    const team = teams.find((t) => t.id === teamId);
    return team?.short_name || team?.name || 'TBD';
  };

  const getTeamFullName = (teamId: number) => {
    if (!teamId) return 'TBD';
    const team = teams.find((t) => t.id === teamId);
    return team?.name || team?.short_name || 'TBD';
  };

  // Analyze captain candidates
  const captainCandidates = useMemo((): CaptainCandidate[] => {
    return startingPicks
      .map((pick) => {
        const player = players.find((p) => p.id === pick.element)!;
        if (!player) return null;

        const history = playerHistories[pick.element] || [];
        const fixtures = playerFixtures[pick.element] || [];
        // FPL API fixture structure: team_a (away), team_h (home), is_home tells us which is opponent
        const rawNextFixture = fixtures[0] || null;
        
        // Determine opponent from fixture structure
        let opponentTeamId = 0;
        let fixtureIsHome = false;
        let fixtureDifficulty = 3;
        
        if (rawNextFixture) {
          fixtureIsHome = rawNextFixture.is_home;
          // If player is home, opponent is team_a; if away, opponent is team_h
          opponentTeamId = rawNextFixture.opponent_team || 
                           (fixtureIsHome ? rawNextFixture.team_a : rawNextFixture.team_h) || 
                           0;
          fixtureDifficulty = rawNextFixture.difficulty || 3;
        }
        
        const nextFixture = rawNextFixture ? {
          ...rawNextFixture,
          opponent_team: opponentTeamId,
          is_home: fixtureIsHome,
          difficulty: fixtureDifficulty,
        } : null;

        // Form calculation (last 5 GWs)
        const last5 = history.slice(-5);
        const avgLast5 = last5.length > 0
          ? last5.reduce((sum, h) => sum + h.total_points, 0) / last5.length
          : 0;

        // History vs this opponent
        const historyVsOpponent = nextFixture
          ? history.filter((h) => h.opponent_team === nextFixture.opponent_team)
          : [];
        const avgVsOpponent = historyVsOpponent.length > 0
          ? historyVsOpponent.reduce((sum, h) => sum + h.total_points, 0) / historyVsOpponent.length
          : 0;

        // Calculate captaincy score
        let score = 0;
        const reasons: string[] = [];
        const form = parseFloat(player.form || '0');

        // Form contribution (0-40 points)
        score += form * 4;
        if (form >= 6) reasons.push(`🔥 Excellent form (${form.toFixed(1)})`);
        else if (form >= 4) reasons.push(`📈 Good form (${form.toFixed(1)})`);

        // Fixture difficulty (0-30 points, inverted - easier = more points)
        const fdr = nextFixture?.difficulty || 3;
        score += (5 - fdr) * 6;
        if (fdr <= 2) reasons.push(`🟢 Very easy fixture (FDR ${fdr})`);
        else if (fdr <= 3) reasons.push(`🟡 Favorable fixture (FDR ${fdr})`);
        else if (fdr >= 4) reasons.push(`🔴 Tough fixture (FDR ${fdr})`);

        // Home advantage (0-10 points)
        const isHome = nextFixture?.is_home ?? false;
        if (isHome) {
          score += 10;
          reasons.push('🏠 Playing at home');
        }

        // Position bonus for attackers
        if (player.element_type === 4) { // FWD
          score += 5;
          reasons.push('⚽ Forward - high ceiling');
        } else if (player.element_type === 3) { // MID
          score += 3;
        }

        // Historical performance vs opponent
        if (avgVsOpponent >= 6 && historyVsOpponent.length >= 2) {
          score += 10;
          reasons.push(`📊 Avg ${avgVsOpponent.toFixed(1)} pts vs ${getTeamName(nextFixture?.opponent_team || 0)}`);
        }

        // xG threat for attacking players
        const threat = parseFloat(player.threat || '0');
        if (threat >= 50) {
          score += 5;
          reasons.push(`🎯 High threat (${threat.toFixed(0)})`);
        }

        // Penalties for unavailability
        const status = player.status || 'a';
        if (status !== 'a') {
          score -= 50;
          reasons.push('⚠️ Availability doubt');
        }

        return {
          player,
          pick,
          form,
          avgLast5,
          nextFixture,
          isHome,
          opponent: nextFixture ? getTeamName(nextFixture.opponent_team) : 'TBD',
          opponentId: nextFixture?.opponent_team || 0,
          fdr,
          historyVsOpponent,
          avgVsOpponent,
          captaincyScore: score,
          reasons,
          isCurrent: pick.is_captain,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.captaincyScore - a!.captaincyScore) as CaptainCandidate[];
  }, [startingPicks, players, playerHistories, playerFixtures, teams]);

  const topPick = captainCandidates[0];
  const currentCaptain = captainCandidates.find((c) => c.isCurrent);

  const getFDRColor = (fdr: number) => {
    if (fdr <= 2) return 'bg-green-500 text-white';
    if (fdr <= 3) return 'bg-yellow-500 text-black';
    if (fdr <= 4) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getScoreColor = (score: number) => {
    if (score >= 50) return 'text-green-400';
    if (score >= 35) return 'text-lime-400';
    if (score >= 25) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const CandidateCard = ({ candidate, rank }: { candidate: CaptainCandidate; rank: number }) => {
    const initials = candidate.player.web_name.substring(0, 2).toUpperCase();
    const isTopPick = rank === 1;
    const isBetterThanCurrent = currentCaptain && candidate.captaincyScore > currentCaptain.captaincyScore && !candidate.isCurrent;

    return (
      <div className={`rounded-xl p-4 transition-all ${
        isTopPick 
          ? 'bg-gradient-to-r from-[var(--pl-green)]/20 to-[var(--pl-cyan)]/20 border-2 border-[var(--pl-green)]/50' 
          : 'bg-[var(--pl-dark)]/50'
      }`}>
        <div className="flex items-start gap-3">
          {/* Rank Badge */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
            rank === 1 ? 'bg-yellow-500 text-black' :
            rank === 2 ? 'bg-gray-300 text-black' :
            rank === 3 ? 'bg-amber-600 text-white' :
            'bg-[var(--pl-dark)] text-white'
          }`}>
            {rank}
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--pl-purple)] to-[var(--pl-pink)] flex items-center justify-center font-bold text-white text-xs">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{candidate.player.web_name}</span>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${POSITION_COLORS[candidate.player.element_type]}`}>
                    {POSITION_NAMES[candidate.player.element_type]}
                  </span>
                  {candidate.isCurrent && (
                    <span className="px-2 py-0.5 rounded bg-[var(--pl-cyan)]/30 text-[var(--pl-cyan)] text-xs font-medium">
                      Current (C)
                    </span>
                  )}
                </div>
                <div className="text-sm text-[var(--pl-text-muted)]">
                  {getTeamName(candidate.player.team)}
                </div>
              </div>
            </div>

            {/* Fixture Info */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-sm">
                {candidate.isHome ? 'vs' : '@'} <span className="font-medium">{candidate.opponent}</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFDRColor(candidate.fdr)}`}>
                FDR {candidate.fdr}
              </span>
              {candidate.isHome && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                  Home
                </span>
              )}
            </div>

            {/* Reasons */}
            <div className="mt-3 space-y-1">
              {candidate.reasons.slice(0, 4).map((reason, idx) => (
                <div key={idx} className="text-sm text-[var(--pl-text-muted)]">
                  {reason}
                </div>
              ))}
            </div>

            {/* Stats Row */}
            <div className="flex gap-3 mt-3 text-sm">
              <div>
                <span className="text-[var(--pl-text-muted)]">Form:</span>{' '}
                <span className={`font-medium ${candidate.form >= 4 ? 'text-green-400' : candidate.form >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {candidate.form.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-[var(--pl-text-muted)]">Avg L5:</span>{' '}
                <span className="font-medium">{candidate.avgLast5.toFixed(1)}</span>
              </div>
              {candidate.historyVsOpponent.length > 0 && (
                <div>
                  <span className="text-[var(--pl-text-muted)]">vs {candidate.opponent}:</span>{' '}
                  <span className="font-medium text-[var(--pl-cyan)]">{candidate.avgVsOpponent.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(candidate.captaincyScore)}`}>
              {candidate.captaincyScore.toFixed(0)}
            </div>
            <div className="text-xs text-[var(--pl-text-muted)]">score</div>
          </div>
        </div>

        {/* Recommendation */}
        {isTopPick && !candidate.isCurrent && (
          <div className="mt-4 p-3 rounded-lg bg-[var(--pl-green)]/20 border border-[var(--pl-green)]/30">
            <div className="text-sm font-medium text-[var(--pl-green)]">
              ⭐ Recommended Captain
            </div>
            <div className="text-xs text-[var(--pl-text-muted)] mt-1">
              Consider switching from {currentCaptain?.player.web_name || 'current captain'}
            </div>
          </div>
        )}

        {isBetterThanCurrent && !isTopPick && (
          <div className="mt-3 text-xs text-[var(--pl-cyan)]">
            📈 Better option than current captain
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-2xl max-h-[95vh] overflow-hidden glass rounded-t-2xl sm:rounded-2xl animate-slide-up sm:m-4 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-white/10 bg-[var(--pl-card)]">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <span className="text-white text-xl leading-none">×</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl">
              👑
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Captain Pick</h2>
              <p className="text-sm text-[var(--pl-text-muted)]">
                Best captain for the gameweek
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[var(--pl-text-muted)]">Analyzing captain options...</p>
            </div>
          )}

          {!loading && (
            <div className="space-y-4">
              {/* Top Recommendation */}
              {topPick && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-[var(--pl-text-muted)] mb-3">
                    TOP RECOMMENDATION
                  </h3>
                  <CandidateCard candidate={topPick} rank={1} />
                </div>
              )}

              {/* Other Options */}
              {captainCandidates.length > 1 && (
                <div>
                  <h3 className="text-sm font-medium text-[var(--pl-text-muted)] mb-3">
                    OTHER OPTIONS
                  </h3>
                  <div className="space-y-3">
                    {captainCandidates.slice(1).map((candidate, idx) => (
                      <CandidateCard key={candidate.player.id} candidate={candidate} rank={idx + 2} />
                    ))}
                  </div>
                </div>
              )}

              {/* How It Works */}
              <div className="mt-6 p-4 rounded-xl bg-[var(--pl-dark)]/30">
                <h4 className="text-sm font-medium mb-3">How Captain Score is Calculated</h4>
                <div className="grid grid-cols-2 gap-3 text-xs text-[var(--pl-text-muted)]">
                  <div>📈 <span className="text-white">Form</span> - Recent points avg</div>
                  <div>🎯 <span className="text-white">Fixture</span> - FDR difficulty</div>
                  <div>🏠 <span className="text-white">Home</span> - Playing at home</div>
                  <div>📊 <span className="text-white">History</span> - vs this opponent</div>
                  <div>⚡ <span className="text-white">Position</span> - FWD/MID bonus</div>
                  <div>🔥 <span className="text-white">Threat</span> - Attack potential</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

