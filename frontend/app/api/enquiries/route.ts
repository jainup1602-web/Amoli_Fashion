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
    const { name, email, phone, subject, message } = await request.json();

    const enquiry = await prisma.enquiry.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
      },
    });

    return NextResponse.json(
      { enquiry, message: 'Enquiry submitted successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Enquiry creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit enquiry' },
      { status: 500 }
    );
  }
}
