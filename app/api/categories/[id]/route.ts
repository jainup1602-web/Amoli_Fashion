import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findFirst({
      where: { 
        id: params.id, 
        isActive: true 
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    const subcategories = await prisma.subcategory.findMany({
      where: {
        categoryId: params.id,
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ 
      success: true,
      category, 
      subcategories 
    });
  } catch (error: any) {
    console.error('Category fetch error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch category' },
      { status: 500 }
    );
  }
}
