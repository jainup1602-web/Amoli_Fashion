const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

router.get('/:slug', async (req, res) => {
  try {
    const page = await prisma.cmspage.findFirst({ where: { slug: req.params.slug, isActive: true } });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, page });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
