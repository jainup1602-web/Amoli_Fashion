const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testOrderWithJSON() {
  console.log('🧪 Testing Order Model with JSON Address Fields...\n');

  try {
    // First create a test user
    const testUser = await prisma.user.create({
      data: {
        firebaseUid: 'test-order-uid-' + Date.now(),
        email: 'testorder' + Date.now() + '@example.com',
        phoneNumber: '888' + Date.now().toString().slice(-7),
        displayName: 'Test Order User',
        role: 'customer',
        isActive: true
      }
    });
    console.log('✅ Test user created');

    // Test CREATE with JSON address fields
    console.log('1️⃣ Testing CREATE with JSON addresses...');
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: 'TEST-ORDER-' + Date.now(),
        userId: testUser.id,
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '1234567890',
        shippingAddress: JSON.stringify({
          name: 'Test Customer',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          phone: '1234567890'
        }),
        billingAddress: JSON.stringify({
          name: 'Test Customer',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          phone: '1234567890'
        }),
        subtotal: 1000,
        total: 1000,
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        orderStatus: 'pending'
      }
    });
    console.log('✅ Order CREATE with JSON addresses: SUCCESS');

    // Test UPDATE
    console.log('2️⃣ Testing UPDATE...');
    const updatedOrder = await prisma.order.update({
      where: { id: testOrder.id },
      data: { 
        orderStatus: 'confirmed',
        shippingAddress: JSON.stringify({
          name: 'Updated Test Customer',
          address: '456 Updated Street',
          city: 'Updated City',
          state: 'Updated State',
          pincode: '654321',
          phone: '0987654321'
        })
      }
    });
    console.log('✅ Order UPDATE with JSON addresses: SUCCESS');

    // Test DELETE
    console.log('3️⃣ Testing DELETE...');
    await prisma.order.delete({ where: { id: testOrder.id } });
    console.log('✅ Order DELETE: SUCCESS');

    // Cleanup test user
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Test user cleanup: SUCCESS');

    console.log('\n🎉 Order Model: FULLY WORKING WITH JSON ADDRESSES!');
    console.log('💡 Solution: shippingAddress and billingAddress must be valid JSON strings');

  } catch (error) {
    console.log('❌ Order Model Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderWithJSON();