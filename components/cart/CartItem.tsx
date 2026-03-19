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
    <div className="bg-gray-50 border border-gold/10 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:border-gold/30 transition-luxury shadow-sm relative">
      <div className="flex items-center gap-6 flex-1 w-full">
        {/* Product Image */}
        <Link href={`/products/${item.slug}`} className="flex-shrink-0">
          <div className="relative w-24 h-24 md:w-32 md:h-32 bg-[#FDFBF7] border border-gold/10">
            <Image
              src={imageSrc}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 96px, 128px"
              className="object-cover rounded"
              onError={() => setImageError(true)}
              unoptimized={imageSrc.startsWith('data:') || imageSrc.startsWith('http')}
            />
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/products/${item.slug}`}>
            <h3 className="font-serif text-lg text-[#1C1C1C] hover:text-gold transition-colors line-clamp-2 leading-relaxed">
              {item.name}
            </h3>
          </Link>
          <div className="flex items-center mt-2 space-x-3">
            <p className="text-md font-medium text-[#1C1C1C]">
              {formatPrice(item.price)}
            </p>
            {item.price < item.originalPrice && (
              <p className="text-xs text-gray-400 line-through font-light">
                {formatPrice(item.originalPrice)}
              </p>
            )}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center border border-gold/30">
          <button
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="px-3 py-2 text-gold hover:bg-gold hover:text-white transition-colors disabled:opacity-50"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-10 text-center text-sm font-medium text-[#1C1C1C]">{item.quantity}</span>
          <button
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
            disabled={item.quantity >= item.stock}
            className="px-3 py-2 text-gold hover:bg-gold hover:text-white transition-colors disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Subtotal View Desktop */}
        <div className="hidden sm:block text-right min-w-[100px] ml-4">
          <p className="text-md font-medium text-[#1C1C1C] tracking-wide">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-700 transition-colors"
        aria-label="Remove item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
