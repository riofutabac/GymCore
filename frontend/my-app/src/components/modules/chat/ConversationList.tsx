'use client';

import React, { useEffect, useState } from 'react';
import { useChatStore, useAuthStore } from '@/lib/store';
import { socketService } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, RefreshCw, UserCircle, WifiOff, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Conversation } from '@/lib/types';

export function ConversationList() {
  const { conversations, activeConversationId, setActiveConversation, fetchConversations } = useChatStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const loadConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchConversations();
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
      setError('No se pudieron cargar las conversaciones');
      toast.error('Error de carga', {
        description: 'No se pudieron cargar las conversaciones'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Verificar si hay conexión con el socket usando el método isConnected()
    const isSocketConnected = socketService.isConnected();
    setIsConnected(isSocketConnected);
    
    const handleConnect = () => {
      setIsConnected(true);
      loadConversations();
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
    };
    
    const handleNewMessage = () => {
      loadConversations();
    };
    
    // Configurar listeners para eventos del socket
    const setupSocketListeners = () => {
      const socket = socketService.getSocket();
      if (socket) {
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('newMessage', handleNewMessage);
      }
    };
    
    // Verificar estado de conexión cada 2 segundos
    const checkConnectionInterval = setInterval(() => {
      const currentConnected = socketService.isConnected();
      
      if (currentConnected !== isConnected) {
        setIsConnected(currentConnected);
        
        if (currentConnected) {
          // Si acabamos de conectar, cargar conversaciones y configurar listeners
          loadConversations();
          setupSocketListeners();
        }
      }
    }, 2000);
    
    // Configurar listeners iniciales
    setupSocketListeners();
    
    // Si no hay socket conectado, intentar conectar
    if (!isSocketConnected && user) {
      socketService.connect().then(connected => {
        if (connected) {
          setupSocketListeners();
          loadConversations();
        }
      });
    } else if (isSocketConnected) {
      // Cargar conversaciones iniciales si ya hay conexión
      loadConversations();
    }
    
    return () => {
      const socket = socketService.getSocket();
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('newMessage', handleNewMessage);
      }
      clearInterval(checkConnectionInterval);
    };
  }, [fetchConversations, user, isConnected]);
  
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    
    // Unirse a la conversación en el socket
    if (socketService.isConnected()) {
      socketService.joinConversation(conversationId);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== user?.id);
  };

  const getLastMessage = (conversation: Conversation) => {
    if (conversation.messages && conversation.messages.length > 0) {
      return conversation.messages[0]; // Asumiendo que están ordenados desc
    }
    return null;
  };

  // Formatear la fecha del último mensaje para mostrarla en la lista
  const formatLastMessageTime = (conversation: Conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return '';
    }
    
    const date = new Date(conversation.messages[0].createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Hoy: mostrar hora
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Ayer
      return 'Ayer';
    } else if (diffDays < 7) {
      // Esta semana: mostrar día
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Más antiguo: mostrar fecha
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay conversaciones</p>
        <p className="text-xs mt-1">Inicia una nueva conversación</p>
      </div>
    );
  }

  return (
    <div className="border-r h-full flex flex-col">
      <div className="text-lg font-semibold p-4 border-b flex items-center justify-between">
        <h2>Conversaciones</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={loadConversations} 
          disabled={isLoading}
          title="Actualizar conversaciones"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        {isLoading && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground p-4">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Cargando conversaciones...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground p-4">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={loadConversations}>
              Reintentar
            </Button>
          </div>
        ) : !isConnected ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground p-4">
            <WifiOff className="h-8 w-8 mb-2 text-amber-500" />
            <p className="text-center mb-2">Sin conexión al servidor</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                const isAlreadyConnected = socketService.isConnected();
                if (isAlreadyConnected) {
                  toast.info('Conexión activa', {
                    description: 'Ya hay una conexión activa con el servidor.'
                  });
                  setIsConnected(true);
                } else {
                  const connected = await socketService.connect();
                  if (connected) {
                    toast.success('Conectado', {
                      description: 'Conexión establecida correctamente.'
                    });
                    setIsConnected(true);
                    loadConversations();
                  } else {
                    toast.error('Error de conexión', {
                      description: 'No se pudo conectar al servidor.'
                    });
                  }
                }
              }}
              className="mt-2"
            >
              Reconectar
            </Button>
          </div>
        ) : (
          <div className="flex flex-col p-2 space-y-1">
            {conversations.map((conv) => {
              const otherParticipant = conv.participants.find(p => p.id !== user?.id);
              const lastMessage = conv.messages[0];
              const isActive = conv.id === activeConversationId;

              return (
                <Button
                  key={conv.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center gap-2 w-full">
                      <UserCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                      <p className="font-medium">
                        {otherParticipant?.name || 'Usuario'}
                      </p>
                    </div>
                    {lastMessage && (
                      <div className="mt-1 w-full">
                        <p className="text-xs text-muted-foreground truncate">
                          {lastMessage.content}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(lastMessage.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );
}