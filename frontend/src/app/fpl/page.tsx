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
import CaptainPickModal from '@/components/CaptainPickModal';
import TeamSelectionModal from '@/components/TeamSelectionModal';
import LinkFPLAccountModal from '@/components/LinkFPLAccountModal';
import NotificationSettings from '@/components/NotificationSettings';
import NotificationBanner from '@/components/NotificationBanner';
import { useLiveNotifications } from '@/hooks/useLiveNotifications';
import { getNotificationPermission } from '@/lib/notifications';

// ... existing interfaces from dashboard ...
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

interface LiveData {
  elements: {
    id: number;
    stats: {
      minutes: number;
      goals_scored: number;
      assists: number;
      clean_sheets: number;
      goals_conceded: number;
      yellow_cards: number;
      red_cards: number;
      saves: number;
      bonus: number;
      bps: number;
      influence: string;
      creativity: string;
      threat: string;
      ict_index: string;
      total_points: number;
      in_dreamteam: boolean;
    };
    explain: any[];
  }[];
}

interface Player {
  id: number;
  photo: string;
  web_name: string;
  first_name: string;
  second_name: string;
  element_type: number;
  team: number;
  now_cost: number;
  total_points: number;
  // ... other player fields
}

export default function FPLPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [team, setTeam] = useState<FPLTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [picks, setPicks] = useState<any>(null);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [currentGameweek, setCurrentGameweek] = useState<number | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<FPLLeague | null>(null);
  const [viewingTeam, setViewingTeam] = useState<number | null>(null);
  const [showSquadForm, setShowSquadForm] = useState(false);
  const [showTransferAssistant, setShowTransferAssistant] = useState(false);
  const [showCaptainPick, setShowCaptainPick] = useState(false);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [showLinkAccount, setShowLinkAccount] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch team data
  useEffect(() => {
    if (user?.fpl_team_id) {
      fetchTeamData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTeamData = async () => {
    if (!user?.fpl_team_id) return;

    try {
      setLoading(true);
      const [teamData, bootstrapData] = await Promise.all([
        fplApi.getMyTeam(),
        fplApi.getBootstrap(),
      ]);

      setTeam(teamData);
      
      // Get current gameweek
      const events = bootstrapData.events || [];
      const currentEvent = events.find((e: any) => e.is_current) || events[0];
      const gameweek = currentEvent?.id || 1;
      setCurrentGameweek(gameweek);

      // Fetch picks for current gameweek
      const picksData = await fplApi.getMyPicks(gameweek);
      setPicks(picksData);

      // Fetch live data
      const live = await fplApi.getLiveGameweek(gameweek);
      setLiveData(live);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Notification setup
  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  useLiveNotifications(user?.fpl_team_id || undefined);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!user.fpl_team_id) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full glass rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No FPL Team Linked</h1>
          <p className="text-[var(--pl-text-muted)] mb-6">
            Link your Fantasy Premier League team to get started.
          </p>
          <button onClick={() => setShowLinkAccount(true)} className="btn-primary">
            Link FPL Account
          </button>
        </div>
        {showLinkAccount && (
          <LinkFPLAccountModal
            isOpen={showLinkAccount}
            onClose={() => setShowLinkAccount(false)}
            onSuccess={() => {
              setShowLinkAccount(false);
              fetchTeamData();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="glass border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Link href="/dashboard" className="text-[var(--pl-text-muted)] hover:text-white transition-colors text-sm sm:text-base whitespace-nowrap">
                ← Back
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold truncate">Fantasy Premier League</h1>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowNotifications(true)}
                className="btn-secondary text-sm px-3 sm:px-4 py-2 flex-1 sm:flex-initial"
              >
                <span className="hidden sm:inline">🔔 Notifications</span>
                <span className="sm:hidden">🔔</span>
              </button>
              <Link href="/dashboard" className="btn-primary text-sm px-3 sm:px-4 py-2 flex-1 sm:flex-initial text-center">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats Bar */}
        {team && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">Total Points</div>
              <div className="text-xl sm:text-2xl font-bold">{team.summary_overall_points}</div>
            </div>
            <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">Overall Rank</div>
              <div className="text-xl sm:text-2xl font-bold">#{team.summary_overall_rank?.toLocaleString() || '-'}</div>
            </div>
            <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">Gameweek Points</div>
              <div className="text-xl sm:text-2xl font-bold">{team.summary_event_points || 0}</div>
            </div>
            <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">Gameweek Rank</div>
              <div className="text-xl sm:text-2xl font-bold">#{team.summary_event_rank?.toLocaleString() || '-'}</div>
            </div>
          </div>
        )}

        {/* Notification Banner */}
        <NotificationBanner />

        {/* Tools Section */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => setShowSquadForm(true)}
            className="glass rounded-lg sm:rounded-xl p-4 sm:p-6 text-left hover:bg-[var(--pl-card-hover)] active:scale-95 transition-all touch-manipulation"
          >
            <div className="text-xl sm:text-2xl mb-2">📊</div>
            <div className="font-semibold mb-1 text-sm sm:text-base">Squad Form</div>
            <div className="text-xs sm:text-sm text-[var(--pl-text-muted)]">Analyze player form</div>
          </button>
          <button
            onClick={() => setShowTransferAssistant(true)}
            className="glass rounded-lg sm:rounded-xl p-4 sm:p-6 text-left hover:bg-[var(--pl-card-hover)] active:scale-95 transition-all touch-manipulation"
          >
            <div className="text-xl sm:text-2xl mb-2">🔄</div>
            <div className="font-semibold mb-1 text-sm sm:text-base">Transfer Assistant</div>
            <div className="text-xs sm:text-sm text-[var(--pl-text-muted)]">Get transfer suggestions</div>
          </button>
          <button
            onClick={() => setShowCaptainPick(true)}
            className="glass rounded-lg sm:rounded-xl p-4 sm:p-6 text-left hover:bg-[var(--pl-card-hover)] active:scale-95 transition-all touch-manipulation sm:col-span-2 md:col-span-1"
          >
            <div className="text-xl sm:text-2xl mb-2">👑</div>
            <div className="font-semibold mb-1 text-sm sm:text-base">Captain Pick</div>
            <div className="text-xs sm:text-sm text-[var(--pl-text-muted)]">Best captain choice</div>
          </button>
        </div>

        {/* Team Pitch */}
        {picks && (
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
              <h2 className="text-lg sm:text-xl font-bold">My Team - Gameweek {currentGameweek}</h2>
              <button
                onClick={() => setShowTeamSelection(true)}
                className="btn-secondary text-sm px-3 sm:px-4 py-2 w-full sm:w-auto"
              >
                Change Team
              </button>
            </div>
            <TeamPitch picks={picks} liveData={liveData} />
          </div>
        )}

        {/* Leagues Section */}
        {team && team.leagues && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4">My Leagues</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {team.leagues.classic.length > 0 && (
                <div className="glass rounded-xl p-4">
                  <h3 className="font-semibold mb-3">Classic Leagues</h3>
                  <div className="space-y-2">
                    {team.leagues.classic.map((league) => (
                      <button
                        key={league.id}
                        onClick={() => setSelectedLeague(league)}
                        className="w-full text-left p-3 rounded-lg bg-[var(--pl-dark)]/50 hover:bg-[var(--pl-card-hover)] transition-colors"
                      >
                        <div className="font-medium">{league.name}</div>
                        <div className="text-sm text-[var(--pl-text-muted)]">
                          Rank: {league.entry_rank} / {league.entry_last_rank || '?'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {team.leagues.h2h.length > 0 && (
                <div className="glass rounded-xl p-4">
                  <h3 className="font-semibold mb-3">Head-to-Head Leagues</h3>
                  <div className="space-y-2">
                    {team.leagues.h2h.map((league) => (
                      <button
                        key={league.id}
                        onClick={() => setSelectedLeague(league)}
                        className="w-full text-left p-3 rounded-lg bg-[var(--pl-dark)]/50 hover:bg-[var(--pl-card-hover)] transition-colors"
                      >
                        <div className="font-medium">{league.name}</div>
                        <div className="text-sm text-[var(--pl-text-muted)]">
                          Rank: {league.entry_rank} / {league.entry_last_rank || '?'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedLeague && (
        <LeagueModal
          leagueId={selectedLeague.id}
          leagueName={selectedLeague.name}
          onClose={() => setSelectedLeague(null)}
          onViewTeam={(teamId) => setViewingTeam(teamId)}
          currentTeamId={user.fpl_team_id}
        />
      )}

      {viewingTeam && (
        <TeamViewModal
          teamId={viewingTeam}
          onClose={() => setViewingTeam(null)}
        />
      )}

      {showSquadForm && (
        <SquadFormModal
          isOpen={showSquadForm}
          onClose={() => setShowSquadForm(false)}
          currentTeamId={user.fpl_team_id || undefined}
        />
      )}

      {showTransferAssistant && (
        <TransferAssistantModal
          isOpen={showTransferAssistant}
          onClose={() => setShowTransferAssistant(false)}
          currentTeamId={user.fpl_team_id || undefined}
        />
      )}

      {showCaptainPick && (
        <CaptainPickModal
          isOpen={showCaptainPick}
          onClose={() => setShowCaptainPick(false)}
          currentTeamId={user.fpl_team_id || undefined}
        />
      )}

      {showTeamSelection && (
        <TeamSelectionModal
          isOpen={showTeamSelection}
          onClose={() => setShowTeamSelection(false)}
          onSuccess={() => {
            setShowTeamSelection(false);
            fetchTeamData();
          }}
        />
      )}

      {showNotifications && (
        <NotificationSettings
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}

