'use client';

import NavigationItem from './NavigationItem';
import ExpandableNavSection from './ExpandableNavSection';
import { useSidebar } from '@/lib/sidebar-context';
import { useAuth } from '@/lib/auth-context';
import Logo from '@/components/Logo';

const fplNavItems = [
  { icon: '📊', label: 'Overview', href: '/fantasy-football' },
  { icon: '⚽', label: 'My Squad', href: '/fantasy-football/squad' },
  { icon: '🔄', label: 'Transfers', href: '/fantasy-football/transfers' },
  { icon: '👑', label: 'Captain Pick', href: '/fantasy-football/captain' },
  { icon: '⭐', label: 'Followed Players', href: '/fantasy-football/followed-players' },
  { icon: '👥', label: 'Browse Players', href: '/fantasy-football/players' },
  { icon: '📈', label: 'Analytics', href: '/fantasy-football/analytics' },
  { icon: '🏆', label: 'Leagues', href: '/fantasy-football/leagues' },
  { icon: '📰', label: 'FPL News', href: '/fantasy-football/news' },
];

const teamNavItems = [
  { icon: '📊', label: 'Overview', href: '/my-team' },
  { icon: '📅', label: 'Fixtures', href: '/my-team/fixtures' },
  { icon: '📰', label: 'News', href: '/my-team/news' },
  { icon: '📊', label: 'Standings', href: '/my-team/standings' },
  { icon: '📈', label: 'Analytics', href: '/my-team/analytics' },
];

export default function SideNavigation() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { user } = useAuth();

  return (
    <nav
      className={`
        hidden lg:flex lg:flex-col
        fixed left-0 top-16 bottom-0 z-40
        glass border-r border-white/10
        transition-all duration-300
        ${isExpanded ? 'w-60' : 'w-16'}
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header Section with Logo */}
      <div className="flex items-center justify-center border-b border-white/10 px-4 py-4 min-h-[80px]">
        <Logo
          variant="full"
          color="full"
          size={isExpanded ? 120 : 48}
          href="/"
          className="flex items-center"
        />
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--pl-green)] flex items-center justify-center text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] z-50"
        aria-label={isExpanded ? 'Collapse navigation' : 'Expand navigation'}
        aria-expanded={isExpanded}
      >
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Navigation Items */}
      <div className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">

        {/* Main Section Label */}
        {isExpanded && (
          <div className="text-[10px] font-bold text-[var(--pl-text-muted)] uppercase tracking-wider px-3 pt-2 pb-1">
            Main
          </div>
        )}

        {/* Dashboard */}
        <NavigationItem
          icon="🏠"
          label="Dashboard"
          href="/dashboard"
          color="neutral"
          className={isExpanded ? 'flex-row' : 'w-full justify-center'}
        />

        {/* Divider */}
        {isExpanded && <div className="border-t border-white/10 my-2" />}
        
        {/* Games Section Label */}
        {isExpanded && (
          <div className="text-[10px] font-bold text-[var(--pl-text-muted)] uppercase tracking-wider px-3 pt-2 pb-1">
            Games & Features
          </div>
        )}

        {/* Weekly Picks - Highlighted */}
        <div className={`relative ${isExpanded ? '' : ''}`}>
          <NavigationItem
            icon="🎯"
            label="Weekly Picks"
            href="/weekly-picks"
            color="neutral"
            className={`${isExpanded ? 'flex-row' : 'w-full justify-center'} bg-[var(--pl-green)]/10 border border-[var(--pl-green)]/30 rounded-lg`}
          />
          {isExpanded && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--pl-green)] text-white">
              PLAY
            </span>
          )}
        </div>

        {/* Predictions - Highlighted */}
        <div className={`relative ${isExpanded ? '' : ''}`}>
          <NavigationItem
            icon="🔮"
            label="AI Predictions"
            href="/predictions"
            color="neutral"
            className={`${isExpanded ? 'flex-row' : 'w-full justify-center'} bg-purple-500/10 border border-purple-500/30 rounded-lg`}
          />
          {isExpanded && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500 text-white">
              NEW
            </span>
          )}
        </div>

        {/* Matches */}
        <NavigationItem
          icon="🏟️"
          label="Matches"
          href="/matches"
          color="neutral"
          className={isExpanded ? 'flex-row' : 'w-full justify-center'}
        />

        {/* Fantasy Football Section */}
        {isExpanded && (
          <ExpandableNavSection
            type="fpl"
            title="FANTASY FOOTBALL"
            icon="⚽"
            items={fplNavItems}
            defaultExpanded={true}
          />
        )}

        {/* My Team Section */}
        {user?.favorite_team_id && isExpanded && (
          <ExpandableNavSection
            type="team"
            title="MY TEAM"
            icon="🏆"
            items={teamNavItems}
            defaultExpanded={true}
            teamLogo={undefined}
            teamName={undefined}
          />
        )}

        {/* Settings */}
        <div className="pt-4">
          <NavigationItem
            icon="⚙️"
            label="Settings"
            href="/settings"
            color="neutral"
            className={isExpanded ? 'flex-row' : 'w-full justify-center'}
          />
        </div>
      </div>
    </nav>
  );
}

