'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fplApi } from '@/lib/api';
import TeamPitch from '@/components/TeamPitch';
import TopNavigation from '@/components/navigation/TopNavigation';
import SubNavigation from '@/components/navigation/SubNavigation';
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

interface BootstrapData {
  elements: any[];
  teams: any[];
  events: Array<{ id: number; is_current: boolean; finished: boolean }>;
}

interface FPLPicks {
  picks: any[];
  entry_history: {
    bank: number;
    value: number;
  };
}

interface LiveData {
  elements: {
    [key: number]: {
      stats: {
        minutes: number;
        goals_scored: number;
        assists: number;
        clean_sheets: number;
        bonus: number;
        total_points: number;
      };
    };
  };
}

interface LivePlayerData {
  id: number;
  stats: {
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    bonus: number;
    total_points: number;
  };
}

function SquadContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isExpanded } = useSidebar();
  const [picks, setPicks] = useState<FPLPicks | null>(null);
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLinkFPL, setShowLinkFPL] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.fpl_team_id) {
      fetchSquadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSquadData = async () => {
    if (!user?.fpl_team_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const bootstrapData = await fplApi.getBootstrap();
      const currentEvent = bootstrapData.events.find((e: any) => e.is_current);
      const latestEvent = currentEvent || bootstrapData.events[bootstrapData.events.length - 1];

      if (!latestEvent) {
        setError('Season has not started yet.');
        setLoading(false);
        return;
      }

      const [picksData, liveGameweekData] = await Promise.all([
        fplApi.getTeamPicks(user.fpl_team_id, latestEvent.id),
        fplApi.getLiveGameweek(latestEvent.id).catch(() => null),
      ]);

      setPicks(picksData);
      setBootstrap(bootstrapData);
      setLiveData(liveGameweekData);
    } catch (err: any) {
      setError('Failed to load squad data');
      console.error('Failed to fetch squad data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--pl-dark)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--fpl-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user?.fpl_team_id) {
    return (
      <div className="min-h-screen bg-[var(--pl-dark)]">
        <SideNavigation />
        <TopNavigation
          pageTitle="My Squad"
          showBackButton={true}
          backHref="/fantasy-football"
          showFavoriteTeam={true}
          showNotifications={true}
          showLinkFPL={true}
          onNotificationsClick={() => setShowNotifications(true)}
          onLinkFPLClick={() => setShowLinkFPL(true)}
        />
        <BottomNavigation />
        <SubNavigation type="fpl" items={subNavItems} />
        <main className={`pt-24 sm:pt-28 lg:pt-24 pb-20 lg:pb-12 px-4 sm:px-6 transition-all duration-300 ${
          isExpanded ? 'lg:pl-60' : 'lg:pl-16'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">⚽</div>
              <h2 className="text-2xl font-bold mb-4">My Squad</h2>
              <p className="text-[var(--pl-text-muted)] mb-6">
                Link your FPL team to view your squad
              </p>
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
        pageTitle="My Squad"
        showBackButton={true}
        backHref="/fantasy-football"
        showFavoriteTeam={true}
        showNotifications={true}
        showLinkFPL={true}
        onNotificationsClick={() => setShowNotifications(true)}
        onLinkFPLClick={() => setShowLinkFPL(true)}
      />
      <BottomNavigation />
      <SubNavigation type="fpl" items={subNavItems} />
      <main className={`pt-14 sm:pt-16 lg:pt-20 pb-20 lg:pb-12 px-4 sm:px-6 transition-all duration-300 ${
        isExpanded ? 'lg:pl-60' : 'lg:pl-16'
      }`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30 text-[var(--pl-pink)]">
              {error}
            </div>
          )}

          {picks && bootstrap ? (
            <div className="card border-2 border-[var(--fpl-primary)]/30">
              <TeamPitch
                picks={picks.picks}
                players={bootstrap.elements}
                teams={bootstrap.teams}
                bank={picks.entry_history?.bank || 0}
                teamValue={picks.entry_history?.value || 0}
                liveData={liveData?.elements ? Object.entries(liveData.elements).map(([id, data]) => ({
                  id: parseInt(id),
                  stats: data.stats,
                })) : undefined}
              />
            </div>
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">⚽</div>
              <h3 className="text-lg font-semibold mb-2">No Squad Data</h3>
              <p className="text-[var(--pl-text-muted)]">
                Complete a gameweek to see your squad
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function FPLSquadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--pl-dark)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--fpl-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SquadContent />
    </Suspense>
  );
}
