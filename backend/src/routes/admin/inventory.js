const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyAdmin } = require('../../middleware/auth');
const { validate, schemas } = require('../../middleware/validation');

// GET /api/admin/inventory — paginated product stock list
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '50');
    const { search, filter, sort } = req.query;

    const where = { isActive: true };

    // Filter by stock level
    if (filter === 'low') {
      where.stock = { gt: 0, lte: 10 };
    } else if (filter === 'out') {
      where.stock = { lte: 0 };
    } else if (filter === 'healthy') {
      where.stock = { gt: 10 };
    }

    // Search by name or SKU
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    // Sort options
    let orderBy = { stock: 'asc' }; // default: lowest stock first
    if (sort === 'stock_desc') orderBy = { stock: 'desc' };
    if (sort === 'name_asc') orderBy = { name: 'asc' };
    if (sort === 'name_desc') orderBy = { name: 'desc' };
    if (sort === 'updated') orderBy = { updatedAt: 'desc' };

    const [products, total, lowStockCount, outOfStockCount, totalActive] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          originalPrice: true,
          specialPrice: true,
          images: true,
          isActive: true,
          category: { select: { name: true } },
          updatedAt: true,
        },
      }),
      prisma.product.count({ where }),
      prisma.product.count({ where: { isActive: true, stock: { gt: 0, lte: 10 } } }),
      prisma.product.count({ where: { isActive: true, stock: { lte: 0 } } }),
      prisma.product.count({ where: { isActive: true } }),
    ]);

    // Parse images for each product
    const formattedProducts = products.map(p => {
      let imgs = [];
      try { imgs = JSON.parse(p.images); } catch { imgs = []; }
      return { ...p, images: imgs };
    });

    res.json({
      success: true,
      products: formattedProducts,
      summary: {
        total: totalActive,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        healthy: totalActive - lowStockCount - outOfStockCount,
      },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Inventory API Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/inventory/:id — update stock for a product
router.put('/:id', verifyAdmin, validate(schemas.updateStock), async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: { stock }, // already parsed as int by zod
      select: { id: true, name: true, sku: true, stock: true },
    });

    res.json({ success: true, product });
  } catch (err) {
    console.error('Stock Update Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
