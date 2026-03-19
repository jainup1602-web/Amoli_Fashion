const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdminUserAndTest() {
  console.log('👤 CREATING ADMIN USER AND TESTING API');
  console.log('=====================================\n');

  try {
    // Step 1: Create or update admin user
    console.log('1️⃣ Creating/updating admin user...');
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@amolijewelry.com' },
      update: {
        role: 'admin',
        isActive: true,
        displayName: 'Admin User'
      },
      create: {
        firebaseUid: 'admin-test-uid-' + Date.now(),
        email: 'admin@amolijewelry.com',
        phoneNumber: '9999999999',
        displayName: 'Admin User',
        role: 'admin',
        isActive: true
      }
    });
    
    console.log('✅ Admin user created/updated:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      firebaseUid: adminUser.firebaseUid
    });

    // Step 2: Test banner creation directly in database
    console.log('\n2️⃣ Testing banner creation in database...');
    
    const testBanner = await prisma.banner.create({
      data: {
        title: 'Direct DB Test Banner',
        subtitle: 'Test Subtitle',
        description: 'Test Description',
        image: 'https://example.com/test.jpg',
        link: '/test',
        buttonText: 'Test Button',
        order: 999,
        isActive: true
      }
    });
    
    console.log('✅ Banner created in database:', {
      id: testBanner.id,
      title: testBanner.title,
      order: testBanner.order
    });

    // Step 3: Test banner update
    console.log('\n3️⃣ Testing banner update in database...');
    
    const updatedBanner = await prisma.banner.update({
      where: { id: testBanner.id },
      data: { title: 'Updated Direct DB Test Banner' }
    });
    
    console.log('✅ Banner updated in database:', {
      id: updatedBanner.id,
      title: updatedBanner.title
    });

    // Step 4: Clean up test banner
    await prisma.banner.delete({ where: { id: testBanner.id } });
    console.log('✅ Test banner cleaned up');

    // Step 5: Show current banners
    console.log('\n4️⃣ Current banners in database:');
    const allBanners = await prisma.banner.findMany({
      orderBy: { order: 'asc' }
    });
    
    console.log(`Found ${allBanners.length} banners:`);
    allBanners.forEach(banner => {
      console.log(`  - ${banner.title} (Order: ${banner.order}, Active: ${banner.isActive})`);
    });

    console.log('\n📋 ADMIN LOGIN INSTRUCTIONS:');
    console.log('============================');
    console.log('1. Go to: http://localhost:3000/make-admin');
    console.log('2. Login with email: admin@amolijewelry.com');
    console.log('3. Complete Firebase authentication');
    console.log('4. Then go to: http://localhost:3000/admin/banners');
    console.log('5. You should be able to create/edit banners');

    console.log('\n🔧 IF STILL GETTING 500 ERRORS:');
    console.log('===============================');
    console.log('1. Check browser console for detailed error messages');
    console.log('2. Check server terminal for backend error logs');
    console.log('3. Ensure Firebase is properly configured in .env');
    console.log('4. Make sure you are logged in as admin user');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🚨 TROUBLESHOOTING:');
    console.log('==================');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check database connection in .env');
    console.log('3. Run: npx prisma db push');
    console.log('4. Restart the development server');
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUserAndTest();