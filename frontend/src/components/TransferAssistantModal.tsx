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
  opponent_team: number;
  difficulty: number;
  is_home: boolean;
}

interface PlayerData {
  id: number;
  web_name: string;
  first_name?: string;
  second_name?: string;
  photo?: string;
  team: number;
  element_type: number;
  form: string;
  now_cost: number;
  cost_change_event?: number;
  cost_change_start?: number;
  total_points: number;
  points_per_game?: string;
  selected_by_percent?: string;
  minutes?: number;
  goals_scored?: number;
  assists?: number;
  clean_sheets?: number;
  bonus?: number;
  expected_goals?: string;
  expected_assists?: string;
  expected_goal_involvements?: string;
  chance_of_playing_next_round?: number | null;
  news?: string;
  status?: string; // 'a' = available, 'i' = injured, 'd' = doubtful, 's' = suspended, 'u' = unavailable
}

interface TransferAssistantModalProps {
  picks: {
    element: number;
    position: number;
    multiplier: number;
    is_captain: boolean;
    is_vice_captain: boolean;
  }[];
  players: PlayerData[];
  teams: { id: number; short_name: string; name: string }[];
  bank: number;
  onClose: () => void;
}

interface PlayerAnalysis {
  player: PlayerData;
  pick: TransferAssistantModalProps['picks'][0];
  form: number;
  avgLast5: number;
  upcomingFDR: number;
  fixtureCount: number;
  priceChange: number;
  xGDiff: number; // Expected vs actual goals
  xADiff: number; // Expected vs actual assists
  availabilityRisk: number; // 0 = available, 1 = doubtful, 2 = injured/suspended
  overallScore: number;
  issues: string[];
  strengths: string[];
}

