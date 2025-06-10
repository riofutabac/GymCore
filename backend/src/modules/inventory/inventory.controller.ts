<<<<<<< HEAD
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
=======
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards,
  Logger,
} from '@nestjs/common';
>>>>>>> 2c8043283d04c7cfdd332081d0cb9679f5aeac9a
import { InventoryService } from './inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { RecordSaleDto } from './dto/record-sale.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
<<<<<<< HEAD
import { CurrentGym } from '../../common/decorators/current-gym.decorator';
import { AppLoggerService } from '../../common/logger/app-logger.service';
=======
import { Role } from '../../common/enums/role.enum';
>>>>>>> 2c8043283d04c7cfdd332081d0cb9679f5aeac9a

interface Gym {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

@ApiTags('Inventario')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(AuthGuard)
export class InventoryController {
<<<<<<< HEAD
  private readonly logger: AppLoggerService;
=======
  private readonly logger = new Logger(InventoryController.name);

  constructor(private readonly inventoryService: InventoryService) {}
>>>>>>> 2c8043283d04c7cfdd332081d0cb9679f5aeac9a

  constructor(
    private readonly inventoryService: InventoryService,
    logger: AppLoggerService,
  ) {
    this.logger = logger.setContext('InventoryController');
  }

  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o usuario sin gimnasio asignado',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  @ApiBody({ type: CreateProductDto })
  @Post('products')
  @Roles([Role.MANAGER, Role.SYS_ADMIN])
  @UseGuards(RoleGuard)
  async createProduct(
<<<<<<< HEAD
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: User,
    @CurrentGym() gym: Gym,
  ) {
    this.logger.log('LOG', `Creating product for user: ${user.email}`);
    
    if (!gym) {
      throw new BadRequestException(
        'El usuario no está asignado a un gimnasio.'
      );
    }
    
    try {
      this.logger.log('LOG', `Using gymId: ${gym.id}`);
      return this.inventoryService.createProduct(createProductDto, gym.id);
    } catch (error: unknown) {
      this.logger.error(
        `Error creating product: ${String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Error al crear el producto');
    }
=======
    @Body() createProductDto: CreateProductDto, 
    @CurrentUser('sub') userId: string
  ) {
    this.logger.log(`Creating product for user: ${userId}`);
    return this.inventoryService.createProduct(createProductDto, userId);
>>>>>>> 2c8043283d04c7cfdd332081d0cb9679f5aeac9a
  }

  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Usuario sin gimnasio asignado',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  @Get('products')
<<<<<<< HEAD
  async getProducts(@CurrentGym() gym: Gym) {
    if (!gym) {
      throw new BadRequestException(
        'El usuario no está asignado a un gimnasio.'
      );
    }
    
    try {
      this.logger.log('LOG', `Using gymId for products: ${gym.id}`);
      return this.inventoryService.getProducts(gym.id);
    } catch (error: unknown) {
      this.logger.error(
        `Error getting products: ${String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Error al obtener los productos');
    }
=======
  @Roles([Role.MANAGER, Role.RECEPTION, Role.SYS_ADMIN])
  @UseGuards(RoleGuard)
  async getProducts(@CurrentUser('sub') userId: string) {
    this.logger.log(`Getting products for user: ${userId}`);
    return this.inventoryService.getProducts(userId);
>>>>>>> 2c8043283d04c7cfdd332081d0cb9679f5aeac9a
  }

  @ApiOperation({ summary: 'Registrar una nueva venta' })
  @ApiResponse({
    status: 201,
    description: 'Venta registrada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o usuario sin gimnasio asignado',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  @ApiBody({ type: RecordSaleDto })
  @Post('sales')
  @Roles([Role.MANAGER, Role.RECEPTION, Role.SYS_ADMIN])
  @UseGuards(RoleGuard)
  async recordSale(
<<<<<<< HEAD
    @Body() recordSaleDto: RecordSaleDto,
    @CurrentUser() user: User,
    @CurrentGym() gym: Gym,
  ) {
    this.logger.log('LOG', `Recording sale for user: ${user.email}`);
    
    if (!gym) {
      throw new BadRequestException(
        'El usuario no está asignado a un gimnasio.'
      );
    }
    
    try {
      this.logger.log('LOG', `Using gymId for sale: ${gym.id}`);
      return this.inventoryService.recordSale(recordSaleDto, user.id, gym.id);
    } catch (error: unknown) {
      this.logger.error(
        `Error recording sale: ${String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Error al registrar la venta');
    }
=======
    @Body() recordSaleDto: RecordSaleDto, 
    @CurrentUser('sub') userId: string
  ) {
    this.logger.log(`Recording sale for user: ${userId}`);
    return this.inventoryService.recordSale(recordSaleDto, userId);
>>>>>>> 2c8043283d04c7cfdd332081d0cb9679f5aeac9a
  }

  @ApiOperation({ summary: 'Obtener todas las ventas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de ventas obtenida exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Usuario sin gimnasio asignado',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  @Get('sales')
<<<<<<< HEAD
  async getSales(@CurrentGym() gym: Gym) {
    if (!gym) {
      throw new BadRequestException(
        'El usuario no está asignado a un gimnasio.'
      );
    }
    
    try {
      this.logger.log('LOG', `Using gymId for sales: ${gym.id}`);
      return this.inventoryService.getSales(gym.id);
    } catch (error: unknown) {
      this.logger.error(
        `Error getting sales: ${String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Error al obtener las ventas');
    }
=======
  @Roles([Role.MANAGER, Role.SYS_ADMIN])
  @UseGuards(RoleGuard)
  async getSales(@CurrentUser('sub') userId: string) {
    this.logger.log(`Getting sales for user: ${userId}`);
    return this.inventoryService.getSales(userId);
>>>>>>> 2c8043283d04c7cfdd332081d0cb9679f5aeac9a
  }
}