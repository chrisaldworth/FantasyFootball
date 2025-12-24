'use client';

interface PlayerSelectionCardProps {
  player: {
    id: number;
    name: string;
    photo?: string;
    team: string;
    teamId: number;
    position: string;
    form?: number;
    totalPoints?: number;
  };
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onDeselect: () => void;
}

export default function PlayerSelectionCard({
  player,
  selected,
  disabled = false,
  onSelect,
  onDeselect,
}: PlayerSelectionCardProps) {
  const handleClick = () => {
    if (disabled) return;
    if (selected) {
      onDeselect();
    } else {
      onSelect();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        glass rounded-xl p-4 w-full text-left transition-all
        ${selected ? 'border-2 border-[var(--pl-green)] bg-[var(--pl-green)]/10' : 'border border-white/10'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:border-[var(--pl-green)]/50 cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]
      `}
    >
      <div className="flex items-center gap-4">
        {/* Player Photo */}
        {player.photo ? (
          <img
            src={player.photo}
            alt={player.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[var(--pl-card)] flex items-center justify-center">
            <span className="text-xl">⚽</span>
          </div>
        )}

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">{player.name}</div>
          <div className="text-sm text-[var(--pl-text-muted)]">
            {player.team} • {player.position}
          </div>
          <div className="flex items-center gap-3 mt-1">
            {player.totalPoints !== undefined && (
              <div className="text-xs font-semibold text-[var(--pl-cyan)]">
                {player.totalPoints} pts
              </div>
            )}
            {player.form && (
              <div className="text-xs text-[var(--pl-green)]">
                Form: {player.form}
              </div>
            )}
          </div>
        </div>

        {/* Selection Indicator */}
        {selected && (
          <div className="w-6 h-6 rounded-full bg-[var(--pl-green)] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {disabled && !selected && (
          <div className="text-xs text-[var(--pl-pink)]">
            Team already selected
          </div>
        )}
      </div>
    </button>
  );
}

