const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugBrowserAuthIssue() {
  console.log('🔍 DEBUGGING BROWSER AUTHENTICATION ISSUE');
  console.log('=========================================\n');

  try {
    // Step 1: Check if admin user exists
    console.log('1️⃣ Checking admin users in database...');
    
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' }
    });
    
    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(user => {
      console.log(`  - Email: ${user.email}`);
      console.log(`    Firebase UID: ${user.firebaseUid}`);
      console.log(`    Role: ${user.role}`);
      console.log(`    Active: ${user.isActive}`);
      console.log('');
    });

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found! Creating one...');
      
      const newAdmin = await prisma.user.create({
        data: {
          firebaseUid: 'debug-admin-' + Date.now(),
          email: 'admin@test.com',
          phoneNumber: '1234567890',
          displayName: 'Debug Admin',
          role: 'admin',
          isActive: true
        }
      });
      
      console.log('✅ Created admin user:', newAdmin.email);
    }

    // Step 2: Test banner operations directly
    console.log('2️⃣ Testing banner operations directly...');
    
    const bannerCount = await prisma.banner.count();
    console.log(`Current banners in database: ${bannerCount}`);

    // Test create
    const testBanner = await prisma.banner.create({
      data: {
        title: 'Debug Test Banner',
        subtitle: 'Test Subtitle',
        description: 'Test Description',
        image: 'https://example.com/test.jpg',
        link: '/test',
        buttonText: 'Test Button',
        order: 999,
        isActive: true
      }
    });
    console.log('✅ Banner created successfully:', testBanner.id);

    // Test update
    const updatedBanner = await prisma.banner.update({
      where: { id: testBanner.id },
      data: { title: 'Updated Debug Test Banner' }
    });
    console.log('✅ Banner updated successfully');

    // Clean up
    await prisma.banner.delete({ where: { id: testBanner.id } });
    console.log('✅ Test banner cleaned up');

    // Step 3: Check Firebase configuration
    console.log('\n3️⃣ Checking Firebase configuration...');
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    console.log('Firebase Client Config:');
    Object.keys(firebaseConfig).forEach(key => {
      const value = firebaseConfig[key];
      console.log(`  ${key}: ${value ? '✅ Set' : '❌ Missing'}`);
    });

    const firebaseAdminConfig = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY
    };

    console.log('\nFirebase Admin Config:');
    Object.keys(firebaseAdminConfig).forEach(key => {
      const value = firebaseAdminConfig[key];
      console.log(`  ${key}: ${value ? '✅ Set' : '❌ Missing'}`);
    });

    // Step 4: Instructions for browser testing
    console.log('\n📋 BROWSER TESTING INSTRUCTIONS:');
    console.log('================================');
    console.log('1. Open browser and go to: http://localhost:3000/make-admin');
    console.log('2. Open browser DevTools (F12)');
    console.log('3. Go to Console tab');
    console.log('4. Try to login with any of these admin emails:');
    adminUsers.forEach(user => {
      console.log(`   - ${user.email}`);
    });
    console.log('5. Check for any Firebase authentication errors in console');
    console.log('6. After successful login, go to: http://localhost:3000/admin/banners');
    console.log('7. Try to create a new banner');
    console.log('8. If you get 500 error, check Network tab in DevTools');

    console.log('\n🔧 COMMON ISSUES & SOLUTIONS:');
    console.log('=============================');
    console.log('❌ "Invalid token format" → User not logged in properly');
    console.log('❌ "Unauthorized" → User exists but not admin role');
    console.log('❌ "User not found" → Firebase UID doesn\'t match database');
    console.log('❌ "Database connection failed" → MySQL not running');
    console.log('❌ "Firebase Admin not configured" → Missing admin credentials');

    console.log('\n✅ QUICK FIX STEPS:');
    console.log('==================');
    console.log('1. Make sure MySQL/XAMPP is running');
    console.log('2. Restart your Next.js development server');
    console.log('3. Clear browser cache and cookies');
    console.log('4. Try logging in again');
    console.log('5. Check browser console for detailed error messages');

  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.log('\n🚨 CRITICAL ISSUE DETECTED:');
    console.log('===========================');
    console.log('The database operations are failing!');
    console.log('Please check:');
    console.log('1. MySQL/XAMPP is running');
    console.log('2. Database connection string in .env');
    console.log('3. Prisma schema is up to date');
    console.log('4. Run: npx prisma db push');
  } finally {
    await prisma.$disconnect();
  }
}

debugBrowserAuthIssue();