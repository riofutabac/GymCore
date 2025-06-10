import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards,
  Logger,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { RecordSaleDto } from './dto/record-sale.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('inventory')
@UseGuards(AuthGuard)
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);

  constructor(private readonly inventoryService: InventoryService) {}

  @Post('products')
  @Roles([Role.MANAGER, Role.SYS_ADMIN])
  @UseGuards(RoleGuard)
  async createProduct(
    @Body() createProductDto: CreateProductDto, 
    @CurrentUser('sub') userId: string
  ) {
    this.logger.log(`Creating product for user: ${userId}`);
    return this.inventoryService.createProduct(createProductDto, userId);
  }

  @Get('products')
  @Roles([Role.MANAGER, Role.RECEPTION, Role.SYS_ADMIN])
  @UseGuards(RoleGuard)
  async getProducts(@CurrentUser('sub') userId: string) {
    this.logger.log(`Getting products for user: ${userId}`);
    return this.inventoryService.getProducts(userId);
  }

  @Post('sales')
  @Roles([Role.MANAGER, Role.RECEPTION, Role.SYS_ADMIN])
  @UseGuards(RoleGuard)
  async recordSale(
    @Body() recordSaleDto: RecordSaleDto, 
    @CurrentUser('sub') userId: string
  ) {
    this.logger.log(`Recording sale for user: ${userId}`);
    return this.inventoryService.recordSale(recordSaleDto, userId);
  }

  @Get('sales')
  @Roles([Role.MANAGER, Role.SYS_ADMIN])
  @UseGuards(RoleGuard)
  async getSales(@CurrentUser('sub') userId: string) {
    this.logger.log(`Getting sales for user: ${userId}`);
    return this.inventoryService.getSales(userId);
  }
}