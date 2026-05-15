const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function testCODShiprocket() {
  console.log('Testing Shiprocket COD Order Push...');
  
  const dummyOrder = {
    orderNumber: 'TEST-COD-' + Date.now(),
    createdAt: new Date(),
    customerName: 'Yogesh Jain',
    customerEmail: 'jainyogi1984@gmail.com',
    customerPhone: '9876543210',
    subtotal: 999,
    paymentMethod: 'cod',
    shippingAddress: {
      addressLine1: 'Plot No 45, Vaishali Nagar, Jaipur Rajasthan',
      city: 'Jaipur',
      pincode: '302021',
      state: 'Rajasthan',
      phone: '9876543210'
    },
    orderitem: [
      {
        name: 'Amoli Designer Necklace',
        productId: 'prod_123456',
        quantity: 1,
        price: 999
      }
    ]
  };

  try {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;
    const apiUrl = 'https://apiv2.shiprocket.in/v1/external';

    console.log('Authenticating...');
    const authRes = await axios.post(`${apiUrl}/auth/login`, { email, password });
    const token = authRes.data.token;
    console.log('✅ Authenticated.');

    const shiprocketOrder = {
      order_id: dummyOrder.orderNumber,
      order_date: new Date(dummyOrder.createdAt).toISOString().split('T')[0],
      pickup_location: "Primary", // Ensure this name exists in Shiprocket Settings -> Pickup Locations
      billing_customer_name: "Yogesh",
      billing_last_name: "Jain",
      billing_address: dummyOrder.shippingAddress.addressLine1,
      billing_city: dummyOrder.shippingAddress.city,
      billing_pincode: dummyOrder.shippingAddress.pincode,
      billing_state: dummyOrder.shippingAddress.state,
      billing_country: "India",
      billing_email: dummyOrder.customerEmail,
      billing_phone: dummyOrder.customerPhone,
      shipping_is_billing: true,
      order_items: dummyOrder.orderitem.map(item => ({
        name: item.name,
        sku: `SKU-${item.productId.slice(-6)}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 7117
      })),
      payment_method: 'COD',
      sub_total: dummyOrder.subtotal,
      length: 10,
      width: 10,
      height: 5,
      weight: 0.5
    };

    console.log('Pushing COD Order to Shiprocket...');
    const orderRes = await axios.post(`${apiUrl}/orders/create/adhoc`, shiprocketOrder, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Success! Order created in Shiprocket.');
    console.log('Shiprocket Order ID:', orderRes.data.order_id);
    console.log('Shipment ID:', orderRes.data.shipment_id);

  } catch (error) {
    console.log('❌ Test Failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
      if (error.response.data.message === "Please add billing/shipping address first") {
        console.log('\n💡 Hint: This error often means the "pickup_location" (currently "Primary") is not defined in your Shiprocket account.');
      }
    } else {
      console.log('Error:', error.message);
    }
  }
}

testCODShiprocket();
