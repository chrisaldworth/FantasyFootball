'use client';

import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import TeamLogoGenerated from './TeamLogoGenerated';

interface TeamLogoProps {
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
  teamId?: number | null;
}

/**
 * Get FPL team logo URL from Premier League resources
 * FPL uses team IDs that correspond to Premier League badge URLs
 */
function getFPLTeamLogoUrl(teamId: number): string {
  return `https://resources.premierleague.com/premierleague/badges/t${teamId}.png`;
}

export default function TeamLogo({ size = 40, className = '', fallback, teamId }: TeamLogoProps) {
  const { user } = useAuth();
  const targetTeamId = teamId || user?.favorite_team_id;
  const [logoError, setLogoError] = useState(false);

  if (!targetTeamId) {
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

  // Try FPL logo first, fall back to generated logo if it fails
  if (!logoError) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={getFPLTeamLogoUrl(targetTeamId)}
          alt="Team logo"
          style={{ width: size, height: size, objectFit: 'contain' }}
          onError={() => setLogoError(true)}
          className="rounded-lg"
        />
      </div>
    );
  }

  // Fall back to generated logo if FPL logo fails to load
  return <TeamLogoGenerated teamId={targetTeamId} size={size} className={className} />;
}

