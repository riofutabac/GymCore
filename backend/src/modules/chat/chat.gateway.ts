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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

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

  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private readonly chatService: ChatService,
    private readonly logger: Logger,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('💬 Chat Gateway inicializado');
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`🔌 Nueva conexión WebSocket intentando autenticarse`);
      
      // Usar WsAuthGuard directamente
      const wsAuthGuard = new WsAuthGuard(
        this.jwtService,
        this.configService,
        this.prisma,
        this.logger
      );

      // Simular el contexto de ejecución para el guard
      const mockContext = {
        switchToWs: () => ({
          getClient: () => client
        }),
        getType: () => 'ws'
      };

      // Intentar autenticar
      const isAuthenticated = await wsAuthGuard.canActivate(mockContext as any);
      
      if (!isAuthenticated) {
        this.logger.warn('⚠️ Autenticación fallida, desconectando cliente');
        client.disconnect();
        return;
      }

      const user = client.data.user;
      
      if (!user) {
        this.logger.warn('⚠️ Cliente sin datos de usuario válidos después de autenticación');
        client.disconnect();
        return;
      }

      // Unir al cliente a una sala personal
      await client.join(`user_${user.id}`);
      
      // Registrar usuario conectado
      this.connectedUsers.set(user.id, client.id);
      
      // Notificar a todos que este usuario se conectó
      this.server.emit('userConnected', { userId: user.id });
      
      this.logger.log(`🟢 Usuario conectado exitosamente: ${user.email} (${user.id})`);
      
      // Notificar al cliente que está conectado
      client.emit('connected', { 
        message: 'Conectado exitosamente al chat',
        userId: user.id 
      });
      
    } catch (error) {
      this.logger.error('❌ Error en conexión WebSocket:', error.message);
      client.emit('error', { 
        message: 'Error de autenticación',
        details: error.message 
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userEmail = client.data?.user?.email || 'desconocido';
    const userId = client.data?.user?.id || 'desconocido';
    
    // Remover usuario de la lista de conectados
    this.connectedUsers.delete(userId);
    
    // Notificar a todos que este usuario se desconectó
    this.server.emit('userDisconnected', { userId });
    
    this.logger.log(`🔴 Usuario desconectado: ${userEmail} (${userId})`);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string | { conversationId: string }
  ) {
    try {
      const conversationId = typeof data === 'string' ? data : data.conversationId;
      
      if (!conversationId) {
        client.emit('error', { message: 'ID de conversación requerido' });
        return;
      }

      await client.join(`conversation_${conversationId}`);
      this.logger.log(`💬 Usuario ${client.data?.user?.email} se unió a conversación: ${conversationId}`);
      
      client.emit('joinedConversation', { conversationId });
    } catch (error) {
      this.logger.error('❌ Error al unirse a conversación:', error);
      client.emit('error', { message: 'Error al unirse a la conversación' });
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
    @CurrentUser() user: User
  ) {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      if (!data.conversationId || !data.content?.trim()) {
        client.emit('error', { message: 'Datos del mensaje incompletos' });
        return;
      }

      this.logger.log(`📝 Enviando mensaje de ${user.email} a conversación ${data.conversationId}`);

      // Crear el mensaje en la base de datos
      const message = await this.chatService.createMessage(
        user.id,
        data.conversationId,
        data.content.trim()
      );

      this.logger.log(`💾 Mensaje guardado en BD: ${message.id}`);

      // Preparar el mensaje completo para envío
      const fullMessage = {
        ...message,
        conversationId: data.conversationId, // Asegurar que el conversationId esté presente
        sender: {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          role: user.role
        }
      };

      this.logger.log(`📤 Enviando mensaje completo:`, JSON.stringify(fullMessage, null, 2));

      // Emitir el mensaje a todos en la sala de la conversación
      this.server.to(`conversation_${data.conversationId}`).emit('newMessage', fullMessage);

      // También notificar a los participantes individualmente
      const conversation = await this.chatService.getConversationWithParticipants(data.conversationId);
      if (conversation) {
        conversation.participants.forEach(participant => {
          // Enviar a todos los participantes (incluyendo el emisor para confirmar)
          this.server.to(`user_${participant.id}`).emit('newMessage', fullMessage);
          this.logger.log(`📧 Mensaje enviado a usuario: ${participant.email} (${participant.id})`);
        });

        // Actualizar la conversación
        const updatedConversation = {
          ...conversation,
          messages: [fullMessage],
          updatedAt: fullMessage.createdAt
        };
        
        this.server.to(`conversation_${data.conversationId}`).emit('conversationUpdated', updatedConversation);
      }

      this.logger.log(`📤 Mensaje de ${user.email} enviado a conversación: ${data.conversationId}`);
      
      // Confirmar al emisor que el mensaje se envió
      client.emit('messageSent', { 
        messageId: message.id, 
        conversationId: data.conversationId,
        message: fullMessage
      });
      
    } catch (error) {
      this.logger.error('❌ Error al enviar mensaje:', error);
      client.emit('error', { 
        message: 'Error al enviar mensaje',
        details: error.message 
      });
    }
  }

  @SubscribeMessage('ready')
  async handleReady(@ConnectedSocket() client: Socket) {
    const user = client.data?.user;
    if (user) {
      this.logger.log(`✅ Cliente listo: ${user.email}`);
      client.emit('ready', { status: 'ready', userId: user.id });
    } else {
      this.logger.warn('⚠️ Cliente envió ready pero no tiene datos de usuario');
    }
  }

  @SubscribeMessage('getConnectedUsers')
  async handleGetConnectedUsers(@ConnectedSocket() client: Socket) {
    const connectedUserIds = Array.from(this.connectedUsers.keys());
    client.emit('connectedUsersList', connectedUserIds);
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