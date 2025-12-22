'use client';

import { useState } from 'react';

interface PointsBreakdownCardProps {
  type: 'score' | 'player';
  homeTeam?: string;
  awayTeam?: string;
  prediction?: {
    home: number;
    away: number;
  };
  actual?: {
    home: number;
    away: number;
  };
  player?: {
    name: string;
    photo?: string;
    fplPoints: number;
  };
  points: number;
  breakdown?: {
    homeGoals: number;
    awayGoals: number;
    result: number;
    exactScore: number;
  };
}

export default function PointsBreakdownCard({
  type,
  homeTeam,
  awayTeam,
  prediction,
  actual,
  player,
  points,
  breakdown,
}: PointsBreakdownCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCorrect = type === 'score'
    ? prediction && actual && prediction.home === actual.home && prediction.away === actual.away
    : player && player.fplPoints > 0;

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      {type === 'score' && homeTeam && awayTeam && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-lg mb-1">
                {homeTeam} vs {awayTeam}
              </div>
              <div className="text-sm text-[var(--pl-text-muted)]">
                Predicted: {prediction?.home || 0}-{prediction?.away || 0}
              </div>
              <div className="text-sm text-[var(--pl-text-muted)]">
                Actual: {actual?.home || 0}-{actual?.away || 0}
                {isCorrect && (
                  <span className="ml-2 text-[var(--pl-green)]">✓</span>
                )}
              </div>
            </div>
            <div className="text-2xl font-bold text-gradient-primary">
              {points} pts
            </div>
          </div>

          {breakdown && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-[var(--pl-green)] hover:underline mb-2"
              >
                {isExpanded ? 'Hide' : 'Show'} breakdown
              </button>
              {isExpanded && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span>Home goals:</span>
                    <span className="font-semibold">{breakdown.homeGoals} pts</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Away goals:</span>
                    <span className="font-semibold">{breakdown.awayGoals} pts</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Result:</span>
                    <span className="font-semibold">{breakdown.result} pts</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Exact score:</span>
                    <span className="font-semibold text-[var(--pl-green)]">{breakdown.exactScore} pts</span>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {type === 'player' && player && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {player.photo && (
              <img
                src={player.photo}
                alt={player.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <div className="font-semibold">{player.name}</div>
              <div className="text-sm text-[var(--pl-text-muted)]">
                FPL Points: {player.fplPoints}
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold text-gradient-primary">
            {points} pts
          </div>
        </div>
      )}
    </div>
  );
}

