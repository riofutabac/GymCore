import { Controller, Get, Post, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { RecordSaleDto } from './dto/record-sale.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('products')
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.inventoryService.createProduct(createProductDto);
  }

  @Get('products')
  getProducts() {
    return this.inventoryService.getProducts();
  }

  @Post('sales')
  recordSale(@Body() recordSaleDto: RecordSaleDto) {
 return this.inventoryService.recordSale(recordSaleDto);
  }

 @Get('products')
 getProducts() {
 return this.inventoryService.getProducts();
 }
}