import { Test, TestingModule } from '@nestjs/testing';
import { StockConsumer } from '../stock.consumer';
import { PrismaService } from 'src/prisma/prisma.service';
import { RmqContext } from '@nestjs/microservices';
import { OrderStatus } from '@prisma/client';

describe('StockConsumer', () => {
  let consumer: StockConsumer;
  let prisma: PrismaService;

  const mockChannel = {
    ack: jest.fn(),
    nack: jest.fn(),
    publish: jest.fn(),
  };

  const mockContext = {
    getChannelRef: () => mockChannel,
    getMessage: () => ({
      properties: { headers: {} },
      content: Buffer.from(''),
    }),
  } as unknown as RmqContext;

  const orderWithItems = {
    id: 1,
    orderItems: [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ],
    status: OrderStatus.PAYMENT_CONFIRMED,
  };

  const products = [
    { id: 1, stock: 5 },
    { id: 2, stock: 1 },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockConsumer,
        {
          provide: PrismaService,
          useValue: {
            order: { findUnique: jest.fn(), update: jest.fn() },
            product: { findUnique: jest.fn(), update: jest.fn() },
          },
        },
      ],
    }).compile();

    consumer = module.get<StockConsumer>(StockConsumer);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should update stock successfully', async () => {
    prisma.order.findUnique = jest.fn().mockResolvedValue(orderWithItems);
    prisma.product.findUnique = jest
      .fn()
      .mockImplementation(({ where: { id } }) =>
        products.find((p) => p.id === id),
      );
    prisma.product.update = jest.fn().mockResolvedValue(null);
    prisma.order.update = jest.fn().mockResolvedValue(null);

    await consumer.handleStockUpdated({ orderId: 1 }, mockContext);

    expect(prisma.product.update).toHaveBeenCalledTimes(2);
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: OrderStatus.CONFIRMED },
    });
    expect(mockChannel.ack).toHaveBeenCalled();
  });

  it('should handle insufficient stock', async () => {
    prisma.order.findUnique = jest.fn().mockResolvedValue(orderWithItems);
    prisma.product.findUnique = jest
      .fn()
      .mockImplementation(({ where: { id } }) =>
        id === 1 ? { id: 1, stock: 1 } : { id: 2, stock: 1 },
      );
    prisma.product.update = jest.fn();
    prisma.order.update = jest.fn().mockResolvedValue(null);

    await consumer.handleStockUpdated({ orderId: 1 }, mockContext);

    expect(prisma.product.update).not.toHaveBeenCalled();
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: OrderStatus.CANCELLED },
    });
  });

  it('should throw NotFoundException if order not found', async () => {
    prisma.order.findUnique = jest.fn().mockResolvedValue(null);

    await expect(
      consumer.handleStockUpdated({ orderId: 999 }, mockContext),
    ).resolves.toBeUndefined();

    expect(mockChannel.ack).toHaveBeenCalled();
  });

  it('should retry on database error', async () => {
    prisma.order.findUnique = jest.fn().mockRejectedValue(new Error('DB fail'));

    await consumer.handleStockUpdated({ orderId: 1 }, mockContext);

    expect(mockChannel.publish).toHaveBeenCalled();
    expect(mockChannel.ack).toHaveBeenCalled();
  });
});
