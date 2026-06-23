'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ModelGallerySlider({ models }: { models: any[] }) {
  const [active, setActive] = useState(0);
  const total = models.length;
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const startAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setActive(p => (p + 1) % total), 3500);
  };

  useEffect(() => {
    startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const prev = () => { setActive(p => (p - 1 + total) % total); startAuto(); };
  const next = () => { setActive(p => (p + 1) % total); startAuto(); };

  const getStyle = (index: number): React.CSSProperties => {
    const diff = ((index - active) % total + total) % total;
    const d = diff > total / 2 ? diff - total : diff; // -2 -1 0 1 2

    if (d === 0) return {
      transform: 'translateX(0%) translateZ(80px) rotateY(0deg) scale(1.1)',
      zIndex: 10, opacity: 1,
      boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.4)'
    };
    if (Math.abs(d) === 1) return {
      transform: `translateX(${d * 75}%) translateZ(-80px) rotateY(${d * -20}deg) scale(0.85)`,
      zIndex: 7, opacity: 0.95,
      boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.3)',
      filter: 'brightness(0.8)'
    };
    if (Math.abs(d) === 2) return {
      transform: `translateX(${d * 135}%) translateZ(-200px) rotateY(${d * -35}deg) scale(0.65)`,
      zIndex: 4, opacity: 0.8,
      boxShadow: '0 10px 25px -15px rgba(0, 0, 0, 0.2)',
      filter: 'brightness(0.5)'
    };
    return { transform: `translateX(${d * 200}%) translateZ(-400px) scale(0.4)`, zIndex: 0, opacity: 0 };
  };

  if (total === 0) return null;

  return (
    <div className="w-full py-20 overflow-hidden relative" style={{ backgroundColor: '#F9F8F6' }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[65%] bg-[#f1ede8] -skew-y-2 z-0 opacity-70" />

      <div className="relative z-10">
        <div className="text-center mb-16">
          <p className="text-xs sm:text-sm tracking-[0.4em] uppercase text-[#1A1A1A] font-elegant drop-shadow-sm mb-4">The Signature Edit</p>
          <h2 className="text-3xl md:text-4xl font-playfair text-[#1C1C1C] tracking-wide">Curated Masterpieces</h2>
        </div>

        <div 
          className="relative flex items-center justify-center w-full max-w-[1600px] mx-auto h-[400px] md:h-[500px] lg:h-[650px]" 
          style={{ perspective: '1600px' }}
          onTouchStart={(e) => { touchStartX.current = e.targetTouches[0].clientX; }}
          onTouchMove={(e) => { touchEndX.current = e.targetTouches[0].clientX; }}
          onTouchEnd={() => {
            if (!touchStartX.current || !touchEndX.current) return;
            const distance = touchStartX.current - touchEndX.current;
            if (distance > 50) next();
            if (distance < -50) prev();
            touchStartX.current = 0;
            touchEndX.current = 0;
          }}
        >
          <button onClick={prev} className="absolute left-2 sm:left-10 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 bg-white/90 hover:bg-white flex items-center justify-center transition-all text-[#1A1A1A] shadow-lg hover:scale-110">
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          {models.map((model, index) => {
            const diff = ((index - active) % total + total) % total;
            const d = diff > total / 2 ? diff - total : diff;
            if (Math.abs(d) > 2) return null; 
            return (
              <div
                key={model.id}
                onClick={() => { if (d !== 0) { setActive(index); startAuto(); } }}
                className="absolute top-0 bottom-0 flex items-center justify-center"
                style={{
                  width: 'clamp(260px, 45vw, 550px)',
                  height: '100%',
                  transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  cursor: d === 0 ? 'default' : 'pointer',
                  transformOrigin: '50% 50%',
                  ...getStyle(index)
                }}
              >
                <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-white group">
                  <Image
                    src={model.image || '/placeholder.svg'}
                    alt={model.modelName}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    unoptimized={model.image?.startsWith('data:') || model.image?.startsWith('http')}
                  />
                  
                  {d === 0 && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-24 pb-8 px-6 sm:px-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="text-white/80 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-elegant mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">{model.modelName}</p>
                      <h3 className="text-white text-xl sm:text-3xl font-playfair leading-snug mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-150">{model.description}</h3>
                      {model.category && (
                        <Link href={`/products?category=${model.category}`} className="inline-block mt-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-200">
                           <span className="text-white text-xs font-medium uppercase tracking-[0.15em] border-b border-white pb-1 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors">Shop the Look</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <button onClick={next} className="absolute right-2 sm:right-10 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 bg-white/90 hover:bg-white flex items-center justify-center transition-all text-[#1A1A1A] shadow-lg hover:scale-110">
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        <div className="flex justify-center mt-12 gap-2">
          {models.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setActive(idx); startAuto(); }}
              className={`h-1 rounded-full transition-all duration-300 ${active === idx ? 'w-8 bg-[#1A1A1A]' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
