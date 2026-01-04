'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface HeroBannerProps {
  // Match countdown props
  nextMatchDate?: Date | string | null;
  homeTeamName?: string | null;
  awayTeamName?: string | null;
  homeTeamId?: number | null;
  awayTeamId?: number | null;
  // FPL props
  fplTeamId?: number | null;
  livePoints?: number;
  liveRank?: number;
  isLive?: boolean;
  currentGameweek?: number;
  // Weekly picks props
  hasWeeklyPicks?: boolean;
  weeklyPicksDeadline?: Date | null;
  // Favorite team props
  favoriteTeamName?: string | null;
  lastMatchResult?: { home: string; away: string; homeScore: number; awayScore: number; } | null;
}

export default function HeroBanner({
  nextMatchDate,
  homeTeamName,
  awayTeamName,
  homeTeamId,
  awayTeamId,
  fplTeamId,
  livePoints,
  liveRank,
  isLive,
  currentGameweek,
  hasWeeklyPicks,
  weeklyPicksDeadline,
  favoriteTeamName,
  lastMatchResult,
}: HeroBannerProps) {
  const [timeToMatch, setTimeToMatch] = useState<{ days: number; hours: number; mins: number; secs: number } | null>(null);
  const [timeToDeadline, setTimeToDeadline] = useState<{ days: number; hours: number; mins: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Calculate time until match
  useEffect(() => {
    if (!nextMatchDate) return;

    const calculateTime = () => {
      const now = new Date();
      const matchDate = new Date(nextMatchDate);
      const diff = matchDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeToMatch(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeToMatch({ days, hours, mins, secs });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [nextMatchDate]);

  // Calculate time until deadline
  useEffect(() => {
    if (!weeklyPicksDeadline) return;

    const calculateTime = () => {
      const now = new Date();
      const diff = weeklyPicksDeadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeToDeadline(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeToDeadline({ days, hours, mins });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [weeklyPicksDeadline]);

  // Update current time for live indicator
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  // Determine which banner to show based on context
  const getBannerContent = () => {
    // Priority 1: Live FPL gameweek
    if (isLive && livePoints !== undefined && currentGameweek) {
      return {
        type: 'live',
        gradient: 'from-[#00ff87] via-[#00d9ff] to-[#00ff87]',
        bgPattern: 'radial-gradient(circle at 20% 80%, rgba(0,255,135,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,217,255,0.2) 0%, transparent 50%)',
      };
    }

    // Priority 2: Upcoming match (within 24 hours)
    if (timeToMatch && timeToMatch.days === 0 && homeTeamName && awayTeamName) {
      return {
        type: 'matchday',
        gradient: 'from-[#ff2882] via-[#9333ea] to-[#ff2882]',
        bgPattern: 'radial-gradient(circle at 30% 70%, rgba(255,40,130,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(147,51,234,0.3) 0%, transparent 50%)',
      };
    }

    // Priority 3: Weekly picks deadline approaching (within 48 hours)
    if (timeToDeadline && !hasWeeklyPicks && timeToDeadline.days < 2) {
      return {
        type: 'picks-deadline',
        gradient: 'from-[#f59e0b] via-[#ef4444] to-[#f59e0b]',
        bgPattern: 'radial-gradient(circle at 25% 75%, rgba(245,158,11,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(239,68,68,0.3) 0%, transparent 50%)',
      };
    }

    // Priority 4: Show next match countdown
    if (timeToMatch && homeTeamName && awayTeamName) {
      return {
        type: 'countdown',
        gradient: 'from-[#3b0764] via-[#1e1b4b] to-[#3b0764]',
        bgPattern: 'radial-gradient(circle at 20% 80%, rgba(59,7,100,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(30,27,75,0.5) 0%, transparent 50%)',
      };
    }

    // Default: Welcome banner
    return {
      type: 'welcome',
      gradient: 'from-[#00ff87]/20 via-transparent to-[#04f5ff]/20',
      bgPattern: 'radial-gradient(circle at 50% 50%, rgba(0,255,135,0.1) 0%, transparent 50%)',
    };
  };

  const bannerConfig = getBannerContent();

  const getTeamLogo = (teamId: number | null) => {
    if (!teamId) return null;
    return `https://resources.premierleague.com/premierleague/badges/70/t${teamId}.png`;
  };

  return (
    <div 
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
      style={{ background: bannerConfig.bgPattern }}
    >
      {/* Animated gradient background */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r ${bannerConfig.gradient} opacity-30 animate-pulse`}
        style={{ animationDuration: '3s' }}
      />
      
      {/* Geometric patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 border border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 border border-white/20 rounded-full translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rotate-45" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Live FPL Banner */}
        {bannerConfig.type === 'live' && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm font-semibold text-red-400 uppercase tracking-wider">Live Gameweek {currentGameweek}</span>
            </div>
            <div className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-2">
              {livePoints} <span className="text-2xl sm:text-3xl text-[var(--pl-text-muted)]">pts</span>
            </div>
            {liveRank && (
              <div className="text-lg sm:text-xl text-[var(--pl-green)]">
                #{liveRank.toLocaleString()} overall
              </div>
            )}
            <Link 
              href="/fantasy-football"
              className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all font-semibold"
            >
              View Live Updates →
            </Link>
          </div>
        )}

        {/* Matchday Banner */}
        {bannerConfig.type === 'matchday' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--pl-pink)]/20 border border-[var(--pl-pink)]/30 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--pl-pink)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--pl-pink)]"></span>
              </span>
              <span className="text-xs font-bold text-[var(--pl-pink)] uppercase tracking-wider">Match Day</span>
            </div>
            
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
              {/* Home Team */}
              <div className="text-center">
                {homeTeamId && (
                  <img 
                    src={getTeamLogo(homeTeamId)!} 
                    alt={homeTeamName || ''} 
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2"
                  />
                )}
                <div className="text-sm sm:text-lg font-bold text-white">{homeTeamName}</div>
              </div>
              
              {/* VS / Time */}
              <div className="text-center px-4">
                <div className="text-3xl sm:text-4xl font-black text-white/80 mb-1">VS</div>
                {timeToMatch && (
                  <div className="text-xl sm:text-2xl font-bold text-[var(--pl-green)]">
                    {timeToMatch.hours.toString().padStart(2, '0')}:{timeToMatch.mins.toString().padStart(2, '0')}:{timeToMatch.secs.toString().padStart(2, '0')}
                  </div>
                )}
              </div>
              
              {/* Away Team */}
              <div className="text-center">
                {awayTeamId && (
                  <img 
                    src={getTeamLogo(awayTeamId)!} 
                    alt={awayTeamName || ''} 
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2"
                  />
                )}
                <div className="text-sm sm:text-lg font-bold text-white">{awayTeamName}</div>
              </div>
            </div>

            <Link 
              href="/predictions"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--pl-pink)] text-white hover:bg-[var(--pl-pink)]/80 transition-all font-bold"
            >
              🔮 View AI Prediction
            </Link>
          </div>
        )}

        {/* Picks Deadline Banner */}
        {bannerConfig.type === 'picks-deadline' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 mb-3">
              <span className="text-lg">⚠️</span>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Deadline Approaching</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3">
              Make Your Weekly Picks!
            </h2>
            
            {timeToDeadline && (
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-amber-400">{timeToDeadline.days}</div>
                  <div className="text-xs text-[var(--pl-text-muted)]">days</div>
                </div>
                <div className="text-2xl text-white/50">:</div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-amber-400">{timeToDeadline.hours}</div>
                  <div className="text-xs text-[var(--pl-text-muted)]">hours</div>
                </div>
                <div className="text-2xl text-white/50">:</div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-amber-400">{timeToDeadline.mins}</div>
                  <div className="text-xs text-[var(--pl-text-muted)]">mins</div>
                </div>
              </div>
            )}

            <Link 
              href="/weekly-picks/make-picks"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all font-bold text-lg shadow-lg shadow-amber-500/25"
            >
              🎯 Make Picks Now
            </Link>
          </div>
        )}

        {/* Countdown Banner (default) */}
        {bannerConfig.type === 'countdown' && (
          <div className="text-center">
            <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] uppercase tracking-wider mb-2">
              {favoriteTeamName ? `${favoriteTeamName}'s` : 'Your Team\'s'} Next Match
            </div>
            
            <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4">
              {/* Home Team */}
              <div className="text-center flex-1 max-w-[120px]">
                {homeTeamId && (
                  <img 
                    src={getTeamLogo(homeTeamId)!} 
                    alt={homeTeamName || ''} 
                    className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-1"
                  />
                )}
                <div className="text-xs sm:text-sm font-semibold text-white truncate">{homeTeamName}</div>
              </div>
              
              {/* Countdown */}
              <div className="flex gap-1 sm:gap-2">
                {timeToMatch && timeToMatch.days > 0 && (
                  <div className="text-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-white/10">
                    <div className="text-lg sm:text-2xl font-black text-white">{timeToMatch.days}</div>
                    <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)]">days</div>
                  </div>
                )}
                <div className="text-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-white/10">
                  <div className="text-lg sm:text-2xl font-black text-white">{timeToMatch?.hours.toString().padStart(2, '0')}</div>
                  <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)]">hrs</div>
                </div>
                <div className="text-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-white/10">
                  <div className="text-lg sm:text-2xl font-black text-white">{timeToMatch?.mins.toString().padStart(2, '0')}</div>
                  <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)]">mins</div>
                </div>
              </div>
              
              {/* Away Team */}
              <div className="text-center flex-1 max-w-[120px]">
                {awayTeamId && (
                  <img 
                    src={getTeamLogo(awayTeamId)!} 
                    alt={awayTeamName || ''} 
                    className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-1"
                  />
                )}
                <div className="text-xs sm:text-sm font-semibold text-white truncate">{awayTeamName}</div>
              </div>
            </div>

            <Link 
              href="/predictions"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--pl-green)]/20 border border-[var(--pl-green)]/30 text-[var(--pl-green)] hover:bg-[var(--pl-green)]/30 transition-all font-semibold text-sm"
            >
              🔮 See AI Prediction
            </Link>
          </div>
        )}

        {/* Welcome Banner (fallback) */}
        {bannerConfig.type === 'welcome' && (
          <div className="text-center py-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2">
              Welcome Back! 👋
            </h1>
            <p className="text-sm sm:text-base text-[var(--pl-text-muted)] mb-4">
              {favoriteTeamName ? `Supporting ${favoriteTeamName}` : 'Set up your favorite team to get started'}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link 
                href="/weekly-picks"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--pl-green)] text-white hover:bg-[var(--pl-green)]/80 transition-all font-semibold text-sm"
              >
                🎯 Weekly Picks
              </Link>
              <Link 
                href="/predictions"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all font-semibold text-sm"
              >
                🔮 AI Predictions
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
