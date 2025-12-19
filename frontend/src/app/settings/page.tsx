'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import NotificationSettings from '@/components/NotificationSettings';
import SideNavigation from '@/components/navigation/SideNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { useTeamTheme } from '@/lib/team-theme-context';

function SettingsContent() {
  const router = useRouter();
  const { user, loading: authLoading, logout, token } = useAuth();
  const { theme } = useTeamTheme();

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

  return (
    <div className="min-h-screen bg-[var(--pl-dark)]">
      <SideNavigation />
      <BottomNavigation />
      <main className="pt-20 sm:pt-24 lg:pt-32 lg:pl-60 pb-20 lg:pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)]"
              aria-label="Back to dashboard"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
          </div>

          <div className="space-y-6">
            {/* Notification Settings */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🔔</span>
                <span>Notifications</span>
              </h2>
              <NotificationSettings onClose={() => {}} />
            </div>

            {/* Account Settings */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>👤</span>
                <span>Account</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--pl-text-muted)] mb-1">
                    Username
                  </label>
                  <div className="text-white">{user?.username || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--pl-text-muted)] mb-1">
                    Email
                  </label>
                  <div className="text-white">{user?.email || 'N/A'}</div>
                </div>
                {user?.fpl_team_id && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--pl-text-muted)] mb-1">
                      FPL Team ID
                    </label>
                    <div className="text-white">{user.fpl_team_id}</div>
                  </div>
                )}
                {user?.favorite_team_id && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--pl-text-muted)] mb-1">
                      Favorite Team ID
                    </label>
                    <div className="text-white">{user.favorite_team_id}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Logout */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🚪</span>
                <span>Sign Out</span>
              </h2>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg bg-[var(--pl-pink)]/20 text-[var(--pl-pink)] border border-[var(--pl-pink)]/30 hover:bg-[var(--pl-pink)]/30 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--pl-pink)]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--pl-dark)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}

