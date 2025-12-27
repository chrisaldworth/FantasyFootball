'use client';

import { useMemo } from 'react';

interface Chip {
  name: string;
  event: number;
}

interface ChipUsageTimelineProps {
  chips: Chip[] | null;
  totalGameweeks: number;
}

const CHIP_ICONS: Record<string, string> = {
  'wildcard': '🃏',
  'freehit': '🔄',
  'bboost': '📈',
  '3xc': '👑',
};

const CHIP_COLORS: Record<string, string> = {
  'wildcard': 'var(--pl-purple)',
  'freehit': 'var(--pl-cyan)',
  'bboost': 'var(--pl-green)',
  '3xc': 'var(--pl-pink)',
};

const CHIP_LABELS: Record<string, string> = {
  'wildcard': 'WC',
  'freehit': 'FH',
  'bboost': 'BB',
  '3xc': 'TC',
};

export default function ChipUsageTimeline({ chips, totalGameweeks }: ChipUsageTimelineProps) {
  const timelineData = useMemo(() => {
    if (!chips || chips.length === 0) return [];

    // Create array of all gameweeks with chip usage
    const gameweeks = Array.from({ length: totalGameweeks }, (_, i) => i + 1);
    
    return gameweeks.map((gw) => {
      const chipUsed = chips.find(c => c.event === gw);
      return {
        gameweek: gw,
        chip: chipUsed ? {
          name: chipUsed.name.toLowerCase(),
          event: chipUsed.event,
        } : null,
      };
    });
  }, [chips, totalGameweeks]);

  if (!chips || chips.length === 0) {
    return (
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4">Chip Usage Timeline</h3>
        <div className="h-32 sm:h-40 flex items-center justify-center text-[var(--pl-text-muted)]">
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <div>No chips used yet</div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate spacing for timeline
  const visibleGameweeks = Math.min(totalGameweeks, 20); // Show max 20 gameweeks at once
  const spacing = 100 / visibleGameweeks;

  return (
    <div className="glass rounded-xl p-4 sm:p-6" role="region" aria-label="Chip Usage Timeline">
      <h3 className="text-lg sm:text-xl font-bold mb-4">Chip Usage Timeline</h3>
      <div className="h-32 sm:h-40 relative overflow-x-auto">
        <div className="min-w-full h-full flex items-center relative px-4">
          {/* Timeline line */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-[var(--pl-text-muted)]/30 transform -translate-y-1/2"></div>

          {/* Gameweek markers and chips */}
          {timelineData.slice(0, visibleGameweeks).map((item, index) => {
            const position = (index / (visibleGameweeks - 1)) * 100;
            const hasChip = item.chip !== null;
            const chipName = item.chip?.name || '';
            const chipColor = chipName ? CHIP_COLORS[chipName] || 'var(--pl-text-muted)' : 'transparent';
            const chipIcon = chipName ? CHIP_ICONS[chipName] || '●' : '';
            const chipLabel = chipName ? CHIP_LABELS[chipName] || chipName.toUpperCase() : '';

            return (
              <div
                key={item.gameweek}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${position}%` }}
              >
                {/* Gameweek marker */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-[var(--pl-text-muted)] rounded-full"></div>
                </div>

                {/* Chip marker (if used) */}
                {hasChip && (
                  <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-8 sm:-mt-10 cursor-pointer group"
                    title={`${chipLabel} used in GW ${item.gameweek}`}
                  >
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg transition-transform hover:scale-110"
                      style={{ backgroundColor: chipColor, color: 'white' }}
                    >
                      {chipIcon}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs text-[var(--pl-text-muted)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {chipLabel} - GW{item.gameweek}
                    </div>
                  </div>
                )}

                {/* Gameweek label (show every 5th or at start/end) */}
                {(index === 0 || index === visibleGameweeks - 1 || index % 5 === 0) && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs text-[var(--pl-text-muted)] whitespace-nowrap">
                    GW{item.gameweek}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs">
        {Object.entries(CHIP_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: CHIP_COLORS[key] }}
            ></div>
            <span className="text-[var(--pl-text-muted)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}




