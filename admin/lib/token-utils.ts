// Utility functions for token validation

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Token validation error:', error);
    return true; // Treat invalid tokens as expired
  }
}

export function getTokenPayload(token: string): any | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
}

export function validateToken(token: string): { valid: boolean; expired: boolean; payload: any | null } {
  if (!token) {
    return { valid: false, expired: true, payload: null };
  }

  const payload = getTokenPayload(token);
  if (!payload) {
    return { valid: false, expired: true, payload: null };
  }

  const expired = payload.exp * 1000 < Date.now();
  return { valid: true, expired, payload };
}