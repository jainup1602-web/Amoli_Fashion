const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const [totalOrders, totalRevenue, totalProducts, totalUsers, recentOrders, lowStockProducts] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.order.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        include: { orderitem: true, user: { select: { displayName: true, email: true } } }
      }),
      prisma.product.findMany({
        where: { isActive: true, stock: { lte: 10 } },
        select: { id: true, name: true, sku: true, stock: true },
        take: 10, orderBy: { stock: 'asc' }
      }),
    ]);
    console.log("Success");
  } catch (e) {
    console.error("Dashboard error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
