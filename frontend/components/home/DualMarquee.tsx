'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface MarqueeItem {
  id: string;
  text: string;
  categoryId?: string;
  filterSlug?: string;
  hoverImage?: string;
  row: number;
  order: number;
  isActive?: boolean;
}

interface DualMarqueeProps {
  items: MarqueeItem[];
  title?: string;
  subtitle?: string;
}

export function DualMarquee({ items, title, subtitle }: DualMarqueeProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const row1Items = items.filter(item => item.row === 1 && item.isActive !== false).sort((a, b) => a.order - b.order);
  const row2Items = items.filter(item => item.row === 2 && item.isActive !== false).sort((a, b) => a.order - b.order);

  // Duplicate items for seamless loop
  const duplicatedRow1 = [...row1Items, ...row1Items, ...row1Items];
  const duplicatedRow2 = [...row2Items, ...row2Items, ...row2Items];

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const getItemLink = (item: MarqueeItem) => {
    if (item.filterSlug) return `/products?category=${item.filterSlug}`;
    if (item.categoryId) return `/products?category=${item.categoryId}`;
    return '/products';
  };

  const hoveredItemData = items.find(item => item.id === hoveredItem);

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden py-16 select-none"
      style={{ backgroundColor: '#F8F6F2' }}
      onMouseMove={handleMouseMove}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center mb-12 px-4">
          {subtitle && (
            <p className="text-xs tracking-[0.3em] uppercase mb-2 font-elegant" style={{ color: '#B76E79' }}>
              {subtitle}
            </p>
          )}
          {title && (
            <h2 className="text-3xl md:text-4xl font-fairplay text-[#1C1C1C] tracking-wide">
              {title}
            </h2>
          )}
        </div>
      )}

      {/* Row 1 - Right to Left */}
      <div className="relative mb-8 overflow-hidden">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{
            x: isPaused ? undefined : [0, -100 / 3 + '%'],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 60,
              ease: 'linear',
            },
          }}
          style={{ width: 'fit-content', willChange: 'transform' }}
        >
          {duplicatedRow1.map((item, index) => (
            <Link
              key={`${item.id}-${index}`}
              href={getItemLink(item)}
              className="inline-flex items-center gap-4 group cursor-pointer"
              onMouseEnter={() => {
                setHoveredItem(item.id);
                setIsPaused(true);
              }}
              onMouseLeave={() => {
                setHoveredItem(null);
                setIsPaused(false);
              }}
            >
              <span 
                className="text-2xl md:text-3xl lg:text-4xl font-fairplay transition-all duration-300 group-hover:scale-105 px-6 py-3 rounded-full border-2"
                style={{ 
                  color: hoveredItem === item.id ? '#B76E79' : '#1C1C1C',
                  borderColor: hoveredItem === item.id ? '#B76E79' : '#D4AF37',
                  backgroundColor: hoveredItem === item.id ? 'rgba(183, 110, 121, 0.05)' : 'rgba(212, 175, 55, 0.03)',
                  textShadow: hoveredItem === item.id ? '0 0 20px rgba(183, 110, 121, 0.3)' : 'none',
                }}
              >
                {item.text}
              </span>
              <span className="text-2xl" style={{ color: '#B76E79' }}>✦</span>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Row 2 - Left to Right */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{
            x: isPaused ? undefined : [-100 / 3 + '%', 0],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 60,
              ease: 'linear',
            },
          }}
          style={{ width: 'fit-content', willChange: 'transform' }}
        >
          {duplicatedRow2.map((item, index) => (
            <Link
              key={`${item.id}-${index}`}
              href={getItemLink(item)}
              className="inline-flex items-center gap-4 group cursor-pointer"
              onMouseEnter={() => {
                setHoveredItem(item.id);
                setIsPaused(true);
              }}
              onMouseLeave={() => {
                setHoveredItem(null);
                setIsPaused(false);
              }}
            >
              <span 
                className="text-2xl md:text-3xl lg:text-4xl font-fairplay transition-all duration-300 group-hover:scale-105 px-6 py-3 rounded-full border-2"
                style={{ 
                  color: hoveredItem === item.id ? '#B76E79' : '#1C1C1C',
                  borderColor: hoveredItem === item.id ? '#B76E79' : '#D4AF37',
                  backgroundColor: hoveredItem === item.id ? 'rgba(183, 110, 121, 0.05)' : 'rgba(212, 175, 55, 0.03)',
                  textShadow: hoveredItem === item.id ? '0 0 20px rgba(183, 110, 121, 0.3)' : 'none',
                }}
              >
                {item.text}
              </span>
              <span className="text-2xl" style={{ color: '#B76E79' }}>✦</span>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Cursor-following hover image */}
      {hoveredItem && hoveredItemData?.hoverImage && (
        <motion.div
          className="fixed pointer-events-none z-50"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <div 
            className="relative -translate-x-1/2 -translate-y-1/2 shadow-2xl overflow-hidden"
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '8px',
              border: '2px solid #B76E79',
            }}
          >
            <Image
              src={hoveredItemData.hoverImage}
              alt={hoveredItemData.text}
              fill
              className="object-cover"
              unoptimized={hoveredItemData.hoverImage.startsWith('http')}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
