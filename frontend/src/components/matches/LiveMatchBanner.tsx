'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: number;
  awayTeamId?: number;
  homeScore: number;
  awayScore: number;
  minute: number;
  venue?: string;
}

interface NextMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: number;
  awayTeamId?: number;
  date: string;
  venue?: string;
}

interface LiveMatchBannerProps {
  liveMatches?: LiveMatch[];
  nextMatch?: NextMatch | null;
}

export default function LiveMatchBanner({ liveMatches = [], nextMatch }: LiveMatchBannerProps) {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [timeToKickoff, setTimeToKickoff] = useState<{ hours: number; mins: number; secs: number } | null>(null);

  // Rotate through live matches
  useEffect(() => {
    if (liveMatches.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentMatchIndex((prev) => (prev + 1) % liveMatches.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [liveMatches.length]);

  // Calculate countdown to next match
  useEffect(() => {
    if (!nextMatch?.date || liveMatches.length > 0) return;

    const calculateTime = () => {
      const now = new Date();
      const kickoff = new Date(nextMatch.date);
      const diff = kickoff.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeToKickoff(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeToKickoff({ hours, mins, secs });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [nextMatch?.date, liveMatches.length]);

  const getTeamLogo = (teamId: number | undefined) => {
    if (!teamId) return null;
    return `https://resources.premierleague.com/premierleague/badges/70/t${teamId}.png`;
  };

  // If no live matches and no next match, don't show anything
  if (liveMatches.length === 0 && !nextMatch) {
    return null;
  }

  // Show live matches
  if (liveMatches.length > 0) {
    const currentMatch = liveMatches[currentMatchIndex];
    
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600/20 via-red-500/10 to-red-600/20 border border-red-500/30">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-500/20 to-red-600/0 animate-pulse" />
        
        <div className="relative p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                {liveMatches.length > 1 ? `${liveMatches.length} MATCHES LIVE` : 'LIVE NOW'}
              </span>
            </div>
            {liveMatches.length > 1 && (
              <div className="flex gap-1">
                {liveMatches.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      idx === currentMatchIndex ? 'bg-red-400' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Match Display */}
          <div className="flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex-1 flex items-center gap-3 min-w-0">
              {currentMatch.homeTeamId && (
                <img
                  src={getTeamLogo(currentMatch.homeTeamId)!}
                  alt={currentMatch.homeTeam}
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                />
              )}
              <span className="font-bold text-base sm:text-lg truncate">{currentMatch.homeTeam}</span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center px-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl font-black">{currentMatch.homeScore}</span>
                <span className="text-xl text-white/50">-</span>
                <span className="text-3xl sm:text-4xl font-black">{currentMatch.awayScore}</span>
              </div>
              <span className="text-sm font-bold text-red-400 mt-1">{currentMatch.minute}'</span>
            </div>

            {/* Away Team */}
            <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
              <span className="font-bold text-base sm:text-lg truncate text-right">{currentMatch.awayTeam}</span>
              {currentMatch.awayTeamId && (
                <img
                  src={getTeamLogo(currentMatch.awayTeamId)!}
                  alt={currentMatch.awayTeam}
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                />
              )}
            </div>
          </div>

          {/* View All Link */}
          <div className="text-center mt-4">
            <Link 
              href="#live"
              className="text-xs text-red-400 hover:text-red-300 font-medium"
            >
              View all live matches →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show next match countdown
  if (nextMatch && timeToKickoff) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--pl-green)]/10 via-[var(--pl-cyan)]/10 to-[var(--pl-green)]/10 border border-[var(--pl-green)]/30">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="text-center mb-4">
            <span className="text-xs font-bold text-[var(--pl-green)] uppercase tracking-wider">
              Next Kickoff
            </span>
          </div>

          {/* Match Display */}
          <div className="flex items-center justify-between gap-4 mb-4">
            {/* Home Team */}
            <div className="flex-1 flex items-center gap-3 min-w-0">
              {nextMatch.homeTeamId && (
                <img
                  src={getTeamLogo(nextMatch.homeTeamId)!}
                  alt={nextMatch.homeTeam}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                />
              )}
              <span className="font-bold text-sm sm:text-base truncate">{nextMatch.homeTeam}</span>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-1 sm:gap-2 px-2">
              <div className="text-center px-2 py-1 rounded bg-white/10">
                <span className="text-lg sm:text-xl font-black">{timeToKickoff.hours.toString().padStart(2, '0')}</span>
                <span className="text-[8px] sm:text-[10px] block text-[var(--pl-text-muted)]">HRS</span>
              </div>
              <span className="text-lg font-bold">:</span>
              <div className="text-center px-2 py-1 rounded bg-white/10">
                <span className="text-lg sm:text-xl font-black">{timeToKickoff.mins.toString().padStart(2, '0')}</span>
                <span className="text-[8px] sm:text-[10px] block text-[var(--pl-text-muted)]">MIN</span>
              </div>
              <span className="text-lg font-bold">:</span>
              <div className="text-center px-2 py-1 rounded bg-white/10">
                <span className="text-lg sm:text-xl font-black">{timeToKickoff.secs.toString().padStart(2, '0')}</span>
                <span className="text-[8px] sm:text-[10px] block text-[var(--pl-text-muted)]">SEC</span>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
              <span className="font-bold text-sm sm:text-base truncate text-right">{nextMatch.awayTeam}</span>
              {nextMatch.awayTeamId && (
                <img
                  src={getTeamLogo(nextMatch.awayTeamId)!}
                  alt={nextMatch.awayTeam}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                />
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link 
              href={`/predictions`}
              className="inline-flex items-center gap-2 text-xs text-[var(--pl-purple)] hover:text-[var(--pl-purple)]/80 font-medium"
            >
              🔮 See AI Prediction
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
