import { cookies } from 'next/headers';
import type { User } from './types';

// Función que solo funciona en el servidor
export const getCurrentUserServer = async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();
    
    // Buscar token en cookies del servidor
    const tokenCookie = cookieStore.get('gymcore_token') || 
                       cookieStore.get('token') || 
                       cookieStore.get('auth-token');
    
    const userCookie = cookieStore.get('gymcore_user') || 
                      cookieStore.get('user');
    
    if (!tokenCookie) {
      return null;
    }
    
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie.value);
        return user;
      } catch (parseError) {
        // Error al parsear usuario de cookies
      }
    }
    
    // Si tenemos token pero no usuario, intentar obtener del backend
    return null;
    
  } catch (cookieError) {
    return null;
  }
};
