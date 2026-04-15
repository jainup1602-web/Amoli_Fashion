import { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Unauthorized', status: 401 };
    }

    const token = authHeader.split('Bearer ')[1];
    
    // If Firebase Admin is not configured, skip token verification
    // and just check if user exists in database
    let firebaseUid: string | null = null;
    
    if (auth) {
      try {
        const decodedToken = await auth.verifyIdToken(token);
        firebaseUid = decodedToken.uid;
      } catch (error) {
        console.error('Firebase Admin token verification failed:', error);
        return { error: 'Invalid token', status: 401 };
      }
    } else {
      // Firebase Admin not configured - extract UID from token (unsafe but works for dev)
      console.warn('⚠️ Firebase Admin not configured. Using client-side auth only.');
      try {
        // Decode JWT without verification (development only!)
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        firebaseUid = payload.user_id || payload.sub;
      } catch (error) {
        return { error: 'Invalid token format', status: 401 };
      }
    }
    
    if (!firebaseUid) {
      return { error: 'Invalid token', status: 401 };
    }
    
    try {
      const user = await prisma.user.findUnique({ 
        where: { firebaseUid } 
      });

      if (!user) {
        return { error: 'User not found', status: 404 };
      }

      if (!user.isActive) {
        return { error: 'Account is blocked', status: 403 };
      }

      return { user, decodedToken: { uid: firebaseUid } };
    } catch (dbError) {
      console.error('Database connection failed in auth:', dbError);
      return { error: 'Database connection failed', status: 500 };
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return { error: 'Authentication failed', status: 401 };
  }
}

export async function verifyAdmin(request: NextRequest) {
  const authResult = await verifyAuth(request);
  
  if ('error' in authResult) {
    return authResult;
  }

  if (authResult.user.role !== 'admin') {
    return { error: 'Admin access required', status: 403 };
  }

  return authResult;
}
