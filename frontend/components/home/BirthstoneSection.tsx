'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight as ArrowRight } from 'lucide-react';

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
  description: "Vestibulum Vehicula Nunc Ad Fringilla Pretium Ex Ac Praesent Vitae. Conubia Egestas Porta Per Maximus Sem Congue! Vulputate Tristique Interdum Consectetur Mollis Nulla Etiam Quam Lacinia Molestie. Class A Vestibulum Amet Iaculis Auctor Facilisis. Diam Facilisis Nascetur Morbi Consequat Primis Proin Lacus. Erat Urna Taciti Luctus Vel Bibendum Porta.",
  quote: "\"Maecenas Porta Id Nibh Quis Imperdiet. Quisque Hendrerit, Justo Egestas Fermentum Pulvinar\"",
  buttonText: "Shop Now",
  buttonLink: "/products",
  mainImage: "https://images.unsplash.com/photo-1599643478524-fb66f70d00a8?q=80&w=800&auto=format&fit=crop",
  smallImage: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop",
  stats: [
    { number: '100', label: 'Worldwide Branch' },
    { number: '250+', label: 'Products Designs' },
    { number: '2K', label: 'Products Reviews' },
    { number: '100K', label: 'Happy Customers' }
  ]
};

export function BirthstoneSection() {
  const [data, setData] = useState<BirthstoneData>(defaultData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success && json.settings?.birthstone_section) {
          setData(json.settings.birthstone_section);
        }
      } catch (error) {
        console.error('Failed to fetch birthstone section settings:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden" style={{ backgroundColor: '#FCF9F6' }}>
      {/* Decorative leaf background (Right) */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-[0.03] pointer-events-none overflow-hidden">
        <svg viewBox="0 0 200 400" className="w-full h-full object-cover">
          <path d="M100,0 C150,100 200,150 150,300 C100,450 50,200 100,0 Z" fill="currentColor" />
          <path d="M100,50 Q180,100 120,200" stroke="currentColor" fill="none" strokeWidth="2" />
          <path d="M100,100 Q150,150 100,250" stroke="currentColor" fill="none" strokeWidth="2" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          
          {/* Left Column - Image with Arch */}
          <div className="w-full lg:w-1/2 relative pl-4 sm:pl-8">
            {/* Outline Box */}
            <div className="absolute top-10 left-0 right-10 bottom-[-20px] border border-white z-0 hidden sm:block" style={{ backgroundColor: 'transparent', boxShadow: '0 0 0 1px rgba(255,255,255,0.5)' }}></div>
            
            {/* Arch Image Container */}
            <div 
              className="relative z-10 w-[85%] max-w-[420px] mx-auto lg:mx-0 aspect-[3/4] overflow-hidden bg-gray-200" 
              style={{ borderTopLeftRadius: '250px', borderTopRightRadius: '250px' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={data.mainImage} 
                alt="Model"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Circular Know More Button */}
            <div className="absolute bottom-10 right-4 lg:right-10 z-30">
               <div className="w-24 h-24 sm:w-[110px] sm:h-[110px] rounded-full bg-[#FCF9F6] border-4 border-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300">
                  <span className="text-center text-[10px] sm:text-[11px] text-[#1A1A1A] uppercase tracking-widest font-serif leading-tight">Know<br/>More</span>
               </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="w-full lg:w-1/2 flex flex-col pt-8 lg:pt-0 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="pr-4">
                <p className="text-[10px] tracking-[0.25em] uppercase text-gray-500 mb-4 font-elegant">{data.subtitle}</p>
                <h2 className="text-4xl sm:text-5xl lg:text-5xl font-serif text-[#1A1A1A] leading-[1.15] max-w-sm">
                  {data.title}
                </h2>
              </div>
              <div 
                className="hidden sm:block w-32 h-40 shrink-0 bg-gray-200 overflow-hidden ml-4"
                style={{ borderTopLeftRadius: '100px', borderTopRightRadius: '100px' }}
              >
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img 
                    src={data.smallImage} 
                    alt="Details" 
                    className="w-full h-full object-cover" 
                 />
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-gray-500 leading-[1.8] mb-8 max-w-xl font-light">
              {data.description}
            </p>

            {/* Stats */}
            {data.stats && data.stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {data.stats.map((stat, idx) => (
                  <div key={idx} className="bg-[#EFE8DF] px-2 py-5 text-center rounded-sm transition-all hover:bg-[#EAE0D4]">
                     <p className="text-xl sm:text-2xl font-serif text-[#1A1A1A] mb-1.5">{stat.number}</p>
                     <p className="text-[9px] sm:text-[10px] tracking-wide text-gray-700 capitalize font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            {data.quote && (
              <p className="text-xs italic text-gray-500 mb-8 font-serif">
                {data.quote}
              </p>
            )}

            {data.buttonText && data.buttonLink && (
              <div>
                <Link href={data.buttonLink}>
                  <button className="bg-[#4E3421] text-white px-7 py-3 text-[11px] tracking-widest uppercase flex items-center gap-3 hover:bg-[#322010] transition-colors group">
                    {data.buttonText}
                    <span className="bg-white text-[#4E3421] rounded-full p-0.5 group-hover:translate-x-1 transition-transform">
                       <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
