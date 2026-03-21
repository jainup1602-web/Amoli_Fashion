'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Rating } from '@/components/common/Rating';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Truck, RefreshCw, Minus, Plus, Star, Check, CheckCircle, Share2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart, addToCartAsync } from '@/store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, addToWishlistAsync, removeFromWishlistAsync } from '@/store/slices/wishlistSlice';
import { AuthModal } from '@/components/auth/AuthModal';
import { ProductCard } from '@/components/products/ProductCard';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  originalPrice: number;
  specialPrice?: number;
  discountPercentage?: number;
  stock: number;
  averageRating: number;
  totalReviews: number;
  description: string;
  shortDescription?: string;
  sku?: string;
  material?: string;
  purity?: string;
  occasion?: string;
  gender?: string;
  weight?: number;
  tags?: string[];
  categoryId?: string;
  category: { id?: string; name: string; slug: string };
  subcategory?: { name: string; slug: string };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.settings);
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');
  const [showAuthModal, setShowAuthModal] = useState(false);



  const isInWishlist = product ? wishlistItems.some((item) => item.productId === product.id) : false;

  useEffect(() => {
    fetchProduct();
    setSelectedImage(0);
    setQuantity(1);
  }, [params.slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${params.slug}`);
      const data = await res.json();
      if (res.ok && data.product) {
        setProduct(data.product);
        fetchReviews(data.product.id);
        fetchRelated(data.product.category?.id || data.product.categoryId, data.product.id);
      } else {
        toast.error('Product not found');
      }
    } catch {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/reviews?productId=${productId}`, { headers });
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {}
  };

  const fetchRelated = async (categoryId: string, excludeId: string) => {
    try {
      // First try same category
      const res = await fetch(`/api/products?category=${categoryId}&limit=17`);
      const data = await res.json();
      let products = (data.products || []).filter((p: any) => p.id !== excludeId).slice(0, 16);

      // If not enough, fill with general products
      if (products.length < 16) {
        const res2 = await fetch(`/api/products?limit=20`);
        const data2 = await res2.json();
        const extra = (data2.products || []).filter(
          (p: any) => p.id !== excludeId && !products.find((x: any) => x.id === p.id)
        );
        products = [...products, ...extra].slice(0, 16);
      }

      setRelatedProducts(products);
    } catch {}
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!isAuthenticated) { setShowAuthModal(true); return; }

    const cartItem = {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.specialPrice || product.originalPrice,
      originalPrice: product.originalPrice,
      image: product.images[0] || '/placeholder.svg',
      quantity,
      stock: product.stock,
    };
    dispatch(addToCart(cartItem));
    toast.success('Added to cart!');

    if (token && token.length > 10) {
      dispatch(addToCartAsync({ productId: product.id, quantity, token })).catch(() => {});
    }
  };

  const handleWishlist = () => {
    if (!product) return;
    if (!isAuthenticated) { setShowAuthModal(true); return; }

    const item = {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || '/placeholder.svg',
      hoverImage: product.images[1] || undefined,
      price: product.specialPrice || product.originalPrice,
      originalPrice: product.originalPrice,
      stock: product.stock,
    };

    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(item));
      toast.success('Added to wishlist!');
    }

    if (token && token.length > 10) {
      if (isInWishlist) dispatch(removeFromWishlistAsync({ productId: product.id, token })).catch(() => {});
      else dispatch(addToWishlistAsync({ productId: product.id, token })).catch(() => {});
    }
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied!');
      }
    } catch {}
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F5F2] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#B76E79' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F9F5F2] flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-fairplay text-[#1C1C1C]">Product not found</h2>
          <Link href="/products" className="mt-4 inline-block text-sm underline" style={{ color: '#B76E79' }}>Back to Collections</Link>
        </div>
      </div>
    );
  }

  const displayPrice = product.specialPrice || product.originalPrice;
  const discount = product.specialPrice
    ? Math.round(((product.originalPrice - product.specialPrice) / product.originalPrice) * 100)
    : 0;

  // Build product details from real fields
  const details: { label: string; value: string }[] = [];
  if (product.sku) details.push({ label: 'SKU', value: product.sku });
  if (product.material) details.push({ label: 'Material', value: product.material });
  if (product.purity) details.push({ label: 'Purity', value: product.purity });
  if (product.weight) details.push({ label: 'Weight', value: `${product.weight}g` });
  if (product.occasion) details.push({ label: 'Occasion', value: product.occasion });
  if (product.gender) details.push({ label: 'For', value: product.gender });
  if (product.category) details.push({ label: 'Category', value: product.category.name });
  if (product.subcategory) details.push({ label: 'Subcategory', value: product.subcategory.name });

  const freeShipping = settings?.freeShippingThreshold || 500;
  const returnDays = settings?.returnPolicyDays || 7;

  return (
    <div className="min-h-screen bg-[#F9F5F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="mb-6 text-xs font-elegant tracking-widest uppercase text-gray-500">
          <Breadcrumb items={[
            { label: 'Collections', href: '/products' },
            { label: product.category?.name || 'Category', href: `/products?category=${product.category?.slug || ''}` },
            { label: product.name },
          ]} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Images */}
          <div>
            <div className="relative aspect-square bg-white border border-gold/10 overflow-hidden">
              <Image
                src={product.images[selectedImage] || '/placeholder.svg'}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
                unoptimized={product.images[selectedImage]?.startsWith('data:')}
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 text-white text-xs font-semibold px-2 py-1 tracking-widest uppercase" style={{ backgroundColor: '#B76E79' }}>
                  -{discount}%
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square border-2 overflow-hidden transition-all ${selectedImage === idx ? 'border-[#B76E79]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill sizes="80px" className="object-cover" unoptimized={img.startsWith('data:')} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            {/* Title + rating */}
            <div>
              {product.category && (
                <Link href={`/products?category=${product.category.slug}`} className="text-xs font-elegant tracking-widest uppercase text-gray-400 hover:text-[#B76E79] transition-colors">
                  {product.category.name}
                  {product.subcategory && ` / ${product.subcategory.name}`}
                </Link>
              )}
              <h1 className="text-3xl md:text-4xl font-fairplay text-[#1C1C1C] leading-snug mt-1">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Rating rating={product.averageRating} showNumber />
                <span className="text-xs text-gray-400 font-elegant tracking-widest">({product.totalReviews} reviews)</span>
                {product.sku && <span className="text-xs text-gray-400 ml-auto">SKU: {product.sku}</span>}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 border-t border-b border-gold/15 py-4">
              <span className="text-3xl font-medium text-[#1C1C1C]">{formatPrice(displayPrice)}</span>
              {product.specialPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through font-light">{formatPrice(product.originalPrice)}</span>
                  <span className="text-white text-xs px-2 py-1 font-elegant tracking-widest uppercase" style={{ backgroundColor: '#B76E79' }}>Save {discount}%</span>
                </>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-sm text-gray-600 font-light leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, i) => (
                  <Link key={i} href={`/search?q=${encodeURIComponent(tag)}`}
                    className="text-[10px] font-elegant tracking-widest uppercase px-3 py-1 border border-gold/20 text-gray-500 hover:border-[#B76E79] hover:text-[#B76E79] transition-colors">
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Stock */}
            <div>
              {product.stock > 0 ? (
                <p className="text-xs font-elegant tracking-widest uppercase flex items-center gap-2" style={{ color: '#B76E79' }}>
                  <CheckCircle className="h-4 w-4" />
                  In Stock
                  {product.stock <= 10 && <span className="text-orange-500 normal-case tracking-normal font-light">— Only {product.stock} left</span>}
                </p>
              ) : (
                <p className="text-xs font-elegant tracking-widest uppercase text-red-600">Out of Stock</p>
              )}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div>
                <label className="block text-xs font-elegant tracking-widest uppercase text-gray-500 mb-2">Quantity</label>
                <div className="flex items-center w-32 border border-gold/30">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}
                    className="px-3 py-2 text-gray-600 hover:bg-[#B76E79] hover:text-white transition-colors disabled:opacity-40">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex-1 text-center text-sm font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}
                    className="px-3 py-2 text-gray-600 hover:bg-[#B76E79] hover:text-white transition-colors disabled:opacity-40">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full h-14 text-white rounded-none border-none tracking-[0.2em] uppercase text-sm font-medium transition-colors"
                style={{ backgroundColor: product.stock === 0 ? '#9ca3af' : '#B76E79' }}
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock === 0 ? 'Out of Stock' : !isAuthenticated ? 'Login to Add to Bag' : 'Add to Bag'}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleWishlist}
                  className="rounded-none border-gray-300 text-[#1C1C1C] hover:bg-[#B76E79] hover:text-white hover:border-[#B76E79] transition-colors tracking-[0.1em] uppercase text-xs h-12"
                >
                  <Heart className={`mr-2 h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                  {isInWishlist ? 'Saved' : 'Wishlist'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="rounded-none border-gray-300 text-[#1C1C1C] hover:bg-[#B76E79] hover:text-white hover:border-[#B76E79] transition-colors tracking-[0.1em] uppercase text-xs h-12"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="border-t border-gold/15 pt-4 space-y-2.5 text-sm text-gray-500 font-light">
              <div className="flex items-center gap-3">
                <Truck className="h-4 w-4 flex-shrink-0" style={{ color: '#B76E79' }} />
                <span>Free delivery on orders above {formatPrice(freeShipping)}</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="h-4 w-4 flex-shrink-0" style={{ color: '#B76E79' }} />
                <span>{returnDays}-day easy returns</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 flex-shrink-0" style={{ color: '#B76E79' }} />
                <span>100% authentic & certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16 border border-gold/10 bg-white">
          <div className="border-b border-gold/10 flex">
            {(['description', 'details', 'reviews'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-xs font-elegant tracking-widest uppercase transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-[#B76E79] text-[#B76E79]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                {tab === 'reviews' ? `Reviews (${product.totalReviews})` : tab === 'details' ? 'Details' : 'Description'}
              </button>
            ))}
          </div>

          <div className="p-8 md:p-10">
            {/* Description */}
            {activeTab === 'description' && (
              <div className="max-w-3xl">
                <p className="text-gray-600 font-light leading-relaxed whitespace-pre-line text-base">{product.description}</p>
              </div>
            )}

            {/* Details */}
            {activeTab === 'details' && (
              <div className="max-w-2xl">
                {details.length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {details.map(({ label, value }) => (
                        <tr key={label} className="border-b border-gray-100">
                          <td className="py-3 pr-8 font-medium text-[#1C1C1C] w-1/3 font-elegant tracking-widest uppercase text-xs">{label}</td>
                          <td className="py-3 text-gray-600 font-light">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-400 font-light">No additional details available.</p>
                )}
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="max-w-3xl space-y-8">
                {/* Summary */}
                {reviews.length > 0 && (
                  <div className="flex items-center gap-6 p-6 bg-[#F9F5F2] border border-gold/10">
                    <div className="text-center">
                      <div className="text-5xl font-fairplay text-[#1C1C1C]">{product.averageRating.toFixed(1)}</div>
                      <Rating rating={product.averageRating} />
                      <p className="text-xs text-gray-400 mt-1 font-elegant tracking-widest">{product.totalReviews} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews.filter(r => r.rating === star).length;
                        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="w-3">{star}</span>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: '#B76E79' }} />
                            </div>
                            <span className="w-4 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Review list */}
                {reviews.length > 0 ? (
                  <div className="space-y-5">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-[#1C1C1C]">{review.userName}</span>
                              {review.isVerified && (
                                <span className="text-[10px] font-elegant tracking-widest uppercase text-green-600 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" /> Verified
                                </span>
                              )}
                            </div>
                            <Rating rating={review.rating} size="sm" />
                          </div>
                          <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 font-light leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 font-light text-sm">No reviews yet. Be the first to share your experience!</p>
                )}

                {/* Write review — only from My Orders after delivery */}
                <div className="border-t border-gold/10 pt-8">
                  <div className="text-center py-6 border border-gold/10 bg-[#F9F5F2]">
                    <Star className="h-8 w-8 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-600 font-light mb-1">Purchased this product?</p>
                    <p className="text-xs text-gray-400 font-light mb-4">You can write a review from <span className="font-medium">My Orders</span> once your order is delivered.</p>
                    <Link href="/account/orders">
                      <Button className="text-white rounded-none border-none tracking-widest uppercase text-xs px-6" style={{ backgroundColor: '#B76E79' }}>
                        Go to My Orders
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div className="inline-block text-white px-6 py-2" style={{ backgroundColor: '#B76E79' }}>
                <h2 className="text-lg font-fairplay text-white tracking-wide">You May Also Like</h2>
              </div>
              <Link href={`/products?category=${product.category?.slug}`} className="text-xs font-elegant tracking-widest uppercase text-gray-400 hover:text-[#B76E79] transition-colors">
                View All →
              </Link>
            </div>
            {/* Horizontal scroll slider — 2 rows */}
            <div className="overflow-x-auto pb-4 hide-scrollbar">
              <div style={{ width: 'max-content' }}>
                {/* Row 1 */}
                <div className="flex gap-4 mb-4">
                  {relatedProducts.slice(0, 8).map((p) => (
                    <div key={p.id} style={{ width: 220 }}>
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
                {/* Row 2 — only if we have more than 8 */}
                {relatedProducts.length > 8 && (
                  <div className="flex gap-4">
                    {relatedProducts.slice(8, 16).map((p) => (
                      <div key={p.id} style={{ width: 220 }}>
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
