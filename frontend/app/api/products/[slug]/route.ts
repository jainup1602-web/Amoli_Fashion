export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const where: any = { slug: params.slug };
    if (!isAdmin) where.isActive = true;

    const product = await prisma.product.findFirst({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        review: { select: { rating: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const parsedProduct = {
      ...product,
      images: (() => { try { return typeof product.images === 'string' ? JSON.parse(product.images) : product.images; } catch { return []; } })(),
      tags: (() => { try { return typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags; } catch { return []; } })(),
      averageRating: product.review?.length > 0
        ? product.review.reduce((sum: number, r: any) => sum + r.rating, 0) / product.review.length
        : 0,
      totalReviews: product.review?.length || 0,
    };

    return NextResponse.json({ success: true, product: parsedProduct });
  } catch (error: any) {
    console.error('Product fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const authResult = await verifyAdmin(request);
  if ('error' in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await request.json();

    const mappedData: any = {};
    if (body.name !== undefined) mappedData.name = body.name;
    if (body.slug !== undefined) mappedData.slug = body.slug;
    if (body.description !== undefined) mappedData.description = body.description;
    if (body.shortDescription !== undefined) mappedData.shortDescription = body.shortDescription;
    if (body.category !== undefined) mappedData.categoryId = body.category;
    if (body.subcategory !== undefined) mappedData.subcategoryId = body.subcategory || null;
    if (body.sku !== undefined) mappedData.sku = body.sku;
    if (body.price !== undefined) mappedData.originalPrice = body.price;
    if (body.specialPrice !== undefined) mappedData.specialPrice = body.specialPrice || null;
    if (body.stock !== undefined) mappedData.stock = body.stock;
    if (body.images !== undefined) mappedData.images = JSON.stringify(body.images);
    if (body.material !== undefined) mappedData.material = body.material;
    if (body.purity !== undefined) mappedData.purity = body.purity;
    if (body.occasion !== undefined) mappedData.occasion = body.occasion;
    if (body.gender !== undefined) mappedData.gender = body.gender;
    if (body.weight !== undefined) mappedData.weight = body.weight;
    if (body.tags !== undefined) mappedData.tags = JSON.stringify(body.tags || []);
    if (body.isFeatured !== undefined) mappedData.isFeatured = body.isFeatured;
    if (body.isActive !== undefined) mappedData.isActive = body.isActive;

    const product = await prisma.product.update({
      where: { slug: params.slug },
      data: mappedData,
    });

    return NextResponse.json({ success: true, product, message: 'Product updated successfully' });
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const authResult = await verifyAdmin(request);
  if ('error' in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
  }

  try {
    // Delete related records first to avoid FK constraint errors
    const product = await prisma.product.findFirst({ where: { slug: params.slug } });
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    await prisma.cart.deleteMany({ where: { productId: product.id } });
    await prisma.wishlist.deleteMany({ where: { productId: product.id } });
    await prisma.review.deleteMany({ where: { productId: product.id } });
    await prisma.orderitem.deleteMany({ where: { productId: product.id } });
    await prisma.product.delete({ where: { id: product.id } });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Product deletion error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
