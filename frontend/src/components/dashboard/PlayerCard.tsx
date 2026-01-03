'use client';

import { useState } from 'react';

function getPlayerPhotoUrl(photo: string | null): string {
  if (!photo) return '';
  const photoCode = photo.replace('.jpg', '');
  return `https://resources.premierleague.com/premierleague/photos/players/250x250/p${photoCode}.png`;
}

const POSITION_MAP: { [key: number]: string } = {
  1: 'GK',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
};

interface PlayerCardProps {
  player: {
    id: number;
    name: string;
    position: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
    photo: string | null;
    goals: number;
    assists: number;
    rating: number | null;
    appearances: number;
    minutes: number;
    form?: ('W' | 'D' | 'L')[];
  };
  rank: 1 | 2 | 3;
  isTopScorer?: boolean;
  isTopAssister?: boolean;
  hasHighRating?: boolean;
  onClick?: () => void;
}

export default function PlayerCard({
  player,
  rank,
  isTopScorer = false,
  isTopAssister = false,
  hasHighRating = false,
  onClick,
}: PlayerCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const photoUrl = getPlayerPhotoUrl(player.photo);
  const positionName = POSITION_MAP[player.position] || 'UNK';
  
  // Ranking badge colors
  const rankColors = {
    1: 'bg-[var(--pl-yellow)] text-[var(--pl-dark)]',
    2: 'bg-gray-400 text-white',
    3: 'bg-[var(--pl-cyan)]/80 text-white',
  };
  
  // Card styling based on rank
  const cardStyles = {
    1: 'border-2 border-[var(--pl-yellow)] bg-[var(--pl-yellow)]/5',
    2: 'border border-white/20 bg-[var(--pl-card)]',
    3: 'border border-white/10 bg-[var(--pl-card)]',
  };

  // Glow colors based on rank
  const glowStyles = {
    1: 'shadow-[0_0_30px_rgba(255,215,0,0.3)]',
    2: 'shadow-[0_0_20px_rgba(156,163,175,0.2)]',
    3: 'shadow-[0_0_20px_rgba(4,245,255,0.2)]',
  };
  
  return (
    <div
      className={`
        relative glass rounded-xl p-4 sm:p-6 
        ${cardStyles[rank]} 
        transition-all duration-300 ease-out
        hover:bg-[var(--pl-card-hover)] 
        ${onClick ? 'cursor-pointer' : ''}
        ${isHovered ? `scale-[1.03] ${glowStyles[rank]}` : 'scale-100'}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={onClick ? 'button' : 'article'}
      aria-label={`Player ranking: #${rank}, ${player.name}, ${positionName}`}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {/* Ranking Badge with animation */}
      <div
        className={`
          absolute top-2 left-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full 
          ${rankColors[rank]} 
          flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg z-10
          transition-transform duration-300
          ${isHovered ? 'scale-110 rotate-6' : 'scale-100 rotate-0'}
          ${rank === 1 ? 'animate-pulse-glow' : ''}
        `}
      >
        #{rank}
      </div>
      
      {/* Performance Badges with animations */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        {isTopScorer && (
          <div
            className={`
              w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--pl-green)]/80 
              border-2 border-white/20 flex items-center justify-center text-lg sm:text-xl shadow-md
              transition-transform duration-300
              ${isHovered ? 'scale-125 animate-bounce-subtle' : 'scale-100'}
            `}
            title="Top Scorer"
            aria-label="Top Scorer"
          >
            ⚽
          </div>
        )}
        {isTopAssister && (
          <div
            className={`
              w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--pl-cyan)]/80 
              border-2 border-white/20 flex items-center justify-center text-lg sm:text-xl shadow-md
              transition-transform duration-300
              ${isHovered ? 'scale-125 animate-bounce-subtle' : 'scale-100'}
            `}
            title="Top Assister"
            aria-label="Top Assister"
            style={{ animationDelay: '0.1s' }}
          >
            🅰️
          </div>
        )}
        {hasHighRating && (
          <div
            className={`
              w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--pl-yellow)]/80 
              border-2 border-white/20 flex items-center justify-center text-lg sm:text-xl shadow-md
              transition-transform duration-300
              ${isHovered ? 'scale-125 animate-bounce-subtle' : 'scale-100'}
            `}
            title="High Rating"
            aria-label="High Rating"
            style={{ animationDelay: '0.2s' }}
          >
            ⭐
          </div>
        )}
      </div>
      
      {/* Player Photo with hover effect */}
      <div className="flex justify-center mb-4">
        <div
          className={`
            relative w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 
            rounded-full border-2 border-white/20 shadow-lg overflow-hidden bg-[var(--pl-dark)]
            transition-all duration-300
            ${isHovered ? 'scale-110 border-[var(--pl-green)]/50 shadow-[0_0_20px_rgba(0,255,135,0.2)]' : 'scale-100'}
          `}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={player.name}
              className={`
                w-full h-full object-cover object-top transition-transform duration-500
                ${isHovered ? 'scale-105' : 'scale-100'}
              `}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span
                className={`
                  text-4xl sm:text-5xl lg:text-6xl transition-transform duration-300
                  ${isHovered ? 'scale-110' : 'scale-100'}
                `}
                aria-hidden="true"
              >
                👤
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Player Name & Position */}
      <div className="text-center mb-4">
        <div className="text-lg sm:text-xl font-semibold text-white truncate">
          {player.name}
        </div>
        <div className="text-sm text-[var(--pl-text-muted)] uppercase mt-1">
          {positionName}
        </div>
      </div>
      
      {/* Primary Stats (Goals & Assists) with hover animations */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
        <div
          className={`
            bg-[var(--pl-dark)]/50 border border-white/10 rounded-lg p-3 sm:p-4 text-center
            transition-all duration-300
            ${isHovered ? 'border-[var(--pl-green)]/30 bg-[var(--pl-green)]/5' : ''}
          `}
          aria-label={`Goals: ${player.goals}`}
        >
          <div
            className={`
              text-2xl sm:text-3xl mb-1 transition-transform duration-300
              ${isHovered ? 'scale-125' : 'scale-100'}
            `}
            aria-hidden="true"
          >
            ⚽
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-green)] tabular-nums">
            {player.goals}
          </div>
          <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mt-1">
            Goals
          </div>
        </div>
        <div
          className={`
            bg-[var(--pl-dark)]/50 border border-white/10 rounded-lg p-3 sm:p-4 text-center
            transition-all duration-300
            ${isHovered ? 'border-[var(--pl-cyan)]/30 bg-[var(--pl-cyan)]/5' : ''}
          `}
          aria-label={`Assists: ${player.assists}`}
        >
          <div
            className={`
              text-2xl sm:text-3xl mb-1 transition-transform duration-300
              ${isHovered ? 'scale-125' : 'scale-100'}
            `}
            aria-hidden="true"
          >
            🅰️
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-cyan)] tabular-nums">
            {player.assists}
          </div>
          <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mt-1">
            Assists
          </div>
        </div>
      </div>
      
      {/* Secondary Stats (Rating & Appearances) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
        {player.rating !== null && (
          <div className="bg-[var(--pl-dark)]/30 border border-white/5 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-xl font-semibold text-white">
              {player.rating.toFixed(1)}
            </div>
            <div className="text-xs text-[var(--pl-text-muted)] mt-1">
              ⭐ Rating
            </div>
          </div>
        )}
        <div className="bg-[var(--pl-dark)]/30 border border-white/5 rounded-lg p-2 sm:p-3 text-center">
          <div className="text-lg sm:text-xl font-semibold text-white">
            {player.appearances}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)] mt-1">
            📊 Apps
          </div>
        </div>
      </div>
      
      {/* Form Indicator */}
      {Array.isArray(player.form) && player.form.length > 0 && (
        <div className="mt-3 sm:mt-4">
          <div className="flex gap-0.5" role="list" aria-label="Last 5 matches form">
            {player.form.map((result, idx) => (
              <div
                key={idx}
                className={`flex-1 h-2 sm:h-3 rounded ${
                  result === 'W'
                    ? 'bg-[var(--pl-green)]'
                    : result === 'D'
                    ? 'bg-[var(--pl-yellow)]'
                    : 'bg-[var(--pl-pink)]'
                }`}
                title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
                aria-label={`Match ${idx + 1}: ${result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}`}
                role="listitem"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

