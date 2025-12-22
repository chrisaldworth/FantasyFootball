'use client';

interface PickProgressIndicatorProps {
  scorePredictions: number; // 0-3
  playerPicks: number; // 0-3
  total: number; // 0-6
}

export default function PickProgressIndicator({
  scorePredictions,
  playerPicks,
  total,
}: PickProgressIndicatorProps) {
  const percentage = (total / 6) * 100;

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--pl-text-muted)]">
            Progress: {total}/6 picks made
          </span>
          <span className="text-sm font-bold text-[var(--pl-green)]">
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="w-full h-2 bg-[var(--pl-card)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--pl-green)] to-[var(--pl-cyan)] transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {scorePredictions === 3 ? (
            <svg className="w-5 h-5 text-[var(--pl-green)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-[var(--pl-text-muted)]" />
          )}
          <span className="text-sm">
            Score Predictions ({scorePredictions}/3)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {playerPicks === 3 ? (
            <svg className="w-5 h-5 text-[var(--pl-green)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-[var(--pl-text-muted)]" />
          )}
          <span className="text-sm">
            Player Picks ({playerPicks}/3)
          </span>
        </div>
      </div>
    </div>
  );
}

