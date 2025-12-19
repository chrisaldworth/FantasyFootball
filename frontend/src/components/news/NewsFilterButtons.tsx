'use client';

interface NewsFilterButtonsProps {
  activeFilter: 'all' | 'team' | 'players';
  onFilterChange: (filter: 'all' | 'team' | 'players') => void;
}

export default function NewsFilterButtons({
  activeFilter,
  onFilterChange,
}: NewsFilterButtonsProps) {
  const filters: Array<{ key: 'all' | 'team' | 'players'; label: string }> = [
    { key: 'all', label: 'All News' },
    { key: 'team', label: 'Team' },
    { key: 'players', label: 'Players' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)] ${
            activeFilter === filter.key
              ? 'bg-[var(--team-primary)] text-white'
              : 'bg-transparent border border-white/10 text-[var(--pl-text-muted)] hover:border-white/20'
          }`}
          aria-pressed={activeFilter === filter.key}
          aria-label={`Filter by ${filter.label}`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

