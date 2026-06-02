const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyAdmin } = require('../../middleware/auth');

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    const whereClause = search
      ? {
          user: {
            OR: [
              { displayName: { contains: search } },
              { email: { contains: search } }
            ]
          }
        }
      : {};

    const transactions = await prisma.wallettransaction.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, displayName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, transactions });
  } catch (err) {
    console.error('Wallet Admin fetch Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { userId, type, amount, description } = req.body;
    
    if (!userId || !amount || !type || !description) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (type === 'debit' && user.walletBalance < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient wallet balance' });
    }

    const newBalance = type === 'credit' 
      ? user.walletBalance + amount 
      : user.walletBalance - amount;

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: newBalance }
      });

      const txRecord = await tx.wallettransaction.create({
        data: {
          userId,
          type,
          amount,
          balance: newBalance,
          description,
          referenceType: type === 'credit' ? 'admin_credit' : 'admin_debit'
        }
      });
      
      return txRecord;
    });

    res.json({ success: true, transaction: result });
  } catch (err) {
    console.error('Wallet Admin Adjust Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
