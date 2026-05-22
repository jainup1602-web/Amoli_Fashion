export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Secret key — only requests with this key will be processed
const MAKE_ADMIN_SECRET = process.env.MAKE_ADMIN_SECRET || 'amoli-secret-2024-xK9mP';

export async function POST(request: NextRequest) {
  try {
    // Check secret key from header
    const secretKey = request.headers.get('x-admin-secret');
    if (secretKey !== MAKE_ADMIN_SECRET) {
      // Return 404 so it looks like page doesn't exist
      return NextResponse.json(
        { success: false, message: 'Not found' },
        { status: 404 }
      );
    }

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Decode token to get Firebase UID
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const firebaseUid = payload.user_id || payload.sub;

    if (!firebaseUid) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Find user and update role to admin
    const user = await prisma.user.update({
      where: { firebaseUid },
      data: { role: 'admin' },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin role granted successfully',
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Make admin error:', error);
    return NextResponse.json(
      { success: false, message: 'Not found' },
      { status: 404 }
    );
  }
}
