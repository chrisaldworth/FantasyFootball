'use client';

import TeamLogoEnhanced from './TeamLogoEnhanced';

interface TeamLogoProps {
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
  teamId?: number | null;
}

/**
 * TeamLogo component that uses enhanced SVG logos (shield style)
 * Team IDs are assigned by the FPL API (typically 1-23 for current PL teams)
 */
export default function TeamLogo({ size = 40, className = '', fallback, teamId }: TeamLogoProps) {
  // Validate teamId is a positive number (FPL IDs are typically 1-23 for current season)
  const isValidFPLTeamId = teamId && teamId >= 1 && teamId <= 30;

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

  // Use enhanced logo with shield style
  return <TeamLogoEnhanced teamId={teamId} size={size} className={className} style="shield" />;
}
