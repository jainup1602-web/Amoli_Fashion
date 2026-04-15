import { auth } from './firebase';

// Token cache to avoid unnecessary refreshes
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getAuthToken(forceRefresh: boolean = false): Promise<string | null> {
  try {
    const user = auth?.currentUser;
    if (!user) {
      console.error('No user logged in');
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
}
