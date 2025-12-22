import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// API URL configuration
// Priority: 1. Environment variable, 2. Default to deployed backend, 3. Localhost for dev
const getApiBaseUrl = () => {
  // If NEXT_PUBLIC_API_URL is set, use it (for production or custom config)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // For Capacitor apps (iOS/Android)
  if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
    // Use localhost for iOS simulator (works fine)
    // For physical device, you may need to use your Mac's IP address
    // To use cloud backend, set NEXT_PUBLIC_API_URL environment variable in Xcode
    // or update the deployedBackend URL below with your actual Render URL
    
    // Option 1: Use localhost (works in simulator)
    return 'http://localhost:8080';
    
    // Option 2: Use deployed backend (uncomment and update URL)
    // const deployedBackend = 'https://your-actual-backend-url.onrender.com';
    // return deployedBackend;
    
    // Option 3: Use Mac's IP for physical device (uncomment and update)
    // return 'http://192.168.68.152:8080';
  }
  
  // For web (browser), check if we're in development
  // In development, use localhost; otherwise use deployed backend
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080';
  }
  
  // Production web - use deployed backend
  return 'https://fpl-companion-api.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();

// Debug logging (only in browser, not SSR)
if (typeof window !== 'undefined') {
  console.log('[API Config] Using backend URL:', API_BASE_URL);
  console.log('[API Config] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'NOT SET');
  console.log('[API Config] NODE_ENV:', process.env.NODE_ENV);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (email: string, username: string, password: string, fplTeamId?: number) => {
    const response = await api.post('/api/auth/register', {
      email,
      username,
      password,
      fpl_team_id: fplTeamId,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  updateFplTeamId: async (fplTeamId: number) => {
    const response = await api.put(`/api/auth/me/fpl-team?fpl_team_id=${fplTeamId}`);
    return response.data;
  },

  updateFavoriteTeamId: async (favoriteTeamId: number) => {
    const response = await api.put(`/api/auth/me/favorite-team?favorite_team_id=${favoriteTeamId}`);
    return response.data;
  },
};

// FPL API
export const fplApi = {
  getBootstrap: async () => {
    const response = await api.get('/api/fpl/bootstrap');
    return response.data;
  },

  getFixtures: async (gameweek?: number) => {
    const url = gameweek ? `/api/fpl/fixtures?gameweek=${gameweek}` : '/api/fpl/fixtures';
    const response = await api.get(url);
    return response.data;
  },

  getLiveGameweek: async (gameweek: number) => {
    const response = await api.get(`/api/fpl/live/${gameweek}`);
    return response.data;
  },

  getPlayer: async (playerId: number) => {
    const response = await api.get(`/api/fpl/player/${playerId}`);
    return response.data;
  },

  getTeam: async (teamId: number) => {
    const response = await api.get(`/api/fpl/team/${teamId}`);
    return response.data;
  },

  getTeamPicks: async (teamId: number, gameweek: number) => {
    const response = await api.get(`/api/fpl/team/${teamId}/picks/${gameweek}`);
    return response.data;
  },

  getTeamHistory: async (teamId: number) => {
    const response = await api.get(`/api/fpl/team/${teamId}/history`);
    return response.data;
  },

  getMyTeam: async () => {
    const response = await api.get('/api/fpl/my-team');
    return response.data;
  },

  getMyPicks: async (gameweek: number) => {
    const response = await api.get(`/api/fpl/my-team/picks/${gameweek}`);
    return response.data;
  },

  getMyHistory: async () => {
    const response = await api.get('/api/fpl/my-team/history');
    return response.data;
  },

  getLeague: async (leagueId: number, page?: number) => {
    const url = page ? `/api/fpl/league/${leagueId}?page=${page}` : `/api/fpl/league/${leagueId}`;
    const response = await api.get(url);
    return response.data;
  },

  // Shorthand for common calls used by components
  getUserPicks: async (teamId: number, gameweek: number) => {
    const response = await api.get(`/api/fpl/team/${teamId}/picks/${gameweek}`);
    return response.data;
  },

  getUserHistory: async (teamId: number) => {
    const response = await api.get(`/api/fpl/team/${teamId}/history`);
    return response.data;
  },
};

// FPL Account Management API (for direct team changes)
export const fplAccountApi = {
  // Check if FPL account is linked
  getStatus: async () => {
    const response = await api.get('/api/fpl-account/status');
    return response.data;
  },

  // Link FPL account with email/password
  linkAccount: async (email: string, password: string) => {
    const response = await api.post('/api/fpl-account/link', { email, password });
    return response.data;
  },

  // Unlink FPL account
  unlinkAccount: async () => {
    const response = await api.delete('/api/fpl-account/unlink');
    return response.data;
  },

  // Get authenticated team data (includes transfers available, etc.)
  getMyTeam: async () => {
    const response = await api.get('/api/fpl-account/my-team');
    return response.data;
  },

  // Save team selection (lineup, captain, bench order)
  saveTeam: async (picks: Array<{
    element: number;
    position: number;
    is_captain: boolean;
    is_vice_captain: boolean;
  }>, chip?: string) => {
    const response = await api.post('/api/fpl-account/save-team', { picks, chip });
    return response.data;
  },

  // Make transfers
  makeTransfers: async (transfers: Array<{
    element_in: number;
    element_out: number;
  }>, chip?: string, gameweek?: number) => {
    const response = await api.post('/api/fpl-account/transfers', { 
      transfers, 
      chip,
      gameweek,
    });
    return response.data;
  },

  // Activate a chip
  activateChip: async (chip: 'bboost' | '3xc' | 'freehit' | 'wildcard') => {
    const response = await api.post(`/api/fpl-account/activate-chip?chip=${chip}`);
    return response.data;
  },
};

// Football API (General football data)
export const footballApi = {
  getTodaysFixtures: async (forceRefresh?: boolean) => {
    const url = forceRefresh ? '/api/football/fixtures/today?force_refresh=true' : '/api/football/fixtures/today';
    const response = await api.get(url);
    return response.data;
  },

  getUpcomingFixtures: async (days: number = 7, forceRefresh?: boolean) => {
    const url = forceRefresh 
      ? `/api/football/fixtures/upcoming?days=${days}&force_refresh=true`
      : `/api/football/fixtures/upcoming?days=${days}`;
    const response = await api.get(url);
    return response.data;
  },

  getRecentResults: async (days: number = 7, teamId?: number, forceRefresh?: boolean) => {
    let url = forceRefresh
      ? `/api/football/results/recent?days=${days}&force_refresh=true`
      : `/api/football/results/recent?days=${days}`;
    if (teamId) {
      url += `&team_id=${teamId}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getMatchDetails: async (fixtureId: number) => {
    const response = await api.get(`/api/football/match/${fixtureId}`);
    return response.data;
  },

  getUkTeams: async () => {
    const response = await api.get('/api/football/teams/uk');
    return response.data;
  },

  getTeamInfo: async (teamId: number) => {
    const response = await api.get(`/api/football/team/${teamId}/info`);
    return response.data;
  },

  getTeamNews: async (teamId: number) => {
    try {
      const response = await api.get(`/api/football/team/${teamId}/news`);
      return response.data;
    } catch (err: any) {
      // If endpoint doesn't exist, return empty news
      return { news: [] };
    }
  },

  getTeamNewsOverview: async (teamId: number) => {
    try {
      const response = await api.get(`/api/football/team/${teamId}/news/overview`);
      return response.data;
    } catch (err: any) {
      // If endpoint doesn't exist, return empty overview
      return {
        overview: 'News overview unavailable',
        highlights: [],
        big_news: [],
        categories: {},
        total_count: 0,
      };
    }
  },

  getAllFixtures: async (teamId?: number) => {
    let url = '/api/football/fixtures/all';
    if (teamId) {
      url += `?team_id=${teamId}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getPersonalizedNews: async () => {
    try {
      const response = await api.get('/api/football/personalized-news');
      return response.data;
    } catch (err: any) {
      // If endpoint doesn't exist, return empty response
      return {
        favorite_team_news: null,
        fpl_player_news: null,
        combined_news: [],
        total_count: 0,
      };
    }
  },

  getHeadToHead: async (team1Id: number, team2Id: number, last: number = 10) => {
    const response = await api.get(`/api/football/head-to-head?team1_id=${team1Id}&team2_id=${team2Id}&last=${last}`);
    return response.data;
  },
};

// Weekly Picks API
export const weeklyPicksApi = {
  submitPicks: async (gameweek: number, picks: {
    scorePredictions: Array<{
      fixtureId: number;
      homeScore: number;
      awayScore: number;
    }>;
    playerPicks: Array<{
      playerId: number;
      fixtureId: number;
    }>;
  }) => {
    const response = await api.post(`/api/weekly-picks/submit`, {
      gameweek,
      ...picks,
    });
    return response.data;
  },

  getPicks: async (gameweek: number) => {
    const response = await api.get(`/api/weekly-picks/${gameweek}`);
    return response.data;
  },

  getResults: async (gameweek: number) => {
    const response = await api.get(`/api/weekly-picks/${gameweek}/results`);
    return response.data;
  },

  getLeaderboard: async (gameweek?: number, leagueId?: number) => {
    let url = '/api/weekly-picks/leaderboard';
    const params = new URLSearchParams();
    if (gameweek) params.append('gameweek', String(gameweek));
    if (leagueId) params.append('league_id', String(leagueId));
    if (params.toString()) url += `?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  },

  createLeague: async (name: string, description?: string, type: 'weekly' | 'seasonal' | 'both' = 'both') => {
    const response = await api.post('/api/weekly-picks/leagues', {
      name,
      description,
      type,
    });
    return response.data;
  },

  getLeagues: async () => {
    const response = await api.get('/api/weekly-picks/leagues');
    return response.data;
  },

  getLeague: async (leagueId: number) => {
    const response = await api.get(`/api/weekly-picks/leagues/${leagueId}`);
    return response.data;
  },

  joinLeague: async (code: string) => {
    const response = await api.post('/api/weekly-picks/leagues/join', { code });
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/api/weekly-picks/statistics');
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/api/weekly-picks/history');
    return response.data;
  },
};

