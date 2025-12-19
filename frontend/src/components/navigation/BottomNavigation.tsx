'use client';

import NavigationItem from './NavigationItem';

const navItems = [
  { icon: '🏠', label: 'Dashboard', href: '/dashboard', color: 'neutral' as const },
  { icon: '⚽', label: 'FPL', href: '/dashboard?view=team', color: 'fpl' as const },
  { icon: '🏆', label: 'Team', href: '/dashboard?view=team', color: 'team' as const },
  { icon: '📊', label: 'Analytics', href: '/dashboard/analytics', color: 'fpl' as const },
  { icon: '⚙️', label: 'Settings', href: '/settings', color: 'neutral' as const },
];

export default function BottomNavigation() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 lg:hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <NavigationItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              color={item.color}
              className="flex-col justify-center"
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

