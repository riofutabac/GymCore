'use client';

import { useEffect, useState, useCallback } from 'react';
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
  const { fetchConversations, activeConversationId, conversations, isLoading, error } = useChatStore();
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Inicialización más eficiente
  const initializeChat = useCallback(async () => {
    if (!user || !isInitializing) return;

    console.log('🚀 Inicializando chat para owner...');
    
    try {
      // Conectar socket primero
      if (!socketService.isConnected()) {
        console.log('🔌 Conectando socket...');
        const connected = await socketService.connect();
        setIsConnected(connected);
        
        if (!connected) {
          throw new Error('No se pudo conectar al servidor de chat');
        }
      } else {
        setIsConnected(true);
      }

      // Cargar conversaciones en paralelo (no bloquear la UI)
      console.log('📂 Cargando conversaciones para el owner...');
      fetchConversations().then(() => {
        console.log('✅ Conversaciones cargadas exitosamente');
      }).catch(error => {
        console.error('❌ Error cargando conversaciones:', error);
      });

    } catch (error: any) {
      console.error('❌ Error inicializando chat:', error);
      toast.error('Error de inicialización', {
        description: error?.message || 'Problema al inicializar el chat'
      });
    } finally {
      setIsInitializing(false);
    }
  }, [user, fetchConversations, isInitializing]);

  // Ejecutar inicialización una sola vez
  useEffect(() => {
    if (user && isInitializing) {
      initializeChat();
    }
  }, [user, initializeChat, isInitializing]);

  // Monitorear conexión del socket de forma más eficiente
  useEffect(() => {
    const checkConnection = () => {
      const connected = socketService.isConnected();
      setIsConnected(connected);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000); // Verificar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  // Configurar listeners de tiempo real
  useEffect(() => {
    if (!user) return;

    console.log('🔗 Configurando listeners de tiempo real...');

    // Listener para nuevos mensajes
    const unsubscribeMessages = socketService.onNewMessage((message) => {
      console.log('📨 Nuevo mensaje recibido:', message);
      // El store se encarga de actualizar automáticamente
    });

    // Listener para actualizaciones de conversaciones
    const unsubscribeConversations = socketService.onConversationUpdate((conversation) => {
      console.log('💬 Conversación actualizada:', conversation);
      // Actualizar lista de conversaciones si es necesario
      fetchConversations();
    });

    return () => {
      unsubscribeMessages();
      unsubscribeConversations();
    };
  }, [user, fetchConversations]);

  const handleRetry = useCallback(async () => {
    setIsInitializing(true);
    
    // Reconectar socket
    const connected = await socketService.connect();
    setIsConnected(connected);
    
    if (connected) {
      // Recargar conversaciones
      await fetchConversations();
      toast.success('Conexión restablecida');
    } else {
      toast.error('No se pudo restablecer la conexión');
    }
    
    setIsInitializing(false);
  }, [fetchConversations]);

  // Mostrar loader solo durante inicialización
  if (isInitializing) {
    return (
      <div className="flex h-full items-center justify-center flex-col">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span>Inicializando chat...</span>
        <p className="text-sm text-muted-foreground mt-2">Conectando con el servidor</p>
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
                Chats ({conversations.length})
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
              disabled={isInitializing}
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
              onClick={handleRetry} 
              className="mt-4"
              disabled={isInitializing}
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
            {isLoading && (
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando conversaciones...
              </div>
            )}
          </div>
        ) : (
          <ChatWindow />
        )}
      </div>
    </div>
  );
}