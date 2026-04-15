export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const existing = await prisma.newsletter.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 400 }
        );
      } else {
        await prisma.newsletter.update({
          where: { email: email.toLowerCase() },
          data: { isActive: true },
        });
        return NextResponse.json({ 
          message: 'Subscription reactivated successfully' 
        });
      }
    }

    await prisma.newsletter.create({
      data: { email: email.toLowerCase() },
    });

    return NextResponse.json(
      { message: 'Subscribed successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Subscription failed' },
      { status: 500 }
    );
  }
}
