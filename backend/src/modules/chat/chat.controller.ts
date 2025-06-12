import { Controller, Get, Param, UseGuards, Post, Body, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async getMyConversations(@CurrentUser() user: User) {
    try {
      const conversations = await this.chatService.getConversationsForUser(user.id);
      return {
        success: true,
        data: conversations
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }

  @Post('conversations/initiate')
  async initiateConversation(@CurrentUser() user: User, @Body() body: { gymId: string, managerId?: string }) {
    try {
      // Obtener el gimnasio y su propietario
      const gym = await this.chatService.getGymWithOwner(body.gymId);
      
      let conversation;
      
      // Dependiendo del rol, iniciar conversación entre manager y owner
      if (user.role === 'MANAGER') {
        conversation = await this.chatService.findOrCreateConversation(gym.ownerId, user.id, body.gymId);
      } else if (user.role === 'OWNER') {
        // Si es el owner quien inicia, necesitamos el ID del manager
        if (!body.managerId) {
          throw new BadRequestException('Se requiere el ID del manager para iniciar la conversación');
        }
        conversation = await this.chatService.findOrCreateConversation(user.id, body.managerId, body.gymId);
      } else {
        throw new BadRequestException('Rol no autorizado para iniciar conversaciones');
      }

      return {
        success: true,
        data: conversation
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') conversationId: string,
    @CurrentUser() user: User
  ) {
    try {
      const messages = await this.chatService.getMessagesForConversation(conversationId, user.id);
      return {
        success: true,
        data: messages
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }
}