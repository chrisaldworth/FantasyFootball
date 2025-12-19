'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ExpandableNavSectionProps {
  type: 'fpl' | 'team';
  title: string;
  icon: string;
  items: Array<{
    icon: string;
    label: string;
    href: string;
  }>;
  defaultExpanded?: boolean;
  teamLogo?: string;
  teamName?: string;
}

export default function ExpandableNavSection({
  type,
  title,
  icon,
  items,
  defaultExpanded = false,
  teamLogo,
  teamName,
}: ExpandableNavSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const pathname = usePathname();
  const isFPL = type === 'fpl';

  // Auto-expand if any sub-item is active
  const hasActiveItem = items.some(item => 
    pathname === item.href || pathname.startsWith(item.href + '/')
  );
  if (hasActiveItem && !isExpanded) {
    setIsExpanded(true);
  }

  const bgColor = isFPL
    ? 'bg-[var(--fpl-primary)]/20 hover:bg-[var(--fpl-primary)]/30'
    : 'bg-[var(--team-primary)]/20 hover:bg-[var(--team-primary)]/30';

  const textColor = isFPL
    ? 'text-[var(--fpl-primary)]'
    : 'text-[var(--team-primary)]';

  return (
    <div className="space-y-1">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-3 py-3 rounded-lg flex items-center justify-between transition-all ${bgColor}`}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title} section`}
      >
        <div className="flex items-center gap-2">
          {teamLogo ? (
            <img 
              src={teamLogo} 
              alt={teamName || 'Team'} 
              className="w-5 h-5 object-contain" 
            />
          ) : (
            <span className="text-xl" aria-hidden="true">{icon}</span>
          )}
          <span className={`font-bold text-sm ${textColor}`}>
            {title}
          </span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Sub-Menu Items */}
      {isExpanded && (
        <div className="space-y-1 pl-6" role="menu">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const activeBg = isFPL
              ? 'bg-[var(--fpl-primary)]/30 text-[var(--fpl-primary)]'
              : 'bg-[var(--team-primary)]/30 text-[var(--team-primary)]';
            const inactiveBg = 'hover:bg-[var(--pl-dark)]/50 text-[var(--pl-text-muted)]';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive ? activeBg : inactiveBg
                }`}
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="text-lg" aria-hidden="true">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

