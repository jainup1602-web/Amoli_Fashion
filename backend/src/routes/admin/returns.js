const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyAdmin } = require('../../middleware/auth');
const { validate, schemas } = require('../../middleware/validation');
const emailService = require('../../lib/email');

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    const whereClause = search
      ? {
          OR: [
            { id: { contains: search } },
            { orderId: { contains: search } },
            { user: { email: { contains: search } } }
          ]
        }
      : {};

    const returns = await prisma.returnrequest.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, displayName: true, email: true } },
        order: { select: { id: true, orderNumber: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, returns });
  } catch (err) {
    console.error('Returns Admin fetch Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', verifyAdmin, validate(schemas.updateReturnRequest), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const returnReq = await prisma.returnrequest.findUnique({
      where: { id },
      include: { order: { include: { user: true } } }
    });

    if (!returnReq) {
      return res.status(404).json({ success: false, error: 'Return request not found' });
    }

    if (returnReq.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Return request is already ' + returnReq.status });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedReq = await tx.returnrequest.update({
        where: { id },
        data: { status, adminNotes }
      });


      
      return updatedReq;
    });
    
    // Trigger notification if approved
    if (status === 'approved') {
      emailService.sendReturnApproved(updated, returnReq.order).catch(console.error);
    } else if (status === 'refunded') {
      emailService.sendRefundProcessed(returnReq.order, returnReq.refundAmount).catch(console.error);
    }

    res.json({ success: true, returnRequest: updated });
  } catch (err) {
    console.error('Return Admin update Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
