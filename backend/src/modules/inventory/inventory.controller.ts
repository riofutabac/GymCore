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
import { InventoryService } from './inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { RecordSaleDto } from './dto/record-sale.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentGym } from '../../common/decorators/current-gym.decorator';
import { AppLoggerService } from '../../common/logger/app-logger.service';

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
  private readonly logger: AppLoggerService;

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
  async createProduct(
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
  async recordSale(
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
  }
}