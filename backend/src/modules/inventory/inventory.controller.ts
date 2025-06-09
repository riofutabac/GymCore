import { Controller, Get, Post, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { RecordSaleDto } from './dto/record-sale.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('inventory')
@UseGuards(AuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('products')
  async createProduct(
    @Body() createProductDto: CreateProductDto, 
    @CurrentUser() user: any
  ) {
    console.log('🏗️ [INVENTORY] Creating product for user:', user);
    
    // Obtener gymId correctamente según el rol del usuario
    let gymId = user.staffOfGymId || user.memberOfGymId;
    
    // Si es propietario, buscar su gimnasio
    if (user.role === 'SYS_ADMIN' && !gymId) {
      // Para administradores del sistema, necesitamos obtener su gimnasio
      const userWithGym = await this.inventoryService['prisma'].user.findUnique({
        where: { id: user.id },
        include: { ownedGym: true }
      });
      gymId = userWithGym?.ownedGym?.id;
    }
    
    if (!gymId) {
      throw new BadRequestException('El usuario no está asignado a un gimnasio.');
    }
    
    console.log('🏗️ [INVENTORY] Using gymId:', gymId);
    return this.inventoryService.createProduct(createProductDto, gymId);
  }

  @Get('products')
  async getProducts(@CurrentUser() user: any) {
    console.log('📦 [INVENTORY] Getting products for user:', user);
    
    let gymId = user.staffOfGymId || user.memberOfGymId;
    
    // Si es propietario, buscar su gimnasio
    if (user.role === 'SYS_ADMIN' && !gymId) {
      const userWithGym = await this.inventoryService['prisma'].user.findUnique({
        where: { id: user.id },
        include: { ownedGym: true }
      });
      gymId = userWithGym?.ownedGym?.id;
    }
    
    console.log('📦 [INVENTORY] Using gymId for products:', gymId);
    return this.inventoryService.getProducts(gymId);
  }

  @Post('sales')
  async recordSale(
    @Body() recordSaleDto: RecordSaleDto, 
    @CurrentUser() user: any
  ) {
    console.log('💰 [INVENTORY] Recording sale for user:', user);
    
    let gymId = user.staffOfGymId || user.memberOfGymId;
    
    if (user.role === 'SYS_ADMIN' && !gymId) {
      const userWithGym = await this.inventoryService['prisma'].user.findUnique({
        where: { id: user.id },
        include: { ownedGym: true }
      });
      gymId = userWithGym?.ownedGym?.id;
    }
    
    if (!gymId) {
      throw new BadRequestException('El usuario no está asignado a un gimnasio.');
    }
    
    console.log('💰 [INVENTORY] Using gymId for sale:', gymId);
    return this.inventoryService.recordSale(recordSaleDto, user.id, gymId);
  }

  @Get('sales')
  async getSales(@CurrentUser() user: any) {
    console.log('📊 [INVENTORY] Getting sales for user:', user);
    
    let gymId = user.staffOfGymId || user.memberOfGymId;
    
    if (user.role === 'SYS_ADMIN' && !gymId) {
      const userWithGym = await this.inventoryService['prisma'].user.findUnique({
        where: { id: user.id },
        include: { ownedGym: true }
      });
      gymId = userWithGym?.ownedGym?.id;
    }
    
    if (!gymId) {
      throw new BadRequestException('El usuario no está asignado a un gimnasio.');
    }
    
    console.log('📊 [INVENTORY] Using gymId for sales:', gymId);
    return this.inventoryService.getSales(gymId);
  }
}