'use client';

import Link from 'next/link';

interface QuickRecommendationsProps {
  transferRecommendation?: {
    playerIn: { id: number; name: string };
    playerOut: { id: number; name: string };
    reason: string;
  };
  captainRecommendation?: {
    player: { id: number; name: string };
    reason: string;
  };
}

export default function QuickRecommendations({
  transferRecommendation,
  captainRecommendation,
}: QuickRecommendationsProps) {
  if (!transferRecommendation && !captainRecommendation) {
    return null;
  }

  return (
    <div className="glass rounded-xl p-1.5 sm:p-6">
      <div className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-4">
        <span className="text-base sm:text-2xl" aria-hidden="true">💡</span>
        <h3 className="text-xs sm:text-xl font-semibold text-white">
          Quick Recommendations
        </h3>
      </div>

      <div className="space-y-1.5 sm:space-y-4">
        {transferRecommendation && (
          <div className="p-2 sm:p-4 rounded-lg border-2 border-[var(--pl-green)] bg-[var(--pl-green)]/10">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <span className="text-base sm:text-xl" aria-hidden="true">🔄</span>
              <h4 className="text-sm sm:text-base font-semibold text-white">Transfer Recommendation</h4>
            </div>
            <div className="space-y-0.5 sm:space-y-1 mb-2 sm:mb-3">
              <div className="text-xs sm:text-sm">
                <span className="text-[var(--pl-text-muted)]">Transfer In: </span>
                <span className="font-semibold text-white">{transferRecommendation.playerIn.name}</span>
              </div>
              <div className="text-sm">
                <span className="text-[var(--pl-text-muted)]">Transfer Out: </span>
                <span className="font-semibold text-white">{transferRecommendation.playerOut.name}</span>
              </div>
              <div className="text-sm text-[var(--pl-text-muted)]">
                {transferRecommendation.reason}
              </div>
            </div>
            <Link
              href="/fantasy-football/transfers"
              className="inline-flex items-center gap-1 text-sm text-[var(--pl-green)] hover:underline"
            >
              Make Transfer
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {captainRecommendation && (
          <div className="p-2 sm:p-4 rounded-lg border-2 border-[var(--pl-green)] bg-[var(--pl-green)]/10">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <span className="text-base sm:text-xl" aria-hidden="true">👑</span>
              <h4 className="text-sm sm:text-base font-semibold text-white">Captain Recommendation</h4>
            </div>
            <div className="space-y-0.5 sm:space-y-1 mb-2 sm:mb-3">
              <div className="text-xs sm:text-sm">
                <span className="text-[var(--pl-text-muted)]">Captain: </span>
                <span className="font-semibold text-white">{captainRecommendation.player.name}</span>
              </div>
              <div className="text-sm text-[var(--pl-text-muted)]">
                {captainRecommendation.reason}
              </div>
            </div>
            <Link
              href="/fantasy-football/captain"
              className="inline-flex items-center gap-1 text-sm text-[var(--pl-green)] hover:underline"
            >
              Set Captain
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

