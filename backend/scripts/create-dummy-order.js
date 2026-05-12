const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // First, we need a user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          displayName: 'Test User',
          role: 'customer'
        }
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: 'ORD' + Date.now(),
        userId: user.id,
        customerName: 'Test User',
        customerPhone: '1234567890',
        shippingAddress: '123 Test St',
        subtotal: 1000,
        total: 1000,
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        razorpayOrderId: 'order_test_123',
        orderStatus: 'pending'
      }
    });
    console.log('Created dummy order:', order);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
