'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from './api';

interface User {
  id: number;
  email: string;
  username: string;
  fpl_team_id: number | null;
  favorite_team_id: number | null;
  is_active: boolean;
  is_premium: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, fplTeamId?: number) => Promise<void>;
  logout: () => void;
  updateFplTeamId: (fplTeamId: number) => Promise<void>;
  updateFavoriteTeamId: (favoriteTeamId: number) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        localStorage.removeItem('token');
        setToken(null);
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (error: any) {
      // Better error handling for debugging
      console.error('[Auth] Login error:', error);
      if (error.response) {
        // Backend responded with error
        throw error;
      } else if (error.request) {
        // Request made but no response (likely CORS or network issue)
        throw new Error(
          'Cannot connect to backend server. Please check that the backend is running and CORS is configured correctly.'
        );
      } else {
        // Something else happened
        throw new Error('Login failed. Please try again.');
      }
    }
  };

  const register = async (email: string, username: string, password: string, fplTeamId?: number) => {
    await authApi.register(email, username, password, fplTeamId);
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateFplTeamId = async (fplTeamId: number) => {
    const updatedUser = await authApi.updateFplTeamId(fplTeamId);
    setUser(updatedUser);
  };

  const updateFavoriteTeamId = async (favoriteTeamId: number) => {
    const updatedUser = await authApi.updateFavoriteTeamId(favoriteTeamId);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateFplTeamId, updateFavoriteTeamId, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

