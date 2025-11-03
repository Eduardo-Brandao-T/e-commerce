import { Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDTO } from './dto/createProduct.dto';

@Injectable()
export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  async getProductById(id: number) {
    return this.productRepository.findProductById(id);
  }

  async getAllProducts() {
    return this.productRepository.findManyProducts();
  }

  async createProduct(data: CreateProductDTO) {
    return this.productRepository.createProduct(data);
  }

  async updateProduct(id: number, data: Partial<CreateProductDTO>) {
    return this.productRepository.updateProduct(id, data);
  }
}
