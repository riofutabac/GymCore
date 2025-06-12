import { Controller, Get, Param, UseGuards, Post, Body, BadRequestException, Patch } from '@nestjs/common';
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
    return this.chatService.getConversationsForUser(user.id);
  }

  @Post('conversations/initiate')
  async initiateConversation(@CurrentUser() user: User, @Body() body: { gymId: string, managerId?: string }) {
    // Permitir gymId 'general' para conversaciones sin gimnasio específico
    if (body.gymId === 'general') {
      // Para conversaciones generales entre owner y manager
      if (user.role === 'MANAGER') {
        // El manager inicia conversación general, necesitamos encontrar un owner
        const firstOwner = await this.chatService.getAnyActiveOwner();
        if (!firstOwner) {
          throw new BadRequestException('No hay propietarios disponibles para chat');
        }
        return this.chatService.findOrCreateGeneralConversation(firstOwner.id, user.id);
      } else if (user.role === 'OWNER') {
        if (!body.managerId) {
          throw new BadRequestException('Se requiere el ID del manager para iniciar la conversación');
        }
        return this.chatService.findOrCreateGeneralConversation(user.id, body.managerId);
      }
    } else {
      // Flujo normal con gimnasio específico
      try {
        const gym = await this.chatService.getGymWithOwner(body.gymId);
        
        if (user.role === 'MANAGER') {
          return this.chatService.findOrCreateConversation(gym.ownerId, user.id, body.gymId);
        } else if (user.role === 'OWNER') {
          if (!body.managerId) {
            throw new BadRequestException('Se requiere el ID del manager para iniciar la conversación');
          }
          return this.chatService.findOrCreateConversation(user.id, body.managerId, body.gymId);
        }
      } catch (error) {
        // Si el gym no existe, crear conversación general
        if (user.role === 'MANAGER') {
          const firstOwner = await this.chatService.getAnyActiveOwner();
          if (!firstOwner) {
            throw new BadRequestException('No hay propietarios disponibles para chat');
          }
          return this.chatService.findOrCreateGeneralConversation(firstOwner.id, user.id);
        }
        throw error;
      }
    }
    
    throw new BadRequestException('Rol no autorizado para iniciar conversaciones');
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') conversationId: string,
    @CurrentUser() user: User
  ) {
    return this.chatService.getMessagesForConversation(conversationId, user.id);
  }

  @Patch('conversations/:id/close')
  async closeConversation(
    @Param('id') conversationId: string,
    @CurrentUser() user: User
  ) {
    const conversation = await this.chatService.closeConversation(conversationId, user.id);
    return {
      success: true,
      data: conversation,
      message: 'Conversación cerrada exitosamente'
    };
  }
}