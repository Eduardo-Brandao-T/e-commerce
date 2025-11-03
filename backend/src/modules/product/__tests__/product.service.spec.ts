import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../product.service';
import { ProductRepository } from '../product.repository';
import { CreateProductDTO } from '../dto/createProduct.dto';

describe('ProductService', () => {
  let service: ProductService;
  let repository: ProductRepository;

  const mockProductRepository = {
    findProductById: jest.fn(),
    findManyProducts: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: ProductRepository, useValue: mockProductRepository },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<ProductRepository>(ProductRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a product by id', async () => {
    const product = {
      id: 1,
      name: 'Product 1',
      price: 100,
      description: 'Test product',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockProductRepository.findProductById.mockResolvedValue(product);

    const result = await service.getProductById(1);
    expect(result).toEqual(product);
    expect(mockProductRepository.findProductById).toHaveBeenCalledWith(1);
  });

  it('should return all products', async () => {
    const products = [
      {
        id: 1,
        name: 'Product 1',
        price: 100,
        description: 'Test 1',
      },
      {
        id: 2,
        name: 'Product 2',
        price: 200,
        description: 'Test 2',
      },
    ];
    mockProductRepository.findManyProducts.mockResolvedValue(products);

    const result = await service.getAllProducts();
    expect(result).toEqual(products);
    expect(mockProductRepository.findManyProducts).toHaveBeenCalled();
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
    mockProductRepository.createProduct.mockResolvedValue(createdProduct);

    const result = await service.createProduct(dto);
    expect(result).toEqual(createdProduct);
    expect(mockProductRepository.createProduct).toHaveBeenCalledWith(dto);
  });

  it('should update a product', async () => {
    const updateData = { price: 180 };
    const updatedProduct = {
      id: 3,
      name: 'New Product',
      price: 180,
      description: 'New desc',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockProductRepository.updateProduct.mockResolvedValue(updatedProduct);

    const result = await service.updateProduct(3, updateData);
    expect(result).toEqual(updatedProduct);
    expect(mockProductRepository.updateProduct).toHaveBeenCalledWith(
      3,
      updateData,
    );
  });
});
