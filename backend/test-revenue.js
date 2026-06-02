const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const totalRevenue = await prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } });
    console.log("Revenue object:", totalRevenue);
    console.log("Total:", totalRevenue._sum.total);
    console.log("Resolved:", totalRevenue._sum.total || 0);
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
