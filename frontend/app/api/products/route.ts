import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const categorySlug = searchParams.get('categorySlug');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featured = searchParams.get('featured');
    const material = searchParams.get('material');
    const gender = searchParams.get('gender');
    const occasion = searchParams.get('occasion');
    const inStock = searchParams.get('inStock');

    const where: any = { isActive: true };

    if (category) where.categoryId = category;
    if (categorySlug) where.category = { slug: categorySlug };
    if (subcategory) where.subcategoryId = subcategory;
    if (featured === 'true') where.isFeatured = true;
    if (material) where.material = { contains: material };
    if (gender) where.gender = { contains: gender };
    if (occasion) where.occasion = { contains: occasion };
    if (inStock === 'true') where.stock = { gt: 0 };
    
    if (search) {
      // Use word-boundary matching for name so "ring" doesn't match "earring"
      // MySQL REGEXP: [[:<:]] is word boundary start
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { name: { contains: search } } },
        { subcategory: { name: { contains: search } } },
      ];
    }

    if (minPrice || maxPrice) {
      where.AND = [
        minPrice ? { 
          OR: [
            { specialPrice: { gte: parseFloat(minPrice) } },
            { AND: [{ specialPrice: null }, { originalPrice: { gte: parseFloat(minPrice) } }] }
          ]
        } : {},
        maxPrice ? {
          OR: [
            { specialPrice: { lte: parseFloat(maxPrice) } },
            { AND: [{ specialPrice: null }, { originalPrice: { lte: parseFloat(maxPrice) } }] }
          ]
        } : {}
      ].filter(obj => Object.keys(obj).length > 0);
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: search ? limit * 4 : limit, // fetch more when searching so we can filter
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { name: true, slug: true } },
          subcategory: { select: { name: true, slug: true } },
          review: { select: { rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Post-filter for search: ensure query matches as a whole word in the product name
    // This prevents "ring" from matching "earring", "earrings", etc.
    let filteredProducts = products;
    if (search) {
      const wordBoundary = new RegExp(`(?<![a-zA-Z])${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
      filteredProducts = products.filter((p) => wordBoundary.test(p.name));
      // If word-boundary filter returns nothing, fall back to all results (graceful degradation)
      if (filteredProducts.length === 0) filteredProducts = products;
    }

    // Parse JSON string fields to arrays
    const parsedProducts = filteredProducts.slice(0, limit).map((p) => ({
      ...p,
      images: (() => { try { return typeof p.images === 'string' ? JSON.parse(p.images) : p.images; } catch { return []; } })(),
      tags: (() => { try { return typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags; } catch { return []; } })(),
      averageRating: p.review?.length > 0
        ? p.review.reduce((sum, r) => sum + r.rating, 0) / p.review.length
        : 0,
      totalReviews: p.review?.length || 0,
    }));

    return NextResponse.json({
      success: true,
      products: parsedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  
  if ('error' in authResult) {
    console.error('❌ Unauthorized access attempt');
    return NextResponse.json(
      { success: false, message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await request.json();
    console.log('📦 Received product data:', JSON.stringify(body, null, 2));

    // Map frontend field names to model field names
    const productData = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      shortDescription: body.shortDescription,
      categoryId: body.category,
      subcategoryId: body.subcategory,
      sku: body.sku,
      originalPrice: body.price,
      specialPrice: body.specialPrice,
      stock: body.stock,
      images: JSON.stringify(body.images || []),
      material: body.material,
      purity: body.purity,
      occasion: body.occasion,
      gender: body.gender,
      weight: body.weight,
      dimensions: body.dimensions ? JSON.stringify(body.dimensions) : null,
      tags: JSON.stringify(body.tags || []),
      isFeatured: body.isFeatured || false,
      isActive: body.isActive !== false,
    };

    // Validate required fields
    if (!productData.name || !productData.slug || !productData.sku || !productData.categoryId || !productData.originalPrice) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { success: false, message: 'Missing required fields: name, slug, sku, category, and price are required' },
        { status: 400 }
      );
    }

    console.log('🔄 Creating product in database...');
    const product = await prisma.product.create({ data: productData });
    console.log('✅ Product created successfully:', product.id);

    return NextResponse.json(
      { success: true, product, message: 'Product created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Product creation error:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

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
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Map frontend field names to model field names
    const mappedData: any = {};
    if (updateData.name) mappedData.name = updateData.name;
    if (updateData.slug) mappedData.slug = updateData.slug;
    if (updateData.description) mappedData.description = updateData.description;
    if (updateData.shortDescription) mappedData.shortDescription = updateData.shortDescription;
    if (updateData.category) mappedData.categoryId = updateData.category;
    if (updateData.subcategory) mappedData.subcategoryId = updateData.subcategory;
    if (updateData.sku) mappedData.sku = updateData.sku;
    if (updateData.price !== undefined) mappedData.originalPrice = updateData.price;
    if (updateData.specialPrice !== undefined) mappedData.specialPrice = updateData.specialPrice;
    if (updateData.stock !== undefined) mappedData.stock = updateData.stock;
    if (updateData.images) mappedData.images = JSON.stringify(updateData.images);
    if (updateData.material) mappedData.material = updateData.material;
    if (updateData.purity) mappedData.purity = updateData.purity;
    if (updateData.occasion) mappedData.occasion = updateData.occasion;
    if (updateData.gender) mappedData.gender = updateData.gender;
    if (updateData.weight) mappedData.weight = updateData.weight;
    if (updateData.dimensions) mappedData.dimensions = typeof updateData.dimensions === 'string' ? updateData.dimensions : JSON.stringify(updateData.dimensions);
    if (updateData.isFeatured !== undefined) mappedData.isFeatured = updateData.isFeatured;
    if (updateData.isActive !== undefined) mappedData.isActive = updateData.isActive;
    if (updateData.tags) mappedData.tags = JSON.stringify(updateData.tags);

    const product = await prisma.product.update({
      where: { id },
      data: mappedData,
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

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
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
