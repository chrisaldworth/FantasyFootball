'use client';

import { useState, useEffect, useRef } from 'react';
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

// Single countdown digit component with flip animation
function CountdownDigit({ value, prevValue }: { value: string; prevValue: string }) {
  const hasChanged = value !== prevValue;
  
  return (
    <span
      className={`
        inline-block transition-all duration-300
        ${hasChanged ? 'animate-flip-in' : ''}
      `}
    >
      {value}
    </span>
  );
}

// Countdown unit component (days, hours, etc.)
function CountdownUnit({
  value,
  label,
  prevValue,
  isUrgent,
}: {
  value: number;
  label: string;
  prevValue: number;
  isUrgent?: boolean;
}) {
  const displayValue = String(value).padStart(2, '0');
  const prevDisplayValue = String(prevValue).padStart(2, '0');
  
  return (
    <div
      className={`
        flex flex-col items-center p-2 sm:p-3 rounded-lg
        transition-all duration-300
        ${isUrgent ? 'bg-[var(--pl-pink)]/20 animate-pulse' : 'bg-white/5 hover:bg-white/10'}
      `}
    >
      <div
        className={`
          text-3xl sm:text-4xl font-bold tabular-nums
          ${isUrgent ? 'text-[var(--pl-pink)]' : 'text-white'}
        `}
      >
        <CountdownDigit value={displayValue[0]} prevValue={prevDisplayValue[0]} />
        <CountdownDigit value={displayValue[1]} prevValue={prevDisplayValue[1]} />
      </div>
      <div
        className={`
          text-xs mt-1 transition-colors duration-300
          ${isUrgent ? 'text-[var(--pl-pink)]' : 'text-[var(--pl-text-muted)]'}
        `}
      >
        {label}
      </div>
    </div>
  );
}

