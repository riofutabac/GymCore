'use client';

import { useEffect, useState } from 'react';
import { ChatWindow } from '@/components/modules/chat/ChatWindow';
import { ConversationList } from '@/components/modules/chat/ConversationList';
import { useChatStore, useGymStore, useAuthStore } from '@/lib/store';
import { chatApi } from '@/lib/api';
import { Loader2, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
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
  const [isConnected, setIsConnected] = useState(false);

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
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Iniciar conexión del socket y conversación automática
  useEffect(() => {
    if (activeGym && user) {
      initializeChatForManager();
    }
  }, [activeGym, user]);

  const initializeChatForManager = async () => {
    if (!activeGym || !user) {
      console.log('⚠️ No hay gimnasio activo o usuario');
      return;
    }

    setIsInitiating(true);
    setError(null);
    
    try {
      console.log(`🔧 Inicializando chat para manager en gimnasio: ${activeGym.name}`);
      
      // Conectar socket si no está conectado
      if (!socketService.isConnected()) {
        console.log('🔌 Conectando socket...');
        const connected = await socketService.connect();
        setIsConnected(connected);
        
        if (!connected) {
          throw new Error('No se pudo conectar al servidor de chat');
        }
      }
      
      // Cargar conversaciones existentes
      console.log('📂 Cargando conversaciones existentes...');
      await fetchConversations();
      
      // Iniciar o encontrar conversación con el propietario
      console.log('💬 Iniciando conversación con el propietario...');
      const conversation = await chatApi.initiateConversation(activeGym.id);
      
      // Establecer como conversación activa
      setActiveConversation(conversation.id);
      
      console.log(`✅ Conversación establecida: ${conversation.id}`);
      toast.success('Chat iniciado', {
        description: `Conversación con el propietario de ${activeGym.name} establecida`
      });
      
    } catch (error: any) {
      console.error('❌ Error al inicializar chat:', error);
      setError(error?.message || 'No se pudo iniciar la conversación con el propietario');
      toast.error('Error de conexión', {
        description: 'No se pudo iniciar la conversación con el propietario'
      });
    } finally {
      setIsInitiating(false);
    }
  };
  
  const handleRetry = async () => {
    await initializeChatForManager();
  };

  const handleManualConnect = async () => {
    try {
      toast.info('Conectando...', {
        description: 'Estableciendo conexión con el servidor'
      });
      
      const connected = await socketService.connect();
      setIsConnected(connected);
      
      if (connected) {
        toast.success('Conectado', {
          description: 'Conexión establecida exitosamente'
        });
        
        // Si hay un gimnasio, intentar inicializar el chat
        if (activeGym) {
          await initializeChatForManager();
        }
      } else {
        toast.error('Error de conexión', {
          description: 'No se pudo conectar al servidor'
        });
      }
    } catch (error) {
      console.error('Error al conectar manualmente:', error);
      toast.error('Error de conexión', {
        description: 'Fallo al intentar conectar'
      });
    }
  };

  if (!activeGym) {
    return (
      <div className="flex h-full items-center justify-center flex-col p-4">
        <Alert className="max-w-md mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No hay gimnasio activo</AlertTitle>
          <AlertDescription>
            Necesitas estar asignado a un gimnasio para poder acceder al chat con el propietario.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
      <div className="md:col-span-1 border rounded-lg overflow-hidden">
        <div className="p-3 border-b bg-muted/30">
          <h3 className="font-semibold text-sm">Conversaciones</h3>
          <p className="text-xs text-muted-foreground">Gimnasio: {activeGym.name}</p>
        </div>
        <ConversationList />
      </div>
      
      <div className="md:col-span-2 border rounded-lg overflow-hidden">
        {isInitiating ? (
          <div className="flex h-full items-center justify-center flex-col">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <span className="font-medium">Conectando con el propietario...</span>
            <p className="text-sm text-muted-foreground mt-1">Estableciendo canal de comunicación</p>
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
            <Alert className="max-w-md mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sin conexión</AlertTitle>
              <AlertDescription>
                No hay conexión con el servidor. Los mensajes no podrán enviarse hasta que se restablezca.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={handleManualConnect} 
              className="mt-4"
              disabled={isInitiating}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Conectar
            </Button>
          </div>
        ) : !activeConversationId ? (
          <div className="flex h-full items-center justify-center flex-col">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Selecciona una conversación para comenzar</p>
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              className="mt-4"
              size="sm"
            >
              Iniciar chat con propietario
            </Button>
          </div>
        ) : (
          <ChatWindow />
        )}
      </div>
    </div>
  );
}