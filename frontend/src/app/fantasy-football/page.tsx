'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fplApi } from '@/lib/api';
import MetricCard from '@/components/fantasy-football/MetricCard';
import ActionItemsSection, { AlertCardProps } from '@/components/fantasy-football/ActionItemsSection';
import PerformanceChart from '@/components/fantasy-football/PerformanceChart';
import LeagueCard from '@/components/fantasy-football/LeagueCard';
import QuickActionButton from '@/components/fantasy-football/QuickActionButton';
import SubNavigation from '@/components/navigation/SubNavigation';
import TopNavigation from '@/components/navigation/TopNavigation';
import SideNavigation from '@/components/navigation/SideNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { useSidebar } from '@/lib/sidebar-context';

const subNavItems = [
  { label: 'Overview', href: '/fantasy-football', icon: '📊' },
  { label: 'Squad', href: '/fantasy-football/squad', icon: '⚽' },
  { label: 'Transfers', href: '/fantasy-football/transfers', icon: '🔄' },
  { label: 'Captain', href: '/fantasy-football/captain', icon: '👑' },
  { label: 'Analytics', href: '/fantasy-football/analytics', icon: '📈' },
  { label: 'Leagues', href: '/fantasy-football/leagues', icon: '🏆' },
  { label: 'News', href: '/fantasy-football/news', icon: '📰' },
];

interface FPLTeam {
  id: number;
  name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;
  current_event: number;
  value: number;
  leagues: {
    classic: Array<{
      id: number;
      name: string;
      entry_rank: number;
      entry_last_rank: number;
      rank?: number | null;
    }>;
    h2h: Array<{
      id: number;
      name: string;
      entry_rank: number;
      entry_last_rank: number;
      rank?: number | null;
    }>;
  };
}

interface HistoryEntry {
  event: number;
  points: number;
  total_points: number;
  overall_rank: number;
  rank: number;
  bank: number;
  value: number;
  event_transfers: number;
  event_transfers_cost: number;
}

interface FPLHistory {
  current: HistoryEntry[];
}

interface FPLPicks {
  entry_history: {
    event: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
  };
  picks: Array<{
    element: number;
    position: number;
    is_captain: boolean;
    is_vice_captain: boolean;
  }>;
}

interface Player {
  id: number;
  web_name: string;
  news: string;
  chance_of_playing_next_round: number | null;
}

