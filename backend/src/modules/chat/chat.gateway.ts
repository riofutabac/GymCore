import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthService } from '../../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';
  
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
      private readonly authService: AuthService,
      private readonly configService: ConfigService
    ) {}
  
    async handleConnection(client: Socket) {
      try {
        // Obtener token de la autenticación
        const token = client.handshake.auth?.token;
        if (!token) {
          throw new WsException('No se proporcionó token de autenticación');
        }
        
        // Obtener el JWT secret
        const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');
        if (!jwtSecret) {
          throw new WsException('Configuración de JWT faltante en el servidor');
        }

        try {
          // Validar el token y obtener el payload
          const payload = verify(token, jwtSecret);
          const userId = payload.sub as string;
          
          if (!userId) {
            throw new WsException('Token inválido: no se encontró ID de usuario');
          }
          
          // Verificar que el usuario existe
          const user = await this.authService.getProfile(userId);
          if (!user) {
            throw new WsException('Usuario no encontrado');
          }

          // Guardar el usuario en el objeto de socket para uso posterior
          client.data.user = user;
          this.logger.log(`Cliente conectado: ${client.id} - Usuario: ${user.name} (${user.id})`);
        } catch (jwtError) {
          this.logger.error(`Error al validar token JWT: ${jwtError.message}`);
          throw new WsException('Token de autenticación inválido');
        }
      } catch (error) {
        this.logger.error(`Conexión fallida: ${error.message}`);
        client.emit('error', error.message);
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