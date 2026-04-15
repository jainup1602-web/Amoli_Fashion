import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number').optional(),
}).refine(data => data.email || data.phoneNumber, {
  message: 'Either email or phone number is required',
});

export const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().optional(),
  brand: z.string().min(2, 'Brand is required'),
  sku: z.string().min(3, 'SKU is required'),
  originalPrice: z.number().min(0, 'Price must be positive'),
  specialPrice: z.number().min(0).optional(),
  stock: z.number().min(0, 'Stock cannot be negative'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
});

export const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid pincode'),
});

export const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  description: z.string().min(5, 'Description is required'),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(0, 'Discount value must be positive'),
  minOrderValue: z.number().min(0),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().min(0),
  validFrom: z.string().or(z.date()),
  validUntil: z.string().or(z.date()),
});

export const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

export const enquirySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number').optional(),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});
