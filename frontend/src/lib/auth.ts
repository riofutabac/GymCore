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
    console.log('🔄 redirectByRole llamado con:', { 
      userRole: user?.role, 
      userName: user?.name,
      customRedirect 
    });
    
    // Si hay un redirect personalizado, lo usa primero
    if (customRedirect) {
      console.log('➡️ Redirigiendo a URL personalizada:', customRedirect);
      window.location.href = customRedirect;
      return;
    }

    // Redirecciona según el rol del usuario
    console.log('🎭 Verificando rol del usuario:', user.role);
    
    switch (user.role) {
      case 'SYS_ADMIN':
        console.log('👑 Rol SYS_ADMIN detectado, redirigiendo a /admin');
        window.location.href = '/admin';
        break;
      case 'MANAGER':
        console.log('👔 Rol MANAGER detectado, redirigiendo a /manager');
        window.location.href = '/manager';
        break;
      case 'RECEPTION':
        console.log('🏪 Rol RECEPTION detectado, redirigiendo a /reception');
        window.location.href = '/reception';
        break;
      case 'CLIENT':
        console.log('👤 Rol CLIENT detectado, redirigiendo a /member');
        window.location.href = '/member';
        break;
      case 'MEMBER':
        console.log('👤 Rol MEMBER detectado, redirigiendo a /member');
        window.location.href = '/member';
        break;
      default:
        console.log('❓ Rol desconocido:', user.role, 'redirigiendo a /');
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

// Obtener el usuario actual (solo en el cliente)
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Esta función solo funciona en el cliente
    if (typeof window === 'undefined') {
      return null;
    }
    
    // Si no hay token, no hay usuario autenticado
    const token = getAuthToken();
    if (!token) {
      return null;
    }
    
    // Primero intentar obtener del almacenamiento local
    const storedUser = getStoredUser();
    
    // Intentar refrescar los datos del usuario desde el servidor
    try {
      const freshUser = await authAPI.me();
      
      if (freshUser) {
        storeUserInfo(freshUser, token);
        return freshUser;
      }
    } catch (apiError) {
      // Si hay un error de API, seguimos usando el usuario almacenado
    }
    
    return storedUser;
    
  } catch (error) {
    // Si ocurre un error, limpiar la autenticación por seguridad
    clearAuth();
    return null;
  }
};

// Nueva función para establecer cookies en el servidor
export const setServerCookies = (user: User, token: string): void => {
  // Esta función será llamada desde el lado del cliente después del login
  // para establecer cookies que el servidor pueda leer
  if (typeof window !== 'undefined') {
    // Establecer cookies que el servidor pueda leer
    document.cookie = `gymcore_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    document.cookie = `gymcore_user=${JSON.stringify(user)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }
};

// Alias de getStoredUser para facilitar la migración de código
export const getUser = getStoredUser;
