'use client';

import { useEffect, useState } from 'react';
import { ChatWindow } from '@/components/modules/chat/ChatWindow';
import { ConversationList } from '@/components/modules/chat/ConversationList';
import { useChatStore, useGymStore, useAuthStore } from '@/lib/store';
import { chatApi } from '@/lib/api';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { socketService } from '@/lib/socket';

export default function ManagerChatPage() {
  const { activeGym } = useGymStore();
  const { user } = useAuthStore();
  const { setActiveConversation, fetchConversations, activeConversationId } = useChatStore();
  const [isInitiating, setIsInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(socketService.isConnected());

  // Monitorear el estado de conexión del socket
  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    
    // Estado inicial
    setIsConnected(socketService.isConnected());
    
    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
    };
  }, []);

  // Iniciar conversación con el propietario
  useEffect(() => {
    // Si hay un gimnasio activo, intentamos encontrar o iniciar una conversación con el propietario
    if (activeGym && user) {
      setIsInitiating(true);
      setError(null);
      
      const initConversation = async () => {
        try {
          // Primero intentamos cargar todas las conversaciones existentes
          await fetchConversations();
          
          // Luego iniciamos o encontramos la conversación con el propietario
          const conversation = await chatApi.initiateConversation(activeGym.id);
          setActiveConversation(conversation.id);
          toast.success('Chat iniciado', {
            description: 'Conversación con el propietario establecida'
          });
        } catch (error: any) {
          console.error('Error al iniciar conversación:', error);
          setError(error?.message || 'No se pudo iniciar la conversación con el propietario');
          toast.error('Error de conexión', {
            description: 'No se pudo iniciar la conversación con el propietario'
          });
        } finally {
          setIsInitiating(false);
        }
      };

      initConversation();
    }
  }, [activeGym, user, setActiveConversation, fetchConversations]);
  
  const handleRetry = async () => {
    if (!activeGym) {
      toast.error('No hay gimnasio activo');
      return;
    }
    
    setIsInitiating(true);
    setError(null);
    
    try {
      await fetchConversations();
      const conversation = await chatApi.initiateConversation(activeGym.id);
      setActiveConversation(conversation.id);
      toast.success('Conexión restablecida');
    } catch (error) {
      console.error('Error al reintentar conexión:', error);
      setError('No se pudo restablecer la conexión');
      toast.error('Error al reconectar');
    } finally {
      setIsInitiating(false);
    }
  };

  if (!activeGym) {
    return (
      <div className="flex h-full items-center justify-center flex-col p-4">
        <Alert className="max-w-md mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No hay gimnasio activo</AlertTitle>
          <AlertDescription>
            Necesitas seleccionar un gimnasio para poder acceder al chat.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
      <div className="md:col-span-1 border rounded-lg overflow-hidden">
        <ConversationList />
      </div>
      <div className="md:col-span-2 border rounded-lg overflow-hidden">
        {isInitiating ? (
          <div className="flex h-full items-center justify-center flex-col">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <span>Conectando con el propietario...</span>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center flex-col p-4">
            <Alert className="max-w-md mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error de conexión</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={handleRetry} 
              className="mt-4"
              disabled={isInitiating}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar conexión
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
              disabled={isInitiating}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reconectar
            </Button>
          </div>
        ) : !activeConversationId ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Selecciona una conversación para comenzar</p>
          </div>
        ) : (
          <ChatWindow />
        )}
      </div>
    </div>
  );
}