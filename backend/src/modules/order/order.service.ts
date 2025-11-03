import { Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CreateOrderDto, OrderItemDto } from './createOrder.dto';
import { ProductRepository } from '../product/product.repository';
import { Prisma, Product } from '@prisma/client';
import { EventsService } from 'src/events/events.service';
import { EventType } from 'src/events/eventTypes';
import { GetOrdersFilterDto } from './getOrderFilter.dto';
import { MESSAGES } from 'src/common/constants/messages.constants';

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

  async getOrdersByUserId(UserId: number) {
    return this.orderRepository.findManyOrders({
      where: { userId: UserId },
      include: { orderItems: true },
    });
  }

  private buildWhere(filters: GetOrdersFilterDto) {
    const { orderId, userId, status, startDate, endDate } = filters;

    return {
      ...(orderId && { id: orderId }),
      ...(userId && { userId }),
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

  async createOrder({ userId, items }: CreateOrderDto) {
    const products = await this.getProducts(items);
    const itemsWithPrice = this.buildItemsWithPrice(items, products);
    const total = this.calculateTotal(itemsWithPrice);

    const createdOrder = await this.orderRepository.createOrder({
      user: { connect: { id: userId } },
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
      throw new Error(MESSAGES.PRODUCT.MANY_NOT_FOUND);
    }

    return products;
  }

  private buildItemsWithPrice(
    items: OrderItemDto[],
    products: Product[],
  ): PrismaOrderItemInput[] {
    return items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product)
        throw new Error(`${MESSAGES.PRODUCT.NOT_FOUND} ${item.productId}`);

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
      userId: order.userId,
      total: order.total,
      items: order.orderItems,
      status: order.status,
      createdAt: order.createdAt,
    });
  }
}
