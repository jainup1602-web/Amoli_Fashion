'use client';

import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addToCartAsync, addToCart } from '@/store/slices/cartSlice';
import { addToWishlistAsync, removeFromWishlistAsync, addToWishlist, removeFromWishlist } from '@/store/slices/wishlistSlice';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    originalPrice: number;
    specialPrice?: number;
    averageRating: number;
    totalReviews: number;
    stock: number;
  };
}

function ProductCardComponent({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const finalPrice = product.specialPrice || product.originalPrice;
  const discountPercent = product.specialPrice
    ? Math.round(((product.originalPrice - product.specialPrice) / product.originalPrice) * 100)
    : 0;

  const imageUrl = product.images?.[0] || '/placeholder.svg';
  const hoverImageUrl = product.images?.[1] || null;

  // Check if product is in wishlist
  const isInWishlist = wishlistItems.some((item) => item.productId === product.id);

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAddingToCart(true);

    const cartItem = {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || '/placeholder.svg',
      price: product.specialPrice || product.originalPrice,
      originalPrice: product.originalPrice,
      quantity: 1,
      stock: product.stock,
    };

    dispatch(addToCart(cartItem));
    toast.success('Added to cart!');
    setIsAddingToCart(false);

    // Try server sync in background only if logged in
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
      dispatch(addToCartAsync({ productId: product.id, quantity: 1, token })).catch(() => {});
    }
  }, [dispatch, product]);

  const handleToggleWishlist = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const wishlistItem = {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || '/placeholder.svg',
      hoverImage: product.images?.[1] || undefined,
      price: product.specialPrice || product.originalPrice,
      originalPrice: product.originalPrice,
      stock: product.stock,
    };

    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(wishlistItem));
      toast.success('Added to wishlist!');
    }

    // Try server sync in background only if logged in
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
      if (isInWishlist) {
        dispatch(removeFromWishlistAsync({ productId: product.id, token })).catch(() => {});
      } else {
        dispatch(addToWishlistAsync({ productId: product.id, token })).catch(() => {});
      }
    }
  }, [dispatch, isInWishlist, product]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ y: -4 }}
      >
      <Link href={`/products/${product.slug}`}>
        <div className="group relative overflow-hidden transition-luxury hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gold/10 hover:border-gold/30" style={{ backgroundColor: '#F8F6F2' }}>

          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: '#F8F6F2' }}>
            {/* Primary image */}
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-all duration-700 ease-out ${hoverImageUrl ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
              unoptimized={imageUrl.startsWith('data:') || imageUrl.startsWith('http')}
              loading="lazy"
            />
            {/* Hover image */}
            {hoverImageUrl && (
              <Image
                src={hoverImageUrl}
                alt={`${product.name} alternate`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100"
                unoptimized={hoverImageUrl.startsWith('data:') || hoverImageUrl.startsWith('http')}
              />
            )}

            {/* Wishlist - bottom left */}
            <button
              onClick={handleToggleWishlist}
              className="absolute bottom-1.5 left-1.5 z-10 rounded-full flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-105 w-7 h-7 sm:w-8 sm:h-8"
              style={{ backgroundColor: isInWishlist ? '#B76E79' : 'rgba(255,255,255,0.92)' }}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0"
                style={{ color: isInWishlist ? '#fff' : '#B76E79', fill: isInWishlist ? '#fff' : 'none' }}
              />
            </button>

            {/* Add to Cart - bottom right */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart}
              className="absolute bottom-1.5 right-1.5 z-10 rounded-full flex items-center justify-center gap-1 shadow-md disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 sm:px-3 sm:py-1.5"
              style={{ backgroundColor: '#B76E79' }}
              aria-label={product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            >
              <ShoppingCart className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-white flex-shrink-0" />
              <span className="text-white font-semibold tracking-wide whitespace-nowrap text-[7px] sm:text-[9px]">
                {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
              </span>
            </button>
          </div>

          {/* Product Info */}
          <div className="px-2 sm:px-3 pt-2 pb-2.5 text-center relative z-20" style={{ backgroundColor: '#F8F6F2' }}>
            {/* Product Name */}
            <h3 className="font-fairplay text-sm sm:text-[15px] line-clamp-1 leading-snug text-[#1C1C1C] group-hover:text-[#B76E79] transition-colors duration-200 mb-1">
              {product.name}
            </h3>

            {/* Price Row */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-[#1C1C1C] tracking-wide">
                {formatPrice(finalPrice)}
              </span>
              {product.specialPrice && (
                <>
                  <span className="text-xs sm:text-sm text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span
                    className="font-elegant italic font-bold"
                    style={{ color: '#B76E79', fontSize: '12px', letterSpacing: '0.03em' }}
                  >
                    ({discountPercent}%)
                  </span>
                </>
              )}
            </div>

            {/* Only show Waitlist / Limited — no "Available" */}
            {product.stock === 0 ? (
              <p className="text-[9px] text-red-600 font-elegant uppercase tracking-[0.15em] mt-1">Waitlist</p>
            ) : product.stock < 10 ? (
              <p className="text-[9px] font-elegant uppercase tracking-[0.15em] mt-1" style={{ color: '#B76E79' }}>Only {product.stock} left</p>
            ) : null}
          </div>
        </div>
      </Link>
      </motion.div>

      {/* Auth Modal removed - no longer needed for cart/wishlist */}
    </>
  );
}

export const ProductCard = memo(ProductCardComponent);
