const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function testAdminAPIWithRealAuth() {
  console.log('🔐 TESTING ADMIN API WITH REAL AUTHENTICATION');
  console.log('==============================================\n');

  try {
    // Step 1: Get admin user from database
    console.log('1️⃣ Finding admin user in database...');
    
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (!adminUser) {
      console.log('❌ No admin user found in database');
      console.log('Please run the create-admin-user script first');
      return;
    }
    
    console.log('✅ Admin user found:', {
      email: adminUser.email,
      firebaseUid: adminUser.firebaseUid,
      role: adminUser.role
    });

    // Step 2: Create a mock JWT token for testing
    console.log('\n2️⃣ Creating mock JWT token...');
    
    const mockPayload = {
      user_id: adminUser.firebaseUid,
      sub: adminUser.firebaseUid,
      email: adminUser.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };
    
    // Create a simple mock JWT (header.payload.signature)
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify(mockPayload)).toString('base64');
    const mockToken = `${header}.${payload}.mock-signature`;
    
    console.log('✅ Mock token created for testing');

    // Step 3: Test GET request
    console.log('\n3️⃣ Testing GET /api/admin/banners...');
    
    try {
      const response = await fetch('http://localhost:3000/api/admin/banners', {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log(`Status: ${response.status}`);
      console.log('Response:', data);
      
      if (response.status === 200) {
        console.log('✅ GET request successful!');
      } else {
        console.log('❌ GET request failed');
      }
    } catch (error) {
      console.log('❌ GET request error:', error.message);
    }

    // Step 4: Test POST request
    console.log('\n4️⃣ Testing POST /api/admin/banners...');
    
    const testBannerData = {
      title: 'API Test Banner ' + Date.now(),
      subtitle: 'Test Subtitle',
      description: 'Test Description',
      image: 'https://example.com/test.jpg',
      link: '/test',
      buttonText: 'Test Button',
      order: 999,
      isActive: true
    };
    
    try {
      const response = await fetch('http://localhost:3000/api/admin/banners', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testBannerData)
      });
      
      const data = await response.json();
      console.log(`Status: ${response.status}`);
      console.log('Response:', data);
      
      if (response.status === 200 || response.status === 201) {
        console.log('✅ POST request successful!');
        
        // Clean up created banner
        if (data.banner && data.banner.id) {
          await prisma.banner.delete({ where: { id: data.banner.id } });
          console.log('✅ Test banner cleaned up');
        }
      } else {
        console.log('❌ POST request failed');
        if (response.status === 500) {
          console.log('🚨 500 ERROR - This is the issue we need to fix!');
        }
      }
    } catch (error) {
      console.log('❌ POST request error:', error.message);
    }

    console.log('\n📊 ANALYSIS:');
    console.log('============');
    console.log('If you see 401 errors: Authentication issue (expected with mock token)');
    console.log('If you see 500 errors: Server/database issue (this is the real problem)');
    console.log('If you see 200/201: API is working correctly');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAPIWithRealAuth();