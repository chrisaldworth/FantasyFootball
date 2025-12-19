'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MatchCountdownProps {
  matchDate: Date | string;
  opponent: string;
  isHome: boolean;
  matchLink?: string;
}

export default function MatchCountdown({
  matchDate,
  opponent,
  isHome,
  matchLink,
}: MatchCountdownProps) {
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    const calculateMinutes = () => {
      const target = typeof matchDate === 'string' ? new Date(matchDate) : matchDate;
      const now = new Date();
      const difference = target.getTime() - now.getTime();
      const minutesLeft = Math.floor(difference / (1000 * 60));
      setMinutes(minutesLeft);
    };

    calculateMinutes();
    const interval = setInterval(calculateMinutes, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [matchDate]);

  if (minutes === null || minutes < 0) {
    return null;
  }

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      <div className="text-sm text-[var(--pl-text-muted)] mb-2">
        Your next Team's match is in
      </div>
      <div className="text-4xl sm:text-5xl font-bold text-white mb-3">
        {minutes} minutes
      </div>
      <div className="text-lg font-semibold mb-2 text-white">
        {isHome ? 'vs' : 'at'} {opponent}
      </div>
      {matchLink && (
        <Link
          href={matchLink}
          className="text-sm text-[var(--pl-green)] hover:underline inline-flex items-center gap-1"
        >
          View Match Details
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}

