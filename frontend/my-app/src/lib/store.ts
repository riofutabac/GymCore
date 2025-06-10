import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from './types';
import api from './api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.auth.login({ email, password });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al iniciar sesión',
          });
          throw error;
        }
      },
      
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.auth.register({ name, email, password });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al registrarse',
          });
          throw error;
        }
      },
      
      logout: () => {
        api.auth.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
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
