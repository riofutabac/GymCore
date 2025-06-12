'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/lib/store';
import { toast } from 'sonner';
import { Message } from '@/lib/types';
import { socketService } from '@/lib/socket';

export function ChatNotification() {
  const { activeConversationId } = useChatStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Verificar estado de conexión inicial
    const socket = socketService.getSocket();
    setIsConnected(socket?.connected || false);

    // Configurar listeners para cambios de estado de conexión
    const handleConnect = () => {
      setIsConnected(true);
      toast.success('Conectado al chat');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      toast.error('Desconectado del chat');
    };

    const handleNewMessage = (message: Message) => {
      // Añadir el mensaje al store
      useChatStore.getState().addMessage(message);
      
      // Solo mostrar notificación si no es la conversación activa
      if (message.conversationId !== activeConversationId) {
        const sender = message.sender?.name || 'Usuario';
        toast(`Nuevo mensaje de ${sender}`, {
          description: message.content.length > 30 
            ? `${message.content.substring(0, 30)}...` 
            : message.content,
          action: {
            label: 'Ver',
            onClick: () => {
              // Cambiar a la conversación del mensaje
              useChatStore.getState().setActiveConversation(message.conversationId);
            }
          }
        });
      }
    };

    // Suscribirse a eventos
    const socket2 = socketService.getSocket();
    socket2?.on('connect', handleConnect);
    socket2?.on('disconnect', handleDisconnect);
    
    // Usar el método onNewMessage para mensajes nuevos
    const unsubscribeNewMessage = socketService.onNewMessage(handleNewMessage);

    return () => {
      // Limpiar listeners
      socket2?.off('connect', handleConnect);
      socket2?.off('disconnect', handleDisconnect);
      unsubscribeNewMessage();
    };
  }, [activeConversationId]);

  // Este componente no renderiza nada visible, solo maneja notificaciones
  return null;
}
