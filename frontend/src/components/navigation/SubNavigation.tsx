'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/lib/sidebar-context';

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
  const { isExpanded } = useSidebar();
  const isFPL = type === 'fpl';
  
  // Account for sidebar offset on desktop
  const showSidebarOffset = pathname !== '/' && pathname !== '/login' && pathname !== '/register';
  const sidebarOffset = showSidebarOffset ? (isExpanded ? 'lg:left-60' : 'lg:left-16') : '';

  return (
    <nav
      className={`sticky top-14 sm:top-16 ${sidebarOffset} z-30 bg-[var(--pl-dark)]/95 backdrop-blur-sm border-b border-white/10 transition-all duration-300`}
      role="navigation"
      aria-label={`${isFPL ? 'Fantasy Football' : 'My Team'} sub-navigation`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const activeClasses = isFPL
              ? 'bg-[var(--fpl-primary)]/20 text-[var(--fpl-primary)] border-[var(--fpl-primary)]'
              : 'bg-[var(--pl-green)]/20 text-[var(--pl-green)] border-[var(--pl-green)]';
            const inactiveClasses = 'text-[var(--pl-text-muted)] border-transparent hover:bg-white/5';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all whitespace-nowrap ${
                  isActive ? activeClasses : inactiveClasses
                }`}
                style={!isFPL && isActive ? {
                  backgroundColor: 'var(--pl-green)',
                  opacity: 0.2,
                  borderColor: 'var(--pl-green)',
                  color: 'var(--pl-green)'
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