export default function FantasyFootballOverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const [teamData, setTeamData] = useState<FPLTeam | null>(null);
  const [historyData, setHistoryData] = useState<FPLHistory | null>(null);
  const [picksData, setPicksData] = useState<FPLPicks | null>(null);
  const [bootstrapData, setBootstrapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLinkFPL, setShowLinkFPL] = useState(false);

  useEffect(() => {
    if (!user?.fpl_team_id) {
      setLoading(false);
      return;
    }

    if (user?.fpl_team_id) {
      fetchData();
    }
  }, [user?.fpl_team_id]);

  const fetchData = async () => {
    if (!user?.fpl_team_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [team, history, bootstrap] = await Promise.all([
        fplApi.getTeam(user.fpl_team_id),
        fplApi.getTeamHistory(user.fpl_team_id),
        fplApi.getBootstrap(),
      ]);

      setTeamData(team);
      setHistoryData(history);
      setBootstrapData(bootstrap);

      const currentEvent = bootstrap.events.find((e: any) => e.is_current);
      if (currentEvent) {
        const picks = await fplApi.getTeamPicks(user.fpl_team_id, currentEvent.id);
        setPicksData(picks);
      }
    } catch (err: any) {
      console.error('Failed to fetch FPL data:', err);
      setError('Failed to load FPL data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate gameweek status
  const gameweekStatus = useMemo(() => {
    if (!bootstrapData?.events) return 'between';
    
    const currentEvent = bootstrapData.events.find((e: any) => e.is_current);
    if (!currentEvent) return 'between';
    
    const now = new Date();
    const deadline = new Date(currentEvent.deadline_time);
    const finished = currentEvent.finished;
    
    if (finished) return 'after';
    if (now < deadline) return 'before';
    return 'during';
  }, [bootstrapData]);

  // Calculate alerts
  const alerts = useMemo((): AlertCardProps[] => {
    const alertList: AlertCardProps[] = [];
    
    if (!bootstrapData?.elements || !picksData) return alertList;

    const userSquadPlayerIds = picksData.picks?.map(p => p.element) || [];
    const players = bootstrapData.elements as Player[];

    // Check for injured players
    const injuredPlayers = players.filter((p: Player) => 
      userSquadPlayerIds.includes(p.id) && (
        (p.news && p.news.length > 0 && p.news.toLowerCase().includes('injur')) ||
        (p.chance_of_playing_next_round !== null && p.chance_of_playing_next_round < 75)
      )
    );

    if (injuredPlayers.length > 0) {
      const playerNames = injuredPlayers
        .slice(0, 3)
        .map((p: Player) => p.web_name)
        .join(', ');
      const moreCount = injuredPlayers.length > 3 ? ` and ${injuredPlayers.length - 3} more` : '';
      
      alertList.push({
        priority: 'high',
        icon: '🏥',
        title: 'Injured Players',
        message: `${playerNames}${moreCount} ${injuredPlayers.length === 1 ? 'is' : 'are'} injured or doubtful.`,
        actionLabel: 'View Squad',
        actionHref: '/fantasy-football/squad',
      });
    }

    // Check for captain
    const captain = picksData.picks?.find(p => p.is_captain);
    if (!captain) {
      alertList.push({
        priority: 'high',
        icon: '👑',
        title: 'No Captain Selected',
        message: 'You need to select a captain for this gameweek.',
        actionLabel: 'Pick Captain',
        actionHref: '/fantasy-football/captain',
      });
    }

    // Check for deadline
    if (gameweekStatus === 'before' && bootstrapData?.events) {
      const currentEvent = bootstrapData.events.find((e: any) => e.is_current);
      if (currentEvent) {
        const deadline = new Date(currentEvent.deadline_time);
        const hoursUntilDeadline = (deadline.getTime() - Date.now()) / (1000 * 60 * 60);
        
        if (hoursUntilDeadline < 24) {
          alertList.push({
            priority: 'high',
            icon: '⏰',
            title: 'Deadline Approaching',
            message: `Gameweek ${currentEvent.id} deadline is in ${Math.round(hoursUntilDeadline)} hours.`,
            actionLabel: 'Make Changes',
            actionHref: '/fantasy-football/transfers',
          });
        }
      }
    }

    return alertList;
  }, [bootstrapData, picksData, gameweekStatus]);

  // Calculate rank change
  const rankChange = useMemo(() => {
    if (!historyData?.current || historyData.current.length < 2) return undefined;
    
    const sorted = [...historyData.current].sort((a, b) => a.event - b.event);
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];
    
    const change = previous.overall_rank - latest.overall_rank;
    if (change === 0) return undefined;
    
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' as const : 'down' as const,
    };
  }, [historyData]);

  // Calculate value change
  const valueChange = useMemo(() => {
    if (!teamData || !historyData?.current || historyData.current.length === 0) return undefined;
    
    const sorted = [...historyData.current].sort((a, b) => a.event - b.event);
    const latest = sorted[sorted.length - 1];
    const first = sorted[0];
    
    const change = latest.value - first.value;
    if (change === 0) return undefined;
    
    return {
      value: Math.abs(change) / 10, // Convert to millions
      direction: change > 0 ? 'up' as const : 'down' as const,
    };
  }, [teamData, historyData]);

  // Get current gameweek info
  const currentGameweek = useMemo(() => {
    if (!bootstrapData?.events) return null;
    const currentEvent = bootstrapData.events.find((e: any) => e.is_current);
    return currentEvent?.id || null;
  }, [bootstrapData]);

  const gameweekPoints = teamData?.summary_event_points || 0;
  const gameweekRank = teamData?.summary_event_rank || 0;
  const freeTransfers = picksData?.entry_history ? (2 - (picksData.entry_history.event_transfers || 0)) : 2;
  const transferCost = picksData?.entry_history?.event_transfers_cost || 0;

  // Get leagues
  const leagues = useMemo(() => {
    if (!teamData?.leagues) return [];
    
    const classicLeagues = (teamData.leagues.classic || []).map(league => ({
      leagueName: league.name,
      rank: league.entry_rank,
      totalTeams: league.rank || 0,
      rankChange: league.entry_last_rank ? league.entry_last_rank - league.entry_rank : undefined,
      leagueType: 'classic' as const,
      href: `/fantasy-football/leagues?league=${league.id}`,
    }));

    const h2hLeagues = (teamData.leagues.h2h || []).map(league => ({
      leagueName: league.name,
      rank: league.entry_rank,
      totalTeams: league.rank || 0,
      rankChange: league.entry_last_rank ? league.entry_last_rank - league.entry_rank : undefined,
      leagueType: 'h2h' as const,
      href: `/fantasy-football/leagues?league=${league.id}`,
    }));

    return [...classicLeagues, ...h2hLeagues].slice(0, 4); // Show max 4 leagues
  }, [teamData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--pl-dark)]">
        <SideNavigation />
        <TopNavigation
          pageTitle="Fantasy Football"
          showFavoriteTeam={true}
          showNotifications={true}
          showLinkFPL={true}
          onNotificationsClick={() => setShowNotifications(true)}
          onLinkFPLClick={() => setShowLinkFPL(true)}
        />
        <BottomNavigation />
        <SubNavigation type="fpl" items={subNavItems} />
        <main className={`pt-48 sm:pt-28 lg:pt-24 pb-20 lg:pb-12 px-4 sm:px-6 transition-all duration-300 ${
          isExpanded ? 'lg:pl-60' : 'lg:pl-16'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[var(--fpl-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--pl-dark)]">
        <SideNavigation />
        <TopNavigation
          pageTitle="Fantasy Football"
          showFavoriteTeam={true}
          showNotifications={true}
          showLinkFPL={true}
          onNotificationsClick={() => setShowNotifications(true)}
          onLinkFPLClick={() => setShowLinkFPL(true)}
        />
        <BottomNavigation />
        <SubNavigation type="fpl" items={subNavItems} />
        <main className={`pt-48 sm:pt-28 lg:pt-24 pb-20 lg:pb-12 px-4 sm:px-6 transition-all duration-300 ${
          isExpanded ? 'lg:pl-60' : 'lg:pl-16'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12 text-[var(--pl-pink)]">
              <p>{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-[var(--fpl-primary)] text-[var(--fpl-text-on-primary)] rounded-lg hover:opacity-90"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user?.fpl_team_id) {
    return (
      <div className="min-h-screen bg-[var(--pl-dark)]">
        <SideNavigation />
        <TopNavigation
          pageTitle="Fantasy Football"
          showFavoriteTeam={true}
          showNotifications={true}
          showLinkFPL={true}
          onNotificationsClick={() => setShowNotifications(true)}
          onLinkFPLClick={() => setShowLinkFPL(true)}
        />
        <BottomNavigation />
        <SubNavigation type="fpl" items={subNavItems} />
        <main className={`pt-48 sm:pt-28 lg:pt-24 pb-20 lg:pb-12 px-4 sm:px-6 transition-all duration-300 ${
          isExpanded ? 'lg:pl-60' : 'lg:pl-16'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <p className="text-[var(--pl-text-muted)] mb-4">No FPL team linked</p>
              <button
                onClick={() => router.push('/settings')}
                className="px-4 py-2 bg-[var(--fpl-primary)] text-[var(--fpl-text-on-primary)] rounded-lg hover:opacity-90"
              >
                Link FPL Account
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--pl-dark)]">
      <SideNavigation />
      <TopNavigation
        pageTitle="Fantasy Football"
        showFavoriteTeam={true}
        showNotifications={true}
        showLinkFPL={true}
        onNotificationsClick={() => setShowNotifications(true)}
        onLinkFPLClick={() => setShowLinkFPL(true)}
      />
      <BottomNavigation />
      <SubNavigation type="fpl" items={subNavItems} />
      <main className={`pt-48 sm:pt-28 lg:pt-24 pb-20 lg:pb-12 px-4 sm:px-6 transition-all duration-300 ${
        isExpanded ? 'lg:pl-60' : 'lg:pl-16'
      }`}>
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section - Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Overall Rank"
            icon="📊"
            value={`#${teamData?.summary_overall_rank?.toLocaleString() || '-'}`}
            subtitle={`${teamData?.summary_overall_points || 0} points`}
            change={rankChange}
            color="fpl"
          />
          <MetricCard
            title={`Gameweek ${currentGameweek || '-'}`}
            icon="📅"
            value={`${gameweekPoints} points`}
            subtitle={`Rank: #${gameweekRank?.toLocaleString() || '-'}`}
            status={gameweekStatus === 'during' ? 'live' : gameweekStatus === 'after' ? 'finished' : 'upcoming'}
            color="fpl"
          />
          <MetricCard
            title="Squad Value"
            icon="💰"
            value={`£${((teamData?.value || 0) / 10).toFixed(1)}m`}
            subtitle={`Bank: £${((picksData?.entry_history?.bank || 0) / 10).toFixed(1)}m`}
            change={valueChange}
            color="fpl"
          />
          <MetricCard
            title="Transfers"
            icon="🔄"
            value={`${freeTransfers} Free Transfer${freeTransfers !== 1 ? 's' : ''}`}
            subtitle={transferCost > 0 ? `Cost: £${transferCost}` : undefined}
            color="fpl"
          />
        </div>

        {/* Action Items & Alerts */}
        <ActionItemsSection alerts={alerts} />

        {/* Recent Performance */}
        {historyData?.current && historyData.current.length > 0 && (
          <PerformanceChart history={historyData.current} timeRange="last5" />
        )}

        {/* League Standings Summary */}
        {leagues.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">League Standings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Overall Rank Card */}
              <div className="glass rounded-2xl p-6 border-3 border-[var(--fpl-primary)]">
                <div className="text-sm text-[var(--pl-text-muted)] mb-2">Overall Rank</div>
                <div className="text-3xl font-bold text-[var(--fpl-primary)] mb-1">
                  #{teamData?.summary_overall_rank?.toLocaleString() || '-'}
                </div>
                <div className="text-sm text-[var(--pl-text-muted)]">
                  {teamData?.summary_overall_points || 0} points
                </div>
              </div>
              {/* League Cards */}
              {leagues.map((league, index) => (
                <LeagueCard key={index} {...league} />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <QuickActionButton
            icon="🔄"
            label="Make Transfers"
            href="/fantasy-football/transfers"
            variant="primary"
          />
          <QuickActionButton
            icon="👑"
            label="Pick Captain"
            href="/fantasy-football/captain"
            variant="primary"
            badge={!picksData?.picks?.find(p => p.is_captain)}
          />
          <QuickActionButton
            icon="⚽"
            label="View Squad"
            href="/fantasy-football/squad"
          />
          <QuickActionButton
            icon="📈"
            label="View Analytics"
            href="/fantasy-football/analytics"
          />
          <QuickActionButton
            icon="🏆"
            label="View Leagues"
            href="/fantasy-football/leagues"
          />
          <QuickActionButton
            icon="📰"
            label="View News"
            href="/fantasy-football/news"
          />
        </div>
        </div>
      </main>
    </div>
  );
}
