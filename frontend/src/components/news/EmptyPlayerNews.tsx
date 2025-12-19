'use client';

import Link from 'next/link';

export default function EmptyPlayerNews() {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-4xl mb-4">👤</div>
      <h3 className="text-lg font-semibold mb-2">No FPL Team Linked</h3>
      <p className="text-sm text-[var(--pl-text-muted)] mb-6">
        Link your FPL team to see personalized news about your squad players
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00ff87] to-[#04f5ff] text-white font-semibold hover:opacity-90 transition-opacity touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]"
      >
        Link FPL Team
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

