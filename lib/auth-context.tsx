'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { syncCartWithServer } from '@/store/slices/cartSlice';
import { syncWishlistWithServer } from '@/store/slices/wishlistSlice';
import { setUser as setReduxUser, logout } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store/store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  userName: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  userName: '',
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    console.log('🚀 AuthProvider: Component mounted');
    
    if (!auth) {
      console.warn('⚠️ AuthProvider: Firebase not initialized');
      setError('Firebase not initialized');
      setLoading(false);
      return;
    }

    console.log('🔥 AuthProvider: Setting up listener');
    
    try {
      // Listen to auth state changes
      const unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          console.log('🔄 AuthProvider: Auth changed:', firebaseUser ? 'Logged in' : 'Logged out');
          
          // Check if user was manually logged out (check every time auth state changes)
          const wasLoggedOut = localStorage.getItem('manualLogout') === 'true';
          console.log('🔍 Manual logout flag:', wasLoggedOut);
          
          if (firebaseUser && !wasLoggedOut) {
            console.log('👤 User:', firebaseUser.email, firebaseUser.displayName);
            
            // Clear manual logout flag since user is now logged in
            localStorage.removeItem('manualLogout');
            
            // Refresh token silently in background to keep session alive
            try {
              const token = await firebaseUser.getIdToken(false);
              
              // Store token in localStorage for API calls
              localStorage.setItem('token', token);
              
              // Fetch user profile and update Redux state
              try {
                const response = await fetch('/api/auth/profile', {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                  const data = await response.json();
                  // Update Redux auth state
                  dispatch(setReduxUser({ user: data.user, token }));
                  console.log('✅ Redux auth state updated');
                } else {
                  console.warn('⚠️ Failed to fetch user profile');
                }
              } catch (profileError) {
                console.error('❌ Profile fetch error:', profileError);
              }
              
              // Sync cart and wishlist with server after login
              console.log('🛒 Syncing cart with server...');
              dispatch(syncCartWithServer(token));
              
              console.log('❤️ Syncing wishlist with server...');
              dispatch(syncWishlistWithServer(token));
            } catch (err) {
              console.error('Token refresh error:', err);
            }
          } else if (firebaseUser && wasLoggedOut) {
            // User was manually logged out but Firebase still has session
            console.log('🚫 User was manually logged out, signing out from Firebase...');
            const { signOut } = await import('firebase/auth');
            await signOut(auth);
            return;
          } else {
            // User logged out - clear Redux state, localStorage, and sessionStorage
            console.log('👋 User logged out - clearing auth state');
            localStorage.removeItem('token');
            localStorage.removeItem('manualLogout'); // Clear the logout flag
            sessionStorage.removeItem('offerPopupShown'); // Clear popup session storage
            dispatch(logout());
          }
          
          setUser(firebaseUser);
          setLoading(false);
          setError(null);
        }, 
        (err) => {
          console.error('❌ AuthProvider: Error in listener:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      // Set up token refresh interval (every 45 minutes)
      const tokenRefreshInterval = setInterval(async () => {
        if (!auth) return;
        const currentUser = auth.currentUser;
        if (currentUser) {
          try {
            console.log('🔄 Refreshing auth token...');
            const newToken = await currentUser.getIdToken(true);
            // Update token in localStorage
            localStorage.setItem('token', newToken);
            console.log('✅ Token refreshed successfully');
          } catch (err) {
            console.error('❌ Token refresh failed:', err);
          }
        }
      }, 45 * 60 * 1000); // 45 minutes

      return () => {
        console.log('🧹 AuthProvider: Cleanup');
        unsubscribe();
        clearInterval(tokenRefreshInterval);
      };
    } catch (err: any) {
      console.error('❌ AuthProvider: Setup error:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [dispatch]);

  const isAuthenticated = !!user;
  const userName = user?.displayName || user?.email || user?.phoneNumber || 'User';

  if (error) {
    console.error('🔴 AuthProvider has error:', error);
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, userName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
