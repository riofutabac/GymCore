'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi, chatApi } from '@/lib/api';
import { useChatStore, useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';
import { Loader2, UserCheck, MessageSquarePlus } from 'lucide-react';
import { toast } from 'sonner';

export function ManagerList() {
  const { user } = useAuthStore();
  const { setActiveConversation } = useChatStore();

  // Obtener los gerentes para el propietario
  const { data: managers, isLoading, error } = useQuery({
    queryKey: ['owner-managers', user?.id],
    queryFn: async () => {
      try {
        return await authApi.getMyManagers();
      } catch (error) {
        console.error('Error fetching managers:', error);
        return [];
      }
    },
    enabled: !!user && user.role === 'OWNER',
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  const handleStartConversation = async (managerId: string, gymId: string, managerName: string) => {
    try {
      console.log(`Iniciando conversación con manager ${managerId} en gym ${gymId}`);
      const conversation = await chatApi.initiateConversation(gymId, managerId);
      setActiveConversation(conversation.id);
      toast.success('Conversación iniciada', {
        description: `Chat con ${managerName} establecido`
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Error al iniciar conversación', {
        description: error instanceof Error ? error.message : 'Intente nuevamente más tarde',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
        <span className="text-sm text-muted-foreground">Cargando gerentes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-destructive mb-2">Error al cargar gerentes</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!managers || managers.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <UserCheck className="h-6 w-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay gerentes disponibles</p>
        <p className="text-xs mt-1">Asigna gerentes a tus gimnasios para poder chatear con ellos</p>
      </div>
    );
  }

  return (
    <div className="border-t">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Iniciar Chat con Gerentes
        </h3>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {managers.map((manager: User & { workingAtGym?: any }) => (
          <div key={manager.id} className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-left h-auto p-3"
              onClick={() => handleStartConversation(
                manager.id, 
                manager.workingAtGym?.id, 
                manager.name
              )}
              disabled={!manager.workingAtGym?.id}
            >
              <div className="flex flex-col items-start w-full">
                <div className="flex items-center gap-2 w-full">
                  <UserCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-medium truncate">{manager.name}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {manager.workingAtGym?.name || 'Sin gimnasio asignado'}
                </span>
              </div>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
