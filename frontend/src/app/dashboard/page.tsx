'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import FootballSection from '@/components/FootballSection';
import NotificationBanner from '@/components/NotificationBanner';
import FavoriteTeamSection from '@/components/FavoriteTeamSection';
import TeamSelection from '@/components/TeamSelection';
import { useLiveNotifications } from '@/hooks/useLiveNotifications';
import { getNotificationPermission } from '@/lib/notifications';
import LiveRank from '@/components/LiveRank';
import { useSidebar } from '@/lib/sidebar-context';
import FavoriteTeamSelector from '@/components/dashboard/FavoriteTeamSelector';
import Logo from '@/components/Logo';
import MatchCountdown from '@/components/dashboard/MatchCountdown';
import OpponentFormStats from '@/components/dashboard/OpponentFormStats';
import FPLInjuryAlerts from '@/components/dashboard/FPLInjuryAlerts';
import FavoriteTeamInjuryAlerts from '@/components/dashboard/FavoriteTeamInjuryAlerts';
import QuickRecommendations from '@/components/dashboard/QuickRecommendations';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import SideNavigation from '@/components/navigation/SideNavigation';
import QuickActionsBar from '@/components/dashboard/QuickActionsBar';
import CollapsibleSection from '@/components/shared/CollapsibleSection';
import { footballApi } from '@/lib/api';
import ThemedSection from '@/components/sections/ThemedSection';
import DashboardSection from '@/components/dashboard/DashboardSection';

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

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, loading: authLoading, logout, updateFplTeamId } = useAuth();
  const { isExpanded } = useSidebar();
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
  // Removed activeTab - using priority-based layout instead
  const [nextFixtureDate, setNextFixtureDate] = useState<Date | string | null>(null);
  const [nextFixtureOpponent, setNextFixtureOpponent] = useState<string | null>(null);
  const [nextFixtureOpponentId, setNextFixtureOpponentId] = useState<number | null>(null);
  const [nextFixtureIsHome, setNextFixtureIsHome] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [fplInjuredPlayers, setFplInjuredPlayers] = useState<any[]>([]);
  const [favoriteTeamInjuredPlayers, setFavoriteTeamInjuredPlayers] = useState<any[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<{ id: number; name: string } | null>(null);
  const [viewingTeam, setViewingTeam] = useState<{ id: number; name: string; manager: string } | null>(null);
  const [showSquadForm, setShowSquadForm] = useState(false);
  const [showTransferAssistant, setShowTransferAssistant] = useState(false);
  const [showCaptainPick, setShowCaptainPick] = useState(false);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [showFavoriteTeamSelection, setShowFavoriteTeamSelection] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLinkFPL, setShowLinkFPL] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const teamSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Handle view=team query parameter - scroll to team section
  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'team' && teamSectionRef.current && picks && bootstrap) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        teamSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Remove query parameter from URL after scrolling
        router.replace('/dashboard', { scroll: false });
      }, 100);
    }
  }, [searchParams, picks, bootstrap, router]);

  // Get current gameweek from bootstrap (needed for countdown timer)
  const currentGameweek = bootstrap?.events?.find((e: any) => e.is_current)?.id || null;
  const isLive = bootstrap?.events?.find((e: any) => e.is_current && !e.finished) !== undefined;

  // Calculate next fixture date for countdown timer
  useEffect(() => {
    const calculateNextFixture = async () => {
      try {
        if (user?.favorite_team_id) {
          const upcoming = await footballApi.getUpcomingFixtures(7);
          if (upcoming?.fixtures && upcoming.fixtures.length > 0) {
            // Filter and sort fixtures to get the next one
            const now = new Date();
            const relevantFixtures = upcoming.fixtures
              .filter((f: any) => 
                (f.teams?.home?.id === user.favorite_team_id || f.teams?.away?.id === user.favorite_team_id) &&
                f.fixture?.date &&
                new Date(f.fixture.date) > now
              )
              .sort((a: any, b: any) => {
                const dateA = new Date(a.fixture?.date || 0).getTime();
                const dateB = new Date(b.fixture?.date || 0).getTime();
                return dateA - dateB;
              });
            
            const nextFixture = relevantFixtures[0];
            
            if (nextFixture?.fixture?.date) {
              setNextFixtureDate(nextFixture.fixture.date);
              const isHome = nextFixture.teams?.home?.id === user.favorite_team_id;
              const opponent = isHome 
                ? nextFixture.teams?.away?.name 
                : nextFixture.teams?.home?.name;
              const opponentId = isHome 
                ? nextFixture.teams?.away?.id 
                : nextFixture.teams?.home?.id;
              const favoriteTeamName = isHome
                ? nextFixture.teams?.home?.name
                : nextFixture.teams?.away?.name;
              
              setNextFixtureOpponent(opponent || null);
              setNextFixtureOpponentId(opponentId || null);
              setNextFixtureIsHome(isHome);
              // Store favorite team name for display
              if (favoriteTeamName) {
                // We'll get it from bootstrap when rendering
              }
            }
          }
        } else if (bootstrap?.events) {
          // Use next gameweek deadline
          const currentGW = bootstrap.events.find((e: any) => e.is_current)?.id;
          if (currentGW) {
            const nextEvent = bootstrap.events.find((e: any) => e.id === currentGW + 1) as any;
            if (nextEvent?.deadline_time) {
              setNextFixtureDate(nextEvent.deadline_time);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch next fixture:', err);
      }
    };
    calculateNextFixture();
  }, [user?.favorite_team_id, bootstrap]);

  // Aggregate alerts (personalized - only user's relevant players)
  useEffect(() => {
    const aggregatedAlerts: any[] = [];
    
    if (!bootstrap?.elements) {
      setAlerts(aggregatedAlerts);
      return;
    }

    // Get user's squad player IDs (if FPL team is linked)
    const userSquadPlayerIds = picks?.picks?.map(p => p.element) || [];
    const hasFplTeam = userSquadPlayerIds.length > 0;
    
    // Get user's favorite team ID
    const favoriteTeamId = user?.favorite_team_id;
    const hasFavoriteTeam = !!favoriteTeamId;

    // Helper function to check if player is injured
    const isInjured = (p: Player): boolean => {
      return (
        (p.news && p.news.length > 0 && p.news.toLowerCase().includes('injur')) ||
        (p.chance_of_playing_next_round !== null && p.chance_of_playing_next_round < 75)
      );
    };

    // 1. FPL Squad Injury Alerts (only if user has FPL team)
    if (hasFplTeam) {
      const injuredSquadPlayers = bootstrap.elements.filter((p: Player) => 
        userSquadPlayerIds.includes(p.id) && isInjured(p)
      );

      if (injuredSquadPlayers.length > 0) {
        const fplInjured = injuredSquadPlayers.map((p: Player) => {
          const team = bootstrap.teams?.find((t: any) => t.id === p.team);
          return {
            id: p.id,
            name: p.web_name || `${p.first_name} ${p.second_name}`,
            team: team?.name || 'Unknown',
            injuryStatus: p.news || 'Injury concern',
            chanceOfPlaying: p.chance_of_playing_next_round,
          };
        });
        setFplInjuredPlayers(fplInjured);

        // Format player names (show up to 3, then "and X more")
        const playerNames = injuredSquadPlayers
          .slice(0, 3)
          .map(p => p.web_name || p.first_name + ' ' + p.second_name)
          .join(', ');
        
        const moreCount = injuredSquadPlayers.length - 3;
        const message = moreCount > 0
          ? `${injuredSquadPlayers.length} player${injuredSquadPlayers.length > 1 ? 's' : ''} in your squad have injury concerns: ${playerNames} and ${moreCount} more`
          : `${injuredSquadPlayers.length} player${injuredSquadPlayers.length > 1 ? 's' : ''} in your squad ${injuredSquadPlayers.length > 1 ? 'have' : 'has'} injury concerns: ${playerNames}`;

        aggregatedAlerts.push({
          id: 'fpl-squad-injuries',
          type: 'injury' as const,
          message,
          priority: 'high' as const,
          actionHref: '/dashboard',
          playerIds: injuredSquadPlayers.map(p => p.id),
          alertType: 'fpl-squad',
        });
      } else {
        setFplInjuredPlayers([]);
      }
    } else {
      setFplInjuredPlayers([]);
    }

    // 2. Favorite Team Injury Alerts (only if user has favorite team)
    if (hasFavoriteTeam) {
      const injuredTeamPlayers = bootstrap.elements.filter((p: Player) => {
        // Only include players who:
        // 1. Are currently with the favorite team (team ID matches)
        // 2. Have some activity this season (minutes > 0) - indicates they're still active players
        // 3. Are injured
        return (
          p.team === favoriteTeamId && 
          p.minutes > 0 && // Only active players (excludes transferred players)
          isInjured(p)
        );
      });

      if (injuredTeamPlayers.length > 0) {
        const teamName = bootstrap.teams?.find((t: any) => t.id === favoriteTeamId)?.name || 'Unknown';
        const favoriteInjured = injuredTeamPlayers.map((p: Player) => {
          const positionMap: { [key: number]: string } = {
            1: 'GK',
            2: 'DEF',
            3: 'MID',
            4: 'FWD',
          };
          return {
            id: p.id,
            name: p.web_name || `${p.first_name} ${p.second_name}`,
            position: positionMap[p.element_type] || 'Unknown',
            photo: p.photo,
            injuryStatus: p.news || 'Injury concern',
            chanceOfPlaying: p.chance_of_playing_next_round,
          };
        });
        setFavoriteTeamInjuredPlayers(favoriteInjured);

        // Get team name
        const teamShortName = bootstrap.teams?.find((t: any) => t.id === favoriteTeamId)?.short_name || 'your team';
        
        // Format player names (show up to 3, then "and X more")
        const playerNames = injuredTeamPlayers
          .slice(0, 3)
          .map(p => p.web_name || p.first_name + ' ' + p.second_name)
          .join(', ');
        
        const moreCount = injuredTeamPlayers.length - 3;
        const message = moreCount > 0
          ? `${injuredTeamPlayers.length} ${teamShortName} player${injuredTeamPlayers.length > 1 ? 's' : ''} have injury concerns: ${playerNames} and ${moreCount} more`
          : `${injuredTeamPlayers.length} ${teamShortName} player${injuredTeamPlayers.length > 1 ? 's' : ''} ${injuredTeamPlayers.length > 1 ? 'have' : 'has'} injury concerns: ${playerNames}`;

        aggregatedAlerts.push({
          id: 'favorite-team-injuries',
          type: 'injury' as const,
          message,
          priority: 'high' as const,
          actionHref: '/dashboard',
          playerIds: injuredTeamPlayers.map(p => p.id),
          alertType: 'favorite-team',
        });
      } else {
        setFavoriteTeamInjuredPlayers([]);
      }
    } else {
      setFavoriteTeamInjuredPlayers([]);
    }

    // 3. Empty state message (if user has neither FPL team nor favorite team)
    if (!hasFplTeam && !hasFavoriteTeam) {
      // Don't show empty state as an alert - just show no alerts
      // The empty state can be handled elsewhere if needed
    }

    // Check for price changes (simplified - would need real-time data)
    // This is a placeholder - actual implementation would need price change tracking

    setAlerts(aggregatedAlerts);
  }, [bootstrap, picks, user]);

  useEffect(() => {
    if (user?.fpl_team_id) {
      fetchTeamData();
    } else if (user) {
      setLoading(false);
    }
  }, [user]);

  // Check notification permission on mount
  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  // Live notifications hook
  useLiveNotifications({
    picks: picks?.picks || null,
    players: bootstrap?.elements || [],
    teams: bootstrap?.teams || [],
    currentGameweek: currentGameweek || null,
    enabled: notificationPermission === 'granted',
    pollInterval: 60000, // Check every 60 seconds
  });

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
      {/* Desktop Side Navigation */}
      <SideNavigation />
      
      {/* Top Navigation */}
      <nav 
        className="fixed top-0 right-0 z-50 glass transition-all duration-300"
        style={{ left: isExpanded ? '240px' : '64px' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <Logo
            variant="full"
            color="full"
            size={100}
            href="/"
            className="flex items-center"
          />

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <FavoriteTeamSelector
              currentTeamId={user?.favorite_team_id || null}
              currentTeamName={bootstrap?.teams?.find((t: any) => t.id === user?.favorite_team_id)?.name || null}
              onTeamChange={(teamId) => {
                // Team change will trigger refresh via auth context
                window.location.reload();
              }}
            />
            {/* Link FPL Account */}
            <button
              onClick={() => setShowLinkFPL(true)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[var(--pl-dark)] hover:bg-[var(--pl-card-hover)] active:bg-[var(--pl-card-hover)] flex items-center justify-center transition-colors touch-manipulation"
              title="Link FPL Account"
            >
              <span className="text-lg sm:text-xl">🔗</span>
            </button>
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[var(--pl-dark)] hover:bg-[var(--pl-card-hover)] active:bg-[var(--pl-card-hover)] flex items-center justify-center transition-colors touch-manipulation"
              title="Notifications"
            >
              <span className="text-lg sm:text-xl">🔔</span>
              {notificationPermission === 'granted' && (
                <span className="absolute top-1 right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[var(--pl-pink)] rounded-full" />
              )}
            </button>
            <span className="text-[var(--pl-text-muted)] text-xs sm:text-sm hidden sm:block">{user.username}</span>
            <button onClick={logout} className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm touch-manipulation">
              Logout
            </button>
          </div>
        </div>
      </nav>


      {/* Mobile Bottom Navigation */}
      <BottomNavigation />

      {/* Quick Actions - Mobile FAB */}
      {user?.fpl_team_id && (
        <QuickActionsBar
          actions={[
            { icon: '🤖', label: 'Transfer', action: () => setShowTransferAssistant(true), badge: false },
            { icon: '👑', label: 'Captain', action: () => setShowCaptainPick(true), badge: false },
            { icon: '⚽', label: 'Team', action: () => router.push('/dashboard?view=team'), badge: false },
            { icon: '📊', label: 'Analytics', href: '/dashboard/analytics', badge: false },
            { icon: '📅', label: 'Fixtures', href: '/dashboard/fixtures', badge: false },
          ]}
          onTransferClick={() => setShowTransferAssistant(true)}
          onCaptainClick={() => setShowCaptainPick(true)}
        />
      )}

      {/* Main Content */}
      <main 
        className="pt-20 sm:pt-24 lg:pt-32 pb-20 lg:pb-12 px-4 sm:px-6 transition-all duration-300"
        style={{ paddingLeft: isExpanded ? 'calc(240px + 1.5rem)' : 'calc(64px + 1.5rem)' }}
      >
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30 text-[var(--pl-pink)]">
              {error}
            </div>
          )}

          {/* Favorite Team Selection - Show if no favorite team or if user wants to change */}
          {(!user.favorite_team_id || showFavoriteTeamSelection) && (
            <div className="glass rounded-2xl p-8 mb-8">
              <TeamSelection 
                onTeamSelected={() => {
                  setShowFavoriteTeamSelection(false);
                  // Team will be selected, component will handle refresh
                }}
              />
            </div>
          )}

          {/* Hero Section - What's Important Right Now */}
          {user.favorite_team_id && !showFavoriteTeamSelection && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white px-1">
                What's Important Right Now
              </h2>
              
              {/* Mobile: Stacked vertically */}
              <div className="lg:hidden space-y-4">
                {user?.fpl_team_id && isLive && currentGameweek && (
                  <LiveRank teamId={user.fpl_team_id} currentGameweek={currentGameweek} isLive={isLive} />
                )}
                
                {nextFixtureDate && nextFixtureOpponent && (
                  <MatchCountdown
                    matchDate={nextFixtureDate}
                    opponent={nextFixtureOpponent}
                    opponentTeamId={nextFixtureOpponentId}
                    favoriteTeamId={user?.favorite_team_id || null}
                    favoriteTeamName={bootstrap?.teams?.find((t: any) => t.id === user?.favorite_team_id)?.name || null}
                    isHome={nextFixtureIsHome}
                  />
                )}
                
                {fplInjuredPlayers.length > 0 && (
                  <FPLInjuryAlerts injuredPlayers={fplInjuredPlayers} />
                )}
                
                {favoriteTeamInjuredPlayers.length > 0 && (
                  <FavoriteTeamInjuryAlerts
                    teamName={bootstrap?.teams?.find((t: any) => t.id === user?.favorite_team_id)?.name || 'My Team'}
                    injuredPlayers={favoriteTeamInjuredPlayers}
                  />
                )}
              </div>

              {/* Desktop: 2-column grid */}
              <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
                <div className="space-y-6">
                  {user?.fpl_team_id && isLive && currentGameweek && (
                    <LiveRank teamId={user.fpl_team_id} currentGameweek={currentGameweek} isLive={isLive} />
                  )}
                  
                  {nextFixtureDate && nextFixtureOpponent && (
                    <>
                      <MatchCountdown
                        matchDate={nextFixtureDate}
                        opponent={nextFixtureOpponent}
                        opponentTeamId={nextFixtureOpponentId}
                        favoriteTeamId={user?.favorite_team_id || null}
                        favoriteTeamName={bootstrap?.teams?.find((t: any) => t.id === user?.favorite_team_id)?.name || null}
                        isHome={nextFixtureIsHome}
                      />
                      {user?.favorite_team_id && nextFixtureOpponentId && (
                        <OpponentFormStats
                          favoriteTeamId={user.favorite_team_id}
                          opponentTeamId={nextFixtureOpponentId}
                          opponentName={nextFixtureOpponent}
                        />
                      )}
                    </>
                  )}
                </div>
                
                <div className="space-y-6">
                  {fplInjuredPlayers.length > 0 && (
                    <FPLInjuryAlerts injuredPlayers={fplInjuredPlayers} />
                  )}
                  
                  {favoriteTeamInjuredPlayers.length > 0 && (
                    <FavoriteTeamInjuryAlerts
                      teamName={bootstrap?.teams?.find((t: any) => t.id === user?.favorite_team_id)?.name || 'My Team'}
                      injuredPlayers={favoriteTeamInjuredPlayers}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Dashboard Layout - Two Sections */}
          {user.favorite_team_id && !showFavoriteTeamSelection ? (
            /* Two-Section Dashboard */
            <div className="space-y-8 sm:space-y-10">
              {/* Notification Banner - Prompt to enable push notifications */}
              {user.fpl_team_id && token && (
                <NotificationBanner token={token} />
              )}

              {/* Fantasy Football Section */}
              {user.fpl_team_id && (
                <DashboardSection
                  type="fpl"
                  title="FANTASY FOOTBALL"
                  subtitle="Manage your fantasy squad"
                  icon="⚽"
                  viewAllHref="/fantasy-football"
                >
                  {/* Live Rank Display */}
                  <LiveRank 
                    teamId={user.fpl_team_id}
                    currentGameweek={currentGameweek}
                    isLive={bootstrap?.events?.find((e: any) => e.is_current && !e.finished) !== undefined}
                  />

                  {/* FPL Stats Overview */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card">
                      <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">Overall Points</div>
                      <div className="text-2xl sm:text-3xl font-bold text-[var(--fpl-primary)]">
                        {team?.summary_overall_points || 0}
                      </div>
                    </div>
                    <div className="card">
                      <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">Overall Rank</div>
                      <div className="text-2xl sm:text-3xl font-bold text-[var(--fpl-primary)]">
                        {team ? formatRank(team.summary_overall_rank) : '-'}
                      </div>
                    </div>
                    <div className="card">
                      <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">GW Points</div>
                      <div className="text-2xl sm:text-3xl font-bold text-[var(--fpl-primary)]">
                        {picks?.entry_history?.points || team?.summary_event_points || 0}
                      </div>
                    </div>
                    <div className="card">
                      <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">GW Rank</div>
                      <div className="text-2xl sm:text-3xl font-bold text-[var(--fpl-primary)]">
                        {picks?.entry_history?.rank
                          ? formatRank(picks.entry_history.rank)
                          : team?.summary_event_rank
                          ? formatRank(team.summary_event_rank)
                          : '-'}
                      </div>
                    </div>
                  </div>

                  {/* Quick Recommendations */}
                  <QuickRecommendations
                    transferRecommendation={undefined} // TODO: Add transfer recommendation logic
                    captainRecommendation={undefined} // TODO: Add captain recommendation logic
                  />

                  {/* My FPL Squad Preview */}
                  {picks && bootstrap && (
                    <div ref={teamSectionRef}>
                      <h3 className="text-lg font-semibold mb-4 text-[var(--fpl-primary)]">My Squad</h3>
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
                    </div>
                  )}

                  {/* Leagues Preview */}
                  {team?.leagues && (
                    <CollapsibleSection
                      title="Leagues"
                      defaultExpanded={false}
                      ctaLabel="View All Leagues"
                      ctaHref="/fantasy-football/leagues"
                    >
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
                    </CollapsibleSection>
                  )}

                  {/* Analytics Preview */}
                  {history && bootstrap && (
                    <CollapsibleSection
                      title="Analytics"
                      defaultExpanded={false}
                      ctaLabel="View Full Analytics"
                      ctaHref="/fantasy-football/analytics"
                    >
                      <AnalyticsDashboard 
                        history={history}
                        totalGameweeks={bootstrap.events?.length || 38}
                      />
                    </CollapsibleSection>
                  )}
                </DashboardSection>
              )}

              {/* My Team Section */}
              {user?.favorite_team_id && (
                <DashboardSection
                  type="team"
                  title="MY TEAM"
                  subtitle={bootstrap?.teams?.find((t: any) => t.id === user?.favorite_team_id)?.name || "Follow your favorite club"}
                  teamLogo={undefined}
                  teamName={bootstrap?.teams?.find((t: any) => t.id === user?.favorite_team_id)?.name || undefined}
                  viewAllHref="/my-team"
                >
                  <FavoriteTeamSection 
                    teamId={user.favorite_team_id}
                    onChangeTeam={() => setShowFavoriteTeamSelection(true)}
                  />
                </DashboardSection>
              )}

              {/* All Football Tab - Show if no FPL team */}
              {!user.fpl_team_id && (
                <div className="card">
                  <FootballSection />
                </div>
              )}
            </div>
          ) : (
            /* No Favorite Team Selected - Show FPL Connect or All Football */
            <div className="space-y-6">
              {!user.fpl_team_id ? (
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
                <div className="card">
                  <FootballSection />
                </div>
              )}
            </div>
          )}

          {/* Legacy FPL Content - Only show if user has FPL team but no favorite team */}
          {user.fpl_team_id && !user.favorite_team_id && !showFavoriteTeamSelection && (
            <div className="space-y-6 mt-6">
              {/* Stats Overview */}
              <ThemedSection
                type="fpl"
                title="Fantasy Football"
                subtitle="Manage your fantasy squad"
                icon="⚽"
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="card">
                    <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">Overall Points</div>
                    <div className="text-2xl sm:text-3xl font-bold text-[var(--fpl-primary)]">
                      {team?.summary_overall_points || 0}
                    </div>
                  </div>
                  <div className="card">
                    <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">Overall Rank</div>
                    <div className="text-2xl sm:text-3xl font-bold text-[var(--fpl-primary)]">
                      {team ? formatRank(team.summary_overall_rank) : '-'}
                    </div>
                  </div>
                  <div className="card">
                    <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">GW Points</div>
                    <div className="text-2xl sm:text-3xl font-bold text-[var(--fpl-primary)]">
                      {picks?.entry_history?.points || team?.summary_event_points || 0}
                    </div>
                  </div>
                  <div className="card">
                    <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">GW Rank</div>
                    <div className="text-2xl sm:text-3xl font-bold text-[var(--fpl-primary)]">
                      {picks?.entry_history?.rank
                        ? formatRank(picks.entry_history.rank)
                        : team?.summary_event_rank
                        ? formatRank(team.summary_event_rank)
                        : '-'}
                    </div>
                  </div>
                </div>
              </ThemedSection>

              {/* My FPL Squad - Always Visible */}
              {picks && bootstrap && (
                <ThemedSection
                  type="fpl"
                  title="My FPL Squad"
                  subtitle="Your fantasy team lineup"
                  icon="⚽"
                >
                  <div ref={teamSectionRef}>
                    <TeamPitch
                      picks={picks.picks}
                      players={bootstrap.elements}
                      teams={bootstrap.teams}
                      bank={picks.entry_history?.bank || 0}
                      teamValue={picks.entry_history?.value || 0}
                      liveData={liveData?.elements}
                    />
                  </div>
                </ThemedSection>
              )}

              {/* Leagues Preview - Collapsible */}
              {team?.leagues && (
                <ThemedSection
                  type="fpl"
                  title="FPL Leagues"
                  subtitle="Your fantasy league standings"
                  icon="🏆"
                >
                  <CollapsibleSection
                    title="Leagues"
                    defaultExpanded={false}
                    ctaLabel="View All Leagues"
                    ctaHref="/dashboard/leagues"
                  >
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
                  </CollapsibleSection>
                </ThemedSection>
              )}

              {/* Analytics Preview - Collapsible */}
              {history && bootstrap && (
                <ThemedSection
                  type="fpl"
                  title="FPL Analytics"
                  subtitle="Performance insights and trends"
                  icon="📊"
                >
                  <CollapsibleSection
                    title="Analytics"
                    defaultExpanded={false}
                    ctaLabel="View Full Analytics"
                    ctaHref="/dashboard/analytics"
                  >
                    <AnalyticsDashboard 
                      history={history}
                      totalGameweeks={bootstrap.events?.length || 38}
                    />
                  </CollapsibleSection>
                </ThemedSection>
              )}

              {/* Recent Form / Stats */}
              {history && (
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

                      {/* Captain Pick Tool */}
                      <button
                        onClick={() => setShowCaptainPick(true)}
                        disabled={!picks || !bootstrap}
                        className="p-4 rounded-xl bg-[var(--pl-dark)]/50 text-left transition-all hover:bg-[var(--pl-card-hover)] disabled:opacity-50 disabled:cursor-not-allowed relative"
                      >
                        <div className="text-2xl mb-2">👑</div>
                        <div className="font-medium">Captain Pick</div>
                        <div className="text-xs text-[var(--pl-text-muted)]">Optimal captaincy</div>
                      </button>

                      {/* Team Selection Tool */}
                      <button
                        onClick={() => setShowTeamSelection(true)}
                        disabled={!picks || !bootstrap}
                        className="p-4 rounded-xl bg-[var(--pl-dark)]/50 text-left transition-all hover:bg-[var(--pl-card-hover)] disabled:opacity-50 disabled:cursor-not-allowed relative"
                      >
                        <div className="text-2xl mb-2">📋</div>
                        <div className="font-medium">Team Selection</div>
                        <div className="text-xs text-[var(--pl-text-muted)]">Plan your lineup</div>
                      </button>

                      {/* Coming Soon Tools */}
                      <button
                        disabled
                        className="p-4 rounded-xl bg-[var(--pl-dark)]/50 text-left transition-all hover:bg-[var(--pl-card-hover)] disabled:opacity-50 disabled:cursor-not-allowed relative"
                      >
                        <div className="text-2xl mb-2">📅</div>
                        <div className="font-medium">Fixtures</div>
                        <div className="text-xs text-[var(--pl-text-muted)]">Difficulty planner</div>
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs bg-[var(--pl-pink)]/20 text-[var(--pl-pink)]">
                          Soon
                        </div>
                      </button>
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

              {/* All Fixtures */}
              <div className="card">
                <FootballSection />
              </div>
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

      {/* Captain Pick Modal */}
      {showCaptainPick && picks && bootstrap && (
        <CaptainPickModal
          picks={picks.picks}
          players={bootstrap.elements}
          teams={bootstrap.teams}
          onClose={() => setShowCaptainPick(false)}
        />
      )}

      {/* Team Selection Modal */}
      {showTeamSelection && user?.fpl_team_id && (
        <TeamSelectionModal
          isOpen={showTeamSelection}
          onClose={() => setShowTeamSelection(false)}
          teamId={user.fpl_team_id}
          currentGameweek={getCurrentGameweek()?.id || 1}
        />
      )}

      {/* Notification Settings Modal */}
      {showNotifications && (
        <NotificationSettings
          onClose={() => {
            setShowNotifications(false);
            setNotificationPermission(getNotificationPermission());
          }}
        />
      )}

      {/* Link FPL Account Modal */}
      {showLinkFPL && (
        <LinkFPLAccountModal
          isOpen={showLinkFPL}
          onClose={() => setShowLinkFPL(false)}
          onLinked={() => {
            setShowLinkFPL(false);
            // Refresh data after linking
            if (user?.fpl_team_id) {
              fetchTeamData();
            }
          }}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
