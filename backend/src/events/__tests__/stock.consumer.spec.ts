import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { StockConsumer } from '../consumer/stock.consumer';
import { OrderStatus } from '@prisma/client';

describe('StockConsumer', () => {
  let consumer: StockConsumer;
  let prisma: PrismaService;

  const orderWithItems = {
    id: 1,
    orderItems: [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ],
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
            $transaction: jest.fn(),
            $queryRaw: jest.fn(),
            order: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            product: {
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    consumer = module.get<StockConsumer>(StockConsumer);
    prisma = module.get<PrismaService>(PrismaService);

    // Mock de transação
    (prisma.$transaction as unknown as jest.Mock).mockImplementation(
      async (callback: any) => {
        const tx = {
          order: prisma.order,
          product: prisma.product,
          $queryRaw: prisma.$queryRaw,
        };
        return callback(tx);
      },
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should update stock successfully', async () => {
    prisma.order.findUnique = jest.fn().mockResolvedValue(orderWithItems);
    prisma.$queryRaw = jest.fn().mockResolvedValue(products);
    prisma.product.update = jest.fn();
    prisma.order.update = jest.fn();

    await consumer.handleStockUpdated({ orderId: 1 });

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(prisma.product.update).toHaveBeenCalledTimes(2);
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: OrderStatus.CONFIRMED },
    });
  });

  it('should cancel order if insufficient stock', async () => {
    prisma.order.findUnique = jest.fn().mockResolvedValue(orderWithItems);
    prisma.$queryRaw = jest.fn().mockResolvedValue([
      { id: 1, stock: 1 },
      { id: 2, stock: 0 },
    ]);
    prisma.order.update = jest.fn();

    await expect(consumer.handleStockUpdated({ orderId: 1 })).rejects.toThrow();

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: OrderStatus.CANCELLED },
    });
  });

  it('should throw if order not found', async () => {
    prisma.order.findUnique = jest.fn().mockResolvedValue(null);

    await expect(
      consumer.handleStockUpdated({ orderId: 999 }),
    ).rejects.toThrow();
  });

  it('should propagate unexpected errors', async () => {
    prisma.order.findUnique = jest
      .fn()
      .mockRejectedValue(new Error('DB failure'));

    await expect(consumer.handleStockUpdated({ orderId: 1 })).rejects.toThrow(
      'DB failure',
    );
  });
});
