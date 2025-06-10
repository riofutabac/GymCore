import { cookies } from 'next/headers';
import type { User } from './types';

// Función que solo funciona en el servidor
export const getCurrentUserServer = async (): Promise<User | null> => {
  try {
    console.log('🖥️ getCurrentUserServer - Ejecutando en servidor');
    
    const cookieStore = await cookies();
    
    // Buscar token en cookies del servidor
    const tokenCookie = cookieStore.get('gymcore_token') || 
                       cookieStore.get('token') || 
                       cookieStore.get('auth-token');
    
    const userCookie = cookieStore.get('gymcore_user') || 
                      cookieStore.get('user');
    
    console.log('🍪 Token en cookies:', !!tokenCookie);
    console.log('👤 Usuario en cookies:', !!userCookie);
    
    if (!tokenCookie) {
      console.log('❌ No hay token en cookies del servidor');
      return null;
    }
    
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie.value);
        console.log('✅ Usuario encontrado en cookies del servidor:', user.email || user.name);
        return user;
      } catch (parseError) {
        console.error('🚨 Error al parsear usuario de cookies:', parseError);
      }
    }
    
    // Si tenemos token pero no usuario, intentar obtener del backend
    console.log('⚠️ Token encontrado pero no usuario en cookies');
    return null;
    
  } catch (cookieError) {
    console.error('🚨 Error al acceder cookies en servidor:', cookieError);
    return null;
  }
};
