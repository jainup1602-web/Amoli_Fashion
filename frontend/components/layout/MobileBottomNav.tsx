'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, LayoutGrid, X, Package, MapPin, Heart, Bell, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useState, useEffect } from 'react';
import { logout } from '@/store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ProfileIcon } from '@/components/icons/ProfileIcon';

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [mounted, setMounted] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  // Hide WhatsApp button when account panel is open
  useEffect(() => {
    window.dispatchEvent(new Event(accountOpen ? 'waHide' : 'waShow'));
  }, [accountOpen]);

  useEffect(() => { setMounted(true); }, []);

  // Close panel on route change
  useEffect(() => { setAccountOpen(false); }, [pathname]);

  // Lock body scroll when panel open
  useEffect(() => {
    document.body.style.overflow = accountOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [accountOpen]);

  const cartCount = mounted
    ? (items?.reduce((sum, item) => sum + item.quantity, 0) || 0)
    : 0;

  const handleLogout = async () => {
    setAccountOpen(false);
    try {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      if (auth) await signOut(auth);
    } catch {}
    localStorage.setItem('manualLogout', 'true');
    localStorage.removeItem('token');
    dispatch(logout());
    router.push('/');
  };

  const handleAccountTab = () => {
    if (!isAuthenticated) {
      // Open login modal via custom event
      window.dispatchEvent(new Event('openLoginModal'));
    } else {
      setAccountOpen(true);
    }
  };

  const menuItems = [
    { href: '/account/profile',       label: 'Profile',       icon: User },
    { href: '/account/orders',        label: 'My Orders',     icon: Package },
    { href: '/account/addresses',     label: 'Addresses',     icon: MapPin },
    { href: '/account/wishlist',      label: 'Wishlist',      icon: Heart },
    { href: '/account/notifications', label: 'Notifications', icon: Bell, extra: true },
    { href: '/account/settings',      label: 'Settings',      icon: Settings },
  ];

  const isAccountActive = pathname.startsWith('/account');

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden">
        <div className="flex items-center justify-around h-16">

          {/* Shop */}
          <Link
            href="/products"
            className="flex flex-col items-center justify-center flex-1 h-full"
          >
            <LayoutGrid
              className="h-5 w-5 transition-colors duration-200"
              style={{ color: pathname === '/products' || pathname.startsWith('/products/') ? '#1A1A1A' : '#9CA3AF' }}
              strokeWidth={pathname === '/products' || pathname.startsWith('/products/') ? 2.2 : 1.8}
            />
            <span className="text-[10px] mt-1 font-medium tracking-wide" style={{ color: pathname === '/products' || pathname.startsWith('/products/') ? '#1A1A1A' : '#9CA3AF' }}>
              Shop
            </span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="flex flex-col items-center justify-center flex-1 h-full"
          >
            <div className="relative">
              <ShoppingCart
                className="h-5 w-5 transition-colors duration-200"
                style={{ color: pathname === '/cart' ? '#1A1A1A' : '#9CA3AF' }}
                strokeWidth={pathname === '/cart' ? 2.2 : 1.8}
              />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white rounded-full" style={{ backgroundColor: '#1A1A1A' }}>
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium tracking-wide" style={{ color: pathname === '/cart' ? '#1A1A1A' : '#9CA3AF' }}>
              Cart
            </span>
          </Link>

          {/* Account */}
          <button
            onClick={handleAccountTab}
            className="flex flex-col items-center justify-center flex-1 h-full"
          >
            <ProfileIcon
              className="h-5 w-5 transition-colors duration-200"
              style={{ color: isAccountActive || accountOpen ? '#1A1A1A' : '#9CA3AF' }}
            />
            <span className="text-[10px] mt-1 font-medium tracking-wide" style={{ color: isAccountActive || accountOpen ? '#1A1A1A' : '#9CA3AF' }}>
              Account
            </span>
          </button>

          {/* Search */}
          <Link
            href="/search"
            className="flex flex-col items-center justify-center flex-1 h-full"
          >
            <Search
              className="h-5 w-5 transition-colors duration-200"
              style={{ color: pathname === '/search' ? '#1A1A1A' : '#9CA3AF' }}
              strokeWidth={pathname === '/search' ? 2.2 : 1.8}
            />
            <span className="text-[10px] mt-1 font-medium tracking-wide" style={{ color: pathname === '/search' ? '#1A1A1A' : '#9CA3AF' }}>
              Search
            </span>
          </Link>

        </div>
      </nav>

      {/* Account Slide-Up Panel */}
      <AnimatePresence>
        {accountOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[60] md:hidden"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setAccountOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[70] md:hidden rounded-t-2xl overflow-hidden"
              style={{ backgroundColor: '#FDFCF0' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>

              {/* User Info Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#1A1A1A' }}
                  >
                    {user?.photoURL
                      ? <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                      : <span className="text-white text-base font-semibold">{user?.displayName?.charAt(0)?.toUpperCase() || 'U'}</span>
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAccountOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="px-3 py-2">
                {menuItems.map(({ href, label, icon: Icon, extra }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center justify-between px-3 py-3.5 rounded-xl hover:bg-white transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3F0EB' }}>
                        <Icon className="h-4 w-4" style={{ color: '#1A1A1A' }} />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {extra && <NotificationBell compact />}
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </Link>
                ))}

                {/* Admin Panel — only for admins */}
                {user?.role === 'admin' && (
                  <a
                    href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001/admin'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center justify-between px-3 py-3.5 rounded-xl hover:bg-white transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                        <Settings className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="text-sm font-medium text-amber-700">Admin Panel</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </a>
                )}
              </div>

              {/* Logout */}
              <div className="px-3 pb-4 pt-1 border-t border-gray-100 mx-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-3.5 rounded-xl hover:bg-red-50 transition-colors group mt-2"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50">
                    <LogOut className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-red-600">Logout</span>
                </button>
              </div>

              {/* Safe area spacer for bottom nav */}
              <div className="h-16" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
