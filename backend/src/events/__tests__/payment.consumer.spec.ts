import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from '../events.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { PaymentConsumer } from '../consumer/payment.consumer';
import { RmqContext } from '@nestjs/microservices';

describe('PaymentConsumer', () => {
  let consumer: PaymentConsumer;
  let prisma: PrismaService;
  let eventsService: EventsService;
  let mockChannel: any;
  let mockContext: RmqContext;

  const mockPrisma = {
    order: {
      update: jest.fn(),
    },
  };

  const mockEvents = {
    emit: jest.fn(),
    getRetryCount: jest.fn(),
    requeueWithDelay: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentConsumer,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventsService, useValue: mockEvents },
      ],
    }).compile();

    consumer = module.get<PaymentConsumer>(PaymentConsumer);
    prisma = module.get<PrismaService>(PrismaService);
    eventsService = module.get<EventsService>(EventsService);

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
    } as unknown as RmqContext;

    jest.spyOn(consumer as any, 'simulateExternalPayment');
  });

  afterEach(() => jest.clearAllMocks());

  it('should process payment successfully', async () => {
    (consumer as any).simulateExternalPayment.mockResolvedValue({
      success: true,
      status: OrderStatus.PAYMENT_CONFIRMED,
    });

    await consumer.handleOrderCreated({ orderId: 1 }, mockContext);

    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: OrderStatus.PAYMENT_CONFIRMED },
    });
    expect(mockEvents.emit).toHaveBeenCalledWith('PAYMENT_PROCESSED', {
      orderId: 1,
    });
  });

  it('should handle payment failure without emitting event', async () => {
    (consumer as any).simulateExternalPayment.mockResolvedValue({
      success: false,
      status: OrderStatus.PAYMENT_FAILED,
    });

    await consumer.handleOrderCreated({ orderId: 2 }, mockContext);

    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { status: OrderStatus.PAYMENT_FAILED },
    });
    expect(mockEvents.emit).not.toHaveBeenCalled();
    expect(mockChannel.ack).toHaveBeenCalledTimes(1);
  });

  it('should call requeueWithDelay on transient error', async () => {
    const error = new Error('Temporary error');
    (consumer as any).simulateExternalPayment.mockRejectedValue(error);

    mockEvents.getRetryCount.mockReturnValue(0);
    await consumer.handleOrderCreated({ orderId: 3 }, mockContext);

    expect(mockEvents.getRetryCount).toHaveBeenCalled();
    expect(mockEvents.requeueWithDelay).toHaveBeenCalledWith(
      mockChannel,
      expect.any(Object),
      expect.any(Number),
    );
    expect(mockChannel.ack).toHaveBeenCalledTimes(1);
  });

  it('should move to DLQ after max retries', async () => {
    const error = new Error('Still failing');
    (consumer as any).simulateExternalPayment.mockRejectedValue(error);

    mockEvents.getRetryCount.mockReturnValue(5);
    await consumer.handleOrderCreated({ orderId: 4 }, mockContext);

    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      'app_events_dlq',
      expect.any(Buffer),
      expect.any(Object),
    );

    expect(mockEvents.requeueWithDelay).not.toHaveBeenCalled();
    expect(mockChannel.ack).toHaveBeenCalledTimes(1);
  });
});
