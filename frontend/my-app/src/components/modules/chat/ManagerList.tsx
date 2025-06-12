'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi, chatApi } from '@/lib/api';
import { useChatStore, useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';
import { Loader2, UserCheck, MessageSquarePlus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function ManagerList() {
  const { user } = useAuthStore();
  const { setActiveConversation } = useChatStore();

  // Obtener gerentes con configuración optimizada
  const { data: managers, isLoading, error } = useQuery({
    queryKey: ['managers-list'],
    queryFn: async () => {
      console.time('fetchManagers');
      try {
        const result = await authApi.getUsersByRole('MANAGER');
        console.timeEnd('fetchManagers');
        return result;
      } catch (error) {
        console.timeEnd('fetchManagers');
        console.log('Fallback to getMyManagers...');
        return await authApi.getMyManagers();
      }
    },
    enabled: !!user && user.role === 'OWNER',
    staleTime: 2 * 60 * 1000, // 2 minutos cache
    cacheTime: 5 * 60 * 1000, // 5 minutos en memoria
    retry: 1, // Solo 1 reintento
    refetchOnWindowFocus: false, // No recargar al enfocar ventana
  });

  const handleStartConversation = async (managerId: string, gymId: string | null, managerName: string) => {
    try {
      console.log(`Iniciando conversación con manager ${managerId} - gymId: ${gymId || 'Sin gym'}`);
      
      // Si no tiene gym asignado, usar 'general' para conversaciones generales
      let conversationGymId = gymId || 'general';
      
      if (conversationGymId === 'general') {
        toast.info('Iniciando chat general', {
          description: `${managerName} no tiene gimnasio asignado, iniciando conversación general`
        });
      }
      
      const conversation = await chatApi.initiateConversation(conversationGymId, managerId);
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
        <p className="text-sm">No hay gerentes registrados</p>
        <p className="text-xs mt-1">Los gerentes aparecerán aquí cuando se registren en el sistema</p>
      </div>
    );
  }

  return (
    <div className="border-t">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Chatear con Gerentes
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Todos los gerentes del sistema</p>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {managers.map((manager: User & { workingAtGym?: any }) => (
          <div key={manager.id} className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-left h-auto p-3"
              onClick={() => handleStartConversation(
                manager.id, 
                manager.workingAtGym?.id || null, 
                manager.name || manager.email
              )}
            >
              <div className="flex flex-col items-start w-full">
                <div className="flex items-center gap-2 w-full">
                  <UserCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-medium truncate">{manager.name || manager.email}</span>
                  {!manager.workingAtGym?.id && (
                    <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {manager.workingAtGym?.name || 'Sin gimnasio asignado'}
                </span>
                {manager.email && (
                  <span className="text-xs text-muted-foreground opacity-75">
                    {manager.email}
                  </span>
                )}
              </div>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
