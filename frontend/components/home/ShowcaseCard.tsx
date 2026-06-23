'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function ShowcaseCard({ showcase, tall, index = 0 }: { showcase: any; tall?: boolean; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-full w-full"
    >
      <Link
        href={showcase.link || '/products'}
        className={`group relative overflow-hidden block w-full h-full rounded-[14px] shadow-sm ${tall ? 'min-h-[220px] sm:min-h-[320px] md:min-h-[420px]' : 'min-h-[160px] sm:min-h-[200px] md:min-h-[240px]'}`}
      >
        <div className="absolute inset-0 bg-[#FDFCF0]">
          <Image
            src={showcase.image || '/placeholder.svg'}
            alt={showcase.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain transition-transform duration-[2s] ease-out group-hover:scale-[1.03]"
            unoptimized={showcase.image?.startsWith('data:') || showcase.image?.startsWith('http')}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-75 group-hover:opacity-90 transition-opacity duration-700" />

        <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 z-10 w-full max-w-lg">
          {showcase.subtitle && (
            <p className="text-[10px] sm:text-[11px] tracking-[0.35em] uppercase font-elegant text-white/85 mb-3 transform transition-transform duration-500 group-hover:-translate-y-1">
              {showcase.subtitle}
            </p>
          )}
          
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-playfair text-white leading-[1.1] mb-2 drop-shadow-sm transform transition-transform duration-500 group-hover:-translate-y-1">
            {showcase.title}
          </h3>

          <div className="flex items-center gap-3 overflow-hidden mt-4 h-6">
             <div className="flex items-center gap-3 transform -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-[0.25,0.46,0.45,0.94]">
               <div className="w-8 h-[1px] bg-white/70" />
               <span className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase font-elegant text-white font-medium">Explore Collection</span>
               <ArrowRight className="h-3.5 w-3.5 text-white" />
             </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
