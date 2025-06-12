'use client';

import { useEffect, useState } from 'react';
import { ChatWindow } from '@/components/modules/chat/ChatWindow';
import { ConversationList } from '@/components/modules/chat/ConversationList';
import { useChatStore } from '@/lib/store';
import { Loader2, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { socketService } from '@/lib/socket';

export default function OwnerChatPage() {
  const { fetchConversations, activeConversationId, conversations } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(socketService.isConnected());

  // Monitorear el estado de conexión del socket
  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket conectado en OwnerChatPage');
      setIsConnected(true);
      // Recargar conversaciones cuando nos conectamos
      loadConversations();
    };
    
    const handleDisconnect = () => {
      console.log('Socket desconectado en OwnerChatPage');
      setIsConnected(false);
    };
    
    // Iniciar conexión si no está conectado
    if (!socketService.isConnected()) {
      console.log('Iniciando conexión del socket desde OwnerChatPage');
      socketService.connect().then(() => {
        setIsConnected(socketService.isConnected());
      });
    } else {
      console.log('Socket ya conectado en OwnerChatPage');
      setIsConnected(true);
    }
    
    // Registrar listeners
    const socket = socketService.getSocket();
    if (socket) {
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
    }
    
    return () => {
      const socket = socketService.getSocket();
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      }
    };
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchConversations();
      toast.success('Conversaciones actualizadas');
    } catch (error: any) {
      console.error('Error al cargar conversaciones:', error);
      setError(error?.message || 'No se pudieron cargar las conversaciones');
      toast.error('Error de carga', {
        description: 'No se pudieron cargar las conversaciones'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [fetchConversations]);

  // Solo mostrar el loader en la carga inicial cuando no hay conversaciones
  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center flex-col">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span>Cargando conversaciones...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
      <div className="md:col-span-1 border rounded-lg overflow-hidden">
        <ConversationList />
      </div>
      <div className="md:col-span-2 border rounded-lg overflow-hidden">
        {error ? (
          <div className="flex h-full items-center justify-center flex-col p-4">
            <Alert className="max-w-md mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error de conexión</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={loadConversations} 
              className="mt-4"
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        ) : !isConnected ? (
          <div className="flex h-full items-center justify-center flex-col p-4">
            <Alert className="max-w-md mb-4" variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sin conexión</AlertTitle>
              <AlertDescription>
                No hay conexión con el servidor. Los mensajes no podrán enviarse hasta que se restablezca.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => socketService.connect()} 
              className="mt-4"
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reconectar
            </Button>
          </div>
        ) : !activeConversationId ? (
          <div className="flex h-full items-center justify-center flex-col p-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-2">Selecciona una conversación para comenzar</p>
            <p className="text-sm text-muted-foreground text-center">
              Las conversaciones con los gerentes de tus gimnasios aparecerán en la lista de la izquierda
            </p>
          </div>
        ) : (
          <ChatWindow />
        )}
      </div>
    </div>
  );
}