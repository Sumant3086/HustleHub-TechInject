import { writable } from 'svelte/store';
import { apiClient } from '../api/client';
import type { AuthResponse, RegisterDto, LoginDto } from '@preferred/core';

export interface AuthState {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Decode JWT payload without verifying signature (verification happens on API)
function decodeJwt(token: string): { userId: string; tenantId: string; email: string; role: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  // Check if expired (with 30s buffer)
  return Date.now() / 1000 > payload.exp - 30;
}

function createAuthStore() {
  const { subscribe, set } = writable<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  return {
    subscribe,
    async register(dto: RegisterDto) {
      const response = await apiClient.post<AuthResponse>('/api/auth/register', dto);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
      return response;
    },
    async login(dto: LoginDto, tenantSlug: string) {
      const response = await apiClient.post<AuthResponse>(
        `/api/auth/login?tenant=${tenantSlug}`,
        dto
      );
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
      return response;
    },
    logout() {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    },
    checkAuth() {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      if (isTokenExpired(token)) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Decode user info from token - no network call needed
      const payload = decodeJwt(token);
      if (!payload) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      set({
        user: {
          id: payload.userId,
          email: payload.email,
          tenantId: payload.tenantId,
          role: payload.role,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    },
  };
}

export const authStore = createAuthStore();
