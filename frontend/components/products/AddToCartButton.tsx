'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface AddToCartButtonProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    images: string[];
    originalPrice: number;
    specialPrice?: number;
    stock: number;
  };
  quantity?: number;
  disabled?: boolean;
}

export function AddToCartButton({ 
  product, 
  quantity = 1, 
  disabled = false 
}: AddToCartButtonProps) {
  const dispatch = useAppDispatch();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const finalPrice = product.specialPrice || product.originalPrice;
      const imageUrl = product.images && product.images[0] 
        ? product.images[0]
        : '/placeholder.svg';

      dispatch(addToCart({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        image: imageUrl,
        price: finalPrice,
        originalPrice: product.originalPrice,
        quantity,
        stock: product.stock,
      }));
      
      toast.success('Added to cart successfully!');
    } catch (error: any) {
      toast.error(error || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isAdding || product.stock === 0}
      className="w-full"
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isAdding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
    </Button>
  );
}
