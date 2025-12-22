'use client';

import { useState } from 'react';

interface ScorePredictionInputProps {
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore: number;
  awayScore: number;
  onChange: (home: number, away: number) => void;
  disabled?: boolean;
}

export default function ScorePredictionInput({
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  homeScore,
  awayScore,
  onChange,
  disabled = false,
}: ScorePredictionInputProps) {
  const [home, setHome] = useState(homeScore);
  const [away, setAway] = useState(awayScore);

  const handleHomeChange = (value: number) => {
    if (value >= 0 && value <= 10) {
      setHome(value);
      onChange(value, away);
    }
  };

  const handleAwayChange = (value: number) => {
    if (value >= 0 && value <= 10) {
      setAway(value);
      onChange(home, value);
    }
  };

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {homeLogo && (
            <img src={homeLogo} alt={homeTeam} className="w-12 h-12 object-contain" />
          )}
          <span className="text-sm font-medium text-center">{homeTeam}</span>
          <input
            type="number"
            min="0"
            max="10"
            value={home}
            onChange={(e) => handleHomeChange(parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="w-16 h-16 text-center text-2xl font-bold rounded-lg border-2 border-[var(--pl-green)]/30 bg-[var(--pl-dark)]/50 focus:border-[var(--pl-green)] focus:outline-none text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Separator */}
        <div className="text-2xl font-bold text-[var(--pl-text-muted)]">-</div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {awayLogo && (
            <img src={awayLogo} alt={awayTeam} className="w-12 h-12 object-contain" />
          )}
          <span className="text-sm font-medium text-center">{awayTeam}</span>
          <input
            type="number"
            min="0"
            max="10"
            value={away}
            onChange={(e) => handleAwayChange(parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="w-16 h-16 text-center text-2xl font-bold rounded-lg border-2 border-[var(--pl-green)]/30 bg-[var(--pl-dark)]/50 focus:border-[var(--pl-green)] focus:outline-none text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}

