import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../order.controller';
import { OrderService } from '../order.service';
import { CreateOrderDto } from '../dto/createOrder.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrderService = {
    getOrdersWithFilters: jest.fn(),
    getOrdersByUserId: jest.fn(),
    createOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: mockOrderService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(OrderController);
    service = module.get(OrderService);
  });

  it('should return orders', async () => {
    const orders = [{ id: 1 }];
    mockOrderService.getOrdersWithFilters.mockResolvedValue(orders);
    expect(await controller.getOrders({})).toEqual(orders);
  });

  it('should create an order', async () => {
    const dto: CreateOrderDto = {
      userId: 1,
      items: [{ productId: 1, quantity: 1 }],
    };
    mockOrderService.createOrder.mockResolvedValue({ id: 1, total: 100 });
    expect(await controller.createOrder(dto)).toEqual({ id: 1, total: 100 });
  });
});
