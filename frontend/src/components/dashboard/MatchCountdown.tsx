'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TeamLogo from '@/components/TeamLogo';

interface MatchCountdownProps {
  matchDate: Date | string;
  homeTeamName: string;
  homeTeamId?: number | null;
  awayTeamName: string;
  awayTeamId?: number | null;
  matchLink?: string;
}

export default function MatchCountdown({
  matchDate,
  homeTeamName,
  homeTeamId,
  awayTeamName,
  awayTeamId,
  matchLink,
}: MatchCountdownProps) {
  // Debug logging to see what team IDs we're receiving
  useEffect(() => {
    console.log('[MatchCountdown] Received props:', {
      fixture: `${homeTeamName} vs ${awayTeamName}`,
      homeTeamId,
      awayTeamId,
      homeTeamName,
      awayTeamName
    });
  }, [homeTeamName, homeTeamId, awayTeamName, awayTeamId]);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const target = typeof matchDate === 'string' ? new Date(matchDate) : matchDate;
      const now = new Date();
      const difference = target.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000); // Update every second

    return () => clearInterval(interval);
  }, [matchDate]);

  if (timeLeft === null) {
    return null;
  }

  // Construct fixture text (e.g., "Everton vs Arsenal")
  const fixtureText = homeTeamName && awayTeamName
    ? `${homeTeamName} vs ${awayTeamName}`
    : 'Upcoming Match';

  // Format match date
  const formatMatchDate = (date: Date | string): string => {
    const matchDate = typeof date === 'string' ? new Date(date) : date;
    return matchDate.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="glass rounded-xl p-2 sm:p-6">
      <div className="text-base sm:text-2xl font-semibold text-white mb-1 sm:mb-2 text-center">
        {fixtureText}
      </div>
      
      {/* Match Date */}
      <div className="text-xs sm:text-base text-[var(--pl-text-muted)] mb-2 sm:mb-4 text-center">
        {formatMatchDate(matchDate)}
      </div>
      
      {/* Countdown Display */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
        {/* Days */}
        <div className="flex flex-col items-center">
          <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
            {String(timeLeft.days).padStart(2, '0')}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)] mt-1">Days</div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-text-muted)]">:</div>
        
        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)] mt-1">Hours</div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-text-muted)]">:</div>
        
        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)] mt-1">Minutes</div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-text-muted)]">:</div>
        
        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)] mt-1">Seconds</div>
        </div>
      </div>

      {/* Match Info with Both Team Logos */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 lg:gap-6 pt-4 border-t border-white/10">
        {/* Home Team Logo */}
        {homeTeamId && (
          <TeamLogo teamId={homeTeamId} size={48} className="sm:w-12 sm:h-12 lg:w-16 lg:h-16" />
        )}
        
        {/* VS Text */}
        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--pl-green)]">
          vs
        </div>
        
        {/* Away Team Logo */}
        {awayTeamId && (
          <TeamLogo teamId={awayTeamId} size={48} className="sm:w-12 sm:h-12 lg:w-16 lg:h-16" />
        )}
      </div>

      {matchLink && (
        <div className="mt-4 text-center">
          <Link
            href={matchLink}
            className="text-sm text-[var(--pl-green)] hover:underline inline-flex items-center gap-1"
          >
            View Match Details
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

