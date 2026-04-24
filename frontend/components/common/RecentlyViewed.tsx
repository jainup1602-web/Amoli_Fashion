'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/products/ProductCard';
import { getRecentlyViewed } from '@/hooks/useRecentlyViewed';

interface RecentlyViewedSectionProps {
  currentId: string;
}

export function RecentlyViewedSection({ currentId }: RecentlyViewedSectionProps) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const ids = getRecentlyViewed().filter(id => id !== currentId).slice(0, 6);
    if (ids.length === 0) return;

    // Fetch product details for each id
    Promise.all(
      ids.map(id =>
        fetch(`/api/products?search=${id}&limit=1`)
          .then(r => r.json())
          .catch(() => null)
      )
    ).then(results => {
      // Better: fetch by slug won't work, use a batch approach
      // Fetch all and filter
      fetch(`/api/products?limit=100`)
        .then(r => r.json())
        .then(data => {
          const all = data.products || [];
          const viewed = ids
            .map(id => all.find((p: any) => p.id === id))
            .filter(Boolean);
          setProducts(viewed);
        })
        .catch(() => {});
    });
  }, [currentId]);

  if (products.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div className="inline-block text-white px-4 py-1.5 sm:px-6 sm:py-2" style={{ backgroundColor: '#1C1C1C' }}>
          <h2 className="text-sm sm:text-lg font-fairplay text-white tracking-wide">Recently Viewed</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
