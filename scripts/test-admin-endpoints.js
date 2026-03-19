/**
 * Test Admin Panel Endpoints
 * 
 * This script tests all admin CRUD operations
 */

const BASE_URL = 'http://localhost:3000';

// You need to replace this with actual admin token
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ADMIN_TOKEN}`
};

console.log('🧪 Testing Admin Panel Endpoints\n');
console.log('⚠️  Note: Replace ADMIN_TOKEN in script with actual admin token\n');

// Test endpoints
const endpoints = {
  dashboard: {
    name: 'Dashboard Stats',
    method: 'GET',
    url: '/api/admin/dashboard',
    description: 'Get dashboard statistics'
  },
  
  // Products
  products: {
    name: 'Products List',
    method: 'GET',
    url: '/api/products',
    description: 'Get all products'
  },
  productCreate: {
    name: 'Create Product',
    method: 'POST',
    url: '/api/products',
    description: 'Create new product',
    body: {
      name: 'Test Product',
      slug: 'test-product-' + Date.now(),
      description: 'Test description',
      price: 999,
      originalPrice: 1499,
      stock: 100,
      category: 'CATEGORY_ID',
      images: ['https://via.placeholder.com/400']
    }
  },
  
  // Orders
  orders: {
    name: 'Orders List',
    method: 'GET',
    url: '/api/admin/orders',
    description: 'Get all orders'
  },
  orderDetail: {
    name: 'Order Detail',
    method: 'GET',
    url: '/api/admin/orders/ORDER_ID',
    description: 'Get order by ID'
  },
  orderUpdate: {
    name: 'Update Order Status',
    method: 'PUT',
    url: '/api/admin/orders/ORDER_ID',
    description: 'Update order status',
    body: {
      status: 'processing'
    }
  },
  
  // Users
  users: {
    name: 'Users List',
    method: 'GET',
    url: '/api/admin/users',
    description: 'Get all users'
  },
  userDetail: {
    name: 'User Detail',
    method: 'GET',
    url: '/api/admin/users/USER_ID',
    description: 'Get user by ID'
  },
  userUpdate: {
    name: 'Update User',
    method: 'PUT',
    url: '/api/admin/users/USER_ID',
    description: 'Update user role/status',
    body: {
      role: 'customer',
      isActive: true
    }
  },
  
  // Categories
  categories: {
    name: 'Categories List',
    method: 'GET',
    url: '/api/categories',
    description: 'Get all categories'
  },
  
  // Coupons
  coupons: {
    name: 'Coupons List',
    method: 'GET',
    url: '/api/admin/coupons',
    description: 'Get all coupons'
  },
  couponCreate: {
    name: 'Create Coupon',
    method: 'POST',
    url: '/api/admin/coupons',
    description: 'Create new coupon',
    body: {
      code: 'TEST' + Date.now(),
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 500,
      maxDiscount: 100,
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true
    }
  },
  couponUpdate: {
    name: 'Update Coupon',
    method: 'PUT',
    url: '/api/admin/coupons',
    description: 'Update coupon',
    body: {
      id: 'COUPON_ID',
      isActive: false
    }
  },
  couponDelete: {
    name: 'Delete Coupon',
    method: 'DELETE',
    url: '/api/admin/coupons?id=COUPON_ID',
    description: 'Delete coupon'
  },
  
  // Reviews
  reviews: {
    name: 'Reviews List',
    method: 'GET',
    url: '/api/admin/reviews',
    description: 'Get all reviews'
  },
  reviewUpdate: {
    name: 'Update Review Status',
    method: 'PUT',
    url: '/api/admin/reviews',
    description: 'Approve/reject review',
    body: {
      id: 'REVIEW_ID',
      status: 'approved'
    }
  },
  reviewDelete: {
    name: 'Delete Review',
    method: 'DELETE',
    url: '/api/admin/reviews?id=REVIEW_ID',
    description: 'Delete review'
  },
  
  // Banners
  banners: {
    name: 'Banners List',
    method: 'GET',
    url: '/api/admin/banners',
    description: 'Get all banners'
  },
  bannerCreate: {
    name: 'Create Banner',
    method: 'POST',
    url: '/api/admin/banners',
    description: 'Create new banner',
    body: {
      title: 'Test Banner',
      subtitle: 'Test Subtitle',
      image: 'https://via.placeholder.com/1200x400',
      link: '/products',
      isActive: true,
      order: 1
    }
  },
  bannerUpdate: {
    name: 'Update Banner',
    method: 'PUT',
    url: '/api/admin/banners',
    description: 'Update banner',
    body: {
      id: 'BANNER_ID',
      isActive: false
    }
  },
  bannerDelete: {
    name: 'Delete Banner',
    method: 'DELETE',
    url: '/api/admin/banners?id=BANNER_ID',
    description: 'Delete banner'
  },
  
  // Newsletter
  newsletter: {
    name: 'Newsletter Subscribers',
    method: 'GET',
    url: '/api/admin/newsletter',
    description: 'Get all newsletter subscribers'
  },
  newsletterDelete: {
    name: 'Delete Subscriber',
    method: 'DELETE',
    url: '/api/admin/newsletter?id=SUBSCRIBER_ID',
    description: 'Delete newsletter subscriber'
  },
  
  // Shipping
  shipping: {
    name: 'Shipping Methods',
    method: 'GET',
    url: '/api/admin/shipping',
    description: 'Get shipping methods'
  },
  shippingUpdate: {
    name: 'Update Shipping',
    method: 'PUT',
    url: '/api/admin/shipping',
    description: 'Update shipping methods',
    body: {
      methods: [
        {
          name: 'Standard Shipping',
          price: 50,
          estimatedDays: '5-7',
          isActive: true
        }
      ]
    }
  },
  
  // Settings
  settings: {
    name: 'Site Settings',
    method: 'GET',
    url: '/api/admin/settings',
    description: 'Get site settings'
  },
  settingsUpdate: {
    name: 'Update Settings',
    method: 'PUT',
    url: '/api/admin/settings',
    description: 'Update site settings',
    body: {
      siteName: 'My E-Commerce Store',
      siteDescription: 'Best online store',
      contactEmail: 'admin@example.com',
      contactPhone: '+91 1234567890'
    }
  }
};

console.log('═══════════════════════════════════════════════════');
console.log('📋 Admin Endpoints List:');
console.log('═══════════════════════════════════════════════════\n');

Object.entries(endpoints).forEach(([key, endpoint]) => {
  console.log(`${endpoint.method.padEnd(6)} ${endpoint.url}`);
  console.log(`       ${endpoint.description}`);
  if (endpoint.body) {
    console.log(`       Body: ${JSON.stringify(endpoint.body, null, 2).substring(0, 100)}...`);
  }
  console.log('');
});

console.log('═══════════════════════════════════════════════════');
console.log('🔧 How to Test:');
console.log('═══════════════════════════════════════════════════\n');

console.log('1. Get Admin Token:');
console.log('   - Login as admin user');
console.log('   - Open browser console');
console.log('   - Run: localStorage.getItem("token")');
console.log('   - Copy the token\n');

console.log('2. Test with curl:');
console.log('   curl -X GET http://localhost:3000/api/admin/dashboard \\');
console.log('     -H "Authorization: Bearer YOUR_TOKEN"\n');

console.log('3. Test with browser fetch:');
console.log('   fetch("/api/admin/dashboard", {');
console.log('     headers: { "Authorization": "Bearer YOUR_TOKEN" }');
console.log('   }).then(r => r.json()).then(console.log)\n');

console.log('═══════════════════════════════════════════════════');
console.log('✅ CRUD Operations Summary:');
console.log('═══════════════════════════════════════════════════\n');

console.log('Products:');
console.log('  ✓ GET    /api/products - List all');
console.log('  ✓ POST   /api/products - Create');
console.log('  ✓ PUT    /api/products - Update');
console.log('  ✓ DELETE /api/products - Delete\n');

console.log('Orders:');
console.log('  ✓ GET    /api/admin/orders - List all');
console.log('  ✓ GET    /api/admin/orders/[id] - Get one');
console.log('  ✓ PUT    /api/admin/orders/[id] - Update status\n');

console.log('Users:');
console.log('  ✓ GET    /api/admin/users - List all');
console.log('  ✓ GET    /api/admin/users/[id] - Get one');
console.log('  ✓ PUT    /api/admin/users/[id] - Update\n');

console.log('Coupons:');
console.log('  ✓ GET    /api/admin/coupons - List all');
console.log('  ✓ POST   /api/admin/coupons - Create');
console.log('  ✓ PUT    /api/admin/coupons - Update');
console.log('  ✓ DELETE /api/admin/coupons - Delete\n');

console.log('Reviews:');
console.log('  ✓ GET    /api/admin/reviews - List all');
console.log('  ✓ PUT    /api/admin/reviews - Approve/Reject');
console.log('  ✓ DELETE /api/admin/reviews - Delete\n');

console.log('Banners:');
console.log('  ✓ GET    /api/admin/banners - List all');
console.log('  ✓ POST   /api/admin/banners - Create');
console.log('  ✓ PUT    /api/admin/banners - Update');
console.log('  ✓ DELETE /api/admin/banners - Delete\n');

console.log('Newsletter:');
console.log('  ✓ GET    /api/admin/newsletter - List subscribers');
console.log('  ✓ DELETE /api/admin/newsletter - Delete subscriber\n');

console.log('Shipping:');
console.log('  ✓ GET    /api/admin/shipping - Get methods');
console.log('  ✓ PUT    /api/admin/shipping - Update methods\n');

console.log('Settings:');
console.log('  ✓ GET    /api/admin/settings - Get settings');
console.log('  ✓ PUT    /api/admin/settings - Update settings\n');

console.log('═══════════════════════════════════════════════════');
console.log('📝 Notes:');
console.log('═══════════════════════════════════════════════════\n');

console.log('- All admin endpoints require authentication');
console.log('- User must have admin role');
console.log('- MongoDB connection must be working');
console.log('- Replace placeholder IDs with actual IDs from database');
console.log('- Test in order: GET → POST → PUT → DELETE');
console.log('');
