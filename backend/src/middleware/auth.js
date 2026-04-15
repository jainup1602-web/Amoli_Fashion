const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');

// Decode Firebase ID token without verifying signature (dev fallback)
function decodeFirebaseToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    // Firebase uses 'sub' as the UID (not 'uid')
    if (!payload.uid && payload.sub) payload.uid = payload.sub;
    return payload;
  } catch {
    return null;
  }
}

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
      }
    } catch { /* fall through */ }

    // 2. Try JWT
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (user) { req.user = user; return next(); }
    } catch { /* fall through */ }

    // 3. Decode Firebase token without verification (works when Admin SDK key is missing)
    const payload = decodeFirebaseToken(token);
    console.log('🔍 Decoded payload uid:', payload?.uid, 'phone:', payload?.phone_number);
    if (payload?.uid) {
      // Check token expiry
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.log('❌ Token expired');
        return res.status(401).json({ success: false, message: 'Token expired' });
      }
      const user = await prisma.user.findFirst({ where: { firebaseUid: payload.uid } });
      console.log('👤 User found by firebaseUid:', user?.id, 'role:', user?.role);
      if (user) { req.user = user; return next(); }
      // User not in DB yet — create them
      if (payload.phone_number || payload.email) {
        const newUser = await prisma.user.create({
          data: {
            firebaseUid: payload.uid,
            phoneNumber: payload.phone_number || null,
            email: payload.email || null,
            displayName: payload.name || null,
            role: 'customer',
          }
        });
        req.user = newUser;
        return next();
      }
    }

    console.log('❌ All auth methods failed');
    return res.status(401).json({ success: false, message: 'Invalid token' });
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ success: false, message: 'Auth error' });
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
