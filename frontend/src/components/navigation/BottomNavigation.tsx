'use client';

import NavigationItem from './NavigationItem';

const navItems = [
  { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
  { icon: '⚽', label: 'My Team', href: '/dashboard?view=team' },
  { icon: '📊', label: 'Analytics', href: '/dashboard/analytics' },
  { icon: '🏆', label: 'Leagues', href: '/dashboard/leagues' },
  { icon: '⚙️', label: 'Settings', href: '/settings' },
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
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

