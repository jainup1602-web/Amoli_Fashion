const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { verifyAdmin } = require('../middleware/auth');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '20');
    const { category, categorySlug, subcategory, search, featured, material, gender, occasion, inStock, minPrice, maxPrice } = req.query;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

    const where = { isActive: true };
    if (category) where.categoryId = category;
    if (categorySlug) where.category = { slug: categorySlug };
    if (subcategory) where.subcategoryId = subcategory;
    if (featured === 'true') where.isFeatured = true;
    if (material) where.material = { contains: material };
    if (gender) where.gender = { contains: gender };
    if (occasion) where.occasion = { contains: occasion };
    if (inStock === 'true') where.stock = { gt: 0 };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { name: { contains: search } } },
      ];
    }
    if (minPrice || maxPrice) {
      where.AND = [
        minPrice ? { OR: [{ specialPrice: { gte: parseFloat(minPrice) } }, { AND: [{ specialPrice: null }, { originalPrice: { gte: parseFloat(minPrice) } }] }] } : {},
        maxPrice ? { OR: [{ specialPrice: { lte: parseFloat(maxPrice) } }, { AND: [{ specialPrice: null }, { originalPrice: { lte: parseFloat(maxPrice) } }] }] } : {},
      ].filter(o => Object.keys(o).length > 0);
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, skip, take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { name: true, slug: true } },
          subcategory: { select: { name: true, slug: true } },
          review: { select: { rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const parsed = products.map(p => ({
      ...p,
      images: (() => { try { return typeof p.images === 'string' ? JSON.parse(p.images) : p.images; } catch { return []; } })(),
      averageRating: p.review?.length > 0 ? p.review.reduce((s, r) => s + r.rating, 0) / p.review.length : 0,
      totalReviews: p.review?.length || 0,
    }));

    res.json({ success: true, products: parsed, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        review: { select: { rating: true, comment: true, userName: true, createdAt: true, isApproved: true } },
      },
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const parsed = {
      ...product,
      images: (() => { try { return typeof product.images === 'string' ? JSON.parse(product.images) : product.images; } catch { return []; } })(),
      averageRating: product.review?.length > 0 ? product.review.reduce((s, r) => s + r.rating, 0) / product.review.length : 0,
      totalReviews: product.review?.length || 0,
    };
    res.json({ success: true, product: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products (admin)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const body = req.body;
    const data = {
      name: body.name, slug: body.slug, description: body.description,
      shortDescription: body.shortDescription, categoryId: body.category,
      subcategoryId: body.subcategory, sku: body.sku, originalPrice: body.price,
      specialPrice: body.specialPrice, stock: body.stock,
      images: JSON.stringify(body.images || []),
      material: body.material, purity: body.purity, occasion: body.occasion,
      gender: body.gender, weight: body.weight,
      tags: JSON.stringify(body.tags || []),
      isFeatured: body.isFeatured || false, isActive: body.isActive !== false,
    };
    if (!data.name || !data.slug || !data.sku || !data.categoryId || !data.originalPrice) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const product = await prisma.product.create({ data });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/products (admin)
router.put('/', verifyAdmin, async (req, res) => {
  try {
    const { id, ...body } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'Product ID required' });
    const mapped = {};
    if (body.name) mapped.name = body.name;
    if (body.slug) mapped.slug = body.slug;
    if (body.description) mapped.description = body.description;
    if (body.category) mapped.categoryId = body.category;
    if (body.subcategory) mapped.subcategoryId = body.subcategory;
    if (body.price !== undefined) mapped.originalPrice = body.price;
    if (body.specialPrice !== undefined) mapped.specialPrice = body.specialPrice;
    if (body.stock !== undefined) mapped.stock = body.stock;
    if (body.images) mapped.images = JSON.stringify(body.images);
    if (body.isFeatured !== undefined) mapped.isFeatured = body.isFeatured;
    if (body.isActive !== undefined) mapped.isActive = body.isActive;
    const product = await prisma.product.update({ where: { id }, data: mapped });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/products?id=xxx (admin)
router.delete('/', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, message: 'Product ID required' });
    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
