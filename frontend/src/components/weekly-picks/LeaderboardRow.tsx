'use client';

interface LeaderboardRowProps {
  rank: number;
  user: {
    name: string;
    avatar?: string;
  };
  points: number;
  movement?: number; // Positive = up, negative = down
  isCurrentUser?: boolean;
}

export default function LeaderboardRow({
  rank,
  user,
  points,
  movement,
  isCurrentUser = false,
}: LeaderboardRowProps) {
  const getRankColor = () => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-[var(--pl-text-muted)]';
  };

  const getMovementColor = () => {
    if (!movement) return 'text-[var(--pl-text-muted)]';
    return movement > 0 ? 'text-[var(--pl-green)]' : 'text-[var(--pl-pink)]';
  };

  const formatMovement = () => {
    if (!movement) return null;
    if (movement > 0) return `↑${Math.abs(movement)}`;
    if (movement < 0) return `↓${Math.abs(movement)}`;
    return '—';
  };

  return (
    <div
      className={`
        flex items-center gap-4 p-4 rounded-lg transition-all
        ${isCurrentUser ? 'bg-[var(--pl-green)]/10 border-2 border-[var(--pl-green)]/50' : 'bg-[var(--pl-card)]/50 border border-white/10'}
        ${!isCurrentUser && 'hover:bg-[var(--pl-card-hover)]'}
      `}
    >
      {/* Rank */}
      <div className={`text-xl font-bold ${getRankColor()}`}>
        #{rank}
      </div>

      {/* Avatar */}
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--pl-green)] to-[var(--pl-cyan)] flex items-center justify-center text-white font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* User Name */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white truncate">
          {user.name}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-[var(--pl-green)]">(You)</span>
          )}
        </div>
      </div>

      {/* Points */}
      <div className="text-lg font-bold text-gradient-primary">
        {points} pts
      </div>

      {/* Movement */}
      {movement !== undefined && (
        <div className={`text-sm font-medium ${getMovementColor()}`}>
          {formatMovement()}
        </div>
      )}
    </div>
  );
}