export default function MatchCountdown({
  matchDate,
  homeTeamName,
  homeTeamId,
  awayTeamName,
  awayTeamId,
  matchLink,
}: MatchCountdownProps) {
  // ALL HOOKS MUST BE CALLED FIRST
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  
  const [prevTimeLeft, setPrevTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

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

  // Intersection observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const calculateTime = () => {
      if (!matchDate) {
        console.warn('[MatchCountdown] No match date provided');
        setTimeLeft(null);
        return;
      }

      const target = typeof matchDate === 'string' ? new Date(matchDate) : matchDate;
      
      // Validate date
      if (isNaN(target.getTime())) {
        console.error('[MatchCountdown] Invalid date:', matchDate, 'Parsed as:', target);
        setTimeLeft(null);
        return;
      }

      const now = new Date();
      const difference = target.getTime() - now.getTime();
      
      console.log('[MatchCountdown] Date calculation:', {
        matchDateString: typeof matchDate === 'string' ? matchDate : matchDate.toISOString(),
        targetISO: target.toISOString(),
        nowISO: now.toISOString(),
        differenceMs: difference,
        differenceHours: difference / (1000 * 60 * 60),
        isFuture: difference > 0
      });
      
      if (difference <= 0) {
        console.log('[MatchCountdown] Match date has passed or is now:', {
          matchDate: target.toISOString(),
          now: now.toISOString(),
          difference: difference
        });
        setTimeLeft((prev) => {
          setPrevTimeLeft(prev);
          return null;
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      console.log('[MatchCountdown] Calculated time left:', { days, hours, minutes, seconds });
      
      setTimeLeft((prev) => {
        setPrevTimeLeft(prev);
        return { days, hours, minutes, seconds };
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000); // Update every second

    return () => clearInterval(interval);
  }, [matchDate]);

  // NOW we can do conditional returns - all hooks have been called
  // Return null if no date
  if (!matchDate) {
    console.log('[MatchCountdown] No match date, returning null');
    return null;
  }
  
  // If timeLeft is null, it means we're still calculating or the match has passed
  // Show a loading state or "calculating..." instead of returning null
  if (timeLeft === null) {
    console.log('[MatchCountdown] timeLeft is null, matchDate:', matchDate);
    // Don't return null - show a placeholder so the component renders
    // The useEffect will update timeLeft once calculation completes
    return (
      <div className="glass rounded-xl p-1.5 sm:p-6 opacity-50">
        <div className="text-sm sm:text-2xl font-semibold text-white mb-1 sm:mb-2 text-center">
          {homeTeamName && awayTeamName ? `${homeTeamName} vs ${awayTeamName}` : 'Upcoming Match'}
        </div>
        <div className="text-[10px] sm:text-base text-[var(--pl-text-muted)] mb-1.5 sm:mb-4 text-center">
          Calculating...
        </div>
      </div>
    );
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

  // Is the match less than 24 hours away?
  const isUrgent = timeLeft.days === 0;
  const isVerySoon = isUrgent && timeLeft.hours < 2;

  return (
    <div
      ref={containerRef}
      className={`
        glass rounded-xl p-1.5 sm:p-6
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${isVerySoon ? 'animate-border-glow border border-[var(--pl-pink)]/50' : ''}
        hover:shadow-[0_0_30px_rgba(0,255,135,0.15)]
      `}
    >
      {/* Match title with animation */}
      <div
        className={`
          text-sm sm:text-2xl font-semibold text-white mb-1 sm:mb-2 text-center
          transition-all duration-500
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
        `}
      >
        {fixtureText}
        {isVerySoon && (
          <span className="ml-2 inline-flex items-center">
            <span className="w-2 h-2 bg-[var(--pl-pink)] rounded-full animate-heartbeat"></span>
            <span className="ml-1 text-xs text-[var(--pl-pink)] font-normal">SOON</span>
          </span>
        )}
      </div>
      
      {/* Match Date */}
      <div
        className={`
          text-[10px] sm:text-base text-[var(--pl-text-muted)] mb-1.5 sm:mb-4 text-center
          transition-all duration-500 delay-100
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {formatMatchDate(matchDate)}
      </div>
      
      {/* Countdown Display with flip animations */}
      <div
        className={`
          flex items-center justify-center gap-1 sm:gap-2 mb-4
          transition-all duration-500 delay-200
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        <CountdownUnit
          value={timeLeft.days}
          label="Days"
          prevValue={prevTimeLeft?.days ?? timeLeft.days}
          isUrgent={false}
        />
        <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-text-muted)] animate-pulse">:</div>
        
        <CountdownUnit
          value={timeLeft.hours}
          label="Hours"
          prevValue={prevTimeLeft?.hours ?? timeLeft.hours}
          isUrgent={isUrgent}
        />
        <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-text-muted)] animate-pulse">:</div>
        
        <CountdownUnit
          value={timeLeft.minutes}
          label="Minutes"
          prevValue={prevTimeLeft?.minutes ?? timeLeft.minutes}
          isUrgent={isVerySoon}
        />
        <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-text-muted)] animate-pulse">:</div>
        
        <CountdownUnit
          value={timeLeft.seconds}
          label="Seconds"
          prevValue={prevTimeLeft?.seconds ?? timeLeft.seconds}
          isUrgent={isVerySoon}
        />
      </div>

      {/* Match Info with Both Team Logos - animated */}
      <div
        className={`
          flex items-center justify-center gap-2 sm:gap-4 lg:gap-6 pt-4 border-t border-white/10
          transition-all duration-500 delay-300
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        {/* Home Team Logo with hover effect */}
        {homeTeamId && (
          <div className="transition-transform duration-300 hover:scale-110 hover:-rotate-3">
            <TeamLogo teamId={homeTeamId} size={48} className="sm:w-12 sm:h-12 lg:w-16 lg:h-16" />
          </div>
        )}
        
        {/* VS Text with pulse */}
        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--pl-green)] animate-pulse">
          vs
        </div>
        
        {/* Away Team Logo with hover effect */}
        {awayTeamId && (
          <div className="transition-transform duration-300 hover:scale-110 hover:rotate-3">
            <TeamLogo teamId={awayTeamId} size={48} className="sm:w-12 sm:h-12 lg:w-16 lg:h-16" />
          </div>
        )}
      </div>

      {matchLink && (
        <div
          className={`
            mt-4 text-center
            transition-all duration-500 delay-400
            ${isVisible ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <Link
            href={matchLink}
            className="text-sm text-[var(--pl-green)] hover:underline inline-flex items-center gap-1 hover:gap-2 transition-all duration-300"
          >
            View Match Details
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

