export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

// GET - Fetch all newsletter subscribers (admin)
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const subscribers = await prisma.newsletter.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, subscribers });
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// DELETE - Delete subscriber
export async function DELETE(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Subscriber ID required' },
        { status: 400 }
      );
    }

    await prisma.newsletter.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Subscriber deleted' });
  } catch (error: any) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}

// PUT - Update subscriber status
export async function PUT(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Subscriber ID required' },
        { status: 400 }
      );
    }

    const subscriber = await prisma.newsletter.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ success: true, subscriber });
  } catch (error: any) {
    console.error('Error updating subscriber:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update subscriber' },
      { status: 500 }
    );
  }
}
