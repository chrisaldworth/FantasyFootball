'use client';

import { useState, useEffect } from 'react';
import TeamLogoGenerated from './TeamLogoGenerated';

interface TeamLogoProps {
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
  teamId?: number | null;
}

/**
 * TeamLogo component that tries to load official FPL badges first,
 * then falls back to generated logos if the badge fails to load.
 * 
 * Official FPL badge URL: https://resources.premierleague.com/premierleague/badges/t{teamId}.png
 * Team IDs are 1-20 for Premier League teams
 */
export default function TeamLogo({ size = 40, className = '', fallback, teamId }: TeamLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset error state when teamId changes
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [teamId]);

  // Validate teamId is in valid FPL range (1-20)
  const isValidFPLTeamId = teamId && teamId >= 1 && teamId <= 20;

  // Official FPL badge URL
  const badgeUrl = isValidFPLTeamId 
    ? `https://resources.premierleague.com/premierleague/badges/t${teamId}.png`
    : null;

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // If no teamId or invalid, show fallback or default
  if (!teamId || !isValidFPLTeamId) {
    if (fallback) {
      return <>{fallback}</>;
    }
    // Default logo
    return (
      <div 
        className={`rounded-lg bg-gradient-to-br from-[var(--pl-green)] to-[var(--pl-cyan)] flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-[var(--pl-dark)] font-bold" style={{ fontSize: size * 0.5 }}>
          F
        </span>
      </div>
    );
  }

  // Try to load official badge first
  if (badgeUrl && !imageError) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={badgeUrl}
          alt={`Team ${teamId} badge`}
          className="w-full h-full object-contain"
          style={{ width: size, height: size }}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
        />
        {isLoading && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-[var(--pl-dark)]/50 rounded"
            style={{ width: size, height: size }}
          >
            <div className="w-4 h-4 border-2 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  // Fallback to generated logo if badge fails to load
  return <TeamLogoGenerated teamId={teamId} size={size} className={className} />;
}
