'use client';

import { ShoppingCart } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCartDrawerOpen } from '@/store/slices/uiSlice';
import { Button } from '@/components/ui/button';

export function CartButton() {
  const dispatch = useAppDispatch();
  const { itemCount } = useAppSelector((state) => state.cart);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => dispatch(setCartDrawerOpen(true))}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Button>
  );
}
