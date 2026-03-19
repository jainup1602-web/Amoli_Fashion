const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function comprehensiveAdminTest() {
  console.log('🎯 COMPREHENSIVE ADMIN CRUD TEST - ALL MODELS');
  console.log('==============================================\n');

  let workingModels = 0;
  let totalModels = 0;
  const failedModels = [];

  // Complete list of ALL admin models with proper test data
  const adminModels = [
    {
      name: 'Banner',
      model: 'banner',
      createData: {
        title: 'Test Banner',
        subtitle: 'Test Subtitle',
        description: 'Test Description',
        image: 'https://example.com/test.jpg',
        link: '/test',
        buttonText: 'Test Button',
        isActive: true,
        order: 1
      },
      updateData: { title: 'Updated Test Banner' }
    },
    {
      name: 'Category',
      model: 'category',
      createData: {
        name: 'Test Category',
        slug: 'test-category-' + Date.now(),
        description: 'Test Description',
        image: 'https://example.com/test.jpg',
        isActive: true,
        order: 1
      },
      updateData: { description: 'Updated Test Description' }
    },
    {
      name: 'Product',
      model: 'product',
      createData: {
        name: 'Test Product',
        slug: 'test-product-' + Date.now(),
        description: 'Test Product Description',
        shortDescription: 'Short desc',
        images: JSON.stringify(['https://example.com/test.jpg']),
        categoryId: null, // Will be set dynamically
        originalPrice: 1000,
        specialPrice: 800,
        discountPercentage: 20,
        stock: 10,
        sku: 'TEST-' + Date.now(),
        isActive: true
      },
      updateData: { name: 'Updated Test Product' },
      requiresCategory: true
    },
    {
      name: 'CmsPage',
      model: 'cmspage',
      createData: {
        title: 'Test CMS Page',
        slug: 'test-cms-' + Date.now(),
        content: 'Test CMS Content',
        metaTitle: 'Test Meta Title',
        metaDescription: 'Test Meta Description',
        isActive: true
      },
      updateData: { title: 'Updated Test CMS Page' }
    },
    {
      name: 'Coupon',
      model: 'coupon',
      createData: {
        code: 'TEST' + Date.now(),
        description: 'Test Coupon',
        discountType: 'percentage',
        discountValue: 10,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      updateData: { description: 'Updated Test Coupon' }
    },
    {
      name: 'Enquiry',
      model: 'enquiry',
      createData: {
        name: 'Test User',
        email: 'test' + Date.now() + '@example.com',
        phone: '1234567890',
        subject: 'Test Subject',
        message: 'Test Message',
        status: 'pending'
      },
      updateData: { status: 'resolved' }
    },
    {
      name: 'ModelGallery',
      model: 'modelgallery',
      createData: {
        modelName: 'Test Model',
        image: 'https://example.com/test.jpg',
        description: 'Test Model Description',
        category: 'Test Category',
        isActive: true,
        order: 1
      },
      updateData: { modelName: 'Updated Test Model' }
    },
    {
      name: 'Newsletter',
      model: 'newsletter',
      createData: {
        email: 'test' + Date.now() + '@example.com',
        isActive: true
      },
      updateData: { isActive: false }
    },
    {
      name: 'Notification',
      model: 'notification',
      createData: {
        userId: null, // Will be set dynamically
        title: 'Test Notification',
        message: 'Test Message',
        type: 'info',
        link: '/test',
        isRead: false
      },
      updateData: { isRead: true },
      requiresUser: true
    },
    {
      name: 'Order',
      model: 'order',
      createData: {
        orderNumber: 'TEST-' + Date.now(),
        userId: null, // Will be set dynamically
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
      },
      updateData: { orderStatus: 'confirmed' },
      requiresUser: true
    },
    {
      name: 'Popup',
      model: 'popup',
      createData: {
        title: 'Test Popup',
        subtitle: 'Test Subtitle',
        description: 'Test Description',
        image: 'https://example.com/test.jpg',
        offerText: 'Test Offer',
        buttonText: 'Shop Now',
        buttonLink: '/products',
        isActive: true,
        showDelay: 2000
      },
      updateData: { title: 'Updated Test Popup' }
    },
    {
      name: 'Review',
      model: 'review',
      createData: {
        productId: null, // Will be set dynamically
        userId: null, // Will be set dynamically
        userName: 'Test User',
        rating: 5,
        comment: 'Test Review Comment',
        isVerified: false,
        isApproved: false
      },
      updateData: { isApproved: true },
      requiresProduct: true,
      requiresUser: true
    },
    {
      name: 'Settings',
      model: 'settings',
      createData: {
        key: 'test_setting_' + Date.now(),
        value: JSON.stringify('test_value')
      },
      updateData: { value: JSON.stringify('updated_test_value') }
    },
    {
      name: 'ShippingZone',
      model: 'shippingzone',
      createData: {
        name: 'Test Zone',
        pincodes: JSON.stringify(['123456', '789012']),
        charges: 50,
        freeAbove: 500,
        isActive: true
      },
      updateData: { charges: 75 }
    },
    {
      name: 'Showcase',
      model: 'showcase',
      createData: {
        title: 'Test Showcase',
        subtitle: 'Test Subtitle',
        image: 'https://example.com/test.jpg',
        link: '/test',
        isActive: true,
        order: 1
      },
      updateData: { title: 'Updated Test Showcase' }
    },
    {
      name: 'Subcategory',
      model: 'subcategory',
      createData: {
        name: 'Test Subcategory',
        slug: 'test-subcategory-' + Date.now(),
        description: 'Test Description',
        categoryId: null, // Will be set dynamically
        isActive: true,
        order: 1
      },
      updateData: { description: 'Updated Test Description' },
      requiresCategory: true
    },
    {
      name: 'User',
      model: 'user',
      createData: {
        firebaseUid: 'test-uid-' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        phoneNumber: '123456' + Date.now().toString().slice(-4),
        displayName: 'Test User',
        role: 'customer',
        isActive: true
      },
      updateData: { displayName: 'Updated Test User' }
    },
    {
      name: 'VideoReview',
      model: 'videoreview',
      createData: {
        customerName: 'Test Customer',
        customerLocation: 'Test Location',
        rating: 5,
        videoUrl: 'https://example.com/test.mp4',
        thumbnailUrl: 'https://example.com/test.jpg',
        isActive: true,
        order: 1
      },
      updateData: { customerName: 'Updated Test Customer' }
    },
    {
      name: 'Wishlist',
      model: 'wishlist',
      createData: {
        userId: null, // Will be set dynamically
        productId: null // Will be set dynamically
      },
      updateData: null, // Wishlist doesn't have updatable fields
      requiresUser: true,
      requiresProduct: true
    }
  ];

  // Helper function to get or create required dependencies
  let testCategory = null;
  let testUser = null;
  let testProduct = null;

  async function getTestCategory() {
    if (!testCategory) {
      testCategory = await prisma.category.create({
        data: {
          name: 'Test Category for Dependencies',
          slug: 'test-dep-category-' + Date.now(),
          description: 'Category for testing dependencies',
          isActive: true
        }
      });
    }
    return testCategory;
  }

  async function getTestUser() {
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          firebaseUid: 'test-dep-uid-' + Date.now(),
          email: 'testdep' + Date.now() + '@example.com',
          phoneNumber: '999' + Date.now().toString().slice(-7),
          displayName: 'Test User for Dependencies',
          role: 'customer',
          isActive: true
        }
      });
    }
    return testUser;
  }

  async function getTestProduct() {
    if (!testProduct) {
      const category = await getTestCategory();
      testProduct = await prisma.product.create({
        data: {
          name: 'Test Product for Dependencies',
          slug: 'test-dep-product-' + Date.now(),
          description: 'Product for testing dependencies',
          images: JSON.stringify(['https://example.com/test.jpg']),
          categoryId: category.id,
          originalPrice: 1000,
          stock: 10,
          isActive: true
        }
      });
    }
    return testProduct;
  }

  // Test each model
  for (const modelConfig of adminModels) {
    totalModels++;
    console.log(`🧪 Testing ${modelConfig.name} Model...`);

    try {
      // Prepare create data with dependencies
      const createData = { ...modelConfig.createData };
      
      if (modelConfig.requiresCategory) {
        const category = await getTestCategory();
        createData.categoryId = category.id;
      }
      
      if (modelConfig.requiresUser) {
        const user = await getTestUser();
        createData.userId = user.id;
      }
      
      if (modelConfig.requiresProduct) {
        const product = await getTestProduct();
        createData.productId = product.id;
      }

      // Test CREATE
      const createdRecord = await prisma[modelConfig.model].create({
        data: createData
      });
      console.log(`  ✅ CREATE: SUCCESS`);

      // Test UPDATE (if update data is provided)
      if (modelConfig.updateData) {
        await prisma[modelConfig.model].update({
          where: { id: createdRecord.id },
          data: modelConfig.updateData
        });
        console.log(`  ✅ UPDATE: SUCCESS`);
      } else {
        console.log(`  ⏭️  UPDATE: SKIPPED (no updatable fields)`);
      }

      // Test DELETE
      await prisma[modelConfig.model].delete({
        where: { id: createdRecord.id }
      });
      console.log(`  ✅ DELETE: SUCCESS`);

      console.log(`🎉 ${modelConfig.name}: FULLY WORKING\n`);
      workingModels++;

    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
      console.log(`🔍 ${modelConfig.name}: NEEDS FIXING\n`);
      failedModels.push({
        name: modelConfig.name,
        error: error.message
      });
    }
  }

  // Cleanup dependencies
  try {
    if (testProduct) await prisma.product.delete({ where: { id: testProduct.id } });
    if (testUser) await prisma.user.delete({ where: { id: testUser.id } });
    if (testCategory) await prisma.category.delete({ where: { id: testCategory.id } });
  } catch (error) {
    console.log('⚠️  Cleanup warning:', error.message);
  }

  // Final Summary
  console.log('🎊 COMPREHENSIVE TEST RESULTS');
  console.log('=============================');
  console.log(`✅ Working Models: ${workingModels}/${totalModels}`);
  console.log(`📊 Success Rate: ${Math.round((workingModels / totalModels) * 100)}%`);
  
  if (failedModels.length > 0) {
    console.log(`\n❌ Failed Models (${failedModels.length}):`);
    failedModels.forEach(model => {
      console.log(`  - ${model.name}: ${model.error}`);
    });
  }
  
  if (workingModels === totalModels) {
    console.log('\n🚀 ALL ADMIN MODELS ARE 100% FUNCTIONAL!');
    console.log('🎉 ADMIN PANEL READY FOR PRODUCTION!');
  } else {
    console.log(`\n⚠️  ${totalModels - workingModels} models need fixing for 100% success rate`);
  }

  await prisma.$disconnect();
}

comprehensiveAdminTest().catch(console.error);