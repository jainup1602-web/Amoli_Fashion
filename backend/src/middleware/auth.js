const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // 1. Try Firebase Admin verification
    try {
      const admin = require('../lib/firebase-admin');
      if (admin.apps.length) {
        const decoded = await admin.auth().verifyIdToken(token);
        const user = await prisma.user.findFirst({ where: { firebaseUid: decoded.uid } });
        if (user) { req.user = user; return next(); }
        
        // If user not in DB but token is valid, we might allow creation in registration route
        // For now, we only attach the UID to req for registration if needed
        req.firebaseUser = decoded;
      }
    } catch (e) {
      // Token not a valid Firebase token, or Firebase Admin not configured
    }

    // 2. Try JWT (Local Auth)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (user) { req.user = user; return next(); }
    } catch (e) {
      // Not a valid local JWT
    }

    // If we have a verified firebaseUser but no DB user, we might be in the registration flow
    if (req.firebaseUser && req.path === '/register') {
      return next();
    }

    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
}

async function verifyAdmin(req, res, next) {
  await verifyToken(req, res, async () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  });
}

module.exports = { verifyToken, verifyAdmin };
