'use client';

import { useEffect } from 'react';

const KEY = 'amoli_recently_viewed';
const MAX = 8;

export function useRecentlyViewed(productId?: string) {
  useEffect(() => {
    if (!productId) return;
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || '[]') as string[];
      const updated = [productId, ...stored.filter(id => id !== productId)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(updated));
    } catch {}
  }, [productId]);
}

export function getRecentlyViewed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}
