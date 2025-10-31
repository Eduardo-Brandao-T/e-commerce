import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../product.controller';
import { ProductService } from '../product.service';
import { CreateProductDTO } from '../createProduct.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    getProductById: jest.fn(),
    getAllProducts: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: mockProductService }],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a product by id', async () => {
    const product = {
      id: 1,
      name: 'Product 1',
      price: 100,
      description: 'Test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockProductService.getProductById.mockResolvedValue(product);

    const result = await controller.getProductById(1);
    expect(result).toEqual(product);
    expect(mockProductService.getProductById).toHaveBeenCalledWith(1);
  });

  it('should return all products', async () => {
    const products = [
      {
        id: 1,
        name: 'Product 1',
        price: 100,
        description: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Product 2',
        price: 200,
        description: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    mockProductService.getAllProducts.mockResolvedValue(products);

    const result = await controller.getAllProducts();
    expect(result).toEqual(products);
    expect(mockProductService.getAllProducts).toHaveBeenCalled();
  });

  it('should create a product', async () => {
    const dto: CreateProductDTO = {
      name: 'New Product',
      price: 150,
      description: 'New desc',
    };
    const createdProduct = {
      id: 3,
      ...dto,
    };
    mockProductService.createProduct.mockResolvedValue(createdProduct);

    const result = await controller.createProduct(dto);
    expect(result).toEqual(createdProduct);
    expect(mockProductService.createProduct).toHaveBeenCalledWith(dto);
  });

  it('should update a product', async () => {
    const updateData = { price: 180 };
    const updatedProduct = {
      id: 3,
      name: 'New Product',
      price: 180,
      description: 'New desc',
    };
    mockProductService.updateProduct.mockResolvedValue(updatedProduct);

    const result = await controller.updateProduct(3, updateData);
    expect(result).toEqual(updatedProduct);
    expect(mockProductService.updateProduct).toHaveBeenCalledWith(
      3,
      updateData,
    );
  });
});
