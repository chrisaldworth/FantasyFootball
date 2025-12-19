'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SubNavigationItem {
  label: string;
  href: string;
  icon: string;
}

interface SubNavigationProps {
  type: 'fpl' | 'team';
  items: SubNavigationItem[];
}

export default function SubNavigation({ type, items }: SubNavigationProps) {
  const pathname = usePathname();
  const isFPL = type === 'fpl';

  return (
    <nav
      className="sticky top-16 z-30 bg-[var(--pl-dark)]/95 backdrop-blur-sm border-b border-white/10"
      role="navigation"
      aria-label={`${isFPL ? 'Fantasy Football' : 'My Team'} sub-navigation`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const activeClasses = isFPL
              ? 'bg-[var(--fpl-primary)]/20 text-[var(--fpl-primary)] border-[var(--fpl-primary)]'
              : 'bg-[var(--team-primary)]/20 text-[var(--team-primary)] border-[var(--team-primary)]';
            const inactiveClasses = 'text-[var(--pl-text-muted)] border-transparent hover:bg-white/5';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all whitespace-nowrap ${
                  isActive ? activeClasses : inactiveClasses
                }`}
                style={!isFPL && isActive ? {
                  backgroundColor: 'var(--team-primary)',
                  opacity: 0.2,
                  borderColor: 'var(--team-primary)',
                  color: 'var(--team-primary)'
                } : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="text-lg" aria-hidden="true">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

