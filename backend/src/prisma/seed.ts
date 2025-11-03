import { PrismaClient, OrderStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const saltRounds = 10;
const prisma = new PrismaClient();

async function main() {
  // --- Clientes ---
  const adminPassword = await bcrypt.hash('admin', saltRounds);
  const clientPassword = await bcrypt.hash('senha123', saltRounds);
  const user1 = await prisma.user.upsert({
    where: { email: 'admin@email.com' },
    update: {},
    create: {
      name: 'admin',
      email: 'admin@email.com',
      role: Role.ADMIN,
      document: '123.456.789-00',
      password: adminPassword,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'cliente@email.com' },
    update: {},
    create: {
      name: 'Cliente',
      email: 'cliente@email.com',
      document: '987.654.321-00',
      password: clientPassword,
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
      userId: user1.id,
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
