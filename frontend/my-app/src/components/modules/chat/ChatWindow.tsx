'use client';

import { useChatStore, useAuthStore } from '@/lib/store';
import { socketService } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Send, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Message } from '@/lib/types';
import { toast } from 'sonner';

export function ChatWindow() {
  const { activeConversationId, messages, fetchMessages } = useChatStore();
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  // Usar directamente isConnected() para obtener el estado real de conexión
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(
    socketService.isConnected()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeConversationId) {
      setIsLoading(true);
      fetchMessages(activeConversationId)
        .catch(error => {
          console.error('Error al cargar mensajes:', error);
          toast.error('No se pudieron cargar los mensajes', {
            description: 'Intenta recargar la página o verifica tu conexión'
          });
        })
        .finally(() => setIsLoading(false));
      
      // Unirse a la sala de chat cuando cambia la conversación activa
      const socket = socketService.getSocket();
      if (socket?.connected) {
        socketService.joinConversation(activeConversationId);
      }
    }
  }, [activeConversationId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !activeConversationId) return;
    
    // Verificar que el socket esté conectado
    if (!isSocketConnected) {
      toast.error('Sin conexión', {
        description: 'No se puede enviar el mensaje porque no hay conexión con el servidor.'
      });
      return;
    }
    
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      content: content.trim(),
      senderId: user?.id || '',
      conversationId: activeConversationId,
      createdAt: new Date().toISOString(),
      sender: user,
      _status: 'sending' as 'sending' | 'error' | undefined
    };
    
    // Agregar mensaje temporal al estado local
    useChatStore.getState().addMessage(tempMessage);
    
    setIsSending(true);
    const messageContent = content.trim();
    setContent('');
    
    try {
      socketService.sendMessage(activeConversationId, messageContent);
      // El mensaje real será agregado por el listener de newMessage
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toast.error('No se pudo enviar el mensaje', {
        description: 'Intenta nuevamente en unos momentos'
      });
      
      // Marcar el mensaje temporal como error
      const updatedMessages = useChatStore.getState().messages.map(msg => 
        msg.id === tempId ? { ...msg, _status: 'error' } : msg
      );
      useChatStore.setState({ messages: updatedMessages });
    } finally {
      setIsSending(false);
    }
  };

  // Configurar listeners para el socket
  useEffect(() => {
    const socket = socketService.getSocket();
    
    // Forzar una verificación directa del estado actual del socket
    const checkSocketConnection = () => {
      const isConnected = socketService.isConnected();
      setIsSocketConnected(isConnected);
      return isConnected;
    };
    
    // Verificar estado inicial
    checkSocketConnection();
    
    // Configurar listeners para cambios de estado de conexión
    const handleConnect = () => {
      setIsSocketConnected(true);
      
      // Si hay una conversación activa, unirse a ella
      if (activeConversationId) {
        socketService.joinConversation(activeConversationId);
      }
    };
    
    const handleDisconnect = () => {
      setIsSocketConnected(false);
    };
    
    // Manejar nuevos mensajes recibidos del servidor
    const handleNewMessage = (message: Message) => {      
      // Si el mensaje es para la conversación activa, agregarlo al estado
      if (message.conversationId === activeConversationId) {
        // Reemplazar mensaje temporal si existe
        const existingTempIndex = useChatStore.getState().messages.findIndex(
          m => m._status === 'sending' && m.content === message.content
        );
        
        if (existingTempIndex >= 0) {
          // Reemplazar mensaje temporal con el real
          const updatedMessages = [...useChatStore.getState().messages];
          updatedMessages[existingTempIndex] = message;
          useChatStore.setState({ messages: updatedMessages });
        } else {
          // Agregar nuevo mensaje
          useChatStore.getState().addMessage(message);
        }
      } else {
        // Notificar al usuario sobre mensaje en otra conversación
        toast.info('Nuevo mensaje', {
          description: `Has recibido un mensaje en otra conversación`
        });
        // Actualizar lista de conversaciones
        useChatStore.getState().fetchConversations();
      }
    };
    
    // Verificar estado de conexión cada 2 segundos
    const checkConnectionInterval = setInterval(() => {
      const currentSocket = socketService.getSocket();
      const currentConnected = !!currentSocket?.connected;
      
      if (currentConnected !== isSocketConnected) {
        setIsSocketConnected(currentConnected);
        
        // Si acabamos de conectar y hay una conversación activa, unirse a ella
        if (currentConnected && activeConversationId) {
          socketService.joinConversation(activeConversationId);
        }
      }
    }, 2000);
    
    // Configurar listener para errores
    const unsubscribeError = socketService.onError((error) => {
      console.error('Error en socket:', error);
      toast.error('Error de conexión', {
        description: 'Ocurrió un problema con la conexión de chat'
      });
    });
    
    // Suscribirse a eventos de conexión/desconexión
    socket?.on('connect', handleConnect);
    socket?.on('disconnect', handleDisconnect);
    socket?.on('newMessage', handleNewMessage);
    
    // Si no hay conexión, intentar conectar
    if (!initialConnected) {
      socketService.connect();
    } else if (activeConversationId) {
      // Si ya estamos conectados y hay una conversación activa, unirse a ella
      socketService.joinConversation(activeConversationId);
    }
    
    return () => {
      // Limpiar todos los listeners
      socket?.off('connect', handleConnect);
      socket?.off('disconnect', handleDisconnect);
      socket?.off('newMessage', handleNewMessage);
      unsubscribeError();
      clearInterval(checkConnectionInterval);
    };
  }, [activeConversationId, isSocketConnected]);

  if (!activeConversationId) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Selecciona una conversación</div>
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando mensajes...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mostrar estado de conexión solo si hay una conversación activa y no hay conexión */}
      {!isSocketConnected && activeConversationId && (
        <div className="bg-destructive/15 text-destructive text-sm p-2 rounded-md mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Sin conexión</span>
          <p className="text-xs text-muted-foreground ml-1">No hay conexión con el servidor. Los mensajes no podrán enviarse hasta que se restablezca.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto" 
            onClick={() => {
              const isAlreadyConnected = socketService.getSocket()?.connected;
              if (isAlreadyConnected) {
                toast.info('Conexión activa', {
                  description: 'Ya hay una conexión activa con el servidor.'
                });
                setIsSocketConnected(true);
              } else {
                socketService.connect();
                toast.info('Reconectando', {
                  description: 'Intentando establecer conexión con el servidor...'
                });
              }
            }}
          >
            Reconectar
          </Button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No hay mensajes. Envía el primero.
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-xs ${msg.senderId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm">{msg.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  {msg._status === 'sending' && (
                    <Loader2 className="h-3 w-3 animate-spin opacity-70" />
                  )}
                  {msg._status === 'error' && (
                    <span className="text-xs text-red-500">Error</span>
                  )}
                  <p className="text-xs opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <Input 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isSocketConnected ? "Escribe un mensaje..." : "Reconectando..."}
          disabled={isSending || !isSocketConnected}
          className={!isSocketConnected ? "opacity-50" : ""}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isSending || !isSocketConnected || !content.trim()}
          className={!isSocketConnected ? "opacity-50" : ""}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}