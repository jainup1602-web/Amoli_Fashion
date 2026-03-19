import { getAuthToken } from './firebase-client';

/**
 * Get auth token for admin API calls
 * Uses cached token to avoid unnecessary refreshes
 */
export async function getAdminAuthToken(): Promise<string | null> {
  try {
    // Use cached token (won't force refresh unless expired)
    const token = await getAuthToken(false);
    
    if (!token) {
      console.error('No auth token available');
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Error getting admin auth token:', error);
    return null;
  }
}

/**
 * Make authenticated API call to admin endpoint
 */
export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAdminAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
  };
  
  // Add existing headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }
  
  // Add Content-Type for JSON body
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}
