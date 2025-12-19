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


export default function TeamLogo({ size = 40, className = '', fallback, teamId }: TeamLogoProps) {
  const { user } = useAuth();
  const targetTeamId = teamId || user?.favorite_team_id;

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

  // Always use generated logo
  return <TeamLogoGenerated teamId={targetTeamId} size={size} className={className} />;
}

