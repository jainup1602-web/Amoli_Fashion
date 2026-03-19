import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || '100');

export function rateLimit(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const now = Date.now();
  const key = `${ip}`;

  if (!store[key] || now > store[key].resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    return { allowed: true };
  }

  store[key].count++;

  if (store[key].count > MAX_REQUESTS) {
    return { 
      allowed: false, 
      error: 'Too many requests', 
      status: 429,
      retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
    };
  }

  return { allowed: true };
}

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  });
}, 3600000);
