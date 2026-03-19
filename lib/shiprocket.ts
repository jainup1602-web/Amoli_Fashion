import axios from 'axios';

const SHIPROCKET_API_URL = process.env.SHIPROCKET_API_URL || 'https://apiv2.shiprocket.in/v1/external';

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getShiprocketToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post(`${SHIPROCKET_API_URL}/auth/login`, {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });

    cachedToken = response.data.token;
    tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; // 9 days

    if (!cachedToken) {
      throw new Error('No token received from Shiprocket');
    }

    return cachedToken;
  } catch (error) {
    console.error('Shiprocket authentication failed:', error);
    throw new Error('Failed to authenticate with Shiprocket');
  }
}

export async function createShipment(orderData: any) {
  const token = await getShiprocketToken();

  try {
    const response = await axios.post(
      `${SHIPROCKET_API_URL}/orders/create/adhoc`,
      orderData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Shiprocket shipment creation failed:', error.response?.data || error);
    throw new Error('Failed to create shipment');
  }
}

export async function trackShipment(shipmentId: string) {
  const token = await getShiprocketToken();

  try {
    const response = await axios.get(
      `${SHIPROCKET_API_URL}/courier/track/shipment/${shipmentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Shiprocket tracking failed:', error);
    throw new Error('Failed to track shipment');
  }
}

export async function checkPincodeServiceability(
  pickupPincode: string,
  deliveryPincode: string,
  weight: number
) {
  const token = await getShiprocketToken();

  try {
    const response = await axios.get(
      `${SHIPROCKET_API_URL}/courier/serviceability`,
      {
        params: {
          pickup_postcode: pickupPincode,
          delivery_postcode: deliveryPincode,
          weight: weight,
          cod: 0,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Pincode serviceability check failed:', error);
    throw new Error('Failed to check pincode serviceability');
  }
}
