'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { footballApi } from './api';

// Team color mappings - FPL team ID to theme colors
// Optimized for visual appeal, contrast, and brand accuracy
const TEAM_THEMES: Record<number, {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  code: string;
  name: string;
}> = {
  // Arsenal - Red and gold, classic and elegant
  1: { primary: '#EF0107', secondary: '#9C824A', accent: '#023474', text: '#FFFFFF', code: 'ARS', name: 'Arsenal' },
  
  // Aston Villa - Claret and blue, sophisticated
  2: { primary: '#670E36', secondary: '#95BFE5', accent: '#F4A261', text: '#FFFFFF', code: 'AVL', name: 'Aston Villa' },
  
  // Bournemouth - Red and black, bold
  3: { primary: '#DA291C', secondary: '#000000', accent: '#FFC72C', text: '#FFFFFF', code: 'BOU', name: 'Bournemouth' },
  
  // Brentford - Red, white, and black, modern
  4: { primary: '#E30613', secondary: '#000000', accent: '#FFFFFF', text: '#FFFFFF', code: 'BRE', name: 'Brentford' },
  
  // Brighton - Blue and white, fresh and clean
  5: { primary: '#0057B8', secondary: '#FFFFFF', accent: '#FFCD00', text: '#FFFFFF', code: 'BHA', name: 'Brighton' },
  
  // Chelsea - Royal blue, classic
  6: { primary: '#034694', secondary: '#FFFFFF', accent: '#6CABDD', text: '#FFFFFF', code: 'CHE', name: 'Chelsea' },
  
  // Crystal Palace - Red and blue, vibrant
  7: { primary: '#1B458F', secondary: '#C4122E', accent: '#FFD700', text: '#FFFFFF', code: 'CRY', name: 'Crystal Palace' },
  
  // Everton - Royal blue, traditional
  8: { primary: '#003399', secondary: '#FFFFFF', accent: '#FFD700', text: '#FFFFFF', code: 'EVE', name: 'Everton' },
  
  // Fulham - Black and white, elegant
  9: { primary: '#000000', secondary: '#FFFFFF', accent: '#CC0000', text: '#FFFFFF', code: 'FUL', name: 'Fulham' },
  
  // Ipswich - Blue, classic
  10: { primary: '#0044AA', secondary: '#FFFFFF', accent: '#FFD700', text: '#FFFFFF', code: 'IPS', name: 'Ipswich' },
  
  // Leicester - Blue and gold, regal
  11: { primary: '#003090', secondary: '#FDBE11', accent: '#FFFFFF', text: '#FFFFFF', code: 'LEI', name: 'Leicester' },
  
  // Liverpool - Red, iconic
  12: { primary: '#C8102E', secondary: '#FFFFFF', accent: '#FFD700', text: '#FFFFFF', code: 'LIV', name: 'Liverpool' },
  
  // Manchester City - Sky blue, modern
  13: { primary: '#6CABDD', secondary: '#1C2C5B', accent: '#FFFFFF', text: '#FFFFFF', code: 'MCI', name: 'Manchester City' },
  
  // Manchester United - Red and gold, legendary
  14: { primary: '#DA020E', secondary: '#FBE122', accent: '#000000', text: '#FFFFFF', code: 'MUN', name: 'Manchester Utd' },
  
  // Newcastle - Black and white, striking
  15: { primary: '#241F20', secondary: '#FFFFFF', accent: '#00A8E8', text: '#FFFFFF', code: 'NEW', name: 'Newcastle' },
  
  // Nottingham Forest - Red, traditional
  16: { primary: '#DD0000', secondary: '#FFFFFF', accent: '#FFD700', text: '#FFFFFF', code: 'NFO', name: 'Nottingham Forest' },
  
  // Southampton - Red and white, classic
  17: { primary: '#D71920', secondary: '#FFFFFF', accent: '#FFD700', text: '#FFFFFF', code: 'SOU', name: 'Southampton' },
  
  // Tottenham - Navy blue, modern
  18: { primary: '#132257', secondary: '#FFFFFF', accent: '#E5E5E5', text: '#FFFFFF', code: 'TOT', name: 'Tottenham' },
  
  // West Ham - Claret and blue, distinctive
  19: { primary: '#7A263A', secondary: '#1BB1E7', accent: '#FFD700', text: '#FFFFFF', code: 'WHU', name: 'West Ham' },
  
  // Wolves - Gold and black, bold
  20: { primary: '#FDB913', secondary: '#231F20', accent: '#FFFFFF', text: '#231F20', code: 'WOL', name: 'Wolves' },
};

interface TeamTheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
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
          root.style.setProperty('--team-text', fullTheme.text);
          
          // Update body background gradient with team colors (subtle, elegant)
          // Use very low opacity for a sophisticated look
          const bgGradient = `linear-gradient(135deg, ${fullTheme.primary}08 0%, ${fullTheme.secondary}08 50%, ${fullTheme.primary}08 100%)`;
          root.style.setProperty('--team-bg-gradient', bgGradient);
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
      root.style.removeProperty('--team-bg-gradient');
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

