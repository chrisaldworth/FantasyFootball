'use client';

import { useMemo } from 'react';

/**
 * TeamLogoGenerated component that generates SVG logos for FPL teams
 * 
 * FPL Team IDs (2024/25 season):
 * 1: Arsenal, 2: Aston Villa, 3: Bournemouth, 4: Brentford, 5: Brighton
 * 6: Chelsea, 7: Crystal Palace, 8: Everton, 9: Fulham, 10: Ipswich
 * 11: Leicester, 12: Liverpool, 13: Manchester City, 14: Manchester Utd
 * 15: Newcastle, 16: Nottingham Forest, 17: Southampton, 18: Tottenham
 * 19: West Ham, 20: Wolves
 */

// Team color mappings - FPL team ID to theme colors
// Colors verified and updated for accurate team representation
const TEAM_THEMES: Record<number, {
  primary: string;
  secondary: string;
  code: string;
  name: string;
}> = {
  1: { primary: '#EF0107', secondary: '#023474', code: 'ARS', name: 'Arsenal' },
  2: { primary: '#670E36', secondary: '#95BFE5', code: 'AVL', name: 'Aston Villa' },
  3: { primary: '#DA291C', secondary: '#000000', code: 'BOU', name: 'Bournemouth' },
  4: { primary: '#E30613', secondary: '#000000', code: 'BRE', name: 'Brentford' },
  5: { primary: '#0057B8', secondary: '#FFFFFF', code: 'BHA', name: 'Brighton' },
  6: { primary: '#034694', secondary: '#FFFFFF', code: 'CHE', name: 'Chelsea' },
  7: { primary: '#1B458F', secondary: '#C4122E', code: 'CRY', name: 'Crystal Palace' },
  8: { primary: '#003399', secondary: '#FFFFFF', code: 'EVE', name: 'Everton' },
  9: { primary: '#000000', secondary: '#FFFFFF', code: 'FUL', name: 'Fulham' },
  10: { primary: '#0044AA', secondary: '#FFFFFF', code: 'IPS', name: 'Ipswich' },
  11: { primary: '#003090', secondary: '#FDBE11', code: 'LEI', name: 'Leicester' },
  12: { primary: '#C8102E', secondary: '#FFFFFF', code: 'LIV', name: 'Liverpool' },
  13: { primary: '#6CABDD', secondary: '#1C2C5B', code: 'MCI', name: 'Manchester City' },
  14: { primary: '#DA020E', secondary: '#FBE122', code: 'MUN', name: 'Manchester Utd' },
  15: { primary: '#241F20', secondary: '#FFFFFF', code: 'NEW', name: 'Newcastle' },
  16: { primary: '#DD0000', secondary: '#FFFFFF', code: 'NFO', name: 'Nottingham Forest' },
  17: { primary: '#D71920', secondary: '#FFFFFF', code: 'SOU', name: 'Southampton' },
  18: { primary: '#132257', secondary: '#FFFFFF', code: 'TOT', name: 'Tottenham' },
  19: { primary: '#7A263A', secondary: '#1BB1E7', code: 'WHU', name: 'West Ham' },
  20: { primary: '#FDB913', secondary: '#231F20', code: 'WOL', name: 'Wolves' },
};

interface TeamLogoGeneratedProps {
  teamId: number;
  size?: number;
  className?: string;
}

export default function TeamLogoGenerated({ teamId, size = 40, className = '' }: TeamLogoGeneratedProps) {
  const teamTheme = TEAM_THEMES[teamId];
  
  const logoSvg = useMemo(() => {
    if (!teamTheme) {
      // Default logo for unknown teams
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="12" fill="#1E1E1E"/>
          <text x="50" y="60" fontSize="40" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">?</text>
        </svg>
      );
    }

    const { primary, secondary, code, name } = teamTheme;
    
    // Determine text color based on contrast - use white for dark backgrounds, primary for light
    const isLightSecondary = secondary === '#FFFFFF' || secondary === '#FBE122' || secondary === '#1BB1E7' || secondary === '#95BFE5';
    const textColor = isLightSecondary ? secondary : primary;
    
    // Generate a modern circular badge with team initials
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`gradient-${teamId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primary} />
            <stop offset="100%" stopColor={secondary === '#000000' ? primary : secondary} />
          </linearGradient>
          <filter id={`shadow-${teamId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" floodColor="#000000"/>
          </filter>
        </defs>
        
        {/* Outer circle with gradient and shadow */}
        <circle 
          cx="50" 
          cy="50" 
          r="48" 
          fill={`url(#gradient-${teamId})`} 
          stroke={secondary === '#000000' ? primary : secondary} 
          strokeWidth="2"
          filter={`url(#shadow-${teamId})`}
        />
        
        {/* Inner circle for depth */}
        <circle cx="50" cy="50" r="42" fill={primary} opacity="0.95"/>
        
        {/* Team code text with better styling */}
        <text 
          x="50" 
          y="62" 
          fontSize="32" 
          fill={textColor}
          textAnchor="middle" 
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          letterSpacing="-2"
          style={{ 
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))'
          }}
        >
          {code}
        </text>
      </svg>
    );
  }, [teamId, teamTheme, size]);

  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      title={teamTheme?.name || 'Team'}
    >
      {logoSvg}
    </div>
  );
}
