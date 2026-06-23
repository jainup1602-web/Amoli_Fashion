export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  originalPrice: number;
  specialPrice?: number;
  stock: number;
  images: string[];
  sku?: string;
  material?: string;
  purity?: string;
  occasion?: string;
  gender?: string;
  weight?: number;
  tags?: string[];
  categoryId: string;
  subcategoryId?: string;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  displayName?: string;
  role: string;
  loyaltyPoints: number;
}
