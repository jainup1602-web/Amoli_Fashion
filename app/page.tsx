'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { Truck, Package, RefreshCw, Phone, ChevronLeft, ChevronRight, ChevronRight as ArrowRight, Star } from 'lucide-react';
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

const defaultBanners = [
  {
    id: '1',
    title: 'Summer Collection 2024',
    subtitle: 'Up to 50% Off',
    description: 'Discover the latest trends in fashion',
    image: '/placeholder.svg',
    link: '/products',
    order: 1,
    isActive: true,
  },
  {
    id: '2',
    title: 'New Arrivals',
    subtitle: 'Fresh Styles',
    description: 'Be the first to get the newest products',
    image: '/placeholder.svg',
    link: '/products?sortBy=createdAt',
    order: 2,
    isActive: true,
  },
  {
    id: '3',
    title: 'Special Offers',
    subtitle: 'Limited Time',
    description: 'Grab amazing deals before they expire',
    image: '/placeholder.svg',
    link: '/products?sortBy=discountPercentage',
    order: 3,
    isActive: true,
  },
];

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

// Single video card — always autoplaying, muted, no play icon
function VideoCard({ review }: { review: any }) {
  return (
    <div
      className="flex-shrink-0 relative overflow-hidden select-none"
      style={{ width: 280, height: 480, borderRadius: 4 }}
    >
      <video
        src={review.videoUrl}
        poster={review.thumbnailUrl || undefined}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
        style={{ borderRadius: 4 }}
      />
    </div>
  );
}

