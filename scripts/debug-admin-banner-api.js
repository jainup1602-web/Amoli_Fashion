const fetch = require('node-fetch');

async function debugAdminBannerAPI() {
  console.log('🔍 DEBUGGING ADMIN BANNER API - REAL REQUEST');
  console.log('===========================================\n');

  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Check if server is running
  console.log('1️⃣ Testing server connectivity...');
  try {
    const response = await fetch(`${baseUrl}/api/banners`);
    console.log(`✅ Server is running - Status: ${response.status}`);
  } catch (error) {
    console.log(`❌ Server not running: ${error.message}`);
    console.log('Please start the server with: npm run dev');
    return;
  }

  // Test 2: Test admin banner API without auth
  console.log('\n2️⃣ Testing admin banner API without auth...');
  try {
    const response = await fetch(`${baseUrl}/api/admin/banners`);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // Test 3: Test admin banner API with mock auth
  console.log('\n3️⃣ Testing admin banner API with mock auth...');
  try {
    const response = await fetch(`${baseUrl}/api/admin/banners`, {
      headers: {
        'Authorization': 'Bearer mock-token',
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // Test 4: Test POST request (create banner)
  console.log('\n4️⃣ Testing POST request (create banner)...');
  try {
    const testBannerData = {
      title: 'Debug Test Banner',
      image: 'https://example.com/test.jpg',
      link: '/test',
      order: 1,
      isActive: true
    };

    const response = await fetch(`${baseUrl}/api/admin/banners`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer mock-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testBannerData)
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);
    
    if (response.status === 500) {
      console.log('\n🚨 500 ERROR DETECTED - This is the issue!');
      console.log('Error details:', data.message);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  // Test 5: Check database connection
  console.log('\n5️⃣ Testing database connection...');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const bannerCount = await prisma.banner.count();
    console.log(`✅ Database connected - Banner count: ${bannerCount}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.log(`❌ Database error: ${error.message}`);
    console.log('Please check if MySQL is running and database is accessible');
  }

  console.log('\n📊 DEBUG SUMMARY:');
  console.log('================');
  console.log('If you see 500 errors above, the issue is likely:');
  console.log('1. Database connection problem');
  console.log('2. Authentication/authorization issue');
  console.log('3. Missing environment variables');
  console.log('4. Prisma schema mismatch');
}

debugAdminBannerAPI().catch(console.error);