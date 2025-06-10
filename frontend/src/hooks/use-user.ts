
'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { getStoredUser, getCurrentUser } from '@/lib/auth';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Primero intentar obtener del storage local
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }

        // Luego verificar con el servidor
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const updateUser = (newUser: User) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gymcore_user', JSON.stringify(newUser));
    }
  };

  return {
    user,
    loading,
    updateUser,
    isAuthenticated: !!user,
  };
}
