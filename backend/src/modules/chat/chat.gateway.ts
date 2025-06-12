import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Logger, UseGuards } from '@nestjs/common';
  import { ChatService } from './chat.service';
  import { AuthGuard } from '../../common/guards/auth.guard';
  import { AuthService } from '../../auth/auth.service';
  
  @UseGuards(AuthGuard)
  @WebSocketGateway({
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  })
  export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private readonly logger = new Logger(ChatGateway.name);
  
    constructor(
      private readonly chatService: ChatService,
      private readonly authService: AuthService
    ) {}
  
    async handleConnection(client: Socket) {
      try {
        // Obtener token de la autenticación
        const token = client.handshake.auth?.token;
        if (!token) {
          throw new Error('No se proporcionó token de autenticación');
        }
        
        // Validar el token y obtener el usuario
        const userId = client.handshake.auth?.userId;
        if (!userId) {
          throw new Error('No se proporcionó ID de usuario');
        }
        
        // Verificar que el usuario existe
        const user = await this.authService.getProfile(userId);
        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        // Guardar el usuario en el objeto de socket para uso posterior
        client.data.user = user;
        this.logger.log(`Cliente conectado: ${client.id} - Usuario: ${user.name} (${user.id})`);
      } catch (error) {
        this.logger.error(`Conexión fallida: ${error.message}`);
        client.disconnect();
      }
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`Cliente desconectado: ${client.id}`);
    }
  
    @SubscribeMessage('joinConversation')
    async handleJoinConversation(
      @ConnectedSocket() client: Socket,
      @MessageBody() conversationId: string,
    ): Promise<void> {
      client.join(conversationId);
      this.logger.log(`Usuario ${client.data.user.id} se unió a la conversación ${conversationId}`);
    }
  
    @SubscribeMessage('sendMessage')
    async handleSendMessage(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { conversationId: string; content: string },
    ): Promise<void> {
      const sender = client.data.user;
      const { conversationId, content } = data;
  
      const message = await this.chatService.createMessage(
        sender.id,
        conversationId,
        content,
      );
      
      // Emitir el mensaje a todos en la sala (conversación)
      this.server.to(conversationId).emit('newMessage', message);
    }
  }