import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getConversationsForUser(userId: string) {
    try {
      console.time('getConversationsForUser');
      
      const conversations = await this.prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              id: userId,
            },
          },
        },
        select: {
          id: true,
          gymId: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          participants: {
            select: { 
              id: true, 
              name: true, 
              role: true, 
              email: true 
            },
          },
          messages: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderId: true,
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 20, // Limitar a 20 conversaciones más recientes
      });

      console.timeEnd('getConversationsForUser');
      return conversations;
    } catch (error) {
      console.error('Error in getConversationsForUser:', error);
      throw error;
    }
  }

  async findOrCreateConversation(ownerId: string, managerId: string, gymId: string) {
    // Primero buscar conversación activa existente
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        gymId,
        status: 'ACTIVE',
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

    // Si existe una conversación activa, verificar si ya hay una
    if (conversation) {
      throw new ConflictException('Ya existe una conversación activa con este usuario');
    }

    // Crear nueva conversación
    conversation = await this.prisma.conversation.create({
      data: {
        gymId,
        status: 'ACTIVE',
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

    return conversation;
  }

  async findOrCreateGeneralConversation(ownerId: string, managerId: string) {
    // Buscar conversación activa existente
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        gymId: null,
        status: 'ACTIVE',
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

    if (conversation) {
      throw new ConflictException('Ya existe una conversación activa con este usuario');
    }

    // Crear nueva conversación
    conversation = await this.prisma.conversation.create({
      data: {
        gymId: null,
        status: 'ACTIVE',
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

    return conversation;
  }

  async closeConversation(conversationId: string, userId: string) {
    // Verificar que el usuario es owner y participante
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { 
          some: { 
            id: userId,
            role: 'OWNER' 
          } 
        }
      }
    });

    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada o no tienes permisos para cerrarla');
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { 
        status: 'CLOSED',
        updatedAt: new Date()
      },
      include: {
        participants: {
          select: { id: true, name: true, role: true, email: true },
        },
      },
    });
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