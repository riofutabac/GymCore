
import { User } from './types';
import { authAPI } from './api';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('gymcore_token');
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('gymcore_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setAuth(user: User, token: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('gymcore_token', token);
  localStorage.setItem('gymcore_user', JSON.stringify(user));
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('gymcore_token');
  localStorage.removeItem('gymcore_user');
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) return null;
  
  try {
    const user = await authAPI.me();
    // Actualizar usuario almacenado
    if (typeof window !== 'undefined') {
      localStorage.setItem('gymcore_user', JSON.stringify(user));
    }
    return user;
  } catch {
    clearAuth();
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export function hasRole(user: User | null, allowedRoles: User['role'][]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
