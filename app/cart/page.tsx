'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
export default function CartPage() {
  const { items, total } = useSelector((state: RootState) => state.cart);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="text-center p-16 border border-gold/20 shadow-sm max-w-lg w-full" style={{ backgroundColor: '#F8F6F2' }}>
          <ShoppingCart className="h-16 w-16 mx-auto mb-6" strokeWidth={1} style={{ color: '#B76E79' }} />
          <h2 className="text-3xl font-fairplay text-[#1C1C1C] mb-4">Your Shopping Bag is Empty</h2>
          <p className="text-gray-500 font-light tracking-wide mb-8">Discover our latest collections to find something special.</p>
          <Button asChild className="text-white rounded-none border-none tracking-[0.2em] uppercase text-xs px-10 py-6 transition-luxury" style={{ backgroundColor: '#B76E79' }}>
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
          <span className="text-gold tracking-[0.2em] text-sm uppercase mb-4 block font-elegant">Your Selection</span>
          <h1 className="text-4xl md:text-5xl font-fairplay text-[#1C1C1C]">Shopping Bag</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: any) => (
              <CartItem key={`cart-item-${item.productId}`} item={item} />
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
