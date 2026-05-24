'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInSectionProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;       // seconds
  duration?: number;    // seconds
  threshold?: number;   // 0–1
  className?: string;
  once?: boolean;       // animate only once (default true)
}

const offsets: Record<Direction, { x: number; y: number }> = {
  up:    { x: 0,   y: 24  },
  down:  { x: 0,   y: -24 },
  left:  { x: 32,  y: 0   },
  right: { x: -32, y: 0   },
  none:  { x: 0,   y: 0   },
};

export function FadeInSection({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  threshold = 0.15,
  className,
  once = true,
}: FadeInSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const { x, y } = offsets[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x, y }}
      animate={visible ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x, y }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
}
