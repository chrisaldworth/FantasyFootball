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

const moreNavItems = [
  { icon: '🏆', label: 'My Team', href: '/my-team' },
  { icon: '⚙️', label: 'Settings', href: '/settings' },
];

const navItems = [
  { icon: '🏠', label: 'Home', href: '/dashboard', type: 'neutral' as const, isAction: false },
  { icon: '🔮', label: 'Predict', href: '/predictions', type: 'neutral' as const, isAction: false },
  { icon: '🎯', label: 'Picks', href: '/weekly-picks', type: 'action' as const, isAction: true }, // Central action button
  { icon: '🏟️', label: 'Matches', href: '/matches', type: 'neutral' as const, isAction: false },
  { icon: '⚽', label: 'FPL', href: '/fantasy-football', type: 'fpl' as const, isAction: false },
];

export default function BottomNavigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'fpl' | 'team' | 'more' | null>(null);
  const router = useRouter();

  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    e.preventDefault();
    if (item.type === 'fpl' || item.type === 'more') {
      setDrawerType(item.type);
      setDrawerOpen(true);
    } else {
      router.push(item.href);
    }
  };

  const drawerItems = drawerType === 'fpl' ? fplNavItems : drawerType === 'more' ? moreNavItems : teamNavItems;

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
              // Central action button (Weekly Picks)
              if (item.isAction) {
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className="relative flex flex-col items-center justify-center gap-0.5 -mt-6 touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2"
                    aria-label={item.label}
                  >
                    {/* Elevated circular button */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--pl-green)] to-[var(--pl-cyan)] flex items-center justify-center shadow-lg shadow-[var(--pl-green)]/30 hover:scale-105 transition-transform">
                      <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[var(--pl-green)] mt-0.5">{item.label}</span>
                  </button>
                );
              }
              
              // FPL drawer button
              if (item.type === 'fpl') {
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
              
              // Regular navigation items
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

