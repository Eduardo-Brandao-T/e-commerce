import { Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDTO } from './dto/createProduct.dto';
import type { UserPayload } from '../auth/dto/userPayload.type';
import { ActionType, EntityType, Product } from '@prisma/client';
import { LogService } from '../log/log.service';

@Injectable()
export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private logService: LogService,
  ) {}

  async getProductById(id: number): Promise<Product | null> {
    return this.productRepository.findProductById(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.findManyProducts();
  }

  async createProduct(
    data: CreateProductDTO,
    currentUser: UserPayload,
  ): Promise<Product | null> {
    const result = await this.productRepository.createProduct(data);
    if (result) {
      await this.logService.createLog({
        action: ActionType.CREATE,
        entity: EntityType.PRODUCT,
        entityId: result.id,
        performedById: currentUser.userId,
        description: `Product ${result.id} created by ${currentUser.userId}`,
      });
    }

    return result;
  }

  async updateProduct(
    id: number,
    data: Partial<CreateProductDTO>,
    currentUser: UserPayload,
  ): Promise<Product | null> {
    const oldProduct = await this.productRepository.findProductById(id);
    if (!oldProduct) return null;

    const updatedProduct = await this.productRepository.updateProduct(id, data);
    if (updatedProduct) {
      const oldValues = Object.keys(data).reduce(
        (acc, key) => {
          acc[key] = oldProduct[key as keyof typeof oldProduct];
          return acc;
        },
        {} as Record<string, any>,
      );

      const description = JSON.stringify({
        old: oldValues,
        new: data,
      });

      await this.logService.createLog({
        action: ActionType.UPDATE,
        entity: EntityType.PRODUCT,
        entityId: updatedProduct.id,
        performedById: currentUser.userId,
        description,
      });
    }

    return updatedProduct;
  }
}
