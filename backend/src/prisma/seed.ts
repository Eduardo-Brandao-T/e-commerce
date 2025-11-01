import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // --- Clientes ---
  const customer1 = await prisma.customer.upsert({
    where: { email: 'cliente1@email.com' },
    update: {},
    create: {
      name: 'Cliente 1',
      email: 'cliente1@email.com',
      document: '123.456.789-00',
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { email: 'cliente2@email.com' },
    update: {},
    create: {
      name: 'Cliente 2',
      email: 'cliente2@email.com',
      document: '987.654.321-00',
    },
  });

  // --- Produtos ---
  const product1 = await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Produto A',
      description: 'Descrição A',
      price: 50,
      stock: 100,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Produto B',
      description: 'Descrição B',
      price: 80,
      stock: 50,
    },
  });

  // --- Pedidos de exemplo ---
  const order = await prisma.order.upsert({
    where: { id: 1 },
    update: {},
    create: {
      customerId: customer1.id,
      total: 130,
      status: OrderStatus.PENDING_PAYMENT,
      orderItems: {
        create: [
          { productId: product1.id, quantity: 1, price: product1.price },
          { productId: product2.id, quantity: 1, price: product2.price },
        ],
      },
    },
  });

  console.log('✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
