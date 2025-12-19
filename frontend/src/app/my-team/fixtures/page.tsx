'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { footballApi } from '@/lib/api';
import FixtureTicker from '@/components/FixtureTicker';
import MatchDetailsModal from '@/components/MatchDetailsModal';
import TopNavigation from '@/components/navigation/TopNavigation';
import SubNavigation from '@/components/navigation/SubNavigation';
import SideNavigation from '@/components/navigation/SideNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { useSidebar } from '@/lib/sidebar-context';

const subNavItems = [
  { label: 'Overview', href: '/my-team', icon: '📊' },
  { label: 'Fixtures', href: '/my-team/fixtures', icon: '📅' },
  { label: 'News', href: '/my-team/news', icon: '📰' },
  { label: 'Standings', href: '/my-team/standings', icon: '📊' },
  { label: 'Analytics', href: '/my-team/analytics', icon: '📈' },
];

interface Fixture {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
    };
  };
  teams: {
    home: {
      id: number;
      name: string;
    };
    away: {
      id: number;
      name: string;
    };
  };
  goals: {
    home?: number;
    away?: number;
  };
  league: {
    id: number;
    name: string;
  };
}

function FixturesContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isExpanded } = useSidebar();
  const [upcomingFixtures, setUpcomingFixtures] = useState<Fixture[]>([]);
  const [recentResults, setRecentResults] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Fixture | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLinkFPL, setShowLinkFPL] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.favorite_team_id) {
      fetchFixtures();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFixtures = async () => {
    if (!user?.favorite_team_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [upcomingData, resultsData] = await Promise.all([
        footballApi.getUpcomingFixtures(90, true), // 90 days ahead
        footballApi.getRecentResults(90, user.favorite_team_id), // 90 days back
      ]);

      // Filter fixtures for user's team
      const teamFixtures = (upcomingData.fixtures || []).filter((f: any) =>
        f.teams?.home?.id === user.favorite_team_id || f.teams?.away?.id === user.favorite_team_id
      );
      setUpcomingFixtures(teamFixtures);

      // Results are already filtered by backend
      setRecentResults(resultsData.results || []);
    } catch (err: any) {
      setError('Failed to load fixtures');
      console.error('Failed to fetch fixtures:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--pl-dark)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user?.favorite_team_id) {
    return (
      <div className="min-h-screen bg-[var(--pl-dark)]">
        <SideNavigation />
        <TopNavigation
          pageTitle="Fixtures"
          showBackButton={true}
          backHref="/my-team"
          showFavoriteTeam={true}
          showNotifications={true}
          showLinkFPL={true}
          onNotificationsClick={() => setShowNotifications(true)}
          onLinkFPLClick={() => setShowLinkFPL(true)}
        />
        <BottomNavigation />
        <SubNavigation type="team" items={subNavItems} />
        <main className={`pt-48 sm:pt-28 lg:pt-24 pb-20 lg:pb-12 px-4 sm:px-6 transition-all duration-300 ${
          isExpanded ? 'lg:pl-60' : 'lg:pl-16'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">📅</div>
              <h2 className="text-2xl font-bold mb-4">Fixtures</h2>
              <p className="text-[var(--pl-text-muted)] mb-6">
                Select a favorite team to see fixtures
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
        pageTitle="Fixtures"
        showBackButton={true}
        backHref="/my-team"
        showFavoriteTeam={true}
        showNotifications={true}
        showLinkFPL={true}
        onNotificationsClick={() => setShowNotifications(true)}
        onLinkFPLClick={() => setShowLinkFPL(true)}
      />
      <BottomNavigation />
      <SubNavigation type="team" items={subNavItems} />
      <main className={`pt-14 sm:pt-16 lg:pt-20 pb-20 lg:pb-12 px-4 sm:px-6 transition-all duration-300 ${
        isExpanded ? 'lg:pl-60' : 'lg:pl-16'
      }`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30 text-[var(--pl-pink)]">
              {error}
            </div>
          )}

          {/* Upcoming Fixtures */}
          <div className="glass rounded-xl p-6 border-2" style={{ borderColor: 'var(--pl-green)', opacity: 0.3 }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--pl-green)' }}>
              <span>📅</span>
              <span>Upcoming Fixtures</span>
            </h2>
            <FixtureTicker
              fixtures={upcomingFixtures}
              teamId={user.favorite_team_id}
              teamName={'Team'}
              type="upcoming"
              onFixtureClick={(fixture) => setSelectedMatch(fixture as any)}
              loading={loading}
            />
          </div>

          {/* Recent Results */}
          <div className="glass rounded-xl p-6 border-2" style={{ borderColor: 'var(--pl-green)', opacity: 0.3 }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--pl-green)' }}>
              <span>📊</span>
              <span>Recent Results</span>
            </h2>
            <FixtureTicker
              fixtures={recentResults}
              teamId={user.favorite_team_id}
              teamName={'Team'}
              type="results"
              onFixtureClick={(fixture) => setSelectedMatch(fixture as any)}
              loading={loading}
            />
          </div>

          {/* Match Details Modal */}
          {selectedMatch && (
            <MatchDetailsModal
              fixture={selectedMatch}
              isOpen={!!selectedMatch}
              onClose={() => setSelectedMatch(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default function MyTeamFixturesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--pl-dark)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FixturesContent />
    </Suspense>
  );
}

