'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationItem from './NavigationItem';
import Drawer from './Drawer';

const fplNavItems = [
  { icon: '📊', label: 'Overview', href: '/fantasy-football' },
  { icon: '⚽', label: 'My Squad', href: '/fantasy-football/squad' },
  { icon: '🔄', label: 'Transfers', href: '/fantasy-football/transfers' },
  { icon: '👑', label: 'Captain Pick', href: '/fantasy-football/captain' },
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

const navItems = [
  { icon: '🏠', label: 'Dashboard', href: '/dashboard', type: 'neutral' as const },
  { icon: '⚽', label: 'FPL', href: '/fantasy-football', type: 'fpl' as const },
  { icon: '🏆', label: 'Team', href: '/my-team', type: 'team' as const },
  { icon: '⚙️', label: 'Settings', href: '/settings', type: 'neutral' as const },
];

export default function BottomNavigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'fpl' | 'team' | null>(null);
  const router = useRouter();

  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    e.preventDefault();
    if (item.type === 'fpl' || item.type === 'team') {
      setDrawerType(item.type);
      setDrawerOpen(true);
    } else {
      router.push(item.href);
    }
  };

  const drawerItems = drawerType === 'fpl' ? fplNavItems : teamNavItems;

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 lg:hidden"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => {
              if (item.type === 'fpl' || item.type === 'team') {
                return (
                  <button
                    key={item.href}
                    onClick={(e) => handleNavClick(item, e)}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2 text-[var(--pl-text-muted)] hover:text-white hover:bg-white/5"
                    aria-label={item.label}
                  >
                    <span className="text-xl sm:text-2xl" aria-hidden="true">{item.icon}</span>
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              }
              return (
                <NavigationItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  color={item.type}
                  className="flex-col justify-center"
                />
              );
            })}
          </div>
        </div>
      </nav>

      {/* Drawer */}
      {drawerType && (
        <Drawer
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setDrawerType(null);
          }}
          type={drawerType}
          items={drawerItems}
          teamLogo={undefined}
          teamName={undefined}
        />
      )}
    </>
  );
}

