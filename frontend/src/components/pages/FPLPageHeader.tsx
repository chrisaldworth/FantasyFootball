'use client';

interface FPLPageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function FPLPageHeader({ title, subtitle }: FPLPageHeaderProps) {
  return (
    <div className="px-4 sm:px-6 py-6 bg-[var(--fpl-bg-tint)] border-b-[3px] border-[var(--fpl-primary)]">
      <div className="flex items-center gap-4">
        <span className="text-5xl sm:text-6xl" aria-hidden="true">⚽</span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--fpl-primary)]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[var(--pl-text-muted)] mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

