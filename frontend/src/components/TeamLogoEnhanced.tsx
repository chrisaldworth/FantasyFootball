'use client';

import { useMemo } from 'react';

/**
 * Enhanced Team Logo Generator
 * Creates sophisticated SVG logos for Premier League teams
 * Multiple style options: badge, shield, modern, classic
 */

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

interface TeamLogoEnhancedProps {
  teamId: number;
  size?: number;
  className?: string;
  style?: 'badge' | 'shield' | 'modern' | 'classic';
}

// Helper functions (same as original)
const getLuminance = (hex: string): number => {
  const rgb = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!rgb) return 0;
  const r = parseInt(rgb[1], 16) / 255;
  const g = parseInt(rgb[2], 16) / 255;
  const b = parseInt(rgb[3], 16) / 255;
  const [rLinear, gLinear, bLinear] = [r, g, b].map(val => 
    val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

const getTextColor = (backgroundColor: string): string => {
  const whiteContrast = getContrastRatio(backgroundColor, '#FFFFFF');
  const blackContrast = getContrastRatio(backgroundColor, '#000000');
  if (whiteContrast >= blackContrast || whiteContrast >= 4.5) {
    return '#FFFFFF';
  }
  return '#000000';
};

// Shield shape path
const shieldPath = "M 50 10 L 15 10 Q 10 10 10 15 L 10 70 Q 10 85 25 90 L 50 95 L 75 90 Q 90 85 90 70 L 90 15 Q 90 10 85 10 Z";

export default function TeamLogoEnhanced({ 
  teamId, 
  size = 40, 
  className = '',
  style = 'badge'
}: TeamLogoEnhancedProps) {
  const teamTheme = TEAM_THEMES[teamId];
  
  const logoSvg = useMemo(() => {
    if (!teamTheme) {
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="12" fill="#1E1E1E"/>
          <text x="50" y="60" fontSize="40" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">?</text>
        </svg>
      );
    }

    const { primary, secondary, code, name } = teamTheme;
    const textColor = getTextColor(primary);
    const secondaryColor = secondary === '#000000' ? primary : secondary;
    
    // Badge style - circular with modern design
    if (style === 'badge') {
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`gradient-badge-${teamId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primary} />
              <stop offset="100%" stopColor={secondaryColor} />
            </linearGradient>
            <radialGradient id={`radial-badge-${teamId}`} cx="50%" cy="30%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
            </radialGradient>
            <filter id={`shadow-badge-${teamId}`}>
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3" floodColor="#000000"/>
            </filter>
          </defs>
          
          {/* Outer ring */}
          <circle cx="50" cy="50" r="48" fill={`url(#gradient-badge-${teamId})`} filter={`url(#shadow-badge-${teamId})`} />
          
          {/* Inner circle with highlight */}
          <circle cx="50" cy="50" r="42" fill={primary} />
          <circle cx="50" cy="50" r="42" fill={`url(#radial-badge-${teamId})`} />
          
          {/* Decorative ring */}
          <circle cx="50" cy="50" r="38" fill="none" stroke={textColor} strokeWidth="1" opacity="0.2" />
          
          {/* Team code */}
          <text 
            x="50" 
            y="62" 
            fontSize="28" 
            fill={textColor}
            stroke={textColor === '#FFFFFF' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'}
            strokeWidth="0.8"
            textAnchor="middle" 
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            letterSpacing="-1.5"
          >
            {code}
          </text>
        </svg>
      );
    }
    
    // Shield style - classic football badge
    if (style === 'shield') {
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`gradient-shield-${teamId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={primary} />
              <stop offset="100%" stopColor={secondaryColor} />
            </linearGradient>
            <filter id={`shadow-shield-${teamId}`}>
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3" floodColor="#000000"/>
            </filter>
          </defs>
          
          {/* Shield shape */}
          <path 
            d={shieldPath} 
            fill={`url(#gradient-shield-${teamId})`} 
            filter={`url(#shadow-shield-${teamId})`}
            stroke={textColor}
            strokeWidth="1.5"
            opacity="0.1"
          />
          
          {/* Inner highlight */}
          <path 
            d="M 50 15 L 18 15 Q 15 15 15 18 L 15 68 Q 15 82 28 87 L 50 92 L 72 87 Q 85 82 85 68 L 85 18 Q 85 15 82 15 Z" 
            fill={primary}
            opacity="0.95"
          />
          
          {/* Team code */}
          <text 
            x="50" 
            y="60" 
            fontSize="26" 
            fill={textColor}
            stroke={textColor === '#FFFFFF' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'}
            strokeWidth="0.8"
            textAnchor="middle" 
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            letterSpacing="-1"
          >
            {code}
          </text>
        </svg>
      );
    }
    
    // Modern style - hexagon with gradient
    if (style === 'modern') {
      const hexPath = "M 50 5 L 85 25 L 85 65 L 50 85 L 15 65 L 15 25 Z";
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`gradient-modern-${teamId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primary} />
              <stop offset="50%" stopColor={secondaryColor} />
              <stop offset="100%" stopColor={primary} />
            </linearGradient>
            <filter id={`shadow-modern-${teamId}`}>
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3" floodColor="#000000"/>
            </filter>
          </defs>
          
          {/* Hexagon shape */}
          <path 
            d={hexPath} 
            fill={`url(#gradient-modern-${teamId})`} 
            filter={`url(#shadow-modern-${teamId})`}
          />
          
          {/* Inner hexagon */}
          <path 
            d="M 50 12 L 78 28 L 78 62 L 50 78 L 22 62 L 22 28 Z" 
            fill={primary}
            opacity="0.95"
          />
          
          {/* Team code */}
          <text 
            x="50" 
            y="58" 
            fontSize="28" 
            fill={textColor}
            stroke={textColor === '#FFFFFF' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'}
            strokeWidth="0.8"
            textAnchor="middle" 
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            letterSpacing="-1.5"
          >
            {code}
          </text>
        </svg>
      );
    }
    
    // Classic style - rounded square with border
    if (style === 'classic') {
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`gradient-classic-${teamId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primary} />
              <stop offset="100%" stopColor={secondaryColor} />
            </linearGradient>
            <filter id={`shadow-classic-${teamId}`}>
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3" floodColor="#000000"/>
            </filter>
          </defs>
          
          {/* Outer rounded square */}
          <rect 
            x="5" 
            y="5" 
            width="90" 
            height="90" 
            rx="12" 
            fill={`url(#gradient-classic-${teamId})`} 
            filter={`url(#shadow-classic-${teamId})`}
          />
          
          {/* Inner square */}
          <rect 
            x="12" 
            y="12" 
            width="76" 
            height="76" 
            rx="8" 
            fill={primary}
            opacity="0.95"
          />
          
          {/* Border accent */}
          <rect 
            x="12" 
            y="12" 
            width="76" 
            height="76" 
            rx="8" 
            fill="none" 
            stroke={textColor} 
            strokeWidth="1" 
            opacity="0.2"
          />
          
          {/* Team code */}
          <text 
            x="50" 
            y="60" 
            fontSize="28" 
            fill={textColor}
            stroke={textColor === '#FFFFFF' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'}
            strokeWidth="0.8"
            textAnchor="middle" 
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            letterSpacing="-1.5"
          >
            {code}
          </text>
        </svg>
      );
    }
    
    // Default to badge
    return null;
  }, [teamId, teamTheme, size, style]);

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

