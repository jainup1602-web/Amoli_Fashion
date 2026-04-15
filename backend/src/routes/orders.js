const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// GET user orders
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { orderitem: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single order
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { orderitem: true },
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create order (Razorpay)
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    const razorpayOrder = await razorpay.orders.create({ amount: Math.round(amount * 100), currency, receipt });
    res.json({ success: true, order: razorpayOrder });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST verify payment
router.post('/verify', verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');
    if (expected !== razorpay_signature) return res.status(400).json({ success: false, message: 'Invalid signature' });

    const orderNumber = 'ORD-' + Date.now();
    const order = await prisma.order.create({
      data: {
        orderNumber, userId: req.user.id,
        customerName: orderData.customerName, customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        shippingAddress: JSON.stringify(orderData.shippingAddress),
        subtotal: orderData.subtotal, discount: orderData.discount || 0,
        shippingCharges: orderData.shippingCharges || 0, total: orderData.total,
        couponCode: orderData.couponCode, paymentMethod: 'razorpay',
        paymentStatus: 'paid', razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id, orderStatus: 'confirmed',
        orderitem: {
          create: orderData.items.map(i => ({
            productId: i.productId, name: i.name, image: i.image,
            price: i.price, quantity: i.quantity, subtotal: i.price * i.quantity,
          })),
        },
      },
    });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
