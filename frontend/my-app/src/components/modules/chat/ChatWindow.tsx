'use client';

import { useChatStore, useAuthStore } from '@/lib/store';
import { socketService } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Send, Loader2, WifiOff, Wifi } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Message } from '@/lib/types';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ChatWindow() {
  const { activeConversationId, messages, fetchMessages, addMessage } = useChatStore();
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Verificar conexión del socket
  useEffect(() => {
    const checkConnection = () => {
      const connected = socketService.isConnected();
      setIsSocketConnected(connected);
      return connected;
    };

    // Verificar inmediatamente
    checkConnection();

    // Verificar cada 2 segundos
    const interval = setInterval(checkConnection, 2000);

    return () => clearInterval(interval);
  }, []);

  // Cargar mensajes cuando cambia la conversación
  useEffect(() => {
    if (activeConversationId) {
      setIsLoading(true);
      fetchMessages(activeConversationId)
        .then(() => {
          console.log(`✅ Mensajes cargados para conversación: ${activeConversationId}`);
        })
        .catch(error => {
          console.error('Error al cargar mensajes:', error);
          toast.error('No se pudieron cargar los mensajes', {
            description: 'Intenta recargar la página o verifica tu conexión'
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [activeConversationId, fetchMessages]);

  // Configurar socket y listeners
  useEffect(() => {
    if (!activeConversationId) return;

    // Asegurar conexión del socket
    if (!socketService.isConnected()) {
      console.log('🔌 Conectando socket para la conversación...');
      socketService.connect().then(() => {
        if (socketService.isConnected()) {
          socketService.joinConversation(activeConversationId);
        }
      });
    } else {
      // Ya conectado, unirse directamente
      socketService.joinConversation(activeConversationId);
    }

    // Los listeners ya están configurados en el store globalmente
    // Solo necesitamos asegurar que estamos unidos a la conversación
    
  }, [activeConversationId]);

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !activeConversationId) {
      return;
    }
    
    if (!isSocketConnected) {
      toast.error('Sin conexión', {
        description: 'No se puede enviar el mensaje porque no hay conexión con el servidor.'
      });
      return;
    }
    
    const messageContent = content.trim();
    setContent('');
    setIsSending(true);
    
    try {
      console.log(`📤 Enviando mensaje: "${messageContent}" a conversación: ${activeConversationId}`);
      socketService.sendMessage(activeConversationId, messageContent);
      
      // Enfocar de nuevo el input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      toast.error('No se pudo enviar el mensaje', {
        description: 'Intenta nuevamente en unos momentos'
      });
      // Restaurar el contenido si hay error
      setContent(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleReconnect = async () => {
    try {
      toast.info('Reconectando...', {
        description: 'Intentando establecer conexión con el servidor'
      });
      
      const connected = await socketService.connect();
      if (connected && activeConversationId) {
        socketService.joinConversation(activeConversationId);
        toast.success('Reconectado', {
          description: 'Conexión restablecida exitosamente'
        });
      }
    } catch (error) {
      toast.error('Error al reconectar', {
        description: 'No se pudo restablecer la conexión'
      });
    }
  };

  if (!activeConversationId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Selecciona una conversación para comenzar</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <span className="text-muted-foreground">Cargando mensajes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header con estado de conexión */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Chat</h3>
          <div className="flex items-center gap-2 text-xs">
            {isSocketConnected ? (
              <>
                <Wifi className="h-3 w-3 text-green-500" />
                <span className="text-green-600">Conectado</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-500" />
                <span className="text-red-600">Desconectado</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Alerta de conexión */}
      {!isSocketConnected && (
        <Alert className="m-2 border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Sin conexión con el servidor</span>
            <Button variant="outline" size="sm" onClick={handleReconnect}>
              Reconectar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay mensajes. Envía el primero.</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
                msg.senderId === user?.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <span className="text-xs opacity-70 font-medium">
                    {msg.sender?.name || 'Usuario'}
                  </span>
                  <span className="text-xs opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulario de envío */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input 
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isSocketConnected ? "Escribe un mensaje..." : "Reconectando..."}
            disabled={isSending || !isSocketConnected}
            className={`flex-1 ${!isSocketConnected ? "opacity-50" : ""}`}
            maxLength={1000}
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
        </div>
        {content.length > 800 && (
          <p className="text-xs text-muted-foreground mt-1">
            {content.length}/1000 caracteres
          </p>
        )}
      </form>
    </div>
  );
}