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
};

