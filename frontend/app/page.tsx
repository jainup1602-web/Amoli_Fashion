'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { Truck, Package, RefreshCw, Phone, ChevronLeft, ChevronRight, ChevronRight as ArrowRight, Star, SlidersHorizontal, X } from 'lucide-react';
import { OfferPopup } from '@/components/common/OfferPopup';

import { DualMarquee } from '@/components/home/DualMarquee';
import { BirthstoneSection } from '@/components/home/BirthstoneSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { FeaturedSection } from '@/components/products/FeaturedSection';
import { ShowcaseCard } from '@/components/home/ShowcaseCard';
import { VideoReviewCarousel } from '@/components/home/VideoReviewCarousel';
import { ModelGallerySlider } from '@/components/home/ModelGallerySlider';
import { SubmitVideoReviewModal } from '@/components/home/SubmitVideoReviewModal';
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

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [banners, setBanners] = useState<Banner[]>(defaultBanners);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showcases, setShowcases] = useState<any[]>([]);
  const [videoReviews, setVideoReviews] = useState<any[]>([]);
  const [modelGallery, setModelGallery] = useState<any[]>([]);
  const [marqueeItems, setMarqueeItems] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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
    // Fetch data and hide skeleton when done
    const maxTimer = setTimeout(() => setPageLoading(false), 8000);
    fetchData().finally(() => { clearTimeout(maxTimer); });
    return () => clearTimeout(maxTimer);
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
      const [bannersRes, productsRes, categoriesRes, showcasesRes, videoReviewsRes, modelGalleryRes, marqueeRes] = await Promise.all([
        withTimeout(fetch('/api/banners', { cache: 'no-store' })).catch(() => new Response('{}', { status: 500 })),
        withTimeout(fetch('/api/products?featured=true&limit=30')).catch(() => new Response('{}', { status: 500 })),
        withTimeout(fetch('/api/categories?limit=6')).catch(() => new Response('{}', { status: 500 })),
        withTimeout(fetch('/api/showcases')).catch(() => new Response('{}', { status: 500 })),
        withTimeout(fetch('/api/video-reviews?limit=10')).catch(() => new Response('{}', { status: 500 })),
        withTimeout(fetch('/api/model-gallery?limit=8')).catch(() => new Response('{}', { status: 500 })),
        withTimeout(fetch('/api/marquee')).catch(() => new Response('{}', { status: 500 })),
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

      if (marqueeRes.ok) {
        const data = await marqueeRes.json();
        if (data.success && data.items) {
          setMarqueeItems(data.items);
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


  // Step 2: Skeleton — while data loads
  if (pageLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FDFCF0' }}>
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
        <div className="skeleton h-[220px] sm:h-[380px] md:h-[480px] lg:h-[600px] w-full" />
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
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ backgroundColor: '#FDFCF0', color: '#1A1A1A' }}>
      {/* Offer Popup */}
      <OfferPopup />
      
      {/* Hero Banner Slider */}
      <section 
        className="relative h-[220px] sm:h-[380px] md:h-[480px] lg:h-[600px] overflow-hidden"
        onTouchStart={(e) => { touchStartX.current = e.targetTouches[0].clientX; }}
        onTouchMove={(e) => { touchEndX.current = e.targetTouches[0].clientX; }}
        onTouchEnd={() => {
          if (!touchStartX.current || !touchEndX.current) return;
          const distance = touchStartX.current - touchEndX.current;
          if (distance > 50) nextSlide();
          if (distance < -50) prevSlide();
          touchStartX.current = 0;
          touchEndX.current = 0;
        }}
      >
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
              <div className="absolute inset-0 bg-[#1A1A1A]">
                {banner.link ? (
                  <Link href={banner.link} className="block w-full h-full">
                    <img
                      src={banner.image || '/image/Amoli_1.png'}
                      alt={banner.title || 'Banner'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.endsWith('/image/Amoli_1.png')) {
                          target.src = '/image/Amoli_1.png';
                        }
                      }}
                    />
                  </Link>
                ) : (
                  <img
                    src={banner.image || '/image/Amoli_1.png'}
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.endsWith('/image/Amoli_1.png')) {
                        target.src = '/image/Amoli_1.png';
                      }
                    }}
                  />
                )}
              </div>

              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none">
                <div className="flex items-center h-full">
                  <div className="w-full lg:w-1/2 text-white space-y-8 pointer-events-auto">
                    <div className="space-y-4">
                      {banner.subtitle && banner.subtitle.trim() !== '' && (
                        <p className="text-sm md:text-lg font-elegant tracking-[0.3em] text-white uppercase">{banner.subtitle}</p>
                      )}
                      {banner.title && banner.title.trim() !== '' && (
                        <h1 className="text-5xl lg:text-7xl font-playfair leading-tight text-white drop-shadow-md">
                          {banner.title}
                        </h1>
                      )}
                      {banner.description && banner.description.trim() !== '' && (
                        <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl">{banner.description}</p>
                      )}
                    </div>
                    {banner.link && (banner.title || banner.subtitle || banner.description) && (
                      <Link href={banner.link} className="inline-block mt-8">
                        <Button size="lg" className="text-white border-none rounded-none tracking-[0.2em] uppercase text-sm px-10 py-7 transition-luxury" style={{ backgroundColor: '#1A1A1A' }}>
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

        {/* Dots Indicator - Only show for original banners */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {banners.map((banner, index) => (
            <button
              key={`dot-${banner.id}-${index}`}
              onClick={() => setCurrentSlide(banners.length + index)}
              className={`h-2 rounded-full transition-all ${
                (currentSlide % banners.length) === index ? 'w-8' : 'w-2 bg-gray-50/50'
              }`}
              style={(currentSlide % banners.length) === index ? { backgroundColor: '#1A1A1A' } : {}}
            />
          ))}
        </div>
      </section>


      <motion.section 
        className="py-12" style={{ backgroundColor: '#FDFCF0' }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-playfair text-[#1C1C1C] tracking-widest uppercase">Shop by Essence</h2>
            <div className="w-16 h-px mx-auto mt-3" style={{ backgroundColor: '#1A1A1A' }} />
          </div>

          {/* Categories Grid - Circular Style */}
          <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-8 sm:flex sm:flex-wrap sm:justify-center sm:gap-8 md:gap-12 lg:gap-16">
            {categories.slice(0, 4).map((collection) => (
              <Link
                key={collection.id}
                href={`/products?category=${collection.slug}`}
                className="group flex flex-col items-center"
              >
                <div 
                  className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden transition-all duration-300 shadow-md group-hover:shadow-lg"
                  style={{ border: '1.5px solid #1A1A1A' }}
                >
                  <Image
                    src={collection.image || '/image/Amoli_2.png'}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 768px) 96px, 128px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500 rounded-full"
                    unoptimized={true}
                    loading="lazy"
                  />
                </div>
                <h3 className="mt-3 text-xs sm:text-sm font-medium text-[#1A1A1A] group-hover:text-[#B76E79] transition-colors duration-300 font-elegant tracking-widest uppercase text-center">
                  {collection.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Marquee Section */}
      {marqueeItems.length > 0 && (
        <DualMarquee
          items={marqueeItems}
          title="Elevate Your Style Shines Bright"
          subtitle="GLAMOROUS LIFE"
        />
      )}

      {/* Top Styles Section */}
      <motion.section 
        className="py-12" style={{ backgroundColor: '#FDFCF0' }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-playfair text-[#1C1C1C] tracking-wide uppercase">
              Top Styles
            </h2>
          </div>

          {/* Toolbar: Filters & Dropdowns */}
          <div className="flex items-center justify-between gap-4 mb-8">
            
            {/* Mobile FILTERS button */}
            <button
              onClick={() => setFilterSidebarOpen(true)}
              className="lg:hidden flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase border border-gray-200 px-3 py-2 hover:border-[#1A1A1A] transition-colors flex-shrink-0"
              style={{ color: '#1A1A1A' }}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeTab !== 'all' && (
                <span className="text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full" style={{ backgroundColor: '#1A1A1A' }}>1</span>
              )}
            </button>

            {/* Desktop Inline Filters */}
            <div className="hidden lg:flex items-center gap-3 flex-1 flex-wrap">
              {[{ id: 'all', name: 'All Collection' }, ...categories].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (cat.id === 'all') handleTabChange('all');
                    else handleTabChange(cat.id, cat.id);
                  }}
                  className="text-[10px] sm:text-xs tracking-[0.1em] uppercase font-elegant transition-all duration-300 border px-3 py-1.5 sm:py-2"
                  style={{ 
                    color: activeTab === cat.id ? '#1A1A1A' : '#4b5563',
                    borderColor: activeTab === cat.id ? '#1A1A1A' : '#e5e7eb',
                    backgroundColor: activeTab === cat.id ? 'rgba(183, 110, 121, 0.05)' : 'transparent',
                    fontWeight: activeTab === cat.id ? 500 : 400
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Spacer for Mobile */}
            <div className="flex-1 lg:hidden" />

            {/* Dropdowns */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="flex-shrink-0 font-elegant tracking-[0.08em] uppercase border outline-none cursor-pointer text-[10px] px-2 py-1.5 sm:text-xs sm:px-3 sm:py-2 transition-colors hover:border-[#1A1A1A]"
                style={{ borderColor: '#e5e7eb', color: '#1A1A1A', backgroundColor: 'transparent' }}
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
                className="flex-shrink-0 font-elegant tracking-[0.08em] uppercase border outline-none cursor-pointer text-[10px] px-2 py-1.5 sm:text-xs sm:px-3 sm:py-2 transition-colors hover:border-[#1A1A1A]"
                style={{ borderColor: '#e5e7eb', color: '#1A1A1A', backgroundColor: 'transparent' }}
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
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{ backgroundColor: '#1A1A1A' }}>
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
                      {[{ id: 'all', name: 'All' }, ...categories].map((cat) => (
                        <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                          <span
                            className="w-4 h-4 flex-shrink-0 border flex items-center justify-center transition-all"
                            style={activeTab === cat.id ? { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' } : { borderColor: '#d1d5db' }}
                          >
                            {activeTab === cat.id && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <span
                            className="text-sm transition-colors"
                            style={activeTab === cat.id ? { color: '#1A1A1A', fontWeight: 500 } : { color: '#4b5563' }}
                            onClick={() => {
                              if (cat.id === 'all') handleTabChange('all');
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
              `/products?category=${categories.find(c => c.id === activeTab)?.slug || ''}`
            }>
              <button className="group relative inline-flex items-center gap-3 px-8 py-3 overflow-hidden border transition-all duration-300"
                style={{ borderColor: '#1A1A1A', color: '#1A1A1A' }}>
                <span className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" style={{ backgroundColor: '#1A1A1A' }} />
                <span className="relative font-elegant tracking-[0.25em] uppercase text-[11px] group-hover:text-white transition-colors duration-300">View All</span>
                <ArrowRight className="relative h-3.5 w-3.5 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
              </button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Birthstone / Special Section */}
      <BirthstoneSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Premium Model Gallery Section */}
      {modelGallery.length > 0 ? (
        <ModelGallerySlider models={modelGallery} />
      ) : (
        <div className="text-center py-20" style={{ backgroundColor: '#F9F8F6' }}>
          <p className="text-gray-400 font-elegant tracking-[0.2em] uppercase">Loading Collections...</p>
        </div>
      )}

      {/* Showcases Section - Dynamic from Admin Panel */}
      {showcases.length > 0 && (
        <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#FDFCF0' }}>
          {/* Section Header with Animation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 px-4"
          >
            <p className="text-[10px] sm:text-xs tracking-[0.45em] uppercase text-[#8a7560] mb-4 font-elegant">Exclusive Selections</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair text-[#1C1C1C] tracking-wide mb-6">Featured Collection</h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-[1px] w-16 bg-[#1A1A1A]/30" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#1A1A1A]/60" />
              <div className="h-[1px] w-16 bg-[#1A1A1A]/30" />
            </div>
          </motion.div>

          {/* Premium Bento Grid */}
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            {showcases.length === 1 && (
              <div className="max-w-5xl mx-auto">
                <ShowcaseCard showcase={showcases[0]} tall index={0} />
              </div>
            )}

            {showcases.length === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {showcases.map((showcase, i) => (
                  <ShowcaseCard key={showcase.id} showcase={showcase} tall index={i} />
                ))}
              </div>
            )}

            {showcases.length === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                <div className="lg:col-span-8 h-full">
                  <ShowcaseCard showcase={showcases[0]} tall index={0} />
                </div>
                <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6 h-full">
                  <ShowcaseCard showcase={showcases[1]} index={1} />
                  <ShowcaseCard showcase={showcases[2]} index={2} />
                </div>
              </div>
            )}

            {showcases.length === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
                {/* Row 1: Large left, narrow right */}
                <div className="md:col-span-8">
                  <ShowcaseCard showcase={showcases[0]} tall index={0} />
                </div>
                <div className="md:col-span-4">
                  <ShowcaseCard showcase={showcases[1]} tall index={1} />
                </div>
                {/* Row 2: Narrow left, large right */}
                <div className="md:col-span-4">
                  <ShowcaseCard showcase={showcases[2]} tall index={2} />
                </div>
                <div className="md:col-span-8">
                  <ShowcaseCard showcase={showcases[3]} tall index={3} />
                </div>
              </div>
            )}

            {showcases.length >= 5 && (
              <div className="flex flex-col gap-4 lg:gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                  <div className="lg:col-span-8 h-full">
                    <ShowcaseCard showcase={showcases[0]} tall index={0} />
                  </div>
                  <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6 h-full">
                    <ShowcaseCard showcase={showcases[1]} index={1} />
                    <ShowcaseCard showcase={showcases[2]} index={2} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {showcases.slice(3).map((showcase, i) => (
                    <ShowcaseCard key={showcase.id} showcase={showcase} index={i + 3} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* View All Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center mt-16 px-4"
          >
            <Link href="/products">
              <button className="group relative inline-flex items-center gap-4 px-12 py-4 overflow-hidden border transition-all duration-500"
                style={{ borderColor: '#1A1A1A', color: '#1A1A1A' }}>
                <span className="absolute inset-0 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.25,0.46,0.45,0.94]" style={{ backgroundColor: '#1A1A1A' }} />
                <span className="relative font-elegant tracking-[0.3em] uppercase text-xs group-hover:text-white transition-colors duration-500">View Full Collection</span>
                <ArrowRight className="relative h-4 w-4 group-hover:text-white group-hover:translate-x-2 transition-all duration-500" />
              </button>
            </Link>
          </motion.div>
        </section>
      )}

      {/* Video Reviews Section */}
      <motion.section 
        className="py-12" style={{ backgroundColor: '#FDFCF0' }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="w-full">
          {/* Elegant Section Header */}
          <div className="text-center mb-12 px-4">
            <p className="text-[10px] sm:text-xs tracking-[0.4em] uppercase text-[#1A1A1A] mb-4 font-elegant drop-shadow-sm">Client Diaries</p>
            <h2 className="text-3xl md:text-4xl font-playfair text-[#1C1C1C] tracking-wide">Customer Reviews</h2>
          </div>
          <VideoReviewCarousel reviews={videoReviews} />
          <div className="flex justify-center mt-10">
            <Button 
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-[#1A1A1A] hover:bg-black text-white px-8 py-3 tracking-widest uppercase text-xs"
            >
              Share Your Review
            </Button>
          </div>
        </div>
      </motion.section>

      <SubmitVideoReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
      />

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
      <motion.section 
        className="py-16 relative overflow-hidden" 
        style={{ 
          background: 'linear-gradient(rgba(26,26,26,0.85), rgba(26,26,26,0.85)), url("/image/Amoli_1.png") center/cover no-repeat fixed' 
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-sm tracking-[0.3em] uppercase font-elegant text-white/80 block mb-3">Experience Elegance</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl md:text-5xl font-playfair text-white mb-4 sm:mb-6 leading-tight">
            Embrace Your True Brilliance
          </h2>
          <p className="text-sm sm:text-base text-white/85 mb-6 sm:mb-10 max-w-2xl mx-auto font-light">
            Discover our exclusive collections of finely crafted jewellery, designed to illuminate your every moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto rounded-none tracking-[0.2em] uppercase text-xs sm:text-sm px-6 sm:px-10 py-5 sm:py-7 transition-luxury border border-white text-white hover:bg-white hover:text-[#1A1A1A]" style={{ backgroundColor: 'transparent' }}>
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto rounded-none tracking-[0.2em] uppercase text-xs sm:text-sm px-6 sm:px-10 py-5 sm:py-7 transition-luxury text-[#1A1A1A] hover:text-[#1A1A1A]" style={{ backgroundColor: 'white' }}>
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Payment Methods & Trust Section — temporarily hidden */}
    </div>
  );
}
