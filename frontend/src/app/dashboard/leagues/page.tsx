'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fplApi } from '@/lib/api';
import LeagueModal from '@/components/LeagueModal';
import SideNavigation from '@/components/navigation/SideNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';

interface FPLLeague {
  id: number;
  name: string;
  short_name?: string;
  entry_rank: number;
  entry_last_rank: number;
  entry_can_leave: boolean;
  entry_can_admin: boolean;
  entry_can_invite: boolean;
  created: string;
  closed: boolean;
  league_type: string;
  scoring: string;
}

interface FPLTeam {
  leagues: {
    classic: FPLLeague[];
    h2h: FPLLeague[];
  };
}

function LeaguesContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [team, setTeam] = useState<FPLTeam | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.fpl_team_id) {
      fetchTeamData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fplApi.getMyTeam();
      setTeam(data);
    } catch (err: any) {
      setError('Failed to load leagues');
      console.error('Failed to fetch team data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatRank = (rank: number | null) => {
    if (rank === null) return 'N/A';
    return rank.toLocaleString();
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--pl-dark)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user?.fpl_team_id) {
    return (
      <div className="min-h-screen bg-[var(--pl-dark)]">
        <SideNavigation />
        <BottomNavigation />
        <main className="pt-20 sm:pt-24 lg:pt-32 lg:pl-60 pb-20 lg:pb-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-4">Leagues</h2>
              <p className="text-[var(--pl-text-muted)] mb-6">
                Link your FPL team to view leagues
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const allLeagues = [
    ...(team?.leagues?.classic || []),
    ...(team?.leagues?.h2h || []),
  ];

  return (
    <div className="min-h-screen bg-[var(--pl-dark)]">
      <SideNavigation />
      <BottomNavigation />
      <main className="pt-20 sm:pt-24 lg:pt-32 lg:pl-60 pb-20 lg:pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)]"
              aria-label="Back to dashboard"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Leagues</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30 text-[var(--pl-pink)]">
              {error}
            </div>
          )}

          {allLeagues.length > 0 ? (
            <div className="space-y-6">
              {/* Classic Leagues */}
              {team?.leagues?.classic && team.leagues.classic.length > 0 && (
                <div className="glass rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span>🏆</span>
                    <span>Classic Leagues</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.leagues.classic.map((league) => {
                      const rankChange = league.entry_last_rank - league.entry_rank;
                      const isUp = rankChange > 0;
                      const isDown = rankChange < 0;

                      return (
                        <button
                          key={league.id}
                          onClick={() => setSelectedLeague({ id: league.id, name: league.name })}
                          className="p-4 rounded-lg bg-[var(--pl-dark)]/50 border border-white/10 hover:bg-[var(--pl-card-hover)] transition-colors text-left touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)]"
                        >
                          <div className="font-semibold text-sm sm:text-base mb-2 line-clamp-2">
                            {league.name}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-[var(--pl-text-muted)]">
                              Rank
                            </div>
                            <div className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-xl font-bold text-[var(--pl-green)]">
                                  #{formatRank(league.entry_rank)}
                                </span>
                                {rankChange !== 0 && (
                                  <span
                                    className={`text-sm font-medium ${
                                      isUp ? 'text-[var(--pl-green)]' : isDown ? 'text-[var(--pl-pink)]' : ''
                                    }`}
                                  >
                                    {isUp ? '▲' : '▼'} {Math.abs(rankChange)}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[var(--pl-text-muted)]">
                                Last GW: #{formatRank(league.entry_last_rank)}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Head to Head Leagues */}
              {team?.leagues?.h2h && team.leagues.h2h.length > 0 && (
                <div className="glass rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span>⚔️</span>
                    <span>Head-to-Head Leagues</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.leagues.h2h.map((league) => {
                      const rankChange = league.entry_last_rank - league.entry_rank;
                      const isUp = rankChange > 0;
                      const isDown = rankChange < 0;

                      return (
                        <button
                          key={league.id}
                          onClick={() => setSelectedLeague({ id: league.id, name: league.name })}
                          className="p-4 rounded-lg bg-[var(--pl-dark)]/50 border border-white/10 hover:bg-[var(--pl-card-hover)] transition-colors text-left touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)]"
                        >
                          <div className="font-semibold text-sm sm:text-base mb-2 line-clamp-2">
                            {league.name}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-[var(--pl-text-muted)]">
                              Rank
                            </div>
                            <div className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-xl font-bold text-[var(--pl-green)]">
                                  #{formatRank(league.entry_rank)}
                                </span>
                                {rankChange !== 0 && (
                                  <span
                                    className={`text-sm font-medium ${
                                      isUp ? 'text-[var(--pl-green)]' : isDown ? 'text-[var(--pl-pink)]' : ''
                                    }`}
                                  >
                                    {isUp ? '▲' : '▼'} {Math.abs(rankChange)}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[var(--pl-text-muted)]">
                                Last GW: #{formatRank(league.entry_last_rank)}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">🏟️</div>
              <h3 className="text-lg font-semibold mb-2">No Leagues Found</h3>
              <p className="text-[var(--pl-text-muted)]">
                Join a league on the official FPL website to see it here.
              </p>
            </div>
          )}

          {/* League Modal */}
          {selectedLeague && (
            <LeagueModal
              leagueId={selectedLeague.id}
              leagueName={selectedLeague.name}
              onClose={() => setSelectedLeague(null)}
              onViewTeam={(teamId, teamName, managerName) => {
                // Could navigate to team view or show modal
                console.log('View team:', teamId, teamName, managerName);
              }}
              currentTeamId={user?.fpl_team_id || null}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function LeaguesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--pl-dark)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LeaguesContent />
    </Suspense>
  );
}

