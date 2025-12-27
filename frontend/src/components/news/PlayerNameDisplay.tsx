'use client';

interface PlayerNameDisplayProps {
  playerName: string;
  teamName?: string; // Optional
  showTeam?: boolean; // Default: true
}

export default function PlayerNameDisplay({
  playerName,
  teamName,
  showTeam = true,
}: PlayerNameDisplayProps) {
  return (
    <div className="mb-2">
      <span className="text-sm sm:text-base font-semibold text-[#00ff87]">
        {playerName}
      </span>
      {showTeam && teamName && (
        <span className="text-xs text-[var(--pl-text-muted)] ml-1">
          ({teamName})
        </span>
      )}
    </div>
  );
}




