'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import FavoriteTeamSection from '@/components/FavoriteTeamSection';
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

function MyTeamContent() {
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
          title="My Team"
          subtitle="Follow your favorite club"
        />
        <SubNavigation type="team" items={subNavItems} />
        <main className="pt-20 sm:pt-24 lg:pt-32 lg:pl-60 pb-20 lg:pb-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-4">My Team</h2>
              <p className="text-[var(--pl-text-muted)] mb-6">
                Select a favorite team to see team information, fixtures, and news
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
        title="My Team"
        subtitle={theme?.name || 'Follow your favorite club'}
        teamLogo={theme?.logo || undefined}
        teamName={theme?.name || undefined}
      />
      <SubNavigation type="team" items={subNavItems} />
      <main className="pt-20 sm:pt-24 lg:pt-32 lg:pl-60 pb-20 lg:pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <FavoriteTeamSection 
            teamId={user.favorite_team_id}
            onChangeTeam={() => router.push('/dashboard')}
          />
        </div>
      </main>
    </div>
  );
}

export default function MyTeamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--pl-dark)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--team-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MyTeamContent />
    </Suspense>
  );
}

