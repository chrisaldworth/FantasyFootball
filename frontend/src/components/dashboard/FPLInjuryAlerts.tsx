'use client';

import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';

interface InjuredPlayer {
  id: number;
  name: string;
  team: string;
  injuryStatus: string;
  chanceOfPlaying: number | null;
}

interface FPLInjuryAlertsProps {
  injuredPlayers: InjuredPlayer[];
}

export default function FPLInjuryAlerts({ injuredPlayers }: FPLInjuryAlertsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

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

  if (injuredPlayers.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`
        glass rounded-xl p-4 sm:p-6
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        hover:shadow-[0_0_25px_rgba(233,0,82,0.15)]
      `}
    >
      {/* Header with animated icon */}
      <div
        className={`
          flex items-center gap-2 mb-4
          transition-all duration-500
          ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
        `}
      >
        <span className="text-2xl animate-pulse" aria-hidden="true">⚽</span>
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          FPL Squad Injury Concerns
        </h3>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-[var(--pl-pink)]/20 text-[var(--pl-pink)] text-xs">
          {injuredPlayers.length} {injuredPlayers.length === 1 ? 'player' : 'players'}
        </span>
      </div>

      <div className="space-y-3">
        {injuredPlayers.map((player, index) => {
          const isHovered = hoveredId === player.id;
          
          return (
            <Link
              key={player.id}
              href="/fantasy-football/transfers"
              className={`
                block p-3 rounded-lg border-2 border-[var(--pl-pink)] bg-[var(--pl-pink)]/10 
                transition-all duration-300
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
                ${isHovered ? 'bg-[var(--pl-pink)]/20 scale-[1.02] shadow-lg' : ''}
              `}
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              onMouseEnter={() => setHoveredId(player.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`
                    text-xl flex-shrink-0 transition-transform duration-300
                    ${isHovered ? 'scale-125 animate-heartbeat' : 'scale-100'}
                  `}
                  aria-hidden="true"
                >
                  🏥
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-white">{player.name}</div>
                  <div className="text-sm text-[var(--pl-text-muted)]">
                    {player.team}
                    {player.chanceOfPlaying !== null && (
                      <span className={player.chanceOfPlaying < 50 ? 'text-[var(--pl-pink)]' : 'text-[var(--pl-yellow)]'}>
                        {' '}- {player.chanceOfPlaying}% chance
                      </span>
                    )}
                  </div>
                  <div
                    className={`
                      mt-2 text-xs text-[var(--pl-green)] hover:underline 
                      inline-flex items-center transition-all duration-300
                      ${isHovered ? 'gap-2' : 'gap-1'}
                    `}
                  >
                    View Transfer Options
                    <svg
                      className={`
                        w-3 h-3 transition-transform duration-300
                        ${isHovered ? 'translate-x-1' : 'translate-x-0'}
                      `}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

