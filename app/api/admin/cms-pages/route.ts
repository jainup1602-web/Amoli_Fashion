import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

// GET - Fetch all CMS pages
export async function GET(req: NextRequest) {
  try {
    const pages = await prisma.cmspage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({
      success: true,
      pages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new CMS page
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
    
    const page = await prisma.cmspage.create({
      data: body,
    });
    
    return NextResponse.json({
      success: true,
      page,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update CMS page
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
    
    const page = await prisma.cmspage.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({
      success: true,
      page,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete CMS page
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
        { success: false, error: 'Page ID required' },
        { status: 400 }
      );
    }
    
    await prisma.cmspage.delete({ where: { id } });
    
    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
