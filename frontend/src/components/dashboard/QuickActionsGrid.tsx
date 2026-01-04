'use client';

import Link from 'next/link';

interface QuickAction {
  icon: string;
  label: string;
  href: string;
  color: 'green' | 'pink' | 'cyan' | 'purple' | 'amber' | 'neutral';
  badge?: string;
  description?: string;
}

interface QuickActionsGridProps {
  hasWeeklyPicks?: boolean;
  hasFplTeam?: boolean;
  hasFavoriteTeam?: boolean;
  weeklyPicksCount?: number;
  predictionAccuracy?: number;
}

export default function QuickActionsGrid({
  hasWeeklyPicks = false,
  hasFplTeam = false,
  hasFavoriteTeam = false,
  weeklyPicksCount = 0,
  predictionAccuracy,
}: QuickActionsGridProps) {
  const getColorClasses = (color: QuickAction['color']) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-[var(--pl-green)]/10',
          border: 'border-[var(--pl-green)]/30',
          hover: 'hover:bg-[var(--pl-green)]/20',
          text: 'text-[var(--pl-green)]',
          iconBg: 'bg-[var(--pl-green)]/20',
        };
      case 'pink':
        return {
          bg: 'bg-[var(--pl-pink)]/10',
          border: 'border-[var(--pl-pink)]/30',
          hover: 'hover:bg-[var(--pl-pink)]/20',
          text: 'text-[var(--pl-pink)]',
          iconBg: 'bg-[var(--pl-pink)]/20',
        };
      case 'cyan':
        return {
          bg: 'bg-[var(--pl-cyan)]/10',
          border: 'border-[var(--pl-cyan)]/30',
          hover: 'hover:bg-[var(--pl-cyan)]/20',
          text: 'text-[var(--pl-cyan)]',
          iconBg: 'bg-[var(--pl-cyan)]/20',
        };
      case 'purple':
        return {
          bg: 'bg-[var(--pl-purple)]/10',
          border: 'border-[var(--pl-purple)]/30',
          hover: 'hover:bg-[var(--pl-purple)]/20',
          text: 'text-[var(--pl-purple)]',
          iconBg: 'bg-[var(--pl-purple)]/20',
        };
      case 'amber':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          hover: 'hover:bg-amber-500/20',
          text: 'text-amber-400',
          iconBg: 'bg-amber-500/20',
        };
      default:
        return {
          bg: 'bg-white/5',
          border: 'border-white/10',
          hover: 'hover:bg-white/10',
          text: 'text-white',
          iconBg: 'bg-white/10',
        };
    }
  };

  const actions: QuickAction[] = [
    {
      icon: '🎯',
      label: 'Weekly Picks',
      href: '/weekly-picks',
      color: 'green',
      badge: !hasWeeklyPicks ? 'Make Picks!' : weeklyPicksCount > 0 ? `${weeklyPicksCount}/6` : undefined,
      description: 'Predict scores & scorers',
    },
    {
      icon: '🔮',
      label: 'AI Predictions',
      href: '/predictions',
      color: 'purple',
      badge: predictionAccuracy ? `${predictionAccuracy}%` : 'NEW',
      description: 'Powered by Poisson & Elo',
    },
    {
      icon: '⚽',
      label: 'My FPL Team',
      href: hasFplTeam ? '/fantasy-football/squad' : '/fantasy-football',
      color: 'cyan',
      badge: !hasFplTeam ? 'Link' : undefined,
      description: hasFplTeam ? 'View your squad' : 'Connect your team',
    },
    {
      icon: '🏟️',
      label: 'Matches',
      href: '/matches',
      color: 'pink',
      description: 'Fixtures & results',
    },
    {
      icon: '📊',
      label: 'Analytics',
      href: '/fantasy-football/analytics',
      color: 'amber',
      description: 'Performance insights',
    },
    {
      icon: '🏆',
      label: 'Leagues',
      href: '/fantasy-football/leagues',
      color: 'neutral',
      description: 'League standings',
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
      {actions.map((action) => {
        const colors = getColorClasses(action.color);
        
        return (
          <Link
            key={action.href}
            href={action.href}
            className={`
              relative flex flex-col items-center justify-center
              p-3 sm:p-4 rounded-xl sm:rounded-2xl
              ${colors.bg} ${colors.border} border ${colors.hover}
              transition-all duration-200 group
              min-h-[90px] sm:min-h-[110px]
            `}
          >
            {/* Badge */}
            {action.badge && (
              <span className={`
                absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2
                px-1.5 sm:px-2 py-0.5 rounded-full
                text-[10px] sm:text-xs font-bold
                ${action.badge === 'NEW' || action.badge === 'Make Picks!' || action.badge === 'Link' 
                  ? 'bg-[var(--pl-pink)] text-white animate-pulse' 
                  : `${colors.iconBg} ${colors.text}`
                }
              `}>
                {action.badge}
              </span>
            )}
            
            {/* Icon */}
            <span className={`
              text-2xl sm:text-3xl mb-1.5 sm:mb-2
              ${colors.iconBg} rounded-lg p-1.5 sm:p-2
              group-hover:scale-110 transition-transform
            `}>
              {action.icon}
            </span>
            
            {/* Label */}
            <span className={`text-xs sm:text-sm font-semibold ${colors.text} text-center leading-tight`}>
              {action.label}
            </span>
            
            {/* Description - hidden on mobile */}
            <span className="hidden sm:block text-[10px] text-[var(--pl-text-muted)] text-center mt-0.5">
              {action.description}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
