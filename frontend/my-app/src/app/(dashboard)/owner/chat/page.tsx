'use client';

import { useEffect, useState } from 'react';
import { ChatWindow } from '@/components/modules/chat/ChatWindow';
import { ConversationList } from '@/components/modules/chat/ConversationList';
import { ManagerList } from '@/components/modules/chat/ManagerList';
import { useChatStore, useAuthStore } from '@/lib/store';
import { Loader2, AlertCircle, RefreshCw, MessageSquare, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { socketService } from '@/lib/socket';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OwnerChatPage() {
  const { fetchConversations, activeConversationId, conversations } = useChatStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(socketService.isConnected());

  // Monitorear el estado de conexión del socket
  useEffect(() => {
    const checkConnection = () => {
      const connected = socketService.isConnected();
      setIsConnected(connected);
    };

    // Verificar cada 2 segundos
    const interval = setInterval(checkConnection, 2000);

    // Verificar inmediatamente
    checkConnection();

    // Iniciar conexión si no está conectado
    if (!socketService.isConnected()) {
      console.log('🔌 Iniciando conexión del socket desde OwnerChatPage');
      socketService.connect().then((connected) => {
        console.log(`🔌 Resultado de conexión: ${connected}`);
        setIsConnected(connected);
        if (connected) {
          loadConversations();
        }
      }).catch((error) => {
        console.error('❌ Error conectando socket:', error);
        setIsConnected(false);
      });
    } else {
      console.log('✅ Socket ya conectado en OwnerChatPage');
      setIsConnected(true);
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadConversations = async () => {
    if (!user) {
      console.log('⚠️ No hay usuario, saltando carga de conversaciones');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📂 Cargando conversaciones para el owner...');
      await fetchConversations();
      console.log('✅ Conversaciones cargadas exitosamente');
    } catch (error: any) {
      console.error('❌ Error al cargar conversaciones:', error);
      setError(error?.message || 'No se pudieron cargar las conversaciones');
      toast.error('Error de carga', {
        description: 'No se pudieron cargar las conversaciones'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, fetchConversations]);

  const handleRetry = async () => {
    setError(null);
    
    // Reconectar socket si es necesario
    if (!socketService.isConnected()) {
      const connected = await socketService.connect();
      setIsConnected(connected);
      
      if (!connected) {
        toast.error('Error de conexión', {
          description: 'No se pudo restablecer la conexión con el servidor'
        });
        return;
      }
    }
    
    // Recargar conversaciones
    await loadConversations();
  };

  // Mostrar loader solo en la carga inicial
  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center flex-col">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span>Cargando conversaciones...</span>
        <p className="text-sm text-muted-foreground mt-2">Esto puede tomar unos momentos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
      {/* Panel izquierdo - Conversaciones y Gerentes */}
      <div className="md:col-span-1 border rounded-lg overflow-hidden flex flex-col">
        <Tabs defaultValue="conversations" className="flex-1 flex flex-col">
          <div className="border-b px-2 py-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="conversations" className="text-xs">
                <MessageSquare className="h-4 w-4 mr-1" />
                Chats
              </TabsTrigger>
              <TabsTrigger value="managers" className="text-xs">
                <Users className="h-4 w-4 mr-1" />
                Gerentes
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="conversations" className="flex-1 m-0">
            <ConversationList />
          </TabsContent>
          
          <TabsContent value="managers" className="flex-1 m-0">
            <ManagerList />
          </TabsContent>
        </Tabs>
      </div>

      {/* Panel derecho - Ventana de chat */}
      <div className="md:col-span-2 border rounded-lg overflow-hidden">
        {error ? (
          <div className="flex h-full items-center justify-center flex-col p-4">
            <Alert className="max-w-md mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error de conexión</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={handleRetry} 
              className="mt-4"
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        ) : !isConnected ? (
          <div className="flex h-full items-center justify-center flex-col p-4">
            <Alert className="max-w-md mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sin conexión</AlertTitle>
              <AlertDescription>
                No hay conexión con el servidor. Los mensajes no podrán enviarse hasta que se restablezca.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => socketService.connect().then(setIsConnected)} 
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
            <p className="text-muted-foreground text-center mb-2 font-medium">
              Selecciona una conversación para comenzar
            </p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Puedes continuar una conversación existente o iniciar una nueva seleccionando un gerente en la pestaña "Gerentes"
            </p>
          </div>
        ) : (
          <ChatWindow />
        )}
      </div>
    </div>
  );
}