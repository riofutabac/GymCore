import { io, Socket } from 'socket.io-client';
import { createSupabaseBrowserClient } from './supabase';
import { Message } from './types';
import { toast } from 'sonner';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: NodeJS.Timeout | null = null;

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket conectado exitosamente');
      this.reconnectAttempts = 0;
      
      // Limpiar cualquier timer de reconexión
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      this.socket?.emit('ready');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket desconectado:', reason);
      
      // Solo intentar reconectar si fue desconectado por el servidor
      if (reason === 'io server disconnect') {
        console.log('🔄 Servidor cerró la conexión, reintentando en 3 segundos...');
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      } else if (reason === 'transport close' || reason === 'transport error') {
        console.log('🔄 Error de transporte, reintentando en 2 segundos...');
        this.reconnectTimer = setTimeout(() => this.connect(), 2000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión Socket.IO:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('Error de conexión', {
          description: 'No se pudo conectar al servidor de chat después de varios intentos'
        });
        
        // Limpiar timer si alcanzamos el máximo
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      }
    });

    this.socket.on('connected', (data) => {
      console.log('🎉 Confirmación de conexión del servidor:', data);
    });

    this.socket.on('ready', (data) => {
      console.log('✅ Socket listo:', data);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Error en Socket.IO:', error);
      toast.error('Error en el chat', {
        description: error?.message || 'Se produjo un error en la conexión de chat'
      });
    });

    this.socket.on('joinedConversation', (data) => {
      console.log('✅ Unido a conversación:', data.conversationId);
    });

    this.socket.on('messageSent', (data) => {
      console.log('✅ Mensaje enviado confirmado:', data);
    });
  }

  async connect(): Promise<boolean> {
    try {
      // Verificar si ya hay un socket conectado
      if (this.socket && this.socket.connected) {
        console.log('ℹ️ Socket ya conectado');
        return true;
      }
      
      // Limpiar timer de reconexión si existe
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      // Si hay un socket existente pero desconectado, limpiarlo antes de reconectar
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      // Obtener token de autenticación de Supabase
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (error || !token) {
        console.error('❌ Error al obtener el token de autenticación:', error);
        toast.error('Error de autenticación', {
          description: 'No se pudo establecer la conexión de chat - no hay sesión válida'
        });
        return false;
      }

      console.log('🔑 Token obtenido, conectando socket...');
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: {
          token: token // Enviamos el token en auth
        },
        reconnection: false, // Deshabilitamos la reconexión automática para manejarla manualmente
        timeout: 10000,
        forceNew: true
      });

      this.setupEventListeners();
      
      // Esperar un poco más para ver si la conexión se establece
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isConnected = !!this.socket?.connected;
      console.log(`🔌 Estado de conexión: ${isConnected ? 'Conectado' : 'Desconectado'}`);
      
      if (!isConnected) {
        console.warn('⚠️ Socket no se conectó después de 2 segundos');
      }
      
      return isConnected;
    } catch (error) {
      console.error('❌ Error al conectar con Socket.IO:', error);
      toast.error('Error de conexión', {
        description: 'No se pudo inicializar la conexión de chat'
      });
      return false;
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      console.log('🔌 Desconectando socket...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
  
  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  // Métodos para emitir eventos
  joinConversation(conversationId: string): void {
    if (this.socket?.connected) {
      console.log(`📞 Uniéndose a conversación: ${conversationId}`);
      this.socket.emit('joinConversation', { conversationId });
    } else {
      console.warn('⚠️ No se puede unir a conversación: socket no conectado');
    }
  }

  sendMessage(conversationId: string, content: string): void {
    if (this.socket?.connected) {
      console.log(`📤 Enviando mensaje a conversación: ${conversationId}`);
      this.socket.emit('sendMessage', { conversationId, content });
    } else {
      console.warn('⚠️ No se puede enviar mensaje: socket no conectado');
      toast.error('Sin conexión', {
        description: 'No se pudo enviar el mensaje'
      });
    }
  }

  // Métodos para escuchar eventos
  onNewMessage(callback: (message: Message) => void): () => void {
    if (this.socket) {
      this.socket.on('newMessage', callback);
      return () => this.socket?.off('newMessage', callback);
    }
    return () => {};
  }
  
  onError(callback: (error: any) => void): () => void {
    if (this.socket) {
      this.socket.on('error', callback);
      return () => this.socket?.off('error', callback);
    }
    return () => {};
  }
  
  // Métodos generales para manejar eventos
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }
  
  off(event: string, callback: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }
}

export const socketService = new SocketService();