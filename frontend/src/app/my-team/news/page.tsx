'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import TeamNews from '@/components/TeamNews';
import TeamPageHeader from '@/components/pages/TeamPageHeader';
import SubNavigation from '@/components/navigation/SubNavigation';
import SideNavigation from '@/components/navigation/SideNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { useTeamTheme } from '@/lib/team-theme-context';

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
  const { theme } = useTeamTheme();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--pl-dark)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--team-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user?.favorite_team_id) {
    return (
      <div className="min-h-screen bg-[var(--pl-dark)]">
        <SideNavigation />
        <BottomNavigation />
        <TeamPageHeader
          title="Team News"
          subtitle="Latest updates"
        />
        <SubNavigation type="team" items={subNavItems} />
        <main className="pt-20 sm:pt-24 lg:pt-32 lg:pl-60 pb-20 lg:pb-12 px-4 sm:px-6">
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
      <BottomNavigation />
      <TeamPageHeader
        title="Team News"
        subtitle={theme?.name || 'Latest updates'}
        teamLogo={theme?.logo}
        teamName={theme?.name}
      />
      <SubNavigation type="team" items={subNavItems} />
      <main className="pt-20 sm:pt-24 lg:pt-32 lg:pl-60 pb-20 lg:pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="glass rounded-xl p-6 border-2" style={{ borderColor: 'var(--team-primary)', opacity: 0.3 }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--team-primary)' }}>
              <span>📰</span>
              <span>{theme?.name || 'Team'} News</span>
            </h2>
            <TeamNews teamId={user.favorite_team_id} teamName={theme?.name || 'Team'} />
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
        <div className="w-8 h-8 border-4 border-[var(--team-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <NewsContent />
    </Suspense>
  );
}

