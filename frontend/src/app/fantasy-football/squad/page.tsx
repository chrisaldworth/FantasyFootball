'use client';

import FPLPageHeader from '@/components/pages/FPLPageHeader';
import SubNavigation from '@/components/navigation/SubNavigation';

const subNavItems = [
  { label: 'Overview', href: '/fantasy-football', icon: '📊' },
  { label: 'Squad', href: '/fantasy-football/squad', icon: '⚽' },
  { label: 'Transfers', href: '/fantasy-football/transfers', icon: '🔄' },
  { label: 'Captain', href: '/fantasy-football/captain', icon: '👑' },
  { label: 'Analytics', href: '/fantasy-football/analytics', icon: '📈' },
  { label: 'Leagues', href: '/fantasy-football/leagues', icon: '🏆' },
  { label: 'News', href: '/fantasy-football/news', icon: '📰' },
];

export default function FPLSquadPage() {
  return (
    <div className="min-h-screen">
      <FPLPageHeader
        title="My FPL Squad"
        subtitle="Your fantasy team lineup"
      />
      <SubNavigation type="fpl" items={subNavItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="text-center py-12">
          <p className="text-[var(--pl-text-muted)]">FPL Squad page - migrating from dashboard...</p>
        </div>
      </div>
    </div>
  );
}

