'use client';

import React from 'react';
import { Gift, Gem, Heart, Sparkles } from 'lucide-react';
import { FadeInSection } from '@/components/common/FadeInSection';

const services = [
  {
    icon: Gift,
    title: 'Gift Collection',
    description: 'Curated jewellery sets crafted for every special occasion and celebration.',
    accent: '#C9A96E',
  },
  {
    icon: Gem,
    title: 'Premium Jewellery',
    description: 'Handpicked designs in copper & stainless steel — skin-friendly and long-lasting.',
    accent: '#B76E79',
  },
  {
    icon: Heart,
    title: 'Wedding Collection',
    description: 'Timeless bridal pieces that complement every look on your most precious day.',
    accent: '#C9A96E',
  },
  {
    icon: Sparkles,
    title: 'New Arrivals',
    description: 'Fresh styles added every week — stay ahead with the latest trends in fashion jewellery.',
    accent: '#B76E79',
  },
];

export const ServicesSection = () => {
  return (
    <section
      className="py-10 sm:py-14 md:py-16 w-full border-t border-b border-[#e8dccf]"
      style={{ backgroundColor: '#F3E9DD' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section label */}
        <FadeInSection direction="up">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8a7560] font-elegant">
              Why Choose Amoli
            </p>
          </div>
        </FadeInSection>

        {/* Grid — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e0d4c4]">
          {services.map(({ icon: Icon, title, description, accent }, i) => (
            <FadeInSection key={title} direction="up" delay={i * 0.08}>
              <div
                className="flex flex-col items-center text-center px-4 sm:px-6 py-7 sm:py-10 group cursor-pointer transition-all duration-300 hover:bg-[#ede3d8] h-full"
                style={{ backgroundColor: '#F3E9DD' }}
              >
                {/* Icon circle */}
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-4 sm:mb-5 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110 flex-shrink-0"
                  style={{ backgroundColor: `${accent}18`, border: `1.5px solid ${accent}40` }}
                >
                  <Icon
                    className="w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300"
                    style={{ color: accent }}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-playfair text-[#1A1A1A] tracking-wide mb-2 leading-snug">
                  {title}
                </h3>

                {/* Description */}
                <p className="text-[11px] sm:text-xs text-[#7a6a58] leading-relaxed font-light max-w-[160px] sm:max-w-none">
                  {description}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>

      </div>
    </section>
  );
};
