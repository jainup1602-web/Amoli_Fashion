const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');

/**
 * Shiprocket Webhook - Handles tracking updates
 * Configure this URL in Shiprocket Panel: Settings -> API -> Webhooks
 */
router.post('/', async (req, res) => {
  try {
    const { 
      current_status, 
      order_id, 
      shipment_id, 
      awb, 
      courier_name,
      etd
    } = req.body;

    console.log(`📦 Shiprocket Webhook: Order ${order_id} is now ${current_status}`);

    // Map Shiprocket status to our OrderStatus
    let orderStatus = 'confirmed';
    if (current_status.toLowerCase().includes('shipped')) orderStatus = 'shipped';
    if (current_status.toLowerCase().includes('delivered')) orderStatus = 'delivered';
    if (current_status.toLowerCase().includes('canceled')) orderStatus = 'cancelled';
    if (current_status.toLowerCase().includes('returned')) orderStatus = 'returned';

    // Update order in database
    await prisma.order.update({
      where: { orderNumber: order_id.toString() },
      data: {
        orderStatus,
        trackingNumber: awb,
        shippingProvider: courier_name,
        // You could also save etd or other notes here
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Shiprocket Webhook Error:', err.message);
    // Shiprocket expects a 200 even on error to stop retrying, but we'll send 500 for logging
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
