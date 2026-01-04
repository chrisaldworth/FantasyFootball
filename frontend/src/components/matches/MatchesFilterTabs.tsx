'use client';

interface MatchesFilterTabsProps {
  activeTab: 'all' | 'live' | 'upcoming' | 'results';
  onTabChange: (tab: 'all' | 'live' | 'upcoming' | 'results') => void;
  counts: {
    all: number;
    live: number;
    upcoming: number;
    results: number;
  };
  // Quick filters
  showMyTeamOnly?: boolean;
  onMyTeamToggle?: (value: boolean) => void;
  hasMyTeam?: boolean;
}

export default function MatchesFilterTabs({
  activeTab,
  onTabChange,
  counts,
  showMyTeamOnly = false,
  onMyTeamToggle,
  hasMyTeam = false,
}: MatchesFilterTabsProps) {
  const tabs = [
    { 
      id: 'all' as const, 
      label: 'All', 
      count: counts.all,
      color: 'text-white',
      activeColor: 'bg-white/10',
    },
    { 
      id: 'live' as const, 
      label: 'Live', 
      count: counts.live,
      color: 'text-red-400',
      activeColor: 'bg-red-500/20',
      pulse: counts.live > 0,
    },
    { 
      id: 'upcoming' as const, 
      label: 'Upcoming', 
      count: counts.upcoming,
      color: 'text-[var(--pl-green)]',
      activeColor: 'bg-[var(--pl-green)]/20',
    },
    { 
      id: 'results' as const, 
      label: 'Results', 
      count: counts.results,
      color: 'text-[var(--pl-text-muted)]',
      activeColor: 'bg-white/5',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Main Tabs */}
      <div className="flex gap-1 sm:gap-2 p-1 rounded-xl bg-white/5 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg
              font-medium text-xs sm:text-sm whitespace-nowrap
              transition-all duration-200
              ${activeTab === tab.id 
                ? `${tab.activeColor} ${tab.color}` 
                : 'text-[var(--pl-text-muted)] hover:text-white hover:bg-white/5'
              }
            `}
          >
            {/* Live pulse indicator */}
            {tab.pulse && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
            
            <span>{tab.label}</span>
            
            {tab.count > 0 && (
              <span className={`
                px-1.5 py-0.5 rounded-full text-[10px] font-bold
                ${activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'}
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Quick Filters Row */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
        {/* My Team Filter */}
        {hasMyTeam && onMyTeamToggle && (
          <button
            onClick={() => onMyTeamToggle(!showMyTeamOnly)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              transition-all whitespace-nowrap
              ${showMyTeamOnly 
                ? 'bg-[var(--pl-green)] text-white' 
                : 'bg-white/5 text-[var(--pl-text-muted)] hover:bg-white/10'
              }
            `}
          >
            <span>⭐</span>
            <span>My Team</span>
          </button>
        )}

        {/* Today Filter */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-[var(--pl-text-muted)] hover:bg-white/10 transition-all whitespace-nowrap"
        >
          <span>📅</span>
          <span>Today</span>
        </button>

        {/* This Week Filter */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-[var(--pl-text-muted)] hover:bg-white/10 transition-all whitespace-nowrap"
        >
          <span>📆</span>
          <span>This Week</span>
        </button>

        {/* Weekend Filter */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-[var(--pl-text-muted)] hover:bg-white/10 transition-all whitespace-nowrap"
        >
          <span>🏟️</span>
          <span>Weekend</span>
        </button>
      </div>
    </div>
  );
}
