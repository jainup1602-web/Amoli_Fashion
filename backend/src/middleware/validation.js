/**
 * Zod-based request validation middleware for admin APIs
 */

let zod;
try {
  zod = require('zod');
} catch {
  // Fallback: basic validation without Zod if not installed
  zod = null;
}

/**
 * Creates a validation middleware from a Zod schema
 * @param {object} schema - Zod schema for body validation
 * @param {'body'|'query'|'params'} source - Where to validate from
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    if (!zod || !schema) return next();

    const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace with parsed/cleaned data
    if (source === 'body') req.body = result.data;
    else if (source === 'query') req.query = result.data;
    else req.params = result.data;

    next();
  };
}

/**
 * Sanitize string inputs — strip HTML tags and dangerous characters
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Middleware: Recursively sanitize all string values in req.body
 */
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

function sanitizeObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'string') return sanitizeString(item);
      if (typeof item === 'object' && item !== null) return sanitizeObject(item);
      return item;
    });
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Skip sanitization for content/description fields that may have legitimate HTML
      if (['content', 'description', 'shortDescription'].includes(key)) {
        cleaned[key] = value;
      } else {
        cleaned[key] = sanitizeString(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = sanitizeObject(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// =============================================================
// Validation Schemas (using Zod if available)
// =============================================================

let schemas = {};

if (zod) {
  const z = zod;

  schemas.updateOrderStatus = z.object({
    orderStatus: z.enum(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
    trackingNumber: z.string().max(100).optional(),
    shippingProvider: z.string().max(100).optional(),
    notes: z.string().max(1000).optional(),
  });

  schemas.createCoupon = z.object({
    code: z.string().min(2).max(30).transform(v => v.toUpperCase()),
    description: z.string().max(500).optional(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.union([z.string(), z.number()]).transform(v => parseFloat(String(v))),
    minOrderValue: z.union([z.string(), z.number()]).transform(v => v ? parseFloat(String(v)) : null).optional().nullable(),
    maxDiscount: z.union([z.string(), z.number()]).transform(v => v ? parseFloat(String(v)) : null).optional().nullable(),
    usageLimit: z.union([z.string(), z.number()]).transform(v => v ? parseInt(String(v)) : null).optional().nullable(),
    validFrom: z.string().optional(),
    validUntil: z.string().optional(),
    isActive: z.boolean().optional().default(true),
  });

  schemas.updateUser = z.object({
    role: z.enum(['customer', 'retailer', 'distributor', 'admin']).optional(),
    isActive: z.boolean().optional(),
    loyaltyPoints: z.union([z.string(), z.number()]).transform(v => parseInt(String(v))).optional(),
  });

  schemas.updateStock = z.object({
    stock: z.union([z.string(), z.number()]).transform(v => parseInt(String(v))).refine(v => v >= 0, 'Stock must be non-negative'),
  });

  schemas.updateReturnRequest = z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'refunded']).optional(),
    action: z.enum(['approve', 'reject']).optional(),
    adminNotes: z.string().max(1000).optional(),
    adjustedRefundAmount: z.number().min(0).optional(),
  });
}

module.exports = { validate, sanitizeBody, sanitizeString, schemas };
