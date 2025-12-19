'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import NotificationSettings from '@/components/NotificationSettings';
import SideNavigation from '@/components/navigation/SideNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import TopNavigation from '@/components/navigation/TopNavigation';
import TeamLogo from '@/components/TeamLogo';
import { getNotificationPermission } from '@/lib/notifications';

function SettingsContent() {
  const router = useRouter();
  const { user, loading: authLoading, logout, token } = useAuth();
  const { isExpanded } = useSidebar();
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

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
      <TopNavigation
        pageTitle="Settings"
        showBackButton={true}
        backHref="/dashboard"
        showFavoriteTeam={true}
        showNotifications={true}
        showLinkFPL={true}
        onNotificationsClick={() => setShowNotifications(true)}
        onLinkFPLClick={() => {}}
      />
      <BottomNavigation />

      <main className={`pt-20 sm:pt-20 lg:pt-20 pb-20 lg:pb-12 px-4 sm:px-6 transition-all duration-300 ${
        isExpanded ? 'lg:pl-60' : 'lg:pl-16'
      }`}>
        <div className="max-w-7xl mx-auto space-y-6">

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

