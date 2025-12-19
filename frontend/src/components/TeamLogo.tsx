'use client';

import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { footballApi } from '@/lib/api';

interface TeamLogoProps {
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
  teamId?: number | null;
}

export default function TeamLogo({ size = 40, className = '', fallback, teamId }: TeamLogoProps) {
  const { user } = useAuth();
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);
  const targetTeamId = teamId || user?.favorite_team_id;

  useEffect(() => {
    const fetchTeamInfo = async () => {
      if (!targetTeamId) {
        setTeamLogo(null);
        return;
      }

      try {
        const teamInfo = await footballApi.getTeamInfo(targetTeamId);
        if (teamInfo?.logo) {
          setTeamLogo(teamInfo.logo);
          setTeamName(teamInfo.name || null);
        }
      } catch (err) {
        console.error('[TeamLogo] Failed to fetch team info:', err);
        setTeamLogo(null);
      }
    };

    fetchTeamInfo();
  }, [targetTeamId]);

  if (!teamLogo) {
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

  return (
    <div 
      className={`rounded-lg overflow-hidden flex items-center justify-center ${className}`}
      style={{ 
        width: size, 
        height: size,
        backgroundColor: 'var(--pl-green)20',
        border: '1px solid var(--pl-green)40'
      }}
    >
      <img
        src={teamLogo}
        alt={teamName || 'Team logo'}
        style={{ width: size * 0.8, height: size * 0.8, objectFit: 'contain' }}
        onError={(e) => {
          // Hide logo on error, will show default
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          setTeamLogo(null);
        }}
      />
    </div>
  );
}

