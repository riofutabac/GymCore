'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { Gym } from '@/lib/types';
import { useAuthStore } from '@/lib/store';
import { createSupabaseBrowserClient } from '@/lib/supabase';

export default function JoinGymPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Verificar si hay una sesión activa de Supabase
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          // No hay sesión activa, redirigir al login
          router.push('/login');
          return;
        }
        
        // Refrescar datos del usuario desde la API
        if (!user) {
          await useAuthStore.getState().refreshUser();
        }
        
        // Si el usuario ya tiene un gimnasio asignado, redirigir al dashboard
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.memberOfGyms && currentUser.memberOfGyms.length > 0) {
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error);
        router.push('/login');
      }
    };
    
    checkSession();
  }, [router]);

    // Cargar la lista de gimnasios
    const fetchGyms = async () => {
      try {
        setIsLoading(true);
        const gymsData = await api.gyms.getAll();
        setGyms(gymsData.filter(gym => gym.isActive));
      } catch (err) {
        console.error('Error al cargar gimnasios:', err);
        setError('No se pudieron cargar los gimnasios disponibles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGyms();
  }, [isAuthenticated, router, user]);

  // Filtrar gimnasios según el término de búsqueda
  const filteredGyms = gyms.filter(gym => 
    gym.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    gym.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoinGym = async (gymId: string) => {
    try {
      setIsJoining(true);
      setError(null);
      
      await api.members.joinGym(gymId);
      
      // Refrescar datos del usuario para obtener la nueva membresía
      await useAuthStore.getState().refreshUser();
      
      // Redirigir al dashboard después de unirse exitosamente
      router.push('/dashboard');
    } catch (err) {
      console.error('Error al unirse al gimnasio:', err);
      setError('No se pudo completar la solicitud para unirse al gimnasio');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Unirse a un Gimnasio</CardTitle>
          <CardDescription>
            Selecciona un gimnasio para completar tu registro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="search">Buscar Gimnasio</Label>
            <Input
              id="search"
              placeholder="Nombre o dirección del gimnasio"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Gimnasios Disponibles</Label>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <p>Cargando gimnasios...</p>
              </div>
            ) : filteredGyms.length > 0 ? (
              <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-2">
                {filteredGyms.map(gym => (
                  <div
                    key={gym.id}
                    className={`cursor-pointer rounded-md border p-4 transition-colors ${
                      selectedGym?.id === gym.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedGym(gym)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{gym.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {gym.address}
                        </p>
                      </div>
                      {selectedGym?.id === gym.id && (
                        <div className="rounded-full bg-primary p-1 text-primary-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border p-8 text-center">
                <p className="text-muted-foreground">
                  No se encontraron gimnasios que coincidan con tu búsqueda
                </p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={() => selectedGym && handleJoinGym(selectedGym.id)}
            className="w-full"
            disabled={!selectedGym || isJoining}
          >
            {isJoining ? 'Procesando...' : 'Unirse al Gimnasio'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
