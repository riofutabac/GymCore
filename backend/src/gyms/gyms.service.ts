import { 
  Injectable, 
  NotFoundException, 
  UnprocessableEntityException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGymDto } from './dto/create-gym.dto';

// Función para generar código único de gimnasio
const generateJoinCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

@Injectable()
export class GymsService {
  private readonly logger = new Logger(GymsService.name);

  constructor(private prisma: PrismaService) {}

  async joinByCode(code: string) {
    try {
      if (!code || code.trim().length === 0) {
        throw new BadRequestException('Join code is required');
      }

      const gym = await this.prisma.gym.findUnique({
        where: { joinCode: code.toUpperCase() },
        include: {
          _count: {
            select: {
              members: true,
              staff: true,
            }
          }
        }
      });

      if (!gym) {
        throw new NotFoundException(`Gym with code "${code}" not found`);
      }

      if (!gym.isActive) {
        throw new BadRequestException('This gym is currently inactive');
      }

      this.logger.log(`User successfully joined gym: ${gym.name}`);

      return {
        success: true,
        message: 'Successfully joined the gym',
        gym: {
          id: gym.id,
          name: gym.name,
          code: gym.joinCode
        }
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error joining gym by code: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to join gym');
    }
  }

  async getAll() {
    try {
      const gyms = await this.prisma.gym.findMany({
        include: {
          _count: {
            select: {
              members: true,
              staff: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: gyms
      };
    } catch (error) {
      this.logger.error(`Error getting all gyms: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to retrieve gyms');
    }
  }

  async getMyGym(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          memberOfGyms: true,
          workingAtGym: true,
          ownedGyms: true,
        }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Determinar el gimnasio del usuario según su rol
      let gym: any = null;
      
      // Si es staff, usar el gimnasio donde trabaja
      if (user.workingAtGym) {
        gym = user.workingAtGym;
      } 
      // Si es dueño, usar el primer gimnasio que posee (si hay alguno)
      else if (user.ownedGyms && user.ownedGyms.length > 0) {
        gym = user.ownedGyms[0];
      }
      // Si es miembro, usar el primer gimnasio al que pertenece (si hay alguno)
      else if (user.memberOfGyms && user.memberOfGyms.length > 0) {
        gym = user.memberOfGyms[0];
      }

      if (!gym) {
        throw new NotFoundException('You are not associated with any gym');
      }

      return {
        success: true,
        data: gym
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error getting user's gym: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to retrieve gym information');
    }
  }

  async getById(id: string) {
    try {
      const gym = await this.prisma.gym.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              members: true,
              staff: true,
            }
          }
        }
      });

      if (!gym) {
        throw new NotFoundException(`Gym with ID "${id}" not found`);
      }

      return {
        success: true,
        data: gym
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error getting gym by id: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to retrieve gym');
    }
  }

  async create(gymData: CreateGymDto, userId: string) {
    try {
      // Verificar el rol del usuario
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Solo verificar límite de gimnasios si NO es OWNER
      if (user.role !== 'OWNER') {
        const existingGyms = await this.prisma.gym.findMany({ 
          where: { ownerId: userId } 
        });
        
        if (existingGyms && existingGyms.length > 0) {
          throw new BadRequestException('You already own a gym');
        }
      }

      // Generar código de unión único
      let joinCode = generateJoinCode();
      let codeExists = true;
      
      // Verificar que el código sea único
      while (codeExists) {
        const existingCode = await this.prisma.gym.findUnique({
          where: { joinCode }
        });
        
        if (!existingCode) {
          codeExists = false;
        } else {
          joinCode = generateJoinCode();
        }
      }
      
      // Verificar manager si se proporciona
      if (gymData.managerId) {
        const manager = await this.prisma.user.findUnique({
          where: { id: gymData.managerId }
        });
        
        if (!manager) {
          throw new BadRequestException('Manager not found');
        }
        
        if (manager.role !== 'MANAGER') {
          throw new BadRequestException('Selected user is not a manager');
        }
      }
      
      // Extraer managerId antes de crear el gimnasio (no es parte del modelo Gym)
      const { managerId, ...gymDataWithoutManager } = gymData;
      
      // Crear gimnasio
      const gym = await this.prisma.gym.create({
        data: {
          ...gymDataWithoutManager,
          joinCode,
          ownerId: userId,
          managerId: managerId || null,
        },
      });
      
      // Si se proporcionó un managerId, actualizar el usuario para asignarlo como staff del gimnasio
      if (managerId) {
        await this.prisma.user.update({
          where: { id: managerId },
          data: { workingAtGymId: gym.id }
        });
        
        this.logger.log(`Manager ${managerId} assigned to gym ${gym.id}`);
      }

      this.logger.log(`Gym created successfully: ${gym.name} (${gym.id})`);

      return {
        success: true,
        message: 'Gym created successfully',
        data: gym
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error creating gym: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to create gym');
    }
  }

  async update(id: string, gymData: Partial<CreateGymDto>) {
    try {
      const existingGym = await this.prisma.gym.findUnique({
        where: { id }
      });

      if (!existingGym) {
        throw new NotFoundException(`Gym with ID "${id}" not found`);
      }

      const gym = await this.prisma.gym.update({
        where: { id },
        data: gymData,
      });

      this.logger.log(`Gym updated successfully: ${gym.name} (${gym.id})`);

      return {
        success: true,
        message: 'Gym updated successfully',
        data: gym
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error updating gym: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to update gym');
    }
  }

  async delete(id: string) {
    try {
      const existingGym = await this.prisma.gym.findUnique({
        where: { id }
      });

      if (!existingGym) {
        throw new NotFoundException(`Gym with ID "${id}" not found`);
      }

      // Eliminar registros relacionados en una transacción
      await this.prisma.$transaction(async (tx) => {
        // Eliminar logs de acceso
        await tx.accessLog.deleteMany({
          where: { gymId: id }
        });

        // Eliminar items de venta
        const sales = await tx.sale.findMany({
          where: { gymId: id },
          select: { id: true }
        });
        
        for (const sale of sales) {
          await tx.saleItem.deleteMany({
            where: { saleId: sale.id }
          });
        }

        // Eliminar ventas
        await tx.sale.deleteMany({
          where: { gymId: id }
        });

        // Eliminar productos
        await tx.product.deleteMany({
          where: { gymId: id }
        });

        // Actualizar usuarios que trabajan en este gimnasio
        await tx.user.updateMany({
          where: { workingAtGymId: id },
          data: { workingAtGymId: null }
        });
        
        // Desconectar miembros (relación many-to-many)
        const membersToDisconnect = await tx.user.findMany({
          where: {
            memberOfGyms: {
              some: { id }
            }
          }
        });
        
        for (const member of membersToDisconnect) {
          await tx.gym.update({
            where: { id },
            data: {
              members: {
                disconnect: { id: member.id }
              }
            }
          });
        }
        
        // Desconectar staff (relación many-to-many)
        const staffToDisconnect = await tx.user.findMany({
          where: {
            workingAtGymId: id
          }
        });
        
        for (const staff of staffToDisconnect) {
          await tx.user.update({
            where: { id: staff.id },
            data: { workingAtGymId: null }
          });
        }

        // Finalmente eliminar el gimnasio
        await tx.gym.delete({
          where: { id }
        });
      });

      this.logger.log(`Gym deleted successfully: ${existingGym.name} (${id})`);

      return {
        success: true,
        message: 'Gym deleted successfully'
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error deleting gym: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to delete gym');
    }
  }
}