const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyAdmin } = require('../../middleware/auth');

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const pages = await prisma.cmspage.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, pages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const sanitizeHtml = require('sanitize-html');

const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span', 'div']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    '*': ['style', 'class'],
    'img': ['src', 'alt', 'width', 'height']
  }
};

router.post('/', verifyAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.content) {
      data.content = sanitizeHtml(data.content, sanitizeOptions);
    }
    const page = await prisma.cmspage.create({ data });
    res.status(201).json({ success: true, page });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/', verifyAdmin, async (req, res) => {
  try {
    const { id, ...rawData } = req.body;
    const data = { ...rawData };
    if (data.content) {
      data.content = sanitizeHtml(data.content, sanitizeOptions);
    }
    const page = await prisma.cmspage.update({ where: { id }, data });
    res.json({ success: true, page });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.query;
    await prisma.cmspage.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
