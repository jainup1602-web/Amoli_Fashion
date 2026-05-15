const axios = require('axios');

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken = null;
let tokenExpiry = null;

/**
 * Authenticate with Shiprocket and get a token
 */
async function getToken() {
  // Check if token is still valid (token usually lasts 10 days)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post(`${SHIPROCKET_API_URL}/auth/login`, {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });

    if (response.data && response.data.token) {
      cachedToken = response.data.token;
      // Set expiry to 9 days from now to be safe
      tokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000);
      return cachedToken;
    }
    throw new Error('Failed to get Shiprocket token');
  } catch (error) {
    console.error('Shiprocket Auth Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create a custom order in Shiprocket
 */
async function createOrder(orderData) {
  try {
    const token = await getToken();
    
    // Transform our order data to Shiprocket format
    const shiprocketOrder = {
      order_id: orderData.orderNumber,
      order_date: new Date(orderData.createdAt).toISOString().split('T')[0],
      pickup_location: "Primary", // This should match a location name in Shiprocket settings
      billing_customer_name: orderData.customerName.split(' ')[0],
      billing_last_name: orderData.customerName.split(' ').slice(1).join(' ') || "Jewellery",
      billing_address: orderData.shippingAddress.address,
      billing_city: orderData.shippingAddress.city,
      billing_pincode: orderData.shippingAddress.pincode,
      billing_state: orderData.shippingAddress.state,
      billing_country: "India",
      billing_email: orderData.customerEmail,
      billing_phone: orderData.customerPhone,
      shipping_is_billing: true,
      order_items: orderData.orderitem.map(item => ({
        name: item.name,
        sku: item.sku || `SKU-${item.productId.slice(-6)}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 7117 // Fashion Jewellery HSN code
      })),
      payment_method: orderData.paymentMethod === 'razorpay' ? 'Prepaid' : 'COD',
      sub_total: orderData.subtotal,
      length: 10, // Default dimensions in cm
      width: 10,
      height: 5,
      weight: 0.5 // Default weight in kg
    };

    const response = await axios.post(`${SHIPROCKET_API_URL}/orders/create/adhoc`, shiprocketOrder, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Shiprocket Create Order Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get tracking status for a shipment
 */
async function getTrackingStatus(shipmentId) {
  try {
    const token = await getToken();
    const response = await axios.get(`${SHIPROCKET_API_URL}/courier/track/shipment/${shipmentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Shiprocket Tracking Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Generate invoice for an order
 */
async function generateInvoice(orderIds) {
  try {
    const token = await getToken();
    const response = await axios.post(`${SHIPROCKET_API_URL}/orders/print/invoice`, {
      ids: Array.isArray(orderIds) ? orderIds : [orderIds]
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Shiprocket Invoice Error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  createOrder,
  getTrackingStatus,
  generateInvoice
};
