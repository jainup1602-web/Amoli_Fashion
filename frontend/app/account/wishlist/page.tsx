'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { removeFromWishlist } from '@/store/slices/wishlistSlice';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  useEffect(() => { setMounted(true); }, []);

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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#B76E79' }} />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="text-center p-16 border border-gold/20 shadow-sm max-w-lg w-full" style={{ backgroundColor: '#F8F6F2' }}>
          <Heart className="h-16 w-16 mx-auto mb-6" strokeWidth={1} style={{ color: '#B76E79' }} />
          <h2 className="text-3xl font-fairplay text-[#1C1C1C] mb-4">Your Wishlist is Empty</h2>
          <p className="text-gray-500 font-light tracking-wide mb-8">Save items you love for later shopping.</p>
          <Button asChild className="text-white rounded-none border-none tracking-[0.15em] uppercase text-xs px-8 py-3 transition-luxury" style={{ backgroundColor: '#B76E79' }}>
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

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
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

              <div className="p-2 sm:p-4">
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

                <div className="flex gap-1.5 items-stretch">
                  <Button
                    className="flex-1 text-white rounded-none border-none tracking-[0.05em] uppercase text-[10px] py-2 transition-luxury min-w-0"
                    style={{ backgroundColor: '#B76E79' }}
                    onClick={() => moveToCart(item)}
                  >
                    <ShoppingCart className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Move to Bag</span>
                  </Button>
                  <button
                    className="flex-shrink-0 w-8 border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-400 hover:text-red-500 transition-colors flex items-center justify-center"
                    onClick={() => handleRemoveFromWishlist(item.productId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
