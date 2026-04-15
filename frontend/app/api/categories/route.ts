import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

// GET - Public access (no auth required for fetching categories)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Admin only
export async function POST(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if ('error' in authResult) {
    return NextResponse.json({ success: false, message: authResult.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, slug, description, image, order } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findUnique({ where: { slug } });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        order: order || 0,
        isActive: true,
      }
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    console.error('Category creation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}

// PUT - Admin only
export async function PUT(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if ('error' in authResult) {
    return NextResponse.json({ success: false, message: authResult.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, slug, description, image, order, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Category ID is required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, description, image, order, isActive },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Category update error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Admin only
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
        { success: false, message: 'Category ID is required' },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Category deletion error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}
