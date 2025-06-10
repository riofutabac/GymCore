import { useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

export function useCurrentUser() {
  const { user, token, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const userData = await api.auth.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError('No se pudo obtener la información del usuario');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token, setUser]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!token && !!user,
  };
}
