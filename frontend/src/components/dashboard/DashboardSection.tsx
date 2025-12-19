'use client';

import Link from 'next/link';
import SectionHeader from '../sections/SectionHeader';

interface DashboardSectionProps {
  type: 'fpl' | 'team';
  title: string;
  subtitle?: string;
  icon?: string;
  teamLogo?: string;
  teamName?: string;
  children: React.ReactNode;
  viewAllHref: string;
}

export default function DashboardSection({
  type,
  title,
  subtitle,
  icon,
  teamLogo,
  teamName,
  children,
  viewAllHref,
}: DashboardSectionProps) {
  const isFPL = type === 'fpl';

  const borderColor = isFPL
    ? 'border-[var(--fpl-primary)]'
    : 'border-[var(--pl-cyan)]';

  const bgColor = isFPL
    ? 'bg-[var(--fpl-bg-tint)]'
    : 'bg-[var(--pl-cyan)]/10';

  return (
    <div className={`rounded-2xl border-[4px] ${borderColor} ${bgColor} p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 lg:mb-10 overflow-hidden`}>
      {/* Section Header */}
      <SectionHeader
        type={type}
        title={title}
        subtitle={subtitle}
        icon={icon}
        teamLogo={teamLogo}
        teamName={teamName}
        className="px-0 pb-4 mb-6"
      />

      {/* Preview Content */}
      <div className="space-y-6">
        {children}
      </div>

      {/* View All Button */}
      <div className="mt-8 flex justify-center">
        <Link
          href={viewAllHref}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg border-2 font-semibold transition-all flex items-center justify-center gap-2 ${
            isFPL
              ? 'border-[var(--fpl-primary)] text-[var(--fpl-primary)] hover:bg-[var(--fpl-primary)] hover:text-[var(--fpl-text-on-primary)]'
              : 'border-[var(--pl-cyan)] text-[var(--pl-cyan)] hover:bg-[var(--pl-cyan)] hover:text-white'
          }`}
        >
          <span>View All {title}</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

