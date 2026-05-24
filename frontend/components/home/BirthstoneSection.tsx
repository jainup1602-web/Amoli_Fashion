'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { FadeInSection } from '@/components/common/FadeInSection';

interface Stat {
  number: string;
  label: string;
}

interface BirthstoneData {
  subtitle: string;
  title: string;
  description: string;
  quote: string;
  buttonText: string;
  buttonLink: string;
  mainImage: string;
  smallImage: string;
  stats: Stat[];
}

const defaultData: BirthstoneData = {
  subtitle: "Born To Shine, Crafted To Last",
  title: "A Gem For Every Birthday, A Story For Every Stone",
  description: "Discover our handcrafted jewellery collection — made with premium copper and stainless steel, nickel-free and skin-friendly. Each piece is designed to celebrate your unique story.",
  quote: "\"Crafted with love, worn with pride — jewellery that tells your story.\"",
  buttonText: "Shop Now",
  buttonLink: "/products",
  mainImage: "/image/Amoli_1.png",
  smallImage: "",
  stats: [
    { number: '100+', label: 'Unique Designs' },
    { number: '250+', label: 'Products' },
    { number: '2K+', label: 'Reviews' },
    { number: '100K', label: 'Happy Customers' },
  ],
};

// Parse number string like "100+", "2K+", "100K" → numeric value + suffix
function parseNumber(str: string): { value: number; suffix: string } {
  const clean = str.trim();
  // Match: optional digits, optional K/M, optional +
  const match = clean.match(/^(\d+(?:\.\d+)?)(K|M|k|m)?(\+?)$/);
  if (!match) return { value: 0, suffix: clean };
  let value = parseFloat(match[1]);
  const multiplier = match[2]?.toUpperCase();
  const plus = match[3] || '';
  if (multiplier === 'K') value = value * 1000;
  if (multiplier === 'M') value = value * 1000000;
  return { value, suffix: (multiplier ? multiplier : '') + plus };
}

// Format display: 100000 → "100K", 2000 → "2K", 250 → "250"
function formatDisplay(current: number, target: number, suffix: string): string {
  if (target >= 1000) {
    const k = Math.round(current / 1000);
    return `${k}K${suffix.replace('K', '')}`;
  }
  return `${Math.round(current)}${suffix}`;
}

function AnimatedStat({ number, label, animate }: { number: string; label: string; animate: boolean }) {
  const { value: target, suffix } = parseNumber(number);
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const duration = 1800; // ms

  useEffect(() => {
    if (!animate) return;
    if (target === 0) { setCurrent(0); return; }

    startRef.current = null;
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [animate, target]);

  const display = target === 0 ? number : formatDisplay(current, target, suffix);

  return (
    <div
      className="flex flex-col items-center text-center py-3 sm:py-4 px-1 rounded-xl transition-all hover:scale-105"
      style={{ backgroundColor: '#EFE8DF' }}
    >
      <p className="text-base sm:text-xl font-playfair text-[#1A1A1A] leading-none mb-1 tabular-nums">
        {display}
      </p>
      <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium leading-tight">{label}</p>
    </div>
  );
}

export function BirthstoneSection() {
  const [data, setData] = useState<BirthstoneData>(defaultData);
  const [animateStats, setAnimateStats] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.settings?.birthstone_section) {
          const s = json.settings.birthstone_section;
          setData({
            ...defaultData,
            ...s,
            smallImage: s.smallImage?.includes('Amoli') ? '' : (s.smallImage || ''),
            description: s.description?.toLowerCase().includes('vestibulum') ? defaultData.description : (s.description || defaultData.description),
            quote: s.quote?.toLowerCase().includes('maecenas') ? defaultData.quote : (s.quote || defaultData.quote),
          });
        }
      })
      .catch(() => {});
  }, []);

  // Trigger count-up when stats section enters viewport
  useEffect(() => {
    if (animateStats) return; // already triggered, don't re-observe
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimateStats(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [data, animateStats]); // re-run after data loads so statsRef is attached

  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden" style={{ backgroundColor: '#FCF9F6' }}>

      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -right-20 top-0 w-72 h-72 rounded-full opacity-[0.04]" style={{ backgroundColor: '#C9A96E' }} />
        <div className="absolute -left-10 bottom-0 w-48 h-48 rounded-full opacity-[0.04]" style={{ backgroundColor: '#B76E79' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16 items-center">

          {/* ── Left: Image ── */}
          <FadeInSection direction="left" className="w-full lg:w-[45%] flex-shrink-0">
            <div className="relative mx-auto lg:mx-0" style={{ maxWidth: '340px' }}>

              {/* Offset background box */}
              <div
                className="absolute inset-0 translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4 rounded-2xl"
                style={{ backgroundColor: '#EFE8DF' }}
              />

              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#EFE8DF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.mainImage || '/image/Amoli_1.png'}
                  alt="Amoli Jewellery"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = '/image/Amoli_1.png'; }}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Floating badge */}
              <div
                className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-white z-10"
                style={{ backgroundColor: '#4E3421' }}
              >
                <Star className="w-4 h-4 text-[#C9A96E] mb-0.5" fill="#C9A96E" />
                <span className="text-white text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase leading-tight text-center">
                  Premium<br />Quality
                </span>
              </div>
            </div>
          </FadeInSection>

          {/* ── Right: Content ── */}
          <FadeInSection direction="right" delay={0.1} className="w-full lg:w-[55%] flex flex-col mt-6 lg:mt-0">

            {/* Subtitle */}
            <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8a7560] font-elegant mb-3">
              {data.subtitle}
            </p>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair text-[#1A1A1A] leading-[1.2] mb-4 sm:mb-5">
              {data.title}
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed mb-6 font-light max-w-lg">
              {data.description}
            </p>

            {/* Stats grid */}
            {data.stats?.length > 0 && (
              <div ref={statsRef} className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
                {data.stats.map((stat, idx) => (
                  <AnimatedStat
                    key={idx}
                    number={stat.number}
                    label={stat.label}
                    animate={animateStats}
                  />
                ))}
              </div>
            )}

            {/* Quote */}
            {data.quote && (
              <p className="text-xs sm:text-sm italic text-gray-400 mb-6 font-serif border-l-2 border-[#C9A96E] pl-3 leading-relaxed">
                {data.quote}
              </p>
            )}

            {/* CTA Button */}
            {data.buttonText && data.buttonLink && (
              <Link href={data.buttonLink}>
                <button
                  className="inline-flex items-center gap-2.5 px-6 py-3 text-white text-xs tracking-[0.2em] uppercase font-semibold rounded-none transition-all duration-300 hover:gap-4 group"
                  style={{ backgroundColor: '#4E3421' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#322010')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#4E3421')}
                >
                  {data.buttonText}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Link>
            )}
          </FadeInSection>

        </div>
      </div>
    </section>
  );
}
