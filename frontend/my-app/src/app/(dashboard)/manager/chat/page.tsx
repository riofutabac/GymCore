'use client';

import { useEffect, useState } from 'react';
import { ChatWindow } from '@/components/modules/chat/ChatWindow';
import { ConversationList } from '@/components/modules/chat/ConversationList';
import { OwnerList } from '@/components/modules/chat/OwnerList';
import { useChatStore, useGymStore, useAuthStore } from '@/lib/store';
import { chatApi } from '@/lib/api';
import { Loader2, AlertCircle, RefreshCw, MessageSquare, Info, UserSearch, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { socketService } from '@/lib/socket';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  // Inicializar chat automáticamente cuando hay usuario
  useEffect(() => {
    if (user) {
      initializeChatForManager();
    }
  }, [user]);

  const initializeChatForManager = async () => {
    if (!user) {
      console.log('⚠️ No hay usuario autenticado');
      return;
    }

    setIsInitiating(true);
    setError(null);
    
    try {
      console.log(`🔧 Inicializando chat para manager: ${user.name || user.email}`);
      
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
      
      console.log(`✅ Chat inicializado correctamente`);
      
    } catch (error: any) {
      console.error('❌ Error al inicializar chat:', error);
      setError(error?.message || 'No se pudo inicializar el sistema de chat');
      toast.error('Error de conexión', {
        description: 'Problema al conectar con el sistema de chat'
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
        
        // Cargar conversaciones
        await fetchConversations();
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

  const initiateChatWithOwner = async () => {
    try {
      setIsInitiating(true);
      
      // Si tiene gimnasio asignado, usar ese gymId, si no usar 'general'
      const gymId = activeGym?.id || 'general';
      
      if (gymId === 'general') {
        toast.info('Iniciando chat general', {
          description: 'Sin gimnasio asignado, iniciando conversación general con propietarios'
        });
      }
      
      const conversation = await chatApi.initiateConversation(gymId);
      setActiveConversation(conversation.id);
      
      const successMessage = activeGym 
        ? `Conversación con propietario de ${activeGym.name} iniciada`
        : 'Conversación general con propietarios iniciada';
        
      toast.success('Chat iniciado', {
        description: successMessage
      });
    } catch (error) {
      console.error('Error al iniciar chat:', error);
      toast.error('Error', {
        description: 'No se pudo iniciar la conversación'
      });
    } finally {
      setIsInitiating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
      <div className="md:col-span-1 border rounded-lg overflow-hidden flex flex-col">
        <Tabs defaultValue="conversations" className="flex-1 flex flex-col">
          <div className="border-b px-2 py-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="conversations" className="text-xs">
                <MessageSquare className="h-4 w-4 mr-1" />
                Chats
              </TabsTrigger>
              <TabsTrigger value="owners" className="text-xs">
                <Crown className="h-4 w-4 mr-1" />
                Propietarios
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="conversations" className="flex-1 m-0">
            <ConversationList />
          </TabsContent>
          
          <TabsContent value="owners" className="flex-1 m-0">
            <OwnerList />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="md:col-span-2 border rounded-lg overflow-hidden">
        {isInitiating ? (
          <div className="flex h-full items-center justify-center flex-col">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <span className="font-medium">Inicializando sistema de chat...</span>
            <p className="text-sm text-muted-foreground mt-1">Conectando con el servidor</p>
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
          <div className="flex h-full items-center justify-center flex-col p-6">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-2 font-medium">
              Sistema de chat disponible
            </p>
            <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
              Selecciona una conversación existente para continuar o inicia una nueva
            </p>
            
            <Button 
              onClick={initiateChatWithOwner} 
              variant="outline" 
              className="mt-4"
              size="sm"
              disabled={isInitiating}
            >
              {isInitiating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : activeGym ? (
                <MessageSquare className="mr-2 h-4 w-4" />
              ) : (
                <UserSearch className="mr-2 h-4 w-4" />
              )}
              {activeGym 
                ? `Chat con propietario de ${activeGym.name}`
                : 'Iniciar chat general con propietarios'
              }
            </Button>

            {!activeGym && (
              <Alert className="max-w-md mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Sin gimnasio asignado. Puedes iniciar conversaciones generales con propietarios o ver conversaciones existentes.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <ChatWindow />
        )}
      </div>
    </div>
  );
}