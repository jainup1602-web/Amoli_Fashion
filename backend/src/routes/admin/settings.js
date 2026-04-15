const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyAdmin } = require('../../middleware/auth');

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const settings = await prisma.settings.findMany();
    const map = {};
    settings.forEach(s => { try { map[s.key] = JSON.parse(s.value); } catch { map[s.key] = s.value; } });
    res.json({ success: true, settings: map });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/', verifyAdmin, async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await prisma.settings.upsert({
        where: { key },
        update: { value: typeof value === 'string' ? value : JSON.stringify(value) },
        create: { key, value: typeof value === 'string' ? value : JSON.stringify(value) },
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
