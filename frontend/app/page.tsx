'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { Truck, Package, RefreshCw, Phone, ChevronLeft, ChevronRight, ChevronRight as ArrowRight, Star, SlidersHorizontal, X } from 'lucide-react';
import { OfferPopup } from '@/components/common/OfferPopup';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  originalPrice: number;
  specialPrice?: number;
  discountPercentage: number;
  averageRating: number;
  totalReviews: number;
  isFeatured: boolean;
  stock: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  order: number;
  isActive: boolean;
}

const defaultBanners: Banner[] = [];

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders above',
    dynamic: 'freeShippingThreshold',
  },
  {
    icon: Package,
    title: 'Secure Payment',
    description: '100% secure transactions',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: 'return policy',
    dynamic: 'returnPolicyDays',
  },
  {
    icon: Phone,
    title: '24/7 Support',
    description: 'Dedicated customer service',
  },
];

// Single video card — autoplay, muted, with overlay info
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
        poster={review.thumbnailUrl || undefined}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pt-16 pb-4 px-4">
        {review.customerName && (
          <p className="text-white text-sm font-semibold leading-tight">{review.customerName}</p>
        )}
        {review.title && (
          <p className="text-white/75 text-xs mt-0.5 leading-tight">{review.title}</p>
        )}
        {/* Rose gold dot accent */}
        <div className="flex items-center gap-1 mt-2">
          {[1,2,3,4,5].map(s => (
            <div key={s} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#B76E79' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Video Review Carousel — snap scroll on mobile, drag on desktop
function VideoReviewCarousel({ reviews }: { reviews: any[] }) {
  const [dragging, setDragging] = useState(false);

  if (reviews.length === 0) return null;

  const cardW = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.8, 300) : 300;
  const gap = 12;
  const totalW = reviews.length * (cardW + gap) - gap;
  const viewW = typeof window !== 'undefined' ? window.innerWidth : 1200;

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
        dragConstraints={{ right: 0, left: -(totalW - viewW + 32) }}
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

// Model Gallery Slider — 3D coverflow, center card upright, sides tilted inward
function ModelGallerySlider({ models }: { models: any[] }) {
  const [active, setActive] = useState(0);
  const total = models.length;
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Compute each card's visual position relative to active
  const getStyle = (index: number): React.CSSProperties => {
    const diff = ((index - active) % total + total) % total;
    const d = diff > total / 2 ? diff - total : diff; // -2 -1 0 1 2

    if (d === 0) return {
      transform: 'translateX(0px) translateZ(0px) rotateY(0deg) scale(1)',
      zIndex: 10, opacity: 1,
    };
    if (Math.abs(d) === 1) return {
      transform: `translateX(${d * 280}px) translateZ(-80px) rotateY(${d * -30}deg) scale(0.82)`,
      zIndex: 7, opacity: 1,
    };
    if (Math.abs(d) === 2) return {
      transform: `translateX(${d * 480}px) translateZ(-160px) rotateY(${d * -45}deg) scale(0.62)`,
      zIndex: 4, opacity: 0.85,
    };
    return { transform: `translateX(${d * 600}px) scale(0.3)`, zIndex: 0, opacity: 0 };
  };

  return (
    <div className="w-full py-12" style={{ backgroundColor: '#F8F6F2' }}>
      <p className="text-center text-xs tracking-[0.3em] uppercase text-gray-400 mb-10 font-elegant">For Every You</p>

      {/* Stage — overflow visible so ±2 cards show at edges */}
      <div className="relative flex items-center justify-center" style={{ height: 'clamp(460px, 72vh, 700px)', perspective: '1400px', overflow: 'visible' }}>

        {/* Left arrow */}
        <button onClick={prev}
          className="absolute left-4 sm:left-8 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-gray-200 shadow-md flex items-center justify-center transition-all"
          style={{ color: '#B76E79' }}>
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Cards */}
        {models.map((model, index) => {
          const diff = ((index - active) % total + total) % total;
          const d = diff > total / 2 ? diff - total : diff;
          if (Math.abs(d) > 2) return null;
          return (
            <div
              key={model.id}
              onClick={() => { if (d !== 0) { setActive(index); startAuto(); } }}
              className="absolute"
              style={{
                width: 'clamp(200px, 26vw, 360px)',
                height: 'clamp(340px, 60vh, 640px)',
                transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                cursor: d !== 0 ? 'pointer' : 'default',
                transformStyle: 'preserve-3d',
                ...getStyle(index),
              }}
            >
              <div className="w-full h-full relative overflow-hidden shadow-2xl" style={{ borderRadius: '2px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={model.image}
                  alt={model.modelName}
                  className="w-full h-full object-cover object-top"
                  draggable={false}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-12 pb-5 px-4">
                  <p className="text-white text-xs tracking-[0.25em] uppercase font-elegant text-center">
                    {model.category || model.modelName}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Right arrow */}
        <button onClick={next}
          className="absolute right-4 sm:right-8 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-gray-200 shadow-md flex items-center justify-center transition-all"
          style={{ color: '#B76E79' }}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-6 gap-2">
        {models.map((_, i) => (
          <button key={i} onClick={() => { setActive(i); startAuto(); }}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: active === i ? '28px' : '6px', backgroundColor: active === i ? '#B76E79' : '#d1d5db' }}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [banners, setBanners] = useState<Banner[]>(defaultBanners);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showcases, setShowcases] = useState<any[]>([]);
  const [videoReviews, setVideoReviews] = useState<any[]>([]);
  const [modelGallery, setModelGallery] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [brandLoading, setBrandLoading] = useState(true); // 3 sec branded loader

  // Category filter tabs for Top Styles
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [perPage, setPerPage] = useState<number>(12);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);

  // Create duplicated banners for infinite loop
  const duplicatedBanners = banners.length > 0 ? [...banners, ...banners, ...banners] : [];

  useEffect(() => {
    // Step 1: Show branded loader for exactly 3 seconds
    const brandTimer = setTimeout(() => setBrandLoading(false), 3000);
    // Step 2: Fetch data (skeleton shows after brand loader)
    const maxTimer = setTimeout(() => setPageLoading(false), 11000);
    fetchData().finally(() => clearTimeout(maxTimer));
    return () => { clearTimeout(brandTimer); clearTimeout(maxTimer); };
  }, []);

  useEffect(() => {
    // Auto-slide banner - continuous forward movement
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => prev + 1);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  // Handle infinite loop reset for banner
  useEffect(() => {
    if (currentSlide >= banners.length * 2) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(banners.length);
        setTimeout(() => {
          setIsTransitioning(true);
        }, 50);
      }, 700);
    }
  }, [currentSlide, banners.length]);

  const fetchData = async () => {
    const withTimeout = (promise: Promise<Response>, ms = 8000) =>
      Promise.race([promise, new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

    try {
      const [bannersRes, productsRes, categoriesRes, showcasesRes, videoReviewsRes, modelGalleryRes] = await Promise.all([
        withTimeout(fetch('/api/banners', { cache: 'no-store' })).catch(() => new Response('{}', { status: 500 })),
        withTimeout(fetch('/api/products?featured=true&limit=30')).catch(() => new Response('{}', { status: 500 })),
        withTimeout(fetch('/api/categories?limit=6')).catch(() => new Response('{}', { status: 500 })),
        withTimeout(fetch('/api/showcases')).catch(() => new Response('{}', { status: 500 })),
        withTimeout(fetch('/api/video-reviews?limit=10')).catch(() => new Response('{}', { status: 500 })),
        withTimeout(fetch('/api/model-gallery?limit=8')).catch(() => new Response('{}', { status: 500 })),
      ]);

      if (bannersRes.ok) {
        const data = await bannersRes.json();
        if (data.success && data.banners && data.banners.length > 0) {
          setBanners(data.banners);
        }
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        setFeaturedProducts(data.products || []);
        setFilteredProducts(data.products || []);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }

      if (showcasesRes.ok) {
        const data = await showcasesRes.json();
        if (data.success && data.showcases) {
          setShowcases(data.showcases);
        }
      }

      if (videoReviewsRes.ok) {
        const data = await videoReviewsRes.json();
        if (data.success && data.videoReviews) {
          setVideoReviews(data.videoReviews);
        }
      }

      if (modelGalleryRes.ok) {
        const data = await modelGalleryRes.json();
        if (data.success && data.models) {
          setModelGallery(data.models);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => prev + 1);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => prev - 1);
  };

  const handleTabChange = async (tab: string, categoryId?: string) => {
    setActiveTab(tab);
    setTabLoading(true);
    try {
      let url: string;
      if (tab === 'all') {
        url = `/api/products?featured=true&limit=30&sortBy=${sortBy === 'featured' ? 'createdAt' : sortBy}&sortOrder=${sortBy === 'price-asc' ? 'asc' : 'desc'}`;
      } else if (tab === 'best-sellers') {
        url = `/api/products?sortBy=salesCount&limit=30`;
      } else {
        url = `/api/products?category=${categoryId}&limit=30&sortBy=${sortBy === 'featured' ? 'createdAt' : sortBy}&sortOrder=${sortBy === 'price-asc' ? 'asc' : 'desc'}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setFilteredProducts(data.products || []);
    } catch {}
    finally { setTabLoading(false); }
  };

  const handleSortChange = async (newSort: string) => {
    setSortBy(newSort);
    setTabLoading(true);
    try {
      let sortParam = 'createdAt';
      let orderParam = 'desc';
      if (newSort === 'price-asc') { sortParam = 'originalPrice'; orderParam = 'asc'; }
      else if (newSort === 'price-desc') { sortParam = 'originalPrice'; orderParam = 'desc'; }
      else if (newSort === 'newest') { sortParam = 'createdAt'; orderParam = 'desc'; }
      else if (newSort === 'oldest') { sortParam = 'createdAt'; orderParam = 'asc'; }

      let url: string;
      if (activeTab === 'all') url = `/api/products?featured=true&limit=30&sortBy=${sortParam}&sortOrder=${orderParam}`;
      else if (activeTab === 'best-sellers') url = `/api/products?sortBy=salesCount&limit=30`;
      else url = `/api/products?category=${activeTab}&limit=30&sortBy=${sortParam}&sortOrder=${orderParam}`;

      const res = await fetch(url);
      const data = await res.json();
      setFilteredProducts(data.products || []);
    } catch {}
    finally { setTabLoading(false); }
  };

  // Step 1: Branded loader — 3 seconds
  if (brandLoading) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ backgroundColor: '#F8F6F2' }}
      >
        <style>{`
          @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes dot { 0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
          .l-name { animation: fadeUp 0.7s ease forwards; }
          .l-sub { animation: fadeUp 0.7s ease 0.15s both; }
          .l-bar { animation: fadeUp 0.7s ease 0.3s both; }
          .d1 { animation: dot 1.4s ease-in-out 0s infinite; }
          .d2 { animation: dot 1.4s ease-in-out 0.2s infinite; }
          .d3 { animation: dot 1.4s ease-in-out 0.4s infinite; }
        `}</style>
        <div className="mb-8 l-name">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="#B76E79" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
            <circle cx="24" cy="24" r="14" stroke="#B76E79" strokeWidth="1" opacity="0.6" />
            <circle cx="24" cy="24" r="4" fill="#B76E79" />
          </svg>
        </div>
        <h1 className="l-name font-fairplay text-[#1C1C1C] tracking-[0.25em] uppercase mb-1" style={{ fontSize: 'clamp(22px, 5vw, 32px)' }}>
          Amoli
        </h1>
        <p className="l-sub font-elegant text-gray-400 tracking-[0.4em] uppercase mb-10" style={{ fontSize: '9px' }}>
          Fashion Jewellery
        </p>
        <div className="l-bar relative w-32 h-px overflow-hidden" style={{ backgroundColor: '#e8ddd9' }}>
          <div className="absolute inset-y-0 left-0 w-1/3" style={{ backgroundColor: '#B76E79', animation: 'shimmer 1.6s ease-in-out infinite' }} />
        </div>
        <div className="flex gap-1.5 mt-6">
          <span className="d1 w-1 h-1 rounded-full" style={{ backgroundColor: '#B76E79' }} />
          <span className="d2 w-1 h-1 rounded-full" style={{ backgroundColor: '#B76E79' }} />
          <span className="d3 w-1 h-1 rounded-full" style={{ backgroundColor: '#B76E79' }} />
        </div>
      </div>
    );
  }

  // Step 2: Skeleton — while data loads
  if (pageLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F8F6F2' }}>
        <style>{`
          @keyframes shimmer-pulse {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .skeleton {
            background: linear-gradient(90deg, #ede8e3 25%, #f5f1ee 50%, #ede8e3 75%);
            background-size: 200% 100%;
            animation: shimmer-pulse 1.5s ease-in-out infinite;
          }
        `}</style>
        <div className="skeleton h-[300px] sm:h-[420px] md:h-[520px] lg:h-[600px] w-full" />
        <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="skeleton h-5 w-40 mx-auto mb-2 rounded" />
          <div className="skeleton h-px w-16 mx-auto mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        </div>
        <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="skeleton h-5 w-32 mx-auto mb-8 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-square mb-3" />
                <div className="skeleton h-3 w-3/4 mb-2 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ backgroundColor: '#F8F6F2', color: '#1A1A1A' }}>
      {/* Offer Popup */}
      <OfferPopup />
      
      {/* Hero Banner Slider */}
      <section className="relative h-[300px] sm:h-[420px] md:h-[520px] lg:h-[600px] overflow-hidden">
        <div 
          className={`flex h-full ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
          style={{ 
            transform: `translateX(-${currentSlide * (100 / duplicatedBanners.length)}%)`,
            width: `${duplicatedBanners.length * 100}%`
          }}
        >
          {duplicatedBanners.map((banner, index) => (
            <div
              key={`banner-${banner.id}-${index}`}
              className="relative flex-shrink-0 w-full h-full"
              style={{ width: `${100 / duplicatedBanners.length}%` }}
            >
              {/* Banner Image Background */}
              <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.image || '/placeholder.svg'}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-full">
                  <div className="w-full lg:w-1/2 text-white space-y-8">
                    <div className="space-y-4">
                      {banner.subtitle && (
                        <p className="text-sm md:text-lg font-elegant tracking-[0.3em] text-white uppercase">{banner.subtitle}</p>
                      )}
                      <h1 className="text-5xl lg:text-7xl font-fairplay leading-tight text-white drop-shadow-md">
                        {banner.title}
                      </h1>
                      {banner.description && (
                        <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl">{banner.description}</p>
                      )}
                    </div>
                    {banner.link && (
                      <Link href={banner.link} className="inline-block mt-8">
                        <Button size="lg" className="text-white border-none rounded-none tracking-[0.2em] uppercase text-sm px-10 py-7 transition-luxury" style={{ backgroundColor: '#B76E79' }}>
                          Discover More
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows — fully transparent */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all z-10 hover:scale-110"
          style={{ color: '#B76E79' }}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all z-10 hover:scale-110"
          style={{ color: '#B76E79' }}
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots Indicator - Only show for original banners */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {banners.map((banner, index) => (
            <button
              key={`dot-${banner.id}-${index}`}
              onClick={() => setCurrentSlide(banners.length + index)}
              className={`h-2 rounded-full transition-all ${
                (currentSlide % banners.length) === index ? 'w-8' : 'w-2 bg-gray-50/50'
              }`}
              style={(currentSlide % banners.length) === index ? { backgroundColor: '#B76E79' } : {}}
            />
          ))}
        </div>
      </section>

      {/* Category Section */}
      <section className="py-12" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-fairplay text-[#1C1C1C] tracking-widest uppercase">Shop by Essence</h2>
            <div className="w-16 h-px mx-auto mt-3" style={{ backgroundColor: '#B76E79' }} />
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group block"
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden" style={{ backgroundColor: '#F8F6F2' }}>
                  <Image
                    src={category.image || '/placeholder.svg'}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 33vw, 16vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={category.image?.startsWith('data:')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-white font-elegant tracking-[0.15em] uppercase text-xs md:text-sm font-medium">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Styles Section */}
      <section className="py-12" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-fairplay text-[#1C1C1C] tracking-wide uppercase">
              Top Styles
            </h2>
          </div>

          {/* Toolbar: FILTERS button + dropdowns */}
          <div className="flex items-center gap-2 mb-6 sm:mb-8">
            {/* FILTERS button */}
            <button
              onClick={() => setFilterSidebarOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase border border-gray-200 px-2.5 py-2 hover:border-[#B76E79] transition-colors flex-shrink-0"
              style={{ color: '#B76E79' }}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeTab !== 'all' && (
                <span className="text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full" style={{ backgroundColor: '#B76E79' }}>1</span>
              )}
            </button>

            <div className="flex-1" />

            {/* Dropdowns */}
            <div className="flex-shrink-0 flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="flex-shrink-0 font-elegant tracking-[0.08em] uppercase border outline-none cursor-pointer text-[9px] px-1.5 py-1 sm:text-xs sm:px-2 sm:py-1.5"
                style={{ borderColor: '#B76E79', color: '#B76E79', backgroundColor: 'transparent' }}
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-asc">Price Low-High</option>
                <option value="price-desc">Price High-Low</option>
              </select>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="flex-shrink-0 font-elegant tracking-[0.08em] uppercase border outline-none cursor-pointer text-[9px] px-1.5 py-1 sm:text-xs sm:px-2 sm:py-1.5"
                style={{ borderColor: '#B76E79', color: '#B76E79', backgroundColor: 'transparent' }}
              >
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>

          {/* Filter Sidebar Drawer */}
          <AnimatePresence>
            {filterSidebarOpen && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/40 z-40"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setFilterSidebarOpen(false)}
                />
                <motion.aside
                  className="fixed top-0 left-0 h-full w-72 bg-white z-50 overflow-y-auto shadow-2xl"
                  initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{ backgroundColor: '#B76E79' }}>
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-white" />
                      <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-white">Filters</span>
                    </div>
                    <button onClick={() => setFilterSidebarOpen(false)} className="text-white/70 hover:text-white">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Categories */}
                  <div className="border-b border-gray-100">
                    <p className="px-5 py-3 text-[11px] font-semibold tracking-[0.12em] uppercase text-gray-800">Categories</p>
                    <div className="px-5 pb-4 space-y-2.5">
                      {[{ id: 'all', name: 'All' }, { id: 'best-sellers', name: 'Best Sellers' }, ...categories].map((cat) => (
                        <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                          <span
                            className="w-4 h-4 flex-shrink-0 border flex items-center justify-center transition-all"
                            style={activeTab === cat.id ? { backgroundColor: '#B76E79', borderColor: '#B76E79' } : { borderColor: '#d1d5db' }}
                          >
                            {activeTab === cat.id && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <span
                            className="text-sm transition-colors"
                            style={activeTab === cat.id ? { color: '#B76E79', fontWeight: 500 } : { color: '#4b5563' }}
                            onClick={() => {
                              if (cat.id === 'all') handleTabChange('all');
                              else if (cat.id === 'best-sellers') handleTabChange('best-sellers');
                              else handleTabChange(cat.id, cat.id);
                              setFilterSidebarOpen(false);
                            }}
                          >
                            {cat.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Clear */}
                  {activeTab !== 'all' && (
                    <div className="px-5 py-4">
                      <button
                        onClick={() => { handleTabChange('all'); setFilterSidebarOpen(false); }}
                        className="text-[10px] tracking-widest uppercase text-red-500 hover:text-red-700 font-medium"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          {tabLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square mb-3" />
                  <div className="h-3 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {filteredProducts.slice(0, perPage).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 font-light text-sm">No products in this category yet.</p>
            </div>
          )}

          {/* View All */}
          <div className="flex justify-end mt-10 pr-1">
            <Link href={
              activeTab === 'all' ? '/products' :
              activeTab === 'best-sellers' ? '/products?sortBy=salesCount' :
              `/products?category=${categories.find(c => c.id === activeTab)?.slug || ''}`
            }>
              <button className="group relative inline-flex items-center gap-3 px-8 py-3 overflow-hidden border transition-all duration-300"
                style={{ borderColor: '#B76E79', color: '#B76E79' }}>
                <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" style={{ backgroundColor: '#B76E79' }} />
                <span className="relative font-elegant tracking-[0.25em] uppercase text-[11px] group-hover:text-white transition-colors duration-300">View All</span>
                <ArrowRight className="relative h-3.5 w-3.5 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Model Gallery Section */}
      <section className="py-12" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="w-full">
          {/* Section Header */}
          <div className="flex justify-end px-4 sm:px-8 mb-8">
            <div className="relative inline-flex items-center gap-3 px-8 py-3 border" style={{ borderColor: '#B76E79' }}>
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: '#B76E79' }} />
              <h2 className="font-fairplay tracking-[0.2em] uppercase text-lg" style={{ color: '#B76E79' }}>Our Models</h2>
            </div>
          </div>

          {/* Models Slider - Full Width */}
          {modelGallery.length > 0 ? (
            <ModelGallerySlider models={modelGallery} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading models...</p>
            </div>
          )}
        </div>
      </section>

      {/* Showcases Section - Dynamic from Admin Panel */}
      {showcases.length > 0 && (
        <section className="py-16 relative" style={{ backgroundColor: '#F8F6F2' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[1px]" style={{ backgroundColor: '#B76E79', opacity: '0.3' }}></div>
          <div className="max-w-full">
            {/* Section Header - Button Style */}
            <div className="flex justify-end mb-12 px-4">
              <div className="relative inline-flex items-center gap-3 px-8 py-3 border" style={{ borderColor: '#B76E79' }}>
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: '#B76E79' }} />
                <h2 className="font-fairplay tracking-[0.2em] uppercase text-lg" style={{ color: '#B76E79' }}>Featured Collection</h2>
              </div>
            </div>

            {/* Dynamic Grid - 2 Images per Row */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {showcases.map((showcase) => (
                <Link
                  key={showcase.id}
                  href={showcase.link}
                  className="group relative h-[280px] sm:h-[380px] md:h-[500px] overflow-hidden"
                >
                  <Image
                    src={showcase.image || '/placeholder.svg'}
                    alt={showcase.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    unoptimized={showcase.image?.startsWith('data:') || showcase.image?.startsWith('http')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-4 sm:p-8 md:p-12 text-white">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-white drop-shadow-md">{showcase.title}</h3>
                      <p className="text-sm sm:text-base md:text-lg text-white/90">{showcase.subtitle}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            <div className="flex justify-end mt-12 px-4">
              <Link href="/products">
                <button className="group relative inline-flex items-center gap-3 px-8 py-3 overflow-hidden border transition-all duration-300"
                  style={{ borderColor: '#B76E79', color: '#B76E79' }}>
                  <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" style={{ backgroundColor: '#B76E79' }} />
                  <span className="relative font-elegant tracking-[0.25em] uppercase text-[11px] group-hover:text-white transition-colors duration-300">View All Collection</span>
                  <ArrowRight className="relative h-3.5 w-3.5 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Video Reviews Section */}
      <section className="py-12" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="w-full">
          <div className="flex justify-center mb-8">
            <div className="text-white px-8 py-3 rounded-none" style={{ backgroundColor: '#B76E79' }}>
              <h2 className="text-xl font-fairplay text-white tracking-wide">Customer Reviews</h2>
            </div>
          </div>
          <VideoReviewCarousel reviews={videoReviews} />
        </div>
      </section>

      {/* Security / Trust Badges */}
      <div className="w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/security.png"
          alt="Certified Quality | Secure Shopping | Easy Returns | Premium Packaging"
          className="w-full  block"
          style={{ display: 'block' }}
        />
      </div>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden" style={{ backgroundColor: '#B76E79' }}>
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 opacity-10 rounded-full blur-3xl" style={{ backgroundColor: '#B76E79' }}></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 opacity-10 rounded-full blur-3xl" style={{ backgroundColor: '#B76E79' }}></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-sm tracking-[0.3em] uppercase font-elegant text-white/80 block mb-3">Experience Elegance</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl md:text-5xl font-fairplay text-white mb-4 sm:mb-6 leading-tight">
            Embrace Your True Brilliance
          </h2>
          <p className="text-sm sm:text-base text-white/85 mb-6 sm:mb-10 max-w-2xl mx-auto font-light">
            Discover our exclusive collections of finely crafted jewelry, designed to illuminate your every moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto rounded-none tracking-[0.2em] uppercase text-xs sm:text-sm px-6 sm:px-10 py-5 sm:py-7 transition-luxury border border-white text-white hover:bg-white hover:text-[#B76E79]" style={{ backgroundColor: 'transparent' }}>
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto rounded-none tracking-[0.2em] uppercase text-xs sm:text-sm px-6 sm:px-10 py-5 sm:py-7 transition-luxury text-[#B76E79] hover:text-[#B76E79]" style={{ backgroundColor: 'white' }}>
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Payment Methods & Trust Section — temporarily hidden */}
    </div>
  );
}
