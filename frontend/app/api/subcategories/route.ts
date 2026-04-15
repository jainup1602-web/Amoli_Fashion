export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const where = categoryId 
      ? { categoryId, isActive: true } 
      : { isActive: true };
    
    const subcategories = await prisma.subcategory.findMany({
      where,
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, subcategories });
  } catch (error: any) {
    console.error('Subcategories fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch subcategories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if ('error' in authResult) {
    return NextResponse.json({ success: false, message: authResult.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, slug, categoryId, description, image, order } = body;

    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        { success: false, message: 'Name, slug, and categoryId are required' },
        { status: 400 }
      );
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        name,
        slug,
        categoryId,
        description,
        image,
        order: order || 0,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, subcategory }, { status: 201 });
  } catch (error: any) {
    console.error('Subcategory creation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create subcategory' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if ('error' in authResult) {
    return NextResponse.json({ success: false, message: authResult.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, slug, categoryId, description, image, order, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Subcategory ID is required' },
        { status: 400 }
      );
    }

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: { name, slug, categoryId, description, image, order, isActive },
    });

    return NextResponse.json({ success: true, subcategory });
  } catch (error: any) {
    console.error('Subcategory update error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update subcategory' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if ('error' in authResult) {
    return NextResponse.json({ success: false, message: authResult.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Subcategory ID is required' },
        { status: 400 }
      );
    }

    await prisma.subcategory.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (error: any) {
    console.error('Subcategory deletion error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete subcategory' },
      { status: 500 }
    );
  }
}
