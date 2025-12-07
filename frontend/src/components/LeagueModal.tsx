'use client';

import { useState, useEffect } from 'react';
import { fplApi } from '@/lib/api';

interface LeagueStanding {
  id: number;
  entry: number;
  entry_name: string;
  player_name: string;
  rank: number;
  last_rank: number;
  rank_sort: number;
  total: number;
  event_total: number;
}

interface LeagueData {
  league: {
    id: number;
    name: string;
    created: string;
    closed: boolean;
    max_entries: number | null;
    league_type: string;
    scoring: string;
    start_event: number;
  };
  standings: {
    has_next: boolean;
    page: number;
    results: LeagueStanding[];
  };
}

interface LeagueModalProps {
  leagueId: number;
  leagueName: string;
  onClose: () => void;
  onViewTeam: (teamId: number, teamName: string, managerName: string) => void;
  currentTeamId?: number | null;
}

export default function LeagueModal({
  leagueId,
  leagueName,
  onClose,
  onViewTeam,
  currentTeamId,
}: LeagueModalProps) {
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLeagueData();
  }, [leagueId, page]);

  const fetchLeagueData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fplApi.getLeague(leagueId, page);
      setLeagueData(data);
    } catch (err) {
      setError('Failed to load league standings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatRank = (rank: number) => rank.toLocaleString();

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-black';
    if (rank === 2) return 'bg-gray-300 text-black';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-[var(--pl-dark)] text-white';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-hidden glass rounded-t-2xl sm:rounded-2xl animate-slide-up sm:m-4 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-white/10 bg-[var(--pl-card)]">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <span className="text-white text-xl leading-none">×</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--pl-green)] to-[var(--pl-cyan)] flex items-center justify-center text-2xl">
              🏆
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{leagueName}</h2>
              <p className="text-sm text-[var(--pl-text-muted)]">
                {leagueData?.standings?.results?.length || 0} managers
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-[var(--pl-pink)]">{error}</div>
          )}

          {!loading && !error && leagueData && (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-[var(--pl-text-muted)] font-medium">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-6 sm:col-span-5">Manager</div>
                <div className="col-span-2 text-center hidden sm:block">GW</div>
                <div className="col-span-3 sm:col-span-2 text-right">Total</div>
                <div className="col-span-2 text-center">Move</div>
              </div>

              {/* Standings */}
              {leagueData.standings.results.map((standing) => {
                const rankChange = standing.last_rank - standing.rank;
                const isUp = rankChange > 0;
                const isDown = rankChange < 0;
                const isCurrentUser = standing.entry === currentTeamId;

                return (
                  <button
                    key={standing.id}
                    onClick={() => onViewTeam(standing.entry, standing.entry_name, standing.player_name)}
                    className={`w-full grid grid-cols-12 gap-2 p-3 rounded-xl transition-all text-left ${
                      isCurrentUser
                        ? 'bg-[var(--pl-green)]/20 border border-[var(--pl-green)]/30'
                        : 'bg-[var(--pl-dark)]/50 hover:bg-[var(--pl-card-hover)]'
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex items-center justify-center">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadgeColor(
                          standing.rank
                        )}`}
                      >
                        {standing.rank}
                      </span>
                    </div>

                    {/* Manager Info */}
                    <div className="col-span-6 sm:col-span-5 min-w-0">
                      <div className="font-semibold truncate text-sm sm:text-base">
                        {standing.entry_name}
                      </div>
                      <div className="text-xs text-[var(--pl-text-muted)] truncate">
                        {standing.player_name}
                      </div>
                    </div>

                    {/* GW Points */}
                    <div className="col-span-2 hidden sm:flex items-center justify-center">
                      <span className="text-[var(--pl-cyan)] font-medium">
                        {standing.event_total}
                      </span>
                    </div>

                    {/* Total Points */}
                    <div className="col-span-3 sm:col-span-2 flex items-center justify-end">
                      <span className="text-lg font-bold">{formatRank(standing.total)}</span>
                    </div>

                    {/* Rank Movement */}
                    <div className="col-span-2 flex items-center justify-center">
                      {rankChange !== 0 ? (
                        <span
                          className={`flex items-center gap-1 text-sm font-medium ${
                            isUp ? 'text-[var(--pl-green)]' : 'text-[var(--pl-pink)]'
                          }`}
                        >
                          {isUp ? '▲' : '▼'}
                          {Math.abs(rankChange)}
                        </span>
                      ) : (
                        <span className="text-[var(--pl-text-muted)]">-</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {leagueData?.standings?.has_next && (
            <div className="flex justify-center gap-2 mt-6">
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 rounded-lg bg-[var(--pl-dark)] hover:bg-[var(--pl-card-hover)] transition-colors"
                >
                  Previous
                </button>
              )}
              <span className="px-4 py-2 text-[var(--pl-text-muted)]">Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-lg bg-[var(--pl-dark)] hover:bg-[var(--pl-card-hover)] transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

