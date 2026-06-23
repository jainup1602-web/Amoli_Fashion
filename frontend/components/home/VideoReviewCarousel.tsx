'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function VideoCard({ review }: { review: any }) {
  return (
    <div
      className="flex-shrink-0 relative overflow-hidden select-none group"
      style={{
        width: 'clamp(160px, 55vw, 240px)',
        height: 'clamp(260px, 48vw, 420px)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}
    >
      <video
        src={review.videoUrl}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pt-16 pb-4 px-4">
        {review.customerName && (
          <p className="text-white text-sm font-semibold leading-tight">{review.customerName}</p>
        )}
        {review.title && (
          <p className="text-white/75 text-xs mt-0.5 leading-tight">{review.title}</p>
        )}
        <div className="flex items-center gap-1 mt-2">
          {[1,2,3,4,5].map(s => (
            <div key={s} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1A1A1A' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function VideoReviewCarousel({ reviews }: { reviews: any[] }) {
  const [dragging, setDragging] = useState(false);
  const [dimensions, setDimensions] = useState({ cardW: 300, viewW: 1200 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        cardW: Math.min(window.innerWidth * 0.8, 300),
        viewW: window.innerWidth
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (reviews.length === 0) return null;

  const gap = 12;
  const totalW = reviews.length * (dimensions.cardW + gap) - gap;

  return (
    <div className="w-full overflow-hidden">
      <motion.div
        className="flex"
        style={{
          gap,
          paddingLeft: 16,
          paddingRight: 16,
          cursor: dragging ? 'grabbing' : 'grab',
        }}
        drag="x"
        dragConstraints={{ right: 0, left: -(totalW - dimensions.viewW + 32) }}
        dragElastic={0.08}
        onDragStart={() => setDragging(true)}
        onDragEnd={() => setTimeout(() => setDragging(false), 100)}
        transition={{ type: 'spring', stiffness: 300, damping: 40 }}
      >
        {reviews.map((review) => (
          <VideoCard key={review.id} review={review} />
        ))}
      </motion.div>
    </div>
  );
}
