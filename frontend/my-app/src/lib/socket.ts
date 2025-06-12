import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './store';
import { createSupabaseBrowserClient } from './supabase';
import { Message } from './types';
import { toast } from 'sonner';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      // Emitir evento para indicar que el socket está listo para usar
      this.socket?.emit('ready');
    });

    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // El servidor cerró la conexión, intentar reconectar manualmente
        setTimeout(() => this.connect(), 5000);
      }
    });
  }

  async connect(): Promise<boolean> {
    try {
      // Verificar si ya hay un socket conectado
      if (this.socket && this.socket.connected) {
        return true;
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
        console.error('Error al obtener el token de autenticación:', error);
        toast.error('Error de autenticación', {
          description: 'No se pudo establecer la conexión de chat'
        });
        return false;
      }

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: {
          token // Solo enviamos el token, el backend extraerá el userId
        },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      this.setupEventListeners();

      // Configurar el manejo de errores
      this.socket.on('connect_error', (error) => {
        console.error('Error de conexión Socket.IO:', error.message);
        toast.error('Error de conexión', {
          description: 'No se pudo conectar al servidor de chat'
        });
      });
      
      this.socket.on('error', (error) => {
        console.error('Error en Socket.IO:', error);
        toast.error('Error en el chat', {
          description: error?.message || 'Se produjo un error en la conexión de chat'
        });
      });
      
      // Esperar brevemente para ver si la conexión se establece
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return !!this.socket?.connected;
    } catch (error) {
      console.error('Error al conectar con Socket.IO:', error);
      toast.error('Error de conexión', {
        description: 'No se pudo inicializar la conexión de chat'
      });
      return false;
    }
  }

  disconnect(): void {
    if (this.socket) {
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
    this.socket?.emit('joinConversation', conversationId);
  }

  sendMessage(conversationId: string, content: string): void {
    this.socket?.emit('sendMessage', { conversationId, content });
  }

  // Métodos para escuchar eventos
  onNewMessage(callback: (message: Message) => void): () => void {
    this.socket?.on('newMessage', callback);
    return () => this.socket?.off('newMessage', callback);
  }
  
  onError(callback: (error: any) => void): () => void {
    this.socket?.on('error', callback);
    return () => this.socket?.off('error', callback);
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