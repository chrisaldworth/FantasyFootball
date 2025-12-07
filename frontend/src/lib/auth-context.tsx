'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from './api';

interface User {
  id: number;
  email: string;
  username: string;
  fpl_team_id: number | null;
  is_active: boolean;
  is_premium: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, fplTeamId?: number) => Promise<void>;
  logout: () => void;
  updateFplTeamId: (fplTeamId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('token', data.access_token);
    const userData = await authApi.getMe();
    setUser(userData);
  };

  const register = async (email: string, username: string, password: string, fplTeamId?: number) => {
    await authApi.register(email, username, password, fplTeamId);
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateFplTeamId = async (fplTeamId: number) => {
    const updatedUser = await authApi.updateFplTeamId(fplTeamId);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateFplTeamId }}>
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

