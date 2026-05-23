'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadCart } from '@/store/slices/cartSlice';
import { loadWishlist } from '@/store/slices/wishlistSlice';
import { GlobalErrorSuppressor } from '@/components/utils/GlobalErrorSuppressor';

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Always load cart and wishlist from localStorage on app start
    dispatch(loadCart());
    dispatch(loadWishlist());
  }, [dispatch]);

  // Register Service Worker for offline support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[SW] Registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[SW] Registration failed:', err);
        });
    }
  }, []);

  return (
    <>
      <GlobalErrorSuppressor />
      {children}
    </>
  );
}