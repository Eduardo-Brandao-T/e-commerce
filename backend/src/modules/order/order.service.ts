import { Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CreateOrderDto, OrderItemDto } from './createOrder.dto';
import { ProductRepository } from '../product/product.repository';
import { Prisma, Product } from '@prisma/client';
import { EventsService } from 'src/events/events.service';
import { EventType } from 'src/events/eventTypes';
import { GetOrdersFilterDto } from './getOrderFilter.dto';

type PrismaOrderItemInput = {
  product: { connect: { id: number } };
  quantity: number;
  price: number;
};
type OrderWithItems = Prisma.OrderGetPayload<{
  include: { orderItems: true };
}>;

@Injectable()
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository,
    private events: EventsService,
  ) {}

  async getOrdersWithFilters(filters: GetOrdersFilterDto) {
    const where = this.buildWhere(filters);

    const take = filters.limit || 10;
    const skip = filters.page ? (filters.page - 1) * take : 0;

    const [field, direction] = filters.sort?.split(':') ?? [
      'createdAt',
      'desc',
    ];

    return this.orderRepository.findManyOrders({
      where,
      include: { orderItems: true },
      orderBy: { [field]: direction },
      skip,
      take,
    });
  }

  async getOrderById(id: number) {
    return this.orderRepository.findOrderById(id);
  }

  private buildWhere(filters: GetOrdersFilterDto) {
    const { orderId, customerId, status, startDate, endDate } = filters;

    return {
      ...(orderId && { id: orderId }),
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };
  }

  async createOrder({ customerId, items }: CreateOrderDto) {
    const products = await this.getProducts(items);
    const itemsWithPrice = this.buildItemsWithPrice(items, products);
    const total = this.calculateTotal(itemsWithPrice);

    const createdOrder = await this.orderRepository.createOrder({
      customer: { connect: { id: customerId } },
      total,
      orderItems: {
        create: itemsWithPrice,
      },
    });
    this.emitOrderCreatedEvent(createdOrder);

    return createdOrder;
  }

  private async getProducts(items: OrderItemDto[]): Promise<Product[]> {
    const productIds = items.map((item) => item.productId);

    const products = await this.productRepository.findManyProducts({
      id: { in: productIds },
    });

    if (products.length !== items.length) {
      throw new Error('Um ou mais produtos não foram encontrados');
    }

    return products;
  }

  private buildItemsWithPrice(
    items: OrderItemDto[],
    products: Product[],
  ): PrismaOrderItemInput[] {
    return items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Produto ${item.productId} não encontrado`);

      return {
        product: { connect: { id: item.productId } },
        quantity: item.quantity,
        price: product.price,
      };
    });
  }

  private calculateTotal(items: { quantity: number; price: number }[]): number {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  private emitOrderCreatedEvent(order: OrderWithItems) {
    this.events.emit(EventType.ORDER_CREATED, {
      orderId: order.id,
      customerId: order.customerId,
      total: order.total,
      items: order.orderItems,
      status: order.status,
      createdAt: order.createdAt,
    });
  }
}
