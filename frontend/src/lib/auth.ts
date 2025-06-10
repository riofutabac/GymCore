import type { User } from './types';
import { authAPI } from './api';

// Guardar información del usuario autenticado
export const storeUserInfo = (user: User, token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gymcore_user', JSON.stringify(user));
    localStorage.setItem('gymcore_token', token);
  }
};

// Obtener usuario autenticado
export const getStoredUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userJson = localStorage.getItem('gymcore_user');
    if (userJson) {
      return JSON.parse(userJson);
    }
  }
  return null;
};

// Obtener token de autenticación
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gymcore_token');
  }
  return null;
};

// Verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Redirigir según el rol del usuario
export const redirectByRole = (user: any, customRedirect?: string): void => {
  if (typeof window !== 'undefined') {
    // Si hay un redirect personalizado, lo usa primero
    if (customRedirect) {
      window.location.href = customRedirect;
      return;
    }

    // Redirecciona según el rol del usuario
    switch (user.role) {
      case 'ADMIN':
        window.location.href = '/admin';
        break;
      case 'MANAGER':
        window.location.href = '/manager';
        break;
      case 'RECEPTION':
        window.location.href = '/reception';
        break;
      case 'MEMBER':
        window.location.href = '/member';
        break;
      default:
        // Ruta por defecto si no coincide ningún rol
        window.location.href = '/';
        break;
    }
  }
};

// Cerrar sesión
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('gymcore_token');
    localStorage.removeItem('gymcore_user');
    window.location.href = '/login';
  }
};

// Limpiar autenticación (sin redirección)
export const clearAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('gymcore_token');
    localStorage.removeItem('gymcore_user');
  }
};

// Obtener el usuario actual, verificando con el servidor si está disponible
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Si no hay token, no hay usuario autenticado
    if (!getAuthToken()) {
      return null;
    }
    
    // Primero intentar obtener del almacenamiento local
    const storedUser = getStoredUser();
    
    // En el lado del cliente, intentar refrescar los datos del usuario desde el servidor
    if (typeof window !== 'undefined') {
      try {
        // Llamar a la API para obtener los datos actualizados del usuario
        const freshUser = await authAPI.me();
        // Actualizar el usuario almacenado con los datos más recientes
        if (freshUser) {
          // Mantener el token actual
          const token = getAuthToken() || '';
          storeUserInfo(freshUser, token);
          return freshUser;
        }
      } catch (error) {
        console.error('Error al refrescar datos del usuario:', error);
        // Si hay un error, seguimos usando el usuario almacenado
      }
    }
    
    return storedUser;
  } catch (error) {
    console.error('Error en getCurrentUser:', error);
    // Si ocurre un error, limpiar la autenticación por seguridad
    clearAuth();
    return null;
  }
};
