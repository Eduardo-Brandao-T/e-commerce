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
    const result = await this.productRepository.updateProduct(id, data);
    if (result) {
      await this.logService.createLog({
        action: ActionType.UPDATE,
        entity: EntityType.PRODUCT,
        entityId: result.id,
        performedById: currentUser.userId,
        description: `Product ${result.id} updated by ${currentUser.userId}`,
      });
    }

    return result;
  }
}
