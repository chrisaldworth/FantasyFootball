'use client';

import Link from 'next/link';

interface InjuredPlayer {
  id: number;
  name: string;
  team: string;
  injuryStatus: string;
  chanceOfPlaying: number | null;
}

interface FPLInjuryAlertsProps {
  injuredPlayers: InjuredPlayer[];
}

export default function FPLInjuryAlerts({ injuredPlayers }: FPLInjuryAlertsProps) {
  if (injuredPlayers.length === 0) {
    return null;
  }

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl" aria-hidden="true">⚽</span>
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          FPL Squad Injury Concerns
        </h3>
      </div>

      <div className="space-y-3">
        {injuredPlayers.map((player) => (
          <Link
            key={player.id}
            href="/fantasy-football/transfers"
            className="block p-3 rounded-lg border-2 border-[var(--pl-pink)] bg-[var(--pl-pink)]/10 hover:bg-[var(--pl-pink)]/20 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0" aria-hidden="true">🏥</span>
              <div className="flex-1">
                <div className="font-semibold text-white">{player.name}</div>
                <div className="text-sm text-[var(--pl-text-muted)]">
                  {player.team}
                  {player.chanceOfPlaying !== null && (
                    <span> - {player.chanceOfPlaying}% chance</span>
                  )}
                </div>
                <div className="mt-2 text-xs text-[var(--pl-green)] hover:underline inline-flex items-center gap-1">
                  View Transfer Options
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

