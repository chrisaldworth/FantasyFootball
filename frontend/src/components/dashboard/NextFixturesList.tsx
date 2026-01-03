'use client';

import { useRef, useEffect, useState } from 'react';
import TeamLogoEnhanced from '@/components/TeamLogoEnhanced';

interface NextFixturesListProps {
  fixtures: Array<{
    date: string;
    homeTeam: string;
    homeTeamId: number | null;
    awayTeam: string;
    awayTeamId: number | null;
    isHome: boolean;
  }>;
  favoriteTeamName?: string;
}

export default function NextFixturesList({ fixtures, favoriteTeamName }: NextFixturesListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

  if (fixtures.length === 0) {
    return null;
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      ref={containerRef}
      className={`
        glass rounded-xl p-1.5 sm:p-6
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        hover:shadow-[0_0_25px_rgba(4,245,255,0.1)]
      `}
    >
      {/* Header with animation */}
      <h3
        className={`
          text-xs sm:text-xl font-semibold text-white mb-1.5 sm:mb-4
          flex items-center gap-2
          transition-all duration-500
          ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
        `}
      >
        <span className={isVisible ? 'animate-bounce-subtle' : ''}>📅</span>
        Next 5 Fixtures
        {favoriteTeamName && <span className="text-[var(--pl-text-muted)] text-[10px] sm:text-base"> - {favoriteTeamName}</span>}
      </h3>
      
      {/* Fixtures list with staggered animation */}
      <div className="space-y-1 sm:space-y-3">
        {fixtures.map((fixture, index) => {
          const isHovered = hoveredIndex === index;
          
          return (
            <div
              key={index}
              className={`
                flex items-center justify-between p-1.5 sm:p-3 bg-[var(--pl-dark)]/50 rounded-lg 
                border border-white/10 transition-all duration-300
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
                ${isHovered ? 'border-[var(--pl-green)]/50 scale-[1.02] shadow-lg bg-[var(--pl-dark)]/70' : 'hover:border-[var(--pl-green)]/30'}
              `}
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Home Team with hover animation */}
                <div
                  className={`
                    flex items-center gap-2 flex-shrink-0 transition-transform duration-300
                    ${isHovered ? '-translate-x-1' : 'translate-x-0'}
                  `}
                >
                  {fixture.homeTeamId && (
                    <div className={`transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
                      <TeamLogoEnhanced teamId={fixture.homeTeamId} size={24} style="shield" />
                    </div>
                  )}
                  <span className={`text-sm font-medium ${fixture.isHome ? 'text-[var(--pl-green)]' : 'text-white'}`}>
                    {fixture.homeTeam}
                  </span>
                </div>
                
                <span className={`text-[var(--pl-text-muted)] text-sm transition-all duration-300 ${isHovered ? 'text-[var(--pl-green)]' : ''}`}>vs</span>
                
                {/* Away Team with hover animation */}
                <div
                  className={`
                    flex items-center gap-2 flex-shrink-0 transition-transform duration-300
                    ${isHovered ? 'translate-x-1' : 'translate-x-0'}
                  `}
                >
                  {fixture.awayTeamId && (
                    <div className={`transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
                      <TeamLogoEnhanced teamId={fixture.awayTeamId} size={24} style="shield" />
                    </div>
                  )}
                  <span className={`text-sm font-medium ${!fixture.isHome ? 'text-[var(--pl-green)]' : 'text-white'}`}>
                    {fixture.awayTeam}
                  </span>
                </div>
              </div>
              
              {/* Date with animation */}
              <div
                className={`
                  text-xs sm:text-sm flex-shrink-0 ml-4 transition-all duration-300
                  ${isHovered ? 'text-[var(--pl-cyan)]' : 'text-[var(--pl-text-muted)]'}
                `}
              >
                {formatDate(fixture.date)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


