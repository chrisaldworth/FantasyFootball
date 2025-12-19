'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import TeamNews from '@/components/TeamNews';
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

function NewsContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isExpanded } = useSidebar();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLinkFPL, setShowLinkFPL] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
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
          pageTitle="News"
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
        <main className={`pt-24 sm:pt-28 lg:pt-24 pb-20 lg:pb-12 px-4 sm:px-6 transition-all duration-300 ${
          isExpanded ? 'lg:pl-60' : 'lg:pl-16'
        }`}>
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">📰</div>
              <h2 className="text-2xl font-bold mb-4">Team News</h2>
              <p className="text-[var(--pl-text-muted)] mb-6">
                Select a favorite team to see team news
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
        pageTitle="News"
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
          <div className="glass rounded-xl p-6 border-2" style={{ borderColor: 'var(--pl-green)', opacity: 0.3 }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--pl-green)' }}>
              <span>📰</span>
              <span>{'Team'} News</span>
            </h2>
            <TeamNews teamId={user.favorite_team_id} teamName={'Team'} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MyTeamNewsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--pl-dark)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <NewsContent />
    </Suspense>
  );
}

