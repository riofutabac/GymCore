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
    origin: '*',
  },
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

  @UseGuards(WsAuthGuard)
  async handleConnection(client: Socket, ...args: any[]) {
    // El guard ya validó el token y agregó el usuario al cliente
    const user = client.data.user;
    
    if (!user) {
      this.logger.warn('⚠️  Cliente sin datos de usuario válidos');
      client.disconnect();
      return;
    }

    const userId = user.id;
    
    // Unir al cliente a una sala personal
    await client.join(`user_${userId}`);
    
    this.logger.log(`🟢 Usuario conectado: ${user.email}`);
  }

  handleDisconnect(client: Socket) {
    const userEmail = client.data?.user?.email || 'desconocido';
    this.logger.log(`🔴 Usuario desconectado: ${userEmail}`);
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    await client.join(`conversation_${data.conversationId}`);
    this.logger.log(`💬 Usuario se unió a conversación: ${data.conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string }
  ) {
    const user = client.data.user;
    
    // Guardar el mensaje en la base de datos
    const message = await this.chatService.createMessage(
      data.conversationId,
      user.id,
      data.content
    );

    // Emitir el mensaje a todos los participantes de la conversación
    this.server.to(`conversation_${data.conversationId}`).emit('newMessage', {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      sender: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      createdAt: message.createdAt,
    });
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