'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items } = useSelector((state: RootState) => state.cart);

  useEffect(() => { setMounted(true); }, []);

  // Prevent hydration mismatch — render nothing until client is ready
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#B76E79' }} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="text-center p-10 sm:p-16 border border-gold/20 shadow-sm max-w-lg w-full" style={{ backgroundColor: '#F8F6F2' }}>
          <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-5 sm:mb-6" strokeWidth={1} style={{ color: '#B76E79' }} />
          <h2 className="text-2xl sm:text-3xl font-fairplay text-[#1C1C1C] mb-3 sm:mb-4">Your Shopping Bag is Empty</h2>
          <p className="text-gray-500 font-light tracking-wide mb-6 sm:mb-8 text-sm">Discover our latest collections to find something special.</p>
          <Button asChild className="text-white rounded-none border-none tracking-[0.15em] uppercase text-xs px-8 py-3 transition-luxury" style={{ backgroundColor: '#B76E79' }}>
            <Link href="/products">Explore Collections</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-16" style={{ backgroundColor: '#F8F6F2' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-12">
          <span className="text-gold tracking-[0.2em] text-xs sm:text-sm uppercase mb-2 sm:mb-4 block font-elegant">Your Selection</span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-fairplay text-[#1C1C1C]">Shopping Bag</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item: any) => (
              <CartItem key={`cart-item-${item.productId}`} item={item} />
            ))}
          </div>
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
