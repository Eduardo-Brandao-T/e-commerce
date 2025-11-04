import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from '../events.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { PaymentConsumer } from '../consumer/payment.consumer';

describe('PaymentConsumer', () => {
  let consumer: PaymentConsumer;
  let prisma: PrismaService;
  let eventsService: EventsService;

  const mockPrisma = {
    order: {
      update: jest.fn(),
    },
  };

  const mockEvents = {
    emit: jest.fn(),
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

    jest.spyOn(consumer as any, 'simulateExternalPayment');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process payment successfully', async () => {
    (consumer as any).simulateExternalPayment.mockResolvedValue({
      success: true,
      status: OrderStatus.PAYMENT_CONFIRMED,
    });

    await consumer.handleOrderCreated({ orderId: 1 });

    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: OrderStatus.PAYMENT_CONFIRMED },
    });
    expect(mockEvents.emit).toHaveBeenCalledWith('PAYMENT_PROCESSED', {
      orderId: 1,
    });
  });

  it('should handle payment failure without event emission', async () => {
    (consumer as any).simulateExternalPayment.mockResolvedValue({
      success: false,
      status: OrderStatus.PAYMENT_FAILED,
    });

    await consumer.handleOrderCreated({ orderId: 2 });

    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { status: OrderStatus.PAYMENT_FAILED },
    });
    expect(mockEvents.emit).not.toHaveBeenCalled();
  });

  it('should log and rethrow errors when simulateExternalPayment fails', async () => {
    (consumer as any).simulateExternalPayment.mockRejectedValue(
      new Error('DB error'),
    );

    await expect(consumer.handleOrderCreated({ orderId: 3 })).rejects.toThrow(
      'DB error',
    );

    expect(mockPrisma.order.update).not.toHaveBeenCalled();
    expect(mockEvents.emit).not.toHaveBeenCalled();
  });
});
