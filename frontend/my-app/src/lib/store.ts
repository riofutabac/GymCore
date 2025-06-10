'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User } from './types';
import api from './api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string, email: string, password: string }) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  currentGymId: number | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      currentGymId: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.auth.login({ email, password });
          const { token, user } = response;
          
          Cookies.set('auth_token', token, { expires: 7, secure: true });
          set({ user, token, isAuthenticated: true, error: null });

          if (user.gyms && user.gyms.length > 0) {
            set({ currentGymId: user.gyms[0].id });
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Error en el inicio de sesión';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.auth.register(userData);
          
          // Guardar el token en las cookies, igual que en login
          Cookies.set('auth_token', response.token, { expires: 7, secure: true });
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al registrarse',
          });
          throw error;
        }
      },
      
      logout: () => {
        Cookies.remove('auth_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          currentGymId: null,
          error: null,
        });
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Store para el gimnasio actual (útil para managers y recepcionistas)
interface GymState {
  currentGym: any | null;
  isLoading: boolean;
  error: string | null;
  fetchCurrentGym: () => Promise<void>;
}

export const useGymStore = create<GymState>()((set) => ({
  currentGym: null,
  isLoading: false,
  error: null,
  
  fetchCurrentGym: async () => {
    set({ isLoading: true, error: null });
    try {
      const gym = await api.gyms.getMyGym();
      set({ currentGym: gym, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al obtener el gimnasio',
      });
    }
  },
}));
