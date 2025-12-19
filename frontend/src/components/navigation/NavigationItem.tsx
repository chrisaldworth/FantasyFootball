'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationItemProps {
  icon: string;
  label: string;
  href: string;
  isActive?: boolean;
  className?: string;
}

export default function NavigationItem({ icon, label, href, isActive, className = '' }: NavigationItemProps) {
  const pathname = usePathname();
  const isCurrentActive = isActive !== undefined ? isActive : pathname === href || pathname.startsWith(href + '/');

  // Check if this is for sidebar (collapsed state) or bottom nav
  const isSidebarCollapsed = className.includes('justify-center') && !className.includes('flex-row');
  const isSidebarExpanded = !className.includes('justify-center') || className.includes('flex-row');

  return (
    <Link
      href={href}
      className={`
        flex ${isSidebarCollapsed ? 'flex-col' : 'flex-row'} items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} gap-2
        px-3 py-2 rounded-lg
        transition-all duration-200
        touch-manipulation
        focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2
        ${isCurrentActive 
          ? 'bg-[var(--team-primary)] text-[var(--team-text-on-primary)]' 
          : 'text-[var(--pl-text-muted)] hover:text-white hover:bg-white/5'
        }
        ${className}
      `}
      aria-label={label}
      aria-current={isCurrentActive ? 'page' : undefined}
    >
      <span className="text-xl sm:text-2xl flex-shrink-0" aria-hidden="true">{icon}</span>
      {isSidebarExpanded && (
        <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{label}</span>
      )}
    </Link>
  );
}

