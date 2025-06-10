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
export const redirectByRole = (user: User, redirect?: string): void => {
  if (typeof window !== 'undefined') {
    try {
      console.log('redirectByRole - Usuario:', user);
      console.log('redirectByRole - Rol detectado:', user.role);
      
      // Si hay una redirección específica, usarla primero
      if (redirect) {
        console.log('redirectByRole - Redirección específica a:', redirect);
        window.location.href = redirect;
        return;
      }
      
      // Extraer el rol de manera segura, asegurando que sea una cadena
      const role = typeof user.role === 'string' ? user.role.toUpperCase() : 'CLIENT';
      
      console.log('redirectByRole - Redirigiendo usuario con rol:', role);
      
      // Usar un enfoque más directo para la redirección
      let targetUrl = '/member'; // Valor predeterminado
      
      if (role === 'SYS_ADMIN') targetUrl = '/admin';
      else if (role === 'MANAGER') targetUrl = '/manager'; 
      else if (role === 'RECEPTION') targetUrl = '/reception';
      else if (role === 'CLIENT') targetUrl = '/member';
      
      console.log('redirectByRole - URL destino:', targetUrl);
      
      // Usar una redirección forzada
      setTimeout(() => {
        window.location.href = targetUrl;
        console.log('redirectByRole - Redirección ejecutada a:', targetUrl);
      }, 100);
    } catch (error) {
      console.error('Error al redireccionar:', error);
      // En caso de error, redirigir a una ruta segura
      window.location.href = '/member';
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
