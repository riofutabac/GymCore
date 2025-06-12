import { io, Socket } from 'socket.io-client';
import { createSupabaseBrowserClient } from './supabase';
import { Message, Conversation } from './types';
import { toast } from 'sonner';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private connectionPromise: Promise<boolean> | null = null;

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket conectado exitosamente');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      
      // Limpiar cualquier timer de reconexión
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      this.socket?.emit('ready');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket desconectado:', reason);
      this.isConnecting = false;
      
      // Solo reconectar automáticamente si no fue intencional
      if (reason === 'io server disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`🔄 Reconectando automáticamente en 2 segundos... (intento ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        this.reconnectTimer = setTimeout(() => this.connect(), 2000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión Socket.IO:', error.message);
      this.isConnecting = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Máximo de intentos de reconexión alcanzado');
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
      this.notifyError(error);
    });

    this.socket.on('joinedConversation', (data) => {
      console.log('✅ Unido a conversación:', data.conversationId);
    });

    this.socket.on('messageSent', (data) => {
      console.log('✅ Mensaje enviado confirmado:', data);
    });

    // Eventos de tiempo real
    this.socket.on('newMessage', (message: Message) => {
      console.log('📨 Nuevo mensaje recibido en tiempo real:', message);
      this.notifyNewMessage(message);
    });

    this.socket.on('conversationUpdated', (conversation: Conversation) => {
      console.log('💬 Conversación actualizada:', conversation);
      this.notifyConversationUpdate(conversation);
    });
  }

  async connect(): Promise<boolean> {
    // Si ya se está conectando, esperar esa promesa
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    // Si ya está conectado, retornar true inmediatamente
    if (this.socket && this.socket.connected) {
      console.log('ℹ️ Socket ya conectado');
      return true;
    }

    this.isConnecting = true;
    
    this.connectionPromise = this._performConnection();
    return this.connectionPromise;
  }

  private async _performConnection(): Promise<boolean> {
    try {
      // Limpiar timer si existe
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      // Desconectar socket existente si hay uno
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      // Obtener token de autenticación
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (error || !token) {
        console.error('❌ Error al obtener token:', error);
        this.isConnecting = false;
        return false;
      }

      console.log('🔑 Token obtenido, conectando socket...');

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: { token },
        reconnection: false, // Manejamos reconexión manualmente
        timeout: 5000, // Reducir timeout
        forceNew: true
      });

      this.setupEventListeners();
      
      // Esperar conexión con timeout más corto
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isConnected = !!this.socket?.connected;
      this.isConnecting = false;
      this.connectionPromise = null;
      
      console.log(`🔌 Estado de conexión: ${isConnected ? 'Conectado' : 'Desconectado'}`);
      return isConnected;
    } catch (error) {
      console.error('❌ Error al conectar:', error);
      this.isConnecting = false;
      this.connectionPromise = null;
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
    
    this.isConnecting = false;
    this.connectionPromise = null;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
  
  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  // Métodos para emitir eventos con verificación de conexión
  joinConversation(conversationId: string): void {
    if (this.socket?.connected) {
      console.log(`📞 Uniéndose a conversación: ${conversationId}`);
      this.socket.emit('joinConversation', { conversationId });
    } else {
      console.warn('⚠️ No se puede unir a conversación: socket no conectado');
      // Intentar reconectar automáticamente
      this.connect().then(connected => {
        if (connected) {
          this.joinConversation(conversationId);
        }
      });
    }
  }

  sendMessage(conversationId: string, content: string): void {
    if (this.socket?.connected) {
      console.log(`📤 Enviando mensaje a conversación: ${conversationId}`);
      this.socket.emit('sendMessage', { conversationId, content });
    } else {
      console.warn('⚠️ No se puede enviar mensaje: socket no conectado');
      toast.error('Sin conexión', {
        description: 'Reintentando conexión...'
      });
      
      // Intentar reconectar y reenviar
      this.connect().then(connected => {
        if (connected) {
          this.sendMessage(conversationId, content);
        }
      });
    }
  }

  // Callbacks para eventos de tiempo real
  private messageCallbacks: ((message: Message) => void)[] = [];
  private conversationCallbacks: ((conversation: Conversation) => void)[] = [];
  private errorCallbacks: ((error: any) => void)[] = [];

  onNewMessage(callback: (message: Message) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  onConversationUpdate(callback: (conversation: Conversation) => void): () => void {
    this.conversationCallbacks.push(callback);
    return () => {
      const index = this.conversationCallbacks.indexOf(callback);
      if (index > -1) {
        this.conversationCallbacks.splice(index, 1);
      }
    };
  }

  onError(callback: (error: any) => void): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  private notifyNewMessage(message: Message): void {
    this.messageCallbacks.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in message callback:', error);
      }
    });
  }

  private notifyConversationUpdate(conversation: Conversation): void {
    this.conversationCallbacks.forEach(callback => {
      try {
        callback(conversation);
      } catch (error) {
        console.error('Error in conversation callback:', error);
      }
    });
  }

  private notifyError(error: any): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (error) {
        console.error('Error in error callback:', error);
      }
    });
  }
}

export const socketService = new SocketService();