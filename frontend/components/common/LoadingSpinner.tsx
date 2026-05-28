'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 40,
    md: 60,
    lg: 90,
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* Outer rotating elegant ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-[#1A1A1A]/20 border-t-[#1A1A1A]"
          style={{ width: currentSize + 16, height: currentSize + 16, margin: -8 }}
        />
        
        {/* Inner pulsing logo */}
        <motion.div
          animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex items-center justify-center bg-white rounded-full shadow-sm overflow-hidden"
          style={{ width: currentSize, height: currentSize }}
        >
          {/* Using standard img for instant loading on splash screen */}
          <img
            src="/image/Amoli_2.png"
            alt="Loading..."
            className="object-contain w-full h-full p-2.5 opacity-90"
          />
        </motion.div>
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#FDFCF0]">
      <div className="text-center flex flex-col items-center">
        <LoadingSpinner size="lg" />
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mt-8 text-[11px] tracking-[0.35em] uppercase font-medium text-[#1A1A1A]/70"
        >
          Experience Elegance
        </motion.p>
      </div>
    </div>
  );
}
