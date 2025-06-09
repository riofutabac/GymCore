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
  createProduct(
    @Body() createProductDto: CreateProductDto, 
    @CurrentUser() user: any
  ) {
    // FIX: Obtener gymId correctamente según el rol del usuario
    let gymId = user.staffOfGymId || user.memberOfGymId;
    
    // Si es propietario, usar su gimnasio
    if (user.role === 'SYS_ADMIN' && !gymId) {
      gymId = 'demo-gym-id'; // Usar un ID por defecto para demo
    }
    
    if (!gymId) {
      throw new BadRequestException('El usuario no está asignado a un gimnasio.');
    }
    
    return this.inventoryService.createProduct(createProductDto, gymId);
  }

  @Get('products')
  getProducts(@CurrentUser() user: any) {
    const gymId = user.staffOfGymId || user.memberOfGymId || 'demo-gym-id';
    return this.inventoryService.getProducts(gymId);
  }

  @Post('sales')
  recordSale(
    @Body() recordSaleDto: RecordSaleDto, 
    @CurrentUser() user: any
  ) {
    const gymId = user.staffOfGymId || user.memberOfGymId || 'demo-gym-id';
    return this.inventoryService.recordSale(recordSaleDto, user.id, gymId);
  }

  @Get('sales')
  getSales(@CurrentUser() user: any) {
    const gymId = user.staffOfGymId || user.memberOfGymId || 'demo-gym-id';
    return this.inventoryService.getSales(gymId);
  }
}