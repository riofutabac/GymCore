'use client';

import { useChatStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Loader2, MessageSquare, RefreshCw, UserCircle, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/lib/types';
import { socketService } from '@/lib/socket';

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
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground p-4">
            <MessageSquare className="h-8 w-8 mb-2" />
            <p>No hay conversaciones activas</p>
          </div>
        ) : (
          <div className="flex flex-col p-2 space-y-1">
            {conversations.map((conv) => {
              const otherParticipant = conv.participants.find(p => p.id !== user?.id);
              const lastMessage = conv.messages[0];
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id)}
                  className={cn(
                    "flex flex-col items-start p-3 rounded-lg text-left transition-colors",
                    activeConversationId === conv.id ? 'bg-muted' : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <UserCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                      <p className="font-medium">
                        {otherParticipant?.name || 'Usuario'}
                      </p>
                    </div>
                    {lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatLastMessageTime(conv)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate w-full mt-1 pl-7">
                    {lastMessage ? (
                      lastMessage.senderId === user?.id ? (
                        <span className="opacity-70">Tú: </span>
                      ) : null
                    ) : null}
                    {lastMessage?.content || 'Sin mensajes...'}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );
}