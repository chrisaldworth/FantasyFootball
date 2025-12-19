'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { footballApi } from './api';

// Team color mappings - FPL team ID to theme colors
// Designed with WCAG AA contrast standards (4.5:1 for text, 3:1 for UI)
// Primary: Main brand color (buttons, highlights)
// Secondary: Complementary color (gradients, accents)
// Accent: Tertiary color (borders, subtle highlights)
// textOnPrimary: Text color for primary backgrounds
// textOnSecondary: Text color for secondary backgrounds
const TEAM_THEMES: Record<number, {
  primary: string;
  secondary: string;
  accent: string;
  textOnPrimary: string;
  textOnSecondary: string;
  code: string;
  name: string;
}> = {
  // Arsenal - Red primary with gold accents, high contrast
  1: { 
    primary: '#C41E3A',      // Darker red for better contrast
    secondary: '#9C824A',   // Gold
    accent: '#023474',       // Navy accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    code: 'ARS', 
    name: 'Arsenal' 
  },
  
  // Aston Villa - Claret primary, light blue secondary
  2: { 
    primary: '#670E36',      // Claret
    secondary: '#95BFE5',   // Light blue
    accent: '#F4A261',      // Warm accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    code: 'AVL', 
    name: 'Aston Villa' 
  },
  
  // Bournemouth - Red and black
  3: { 
    primary: '#DA291C',      // Red
    secondary: '#000000',    // Black
    accent: '#FFC72C',      // Yellow accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    code: 'BOU', 
    name: 'Bournemouth' 
  },
  
  // Brentford - Red, white, black
  4: { 
    primary: '#E30613',      // Red
    secondary: '#000000',    // Black
    accent: '#FFFFFF',       // White accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    code: 'BRE', 
    name: 'Brentford' 
  },
  
  // Brighton - Blue primary, white secondary
  5: { 
    primary: '#0057B8',      // Blue
    secondary: '#FFFFFF',    // White
    accent: '#FFCD00',      // Yellow accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    code: 'BHA', 
    name: 'Brighton' 
  },
  
  // Chelsea - Royal blue
  6: { 
    primary: '#034694',      // Royal blue
    secondary: '#FFFFFF',    // White
    accent: '#6CABDD',      // Light blue accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    code: 'CHE', 
    name: 'Chelsea' 
  },
  
  // Crystal Palace - Blue and red
  7: { 
    primary: '#1B458F',      // Blue
    secondary: '#C4122E',   // Red
    accent: '#FFD700',      // Gold accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    code: 'CRY', 
    name: 'Crystal Palace' 
  },
  
  // Everton - Royal blue
  8: { 
    primary: '#003399',      // Royal blue
    secondary: '#FFFFFF',    // White
    accent: '#FFD700',      // Gold accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    code: 'EVE', 
    name: 'Everton' 
  },
  
  // Fulham - Black and white
  9: { 
    primary: '#000000',      // Black
    secondary: '#FFFFFF',    // White
    accent: '#CC0000',      // Red accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    code: 'FUL', 
    name: 'Fulham' 
  },
  
  // Ipswich - Blue
  10: { 
    primary: '#0044AA',      // Blue
    secondary: '#FFFFFF',    // White
    accent: '#FFD700',      // Gold accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    code: 'IPS', 
    name: 'Ipswich' 
  },
  
  // Leicester - Blue and gold
  11: { 
    primary: '#003090',      // Blue
    secondary: '#FDBE11',   // Gold
    accent: '#FFFFFF',      // White accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    code: 'LEI', 
    name: 'Leicester' 
  },
  
  // Liverpool - Red
  12: { 
    primary: '#C8102E',      // Red
    secondary: '#FFFFFF',    // White
    accent: '#FFD700',      // Gold accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    code: 'LIV', 
    name: 'Liverpool' 
  },
  
  // Manchester City - Sky blue
  13: { 
    primary: '#6CABDD',      // Sky blue
    secondary: '#1C2C5B',    // Dark blue
    accent: '#FFFFFF',      // White accent
    textOnPrimary: '#000000', // Dark text on light blue
    textOnSecondary: '#FFFFFF',
    code: 'MCI', 
    name: 'Manchester City' 
  },
  
  // Manchester United - Red and gold
  14: { 
    primary: '#DA020E',      // Red
    secondary: '#FBE122',    // Gold
    accent: '#000000',      // Black accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    code: 'MUN', 
    name: 'Manchester Utd' 
  },
  
  // Newcastle - Black and white
  15: { 
    primary: '#241F20',      // Black
    secondary: '#FFFFFF',    // White
    accent: '#00A8E8',      // Blue accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    code: 'NEW', 
    name: 'Newcastle' 
  },
  
  // Nottingham Forest - Red
  16: { 
    primary: '#DD0000',      // Red
    secondary: '#FFFFFF',    // White
    accent: '#FFD700',      // Gold accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    code: 'NFO', 
    name: 'Nottingham Forest' 
  },
  
  // Southampton - Red and white
  17: { 
    primary: '#D71920',      // Red
    secondary: '#FFFFFF',    // White
    accent: '#FFD700',      // Gold accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    code: 'SOU', 
    name: 'Southampton' 
  },
  
  // Tottenham - Navy blue
  18: { 
    primary: '#132257',      // Navy
    secondary: '#FFFFFF',    // White
    accent: '#E5E5E5',      // Light grey accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    code: 'TOT', 
    name: 'Tottenham' 
  },
  
  // West Ham - Claret and blue
  19: { 
    primary: '#7A263A',      // Claret
    secondary: '#1BB1E7',    // Light blue
    accent: '#FFD700',      // Gold accent
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    code: 'WHU', 
    name: 'West Ham' 
  },
  
  // Wolves - Gold and black
  20: { 
    primary: '#FDB913',      // Gold
    secondary: '#231F20',    // Black
    accent: '#FFFFFF',      // White accent
    textOnPrimary: '#000000', // Dark text on gold
    textOnSecondary: '#FFFFFF',
    code: 'WOL', 
    name: 'Wolves' 
  },
};

