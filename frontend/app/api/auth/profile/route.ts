export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  return NextResponse.json({ user: authResult.user });
}

export async function PUT(request: NextRequest) {
  const authResult = await verifyAuth(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await request.json();
    const { displayName, email, phoneNumber, photoURL } = body;

    const updateData: any = {};
    if (displayName) updateData.displayName = displayName;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    const updatedUser = await prisma.user.update({
      where: { id: authResult.user.id },
      data: updateData
    });

    return NextResponse.json({ 
      success: true,
      user: updatedUser, 
      message: 'Profile updated successfully' 
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
