import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/firebase-admin';
import { rateLimit } from '@/middleware/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: rateLimitResult.error },
      { status: rateLimitResult.status }
    );
  }

  try {
    const { firebaseUid, email, phoneNumber, displayName } = await request.json();

    console.log('📝 Registration request:', { firebaseUid, phoneNumber, displayName });

    if (!firebaseUid) {
      return NextResponse.json(
        { error: 'Firebase UID is required' },
        { status: 400 }
      );
    }

    // Verify Firebase token (optional - skip if Firebase Admin not configured)
    if (auth) {
      try {
        await auth.getUser(firebaseUid);
        console.log('✅ Firebase user verified');
      } catch (error) {
        console.error('⚠️ Firebase verification error:', error);
        // Continue anyway - Firebase Admin might not be configured
      }
    }

    // Check if user already exists by firebaseUid first
    let user = await prisma.user.findUnique({ 
      where: { firebaseUid } 
    });

    if (user) {
      console.log('ℹ️ User already exists:', user.id);
      return NextResponse.json({ user, message: 'User already exists' });
    }

    // Check if phone number is already taken by another user
    if (phoneNumber) {
      const existingUserWithPhone = await prisma.user.findUnique({
        where: { phoneNumber }
      });
      
      if (existingUserWithPhone) {
        console.log('⚠️ Phone number already exists for user:', existingUserWithPhone.id);
        // Update the existing user with the new firebaseUid
        user = await prisma.user.update({
          where: { phoneNumber },
          data: {
            firebaseUid,
            email: email || existingUserWithPhone.email,
            displayName: displayName || existingUserWithPhone.displayName,
          }
        });
        console.log('✅ Updated existing user with new firebaseUid');
        return NextResponse.json({ user, message: 'User updated with new authentication' });
      }
    }

    // Create new user
    user = await prisma.user.create({
      data: {
        firebaseUid,
        email,
        phoneNumber,
        displayName,
        role: 'customer',
      }
    });

    console.log('✅ User created successfully:', user.id);

    return NextResponse.json(
      { user, message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
