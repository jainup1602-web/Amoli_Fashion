'use client';

import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addToCartAsync, addToCart } from '@/store/slices/cartSlice';
import { addToWishlistAsync, removeFromWishlistAsync, addToWishlist, removeFromWishlist } from '@/store/slices/wishlistSlice';
import { AuthModal } from '@/components/auth/AuthModal';
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
  const [showAuthModal, setShowAuthModal] = useState(false);

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

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

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

    // Add to local cart first for immediate feedback
    dispatch(addToCart(cartItem));
    toast.success('Added to cart!');
    setIsAddingToCart(false);

    // Try server sync in background
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
      dispatch(addToCartAsync({ 
        productId: product.id, 
        quantity: 1, 
        token
      })).catch(() => {
        // Silently ignore server sync failures
      });
    }
  }, [dispatch, product, isAuthenticated]);

  const handleToggleWishlist = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

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

    // Update local wishlist first for immediate feedback
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(wishlistItem));
      toast.success('Added to wishlist!');
    }

    // Try server sync in background
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
      if (isInWishlist) {
        dispatch(removeFromWishlistAsync({ productId: product.id, token })).catch(() => {
          // Silently ignore server sync failures
        });
      } else {
        dispatch(addToWishlistAsync({ productId: product.id, token })).catch(() => {
          // Silently ignore server sync failures
        });
      }
    }
  }, [dispatch, isInWishlist, product, isAuthenticated]);

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
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-4 left-4 z-10 text-white px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase shadow-md" style={{ backgroundColor: '#043927' }}>
              SAVE {discountPercent}%
            </div>
          )}

          {/* Wishlist Button - Only for authenticated users - Animated from right */}
          {isAuthenticated && (
            <button
              onClick={handleToggleWishlist}
              className="absolute top-4 right-4 z-10 p-2 transition-all duration-300 transform translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group/wishlist"
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={`h-5 w-5 transition-all drop-shadow-md ${
                  isInWishlist 
                    ? 'text-red-500 fill-red-500' 
                    : 'text-white group-hover/wishlist:fill-red-500'
                }`}
              />
            </button>
          )}

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

            {/* Quick Add to Cart Overlay - Animated with opacity */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAddingToCart}
                className="text-white rounded-none border-none tracking-[0.1em] uppercase text-xs w-full py-4 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                style={{ backgroundColor: '#043927' }}
                aria-label={product.stock === 0 ? 'Out of stock' : 'Add to cart'}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock === 0 ? 'Exhausted' : isAddingToCart ? 'Adding...' : isAuthenticated ? 'Add to Bag' : 'Login to Add'}
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="px-3 pt-2 pb-3 text-center relative z-20" style={{ backgroundColor: '#F8F6F2' }}>
            <h3 className="font-fairplay text-base line-clamp-2 mb-1 group-hover:text-gold transition-colors leading-snug text-black">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-center justify-center space-x-2 mb-1">
              <span className="text-base font-medium text-black tracking-wide">
                {formatPrice(finalPrice)}
              </span>
              {product.specialPrice && (
                <span className="text-sm text-gray-400 line-through font-light">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            {product.stock === 0 ? (
              <p className="text-[10px] text-red-800 font-elegant uppercase tracking-[0.2em]">Waitlist Available</p>
            ) : product.stock < 10 ? (
              <p className="text-[10px] text-gold font-elegant uppercase tracking-[0.2em]">
                Limited Availability
              </p>
            ) : (
              <p className="text-[10px] text-gray-500 font-elegant uppercase tracking-[0.2em]">Available</p>
            )}
          </div>
        </div>
      </Link>
      </motion.div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
    </>
  );
}

export const ProductCard = memo(ProductCardComponent);
