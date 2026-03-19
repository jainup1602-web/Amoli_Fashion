'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { removeFromWishlist } from '@/store/slices/wishlistSlice';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="text-center p-16 border border-gold/20 shadow-sm max-w-lg w-full" style={{ backgroundColor: '#F8F6F2' }}>
          <Heart className="h-16 w-16 mx-auto mb-6" strokeWidth={1} style={{ color: '#043927' }} />
          <h2 className="text-3xl font-fairplay text-[#1C1C1C] mb-4">Login Required</h2>
          <p className="text-gray-500 font-light tracking-wide mb-8">Please login to view your wishlist.</p>
          <Button
            className="text-white rounded-none border-none tracking-[0.2em] uppercase text-xs px-10 py-6 transition-luxury"
            style={{ backgroundColor: '#043927' }}
            onClick={() => window.dispatchEvent(new CustomEvent('openLoginModal'))}
          >
            Login to Continue
          </Button>
        </div>
      </div>
    );
  }

  const handleRemoveFromWishlist = (productId: string) => {
    dispatch(removeFromWishlist(productId));
    toast.success('Removed from wishlist');
  };

  const moveToCart = (item: any) => {
    dispatch(addToCart({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: item.price,
      originalPrice: item.originalPrice,
      quantity: 1,
      stock: item.stock || 100,
    }));
    handleRemoveFromWishlist(item.productId);
    
    toast.success('Moved to cart!');
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="text-center p-16 border border-gold/20 shadow-sm max-w-lg w-full" style={{ backgroundColor: '#F8F6F2' }}>
          <Heart className="h-16 w-16 mx-auto mb-6" strokeWidth={1} style={{ color: '#043927' }} />
          <h2 className="text-3xl font-fairplay text-[#1C1C1C] mb-4">Your Wishlist is Empty</h2>
          <p className="text-gray-500 font-light tracking-wide mb-8">Save items you love for later shopping.</p>
          <Button asChild className="text-white rounded-none border-none tracking-[0.2em] uppercase text-xs px-10 py-6 transition-luxury" style={{ backgroundColor: '#043927' }}>
            <Link href="/products">Explore Collections</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16" style={{ backgroundColor: '#F8F6F2' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-gold tracking-[0.2em] text-sm uppercase mb-4 block font-elegant">Your Favorites</span>
          <h1 className="text-4xl md:text-5xl font-fairplay text-[#1C1C1C]">Wishlist</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={`wishlist-item-${item.productId}`} className="group border border-gold/10 overflow-hidden transition-luxury hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gold/30" style={{ backgroundColor: '#F8F6F2' }}>
              <Link href={`/products/${item.slug}`}>
                <div className="relative aspect-square" style={{ backgroundColor: '#F8F6F2' }}>
                  {/* Primary image */}
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className={`object-cover transition-all duration-700 ease-out ${item.hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
                    unoptimized={item.image?.startsWith('data:') || item.image?.startsWith('http')}
                  />
                  {/* Hover image — if available */}
                  {item.hoverImage && (
                    <Image
                      src={item.hoverImage}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100"
                      unoptimized={item.hoverImage?.startsWith('data:') || item.hoverImage?.startsWith('http')}
                    />
                  )}
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/products/${item.slug}`}>
                  <h3 className="font-fairplay text-base text-[#1C1C1C] line-clamp-2 hover:text-gold transition-colors mb-3 min-h-[2.5rem] leading-snug">
                    {item.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-center space-x-2 mb-4">
                  <span className="text-base font-medium text-[#1C1C1C] tracking-wide">
                    {formatPrice(item.price)}
                  </span>
                  {item.price < item.originalPrice && (
                    <span className="text-sm text-gray-400 line-through font-light">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 text-white rounded-none border-none tracking-[0.1em] uppercase text-xs py-3 transition-luxury"
                    style={{ backgroundColor: '#043927' }}
                    onClick={() => moveToCart(item)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Move to Bag
                  </Button>
                  <Button
                    variant="outline"
                    className="p-3 border-gray-300 text-gray-500 hover:bg-red-50 hover:border-red-400 hover:text-red-500 rounded-none transition-colors"
                    onClick={() => handleRemoveFromWishlist(item.productId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
