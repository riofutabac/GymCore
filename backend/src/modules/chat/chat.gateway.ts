import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../../common/guards/ws-auth.guard';
import { Logger } from 'nestjs-pino';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly logger: Logger,
  ) {}

  afterInit(server: Server) {
    this.logger.log('💬 Chat Gateway inicializado');
  }

  async handleConnection(client: Socket) {
    try {
      // Verificar autenticación manualmente
      const token = client.handshake.auth?.token || 
                   client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn('⚠️  Cliente sin token de autenticación');
        client.emit('error', { message: 'Token de autenticación requerido' });
        client.disconnect();
        return;
      }

      // Aquí podrías verificar el token y obtener el usuario
      // Por simplicidad, asumimos que el token es válido
      this.logger.log(`🟢 Cliente conectado: ${client.id}`);
      
      // Enviar confirmación de conexión
      client.emit('connected', { message: 'Conectado al chat' });
      
    } catch (error) {
      this.logger.error('❌ Error en conexión:', error);
      client.emit('error', { message: 'Error de autenticación' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`🔴 Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('ready')
  async handleReady(@ConnectedSocket() client: Socket) {
    // El cliente está listo para recibir eventos
    this.logger.log(`✅ Cliente listo: ${client.id}`);
    client.emit('ready_confirmed', { status: 'ready' });
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    try {
      await client.join(`conversation_${data.conversationId}`);
      this.logger.log(`💬 Cliente ${client.id} se unió a conversación: ${data.conversationId}`);
      client.emit('joinedConversation', { conversationId: data.conversationId });
    } catch (error) {
      this.logger.error('❌ Error al unirse a conversación:', error);
      client.emit('error', { message: 'Error al unirse a la conversación' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string }
  ) {
    try {
      // Por ahora, simplemente reenviar el mensaje a la conversación
      // En una implementación completa, aquí guardarías en la BD
      const messageData = {
        id: Date.now().toString(), // ID temporal
        content: data.content,
        senderId: 'temp-user-id', // ID temporal
        sender: {
          id: 'temp-user-id',
          name: 'Usuario Temporal',
          email: 'temp@example.com',
        },
        createdAt: new Date(),
      };

      // Emitir a todos los participantes de la conversación
      this.server.to(`conversation_${data.conversationId}`).emit('newMessage', messageData);
      
      this.logger.log(`📤 Mensaje enviado en conversación: ${data.conversationId}`);
      
    } catch (error) {
      this.logger.error('❌ Error al enviar mensaje:', error);
      client.emit('error', { message: 'Error al enviar mensaje' });
    }
  }

  // Método para enviar notificaciones desde el servicio
  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }

  // Método para notificar nuevo mensaje
  async notifyNewMessage(conversationId: string, message: any) {
    this.server.to(`conversation_${conversationId}`).emit('newMessage', message);
  }
}