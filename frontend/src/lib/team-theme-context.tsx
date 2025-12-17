'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { footballApi } from './api';

// Team color mappings - FPL team ID to theme colors
const TEAM_THEMES: Record<number, {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  code: string;
  name: string;
}> = {
  1: { primary: '#EF0107', secondary: '#023474', accent: '#9C824A', text: '#FFFFFF', code: 'ARS', name: 'Arsenal' },
  2: { primary: '#95BFE5', secondary: '#670E36', accent: '#95BFE5', text: '#FFFFFF', code: 'AVL', name: 'Aston Villa' },
  3: { primary: '#DA291C', secondary: '#000000', accent: '#DA291C', text: '#FFFFFF', code: 'BOU', name: 'Bournemouth' },
  4: { primary: '#FFD700', secondary: '#000000', accent: '#FFD700', text: '#000000', code: 'BRE', name: 'Brentford' },
  5: { primary: '#0057B8', secondary: '#FFFFFF', accent: '#0057B8', text: '#FFFFFF', code: 'BHA', name: 'Brighton' },
  6: { primary: '#034694', secondary: '#FFFFFF', accent: '#034694', text: '#FFFFFF', code: 'CHE', name: 'Chelsea' },
  7: { primary: '#1B458F', secondary: '#C4122E', accent: '#1B458F', text: '#FFFFFF', code: 'CRY', name: 'Crystal Palace' },
  8: { primary: '#003399', secondary: '#FFFFFF', accent: '#003399', text: '#FFFFFF', code: 'EVE', name: 'Everton' },
  9: { primary: '#000000', secondary: '#FFFFFF', accent: '#CC0000', text: '#FFFFFF', code: 'FUL', name: 'Fulham' },
  10: { primary: '#0044AA', secondary: '#FFFFFF', accent: '#0044AA', text: '#FFFFFF', code: 'IPS', name: 'Ipswich' },
  11: { primary: '#003090', secondary: '#FDBE11', accent: '#003090', text: '#FFFFFF', code: 'LEI', name: 'Leicester' },
  12: { primary: '#C8102E', secondary: '#00B2A9', accent: '#C8102E', text: '#FFFFFF', code: 'LIV', name: 'Liverpool' },
  13: { primary: '#6CABDD', secondary: '#1C2C5B', accent: '#6CABDD', text: '#FFFFFF', code: 'MCI', name: 'Manchester City' },
  14: { primary: '#DA291C', secondary: '#FBE122', accent: '#DA291C', text: '#FFFFFF', code: 'MUN', name: 'Manchester Utd' },
  15: { primary: '#241F20', secondary: '#FFFFFF', accent: '#241F20', text: '#FFFFFF', code: 'NEW', name: 'Newcastle' },
  16: { primary: '#DD0000', secondary: '#FFFFFF', accent: '#DD0000', text: '#FFFFFF', code: 'NFO', name: 'Nottingham Forest' },
  17: { primary: '#D71920', secondary: '#FFFFFF', accent: '#D71920', text: '#FFFFFF', code: 'SOU', name: 'Southampton' },
  18: { primary: '#132257', secondary: '#FFFFFF', accent: '#132257', text: '#FFFFFF', code: 'TOT', name: 'Tottenham' },
  19: { primary: '#7A263A', secondary: '#1BB1E7', accent: '#7A263A', text: '#FFFFFF', code: 'WHU', name: 'West Ham' },
  20: { primary: '#FDB913', secondary: '#231F20', accent: '#FDB913', text: '#231F20', code: 'WOL', name: 'Wolves' },
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
          
          // Update body background gradient with team colors
          const bgGradient = `linear-gradient(135deg, ${fullTheme.primary}15 0%, ${fullTheme.secondary}15 50%, ${fullTheme.primary}15 100%)`;
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

