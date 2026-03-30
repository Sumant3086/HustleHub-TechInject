'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from './api-client';
import type { AuthResponse, RegisterDto, LoginDto } from '@alternative/core';

interface AuthState {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  register: (dto: RegisterDto) => Promise<AuthResponse>;
  login: (dto: LoginDto, tenantSlug: string) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwt(token: string): { userId: string; tenantId: string; email: string; role: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return Date.now() / 1000 > payload.exp - 30;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Decode JWT locally - no network call needed
    const token = localStorage.getItem('accessToken');
    if (token && !isTokenExpired(token)) {
      const payload = decodeJwt(token);
      if (payload) {
        setState({
          user: { id: payload.userId, email: payload.email, tenantId: payload.tenantId, role: payload.role },
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
    }
    // No valid token
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const register = async (dto: RegisterDto) => {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', dto);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setState({ user: response.user, isAuthenticated: true, isLoading: false });
    return response;
  };

  const login = async (dto: LoginDto, tenantSlug: string) => {
    const response = await apiClient.post<AuthResponse>(`/api/auth/login?tenant=${tenantSlug}`, dto);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setState({ user: response.user, isAuthenticated: true, isLoading: false });
    return response;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
