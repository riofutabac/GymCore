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
          select: { id: true, name: true, role: true },
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
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          gymId,
          participants: {
            connect: [{ id: ownerId }, { id: managerId }],
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
        sender: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMessage(senderId: string, conversationId: string, content: string) {
    // Validar que el usuario sea participante de la conversación
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: senderId } },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada o no tienes acceso.');
    }

    // Crear el mensaje
    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        conversationId,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    // Actualizar el timestamp de la conversación
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
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
}