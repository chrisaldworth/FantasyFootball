'use client';

import Link from 'next/link';

interface QuickActionButtonProps {
  icon: string;
  label: string;
  href: string;
  badge?: boolean;
  variant?: 'primary' | 'outlined';
}

export default function QuickActionButton({
  icon,
  label,
  href,
  badge,
  variant = 'outlined',
}: QuickActionButtonProps) {
  const baseClasses = 'w-full h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative';
  const variantClasses = variant === 'primary'
    ? 'bg-[var(--fpl-primary)] text-[var(--fpl-text-on-primary)] hover:opacity-90'
    : 'border-2 border-[var(--fpl-primary)] text-[var(--fpl-primary)] hover:bg-[var(--fpl-primary)]/10';

  return (
    <Link href={href} className={`${baseClasses} ${variantClasses}`}>
      {badge && (
        <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[var(--pl-pink)]" aria-label="Action required" />
      )}
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}

