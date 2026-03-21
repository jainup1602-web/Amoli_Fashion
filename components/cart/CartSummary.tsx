'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { alertSuccess, alertError, alertWarning } from '@/lib/alert';

export function CartSummary() {
  const { items, total } = useSelector((state: RootState) => state.cart);
  const { settings } = useSelector((state: RootState) => state.settings);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplying, setIsApplying] = useState(false);

  const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const freeShippingThreshold = settings?.freeShippingThreshold || 500;
  const shippingCharge = settings?.shippingCharge || 50;
  const shipping = subtotal > freeShippingThreshold ? 0 : shippingCharge;
  const taxEnabled = (settings as any)?.taxEnabled ?? false;
  const taxRate = (settings as any)?.taxRate ?? 0;
  const taxLabel = (settings as any)?.taxLabel || 'GST';
  const taxableAmount = subtotal - discount;
  const tax = taxEnabled ? Math.round((taxableAmount * taxRate) / 100 * 100) / 100 : 0;
  const finalTotal = taxableAmount + shipping + tax;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      alertWarning('Please enter a coupon code');
      return;
    }

    setIsApplying(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });

      const data = await res.json();

      if (data.success) {
        setDiscount(data.discountAmount);
        alertSuccess(`Coupon applied! You saved ${formatPrice(data.discountAmount)}`);
      } else {
        alertError(data.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      alertError('Failed to apply coupon');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gold/10 p-8 shadow-sm font-light sticky top-24 z-10">
      <h2 className="text-2xl font-serif text-[#1C1C1C] mb-6 border-b border-gold/20 pb-4">Order Summary</h2>

      {/* Coupon Input */}
      <div className="mb-6">
        <label className="block text-xs font-elegant tracking-widest uppercase text-gray-500 mb-3">
          Complimentary Code
        </label>
        <div className="flex gap-0 border border-gold/30">
          <Input
            placeholder="Enter code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            disabled={isApplying}
            className="border-none rounded-none focus-visible:ring-0 shadow-none px-4"
          />
          <Button
            variant="outline"
            onClick={handleApplyCoupon}
            disabled={isApplying}
            className="rounded-none border-none border-l border-gold/30 text-gold hover:bg-gold hover:text-white transition-luxury px-6 font-elegant tracking-widest uppercase text-xs"
          >
            {isApplying ? 'Applying' : 'Apply'}
          </Button>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-[#1C1C1C]">
          <span className="font-light">Subtotal <span className="text-gray-400 text-xs">({items.length} pieces)</span></span>
          <span className="font-medium tracking-wide">{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm text-[#1C1C1C]">
          <span className="font-light">Delivery</span>
          <span className="font-medium tracking-wide">
            {shipping === 0 ? (
              <span className="text-gold text-xs font-elegant tracking-widest uppercase">Complimentary</span>
            ) : (
              formatPrice(shipping)
            )}
          </span>
        </div>

        {subtotal < 500 && (
          <p className="text-xs text-gray-500 font-light italic mt-1">
            Add {formatPrice(500 - subtotal)} more for complimentary delivery.
          </p>
        )}

        {taxEnabled && tax > 0 && (
          <div className="flex justify-between text-sm text-[#1C1C1C]">
            <span className="font-light">{taxLabel} ({taxRate}%)</span>
            <span className="font-medium tracking-wide">{formatPrice(tax)}</span>
          </div>
        )}

        <div className="flex justify-between text-xl font-serif text-[#1C1C1C] border-t border-gold/20 pt-6 mt-6">
          <span>Total</span>
          <span className="tracking-wide">{formatPrice(finalTotal)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        className="w-full mt-8 text-white rounded-none border-none tracking-[0.2em] uppercase text-xs h-14"
        style={{ backgroundColor: '#B76E79' }}
        asChild
      >
        <Link href="/checkout">Proceed to Checkout</Link>
      </Button>

      <Button
        variant="outline"
        className="w-full mt-3 rounded-none border-gray-300 text-[#1C1C1C] hover:text-white hover:border-[#B76E79] transition-colors tracking-[0.1em] uppercase text-xs h-11"
        style={{}}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#B76E79')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
        asChild
      >
        <Link href="/products">Continue Shopping</Link>
      </Button>
    </div>
  );
}
