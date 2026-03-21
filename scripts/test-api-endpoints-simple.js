#!/usr/bin/env node

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testWithAuth() {
  console.log('🔐 Testing API endpoints with authentication...\n');

  // First, let's test without auth to see the error
  console.log('1️⃣ Testing without authentication:');
  try {
    const response = await fetch(`${BASE_URL}/api/cart`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n2️⃣ Testing with fake Bearer token:');
  try {
    const response = await fetch(`${BASE_URL}/api/cart`, {
      headers: {
        'Authorization': 'Bearer fake-token-123'
      }
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n3️⃣ Testing auth profile endpoint:');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': 'Bearer fake-token-123'
      }
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n4️⃣ Testing products endpoint (should work without auth):');
  try {
    const response = await fetch(`${BASE_URL}/api/products`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Products found:', data.products ? data.products.length : 0);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testWithAuth();