'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import Logo from '@/components/Logo';
import FavoriteTeamSelector from '@/components/dashboard/FavoriteTeamSelector';
import { getNotificationPermission } from '@/lib/notifications';
import { useState, useEffect } from 'react';
import { fplApi } from '@/lib/api';

interface TopNavigationProps {
  showFavoriteTeam?: boolean;
  showNotifications?: boolean;
  showLinkFPL?: boolean;
  onNotificationsClick?: () => void;
  onLinkFPLClick?: () => void;
  pageTitle?: string;
  showBackButton?: boolean;
  backHref?: string;
}

export default function TopNavigation({
  showFavoriteTeam = true,
  showNotifications = true,
  showLinkFPL = true,
  onNotificationsClick,
  onLinkFPLClick,
  pageTitle,
  showBackButton = false,
  backHref = '/dashboard',
}: TopNavigationProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isExpanded } = useSidebar();
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [bootstrap, setBootstrap] = useState<any>(null);

  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    if (showFavoriteTeam && user?.favorite_team_id) {
      fplApi.getBootstrap().then(setBootstrap).catch(() => {});
    }
  }, [showFavoriteTeam, user?.favorite_team_id]);

  // Determine if we should show sidebar offset (only on desktop, only on pages with sidebar)
  // Pages without sidebar: home, login, register
  const showSidebarOffset = pathname !== '/' && pathname !== '/login' && pathname !== '/register';
  const sidebarOffset = showSidebarOffset ? (isExpanded ? 'lg:left-60' : 'lg:left-16') : '';

  return (
    <nav 
      className={`fixed top-0 right-0 z-50 transition-all duration-300 ${
        showSidebarOffset 
          ? `left-0 lg:left-60 ${isExpanded ? 'lg:left-60' : 'lg:left-16'}` 
          : 'left-0'
      }`}
      style={{
        background: 'rgba(26, 26, 46, 0.7)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-row items-center justify-between gap-2 sm:gap-3 lg:gap-4">
        {/* Left Section: Logo and Page Title */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
          {showBackButton && (
            <a
              href={backHref}
              className="text-[var(--pl-text-muted)] hover:text-white transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0"
            >
              ← Back
            </a>
          )}
          <Logo
            variant="full"
            color="full"
            size={60}
            className="flex items-center sm:w-[80px] lg:w-[100px] flex-shrink-0"
            href="/dashboard"
          />
          {pageTitle && (
            <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-white truncate hidden sm:block">
              {pageTitle}
            </h1>
          )}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {showFavoriteTeam && user?.favorite_team_id && bootstrap && (
            <FavoriteTeamSelector
              currentTeamId={user.favorite_team_id}
              currentTeamName={bootstrap?.teams?.find((t: any) => t.id === user.favorite_team_id)?.name || null}
              onTeamChange={(teamId) => {
                window.location.reload();
              }}
            />
          )}
          
          {showLinkFPL && (
            <button
              onClick={onLinkFPLClick}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[var(--pl-dark)] hover:bg-[var(--pl-card-hover)] active:bg-[var(--pl-card-hover)] flex items-center justify-center transition-colors touch-manipulation"
              title="Link FPL Account"
            >
              <span className="text-lg sm:text-xl">🔗</span>
            </button>
          )}
          
          {showNotifications && (
            <button
              onClick={onNotificationsClick}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[var(--pl-dark)] hover:bg-[var(--pl-card-hover)] active:bg-[var(--pl-card-hover)] flex items-center justify-center transition-colors touch-manipulation"
              title="Notifications"
            >
              <span className="text-lg sm:text-xl">🔔</span>
              {notificationPermission === 'granted' && (
                <span className="absolute top-1 right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[var(--pl-pink)] rounded-full" />
              )}
            </button>
          )}
          
          {user && (
            <>
              <span className="text-[var(--pl-text-muted)] text-xs sm:text-sm hidden sm:block whitespace-nowrap">
                {user.username}
              </span>
              <button 
                onClick={logout} 
                className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm touch-manipulation whitespace-nowrap"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

