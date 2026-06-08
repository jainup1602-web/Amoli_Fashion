const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const emailService = require('../lib/email');
const whatsappService = require('../lib/whatsapp');

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
      include: { orderitem: true } // Need this for Shiprocket order creation
    });

    // Auto-push to Shiprocket
    try {
      const shiprocket = require('../lib/shiprocket');
      const shiprocketResult = await shiprocket.createOrder({
        ...order,
        shippingAddress: orderData.shippingAddress // Use parsed object
      });
      
      // Save Shiprocket order info
      await prisma.order.update({
        where: { id: order.id },
        data: {
          shiprocketOrderId: shiprocketResult.order_id?.toString(),
          shipmentId: shiprocketResult.shipment_id?.toString()
        }
      });
      console.log('✅ Order pushed to Shiprocket:', shiprocketResult.order_id);
    } catch (shipError) {
      console.error('❌ Shiprocket auto-push failed:', shipError.message);
      // We don't fail the request here, as the order is already paid/saved
    }

    // Trigger Notifications asynchronously
    emailService.sendOrderConfirmation(order).catch(e => console.error('Email error:', e));
    whatsappService.notifyAdminNewOrder(order).catch(e => console.error('WA Admin error:', e));
    whatsappService.notifyCustomerOrderStatus(order, 'confirmed').catch(e => console.error('WA Customer error:', e));

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create COD order
router.post('/cod', verifyToken, async (req, res) => {
  try {
    const { orderData } = req.body;
    const orderNumber = 'ORD-COD-' + Date.now();

    const order = await prisma.order.create({
      data: {
        orderNumber, userId: req.user.id,
        customerName: orderData.customerName, customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        shippingAddress: JSON.stringify(orderData.shippingAddress),
        subtotal: orderData.subtotal, discount: orderData.discount || 0,
        shippingCharges: orderData.shippingCharges || 0, total: orderData.total,
        couponCode: orderData.couponCode, paymentMethod: 'cod',
        paymentStatus: 'pending', orderStatus: 'confirmed',
        orderitem: {
          create: orderData.items.map(i => ({
            productId: i.productId, name: i.name, image: i.image,
            price: i.price, quantity: i.quantity, subtotal: i.price * i.quantity,
          })),
        },
      },
      include: { orderitem: true }
    });

    // Auto-push to Shiprocket as COD
    try {
      const shiprocket = require('../lib/shiprocket');
      const shiprocketResult = await shiprocket.createOrder({
        ...order,
        shippingAddress: orderData.shippingAddress
      });
      
      await prisma.order.update({
        where: { id: order.id },
        data: {
          shiprocketOrderId: shiprocketResult.order_id?.toString(),
          shipmentId: shiprocketResult.shipment_id?.toString()
        }
      });
      console.log('✅ COD Order pushed to Shiprocket:', shiprocketResult.order_id);
    } catch (shipError) {
      console.error('❌ Shiprocket COD auto-push failed:', shipError.message);
    }

    // Trigger Notifications asynchronously
    emailService.sendOrderConfirmation(order).catch(e => console.error('Email error:', e));
    whatsappService.notifyAdminNewOrder(order).catch(e => console.error('WA Admin error:', e));
    whatsappService.notifyCustomerOrderStatus(order, 'confirmed').catch(e => console.error('WA Customer error:', e));

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
