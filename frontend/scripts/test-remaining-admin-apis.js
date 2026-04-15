const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRemainingAdminAPIs() {
  console.log('🧪 Testing Remaining Admin API Models...\n');

  // Test 1: Coupon CRUD
  console.log('1️⃣ Testing Coupon Model...');
  try {
    // Test CREATE
    const testCoupon = await prisma.coupon.create({
      data: {
        code: 'TEST10',
        description: 'Test coupon',
        discountType: 'percentage',
        discountValue: 10,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true
      }
    });
    console.log('✅ Coupon CREATE: SUCCESS');

    // Test UPDATE
    const updatedCoupon = await prisma.coupon.update({
      where: { id: testCoupon.id },
      data: { description: 'Updated test coupon' }
    });
    console.log('✅ Coupon UPDATE: SUCCESS');

    // Test DELETE
    await prisma.coupon.delete({
      where: { id: testCoupon.id }
    });
    console.log('✅ Coupon DELETE: SUCCESS');
    console.log('🎉 Coupon Model: FULLY WORKING\n');

  } catch (error) {
    console.log('❌ Coupon Model Error:', error.message);
    console.log('🔍 Coupon Model: NEEDS FIXING\n');
  }

  // Test 2: Popup CRUD
  console.log('2️⃣ Testing Popup Model...');
  try {
    // Test CREATE
    const testPopup = await prisma.popup.create({
      data: {
        title: 'Test Popup',
        subtitle: 'Test subtitle',
        description: 'Test description',
        isActive: true,
        showDelay: 2000
      }
    });
    console.log('✅ Popup CREATE: SUCCESS');

    // Test UPDATE
    const updatedPopup = await prisma.popup.update({
      where: { id: testPopup.id },
      data: { title: 'Updated Test Popup' }
    });
    console.log('✅ Popup UPDATE: SUCCESS');

    // Test DELETE
    await prisma.popup.delete({
      where: { id: testPopup.id }
    });
    console.log('✅ Popup DELETE: SUCCESS');
    console.log('🎉 Popup Model: FULLY WORKING\n');

  } catch (error) {
    console.log('❌ Popup Model Error:', error.message);
    console.log('🔍 Popup Model: NEEDS FIXING\n');
  }

  // Test 3: Settings CRUD
  console.log('3️⃣ Testing Settings Model...');
  try {
    // Test CREATE
    const testSetting = await prisma.settings.create({
      data: {
        key: 'test_setting',
        value: 'test_value'
      }
    });
    console.log('✅ Settings CREATE: SUCCESS');

    // Test UPDATE
    const updatedSetting = await prisma.settings.update({
      where: { id: testSetting.id },
      data: { value: 'updated_test_value' }
    });
    console.log('✅ Settings UPDATE: SUCCESS');

    // Test DELETE
    await prisma.settings.delete({
      where: { id: testSetting.id }
    });
    console.log('✅ Settings DELETE: SUCCESS');
    console.log('🎉 Settings Model: FULLY WORKING\n');

  } catch (error) {
    console.log('❌ Settings Model Error:', error.message);
    console.log('🔍 Settings Model: NEEDS FIXING\n');
  }

  // Summary
  console.log('📊 FINAL SUMMARY:');
  console.log('=================');
  console.log('✅ Previously Working: 10/13 models (Banner, Category, Product, etc.)');
  console.log('🧪 Just Tested: 3/3 remaining models');
  console.log('🎯 Expected Result: 13/13 models working (100% success rate)');

  await prisma.$disconnect();
}

testRemainingAdminAPIs().catch(console.error);