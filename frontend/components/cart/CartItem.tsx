'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart } from '@/store/slices/cartSlice';
import { showConfirm } from '@/lib/confirm';
import { alertSuccess } from '@/lib/alert';

interface CartItemProps {
  item: {
    productId: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    originalPrice: number;
    quantity: number;
    stock: number;
  };
}

export function CartItem({ item }: CartItemProps) {
  const dispatch = useDispatch();
  const [imageError, setImageError] = useState(false);

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= item.stock) {
      dispatch(updateQuantity({ productId: item.productId, quantity: newQuantity }));
    }
  };

  const handleRemove = async () => {
    const confirmed = await showConfirm({
      title: 'Remove Item',
      message: `Remove "${item.name}" from your cart?`,
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      dispatch(removeFromCart(item.productId));
      alertSuccess('Item removed from cart');
    }
  };

  const imageSrc = imageError || !item.image ? '/placeholder.svg' : item.image;

  return (
    <div className="bg-gray-50 border border-gold/10 p-3 sm:p-6 group hover:border-gold/30 transition-luxury shadow-sm relative">
      <div className="flex items-center gap-3 sm:gap-6 w-full">
        {/* Product Image */}
        <Link href={`/products/${item.slug}`} className="flex-shrink-0">
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-[#FDFBF7] border border-gold/10">
            <Image
              src={imageSrc}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 64px, (max-width: 768px) 96px, 112px"
              className="object-cover rounded"
              onError={() => setImageError(true)}
              unoptimized={imageSrc.startsWith('data:') || imageSrc.startsWith('http')}
            />
          </div>
        </Link>

        {/* Product Info + Controls */}
        <div className="flex-1 min-w-0 pr-6">
          {/* Name */}
          <Link href={`/products/${item.slug}`}>
            <h3 className="font-serif text-sm sm:text-base md:text-lg text-[#1C1C1C] hover:text-gold transition-colors line-clamp-2 leading-snug">
              {item.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-center mt-1 sm:mt-2 gap-2">
            <p className="text-sm sm:text-base font-medium text-[#1C1C1C]">
              {formatPrice(item.price)}
            </p>
            {item.price < item.originalPrice && (
              <p className="text-xs text-gray-400 line-through font-light">
                {formatPrice(item.originalPrice)}
              </p>
            )}
          </div>

          {/* Quantity + Subtotal row */}
          <div className="flex items-center gap-3 sm:gap-6 mt-2 sm:mt-3">
            {/* Quantity Controls */}
            <div className="flex items-center border border-gold/30">
              <button
                onClick={() => handleUpdateQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-gold hover:bg-gold hover:text-white transition-colors disabled:opacity-50"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 sm:w-10 text-center text-sm font-medium text-[#1C1C1C]">{item.quantity}</span>
              <button
                onClick={() => handleUpdateQuantity(item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-gold hover:bg-gold hover:text-white transition-colors disabled:opacity-50"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Subtotal */}
            <p className="text-sm sm:text-base font-medium text-[#1C1C1C] tracking-wide">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-red-700 transition-colors"
        aria-label="Remove item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
