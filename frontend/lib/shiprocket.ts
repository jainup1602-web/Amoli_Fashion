import axios from 'axios';

const SHIPROCKET_API_URL = process.env.SHIPROCKET_API_URL || 'https://apiv2.shiprocket.in/v1/external';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Authenticate with Shiprocket and get a token
 */
async function getToken() {
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
      tokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000);
      return cachedToken;
    }
    throw new Error('Failed to get Shiprocket token');
  } catch (error: any) {
    console.error('Shiprocket Auth Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create a custom order in Shiprocket
 */
export async function createShiprocketOrder(orderData: any) {
  try {
    const token = await getToken();
    
    // Parse address if it's a string
    const address = typeof orderData.shippingAddress === 'string' 
      ? JSON.parse(orderData.shippingAddress) 
      : orderData.shippingAddress;

    const shiprocketOrder = {
      order_id: orderData.orderNumber,
      order_date: new Date(orderData.createdAt).toISOString().split('T')[0],
      pickup_location: "Primary",
      billing_customer_name: orderData.customerName.split(' ')[0],
      billing_last_name: orderData.customerName.split(' ').slice(1).join(' ') || "Jewellery",
      billing_address: address.addressLine1,
      billing_address_2: address.addressLine2 || "",
      billing_city: address.city,
      billing_pincode: address.pincode,
      billing_state: address.state,
      billing_country: "India",
      billing_email: orderData.customerEmail || address.email,
      billing_phone: orderData.customerPhone || address.phone,
      shipping_is_billing: true,
      order_items: orderData.orderitem.map((item: any) => ({
        name: item.name,
        sku: item.sku || `SKU-${item.productId.slice(-6)}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 7117
      })),
      payment_method: orderData.paymentMethod.toLowerCase() === 'razorpay' ? 'Prepaid' : 'COD',
      sub_total: orderData.subtotal,
      length: 10,
      width: 10,
      height: 5,
      weight: 0.5
    };

    const response = await axios.post(`${SHIPROCKET_API_URL}/orders/create/adhoc`, shiprocketOrder, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return response.data;
  } catch (error: any) {
    console.error('Shiprocket Create Order Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Check if a pincode is serviceable
 */
export async function checkPincodeServiceability(pickupPincode: string, deliveryPincode: string, weight: number = 0.5) {
  try {
    const token = await getToken();
    const response = await axios.get(`${SHIPROCKET_API_URL}/courier/serviceability/`, {
      params: {
        pickup_postcode: pickupPincode,
        delivery_postcode: deliveryPincode,
        weight,
        cod: 1 // We check for COD by default to be safe
      },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    console.error('Shiprocket Serviceability Error:', error.response?.data || error.message);
    throw error;
  }
}
