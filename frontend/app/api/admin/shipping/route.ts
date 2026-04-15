export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

// GET - Fetch all shipping zones
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const zones = await prisma.shippingzone.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, zones });
  } catch (error: any) {
    console.error('Error fetching shipping zones:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch shipping zones' },
      { status: 500 }
    );
  }
}

// POST - Create shipping zone
export async function POST(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await request.json();
    const { name, pincodes, charges, freeAbove, isActive } = body;

    if (!name || !pincodes || charges === undefined) {
      return NextResponse.json(
        { success: false, message: 'Name, pincodes, and charges are required' },
        { status: 400 }
      );
    }

    const zone = await prisma.shippingzone.create({
      data: {
        name,
        pincodes,
        charges,
        freeAbove,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ success: true, zone });
  } catch (error: any) {
    console.error('Error creating shipping zone:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create shipping zone' },
      { status: 500 }
    );
  }
}

// PUT - Update shipping zone
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Zone ID required' },
        { status: 400 }
      );
    }

    const zone = await prisma.shippingzone.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, zone });
  } catch (error: any) {
    console.error('Error updating shipping zone:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update shipping zone' },
      { status: 500 }
    );
  }
}

// DELETE - Delete shipping zone
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
        { success: false, message: 'Zone ID required' },
        { status: 400 }
      );
    }

    await prisma.shippingzone.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Shipping zone deleted' });
  } catch (error: any) {
    console.error('Error deleting shipping zone:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete shipping zone' },
      { status: 500 }
    );
  }
}
