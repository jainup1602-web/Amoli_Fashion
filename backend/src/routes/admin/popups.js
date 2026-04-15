const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyAdmin } = require('../../middleware/auth');

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const popups = await prisma.popup.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, popups });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', verifyAdmin, async (req, res) => {
  try {
    const popup = await prisma.popup.create({ data: req.body });
    res.status(201).json({ success: true, popup });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/', verifyAdmin, async (req, res) => {
  try {
    const { id, ...data } = req.body;
    const popup = await prisma.popup.update({ where: { id }, data });
    res.json({ success: true, popup });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.query;
    await prisma.popup.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
