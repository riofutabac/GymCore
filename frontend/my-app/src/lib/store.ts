'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from './types';
import { createSupabaseBrowserClient } from './supabase';
import { useEffect } from 'react';

import { authApi, chatApi } from './api';
import api from './api';
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
  clearCurrentGym: () => void;
};

const authStore = create<AuthState>()(
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
          socketService.connect();        } catch (error: any) {
          console.error('Error al obtener perfil del usuario:', error);

          // If it's a 401, it might be that the user exists in Supabase but not in our DB
          if (error.response?.status === 401) {
            try {
              const supabase = createSupabaseBrowserClient();
              const { data: { session } } = await supabase.auth.getSession();

              if (session?.user) {
                // Try to sync the user to our database
                console.log('Attempting to sync user to database...');
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
  error: null,  fetchCurrentGym: async () => {
    set({ isLoading: true, error: null });
    try {
      const gym = await api.gyms.getMyGym();
      set({ currentGym: gym, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al obtener el gimnasio'
      });
    }
  },
  clearCurrentGym: () => {
    set({ currentGym: null, isLoading: false, error: null });
  }
}));

// Hook para sincronizar el estado de Supabase con Zustand
export function useSyncSupabaseAuth() {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Escuchar cambios en la sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
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


interface ChatStore {
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setActiveConversation: (conversationId: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  messages: [],
  activeConversationId: null,
  isLoading: false,
  error: null,

  setActiveConversation: (conversationId) => {
    const currentId = get().activeConversationId;
    
    // Solo cambiar si es diferente
    if (currentId !== conversationId) {
      set({ 
        activeConversationId: conversationId,
        messages: [], // Limpiar mensajes anteriores
        error: null 
      });
      
      // Cargar mensajes inmediatamente si hay conversación
      if (conversationId) {
        get().fetchMessages(conversationId);
        
        // Unirse a la conversación en el socket
        if (typeof window !== 'undefined') {
          import('./socket').then(({ socketService }) => {
            if (socketService.isConnected()) {
              socketService.joinConversation(conversationId);
            }
          });
        }
      }
    }
  },

  fetchConversations: async () => {
    const currentConversations = get().conversations;
    
    try {
      // Solo mostrar loading si no hay conversaciones cargadas
      if (currentConversations.length === 0) {
        set({ isLoading: true, error: null });
      }
      
      const conversations = await chatApi.getConversations();
      
      // Verificar si hay cambios reales antes de actualizar
      const hasChanges = conversations.length !== currentConversations.length ||
        conversations.some(conv => 
          !currentConversations.find(curr => 
            curr.id === conv.id && curr.updatedAt === conv.updatedAt
          )
        );
      
      if (hasChanges) {
        set({ conversations, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error loading conversations',
        isLoading: false 
      });
    }
  },

  fetchMessages: async (conversationId) => {
    const currentConversationId = get().activeConversationId;
    
    // Solo cargar si es la conversación activa
    if (currentConversationId !== conversationId) return;
    
    try {
      set({ isLoading: true, error: null });
      const messages = await chatApi.getMessages(conversationId);
      
      // Solo actualizar si sigue siendo la conversación activa
      if (get().activeConversationId === conversationId) {
        set({ messages, isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (get().activeConversationId === conversationId) {
        set({ 
          error: error instanceof Error ? error.message : 'Error loading messages',
          isLoading: false 
        });
      }
    }
  },

  addMessage: (message) => {
    const { messages, activeConversationId, conversations } = get();
    
    console.log('📨 Agregando mensaje al store:', {
      messageId: message.id,
      conversationId: message.conversationId,
      activeConversationId,
      senderId: message.senderId,
      content: message.content
    });
    
    // Solo agregar si es de la conversación activa
    if (message.conversationId === activeConversationId) {
      // Verificar que no existe ya el mensaje
      const existingMessage = messages.find(m => m.id === message.id);
      if (!existingMessage) {
        console.log('✅ Agregando mensaje a la conversación activa');
        set({ messages: [...messages, message] });
      } else {
        console.log('⚠️ Mensaje ya existe en la conversación activa');
      }
    } else {
      console.log(`ℹ️ Mensaje no es para la conversación activa (${message.conversationId} vs ${activeConversationId})`);
    }
    
    // Actualizar la conversación con el último mensaje (siempre)
    const updatedConversations = conversations.map(conv => {
      if (conv.id === message.conversationId) {
        console.log(`📝 Actualizando última actividad de conversación: ${conv.id}`);
        return {
          ...conv,
          messages: [message], // Último mensaje para preview
          updatedAt: message.createdAt
        };
      }
      return conv;
    });
    
    // Si no encontramos la conversación, necesitamos recargar la lista
    const conversationFound = conversations.some(conv => conv.id === message.conversationId);
    if (!conversationFound) {
      console.log('⚠️ Conversación no encontrada en la lista, recargando...');
      // Recargar conversaciones para incluir la nueva
      get().fetchConversations();
    } else {
      set({ conversations: updatedConversations });
    }
  },

  addConversation: (conversation) => {
    const conversations = get().conversations;
    const exists = conversations.find(c => c.id === conversation.id);
    
    if (!exists) {
      set({ conversations: [conversation, ...conversations] });
    }
  },

  updateConversation: (conversationId, updates) => {
    const conversations = get().conversations;
    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId ? { ...conv, ...updates } : conv
    );
    set({ conversations: updatedConversations });
  },

  clearMessages: () => set({ messages: [] }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// Configurar listeners del socket una sola vez cuando se inicializa el store
if (typeof window !== 'undefined') {
  let listenersConfigured = false;
  
  const configureSocketListeners = () => {
    if (listenersConfigured) return;
    
    import('./socket').then(({ socketService }) => {
      console.log('🔗 Configurando listeners del socket en el store...');
      
      // Configurar listener para nuevos mensajes
      socketService.onNewMessage((message) => {
        console.log('📨 Nuevo mensaje recibido en store:', {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          conversationId: message.conversationId,
          sender: message.sender
        });
        
        // Validar que el mensaje tenga los datos necesarios
        if (!message.conversationId) {
          console.error('❌ Mensaje sin conversationId:', message);
          return;
        }
        
        if (!message.senderId || message.senderId === 'temp-user-id') {
          console.error('❌ Mensaje con senderId temporal o inválido:', message);
          return;
        }
        
        useChatStore.getState().addMessage(message);
      });

      // Configurar listener para actualizaciones de conversación
      socketService.onConversationUpdate((conversation) => {
        console.log('💬 Conversación actualizada en store:', conversation);
        // Recargar conversaciones para obtener los cambios más recientes
        useChatStore.getState().fetchConversations();
      });

      // Configurar listener para errores
      socketService.onError((error) => {
        console.error('❌ Error de socket en store:', error);
        useChatStore.getState().setError(error?.message || 'Error de conexión');
      });
      
      listenersConfigured = true;
      console.log('✅ Listeners del socket configurados exitosamente');
    });
  };
  
  // Configurar listeners inmediatamente
  configureSocketListeners();
}

// Exportar los stores
export const useAuthStore = authStore;
export const useGymStore = gymStore;