'use client';

interface ShowMoreButtonProps {
  showAll: boolean;
  remainingCount: number;
  onToggle: () => void;
}

export default function ShowMoreButton({ showAll, remainingCount, onToggle }: ShowMoreButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full py-3 rounded-lg border border-white/10 hover:bg-[var(--pl-card-hover)] transition-all text-sm font-medium text-white touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]"
      aria-expanded={showAll}
      aria-label={showAll ? 'Show less news' : `Show ${remainingCount} more news items`}
    >
      {showAll ? (
        <span className="flex items-center justify-center gap-2">
          <span>Show Less</span>
          <span className="text-lg">▲</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <span>Show More</span>
          <span className="text-[var(--pl-text-muted)]">({remainingCount} more)</span>
          <span className="text-lg">▼</span>
        </span>
      )}
    </button>
  );
}

