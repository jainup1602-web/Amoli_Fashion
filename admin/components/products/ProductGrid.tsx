'use client';

import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addToCart, addToCartAsync } from '@/store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, addToWishlistAsync, removeFromWishlistAsync } from '@/store/slices/wishlistSlice';
import { AuthModal } from '@/components/auth/AuthModal';
import toast from 'react-hot-toast';

export type ViewMode = '1col' | '2col' | '3col' | '4col' | '5col' | 'list';

interface ProductGridProps {
  products: any[];
  viewMode?: ViewMode;
}

const GRID_CLASSES: Record<Exclude<ViewMode, '1col' | 'list'>, string> = {
  '2col': 'grid grid-cols-2 gap-5',
  '3col': 'grid grid-cols-2 sm:grid-cols-3 gap-5',
  '4col': 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5',
  '5col': 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4',
};

// List row card — image left, details right (like the reference image)
function ListRowCard({ product }: { product: any }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const [showAuth, setShowAuth] = useState(false);

  const img = product.images?.[0] || '/placeholder.svg';
  const price = product.specialPrice || product.originalPrice;
  const discount = product.specialPrice
    ? Math.round(((product.originalPrice - product.specialPrice) / product.originalPrice) * 100)
    : 0;
  const isInWishlist = wishlistItems.some((i) => i.productId === product.id);

  const handleCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { setShowAuth(true); return; }
    dispatch(addToCart({
      productId: product.id, name: product.name, slug: product.slug,
      image: img, price, originalPrice: product.originalPrice,
      quantity: 1, stock: product.stock,
    }));
    toast.success('Added to cart!');
    if (token && token.length > 10) {
      dispatch(addToCartAsync({ productId: product.id, quantity: 1, token })).catch(() => {});
    }
  }, [dispatch, product, isAuthenticated, token, img, price]);

  const handleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { setShowAuth(true); return; }
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.success('Removed from wishlist');
      if (token) dispatch(removeFromWishlistAsync({ productId: product.id, token })).catch(() => {});
    } else {
      dispatch(addToWishlist({ productId: product.id, name: product.name, slug: product.slug, image: img, price, originalPrice: product.originalPrice, stock: product.stock }));
      toast.success('Added to wishlist!');
      if (token) dispatch(addToWishlistAsync({ productId: product.id, token })).catch(() => {});
    }
  }, [dispatch, product, isAuthenticated, token, isInWishlist, img, price]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
      <Link href={`/products/${product.slug}`}>
        <div className="group flex gap-0 bg-white border border-gray-100 hover:border-[#B76E79]/20 hover:shadow-sm transition-all duration-300 overflow-hidden">
          {/* Image — fixed width */}
          <div className="relative w-52 sm:w-64 flex-shrink-0 aspect-square overflow-hidden bg-[#F8F6F2]">
            <Image
              src={img} alt={product.name} fill sizes="256px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized={img.startsWith('data:')}
            />
            {discount > 0 && (
              <div className="absolute top-3 left-3 text-white text-[10px] font-semibold px-2 py-0.5 tracking-widest uppercase" style={{ backgroundColor: '#B76E79' }}>
                -{discount}%
              </div>
            )}
            <div className="absolute top-3 right-3 text-white text-[10px] font-semibold px-2 py-0.5 tracking-widest uppercase border border-white/60" style={{ backgroundColor: '#B76E79' }}>
              New
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 p-6 flex flex-col justify-between">
            <div>
              {/* Category */}
              {product.category?.name && (
                <p className="text-[10px] font-elegant tracking-[0.2em] uppercase text-gray-400 mb-1">{product.category.name}</p>
              )}
              {/* Name */}
              <h3 className="font-fairplay text-lg text-[#1C1C1C] leading-snug mb-3 group-hover:text-[#B76E79] transition-colors line-clamp-2">
                {product.name}
              </h3>
              {/* Short description */}
              {product.shortDescription && (
                <p className="text-sm text-gray-500 font-light leading-relaxed line-clamp-3 mb-3">
                  {product.shortDescription}
                </p>
              )}
              {/* Rating */}
              {product.totalReviews > 0 && (
                <div className="flex items-center gap-1.5 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(product.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                  ))}
                  <span className="text-xs text-gray-400">({product.totalReviews})</span>
                </div>
              )}
            </div>

            <div>
              {/* Price */}
              <div className="flex items-end gap-2 mb-4">
                <span className="text-xl font-medium text-[#1C1C1C]">{formatPrice(price)}</span>
                {product.specialPrice && (
                  <span className="text-sm text-gray-400 line-through font-light">{formatPrice(product.originalPrice)}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCart}
                  disabled={product.stock === 0}
                  className="flex items-center gap-2 text-white text-xs font-elegant tracking-[0.15em] uppercase px-5 py-2.5 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#B76E79' }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleWishlist}
                  className="p-2.5 border border-gray-200 hover:border-[#B76E79] transition-colors"
                  title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
      </motion.div>
      {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />}
    </>
  );
}

export function ProductGrid({ products, viewMode = '4col' }: ProductGridProps) {
  if (!products || products.length === 0) return null;

  // 1col = horizontal list card (image left + details right)
  if (viewMode === '1col') {
    return (
      <div className="flex flex-col gap-4">
        {products.map((product) => (
          <ListRowCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  // list = compact text list (old behavior kept as fallback)
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {products.map((product) => (
          <ListRowCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={GRID_CLASSES[viewMode as keyof typeof GRID_CLASSES]}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07 } },
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </motion.div>
  );
}
