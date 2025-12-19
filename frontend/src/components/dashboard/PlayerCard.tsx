'use client';

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
  
  return (
    <div
      className={`relative glass rounded-xl p-4 sm:p-6 ${cardStyles[rank]} transition-all hover:bg-[var(--pl-card-hover)] ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
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
      {/* Ranking Badge */}
      <div className={`absolute top-2 left-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full ${rankColors[rank]} flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg z-10`}>
        #{rank}
      </div>
      
      {/* Performance Badges */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        {isTopScorer && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--pl-green)]/80 border-2 border-white/20 flex items-center justify-center text-lg sm:text-xl shadow-md" title="Top Scorer" aria-label="Top Scorer">
            ⚽
          </div>
        )}
        {isTopAssister && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--pl-cyan)]/80 border-2 border-white/20 flex items-center justify-center text-lg sm:text-xl shadow-md" title="Top Assister" aria-label="Top Assister">
            🅰️
          </div>
        )}
        {hasHighRating && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--pl-yellow)]/80 border-2 border-white/20 flex items-center justify-center text-lg sm:text-xl shadow-md" title="High Rating" aria-label="High Rating">
            ⭐
          </div>
        )}
      </div>
      
      {/* Player Photo */}
      <div className="flex justify-center mb-4">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full border-2 border-white/20 shadow-lg overflow-hidden bg-[var(--pl-dark)]">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={player.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl sm:text-5xl lg:text-6xl" aria-hidden="true">👤</span>
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
      
      {/* Primary Stats (Goals & Assists) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
        <div className="bg-[var(--pl-dark)]/50 border border-white/10 rounded-lg p-3 sm:p-4 text-center" aria-label={`Goals: ${player.goals}`}>
          <div className="text-2xl sm:text-3xl mb-1" aria-hidden="true">⚽</div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-green)]">
            {player.goals}
          </div>
          <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mt-1">
            Goals
          </div>
        </div>
        <div className="bg-[var(--pl-dark)]/50 border border-white/10 rounded-lg p-3 sm:p-4 text-center" aria-label={`Assists: ${player.assists}`}>
          <div className="text-2xl sm:text-3xl mb-1" aria-hidden="true">🅰️</div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-cyan)]">
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

