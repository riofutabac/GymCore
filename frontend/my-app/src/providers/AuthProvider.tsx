'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { User } from '@/lib/types';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token, setUser, setToken, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const userData = await api.auth.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Error verificando autenticación:', error);
          clearAuth();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token, setUser, clearAuth]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: userData, token: authToken } = await api.auth.login(email, password);
      setUser(userData);
      setToken(authToken);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      
      // Registrar usuario con Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) throw error;
      
      // Guardar el token en cookies para solicitudes posteriores
      if (data.session) {
        Cookies.set('auth_token', data.session.access_token, { expires: 7, secure: true });
      }
      
      // Obtener datos completos del usuario desde nuestra API
      if (data.user) {
        try {
          const userData = await api.auth.getProfile();
          setUser(userData);
        } catch (profileError) {
          console.error('Error al obtener perfil después del registro:', profileError);
          // Continuar con los datos básicos del usuario
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: name,
            role: 'USER'
          } as User);
        }
      }
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
