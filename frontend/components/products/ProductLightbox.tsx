'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ProductLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductLightbox({ images, initialIndex, isOpen, onClose }: ProductLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setScale(1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
        setScale(1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setScale(1);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setScale(1);
    }
  };

  const handleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragging) return;
    // Limit zoom to 2.5x
    setScale(scale === 1 ? 2.5 : 1);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
        onClick={onClose} // Clicking outside closes
      >
        {/* Controls */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-[110] p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          title="Close (Esc)"
        >
          <X className="w-6 h-6" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-[110] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full disabled:opacity-20 transition-all"
              title="Previous (Left Arrow)"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === images.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-[110] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full disabled:opacity-20 transition-all"
              title="Next (Right Arrow)"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        {/* Zoom Info Indicator */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/70 text-sm tracking-widest uppercase z-[110] pointer-events-none flex items-center gap-2">
          {scale > 1 ? (
            <><ZoomOut className="w-4 h-4" /> Click to zoom out</>
          ) : (
            <><ZoomIn className="w-4 h-4" /> Click to zoom</>
          )}
        </div>

        {/* Image Container */}
        <div 
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
        >
          <motion.div
            drag={scale > 1}
            dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setTimeout(() => setIsDragging(false), 150)}
            animate={{ scale }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-[85vw] h-[85vh]"
            onClick={handleZoom}
            style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
          >
            <Image
              src={images[currentIndex]}
              alt={`Product image ${currentIndex + 1}`}
              fill
              className="object-contain pointer-events-none"
              sizes="100vw"
              priority
              unoptimized={images[currentIndex]?.startsWith('data:')}
            />
          </motion.div>
        </div>
        
        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[110] bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
          {images.map((_, idx) => (
            <button
              key={idx}
              className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/40 w-2 hover:bg-white/80'}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
                setScale(1);
              }}
              title={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
