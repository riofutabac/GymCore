'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from './types';
import { createSupabaseBrowserClient } from './supabase';
import { useEffect } from 'react';

import { authApi, chatApi } from './api';
import { socketService } from './socket';

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

          // Get current session from Supabase
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            set({ user: null, isAuthenticated: false });
            return;
          }

          // Wait a bit to ensure the interceptor has the session
          await new Promise(resolve => setTimeout(resolve, 100));

          // Get user profile from our backend
          const user = await authApi.getProfile();

          set({
            user: user,
            isAuthenticated: true,
            error: null
          });
          
          // Conectar al socket después de autenticar
          socketService.connect();
        } catch (error) {
          console.error('Error al obtener perfil del usuario:', error);

          // If it's a 401, it might be that the user exists in Supabase but not in our DB
          if (error.response?.status === 401) {
            try {
              const supabase = createSupabaseBrowserClient();
              const { data: { session } } = await supabase.auth.getSession();

              if (session?.user) {
                // For now, just sign out and let them try again
                await supabase.auth.signOut();
                set({
                  user: null,
                  isAuthenticated: false,
                  error: 'Usuario no encontrado en la base de datos. Por favor, intenta registrarte nuevamente.'
                });
                return;
              }
            } catch (syncError) {
              console.error('Error during user sync attempt:', syncError);
            }
          }

          set({
            user: null,
            isAuthenticated: false,
            error: 'Error al obtener perfil del usuario'
          });
        }
      },
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const supabase = createSupabaseBrowserClient();

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) throw error;

          if (!data.session) {
            throw new Error('No se pudo iniciar sesión');
          }

          // Wait a moment for the session to be fully established
          await new Promise(resolve => setTimeout(resolve, 200));

          // The auth state change will trigger refreshUser automatically
          // through the useSupabaseAuth hook, so we don't need to call it here
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
// ... (después de tu gymStore)


interface ChatState {
  conversations: any[];
  activeConversationId: string | null;
  messages: any[];
  setConversations: (conversations: any[]) => void;
  setActiveConversation: (conversationId: string) => void;
  addMessage: (message: any) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (conversationId) => {
    set({ activeConversationId: conversationId, messages: [] });
    socketService.joinConversation(conversationId);
    get().fetchMessages(conversationId);
  },
  addMessage: (message) => {
    if (message.conversationId === get().activeConversationId) {
      set((state) => {
        // Verificar si el mensaje ya existe para evitar duplicados
        const messageExists = state.messages.some(msg => 
          // Si tiene ID real, comparar por ID
          (msg.id && msg.id === message.id) || 
          // Si es un mensaje temporal, comparar por contenido y timestamp
          (msg._status === 'sending' && 
           msg.content === message.content && 
           Math.abs(new Date(msg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5000)
        );
        return { messages: [...state.messages, message] };
      });
    }
  },
  fetchConversations: async () => {
    const conversations = await chatApi.getConversations();
    set({ conversations });
  },
  fetchMessages: async (conversationId) => {
    const messages = await chatApi.getMessages(conversationId);
    set({ messages });
  },
}));

// La conexión del socket se maneja en el método refreshUser del authStore
// y los listeners se configuran en el componente ChatNotification
// Exportar los stores
export const useAuthStore = authStore;
export const useGymStore = gymStore;
export { useChatStore };