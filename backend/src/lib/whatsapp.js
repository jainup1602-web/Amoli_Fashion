/**
 * WhatsApp Notification Service (Provider Agnostic)
 * Currently set up for Meta WhatsApp Cloud API format.
 */
const axios = require('axios');
const { logger } = require('./logger');

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER;

/**
 * Core WhatsApp sending function
 */
async function sendWhatsAppMessage(to, templateName, components = []) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_ID) {
    logger.info(`[WhatsApp Mock] To: ${to} | Template: ${templateName}`, components);
    return true; // Mock success if not configured
  }

  try {
    const url = `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_ID}/messages`;
    
    // Ensure phone number starts with country code (e.g., 91 for India)
    let formattedPhone = to.replace(/\D/g, '');
    if (formattedPhone.length === 10) formattedPhone = '91' + formattedPhone;

    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    logger.info(`WhatsApp sent to ${formattedPhone}`, { msgId: response.data.messages?.[0]?.id });
    return true;
  } catch (error) {
    logger.error('WhatsApp sending failed', error, { to, templateName });
    return false;
  }
}

/**
 * Send new order alert to Admin
 */
async function notifyAdminNewOrder(order) {
  if (!ADMIN_NUMBER) return false;

  // Assuming a template like: "New order {{1}} received for ₹{{2}}. City: {{3}}"
  const components = [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: order.orderNumber },
        { type: 'text', text: String(order.total) },
        { type: 'text', text: getCityFromAddress(order.shippingAddress) }
      ]
    }
  ];

  return sendWhatsAppMessage(ADMIN_NUMBER, 'admin_new_order_alert', components);
}

/**
 * Send status update to Customer
 */
async function notifyCustomerOrderStatus(order, status) {
  if (!order.customerPhone) return false;

  // Map internal status to template names
  const templates = {
    'confirmed': 'order_confirmed',
    'shipped': 'order_shipped',
    'out_for_delivery': 'order_out_for_delivery',
    'delivered': 'order_delivered'
  };

  const templateName = templates[status.toLowerCase()];
  if (!templateName) return false;

  const components = [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: order.customerName.split(' ')[0] }, // First name
        { type: 'text', text: order.orderNumber },
        ...(status.toLowerCase() === 'shipped' && order.trackingNumber ? [{ type: 'text', text: `Tracking: ${order.trackingNumber} (${order.shippingProvider || 'Courier'})` }] : [])
      ]
    }
  ];

  return sendWhatsAppMessage(order.customerPhone, templateName, components);
}

// Helper to extract city safely
function getCityFromAddress(addressJson) {
  try {
    const addr = typeof addressJson === 'string' ? JSON.parse(addressJson) : addressJson;
    return addr?.city || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

module.exports = {
  sendWhatsAppMessage,
  notifyAdminNewOrder,
  notifyCustomerOrderStatus
};
