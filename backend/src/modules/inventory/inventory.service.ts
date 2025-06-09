import { Injectable } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { Sale } from './entities/sale.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { RecordSaleDto } from './dto/record-sale.dto';

@Injectable()
export class InventoryService {
  private products: Product[] = [];
  private sales: Sale[] = [];
  private nextProductId = 1;
  private nextSaleId = 1;

  createProduct(createProductDto: CreateProductDto): Product {
    const newProduct: Product = {
      id: this.nextProductId++,
      ...createProductDto,
      stock: createProductDto.initialStock || 0, // Initialize stock
    };
    this.products.push(newProduct);
    return newProduct;
  }

  getProducts(): Product[] {
    return this.products;
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  updateProduct(id: number, updateProductDto: Partial<CreateProductDto>): Product | undefined {
    const productIndex = this.products.findIndex(product => product.id === id);
    if (productIndex === -1) {
      return undefined;
    }
    this.products[productIndex] = { ...this.products[productIndex], ...updateProductDto };
    return this.products[productIndex];
  }

  deleteProduct(id: number): boolean {
    const initialLength = this.products.length;
    this.products = this.products.filter(product => product.id !== id);
    return this.products.length < initialLength;
  }

  recordSale(recordSaleDto: RecordSaleDto): Sale | undefined {
    const product = this.getProductById(recordSaleDto.productId);
    if (!product || product.stock < recordSaleDto.quantity) {
      // Handle insufficient stock or product not found
      return undefined;
    }

    product.stock -= recordSaleDto.quantity;

    const newSale: Sale = {
      id: this.nextSaleId++,
      productId: recordSaleDto.productId,
      quantity: recordSaleDto.quantity,
      saleDate: new Date(),
    };
    this.sales.push(newSale);
    return newSale;
  }

  getSales(): Sale[] {
    return this.sales;
  }
}