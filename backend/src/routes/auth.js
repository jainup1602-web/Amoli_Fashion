const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');

// GET profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, displayName: true, photoURL: true, role: true, phoneNumber: true, createdAt: true },
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST register / sync user from Firebase
router.post('/register', async (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoURL, phoneNumber } = req.body;
    if (!firebaseUid) return res.status(400).json({ success: false, message: 'firebaseUid required' });

    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: { email, displayName, photoURL, phoneNumber },
      create: { firebaseUid, email, displayName, photoURL, phoneNumber, role: 'customer' },
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { displayName, phoneNumber, photoURL } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { displayName, phoneNumber, photoURL },
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
