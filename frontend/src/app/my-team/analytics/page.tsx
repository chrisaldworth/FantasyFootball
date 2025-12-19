'use client';

import TeamPageHeader from '@/components/pages/TeamPageHeader';
import SubNavigation from '@/components/navigation/SubNavigation';

const subNavItems = [
  { label: 'Overview', href: '/my-team', icon: '📊' },
  { label: 'Fixtures', href: '/my-team/fixtures', icon: '📅' },
  { label: 'News', href: '/my-team/news', icon: '📰' },
  { label: 'Standings', href: '/my-team/standings', icon: '📊' },
  { label: 'Analytics', href: '/my-team/analytics', icon: '📈' },
];

export default function MyTeamAnalyticsPage() {

  return (
    <div className="min-h-screen">
      <TeamPageHeader
        title="Team Analytics"
        subtitle="Performance insights"
        teamLogo={undefined}
        teamName={undefined}
      />
      <SubNavigation type="team" items={subNavItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="text-center py-12">
          <p className="text-[var(--pl-text-muted)]">Team Analytics page - coming soon...</p>
        </div>
      </div>
    </div>
  );
}

