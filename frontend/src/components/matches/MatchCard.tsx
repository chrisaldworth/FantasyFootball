'use client';

import Link from 'next/link';

interface MatchCardProps {
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamId?: number | null;
    awayTeamId?: number | null;
    homeScore?: number | null;
    awayScore?: number | null;
    date: string;
    time?: string;
    status: 'scheduled' | 'live' | 'finished' | 'postponed';
    venue?: string;
    minute?: number;
    competition?: string;
    matchday?: number;
  };
  isFavoriteTeamMatch?: boolean;
  onViewDetails?: () => void;
  showPrediction?: boolean;
}

export default function MatchCard({
  match,
  isFavoriteTeamMatch = false,
  onViewDetails,
  showPrediction = false,
}: MatchCardProps) {
  const getTeamLogo = (teamId: number | null | undefined) => {
    if (!teamId) return null;
    return `https://resources.premierleague.com/premierleague/badges/70/t${teamId}.png`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Check if today
      if (date.toDateString() === now.toDateString()) {
        return 'Today';
      }
      // Check if tomorrow
      if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      }
      
      return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const getStatusColor = () => {
    switch (match.status) {
      case 'live':
        return 'bg-red-500 text-white';
      case 'finished':
        return 'bg-[var(--pl-text-muted)]/20 text-[var(--pl-text-muted)]';
      case 'postponed':
        return 'bg-amber-500/20 text-amber-400';
      default:
        return 'bg-[var(--pl-green)]/20 text-[var(--pl-green)]';
    }
  };

  const getStatusText = () => {
    switch (match.status) {
      case 'live':
        return match.minute ? `${match.minute}'` : 'LIVE';
      case 'finished':
        return 'FT';
      case 'postponed':
        return 'PP';
      default:
        return formatTime(match.date);
    }
  };

  return (
    <div
      onClick={onViewDetails}
      className={`
        relative overflow-hidden rounded-xl transition-all cursor-pointer
        ${isFavoriteTeamMatch 
          ? 'bg-gradient-to-r from-[var(--pl-green)]/10 via-transparent to-[var(--pl-green)]/10 border border-[var(--pl-green)]/30' 
          : 'glass hover:bg-white/5'
        }
        ${match.status === 'live' ? 'ring-2 ring-red-500/50' : ''}
      `}
    >
      {/* Favorite team indicator */}
      {isFavoriteTeamMatch && (
        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--pl-green)]" />
      )}

      {/* Live indicator pulse */}
      {match.status === 'live' && (
        <div className="absolute top-2 right-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      )}

      <div className="p-3 sm:p-4">
        {/* Date & Competition Row */}
        <div className="flex items-center justify-between mb-3 text-xs text-[var(--pl-text-muted)]">
          <div className="flex items-center gap-2">
            <span>{formatDate(match.date)}</span>
            {match.matchday && <span>• GW {match.matchday}</span>}
          </div>
          {match.venue && (
            <span className="hidden sm:inline truncate max-w-[150px]">{match.venue}</span>
          )}
        </div>

        {/* Main Match Content */}
        <div className="flex items-center justify-between gap-2">
          {/* Home Team */}
          <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
            {match.homeTeamId ? (
              <img
                src={getTeamLogo(match.homeTeamId)!}
                alt={match.homeTeam}
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {match.homeTeam.substring(0, 3).toUpperCase()}
              </div>
            )}
            <span className={`font-semibold text-sm sm:text-base truncate ${
              match.status === 'finished' && match.homeScore !== null && match.awayScore !== null && match.homeScore > match.awayScore
                ? 'text-[var(--pl-green)]'
                : ''
            }`}>
              {match.homeTeam}
            </span>
          </div>

          {/* Score / Time */}
          <div className="flex flex-col items-center px-2 sm:px-4 flex-shrink-0">
            {match.status === 'finished' || match.status === 'live' ? (
              <>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className={`text-xl sm:text-2xl font-black ${
                    match.homeScore !== null && match.awayScore !== null && match.homeScore > match.awayScore
                      ? 'text-[var(--pl-green)]'
                      : ''
                  }`}>
                    {match.homeScore ?? '-'}
                  </span>
                  <span className="text-[var(--pl-text-muted)]">-</span>
                  <span className={`text-xl sm:text-2xl font-black ${
                    match.homeScore !== null && match.awayScore !== null && match.awayScore > match.homeScore
                      ? 'text-[var(--pl-green)]'
                      : ''
                  }`}>
                    {match.awayScore ?? '-'}
                  </span>
                </div>
                <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </>
            ) : (
              <>
                <span className={`text-sm sm:text-base font-bold px-3 py-1 rounded ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
                {match.status === 'scheduled' && (
                  <span className="text-[10px] text-[var(--pl-text-muted)] mt-1">
                    {formatDate(match.date)}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3 min-w-0">
            <span className={`font-semibold text-sm sm:text-base truncate text-right ${
              match.status === 'finished' && match.homeScore !== null && match.awayScore !== null && match.awayScore > match.homeScore
                ? 'text-[var(--pl-green)]'
                : ''
            }`}>
              {match.awayTeam}
            </span>
            {match.awayTeamId ? (
              <img
                src={getTeamLogo(match.awayTeamId)!}
                alt={match.awayTeam}
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {match.awayTeam.substring(0, 3).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Row */}
        {showPrediction && match.status === 'scheduled' && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center">
            <Link
              href={`/predictions?fixture=${match.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-[var(--pl-purple)] hover:text-[var(--pl-purple)]/80 font-medium flex items-center gap-1"
            >
              🔮 View AI Prediction
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
