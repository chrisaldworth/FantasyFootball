'use client';

import { useState } from 'react';
import NavigationItem from './NavigationItem';
import SectionHeader from '../sections/SectionHeader';
import { useTeamTheme } from '@/lib/team-theme-context';

const fplNavItems = [
  { icon: '⚽', label: 'My Squad', href: '/dashboard?view=team', color: 'fpl' as const },
  { icon: '🏆', label: 'Leagues', href: '/dashboard/leagues', color: 'fpl' as const },
  { icon: '📊', label: 'Analytics', href: '/dashboard/analytics', color: 'fpl' as const },
];

const teamNavItems = [
  { icon: '🏆', label: 'My Team', href: '/dashboard?view=team', color: 'team' as const },
  { icon: '📰', label: 'News', href: '/dashboard', color: 'team' as const },
];

export default function SideNavigation() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { theme } = useTeamTheme();

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
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-[var(--team-primary)] flex items-center justify-center text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] z-50"
        aria-label={isExpanded ? 'Collapse navigation' : 'Expand navigation'}
        aria-expanded={isExpanded}
      >
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Navigation Items */}
      <div className="flex flex-col gap-2 p-4 h-full overflow-y-auto">
        {/* Dashboard */}
        <NavigationItem
          icon="🏠"
          label="Dashboard"
          href="/dashboard"
          color="neutral"
          className={isExpanded ? 'flex-row' : 'w-full justify-center'}
        />

        {/* Fantasy Football Section */}
        {isExpanded && (
          <div className="pt-2 pb-1">
            <SectionHeader
              type="fpl"
              title="FANTASY FOOTBALL"
              className="px-0 py-2 border-b-2"
            />
          </div>
        )}
        {fplNavItems.map((item) => (
          <NavigationItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            color={item.color}
            className={isExpanded ? 'flex-row' : 'w-full justify-center'}
          />
        ))}

        {/* My Team Section */}
        {theme && isExpanded && (
          <div className="pt-4 pb-1">
            <SectionHeader
              type="team"
              title="MY TEAM"
              teamName={theme.name}
              teamLogo={theme.logo || undefined}
              className="px-0 py-2 border-b-2"
            />
          </div>
        )}
        {theme && teamNavItems.map((item) => (
          <NavigationItem
            key={item.href}
            icon={item.icon}
            label={item.label === 'My Team' ? theme.name || 'My Team' : item.label}
            href={item.href}
            color={item.color}
            className={isExpanded ? 'flex-row' : 'w-full justify-center'}
          />
        ))}

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

