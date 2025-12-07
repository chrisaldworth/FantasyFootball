'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { fplApi } from '@/lib/api';
import TeamPitch from '@/components/TeamPitch';
import LeagueModal from '@/components/LeagueModal';
import TeamViewModal from '@/components/TeamViewModal';
import SquadFormModal from '@/components/SquadFormModal';
import TransferAssistantModal from '@/components/TransferAssistantModal';

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
  start_event: number;
  has_cup: boolean;
  cup_league?: number | null;
  rank?: number | null;
}

interface FPLTeam {
  id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;
  current_event: number;
  leagues: {
    classic: FPLLeague[];
    h2h: FPLLeague[];
    cup: {
      matches: any[];
      status: { qualification_event: number | null; qualification_numbers: number | null; qualification_rank: number | null; qualification_state: string | null };
      cup_league: number | null;
    };
    cup_matches: any[];
  };
}

interface FPLHistory {
  current: {
    event: number;
    points: number;
    total_points: number;
    rank: number;
    overall_rank: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    points_on_bench: number;
  }[];
  chips: {
    name: string;
    event: number;
  }[];
}

interface FPLPicks {
  active_chip: string | null;
  automatic_subs: any[];
  entry_history: {
    event: number;
    points: number;
    total_points: number;
    rank: number;
    overall_rank: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    points_on_bench: number;
  };
  picks: {
    element: number;
    position: number;
    multiplier: number;
    is_captain: boolean;
    is_vice_captain: boolean;
  }[];
}

interface Player {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  total_points: number;
  event_points: number;
  form: string;
  selected_by_percent: string;
  photo: string;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  saves: number;
  bonus: number;
  bps: number;
  ict_index: string;
  influence: string;
  creativity: string;
  threat: string;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  minutes: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  starts: number;
  chance_of_playing_next_round: number | null;
  news: string;
  news_added: string | null;
}

interface Team {
  id: number;
  name: string;
  short_name: string;
}

interface BootstrapData {
  elements: Player[];
  teams: Team[];
  events: { id: number; is_current: boolean; finished: boolean }[];
}