interface TeamTheme {
  primary: string;
  secondary: string;
  accent: string;
  textOnPrimary: string;
  textOnSecondary: string;
  code: string;
  name: string;
  logo: string | null;
}

interface TeamThemeContextType {
  theme: TeamTheme | null;
  loading: boolean;
}

const TeamThemeContext = createContext<TeamThemeContextType | undefined>(undefined);

export function TeamThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<TeamTheme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const applyTheme = async () => {
      if (!user?.favorite_team_id) {
        // Reset to default theme
        setTheme(null);
        setLoading(false);
        return;
      }

      try {
        // Get team info including logo
        const teamInfo = await footballApi.getTeamInfo(user.favorite_team_id);
        
        // Get theme colors from mapping
        const teamTheme = TEAM_THEMES[user.favorite_team_id];
        
        if (teamTheme) {
          const fullTheme: TeamTheme = {
            ...teamTheme,
            logo: teamInfo.logo || null,
          };
          
          setTheme(fullTheme);
          
          // Apply CSS variables
          const root = document.documentElement;
          root.style.setProperty('--team-primary', fullTheme.primary);
          root.style.setProperty('--team-secondary', fullTheme.secondary);
          root.style.setProperty('--team-accent', fullTheme.accent);
          root.style.setProperty('--team-text-on-primary', fullTheme.textOnPrimary);
          root.style.setProperty('--team-text-on-secondary', fullTheme.textOnSecondary);
          
          // Use primary text color as default (for most UI elements)
          root.style.setProperty('--team-text', fullTheme.textOnPrimary);
          
          // Update body background gradient with team colors
          // Convert hex to RGB for better blending with dark base
          const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
            } : null;
          };
          
          const primaryRgb = hexToRgb(fullTheme.primary);
          const secondaryRgb = hexToRgb(fullTheme.secondary);
          
          // Create a darker, more visible gradient using team colors
          // Use dark base (#0d0d0d) with team color tints for subtle but visible theming
          if (primaryRgb && secondaryRgb) {
            // Blend team colors into dark background - more visible but still elegant
            // Use RGB blending for better color mixing
            const bgGradient = `linear-gradient(135deg, 
              rgba(${Math.min(primaryRgb.r + 10, 255)}, ${Math.min(primaryRgb.g + 10, 255)}, ${Math.min(primaryRgb.b + 10, 255)}, 0.08) 0%, 
              rgba(13, 13, 13, 1) 30%,
              rgba(13, 13, 13, 1) 70%,
              rgba(${Math.min(secondaryRgb.r + 10, 255)}, ${Math.min(secondaryRgb.g + 10, 255)}, ${Math.min(secondaryRgb.b + 10, 255)}, 0.08) 100%
            )`;
            root.style.setProperty('--team-bg-gradient', bgGradient);
            // Also set a solid background color as fallback
            root.style.setProperty('--team-bg-color', '#0d0d0d');
          } else {
            // Fallback to dark background
            root.style.setProperty('--team-bg-gradient', 'linear-gradient(135deg, #0d0d0d 0%, #1a0a1d 50%, #0d0d0d 100%)');
            root.style.setProperty('--team-bg-color', '#0d0d0d');
          }
        } else {
          setTheme(null);
        }
      } catch (error) {
        console.error('Failed to load team theme:', error);
        setTheme(null);
      } finally {
        setLoading(false);
      }
    };

    applyTheme();
  }, [user?.favorite_team_id]);

  // Reset theme when user logs out or has no favorite team
  useEffect(() => {
    if (!user?.favorite_team_id) {
      const root = document.documentElement;
      root.style.removeProperty('--team-primary');
      root.style.removeProperty('--team-secondary');
      root.style.removeProperty('--team-accent');
      root.style.removeProperty('--team-text');
      root.style.removeProperty('--team-text-on-primary');
      root.style.removeProperty('--team-text-on-secondary');
      root.style.removeProperty('--team-bg-gradient');
      root.style.removeProperty('--team-bg-color');
    }
  }, [user?.favorite_team_id]);

  return (
    <TeamThemeContext.Provider value={{ theme, loading }}>
      {children}
    </TeamThemeContext.Provider>
  );
}

export function useTeamTheme() {
  const context = useContext(TeamThemeContext);
  if (context === undefined) {
    throw new Error('useTeamTheme must be used within a TeamThemeProvider');
  }
  return context;
}

