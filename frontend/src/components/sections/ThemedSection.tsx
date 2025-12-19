'use client';

import SectionHeader from './SectionHeader';

interface ThemedSectionProps {
  type: 'fpl' | 'team';
  title: string;
  subtitle?: string;
  icon?: string;
  teamLogo?: string;
  teamName?: string;
  children: React.ReactNode;
  className?: string;
}

export default function ThemedSection({
  type,
  title,
  subtitle,
  icon,
  teamLogo,
  teamName,
  children,
  className = '',
}: ThemedSectionProps) {
  const isFPL = type === 'fpl';

  const borderColor = isFPL
    ? 'border-[var(--fpl-primary)]'
    : 'border-[var(--team-primary)]';

  const bgColor = isFPL
    ? 'bg-[var(--fpl-bg-tint)]'
    : 'bg-[var(--team-primary)]/10';

  return (
    <div className={`rounded-xl border-[3px] ${borderColor} ${bgColor} overflow-hidden ${className}`}>
      <SectionHeader
        type={type}
        title={title}
        subtitle={subtitle}
        icon={icon}
        teamLogo={teamLogo}
        teamName={teamName}
      />
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}

