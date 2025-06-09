import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { RecordSaleDto } from './dto/record-sale.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto, gymId: string) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        gymId,
      },
    });
  }

  async getProducts(gymId: string) {
    return this.prisma.product.findMany({
      where: { gymId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }

  async updateProduct(id: string, updateProductDto: Partial<CreateProductDto>) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async recordSale(recordSaleDto: RecordSaleDto, sellerId: string, gymId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Create the sale
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

      // Create sale items and update product stock
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

        // Update product stock
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
  }

  async getSales(gymId: string) {
    return this.prisma.sale.findMany({
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
  }
}