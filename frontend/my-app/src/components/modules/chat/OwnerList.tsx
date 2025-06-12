'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi, chatApi } from '@/lib/api';
import { useChatStore, useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';
import { Loader2, Crown, MessageSquarePlus, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { socketService } from '@/lib/socket';

export function OwnerList() {
  const { user } = useAuthStore();
  const { setActiveConversation } = useChatStore();
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());

  // Obtener owners con configuración optimizada
  const { data: owners, isLoading, error } = useQuery({
    queryKey: ['owners-list'],
    queryFn: async () => {
      console.time('fetchOwners');
      try {
        const result = await authApi.getUsersByRole('OWNER');
        console.timeEnd('fetchOwners');
        return result;
      } catch (error) {
        console.timeEnd('fetchOwners');
        console.error('Error fetching owners:', error);
        return [];
      }
    },
    enabled: !!user && user.role === 'MANAGER',
    staleTime: 3 * 60 * 1000, // 3 minutos cache
    cacheTime: 10 * 60 * 1000, // 10 minutos en memoria
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Monitorear usuarios conectados (simplificado)
  useEffect(() => {
    if (!socketService.isConnected()) return;

    const socket = socketService.getSocket();
    if (socket) {
      // Configurar listeners de forma más eficiente
      const handleUserConnected = (data: { userId: string }) => {
        setConnectedUsers(prev => new Set([...prev, data.userId]));
      };

      const handleUserDisconnected = (data: { userId: string }) => {
        setConnectedUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      };

      const handleConnectedUsersList = (userIds: string[]) => {
        setConnectedUsers(new Set(userIds));
      };

      socket.on('userConnected', handleUserConnected);
      socket.on('userDisconnected', handleUserDisconnected);
      socket.on('connectedUsersList', handleConnectedUsersList);

      // Solicitar lista inicial solo una vez
      socket.emit('getConnectedUsers');

      return () => {
        socket.off('userConnected', handleUserConnected);
        socket.off('userDisconnected', handleUserDisconnected);
        socket.off('connectedUsersList', handleConnectedUsersList);
      };
    }
  }, []);

  const handleStartConversation = async (ownerId: string, ownerName: string) => {
    try {
      console.log(`Iniciando conversación con owner ${ownerId}`);
      
      const conversation = await chatApi.initiateConversation('general', ownerId);
      setActiveConversation(conversation.id);
      toast.success('Conversación iniciada', {
        description: `Chat con ${ownerName} establecido`
      });
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      
      if (error.response?.status === 409) {
        toast.error('Conversación ya existe', {
          description: 'Ya tienes una conversación activa con este propietario'
        });
      } else {
        toast.error('Error al iniciar conversación', {
          description: 'Intente nuevamente'
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
        <span className="text-sm text-muted-foreground">Cargando propietarios...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-destructive mb-2">Error al cargar propietarios</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!owners || owners.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Crown className="h-6 w-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay propietarios registrados</p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-3 border-b bg-muted/30">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Propietarios ({owners.length})
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Lista de propietarios disponibles</p>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {owners.map((owner: User) => {
          const isConnected = connectedUsers.has(owner.id);
          
          return (
            <div key={owner.id} className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-left h-auto p-3 hover:bg-muted/50"
                onClick={() => handleStartConversation(owner.id, owner.name || owner.email)}
              >
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center gap-2 w-full">
                    <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span className="font-medium truncate">{owner.name || owner.email}</span>
                    <Circle 
                      className={`h-2 w-2 flex-shrink-0 ${
                        isConnected ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'
                      }`} 
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                      {isConnected ? 'En línea' : 'Desconectado'}
                    </span>
                  </div>
                </div>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
