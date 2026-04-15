'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { loadCart } from '../slices/cartSlice';
import { loadWishlist } from '../slices/wishlistSlice';
import { initAuthStateListener } from '@/lib/auth-utils';
import { fetchSettings } from '../slices/settingsSlice';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load cart from localStorage on app mount
    store.dispatch(loadCart());
    
    // Load wishlist from localStorage on app mount
    store.dispatch(loadWishlist());
    
    // Fetch settings on app mount
    store.dispatch(fetchSettings());
    
    // Initialize auth state listener
    initAuthStateListener();
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
