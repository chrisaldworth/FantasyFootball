'use client';

import { useState, useEffect, useRef } from 'react';

interface Fixture {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
    };
  };
  teams: {
    home: {
      id: number;
      name: string;
    };
    away: {
      id: number;
      name: string;
    };
  };
  goals?: {
    home?: number;
    away?: number;
  };
  league: {
    id: number;
    name: string;
  };
}

interface FixtureTickerProps {
  fixtures: Fixture[];
  teamId: number;
  teamName: string;
  type: 'results' | 'upcoming';
  onFixtureClick?: (fixture: Fixture) => void;
  loading?: boolean;
}

export default function FixtureTicker({
  fixtures,
  teamId,
  teamName,
  type,
  onFixtureClick,
  loading = false,
}: FixtureTickerProps) {
  const tickerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const getLeagueBadge = (leagueName: string) => {
    const name = leagueName.toLowerCase();
    if (name.includes('champions league')) {
      return { emoji: '🏆', color: 'bg-blue-500/20', textColor: 'text-blue-400', label: 'UCL' };
    }
    if (name.includes('fa cup')) {
      return { emoji: '🏆', color: 'bg-red-500/20', textColor: 'text-red-400', label: 'FA Cup' };
    }
    if (name.includes('league cup') || name.includes('carabao')) {
      return { emoji: '🏆', color: 'bg-orange-500/20', textColor: 'text-orange-400', label: 'League Cup' };
    }
    if (name.includes('premier league')) {
      return { emoji: '⚽', color: 'bg-[var(--pl-green)]/20', textColor: 'text-[var(--pl-green)]', label: 'PL' };
    }
    return { emoji: '⚽', color: 'bg-gray-500/20', textColor: 'text-gray-400', label: leagueName };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (fixtures.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--pl-text-muted)]">
        <p className="text-sm">No {type === 'results' ? 'recent results' : 'upcoming fixtures'} available</p>
      </div>
    );
  }

  // Duplicate fixtures for seamless loop (only if we have fixtures)
  const duplicatedFixtures = fixtures.length > 0 ? [...fixtures, ...fixtures] : [];

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-r from-[var(--pl-card)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-l from-[var(--pl-card)] to-transparent z-10 pointer-events-none" />
      
      <div
        ref={tickerRef}
        className={`flex gap-3 sm:gap-4 ${isPaused ? 'animate-none' : duplicatedFixtures.length > 0 ? 'animate-scroll' : ''}`}
        style={{
          animationDuration: duplicatedFixtures.length > 0 ? `${Math.max(fixtures.length * 6, 20)}s` : '0s',
        }}
      >
        {duplicatedFixtures.map((fixture, index) => {
          const isHome = fixture.teams?.home?.id === teamId;
          const opponent = isHome ? fixture.teams?.away : fixture.teams?.home;
          const teamScore = isHome ? fixture.goals?.home : fixture.goals?.away;
          const opponentScore = isHome ? fixture.goals?.away : fixture.goals?.home;
          const won = type === 'results' && teamScore !== undefined && opponentScore !== undefined && teamScore > opponentScore;
          const drew = type === 'results' && teamScore !== undefined && opponentScore !== undefined && teamScore === opponentScore;
          const lost = type === 'results' && teamScore !== undefined && opponentScore !== undefined && teamScore < opponentScore;
          const fixtureDate = fixture.fixture?.date;
          const badge = fixture.league?.name ? getLeagueBadge(fixture.league.name) : null;

          return (
            <div
              key={`${fixture.fixture?.id}-${index}`}
              onClick={() => onFixtureClick?.(fixture)}
              className={`flex-shrink-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border transition-all ${
                onFixtureClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
              }`}
              style={{
                backgroundColor: 'rgba(0, 255, 135, 0.1)',
                borderColor: 'rgba(0, 255, 135, 0.3)',
                minWidth: '240px',
              }}
            >
              {/* Date/Time */}
              <div className="flex-shrink-0 text-xs text-[var(--pl-text-muted)] w-16">
                {fixtureDate && (
                  <>
                    <div className="whitespace-nowrap">{formatDate(fixtureDate)}</div>
                    {type === 'upcoming' && (
                      <div className="whitespace-nowrap text-[10px]">{formatTime(fixtureDate)}</div>
                    )}
                  </>
                )}
              </div>

              {/* Match Info */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isHome ? (
                  <>
                    <span className="font-semibold text-sm truncate" style={{ color: 'var(--pl-green)' }}>
                      {teamName}
                    </span>
                    {type === 'results' && teamScore !== undefined && opponentScore !== undefined && (
                      <span className="text-base font-bold whitespace-nowrap">
                        {teamScore} - {opponentScore}
                      </span>
                    )}
                    {type === 'upcoming' && <span className="text-[var(--pl-text-muted)] text-xs">vs</span>}
                    <span className="text-sm truncate">{opponent?.name || 'TBD'}</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm truncate">{opponent?.name || 'TBD'}</span>
                    {type === 'upcoming' && <span className="text-[var(--pl-text-muted)] text-xs">vs</span>}
                    {type === 'results' && teamScore !== undefined && opponentScore !== undefined && (
                      <span className="text-base font-bold whitespace-nowrap">
                        {opponentScore} - {teamScore}
                      </span>
                    )}
                    <span className="font-semibold text-sm truncate" style={{ color: 'var(--pl-green)' }}>
                      {teamName}
                    </span>
                  </>
                )}
              </div>

              {/* Result Badge / League Badge */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {type === 'results' && teamScore !== undefined && opponentScore !== undefined && (
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                      won
                        ? 'bg-[var(--pl-green)]/20 text-[var(--pl-green)]'
                        : drew
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-[var(--pl-pink)]/20 text-[var(--pl-pink)]'
                    }`}
                  >
                    {won ? 'W' : drew ? 'D' : 'L'}
                  </span>
                )}
                {badge && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color} ${badge.textColor} flex items-center gap-1 whitespace-nowrap`}>
                    <span>{badge.emoji}</span>
                    <span className="hidden sm:inline">{badge.label}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

