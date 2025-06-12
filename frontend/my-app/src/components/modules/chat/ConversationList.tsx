'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useChatStore, useAuthStore } from '@/lib/store';
import { socketService } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, RefreshCw, UserCircle, WifiOff, Clock, User, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Conversation, ConversationStatus } from '@/lib/types';
import { chatApi } from '@/lib/api';

export function ConversationList() {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversation, 
    fetchConversations,
    isLoading 
  } = useChatStore();
  const { user } = useAuthStore();
  const [closingConversationId, setClosingConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const loadConversations = async () => {
    setError(null);
    try {
      await fetchConversations();
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
      setError('No se pudieron cargar las conversaciones');
      toast.error('Error de carga', {
        description: 'No se pudieron cargar las conversaciones'
      });
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

  const handleCloseConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que se seleccione la conversación
    
    setClosingConversationId(conversationId);
    
    try {
      await chatApi.closeConversation(conversationId);
      await fetchConversations(); // Recargar la lista
      
      // Si era la conversación activa, limpiar la selección
      if (activeConversationId === conversationId) {
        setActiveConversation(null);
      }
      
      toast.success('Conversación cerrada', {
        description: 'La conversación ha sido cerrada para ambos participantes'
      });
    } catch (error) {
      console.error('Error closing conversation:', error);
      toast.error('Error al cerrar conversación', {
        description: 'No se pudo cerrar la conversación'
      });
    } finally {
      setClosingConversationId(null);
    }
  };

  const getOtherParticipant = useMemo(() => (conversation: Conversation) => {
    return conversation.participants?.find(p => p.id !== user?.id);
  }, [user?.id]);

  const getLastMessage = useMemo(() => (conversation: Conversation) => {
    return conversation.messages?.[0];
  }, []);

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

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Cargando conversaciones...</span>
      </div>
    );
  }

  if (conversations.length === 0 && !isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay conversaciones</p>
        <p className="text-xs mt-1">Inicia una nueva conversación</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => {
          const otherParticipant = getOtherParticipant(conversation);
          const lastMessage = getLastMessage(conversation);
          const isActive = conversation.id === activeConversationId;
          const isClosed = conversation.status === ConversationStatus.CLOSED;
          const isClosing = closingConversationId === conversation.id;

          return (
            <div key={conversation.id} className="relative group">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start text-left h-auto p-3 transition-all duration-150 ${
                  isClosed ? 'opacity-60' : 'hover:bg-muted/70'
                }`}
                onClick={() => handleSelectConversation(conversation.id, isClosed)}
                disabled={isClosed || isClosing}
              >
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center gap-2 w-full">
                    <User className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium truncate">
                      {otherParticipant?.name || 'Usuario desconocido'}
                    </span>
                    {isClosed && (
                      <CheckCircle className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                  {lastMessage && (
                    <div className="mt-1 w-full">
                      <p className="text-xs text-muted-foreground truncate">
                        {lastMessage.content}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                  {isClosed && (
                    <span className="text-xs text-gray-500 mt-1">Conversación cerrada</span>
                  )}
                </div>
              </Button>
              
              {/* Botón cerrar - solo para OWNER y conversaciones activas */}
              {user?.role === 'OWNER' && !isClosed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleCloseConversation(conversation.id, e)}
                  disabled={isClosing}
                >
                  {isClosing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}