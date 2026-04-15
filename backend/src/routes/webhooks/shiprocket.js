const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');

router.post('/', async (req, res) => {
  try {
    const { order_id, status, tracking_number } = req.body;
    if (order_id) {
      await prisma.order.updateMany({
        where: { razorpayOrderId: order_id },
        data: { orderStatus: status, trackingNumber: tracking_number },
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
