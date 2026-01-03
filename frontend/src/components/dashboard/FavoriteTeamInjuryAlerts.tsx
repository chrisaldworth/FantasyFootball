'use client';

import { useRef, useEffect, useState } from 'react';

function getPlayerPhotoUrl(photo: string): string {
  const photoCode = photo.replace('.jpg', '');
  return `https://resources.premierleague.com/premierleague/photos/players/250x250/p${photoCode}.png`;
}

interface InjuredPlayer {
  id: number;
  name: string;
  position: string;
  photo: string | null;
  injuryStatus: string;
  chanceOfPlaying: number | null;
}

interface FavoriteTeamInjuryAlertsProps {
  teamName: string;
  injuredPlayers: InjuredPlayer[];
}

export default function FavoriteTeamInjuryAlerts({
  teamName,
  injuredPlayers,
}: FavoriteTeamInjuryAlertsProps) {
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
        <span className="text-2xl animate-wiggle" aria-hidden="true">⚠️</span>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            My Team Injury Concerns
          </h3>
          <p className="text-sm text-[var(--pl-text-muted)]">{teamName}</p>
        </div>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-[var(--pl-pink)]/20 text-[var(--pl-pink)] text-xs">
          {injuredPlayers.length} {injuredPlayers.length === 1 ? 'player' : 'players'}
        </span>
      </div>

      <div className="space-y-3">
        {injuredPlayers.map((player, index) => {
          const isHovered = hoveredId === player.id;
          
          return (
            <div
              key={player.id}
              className={`
                p-3 rounded-lg border-2 border-[var(--pl-pink)] bg-[var(--pl-pink)]/10 
                transition-all duration-300
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
                ${isHovered ? 'bg-[var(--pl-pink)]/20 scale-[1.02] shadow-lg' : ''}
              `}
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
              onMouseEnter={() => setHoveredId(player.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-start gap-3">
                {/* Player photo with hover effect */}
                <div
                  className={`
                    w-16 h-16 rounded-full flex-shrink-0 overflow-hidden
                    transition-transform duration-300
                    ${isHovered ? 'scale-110 ring-2 ring-[var(--pl-pink)]' : 'scale-100'}
                  `}
                >
                  {player.photo ? (
                    <img
                      src={getPlayerPhotoUrl(player.photo)}
                      alt={player.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--pl-dark)] flex items-center justify-center">
                      <span className="text-2xl" aria-hidden="true">👤</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div
                    className={`
                      font-semibold text-white transition-transform duration-300
                      ${isHovered ? 'translate-x-1' : 'translate-x-0'}
                    `}
                  >
                    {player.name}
                  </div>
                  <div className="text-sm text-[var(--pl-text-muted)]">
                    {player.position}
                    {player.chanceOfPlaying !== null && (
                      <span className={player.chanceOfPlaying < 50 ? 'text-[var(--pl-pink)]' : 'text-[var(--pl-yellow)]'}>
                        {' '}- {player.chanceOfPlaying}% chance
                      </span>
                    )}
                  </div>
                  <div
                    className={`
                      text-xs text-[var(--pl-text-muted)] mt-1
                      transition-opacity duration-300
                      ${isHovered ? 'opacity-100' : 'opacity-70'}
                    `}
                  >
                    {player.injuryStatus}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

