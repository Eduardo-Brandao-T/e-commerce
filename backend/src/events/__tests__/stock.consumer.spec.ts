import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { StockConsumer } from '../consumer/stock.consumer';
import { OrderStatus } from '@prisma/client';
import { EventsService } from '../events.service';

describe('StockConsumer', () => {
  let consumer: StockConsumer;
  let prisma: PrismaService;
  let mockChannel: any;
  let mockContext: any;
  let mockEvents: any;

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
    mockEvents = {
      emit: jest.fn(),
      getRetryCount: jest.fn().mockReturnValue(0),
      requeueWithDelay: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockConsumer,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            $queryRaw: jest.fn(),
            order: { findUnique: jest.fn(), update: jest.fn() },
            product: { update: jest.fn() },
          },
        },
        { provide: EventsService, useValue: mockEvents },
      ],
    }).compile();

    consumer = module.get<StockConsumer>(StockConsumer);
    prisma = module.get<PrismaService>(PrismaService);

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

    mockChannel = {
      ack: jest.fn(),
      sendToQueue: jest.fn(),
    };

    mockContext = {
      getChannelRef: () => mockChannel,
      getMessage: () => ({
        content: Buffer.from(JSON.stringify({ orderId: 1 })),
        properties: { headers: {} },
      }),
    };
  });

  afterEach(() => jest.clearAllMocks());

  it('should update stock successfully', async () => {
    prisma.order.findUnique = jest.fn().mockResolvedValue(orderWithItems);
    prisma.$queryRaw = jest.fn().mockResolvedValue(products);
    prisma.product.update = jest.fn();
    prisma.order.update = jest.fn();

    await consumer.handleStockUpdated({ orderId: 1 }, mockContext);

    expect(prisma.product.update).toHaveBeenCalledTimes(2);
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: OrderStatus.CONFIRMED },
    });
    expect(mockEvents.requeueWithDelay).not.toHaveBeenCalled();
  });

  it('should retry when insufficient stock (exponential backoff)', async () => {
    prisma.order.findUnique = jest.fn().mockResolvedValue(orderWithItems);
    prisma.$queryRaw = jest.fn().mockResolvedValue([{ id: 1, stock: 1 }]);
    prisma.order.update = jest.fn();

    mockEvents.getRetryCount.mockReturnValue(2);

    await consumer.handleStockUpdated({ orderId: 1 }, mockContext);

    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: OrderStatus.CANCELLED },
    });

    expect(mockEvents.requeueWithDelay).toHaveBeenCalledWith(
      mockChannel,
      expect.any(Object),
      5000 * Math.pow(2, 2),
    );
    expect(mockChannel.ack).toHaveBeenCalled();
  });

  it('should send to DLQ after max retries', async () => {
    prisma.order.findUnique = jest.fn().mockRejectedValue(new Error('DB fail'));

    const msg = mockContext.getMessage();
    msg.properties.headers['x-death'] = [{ count: 5 }];

    mockEvents.getRetryCount.mockReturnValue(5);

    await consumer.handleStockUpdated({ orderId: 1 }, mockContext);

    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      'app_events_dlq',
      msg.content,
      expect.any(Object),
    );
    expect(mockEvents.requeueWithDelay).not.toHaveBeenCalled();
    expect(mockChannel.ack).toHaveBeenCalled();
  });
});