interface TransferSuggestion {
  out: PlayerAnalysis;
  in: PlayerData;
  reason: string;
  netCost: number;
  expectedGain: number;
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

export default function TransferAssistantModal({
  picks,
  players,
  teams,
  bank,
  onClose,
}: TransferAssistantModalProps) {
  const [playerHistories, setPlayerHistories] = useState<Record<number, PlayerHistory[]>>({});
  const [playerFixtures, setPlayerFixtures] = useState<Record<number, PlayerFixture[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sell' | 'buy' | 'transfers'>('overview');

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
      for (let i = 0; i < picks.length; i += batchSize) {
        const batch = picks.slice(i, i + batchSize);
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
    return teams.find((t) => t.id === teamId)?.short_name || 'UNK';
  };

  const getTeamFullName = (teamId: number) => {
    return teams.find((t) => t.id === teamId)?.name || 'Unknown';
  };

  // Analyze each player in the squad
  const squadAnalysis = useMemo((): PlayerAnalysis[] => {
    return picks.map((pick) => {
      const player = players.find((p) => p.id === pick.element)!;
      const history = playerHistories[pick.element] || [];
      const fixtures = playerFixtures[pick.element] || [];

      // Form calculation (last 5 GWs)
      const last5 = history.slice(-5);
      const avgLast5 = last5.length > 0
        ? last5.reduce((sum, h) => sum + h.total_points, 0) / last5.length
        : 0;

      // Upcoming fixture difficulty (next 5)
      const next5Fixtures = fixtures.slice(0, 5);
      const upcomingFDR = next5Fixtures.length > 0
        ? next5Fixtures.reduce((sum, f) => sum + f.difficulty, 0) / next5Fixtures.length
        : 3;

      // Price change
      const priceChange = (player.cost_change_event || 0) / 10;

      // xG vs actual
      const xG = parseFloat(player.expected_goals || '0');
      const xA = parseFloat(player.expected_assists || '0');
      const xGDiff = (player.goals_scored || 0) - xG;
      const xADiff = (player.assists || 0) - xA;

      // Availability risk
      let availabilityRisk = 0;
      const status = player.status || 'a';
      if (status === 'i' || status === 's' || status === 'u') {
        availabilityRisk = 2;
      } else if (status === 'd' || (player.chance_of_playing_next_round !== null && player.chance_of_playing_next_round !== undefined && player.chance_of_playing_next_round < 75)) {
        availabilityRisk = 1;
      }

      // Collect issues
      const issues: string[] = [];
      const strengths: string[] = [];

      // Form issues
      const form = parseFloat(player.form || '0');
      if (form < 2) issues.push('Very poor form');
      else if (form < 4) issues.push('Below average form');
      else if (form >= 6) strengths.push('Excellent form');
      else if (form >= 4) strengths.push('Good form');

      // Fixture issues
      if (upcomingFDR > 3.5) issues.push('Tough upcoming fixtures');
      else if (upcomingFDR < 2.5) strengths.push('Easy upcoming fixtures');

      // Availability issues
      if (availabilityRisk === 2) issues.push('Injured/Suspended');
      else if (availabilityRisk === 1) issues.push('Doubtful for next game');

      // Price issues
      if (priceChange < 0) issues.push('Price falling');
      else if (priceChange > 0) strengths.push('Price rising');

      // Underperformance vs xG
      if (xGDiff < -2) issues.push('Underperforming xG significantly');
      else if (xGDiff > 2) strengths.push('Outperforming xG');

      // Calculate overall score (higher = better to keep)
      let overallScore = 50; // Base score
      overallScore += form * 5; // Form contribution (0-50)
      overallScore -= (upcomingFDR - 3) * 10; // Fixture difficulty (-20 to +20)
      overallScore -= availabilityRisk * 15; // Availability penalty
      overallScore += priceChange * 5; // Price momentum
      overallScore += (xGDiff + xADiff) * 2; // xG performance

      return {
        player,
        pick,
        form,
        avgLast5,
        upcomingFDR,
        fixtureCount: next5Fixtures.length,
        priceChange,
        xGDiff,
        xADiff,
        availabilityRisk,
        overallScore,
        issues,
        strengths,
      };
    }).sort((a, b) => a.overallScore - b.overallScore); // Worst players first
  }, [picks, players, playerHistories, playerFixtures]);

  // Players to consider selling (bottom performers)
  const sellCandidates = useMemo(() => {
    return squadAnalysis
      .filter((a) => a.issues.length > 0)
      .slice(0, 5);
  }, [squadAnalysis]);

  // Find replacement suggestions
  const buySuggestions = useMemo(() => {
    const suggestions: Record<number, PlayerData[]> = { 1: [], 2: [], 3: [], 4: [] };

    players
      .filter((p) => !picks.some((pick) => pick.element === p.id)) // Not in squad
      .filter((p) => !p.status || p.status === 'a') // Available
      .filter((p) => parseFloat(p.form || '0') >= 4) // Good form
      .filter((p) => (p.minutes || 0) > 200) // Has been playing
      .forEach((p) => {
        suggestions[p.element_type].push(p);
      });

    // Sort each position by form
    Object.keys(suggestions).forEach((pos) => {
      suggestions[parseInt(pos)].sort((a, b) => 
        parseFloat(b.form) - parseFloat(a.form)
      );
      suggestions[parseInt(pos)] = suggestions[parseInt(pos)].slice(0, 10);
    });

    return suggestions;
  }, [players, picks]);

  // Generate transfer suggestions
  const transferSuggestions = useMemo((): TransferSuggestion[] => {
    const suggestions: TransferSuggestion[] = [];

    sellCandidates.forEach((candidate) => {
      const position = candidate.player.element_type;
      const maxBudget = (candidate.player.now_cost + bank) / 10;
      
      const replacements = buySuggestions[position]
        ?.filter((p) => p.now_cost / 10 <= maxBudget)
        .slice(0, 3);

      replacements?.forEach((replacement) => {
        const formDiff = parseFloat(replacement.form) - candidate.form;
        const netCost = (replacement.now_cost - candidate.player.now_cost) / 10;

        let reason = '';
        if (candidate.availabilityRisk > 0) {
          reason = `${candidate.player.web_name} is ${candidate.availabilityRisk === 2 ? 'unavailable' : 'doubtful'}`;
        } else if (candidate.form < 2) {
          reason = `${candidate.player.web_name} is in terrible form (${candidate.form.toFixed(1)})`;
        } else if (candidate.issues.includes('Tough upcoming fixtures')) {
          reason = `${candidate.player.web_name} has difficult fixtures ahead`;
        } else {
          reason = `Upgrade from ${candidate.player.web_name} (form: ${candidate.form.toFixed(1)}) to ${replacement.web_name} (form: ${parseFloat(replacement.form).toFixed(1)})`;
        }

        suggestions.push({
          out: candidate,
          in: replacement,
          reason,
          netCost,
          expectedGain: formDiff * 5, // Rough estimate
        });
      });
    });

    return suggestions
      .sort((a, b) => b.expectedGain - a.expectedGain)
      .slice(0, 10);
  }, [sellCandidates, buySuggestions, bank]);

  // Squad health summary
  const squadHealth = useMemo(() => {
    const avgForm = squadAnalysis.reduce((sum, a) => sum + a.form, 0) / squadAnalysis.length;
    const avgFDR = squadAnalysis.reduce((sum, a) => sum + a.upcomingFDR, 0) / squadAnalysis.length;
    const injuredCount = squadAnalysis.filter((a) => a.availabilityRisk === 2).length;
    const doubtfulCount = squadAnalysis.filter((a) => a.availabilityRisk === 1).length;
    const poorFormCount = squadAnalysis.filter((a) => a.form < 3).length;

    let healthScore = 100;
    healthScore -= injuredCount * 15;
    healthScore -= doubtfulCount * 5;
    healthScore -= poorFormCount * 5;
    healthScore -= Math.max(0, (avgFDR - 3) * 10);
    healthScore += Math.max(0, (avgForm - 4) * 10);

    return {
      score: Math.max(0, Math.min(100, healthScore)),
      avgForm,
      avgFDR,
      injuredCount,
      doubtfulCount,
      poorFormCount,
    };
  }, [squadAnalysis]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-lime-400';
    if (score >= 40) return 'text-yellow-400';
    if (score >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const getFDRColor = (fdr: number) => {
    if (fdr <= 2) return 'bg-green-500';
    if (fdr <= 2.5) return 'bg-lime-500';
    if (fdr <= 3) return 'bg-yellow-500';
    if (fdr <= 3.5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const PlayerCard = ({ analysis, showScore = false }: { analysis: PlayerAnalysis; showScore?: boolean }) => {
    const initials = analysis.player.web_name.substring(0, 2).toUpperCase();

    return (
      <div className="bg-[var(--pl-dark)]/50 rounded-xl p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[var(--pl-purple)] to-[var(--pl-pink)] flex items-center justify-center font-bold text-white text-xs sm:text-sm">
              {initials}
            </div>
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white ${POSITION_COLORS[analysis.player.element_type]}`}>
              {POSITION_NAMES[analysis.player.element_type]}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold truncate text-sm sm:text-base">{analysis.player.web_name}</span>
              {showScore && (
                <span className={`text-xs sm:text-sm font-bold ${analysis.overallScore >= 60 ? 'text-green-400' : analysis.overallScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {analysis.overallScore.toFixed(0)}
                </span>
              )}
            </div>
            <div className="text-xs sm:text-sm text-[var(--pl-text-muted)]">
              {getTeamName(analysis.player.team)} • £{(analysis.player.now_cost / 10).toFixed(1)}m
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${analysis.form >= 4 ? 'bg-green-500/20 text-green-400' : analysis.form >= 2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                Form: {analysis.form.toFixed(1)}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFDRColor(analysis.upcomingFDR)} text-white`}>
                FDR: {analysis.upcomingFDR.toFixed(1)}
              </span>
              {analysis.availabilityRisk > 0 && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                  {analysis.availabilityRisk === 2 ? '🚑 Out' : '⚠️ Doubt'}
                </span>
              )}
            </div>

            {/* Issues/Strengths */}
            {analysis.issues.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {analysis.issues.map((issue, i) => (
                  <span key={i} className="text-xs text-red-400">• {issue}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ReplacementCard = ({ player }: { player: PlayerData }) => {
    const initials = player.web_name.substring(0, 2).toUpperCase();
    const form = parseFloat(player.form);

    return (
      <div className="bg-[var(--pl-dark)]/50 rounded-xl p-3 hover:bg-[var(--pl-card-hover)] transition-all">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--pl-green)] to-[var(--pl-cyan)] flex items-center justify-center font-bold text-white text-xs">
              {initials}
            </div>
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${POSITION_COLORS[player.element_type]}`}>
              {POSITION_NAMES[player.element_type]}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate text-sm">{player.web_name}</div>
            <div className="text-xs text-[var(--pl-text-muted)]">
              {getTeamName(player.team)} • £{(player.now_cost / 10).toFixed(1)}m
            </div>
          </div>

          <div className="text-right">
            <div className={`text-lg font-bold ${form >= 6 ? 'text-green-400' : form >= 4 ? 'text-lime-400' : 'text-yellow-400'}`}>
              {form.toFixed(1)}
            </div>
            <div className="text-xs text-[var(--pl-text-muted)]">form</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-4xl max-h-[95vh] overflow-hidden glass rounded-t-2xl sm:rounded-2xl animate-slide-up sm:m-4 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-white/10 bg-[var(--pl-card)]">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <span className="text-white text-xl leading-none">×</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--pl-cyan)] to-[var(--pl-green)] flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Transfer Assistant</h2>
              <p className="text-sm text-[var(--pl-text-muted)]">
                AI-powered squad analysis
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['overview', 'sell', 'buy', 'transfers'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-[var(--pl-green)] text-black'
                    : 'bg-[var(--pl-dark)] text-[var(--pl-text-muted)] hover:text-white'
                }`}
              >
                {tab === 'overview' && '📊 Overview'}
                {tab === 'sell' && '🔴 Sell'}
                {tab === 'buy' && '🟢 Buy'}
                {tab === 'transfers' && '🔄 Suggestions'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[var(--pl-text-muted)]">Analyzing your squad...</p>
            </div>
          )}

          {!loading && activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Squad Health Score */}
              <div className="card text-center">
                <h3 className="text-lg font-semibold mb-4">Squad Health Score</h3>
                <div className={`text-6xl font-bold ${getHealthColor(squadHealth.score)}`}>
                  {squadHealth.score.toFixed(0)}
                </div>
                <div className="text-[var(--pl-text-muted)] mt-2">out of 100</div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="bg-[var(--pl-dark)]/50 rounded-lg p-3">
                    <div className="text-2xl font-bold">{squadHealth.avgForm.toFixed(1)}</div>
                    <div className="text-xs text-[var(--pl-text-muted)]">Avg Form</div>
                  </div>
                  <div className="bg-[var(--pl-dark)]/50 rounded-lg p-3">
                    <div className="text-2xl font-bold">{squadHealth.avgFDR.toFixed(1)}</div>
                    <div className="text-xs text-[var(--pl-text-muted)]">Avg FDR</div>
                  </div>
                  <div className="bg-[var(--pl-dark)]/50 rounded-lg p-3">
                    <div className={`text-2xl font-bold ${squadHealth.injuredCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {squadHealth.injuredCount}
                    </div>
                    <div className="text-xs text-[var(--pl-text-muted)]">Injured/Out</div>
                  </div>
                  <div className="bg-[var(--pl-dark)]/50 rounded-lg p-3">
                    <div className={`text-2xl font-bold ${squadHealth.poorFormCount > 3 ? 'text-red-400' : squadHealth.poorFormCount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {squadHealth.poorFormCount}
                    </div>
                    <div className="text-xs text-[var(--pl-text-muted)]">Poor Form</div>
                  </div>
                </div>
              </div>

              {/* Key Issues */}
              {sellCandidates.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    Key Issues
                  </h3>
                  <div className="space-y-3">
                    {sellCandidates.slice(0, 3).map((analysis) => (
                      <PlayerCard key={analysis.player.id} analysis={analysis} showScore />
                    ))}
                  </div>
                </div>
              )}

              {/* Budget Info */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-2">Transfer Budget</h3>
                <div className="text-3xl font-bold text-[var(--pl-green)]">
                  £{(bank / 10).toFixed(1)}m
                </div>
                <p className="text-sm text-[var(--pl-text-muted)] mt-1">
                  Available in the bank
                </p>
              </div>
            </div>
          )}

          {!loading && activeTab === 'sell' && (
            <div className="space-y-4">
              <p className="text-[var(--pl-text-muted)] text-sm">
                Players ranked by transfer priority (worst performers first)
              </p>
              {squadAnalysis.map((analysis) => (
                <PlayerCard key={analysis.player.id} analysis={analysis} showScore />
              ))}
            </div>
          )}

          {!loading && activeTab === 'buy' && (
            <div className="space-y-6">
              {([1, 2, 3, 4] as const).map((pos) => (
                <div key={pos}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${POSITION_COLORS[pos]}`}>
                      {POSITION_NAMES[pos]}
                    </span>
                    Top {POSITION_NAMES[pos]}s by Form
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {buySuggestions[pos]?.slice(0, 6).map((player) => (
                      <ReplacementCard key={player.id} player={player} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && activeTab === 'transfers' && (
            <div className="space-y-4">
              <p className="text-[var(--pl-text-muted)] text-sm mb-4">
                Suggested transfers based on form, fixtures, and availability
              </p>

              {transferSuggestions.length === 0 ? (
                <div className="card text-center py-8">
                  <div className="text-4xl mb-4">✨</div>
                  <h3 className="text-lg font-semibold mb-2">Squad Looking Good!</h3>
                  <p className="text-[var(--pl-text-muted)]">
                    No urgent transfers recommended at this time.
                  </p>
                </div>
              ) : (
                transferSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="card">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 rounded bg-[var(--pl-purple)]/30 text-[var(--pl-purple)] text-xs font-medium">
                        #{idx + 1}
                      </span>
                      <span className="text-sm text-[var(--pl-text-muted)]">{suggestion.reason}</span>
                    </div>

                    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                      {/* Out */}
                      <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                        <div className="text-xs text-red-400 font-medium mb-2">SELL</div>
                        <div className="font-semibold">{suggestion.out.player.web_name}</div>
                        <div className="text-sm text-[var(--pl-text-muted)]">
                          {getTeamName(suggestion.out.player.team)} • £{(suggestion.out.player.now_cost / 10).toFixed(1)}m
                        </div>
                        <div className="text-xs mt-1 text-red-400">
                          Form: {suggestion.out.form.toFixed(1)}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="text-2xl">→</div>

                      {/* In */}
                      <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                        <div className="text-xs text-green-400 font-medium mb-2">BUY</div>
                        <div className="font-semibold">{suggestion.in.web_name}</div>
                        <div className="text-sm text-[var(--pl-text-muted)]">
                          {getTeamName(suggestion.in.team)} • £{(suggestion.in.now_cost / 10).toFixed(1)}m
                        </div>
                        <div className="text-xs mt-1 text-green-400">
                          Form: {parseFloat(suggestion.in.form).toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* Cost */}
                    <div className="mt-3 flex justify-between text-sm">
                      <span className="text-[var(--pl-text-muted)]">Net cost:</span>
                      <span className={suggestion.netCost > 0 ? 'text-red-400' : 'text-green-400'}>
                        {suggestion.netCost > 0 ? '-' : '+'}£{Math.abs(suggestion.netCost).toFixed(1)}m
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

