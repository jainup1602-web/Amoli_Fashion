const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyAdmin } = require('../../middleware/auth');

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const showcases = await prisma.showcase.findMany({ orderBy: { order: 'asc' } });
    res.json({ success: true, showcases });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', verifyAdmin, async (req, res) => {
  try {
    const showcase = await prisma.showcase.create({ data: req.body });
    res.status(201).json({ success: true, showcase });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/', verifyAdmin, async (req, res) => {
  try {
    const { id, ...data } = req.body;
    const showcase = await prisma.showcase.update({ where: { id }, data });
    res.json({ success: true, showcase });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.query;
    await prisma.showcase.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
