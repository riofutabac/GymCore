'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from './types';
import { createSupabaseBrowserClient } from './supabase';
import { useEffect } from 'react';

import { authApi } from './api';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  clearError: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string }) => Promise<boolean>;
};

type GymState = {
  currentGym: any | null;
  isLoading: boolean;
  error: string | null;
  fetchCurrentGym: () => Promise<void>;
};

const authStore = create<AuthState>(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearError: () => set({ error: null }),
      logout: async () => {
        set({ isLoading: true });
        try {
          const supabase = createSupabaseBrowserClient();
          await supabase.auth.signOut();
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false
          });
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al cerrar sesión',
            isLoading: false
          });
        }
      },
      refreshUser: async () => {
        try {
          const supabase = createSupabaseBrowserClient();
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }
          
          try {
            const user = await authApi.getProfile();
            set({
              user: user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } catch (profileError) {
            console.error('Error al obtener perfil del usuario:', profileError);
            // Si falla obtener el perfil, cerrar sesión
            await supabase.auth.signOut();
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: 'Error al cargar datos del usuario'
            });
          }
        } catch (error) {
          console.error('Error al verificar sesión:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: 'Error de conexión'
          });
        }
      },
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const supabase = createSupabaseBrowserClient();
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) throw error;
          
          // Refresh user data after successful login
          await authStore.getState().refreshUser();
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al iniciar sesión',
            isLoading: false
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const supabase = createSupabaseBrowserClient();
          
          // Registrar usuario con Supabase
          const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              data: {
                name: userData.name,
                role: 'CLIENT'
              }
            }
          });
          
          if (error) {
            console.error('Supabase signup error:', error);
            throw new Error(error.message || 'Error al registrar usuario en Supabase');
          }
          
          if (!data.user) {
            throw new Error('No se pudo crear el usuario');
          }
          
          // Si el usuario necesita confirmar email, mostrar mensaje apropiado
          if (!data.session && data.user && !data.user.email_confirmed_at) {
            set({
              error: 'Por favor revisa tu email para confirmar tu cuenta',
              isLoading: false
            });
            return false;
          }
          
          // Si hay sesión, actualizar el estado
          if (data.session) {
            try {
              await authStore.getState().refreshUser();
            } catch (profileError) {
              console.warn('No se pudo obtener el perfil completo, usando datos básicos');
              set({
                user: {
                  id: data.user.id,
                  email: data.user.email || '',
                  name: userData.name,
                  role: 'CLIENT'
                } as User,
                isAuthenticated: true,
                isLoading: false
              });
            }
          }
          
          return true;
        } catch (error) {
          console.error('Error en registro:', error);
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido al registrar usuario';
          set({
            error: errorMessage,
            isLoading: false
          });
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state: AuthState) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);

const gymStore = create<GymState>((set) => ({
  currentGym: null,
  isLoading: false,
  error: null,
  fetchCurrentGym: async () => {
    set({ isLoading: true, error: null });
    try {
      const gym = await authApi.gyms.getMyGym();
      set({ currentGym: gym, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al obtener el gimnasio'
      });
    }
  }
}));

// Hook para sincronizar el estado de Supabase con Zustand
export function useSyncSupabaseAuth() {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    
    // Escuchar cambios en la sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        await authStore.getState().refreshUser();
      } else if (event === 'SIGNED_OUT') {
        authStore.setState({ user: null, isAuthenticated: false });
      }
    });

    // Verificar sesión inicial
    authStore.getState().refreshUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);
}

// Exportar los stores
export const useAuthStore = authStore;
export const useGymStore = gymStore;
