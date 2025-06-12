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
    return this.chatService.getConversationsForUser(user.id);
  }

  @Post('conversations/initiate')
  async initiateConversation(@CurrentUser() user: User, @Body() body: { gymId: string, managerId?: string }) {
    // Obtener el gimnasio y su propietario
    const gym = await this.chatService.getGymWithOwner(body.gymId);
    
    // Dependiendo del rol, iniciar conversación entre manager y owner
    if (user.role === 'MANAGER') {
      return this.chatService.findOrCreateConversation(gym.ownerId, user.id, body.gymId);
    } else if (user.role === 'OWNER') {
      // Si es el owner quien inicia, necesitamos el ID del manager
      if (!body.managerId) {
        throw new BadRequestException('Se requiere el ID del manager para iniciar la conversación');
      }
      return this.chatService.findOrCreateConversation(user.id, body.managerId, body.gymId);
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
}