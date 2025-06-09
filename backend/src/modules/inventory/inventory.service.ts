import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { RecordSaleDto } from './dto/record-sale.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto, gymId: string) {
    try {
      const product = await this.prisma.product.create({
        data: {
          ...createProductDto,
          gymId,
        },
      });

      return {
        success: true,
        message: 'Producto creado exitosamente',
        data: product
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Error al crear el producto');
    }
  }

  async getProducts(gymId?: string) {
    try {
      const whereClause = gymId ? { gymId } : {};
      
      const products = await this.prisma.product.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: products,
      };
    } catch (error) {
      console.error('Error getting products:', error);
      throw new Error('Error al obtener productos');
    }
  }

  async getProductById(id: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });
      
      if (!product) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }
      
      return product;
    } catch (error) {
      console.error('Error getting product by id:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updateProductDto: Partial<CreateProductDto>) {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
      });

      return {
        success: true,
        message: 'Producto actualizado exitosamente',
        data: product
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Error al actualizar el producto');
    }
  }

  async deleteProduct(id: string) {
    try {
      await this.prisma.product.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Producto eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Error al eliminar el producto');
    }
  }

  async recordSale(recordSaleDto: RecordSaleDto, sellerId: string, gymId: string) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Crear la venta
        const sale = await tx.sale.create({
          data: {
            total: recordSaleDto.total,
            subtotal: recordSaleDto.subtotal,
            tax: recordSaleDto.tax || 0,
            discount: recordSaleDto.discount || 0,
            notes: recordSaleDto.notes,
            sellerId,
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

      return {
        success: true,
        message: 'Venta registrada exitosamente',
        data: result,
      };
    } catch (error) {
      console.error('Error recording sale:', error);
      throw new Error('Error al registrar la venta');
    }
  }

  async getSales(gymId: string) {
    try {
      const sales = await this.prisma.sale.findMany({
        where: { gymId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          seller: {
            select: {
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
      console.error('Error getting sales:', error);
      throw new Error('Error al obtener las ventas');
    }
  }
}