const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyAdmin } = require('../../middleware/auth');

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const zones = await prisma.shippingzone.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, zones });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', verifyAdmin, async (req, res) => {
  try {
    const zone = await prisma.shippingzone.create({ data: req.body });
    res.status(201).json({ success: true, zone });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/', verifyAdmin, async (req, res) => {
  try {
    const { id, ...data } = req.body;
    const zone = await prisma.shippingzone.update({ where: { id }, data });
    res.json({ success: true, zone });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.query;
    await prisma.shippingzone.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/shipping/track/:shipmentId — Get tracking from Shiprocket
router.get('/track/:shipmentId', verifyAdmin, async (req, res) => {
  try {
    const shiprocket = require('../../lib/shiprocket');
    const tracking = await shiprocket.getTrackingStatus(req.params.shipmentId);
    res.json({ success: true, tracking });
  } catch (err) {
    console.error('Tracking Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/shipping/invoice — Generate invoice via Shiprocket
router.post('/invoice', verifyAdmin, async (req, res) => {
  try {
    const { orderIds } = req.body;
    if (!orderIds || !orderIds.length) {
      return res.status(400).json({ success: false, error: 'Order IDs required' });
    }
    const shiprocket = require('../../lib/shiprocket');
    const result = await shiprocket.generateInvoice(orderIds);
    res.json({
      success: true,
      invoiceUrl: result.invoice_url || result.is_invoice_created ? result.invoice_url : null,
      data: result,
    });
  } catch (err) {
    console.error('Invoice Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
