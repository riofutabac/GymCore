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

// Obtener el usuario actual (solo en el cliente)
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    console.log('🔄 getCurrentUser - Verificando contexto...');
    
    // Esta función solo funciona en el cliente
    if (typeof window === 'undefined') {
      console.log('⚠️ getCurrentUser llamado en el servidor - retornando null');
      return null;
    }
    
    console.log('🌐 Ejecutando en cliente');
    
    // Si no hay token, no hay usuario autenticado
    const token = getAuthToken();
    if (!token) {
      console.log('❌ No hay token en localStorage');
      return null;
    }
    
    console.log('🔑 Token encontrado en localStorage');
    
    // Primero intentar obtener del almacenamiento local
    const storedUser = getStoredUser();
    console.log('👤 Usuario en localStorage:', storedUser ? 'Sí' : 'No');
    
    // Intentar refrescar los datos del usuario desde el servidor
    try {
      console.log('🔄 Refrescando datos del usuario desde API...');
      const freshUser = await authAPI.me();
      
      if (freshUser) {
        console.log('✅ Usuario actualizado desde API:', freshUser.email || freshUser.name);
        storeUserInfo(freshUser, token);
        return freshUser;
      }
    } catch (apiError) {
      console.error('🚨 Error al refrescar datos del usuario:', apiError);
      // Si hay un error de API, seguimos usando el usuario almacenado
    }
    
    console.log('📦 Usando usuario almacenado localmente');
    return storedUser;
    
  } catch (error) {
    console.error('💥 Error general en getCurrentUser:', error);
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
