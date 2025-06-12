import { io, Socket } from 'socket.io-client';
import { createSupabaseBrowserClient } from './supabase';
import { Message } from './types';
import { toast } from 'sonner';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket conectado');
      toast.success('Chat conectado');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket desconectado:', reason);
      toast.error('Chat desconectado');
      
      if (reason === 'io server disconnect') {
        // El servidor cerró la conexión, intentar reconectar manualmente
        setTimeout(() => this.connect(), 5000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión Socket.IO:', error);
      toast.error('Error de conexión al chat');
    });

    this.socket.on('error', (error) => {
      console.error('❌ Error en Socket.IO:', error);
      toast.error('Error en el chat');
    });

    this.socket.on('connected', (data) => {
      console.log('🎉 Confirmación del servidor:', data);
    });

    this.socket.on('ready_confirmed', (data) => {
      console.log('✅ Socket listo:', data);
    });
  }

  async connect(): Promise<boolean> {
    try {
      // Verificar si ya hay un socket conectado
      if (this.socket && this.socket.connected) {
        console.log('🔄 Socket ya conectado');
        return true;
      }
      
      // Si hay un socket existente pero desconectado, limpiarlo
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      console.log('🔌 Intentando conectar socket...');

      // Obtener token de autenticación de Supabase
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (error || !token) {
        console.error('❌ Error al obtener token:', error);
        return false;
      }

      console.log('🔑 Token obtenido, conectando...');

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: {
          token
        },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        forceNew: true
      });

      this.setupEventListeners();
      
      // Esperar un poco para ver si la conexión se establece
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isConnected = !!this.socket?.connected;
      console.log(`🔍 Estado de conexión: ${isConnected ? 'conectado' : 'desconectado'}`);
      
      return isConnected;
    } catch (error) {
      console.error('❌ Error al conectar socket:', error);
      return false;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Socket desconectado manualmente');
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
    console.log(`📥 Uniéndose a conversación: ${conversationId}`);
    this.socket?.emit('joinConversation', { conversationId });
  }

  sendMessage(conversationId: string, content: string): void {
    console.log(`📤 Enviando mensaje a conversación: ${conversationId}`);
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