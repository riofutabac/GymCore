import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserContextService } from '../../common/services/user-context.service';
import { CreateProductDto } from './dto/create-product.dto';
import { RecordSaleDto } from './dto/record-sale.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private prisma: PrismaService,
    private userContextService: UserContextService,
  ) {}

  async createProduct(createProductDto: CreateProductDto, userId: string) {
    try {
      const gymId = await this.userContextService.getUserGymId(userId);
      
      // Validar que no exista un producto con el mismo SKU en el gimnasio
      if (createProductDto.sku) {
        const existingProduct = await this.prisma.product.findFirst({
          where: {
            sku: createProductDto.sku,
            gymId,
          },
        });

        if (existingProduct) {
          throw new BadRequestException(`Product with SKU ${createProductDto.sku} already exists`);
        }
      }

      const product = await this.prisma.product.create({
        data: {
          ...createProductDto,
          gymId,
        },
      });

      this.logger.log(`Product created successfully: ${product.id}`);
      return {
        success: true,
        message: 'Product created successfully',
        data: product
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error creating product: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to create product');
    }
  }

  async getProducts(userId: string) {
    try {
      const gymId = await this.userContextService.getUserGymId(userId);
      
      const products = await this.prisma.product.findMany({
        where: { gymId },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: products,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error getting products: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to retrieve products');
    }
  }

  async getProductById(id: string, userId: string) {
    try {
      const gymId = await this.userContextService.getUserGymId(userId);
      
      const product = await this.prisma.product.findFirst({
        where: { 
          id,
          gymId, // Asegurar que el producto pertenece al gimnasio del usuario
        },
      });
      
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      
      return product;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error getting product by id: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to retrieve product');
    }
  }

  async recordSale(recordSaleDto: RecordSaleDto, userId: string) {
    try {
      const gymId = await this.userContextService.getUserGymId(userId);
      
      // Validar que todos los productos existen y tienen stock suficiente
      for (const item of recordSaleDto.items) {
        const product = await this.prisma.product.findFirst({
          where: {
            id: item.productId,
            gymId,
          },
        });

        if (!product) {
          throw new BadRequestException(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
          );
        }
      }

      const result = await this.prisma.$transaction(async (tx) => {
        // Crear la venta
        const sale = await tx.sale.create({
          data: {
            total: recordSaleDto.total,
            subtotal: recordSaleDto.subtotal,
            tax: recordSaleDto.tax || 0,
            discount: recordSaleDto.discount || 0,
            notes: recordSaleDto.notes,
            sellerId: userId,
            gymId,
          },
        });

        // Crear items de venta y actualizar stock
        for (const item of recordSaleDto.items) {
          await tx.saleItem.create({
            data: {
              saleId: sale.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            },
          });

          // Actualizar stock del producto
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        return sale;
      });

      this.logger.log(`Sale recorded successfully: ${result.id}`);
      return {
        success: true,
        message: 'Sale recorded successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error recording sale: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to record sale');
    }
  }

  async getSales(userId: string) {
    try {
      const gymId = await this.userContextService.getUserGymId(userId);
      
      const sales = await this.prisma.sale.findMany({
        where: { gymId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: sales,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error getting sales: ${error.message}`, error.stack);
      throw new UnprocessableEntityException('Failed to retrieve sales');
    }
  }
}