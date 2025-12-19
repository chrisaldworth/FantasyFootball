'use client';

import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import TopNavigation from '@/components/navigation/TopNavigation';
import SubNavigation from '@/components/navigation/SubNavigation';
import SideNavigation from '@/components/navigation/SideNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { useState } from 'react';

const subNavItems = [
  { label: 'Overview', href: '/my-team', icon: '📊' },
  { label: 'Fixtures', href: '/my-team/fixtures', icon: '📅' },
  { label: 'News', href: '/my-team/news', icon: '📰' },
  { label: 'Standings', href: '/my-team/standings', icon: '📊' },
  { label: 'Analytics', href: '/my-team/analytics', icon: '📈' },
];

export default function MyTeamStandingsPage() {
  const { isExpanded } = useSidebar();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLinkFPL, setShowLinkFPL] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--pl-dark)]">
      <SideNavigation />
      <TopNavigation
        pageTitle="Standings"
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
          <div className="text-center py-12">
            <p className="text-[var(--pl-text-muted)]">Standings page - coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
}

