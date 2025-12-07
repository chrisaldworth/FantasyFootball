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

interface PlayerData {
  id: number;
  web_name: string;
  photo: string;
  team: number;
  element_type: number;
  form: string;
  now_cost: number;
  total_points: number;
  selected_by_percent: string;
  history?: PlayerHistory[];
}

interface SquadFormModalProps {
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

export default function SquadFormModal({
  picks,
  players,
  teams,
  onClose,
}: SquadFormModalProps) {
  const [playerHistories, setPlayerHistories] = useState<Record<number, PlayerHistory[]>>({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'form' | 'position' | 'points'>('form');

  // Get squad players with their data
  const squadPlayers = useMemo(() => {
    return picks.map((pick) => {
      const player = players.find((p) => p.id === pick.element);
      return {
        ...pick,
        player,
        history: playerHistories[pick.element] || [],
      };
    }).filter((p) => p.player);
  }, [picks, players, playerHistories]);

  useEffect(() => {
    fetchPlayerHistories();
  }, [picks]);

  const fetchPlayerHistories = async () => {
    setLoading(true);
    try {
      const histories: Record<number, PlayerHistory[]> = {};
      
      // Fetch player summaries in batches to avoid rate limiting
      const batchSize = 5;
      for (let i = 0; i < picks.length; i += batchSize) {
        const batch = picks.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async (pick) => {
            try {
              const data = await fplApi.getPlayer(pick.element);
              return { id: pick.element, history: data.history || [] };
            } catch (err) {
              console.error(`Failed to fetch player ${pick.element}:`, err);
              return { id: pick.element, history: [] };
            }
          })
        );
        
        results.forEach((result) => {
          histories[result.id] = result.history;
        });
      }
      
      setPlayerHistories(histories);
    } catch (err) {
      console.error('Failed to fetch player histories:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFormColor = (form: number) => {
    if (form >= 6) return 'text-green-400 bg-green-500/20';
    if (form >= 4) return 'text-lime-400 bg-lime-500/20';
    if (form >= 2) return 'text-yellow-400 bg-yellow-500/20';
    if (form >= 1) return 'text-orange-400 bg-orange-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getFormLabel = (form: number) => {
    if (form >= 6) return '🔥 Hot';
    if (form >= 4) return '📈 Good';
    if (form >= 2) return '➡️ Average';
    if (form >= 1) return '📉 Poor';
    return '❄️ Cold';
  };

  const getPointsColor = (points: number) => {
    if (points >= 10) return 'bg-green-500';
    if (points >= 6) return 'bg-lime-500';
    if (points >= 4) return 'bg-yellow-500';
    if (points >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTeamName = (teamId: number) => {
    const team = teams.find((t) => t.id === teamId);
    return team?.short_name || 'UNK';
  };

  const getLast5 = (history: PlayerHistory[]) => {
    return history.slice(-5).reverse();
  };

  const getAvgLast5 = (history: PlayerHistory[]) => {
    const last5 = getLast5(history);
    if (last5.length === 0) return 0;
    const sum = last5.reduce((acc, h) => acc + h.total_points, 0);
    return sum / last5.length;
  };

  const sortedPlayers = useMemo(() => {
    const sorted = [...squadPlayers];
    
    switch (sortBy) {
      case 'form':
        return sorted.sort((a, b) => {
          const formA = parseFloat(a.player?.form || '0');
          const formB = parseFloat(b.player?.form || '0');
          return formB - formA;
        });
      case 'position':
        return sorted.sort((a, b) => a.position - b.position);
      case 'points':
        return sorted.sort((a, b) => {
          const avgA = getAvgLast5(a.history);
          const avgB = getAvgLast5(b.history);
          return avgB - avgA;
        });
      default:
        return sorted;
    }
  }, [squadPlayers, sortBy]);

  const inFormPlayers = sortedPlayers.filter(
    (p) => parseFloat(p.player?.form || '0') >= 4
  );
  const outOfFormPlayers = sortedPlayers.filter(
    (p) => parseFloat(p.player?.form || '0') < 4
  );

  const maxPoints = useMemo(() => {
    let max = 0;
    Object.values(playerHistories).forEach((history) => {
      history.forEach((h) => {
        if (h.total_points > max) max = h.total_points;
      });
    });
    return Math.max(max, 10);
  }, [playerHistories]);

  const PlayerCard = ({ pick }: { pick: typeof sortedPlayers[0] }) => {
    const player = pick.player!;
    const form = parseFloat(player.form || '0');
    const last5 = getLast5(pick.history);
    const avgLast5 = getAvgLast5(pick.history);

    return (
      <div className="bg-[var(--pl-dark)]/50 rounded-xl p-4 hover:bg-[var(--pl-card-hover)] transition-all">
        <div className="flex items-start gap-3 mb-3">
          {/* Player Photo */}
          <div className="relative flex-shrink-0">
            <img
              src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.photo?.replace('.png', '')}.png`}
              alt={player.web_name}
              className="w-12 h-12 rounded-lg object-cover object-top bg-[var(--pl-card)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.team}-110.webp`;
              }}
            />
            <span
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                POSITION_COLORS[player.element_type]
              }`}
            >
              {POSITION_NAMES[player.element_type]}
            </span>
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{player.web_name}</span>
              {pick.is_captain && (
                <span className="w-5 h-5 rounded-full bg-[var(--pl-cyan)] text-black text-xs font-bold flex items-center justify-center">
                  C
                </span>
              )}
              {pick.is_vice_captain && (
                <span className="w-5 h-5 rounded-full bg-[var(--pl-purple)] text-white text-xs font-bold flex items-center justify-center">
                  V
                </span>
              )}
            </div>
            <div className="text-sm text-[var(--pl-text-muted)]">
              {getTeamName(player.team)} • £{(player.now_cost / 10).toFixed(1)}m
            </div>
          </div>

          {/* Form Badge */}
          <div className={`px-3 py-1 rounded-lg font-bold ${getFormColor(form)}`}>
            {form.toFixed(1)}
          </div>
        </div>

        {/* Form Label */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm">{getFormLabel(form)}</span>
          <span className="text-sm text-[var(--pl-text-muted)]">
            Avg L5: <span className="text-white font-medium">{avgLast5.toFixed(1)}</span> pts
          </span>
        </div>

        {/* Last 5 Matches Graph */}
        <div className="space-y-1">
          <div className="text-xs text-[var(--pl-text-muted)] mb-2">Last 5 Gameweeks</div>
          
          {last5.length > 0 ? (
            <div className="flex items-end gap-1 h-16">
              {last5.map((match, idx) => {
                const height = (match.total_points / maxPoints) * 100;
                const opponent = getTeamName(match.opponent_team);
                
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div className="relative w-full flex-1 flex items-end">
                      <div
                        className={`w-full rounded-t transition-all ${getPointsColor(match.total_points)}`}
                        style={{ height: `${Math.max(height, 8)}%` }}
                      />
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-xs font-bold">
                        {match.total_points}
                      </span>
                    </div>
                    <div className="text-[10px] text-[var(--pl-text-muted)] flex flex-col items-center">
                      <span className={match.was_home ? 'text-green-400' : 'text-gray-400'}>
                        {match.was_home ? 'H' : 'A'}
                      </span>
                      <span>{opponent}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-16 flex items-center justify-center text-sm text-[var(--pl-text-muted)]">
              No match data available
            </div>
          )}
        </div>

        {/* Match Stats Summary */}
        {last5.length > 0 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-[var(--pl-text-muted)]">
                ⚽ {last5.reduce((sum, m) => sum + m.goals_scored, 0)}
              </span>
              <span className="text-[var(--pl-text-muted)]">
                🅰️ {last5.reduce((sum, m) => sum + m.assists, 0)}
              </span>
              <span className="text-[var(--pl-text-muted)]">
                🧤 {last5.reduce((sum, m) => sum + m.clean_sheets, 0)}
              </span>
              <span className="text-[var(--pl-text-muted)]">
                ⭐ {last5.reduce((sum, m) => sum + m.bonus, 0)}
              </span>
            </div>
            <span className="text-[var(--pl-cyan)]">
              {last5.reduce((sum, m) => sum + m.total_points, 0)} pts
            </span>
          </div>
        )}
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl">
              📊
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Squad Form Analysis</h2>
              <p className="text-sm text-[var(--pl-text-muted)]">
                Performance over last 5 gameweeks
              </p>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2">
            {(['form', 'position', 'points'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  sortBy === option
                    ? 'bg-[var(--pl-green)] text-black'
                    : 'bg-[var(--pl-dark)] text-[var(--pl-text-muted)] hover:text-white'
                }`}
              >
                {option === 'form' && '🔥 By Form'}
                {option === 'position' && '⬇️ By Position'}
                {option === 'points' && '📈 By Avg Pts'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[var(--pl-text-muted)]">Loading player form data...</p>
            </div>
          )}

          {!loading && (
            <div className="space-y-8">
              {/* In Form Section */}
              {inFormPlayers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    In Form ({inFormPlayers.length})
                    <span className="text-sm font-normal text-[var(--pl-text-muted)]">
                      Form ≥ 4.0
                    </span>
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {inFormPlayers.map((pick) => (
                      <PlayerCard key={pick.element} pick={pick} />
                    ))}
                  </div>
                </div>
              )}

              {/* Out of Form Section */}
              {outOfFormPlayers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">❄️</span>
                    Out of Form ({outOfFormPlayers.length})
                    <span className="text-sm font-normal text-[var(--pl-text-muted)]">
                      Form &lt; 4.0
                    </span>
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {outOfFormPlayers.map((pick) => (
                      <PlayerCard key={pick.element} pick={pick} />
                    ))}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="bg-[var(--pl-dark)]/30 rounded-xl p-4">
                <h4 className="text-sm font-medium mb-3">Form Guide</h4>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFormColor(6)}`}>
                      6.0+
                    </span>
                    <span className="text-xs text-[var(--pl-text-muted)]">Hot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFormColor(4)}`}>
                      4.0-5.9
                    </span>
                    <span className="text-xs text-[var(--pl-text-muted)]">Good</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFormColor(2)}`}>
                      2.0-3.9
                    </span>
                    <span className="text-xs text-[var(--pl-text-muted)]">Average</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFormColor(1)}`}>
                      1.0-1.9
                    </span>
                    <span className="text-xs text-[var(--pl-text-muted)]">Poor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getFormColor(0)}`}>
                      &lt;1.0
                    </span>
                    <span className="text-xs text-[var(--pl-text-muted)]">Cold</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

