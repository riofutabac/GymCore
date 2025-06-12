import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getConversationsForUser(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        participants: {
          select: { id: true, name: true, role: true, email: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Obtener solo el último mensaje para la vista previa
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOrCreateConversation(ownerId: string, managerId: string, gymId: string) {
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        gymId,
        participants: {
          every: {
            id: { in: [ownerId, managerId] },
          },
        },
      },
      include: {
        participants: {
          select: { id: true, name: true, role: true, email: true },
        },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          gymId,
          participants: {
            connect: [{ id: ownerId }, { id: managerId }],
          },
        },
        include: {
          participants: {
            select: { id: true, name: true, role: true, email: true },
          },
        },
      });
    }
    return conversation;
  }

  async findOrCreateGeneralConversation(ownerId: string, managerId: string) {
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        gymId: null, // Conversación general sin gimnasio específico
        participants: {
          every: {
            id: { in: [ownerId, managerId] },
          },
        },
      },
      include: {
        participants: {
          select: { id: true, name: true, role: true, email: true },
        },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          gymId: null, // Sin gimnasio específico
          participants: {
            connect: [{ id: ownerId }, { id: managerId }],
          },
        },
        include: {
          participants: {
            select: { id: true, name: true, role: true, email: true },
          },
        },
      });
    }
    return conversation;
  }
  
  async getMessagesForConversation(conversationId: string, userId: string) {
    // Validar que el usuario sea participante
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: userId } },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada o no tienes acceso.');
    }

    return this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, role: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMessage(senderId: string, conversationId: string, content: string) {
    // Primero verificar que la conversación existe y el usuario es participante
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: senderId } }
      }
    });

    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada o no tienes acceso');
    }

    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        conversationId,
      },
      include: {
        sender: { 
          select: { 
            id: true, 
            name: true, 
            role: true, 
            email: true 
          } 
        },
      },
    });

    console.log('💾 Mensaje creado en BD:', {
      id: message.id,
      senderId: message.senderId,
      conversationId: message.conversationId,
      content: message.content,
      sender: message.sender
    });

    return message;
  }

  async getGymWithOwner(gymId: string) {
    const gym = await this.prisma.gym.findUnique({
      where: { id: gymId },
      include: { owner: true }
    });

    if (!gym) {
      throw new NotFoundException(`Gimnasio con ID ${gymId} no encontrado`);
    }

    return gym;
  }

  async getFirstOwner() {
    return this.prisma.user.findFirst({
      where: { 
        role: 'OWNER',
        isActive: true 
      },
      select: { id: true, name: true, email: true, role: true }
    });
  }

  async getAnyActiveOwner() {
    // Método alternativo para obtener cualquier propietario activo
    const owners = await this.prisma.user.findMany({
      where: { 
        role: 'OWNER',
        isActive: true 
      },
      select: { id: true, name: true, email: true, role: true },
      take: 5 // Obtener hasta 5 propietarios
    });
    
    return owners.length > 0 ? owners[0] : null;
  }

  async getConversationWithParticipants(conversationId: string) {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          select: { id: true, name: true, role: true, email: true },
        },
      },
    });
  }
}