// Video Review Carousel — full screen width, framer-motion drag
function VideoReviewCarousel({ reviews }: { reviews: any[] }) {
  const [dragging, setDragging] = useState(false);

  if (reviews.length === 0) return null;

  return (
    <div className="w-full overflow-hidden">
      <motion.div
        className="flex"
        style={{ gap: 5, paddingLeft: 16, paddingRight: 16, cursor: dragging ? 'grabbing' : 'grab' }}
        drag="x"
        dragConstraints={{ right: 0, left: -(reviews.length * 285 - (typeof window !== 'undefined' ? window.innerWidth : 1200)) }}
        dragElastic={0.1}
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

// Model Gallery Slider — framer-motion, reference style
function ModelGallerySlider({ models }: { models: any[] }) {
  const [active, setActive] = useState(0);
  const total = models.length;

  // Auto-advance
  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % total), 3500);
    return () => clearInterval(t);
  }, [total]);

  const prev = () => setActive((p) => (p - 1 + total) % total);
  const next = () => setActive((p) => (p + 1) % total);

  // Compute position for each slide relative to active
  const getPosition = (index: number): 'center' | 'left' | 'right' | 'hidden' => {
    const diff = ((index - active) % total + total) % total;
    if (diff === 0) return 'center';
    if (diff === 1) return 'right';
    if (diff === total - 1) return 'left';
    return 'hidden';
  };

  const variants: Record<string, any> = {
    center: { scale: 1,    x: 0,    rotate: 0,  opacity: 1,   zIndex: 10 },
    left:   { scale: 0.82, x: -320, rotate: -6, opacity: 1,   zIndex: 5  },
    right:  { scale: 0.82, x:  320, rotate:  6, opacity: 1,   zIndex: 5  },
    hidden: { scale: 0.6,  x: 0,    rotate: 0,  opacity: 0,   zIndex: 0  },
  };

  return (
    <div className="w-full py-16 overflow-hidden" style={{ backgroundColor: '#F8F6F2' }}>
      <p className="text-center text-xs tracking-[0.3em] uppercase text-gray-400 mb-10 font-elegant">For Every You</p>

      {/* Stage */}
      <div className="relative flex items-center justify-center" style={{ height: '580px' }}>
        {models.map((model, index) => {
          const pos = getPosition(index);
          return (
            <motion.div
              key={model.id}
              onClick={() => pos !== 'center' && setActive(index)}
              className="absolute cursor-pointer"
              animate={variants[pos]}
              transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ originX: 0.5, originY: 1 }}
            >
              <div
                className="relative overflow-hidden shadow-2xl"
                style={{
                  width: pos === 'center' ? '360px' : '280px',
                  height: pos === 'center' ? '540px' : '420px',
                  borderRadius: '4px',
                  transition: 'width 0.55s ease, height 0.55s ease',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={model.image}
                  alt={model.modelName}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent pt-16 pb-5 px-4">
                  <p className="text-white text-xs tracking-[0.25em] uppercase font-elegant text-center">
                    {model.category || model.modelName}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Arrows */}
      <div className="relative flex justify-center gap-4 mt-8">
        <button
          onClick={prev}
          className="bg-white/80 hover:bg-white border border-gray-200 shadow-md p-3 rounded-full transition-all"
          style={{ color: '#043927' }}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="bg-white/80 hover:bg-white border border-gray-200 shadow-md p-3 rounded-full transition-all"
          style={{ color: '#043927' }}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-5 gap-2">
        {models.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: active === i ? '32px' : '6px',
              backgroundColor: active === i ? '#043927' : '#d1d5db',
            }}
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

  // Category filter tabs for Top Styles
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [perPage, setPerPage] = useState<number>(12);

  // Create duplicated banners for infinite loop
  const duplicatedBanners = banners.length > 0 ? [...banners, ...banners, ...banners] : [];

  useEffect(() => {
    fetchData();
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
    try {
      const [bannersRes, productsRes, categoriesRes, showcasesRes, videoReviewsRes, modelGalleryRes] = await Promise.all([
        fetch('/api/banners', { cache: 'no-store' }),
        fetch('/api/products?featured=true&limit=30'),
        fetch('/api/categories?limit=6'),
        fetch('/api/showcases'),
        fetch('/api/video-reviews?limit=10'),
        fetch('/api/model-gallery?limit=8'),
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

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#F8F6F2', color: '#1A1A1A' }}>
      {/* Offer Popup */}
      <OfferPopup />
      
      {/* Hero Banner Slider */}
      <section className="relative h-[600px] overflow-hidden">
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
                        <Button size="lg" className="text-white border-none rounded-none tracking-[0.2em] uppercase text-sm px-10 py-7 transition-luxury" style={{ backgroundColor: '#043927' }}>
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

        {/* Glassmorphism Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 shadow-xl p-3 rounded-full transition-all z-10 hover:scale-110"
          style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: '#043927' }}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 shadow-xl p-3 rounded-full transition-all z-10 hover:scale-110"
          style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: '#043927' }}
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
              style={(currentSlide % banners.length) === index ? { backgroundColor: '#043927' } : {}}
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
            <div className="w-16 h-px mx-auto mt-3" style={{ backgroundColor: '#043927' }} />
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
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

          {/* Tabs LEFT + Filters RIGHT */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            {/* Category tabs — left */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleTabChange('all')}
                className="px-4 py-1.5 text-xs font-elegant tracking-[0.15em] uppercase border transition-colors text-white"
                style={{ backgroundColor: activeTab === 'all' ? '#043927' : 'transparent', borderColor: '#043927', color: activeTab === 'all' ? 'white' : '#043927' }}
              >All</button>
              <button
                onClick={() => handleTabChange('best-sellers')}
                className="px-4 py-1.5 text-xs font-elegant tracking-[0.15em] uppercase border transition-colors"
                style={{ backgroundColor: activeTab === 'best-sellers' ? '#043927' : 'transparent', borderColor: '#043927', color: activeTab === 'best-sellers' ? 'white' : '#043927' }}
              >Best Sellers</button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleTabChange(cat.id, cat.id)}
                  className="px-4 py-1.5 text-xs font-elegant tracking-[0.15em] uppercase border transition-colors"
                  style={{ backgroundColor: activeTab === cat.id ? '#043927' : 'transparent', borderColor: '#043927', color: activeTab === cat.id ? 'white' : '#043927' }}
                >{cat.name}</button>
              ))}
            </div>

            {/* Filters — right */}
            <div className="flex items-center gap-3">
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-xs font-elegant tracking-[0.1em] uppercase border border-[#1C1C1C] bg-transparent text-[#1C1C1C] px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              {/* Per page dropdown */}
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="text-xs font-elegant tracking-[0.1em] uppercase border border-[#1C1C1C] bg-transparent text-[#1C1C1C] px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value={8}>Show 8</option>
                <option value={12}>Show 12</option>
                <option value={16}>Show 16</option>
                <option value={24}>Show 24</option>
                <option value={30}>Show 30</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {tabLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square mb-3" />
                  <div className="h-3 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="text-center mt-10">
            <Link href={
              activeTab === 'all' ? '/products' :
              activeTab === 'best-sellers' ? '/products?sortBy=salesCount' :
              `/products?category=${categories.find(c => c.id === activeTab)?.slug || ''}`
            }>
              <Button variant="outline" className="text-white rounded-none tracking-[0.15em] uppercase text-xs px-10 py-5" style={{ backgroundColor: '#043927', borderColor: '#043927' }}>
                View All
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Model Gallery Section */}
      <section className="py-12" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="w-full">
          {/* Section Header */}
          <div className="flex justify-center mb-8">
            <div className="text-white px-8 py-3 rounded-none" style={{ backgroundColor: '#043927' }}>
              <h2 className="text-xl font-fairplay text-white tracking-wide">Our Models</h2>
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
        <section className="py-16 bg-gray-50 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[1px]" style={{ backgroundColor: '#043927', opacity: '0.3' }}></div>
          <div className="max-w-full">
            {/* Section Header - Button Style */}
            <div className="flex justify-center lg:justify-start mb-12 px-4">
              <div className="text-white px-8 py-3 rounded-none" style={{ backgroundColor: '#043927' }}>
                <h2 className="text-xl font-fairplay text-white tracking-wide">Featured Collection</h2>
              </div>
            </div>

            {/* Dynamic Grid - 2 Images per Row */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {showcases.map((showcase) => (
                <Link
                  key={showcase.id}
                  href={showcase.link}
                  className="group relative h-[500px] overflow-hidden"
                >
                  <Image
                    src={showcase.image || '/placeholder.svg'}
                    alt={showcase.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    unoptimized={showcase.image?.startsWith('data:') || showcase.image?.startsWith('http')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/70 to-transparent flex items-end">
                    <div className="p-12 text-white">
                      <h3 className="text-3xl font-bold mb-2">{showcase.title}</h3>
                      <p className="text-lg text-white/90">{showcase.subtitle}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
              <Link href="/products">
                <Button size="lg" className="px-12 text-white rounded-none tracking-[0.15em] uppercase transition-luxury" style={{ backgroundColor: '#043927' }}>
                  View All Collection
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Video Reviews Section */}
      <section className="py-12" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="w-full">
          <div className="flex justify-center mb-8">
            <div className="text-white px-8 py-3 rounded-none" style={{ backgroundColor: '#043927' }}>
              <h2 className="text-xl font-fairplay text-white tracking-wide">Customer Reviews</h2>
            </div>
          </div>
          <VideoReviewCarousel reviews={videoReviews} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden" style={{ backgroundColor: '#043927' }}>
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 opacity-10 rounded-full blur-3xl" style={{ backgroundColor: '#043927' }}></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 opacity-10 rounded-full blur-3xl" style={{ backgroundColor: '#043927' }}></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="elegant-subheading text-gray-400">Experience Elegance</span>
          <h2 className="elegant-heading-large text-white mb-6">
            Embrace Your True Brilliance
          </h2>
          <p className="elegant-subheading text-white/70 mb-10 max-w-2xl mx-auto">
            Discover our exclusive collections of finely crafted jewelry, designed to illuminate your every moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="text-white border-none rounded-none tracking-[0.2em] uppercase text-sm px-10 py-7 transition-luxury" style={{ backgroundColor: '#043927' }}>
                Browse Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:text-[#1C1C1C] rounded-none tracking-[0.2em] uppercase text-sm px-10 py-7 transition-luxury bg-transparent hover:bg-white/10">
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
