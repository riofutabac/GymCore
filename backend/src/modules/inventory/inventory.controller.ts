import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { RecordSaleDto } from './dto/record-sale.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/inventory')
@UseGuards(AuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('products')
  createProduct(@Body() createProductDto: CreateProductDto, @CurrentUser('gymId') gymId: string) {
    return this.inventoryService.createProduct(createProductDto, gymId);
  }

  @Get('products')
  getProducts(@CurrentUser('gymId') gymId: string) {
    return this.inventoryService.getProducts(gymId);
  }

  @Post('sales')
  recordSale(@Body() recordSaleDto: RecordSaleDto, @CurrentUser('id') sellerId: string, @CurrentUser('gymId') gymId: string) {
    return this.inventoryService.recordSale(recordSaleDto, sellerId, gymId);
  }

  @Get('sales')
  getSales(@CurrentUser('gymId') gymId: string) {
    return this.inventoryService.getSales(gymId);
  }
}