'use client';

import Link from 'next/link';

interface QuickActionButtonProps {
  icon: string;
  label: string;
  href: string;
  badge?: number;
}

export default function QuickActionButton({
  icon,
  label,
  href,
  badge,
}: QuickActionButtonProps) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center gap-2 p-4 glass rounded-xl min-w-[80px] hover:bg-[var(--pl-card-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]"
    >
      {badge && badge > 0 && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--pl-pink)] text-white text-xs flex items-center justify-center font-bold">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <span className="text-xs font-medium text-center">{label}</span>
    </Link>
  );
}

