'use client';

import { useEffect } from 'react';
import { useAuthStore } from './store';
import { createSupabaseBrowserClient } from './supabase';

/**
 * Hook para inicializar la autenticación con Supabase
 * Se debe usar en el layout principal de la aplicación
 */
export function useSupabaseAuth() {
  const { refreshUser } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        
        // Verificar si hay una sesión activa
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          // Si hay sesión, refrescar los datos del usuario
          await refreshUser();
        }
        
        // Configurar listener para cambios en la autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {            
            if (event === 'SIGNED_IN' && session) {
              // Wait a bit to ensure the session is fully established
              await new Promise(resolve => setTimeout(resolve, 300));
              // Sesión iniciada o actualizada
              await refreshUser();
            } else if (event === 'SIGNED_OUT' || !session) {
              // Sesión cerrada
              useAuthStore.setState({ 
                user: null, 
                isAuthenticated: false,
                currentGymId: null
              });
            }
          }
        );
        
        // Limpiar suscripción al desmontar
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };
    
    initializeAuth();
  }, [refreshUser]);
}
