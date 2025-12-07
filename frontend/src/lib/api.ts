import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