interface LiveData {
  elements: {
    id: number;
    stats: {
      minutes: number;
      goals_scored: number;
      assists: number;
      clean_sheets: number;
      bonus: number;
      total_points: number;
    };
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, updateFplTeamId } = useAuth();
  const [team, setTeam] = useState<FPLTeam | null>(null);
  const [history, setHistory] = useState<FPLHistory | null>(null);
  const [picks, setPicks] = useState<FPLPicks | null>(null);
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTeamIdModal, setShowTeamIdModal] = useState(false);
  const [newTeamId, setNewTeamId] = useState('');
  const [savingTeamId, setSavingTeamId] = useState(false);
  const [activeTab, setActiveTab] = useState<'pitch' | 'leagues' | 'stats'>('pitch');
  const [selectedLeague, setSelectedLeague] = useState<{ id: number; name: string } | null>(null);
  const [viewingTeam, setViewingTeam] = useState<{ id: number; name: string; manager: string } | null>(null);
  const [showSquadForm, setShowSquadForm] = useState(false);
  const [showTransferAssistant, setShowTransferAssistant] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.fpl_team_id) {
      fetchTeamData();
    } else if (user) {
      setLoading(false);
    }
  }, [user]);

  const fetchTeamData = async () => {
    if (!user?.fpl_team_id) return;

    try {
      setLoading(true);
      setError('');

      // Fetch bootstrap data first to get current gameweek
      const bootstrapData = await fplApi.getBootstrap();
      setBootstrap(bootstrapData);

      // Find current or most recent finished gameweek
      const currentEvent = bootstrapData.events.find((e: any) => e.is_current);
      const finishedEvents = bootstrapData.events.filter((e: any) => e.finished);
      const latestEvent = currentEvent || finishedEvents[finishedEvents.length - 1];

      if (!latestEvent) {
        setError('Season has not started yet.');
        setLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [teamData, historyData, picksData, liveGameweekData] = await Promise.all([
        fplApi.getTeam(user.fpl_team_id),
        fplApi.getTeamHistory(user.fpl_team_id),
        fplApi.getTeamPicks(user.fpl_team_id, latestEvent.id),
        fplApi.getLiveGameweek(latestEvent.id).catch(() => null), // May fail if GW not started
      ]);

      setTeam(teamData);
      setHistory(historyData);
      setPicks(picksData);
      setLiveData(liveGameweekData);
    } catch (err: any) {
      console.error('Failed to fetch team data:', err);
      setError('Failed to fetch team data. Please check your FPL Team ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTeamId = async () => {
    if (!newTeamId) return;

    setSavingTeamId(true);
    try {
      await updateFplTeamId(parseInt(newTeamId));
      setShowTeamIdModal(false);
      setNewTeamId('');
      fetchTeamData();
    } catch (err: any) {
      setError('Failed to save Team ID. Please try again.');
    } finally {
      setSavingTeamId(false);
    }
  };

  const formatRank = (rank: number) => {
    return rank.toLocaleString();
  };

  const getRecentGameweeks = () => {
    if (!history?.current) return [];
    return history.current.slice(-6);
  };

  const getCurrentGameweek = () => {
    if (!bootstrap?.events) return null;
    return bootstrap.events.find((e) => e.is_current) || 
           bootstrap.events.filter((e) => e.finished).pop();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--pl-text-muted)]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--pl-green)] to-[var(--pl-cyan)] flex items-center justify-center">
              <span className="text-[var(--pl-dark)] font-bold text-xl">F</span>
            </div>
            <span className="font-bold text-xl">FPL Companion</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-[var(--pl-text-muted)] hidden sm:block">{user.username}</span>
            <button onClick={logout} className="btn-secondary px-4 py-2 text-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {team ? team.name : 'Dashboard'}
              </h1>
              <p className="text-[var(--pl-text-muted)]">
                {team
                  ? `${team.player_first_name} ${team.player_last_name} • GW ${getCurrentGameweek()?.id || '-'}`
                  : 'Connect your FPL team to get started'}
              </p>
            </div>

            <button
              onClick={() => setShowTeamIdModal(true)}
              className="btn-secondary px-4 py-2 text-sm"
            >
              {user.fpl_team_id ? 'Change FPL Team ID' : 'Connect FPL Team'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30 text-[var(--pl-pink)]">
              {error}
            </div>
          )}

          {!user.fpl_team_id ? (
            /* No Team ID Connected */
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--pl-green)] to-[var(--pl-cyan)] flex items-center justify-center text-4xl mx-auto mb-6">
                ⚽
              </div>
              <h2 className="text-2xl font-bold mb-4">Connect Your FPL Team</h2>
              <p className="text-[var(--pl-text-muted)] max-w-md mx-auto mb-8">
                Enter your FPL Team ID to unlock personalized insights, transfer recommendations, and more.
              </p>
              <button onClick={() => setShowTeamIdModal(true)} className="btn-primary">
                Connect Team
              </button>
            </div>
          ) : (
            /* Dashboard Content */
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card">
                  <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">Overall Points</div>
                  <div className="text-2xl sm:text-3xl font-bold text-gradient-primary">
                    {team?.summary_overall_points || 0}
                  </div>
                </div>
                <div className="card">
                  <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">Overall Rank</div>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {team ? formatRank(team.summary_overall_rank) : '-'}
                  </div>
                </div>
                <div className="card">
                  <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">GW Points</div>
                  <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-green)]">
                    {picks?.entry_history?.points || team?.summary_event_points || 0}
                  </div>
                </div>
                <div className="card">
                  <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">GW Rank</div>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {picks?.entry_history?.rank
                      ? formatRank(picks.entry_history.rank)
                      : team?.summary_event_rank
                      ? formatRank(team.summary_event_rank)
                      : '-'}
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-2 p-1 rounded-lg bg-[var(--pl-dark)]/50 w-fit overflow-x-auto">
                <button
                  onClick={() => setActiveTab('pitch')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'pitch'
                      ? 'bg-[var(--pl-green)] text-[var(--pl-dark)]'
                      : 'text-[var(--pl-text-muted)] hover:text-white'
                  }`}
                >
                  My Team
                </button>
                <button
                  onClick={() => setActiveTab('leagues')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'leagues'
                      ? 'bg-[var(--pl-green)] text-[var(--pl-dark)]'
                      : 'text-[var(--pl-text-muted)] hover:text-white'
                  }`}
                >
                  My Leagues
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'stats'
                      ? 'bg-[var(--pl-green)] text-[var(--pl-dark)]'
                      : 'text-[var(--pl-text-muted)] hover:text-white'
                  }`}
                >
                  History & Tools
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'pitch' && picks && bootstrap && (
                <div className="card">
                  <TeamPitch
                    picks={picks.picks}
                    players={bootstrap.elements}
                    teams={bootstrap.teams}
                    bank={picks.entry_history?.bank || 0}
                    teamValue={picks.entry_history?.value || 0}
                    liveData={liveData?.elements}
                  />
                </div>
              )}

              {activeTab === 'leagues' && team?.leagues && (
                <div className="space-y-6">
                  {/* Classic Leagues */}
                  {team.leagues.classic && team.leagues.classic.length > 0 && (
                    <div className="card">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        Classic Leagues
                      </h3>
                      <div className="space-y-3">
                        {team.leagues.classic
                          .sort((a, b) => a.entry_rank - b.entry_rank)
                          .map((league) => {
                            const rankChange = league.entry_last_rank - league.entry_rank;
                            const isUp = rankChange > 0;
                            const isDown = rankChange < 0;
                            
                            return (
                              <button
                                key={league.id}
                                onClick={() => setSelectedLeague({ id: league.id, name: league.name })}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--pl-dark)]/50 hover:bg-[var(--pl-card-hover)] transition-all cursor-pointer text-left"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold truncate">{league.name}</div>
                                  <div className="text-sm text-[var(--pl-text-muted)] flex items-center gap-2 mt-1">
                                    {league.league_type === 's' && (
                                      <span className="px-2 py-0.5 rounded bg-[var(--pl-purple)]/30 text-[var(--pl-purple)] text-xs">
                                        Official
                                      </span>
                                    )}
                                    {league.entry_can_admin && (
                                      <span className="px-2 py-0.5 rounded bg-[var(--pl-cyan)]/30 text-[var(--pl-cyan)] text-xs">
                                        Admin
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="flex items-center justify-end gap-2">
                                    <span className="text-2xl font-bold text-[var(--pl-green)]">
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
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Head to Head Leagues */}
                  {team.leagues.h2h && team.leagues.h2h.length > 0 && (
                    <div className="card">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-2xl">⚔️</span>
                        Head-to-Head Leagues
                      </h3>
                      <div className="space-y-3">
                        {team.leagues.h2h
                          .sort((a, b) => a.entry_rank - b.entry_rank)
                          .map((league) => {
                            const rankChange = league.entry_last_rank - league.entry_rank;
                            const isUp = rankChange > 0;
                            const isDown = rankChange < 0;
                            
                            return (
                              <button
                                key={league.id}
                                onClick={() => setSelectedLeague({ id: league.id, name: league.name })}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--pl-dark)]/50 hover:bg-[var(--pl-card-hover)] transition-all cursor-pointer text-left"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold truncate">{league.name}</div>
                                  <div className="text-sm text-[var(--pl-text-muted)] flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 rounded bg-[var(--pl-pink)]/30 text-[var(--pl-pink)] text-xs">
                                      H2H
                                    </span>
                                    {league.entry_can_admin && (
                                      <span className="px-2 py-0.5 rounded bg-[var(--pl-cyan)]/30 text-[var(--pl-cyan)] text-xs">
                                        Admin
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="flex items-center justify-end gap-2">
                                    <span className="text-2xl font-bold text-[var(--pl-green)]">
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
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* No leagues message */}
                  {(!team.leagues.classic || team.leagues.classic.length === 0) &&
                    (!team.leagues.h2h || team.leagues.h2h.length === 0) && (
                      <div className="card text-center py-12">
                        <div className="text-4xl mb-4">🏟️</div>
                        <h3 className="text-lg font-semibold mb-2">No Leagues Found</h3>
                        <p className="text-[var(--pl-text-muted)]">
                          Join a league on the official FPL website to see it here.
                        </p>
                      </div>
                    )}
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Recent Gameweeks */}
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Recent Gameweeks</h3>
                    <div className="space-y-3">
                      {getRecentGameweeks().map((gw) => (
                        <div
                          key={gw.event}
                          className="flex items-center justify-between p-3 rounded-lg bg-[var(--pl-dark)]/50"
                        >
                          <div>
                            <div className="font-medium">GW {gw.event}</div>
                            <div className="text-sm text-[var(--pl-text-muted)]">
                              Rank: {formatRank(gw.overall_rank)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-[var(--pl-green)]">{gw.points}</div>
                            <div className="text-sm text-[var(--pl-text-muted)]">
                              Bench: {gw.points_on_bench}
                            </div>
                          </div>
                        </div>
                      ))}
                      {getRecentGameweeks().length === 0 && (
                        <p className="text-center text-[var(--pl-text-muted)] py-8">
                          No gameweek data available yet.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Tools</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Transfer Assistant Tool */}
                      <button
                        onClick={() => setShowTransferAssistant(true)}
                        disabled={!picks || !bootstrap}
                        className="p-4 rounded-xl bg-[var(--pl-dark)]/50 text-left transition-all hover:bg-[var(--pl-card-hover)] disabled:opacity-50 disabled:cursor-not-allowed relative"
                      >
                        <div className="text-2xl mb-2">🤖</div>
                        <div className="font-medium">Transfer Assistant</div>
                        <div className="text-xs text-[var(--pl-text-muted)]">AI recommendations</div>
                      </button>

                      {/* Squad Form Tool */}
                      <button
                        onClick={() => setShowSquadForm(true)}
                        disabled={!picks || !bootstrap}
                        className="p-4 rounded-xl bg-[var(--pl-dark)]/50 text-left transition-all hover:bg-[var(--pl-card-hover)] disabled:opacity-50 disabled:cursor-not-allowed relative"
                      >
                        <div className="text-2xl mb-2">📊</div>
                        <div className="font-medium">Squad Form</div>
                        <div className="text-xs text-[var(--pl-text-muted)]">Form analysis & graphs</div>
                      </button>

                      {/* Coming Soon Tools */}
                      {[
                        { icon: '👑', name: 'Captain Pick', desc: 'Optimal captaincy' },
                        { icon: '📅', name: 'Fixtures', desc: 'Difficulty planner' },
                      ].map((tool) => (
                        <button
                          key={tool.name}
                          disabled
                          className="p-4 rounded-xl bg-[var(--pl-dark)]/50 text-left transition-all hover:bg-[var(--pl-card-hover)] disabled:opacity-50 disabled:cursor-not-allowed relative"
                        >
                          <div className="text-2xl mb-2">{tool.icon}</div>
                          <div className="font-medium">{tool.name}</div>
                          <div className="text-xs text-[var(--pl-text-muted)]">{tool.desc}</div>
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs bg-[var(--pl-pink)]/20 text-[var(--pl-pink)]">
                            Soon
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chips Used */}
                  {history?.chips && history.chips.length > 0 && (
                    <div className="card lg:col-span-2">
                      <h3 className="text-lg font-semibold mb-4">Chips Used</h3>
                      <div className="flex flex-wrap gap-3">
                        {history.chips.map((chip, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 rounded-lg bg-[var(--pl-purple)]/30 border border-[var(--pl-purple)]"
                          >
                            <span className="font-medium">{chip.name}</span>
                            <span className="text-[var(--pl-text-muted)] ml-2">GW {chip.event}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Team ID Modal */}
      {showTeamIdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowTeamIdModal(false)}
          />
          <div className="glass rounded-2xl p-8 w-full max-w-md relative animate-slide-up">
            <h2 className="text-2xl font-bold mb-2">Enter FPL Team ID</h2>
            <p className="text-[var(--pl-text-muted)] mb-6">
              Find your Team ID in the URL when viewing your team on the official FPL website.
            </p>

            <input
              type="text"
              value={newTeamId}
              onChange={(e) => setNewTeamId(e.target.value)}
              placeholder="e.g., 1234567"
              className="input-field mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowTeamIdModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTeamId}
                disabled={!newTeamId || savingTeamId}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {savingTeamId ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* League Modal */}
      {selectedLeague && (
        <LeagueModal
          leagueId={selectedLeague.id}
          leagueName={selectedLeague.name}
          onClose={() => setSelectedLeague(null)}
          onViewTeam={(teamId, teamName, managerName) => {
            setViewingTeam({ id: teamId, name: teamName, manager: managerName });
          }}
          currentTeamId={user?.fpl_team_id}
        />
      )}

      {/* Team View Modal */}
      {viewingTeam && bootstrap && (
        <TeamViewModal
          teamId={viewingTeam.id}
          teamName={viewingTeam.name}
          managerName={viewingTeam.manager}
          onClose={() => setViewingTeam(null)}
          bootstrapData={bootstrap}
        />
      )}

      {/* Squad Form Modal */}
      {showSquadForm && picks && bootstrap && (
        <SquadFormModal
          picks={picks.picks}
          players={bootstrap.elements}
          teams={bootstrap.teams}
          onClose={() => setShowSquadForm(false)}
        />
      )}

      {/* Transfer Assistant Modal */}
      {showTransferAssistant && picks && bootstrap && (
        <TransferAssistantModal
          picks={picks.picks}
          players={bootstrap.elements}
          teams={bootstrap.teams}
          bank={picks.entry_history?.bank || 0}
          onClose={() => setShowTransferAssistant(false)}
        />
      )}
    </div>
  );
}
