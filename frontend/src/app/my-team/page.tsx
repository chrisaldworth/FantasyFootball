'use client';

import TeamPageHeader from '@/components/pages/TeamPageHeader';
import SubNavigation from '@/components/navigation/SubNavigation';
import { useTeamTheme } from '@/lib/team-theme-context';

const subNavItems = [
  { label: 'Overview', href: '/my-team', icon: '📊' },
  { label: 'Fixtures', href: '/my-team/fixtures', icon: '📅' },
  { label: 'News', href: '/my-team/news', icon: '📰' },
  { label: 'Standings', href: '/my-team/standings', icon: '📊' },
  { label: 'Analytics', href: '/my-team/analytics', icon: '📈' },
];

export default function MyTeamPage() {
  const { theme } = useTeamTheme();

  return (
    <div className="min-h-screen">
      <TeamPageHeader
        title="My Team"
        subtitle={theme?.name || 'Follow your favorite club'}
        teamLogo={theme?.logo}
        teamName={theme?.name}
      />
      <SubNavigation type="team" items={subNavItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="text-center py-12">
          <p className="text-[var(--pl-text-muted)]">My Team overview coming soon...</p>
        </div>
      </div>
    </div>
  );
}

