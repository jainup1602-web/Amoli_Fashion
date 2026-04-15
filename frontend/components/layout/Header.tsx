'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingCart, Heart, ChevronDown, Menu, X, ChevronRight, Search, LogOut, User, MapPin, Package, Settings, Bell } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { AuthModal } from '@/components/auth/AuthModal';
import { ProfileIcon } from '@/components/icons/ProfileIcon';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ name: string; slug: string } | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; slug: string; images: string[]; originalPrice: number; specialPrice?: number | null }[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeOpen, setPincodeOpen] = useState(false);
  const [pincodeCity, setPincodeCity] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const pincodeRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.cart);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const cartItemsCount = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wishlistCount = wishlistItems?.length || 0;

  // Animation states for count badges
  const [cartBounce, setCartBounce] = useState(false);
  const [wishlistBounce, setWishlistBounce] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(cartItemsCount);
  const [prevWishlistCount, setPrevWishlistCount] = useState(wishlistCount);

  // Animation variants
  const sidebarVariants = {
    closed: {
      x: '-100%',
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30
      }
    },
    open: {
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30
      }
    }
  };

  const backdropVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const dropdownVariants = {
    closed: {
      opacity: 0,
      maxHeight: 0,
      transition: {
        duration: 0.4,
        ease: 'easeInOut' as const
      }
    },
    open: {
      opacity: 1,
      maxHeight: 300,
      transition: {
        duration: 0.5,
        ease: 'easeInOut' as const
      }
    }
  };

  const searchDropdownVariants = {
    closed: {
      opacity: 0,
      y: -8,
      scale: 0.96,
      transition: {
        duration: 0.2,
        ease: 'easeInOut' as const
      }
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const
      }
    }
  };

  const profileDropdownVariants = {
    closed: {
      opacity: 0,
      y: -8,
      scale: 0.96,
      transition: {
        duration: 0.2,
        ease: 'easeInOut' as const
      }
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const
      }
    }
  };

  // Trigger bounce animation when counts change
  useEffect(() => {
    if (cartItemsCount > prevCartCount) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 600);
    }
    setPrevCartCount(cartItemsCount);
  }, [cartItemsCount, prevCartCount]);

  useEffect(() => {
    if (wishlistCount > prevWishlistCount) {
      setWishlistBounce(true);
      setTimeout(() => setWishlistBounce(false), 600);
    }
    setPrevWishlistCount(wishlistCount);
  }, [wishlistCount, prevWishlistCount]);

  // Slider announcements
  const announcements = [
    'Free Shipping on Orders Above ₹999',
    'New Collection Just Arrived - Shop Now',
    'Cash on Delivery Available Across India',
  ];

  useEffect(() => {
    // Listen for custom event to open login modal
    const handleOpenLoginModal = () => {
      setAuthMode('login');
      setAuthModalOpen(true);
    };

    const handleOpenRegisterModal = () => {
      setAuthMode('register');
      setAuthModalOpen(true);
    };
    
    // Click outside handler for profile menu
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (pincodeRef.current && !pincodeRef.current.contains(event.target as Node)) {
        setPincodeOpen(false);
      }
    };
    
    window.addEventListener('openLoginModal', handleOpenLoginModal);
    window.addEventListener('openRegisterModal', handleOpenRegisterModal);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
      window.removeEventListener('openRegisterModal', handleOpenRegisterModal);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch ALL categories for search dropdown
  useEffect(() => {
    fetch('/api/categories?limit=100')
      .then(r => r.json())
      .then(data => { if (data.categories) setCategories(data.categories); })
      .catch(() => {});
  }, []);

  // Debounced live search suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        setSuggestionsLoading(true);
        const params = new URLSearchParams({ search: searchQuery.trim(), limit: '6' });
        if (selectedCategory) params.set('categorySlug', selectedCategory.slug);
        const res = await fetch(`/api/products?${params}`);
        const data = await res.json();
        if (data.success && data.products?.length > 0) {
          setSuggestions(data.products);
          setSuggestionsOpen(true);
        } else {
          setSuggestions([]);
          setSuggestionsOpen(false);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, selectedCategory]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Auto-slide announcements
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % announcements.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [announcements.length]);

  const toggleDropdown = (dropdownId: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownId]: !prev[dropdownId]
    }));
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Starting logout process...');
      
      // Set manual logout flag FIRST
      localStorage.setItem('manualLogout', 'true');
      
      // Clear all auth-related storage immediately
      localStorage.removeItem('token');
      sessionStorage.removeItem('offerPopupShown');
      
      // Dispatch logout to Redux store
      dispatch(logout());
      
      // Sign out from Firebase
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      
      if (auth) {
        await signOut(auth);
        console.log('✅ Firebase signout successful');
      }
      
      // Close profile menu
      setProfileMenuOpen(false);
      
      // Navigate to home page
      router.push('/');
      
      console.log('✅ Logout completed successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if there's an error, ensure user is logged out locally
      localStorage.setItem('manualLogout', 'true');
      localStorage.removeItem('token');
      dispatch(logout());
      setProfileMenuOpen(false);
      router.push('/');
    }
  };

  // Load saved pincode
  useEffect(() => {
    const saved = localStorage.getItem('delivery_pincode');
    if (saved) { setPincode(saved); setPincodeInput(saved); }
    const savedCity = localStorage.getItem('delivery_city');
    if (savedCity) setPincodeCity(savedCity);
  }, []);

  const applyPincode = async () => {
    if (pincodeInput.length !== 6) { setPincodeError('Enter a valid 6-digit pincode'); return; }
    setPincodeLoading(true);
    setPincodeError('');
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincodeInput}`);
      const data = await res.json();
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const city = data[0].PostOffice[0].District || data[0].PostOffice[0].Name;
        setPincode(pincodeInput);
        setPincodeCity(city);
        localStorage.setItem('delivery_pincode', pincodeInput);
        localStorage.setItem('delivery_city', city);
        setPincodeOpen(false);
      } else {
        setPincodeError('Invalid pincode. Please try again.');
      }
    } catch {
      // Fallback: accept pincode without city
      setPincode(pincodeInput);
      setPincodeCity('');
      localStorage.setItem('delivery_pincode', pincodeInput);
      setPincodeOpen(false);
    } finally {
      setPincodeLoading(false);
    }
  };

  return (
    <header 
      className="header-always-visible sticky top-0 w-full shadow-md z-50" 
      style={{ 
        backgroundColor: '#F8F6F2'
      }}
    >
      {/* Top Announcement Slider */}
      <div className="text-white relative overflow-hidden" style={{ backgroundColor: '#B76E79' }}>
        <div className="relative h-10 flex items-center justify-center px-4">

          {/* Slides - Center */}
          <div className="relative w-full h-full flex items-center justify-center">
            {announcements.map((announcement, index) => (
              <div
                key={`announcement-${index}-${announcement.slice(0, 10)}`}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                  index === currentSlide
                    ? 'opacity-100 translate-x-0'
                    : index < currentSlide
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
                }`}
              >
                <span className="text-sm font-medium text-white">{announcement}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 md:h-24">
            {/* Left - Menu Icon only */}
            <div className="flex items-center space-x-4 flex-1">
              {/* Hamburger Menu */}
              <button
                onClick={() => setCategoryMenuOpen(true)}
                className="p-2 transition"
                style={{ color: '#B76E79' }}
                title="Categories"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Center - Logo */}
            <Link href="/" className="flex items-center space-x-3 px-2 sm:px-4 md:px-8">
              <Image
                src="/image/Amoli_2.png"
                alt="Amoli Fashion Jewellery Logo"
                width={200}
                height={75}
                className="object-contain w-[120px] sm:w-[160px] md:w-[200px] h-auto"
                priority
              />
            </Link>

            {/* Right - Icons */}
            <div className="flex items-center justify-end space-x-1 sm:space-x-2 md:space-x-4 flex-1">
              {/* Wishlist - Always visible */}
              <Link 
                href="/account/wishlist" 
                className="relative p-2 transition group"
                style={{ color: '#B76E79' }}
                title="Wishlist"
              >
                <Heart className="h-6 w-6 group-hover:fill-current" />
                {wishlistCount > 0 && (
                  <span 
                    className={`absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold leading-none text-white rounded-full z-10 ${wishlistBounce ? 'animate-bounce-count' : ''}`}
                    style={{ backgroundColor: '#B76E79' }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Profile */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      setProfileMenuOpen(!profileMenuOpen);
                    } else {
                      setAuthMode('login');
                      setAuthModalOpen(true);
                    }
                  }}
                  className="p-2 transition"
                  style={{ color: '#B76E79' }}
                  title={isAuthenticated ? 'Profile Menu' : 'Login'}
                >
                  <ProfileIcon className="h-6 w-6" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isAuthenticated && profileMenuOpen && (
                    <motion.div 
                      className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2"
                      variants={profileDropdownVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                    >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#B76E79' }}>
                          {user?.photoURL
                            ? <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                            : <span className="text-white text-sm font-medium">{user?.displayName?.charAt(0)?.toUpperCase() || 'U'}</span>
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user?.displayName || 'User'}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link href="/account/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileMenuOpen(false)}>
                        <User className="h-4 w-4 mr-3 text-gray-400" />
                        Profile
                      </Link>
                      <Link href="/account/orders" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileMenuOpen(false)}>
                        <Package className="h-4 w-4 mr-3 text-gray-400" />
                        My Orders
                      </Link>
                      <Link href="/account/addresses" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileMenuOpen(false)}>
                        <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                        Addresses
                      </Link>
                      <Link href="/account/wishlist" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileMenuOpen(false)}>
                        <Heart className="h-4 w-4 mr-3 text-gray-400" />
                        Wishlist
                      </Link>
                      <Link href="/account/notifications" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileMenuOpen(false)}>
                        <Bell className="h-4 w-4 mr-3 text-gray-400" />
                        Notifications
                        <span className="ml-auto"><NotificationBell compact /></span>
                      </Link>
                      <Link href="/account/settings" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setProfileMenuOpen(false)}>
                        <Settings className="h-4 w-4 mr-3 text-gray-400" />
                        Settings
                      </Link>
                      {user?.role === 'admin' && (
                        <a href="http://localhost:3001/admin" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors" style={{ color: '#B76E79' }} onClick={() => setProfileMenuOpen(false)}>
                          <Settings className="h-4 w-4 mr-3" style={{ color: '#B76E79' }} />
                          Admin Panel
                        </a>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut className="h-4 w-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart - Always visible */}
              <Link 
                href="/cart" 
                className="relative p-2 transition group"
                style={{ color: '#B76E79' }}
                title="Shopping Cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItemsCount > 0 && (
                  <span 
                    className={`absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold leading-none text-white rounded-full z-10 ${cartBounce ? 'animate-bounce-count' : ''}`}
                    style={{ backgroundColor: '#B76E79' }}
                  >
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Section - Below Logo */}
      <div className="border-b border-gray-200" style={{ backgroundColor: '#F8F6F2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
            {/* Search Bar with Dropdown */}
            <div ref={searchRef} className="relative w-full max-w-xs sm:max-w-md lg:max-w-lg">
            <form 
              className="flex items-center w-full bg-white rounded-lg shadow-sm border border-gray-200 focus-within:border-[#B76E79] focus-within:shadow-[0_0_0_2px_rgba(183,110,121,0.15)] transition-all duration-200"
              onSubmit={(e) => {
                e.preventDefault();
                setSuggestionsOpen(false);
                const params = new URLSearchParams();
                if (searchQuery.trim()) params.set('q', searchQuery.trim());
                if (selectedCategory) params.set('category', selectedCategory.slug);
                router.push(`/search?${params.toString()}`);
              }}
            >
              {/* Category Dropdown — hidden on mobile */}
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="flex items-center px-3 py-2 text-gray-600 font-medium hover:text-gray-800 hover:bg-gray-50 transition-colors min-w-[130px] text-sm rounded-l-lg"
                >
                  <span className="truncate">{selectedCategory ? selectedCategory.name : 'All Categories'}</span>
                  <ChevronDown className={`ml-2 h-3 w-3 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#B76E79' }} />
                </button>

                {/* Dropdown Menu - Sidebar Style */}
                <AnimatePresence>
                  {categoryDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setCategoryDropdownOpen(false)}
                      />
                      <motion.div 
                        className="absolute top-full left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-1 overflow-hidden"
                        variants={searchDropdownVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                      >
                        <div className="max-h-[420px] overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                          {/* All Categories */}
                          <button
                            type="button"
                            onClick={() => { setSelectedCategory(null); setCategoryDropdownOpen(false); router.push('/products'); }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-gray-100 ${!selectedCategory ? 'text-white' : 'text-gray-800 hover:bg-[#F8F6F2]'}`}
                            style={!selectedCategory ? { backgroundColor: '#B76E79' } : {}}
                          >
                            All Categories
                          </button>

                          {/* Dynamic Categories from API */}
                          {categories.length > 0 && (
                            <div className="py-1">
                              <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Categories</p>
                              {categories.map((cat) => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => { setSelectedCategory(cat); setCategoryDropdownOpen(false); router.push(`/products?category=${cat.slug}`); }}
                                  className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors group ${selectedCategory?.slug === cat.slug ? 'text-white font-medium' : 'text-gray-700 hover:bg-[#F8F6F2]'}`}
                                  style={selectedCategory?.slug === cat.slug ? { backgroundColor: '#B76E79' } : {}}
                                >
                                  <span>{cat.name}</span>
                                  <ChevronRight className={`h-3 w-3 flex-shrink-0 ${selectedCategory?.slug === cat.slug ? 'text-white' : 'text-gray-300 group-hover:text-[#B76E79]'}`} />
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Ethnic Collection */}
                          <div className="border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => toggleDropdown('search-ethnic')}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-[#F8F6F2] transition-colors"
                            >
                              <span className="text-[10px] uppercase tracking-widest text-gray-500">Ethnic Collection</span>
                              <ChevronRight className={`h-3 w-3 text-[#B76E79] transition-transform duration-200 ${openDropdowns['search-ethnic'] ? 'rotate-90' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {openDropdowns['search-ethnic'] && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden bg-[#F8F6F2]"
                                >
                                  {[
                                    { label: 'Necklaces', slug: 'necklaces', collection: 'ethnic' },
                                    { label: 'Earrings', slug: 'earrings', collection: 'ethnic' },
                                    { label: 'Rings', slug: 'rings', collection: 'ethnic' },
                                    { label: 'Bangles', slug: 'bangles', collection: 'ethnic' },
                                    { label: 'Tikka', slug: 'tikka', collection: 'ethnic' },
                                  ].map((item) => (
                                    <button
                                      key={item.slug}
                                      type="button"
                                      onClick={() => {
                                        setSelectedCategory({ name: `Ethnic ${item.label}`, slug: item.slug });
                                        setCategoryDropdownOpen(false);
                                        router.push(`/products?category=${item.slug}`);
                                      }}
                                      className="w-full text-left px-6 py-1.5 text-sm text-gray-600 hover:text-[#B76E79] transition-colors"
                                    >
                                      {item.label}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Western Collection */}
                          <div className="border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => toggleDropdown('search-western')}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-[#F8F6F2] transition-colors"
                            >
                              <span className="text-[10px] uppercase tracking-widest text-gray-500">Western Collection</span>
                              <ChevronRight className={`h-3 w-3 text-[#B76E79] transition-transform duration-200 ${openDropdowns['search-western'] ? 'rotate-90' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {openDropdowns['search-western'] && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden bg-[#F8F6F2]"
                                >
                                  {[
                                    { label: 'Jewellery Sets', slug: 'jewellery-sets' },
                                    { label: 'Earrings', slug: 'earrings' },
                                    { label: 'Rings', slug: 'rings' },
                                    { label: 'Wristwear', slug: 'wristwear' },
                                  ].map((item) => (
                                    <button
                                      key={item.slug}
                                      type="button"
                                      onClick={() => {
                                        setSelectedCategory({ name: `Western ${item.label}`, slug: item.slug });
                                        setCategoryDropdownOpen(false);
                                        router.push(`/products?category=${item.slug}`);
                                      }}
                                      className="w-full text-left px-6 py-1.5 text-sm text-gray-600 hover:text-[#B76E79] transition-colors"
                                    >
                                      {item.label}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Minimalist */}
                          <div className="border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => toggleDropdown('search-minimalist')}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-[#F8F6F2] transition-colors"
                            >
                              <span className="text-[10px] uppercase tracking-widest text-gray-500">Minimalist</span>
                              <ChevronRight className={`h-3 w-3 text-[#B76E79] transition-transform duration-200 ${openDropdowns['search-minimalist'] ? 'rotate-90' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {openDropdowns['search-minimalist'] && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden bg-[#F8F6F2]"
                                >
                                  {[
                                    { label: 'Jewellery Sets', slug: 'jewellery-sets' },
                                    { label: 'Earrings', slug: 'earrings' },
                                    { label: 'Rings', slug: 'rings' },
                                    { label: 'Wristwear', slug: 'wristwear' },
                                  ].map((item) => (
                                    <button
                                      key={item.slug}
                                      type="button"
                                      onClick={() => {
                                        setSelectedCategory({ name: `Minimalist ${item.label}`, slug: item.slug });
                                        setCategoryDropdownOpen(false);
                                        router.push(`/products?category=${item.slug}`);
                                      }}
                                      className="w-full text-left px-6 py-1.5 text-sm text-gray-600 hover:text-[#B76E79] transition-colors"
                                    >
                                      {item.label}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Other Sections */}
                          <div className="border-t border-gray-100 py-1">
                            <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Other</p>
                            <button
                              type="button"
                              onClick={() => { setSelectedCategory({ name: 'New Arrivals', slug: 'new-arrivals' }); setCategoryDropdownOpen(false); router.push('/products?sortBy=createdAt'); }}
                              className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-[#F8F6F2] transition-colors group"
                            >
                              <span>New Arrivals</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: '#B76E79' }}>New</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSelectedCategory({ name: 'Best Sellers', slug: 'best-sellers' }); setCategoryDropdownOpen(false); router.push('/products?sortBy=salesCount'); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F8F6F2] transition-colors"
                            >
                              Best Sellers
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider — hidden on mobile */}
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search jewellery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setSuggestionsOpen(true); }}
                className="flex-1 px-3 py-2 bg-transparent border-none outline-none text-gray-800 text-sm font-light tracking-wide placeholder-shown:italic search-input rounded-l-lg sm:rounded-none"
                style={{
                  fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
                  letterSpacing: '0.03em',
                }}
              />

              {/* Search Button */}
              <button
                type="submit"
                className="px-4 py-2 transition-colors flex items-center justify-center rounded-r-lg"
                style={{ color: '#B76E79' }}
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Live Suggestions Dropdown */}
            <AnimatePresence>
              {suggestionsOpen && suggestions.length > 0 && (
                <motion.div
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden"
                  variants={searchDropdownVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  {suggestions.map((product) => {
                    const price = product.specialPrice ?? product.originalPrice;
                    const imgs: string[] = (() => { try { return typeof product.images === 'string' ? JSON.parse(product.images) : product.images; } catch { return []; } })();
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => { setSuggestionsOpen(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          {imgs[0] ? (
                            <img src={imgs[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Search className="h-4 w-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                          <p className="text-xs font-semibold" style={{ color: '#B76E79' }}>₹{price?.toLocaleString('en-IN')}</p>
                        </div>
                      </Link>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setSuggestionsOpen(false);
                      const params = new URLSearchParams();
                      if (searchQuery.trim()) params.set('q', searchQuery.trim());
                      if (selectedCategory) params.set('category', selectedCategory.slug);
                      router.push(`/search?${params.toString()}`);
                    }}
                    className="w-full px-4 py-2.5 text-sm font-medium text-center transition-colors"
                    style={{ color: '#B76E79', backgroundColor: '#f0f7f4' }}
                  >
                    View all results for "{searchQuery}"
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            </div>

            {/* Pincode Widget - next to search bar */}
            <div ref={pincodeRef} className="relative flex-shrink-0">
              <button
                onClick={() => { setPincodeOpen(!pincodeOpen); setPincodeError(''); }}
                className="relative flex items-center justify-center transition-opacity hover:opacity-70"
                style={{ background: 'none', border: 'none', padding: '4px' }}
                title={pincode ? `Delivering to ${pincodeCity || pincode} (${pincode})` : 'Set delivery pincode'}
              >
                <span style={{ fontSize: '20px', lineHeight: 1 }}>📍</span>
                {pincode && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#B76E79' }} />
                )}
              </button>

              {/* Pincode Popover */}
              <AnimatePresence>
                {pincodeOpen && (
                  <motion.div
                    className="absolute top-full right-0 mt-2 w-60 bg-white rounded-xl shadow-xl z-50 p-3.5 border border-gray-100"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#B76E79' }} />
                      <p className="text-sm font-semibold text-gray-800">Delivery Pincode</p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit pincode"
                        value={pincodeInput}
                        onChange={(e) => { setPincodeInput(e.target.value.replace(/\D/g, '')); setPincodeError(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') applyPincode(); }}
                        autoFocus
                        className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-[#B76E79] transition-colors"
                      />
                      <button
                        onClick={applyPincode}
                        disabled={pincodeLoading || pincodeInput.length !== 6}
                        className="px-3 py-1.5 text-white text-xs rounded-lg font-medium disabled:opacity-50 transition-opacity flex-shrink-0"
                        style={{ backgroundColor: '#B76E79' }}
                      >
                        {pincodeLoading ? '...' : 'Apply'}
                      </button>
                    </div>

                    {pincodeError && (
                      <p className="mt-2 text-xs text-red-500">{pincodeError}</p>
                    )}

                    {pincode && pincodeCity && !pincodeError && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 bg-green-50 rounded-lg px-2.5 py-1.5">
                        <span>✓</span>
                        <span>Delivering to <strong>{pincodeCity}</strong> — {pincode}</span>
                      </div>
                    )}

                    {pincode && (
                      <button
                        onClick={() => {
                          setPincode(''); setPincodeInput(''); setPincodeCity(''); setPincodeError('');
                          localStorage.removeItem('delivery_pincode');
                          localStorage.removeItem('delivery_city');
                          setPincodeOpen(false);
                        }}
                        className="mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Clear pincode
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>

      {/* Category Sidebar */}
      <AnimatePresence>
        {categoryMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              className="fixed inset-0 z-40 backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setCategoryMenuOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div 
              className="fixed top-0 left-0 h-screen w-80 shadow-xl z-50 flex flex-col" 
              style={{ backgroundColor: '#F8F6F2' }}
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200" style={{ backgroundColor: '#F8F6F2' }}>
              <div className="flex items-center">
                <Image
                  src="/image/Amoli_2.png"
                  alt="Amoli Fashion Jewellery"
                  width={130}
                  height={45}
                  className="object-contain"
                  priority
                />
              </div>
              <button
                onClick={() => setCategoryMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                style={{ color: '#B76E79' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F8F6F2' }}>
              <div className="p-3 space-y-0.5">
                {/* All Products */}
                <Link
                  href="/products"
                  className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 leading-tight"
                  onClick={() => setCategoryMenuOpen(false)}
                >
                  <span className="font-medium text-sm">All Products</span>
                </Link>

                {/* Categories Section */}
                <div className="pt-3">
                  <div className="px-3 py-1.5">
                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider leading-tight">Categories</h3>
                  </div>
                  
                  {/* Dynamic Categories from API */}
                  <div className="space-y-0.5">
                    {categories.length > 0 ? categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        className="flex items-center justify-between px-6 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded transition-all duration-200 leading-tight group"
                        onClick={() => setCategoryMenuOpen(false)}
                      >
                        <span className="group-hover:text-[#B76E79] transition-colors">{cat.name}</span>
                        <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-[#B76E79] transition-colors" />
                      </Link>
                    )) : (
                      // Fallback hardcoded categories
                      ['Rings', 'Earrings', 'Bracelets', 'Bangles', 'Necklaces', 'Chains', 'Anklets'].map((name) => (
                        <Link
                          key={name}
                          href={`/products?category=${name.toLowerCase()}`}
                          className="flex items-center justify-between px-6 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded transition-all duration-200 leading-tight group"
                          onClick={() => setCategoryMenuOpen(false)}
                        >
                          <span className="group-hover:text-[#B76E79] transition-colors">{name}</span>
                          <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-[#B76E79] transition-colors" />
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                {/* Ethnic Collection */}
                <div className="pt-2">
                  <button
                    onClick={() => toggleDropdown('ethnic')}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white rounded-lg transition-all duration-200 group"
                  >
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#B76E79] transition-colors">Ethnic Collection</h3>
                    <ChevronRight
                      className={`h-4 w-4 transform transition-transform duration-300 ${openDropdowns['ethnic'] ? 'rotate-90' : ''}`}
                      style={{ color: '#B76E79' }}
                    />
                  </button>
                  
                  <AnimatePresence>
                    {openDropdowns['ethnic'] && (
                      <motion.div 
                        className="overflow-hidden dropdown-smooth"
                        style={{ overflow: 'hidden' }}
                        variants={dropdownVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                      >
                      <div className="space-y-0.5 bg-gray-50 rounded-lg p-2 mx-3 dropdown-enter">
                        <Link
                          href="/products?collection=ethnic&category=necklaces"
                          className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-white rounded transition-all duration-200 leading-tight"
                          onClick={() => setCategoryMenuOpen(false)}
                        >
                          Necklaces
                        </Link>
                        <Link
                          href="/products?collection=ethnic&category=earrings"
                          className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-white rounded transition-all duration-200 leading-tight"
                          onClick={() => setCategoryMenuOpen(false)}
                        >
                          Earrings
                        </Link>
                        <Link
                          href="/products?collection=ethnic&category=rings"
                          className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-white rounded transition-all duration-200 leading-tight"
                          onClick={() => setCategoryMenuOpen(false)}
                        >
                          Rings
                        </Link>
                        <Link
                          href="/products?collection=ethnic&category=bangles"
                          className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-white rounded transition-all duration-200 leading-tight"
                          onClick={() => setCategoryMenuOpen(false)}
                        >
                          Bangles
                        </Link>
                        <Link
                          href="/products?collection=ethnic&category=tikka"
                          className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-white rounded transition-all duration-200 leading-tight"
                          onClick={() => setCategoryMenuOpen(false)}
                        >
                          Tikka
                        </Link>
                      </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Western Collection */}
                <div className="pt-2">
                  <button
                    onClick={() => toggleDropdown('western')}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white rounded-lg transition-all duration-200 group"
                  >
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#B76E79] transition-colors">Western Collection</h3>
                    <ChevronRight
                      className={`h-4 w-4 transform transition-transform duration-300 ${openDropdowns['western'] ? 'rotate-90' : ''}`}
                      style={{ color: '#B76E79' }}
                    />
                  </button>
                  
                  <AnimatePresence>
                    {openDropdowns['western'] && (
                      <motion.div 
                        className="overflow-hidden dropdown-smooth"
                        style={{ overflow: 'hidden' }}
                        variants={dropdownVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                      >
                      <div className="space-y-0.5 bg-gray-50 rounded-lg p-2 mx-3 dropdown-enter">
                        <Link
                          href="/products?collection=western&category=jewellery-sets"
                          className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-white rounded transition-all duration-200 leading-tight"
                          onClick={() => setCategoryMenuOpen(false)}
                        >
                          Jewellery Sets
                        </Link>
                        <Link
                          href="/products?collection=western&category=earrings"
                          className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-white rounded transition-all duration-200 leading-tight"
                          onClick={() => setCategoryMenuOpen(false)}
                        >
                          Earrings
                        </Link>
                        <Link
                          href="/products?collection=western&category=rings"
                          className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-white rounded transition-all duration-200 leading-tight"
                          onClick={() => setCategoryMenuOpen(false)}
                        >
                          Rings
                        </Link>
                        <Link
                          href="/products?collection=western&category=wristwear"
                          className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-white rounded transition-all duration-200 leading-tight"
                          onClick={() => setCategoryMenuOpen(false)}
                        >
                          Wristwear
                        </Link>
                      </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Minimalist Collection */}
                <div className="pt-2">
                  <button
                    onClick={() => toggleDropdown('minimalist')}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white rounded-lg transition-all duration-200 group"
                  >
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#B76E79] transition-colors">Minimalist</h3>
                    <ChevronRight
                      className={`h-4 w-4 transform transition-transform duration-300 ${openDropdowns['minimalist'] ? 'rotate-90' : ''}`}
                      style={{ color: '#B76E79' }}
                    />
                  </button>
                  
                  <AnimatePresence>
                    {openDropdowns['minimalist'] && (
                      <motion.div 
                        className="overflow-hidden dropdown-smooth"
                        style={{ overflow: 'hidden' }}
                        variants={dropdownVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                      >
                      <div className="space-y-0.5 bg-gray-50 rounded-lg p-2 mx-3 dropdown-enter">
                        <Link
                          href="/products?collection=minimalist&category=jewellery-sets"
                          className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-white rounded transition-all duration-200 leading-tight"
                          onClick={() => setCategoryMenuOpen(false)}
                        >
                          Jewellery Sets
                        </Link>
                        <Link
                          href="/products?collection=minimalist&category=earrings"
                          className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-white rounded transition-all duration-200 leading-tight"
                          onClick={() => setCategoryMenuOpen(false)}
                        >
                          Earrings
                        </Link>
                        <Link
                          href="/products?collection=minimalist&category=rings"
                          className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-white rounded transition-all duration-200 leading-tight"
                          onClick={() => setCategoryMenuOpen(false)}
                        >
                          Rings
                        </Link>
                        <Link
                          href="/products?collection=minimalist&category=wristwear"
                          className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-white rounded transition-all duration-200 leading-tight"
                          onClick={() => setCategoryMenuOpen(false)}
                        >
                          Wristwear
                        </Link>
                      </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Other Sections */}
                <div className="pt-3 border-t border-gray-200 mt-3">
                  <div className="px-3 py-1.5">
                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider leading-tight">Other Sections</h3>
                  </div>
                  
                  <div className="space-y-0.5">
                    <Link
                      href="/products?filter=new-arrivals"
                      className="flex items-center justify-between px-6 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded transition-all duration-200 leading-tight"
                      onClick={() => setCategoryMenuOpen(false)}
                    >
                      <span>New Arrivals</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#B76E79', color: 'white' }}>New</span>
                    </Link>
                    <Link
                      href="/products?filter=best-seller"
                      className="block px-6 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded transition-all duration-200 leading-tight"
                      onClick={() => setCategoryMenuOpen(false)}
                    >
                      Best Sellers
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </header>
  );
}