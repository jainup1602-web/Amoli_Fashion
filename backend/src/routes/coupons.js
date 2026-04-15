const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await prisma.coupon.findFirst({
      where: { code: code.toUpperCase(), isActive: true, validFrom: { lte: new Date() }, validUntil: { gte: new Date() } },
    });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    if (coupon.minOrderValue && orderAmount < coupon.minOrderValue) return res.status(400).json({ success: false, message: `Minimum order ₹${coupon.minOrderValue} required` });

    let discount = coupon.discountType === 'percentage' ? (orderAmount * coupon.discountValue) / 100 : coupon.discountValue;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);

    res.json({ success: true, coupon, discount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
