import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Decode token to get Firebase UID (without verification for simplicity)
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
      message: 'User role updated to admin successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Make admin error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update user role' },
      { status: 500 }
    );
  }
}
