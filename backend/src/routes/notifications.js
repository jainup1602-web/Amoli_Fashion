const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 20,
    });
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/read', verifyToken, async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await prisma.notification.update({ where: { id }, data: { isRead: true } });
    } else {
      await prisma.notification.updateMany({ where: { userId: req.user.id }, data: { isRead: true } });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
