import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../order.service';
import { OrderRepository } from '../order.repository';
import { ProductRepository } from '../../product/product.repository';
import { CreateOrderDto } from '../createOrder.dto';
import { MESSAGES } from 'src/common/constants/messages.constants';
import { EventsService } from 'src/events/events.service';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: OrderRepository;
  let productRepo: ProductRepository;
  let events: EventsService;

  const mockOrderRepository = {
    createOrder: jest.fn(),
    findManyOrders: jest.fn(),
    findOrderById: jest.fn(),
  };
  const mockProductRepository = { findManyProducts: jest.fn() };
  const mockEventsService = { emit: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: OrderRepository, useValue: mockOrderRepository },
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: EventsService, useValue: mockEventsService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepo = module.get(OrderRepository);
    productRepo = module.get(ProductRepository);
    events = module.get(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create an order and emit event', async () => {
      const dto: CreateOrderDto = {
        userId: 1,
        items: [{ productId: 1, quantity: 2 }],
      };

      mockProductRepository.findManyProducts.mockResolvedValue([
        { id: 1, price: 100 },
      ]);
      mockOrderRepository.createOrder.mockResolvedValue({
        id: 1,
        userId: 1,
        total: 200,
        orderItems: [{ productId: 1, quantity: 2, price: 100 }],
      });

      const result = await service.createOrder(dto);

      expect(result.id).toBe(1);
      expect(events.emit).toHaveBeenCalled();
      expect(result.total).toBe(200);
    });

    it('should throw error if product not found', async () => {
      const dto: CreateOrderDto = {
        userId: 1,
        items: [{ productId: 99, quantity: 1 }],
      };
      mockProductRepository.findManyProducts.mockResolvedValue([]);

      await expect(service.createOrder(dto)).rejects.toThrow(
        MESSAGES.PRODUCT.MANY_NOT_FOUND,
      );
    });
  });
});
