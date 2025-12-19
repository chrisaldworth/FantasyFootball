'use client';

export default function NewsCardSkeleton() {
  return (
    <div className="glass rounded-xl p-4 sm:p-6 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-[var(--pl-dark)]/50 rounded w-3/4"></div>
          <div className="h-4 bg-[var(--pl-dark)]/50 rounded w-full"></div>
          <div className="h-4 bg-[var(--pl-dark)]/50 rounded w-2/3"></div>
        </div>
        <div className="h-4 bg-[var(--pl-dark)]/50 rounded w-16"></div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <div className="h-6 bg-[var(--pl-dark)]/50 rounded w-20"></div>
        <div className="h-6 bg-[var(--pl-dark)]/50 rounded w-16"></div>
      </div>
    </div>
  );
}

