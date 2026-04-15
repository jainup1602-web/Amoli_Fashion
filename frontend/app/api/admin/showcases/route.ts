import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

// GET - Fetch all showcases
export async function GET(req: NextRequest) {
  try {
    const showcases = await prisma.showcase.findMany({
      orderBy: { order: 'asc' },
    });
    
    return NextResponse.json({
      success: true,
      showcases,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new showcase
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAdmin(req);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await req.json();
    
    const showcase = await prisma.showcase.create({
      data: body,
    });
    
    return NextResponse.json({
      success: true,
      showcase,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update showcase
export async function PUT(req: NextRequest) {
  try {
    const authResult = await verifyAdmin(req);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await req.json();
    const { id, ...updateData } = body;
    
    const showcase = await prisma.showcase.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({
      success: true,
      showcase,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete showcase
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAdmin(req);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Showcase ID required' },
        { status: 400 }
      );
    }
    
    await prisma.showcase.delete({ where: { id } });
    
    return NextResponse.json({
      success: true,
      message: 'Showcase deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
