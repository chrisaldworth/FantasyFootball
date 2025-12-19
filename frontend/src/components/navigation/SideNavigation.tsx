'use client';

import { useState } from 'react';
import NavigationItem from './NavigationItem';

const navItems = [
  { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
  { icon: '⚽', label: 'My Team', href: '/dashboard?view=team' },
  { icon: '📊', label: 'Analytics', href: '/dashboard/analytics' },
  { icon: '🏆', label: 'Leagues', href: '/dashboard/leagues' },
  { icon: '⚙️', label: 'Settings', href: '/settings' },
];

export default function SideNavigation() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <nav
      className={`
        hidden lg:flex lg:flex-col
        fixed left-0 top-0 bottom-0 z-40
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
        className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-[var(--team-primary)] flex items-center justify-center text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)]"
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
      <div className="flex flex-col gap-2 p-4 pt-16">
        {navItems.map((item) => (
          <NavigationItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            className={isExpanded ? '' : 'w-full justify-center'}
          />
        ))}
      </div>
    </nav>
  );
}

