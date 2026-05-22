import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Token cache to avoid unnecessary refreshes
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Promise that resolves once Firebase auth state is initialized
let authReady: Promise<void> | null = null;

function waitForAuth(): Promise<void> {
  if (!auth) return Promise.resolve();
  
  if (!authReady) {
    authReady = new Promise<void>((resolve) => {
      // If currentUser is already set, resolve immediately
      if (auth!.currentUser) {
        resolve();
        return;
      }
      
      // Otherwise wait for the first onAuthStateChanged callback
      const unsubscribe = onAuthStateChanged(auth!, () => {
        unsubscribe();
        resolve();
      });
      
      // Safety timeout — don't block forever if user is truly logged out
      setTimeout(() => resolve(), 5000);
    });
  }
  
  return authReady;
}

export async function getAuthToken(forceRefresh: boolean = false): Promise<string | null> {
  try {
    // Wait for Firebase to finish restoring session from IndexedDB
    await waitForAuth();
    
    const user = auth?.currentUser;
    if (!user) {
      console.warn('getAuthToken: No user logged in after auth ready');
      cachedToken = null;
      tokenExpiry = 0;
      return null;
    }
    
    // Check if cached token is still valid (expires in 55 minutes, we refresh at 50)
    const now = Date.now();
    if (!forceRefresh && cachedToken && tokenExpiry > now) {
      return cachedToken;
    }
    
    // Get fresh token
    const token = await user.getIdToken(forceRefresh);
    
    // Cache token for 50 minutes (Firebase tokens expire in 1 hour)
    cachedToken = token;
    tokenExpiry = now + (50 * 60 * 1000);
    
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    cachedToken = null;
    tokenExpiry = 0;
    return null;
  }
}

export function getCurrentUser() {
  return auth?.currentUser;
}

export function clearTokenCache() {
  cachedToken = null;
  tokenExpiry = 0;
  authReady = null;
}
