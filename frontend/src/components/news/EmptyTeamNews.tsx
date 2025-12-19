'use client';

import Link from 'next/link';

export default function EmptyTeamNews() {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-4xl mb-4">⚽</div>
      <h3 className="text-lg font-semibold mb-2">No Favorite Team Selected</h3>
      <p className="text-sm text-[var(--pl-text-muted)] mb-6">
        Select a favorite team to see personalized team news
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--team-primary)] to-[var(--team-secondary)] text-white font-semibold hover:opacity-90 transition-opacity touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]"
      >
        Select Team
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

