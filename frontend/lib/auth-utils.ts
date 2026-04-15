import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { store } from '@/store/store';
import { setUser, logout } from '@/store/slices/authSlice';

// Auth state listener
let authStateInitialized = false;
let currentUser: User | null = null;

export function initAuthStateListener() {
  if (authStateInitialized || !auth) return;
  
  authStateInitialized = true;
  
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    
    if (user) {
      // Silently refresh token to keep session alive
      try {
        const token = await user.getIdToken(false);
        
        // Fetch user profile from MongoDB
        const response = await fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          // Update Redux state with user data
          store.dispatch(setUser({ user: data.user, token }));
          console.log('✅ Redux state updated with user:', data.user.displayName || data.user.email);
        }
      } catch (error) {
        console.error('Token refresh error:', error);
      }
    } else {
      // User logged out - clear Redux state
      store.dispatch(logout());
      console.log('👋 User logged out - Redux state cleared');
    }
  });
}

export function getCurrentAuthUser(): User | null {
  return currentUser;
}

// Auto-refresh token every 45 minutes
if (typeof window !== 'undefined' && auth) {
  setInterval(async () => {
    if (!auth) return;
    const user = auth.currentUser;
    if (user) {
      try {
        await user.getIdToken(true);
        console.log('🔄 Token auto-refreshed');
      } catch (error) {
        console.error('❌ Token auto-refresh failed:', error);
      }
    }
  }, 45 * 60 * 1000); // 45 minutes
}
