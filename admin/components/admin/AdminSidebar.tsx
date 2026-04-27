'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import {
  Home, Package, ShoppingCart, User, Grid, Star, Mail, Truck, Settings,
  Menu, X, CreditCard, Image as ImageIcon, File, ChevronDown, FileText,
  Plus, LogOut, ExternalLink, TrendingUp
} from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';

const menuItems = [
  { title: 'Dashboard', href: '/admin', icon: Home },
  {
    title: 'Products',
    icon: Package,
    submenu: [
      { title: 'All Products', href: '/admin/products' },
      { title: 'Add Product', href: '/admin/products/add' },
    ],
  },
  { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { title: 'Users', href: '/admin/users', icon: User },
  { title: 'Categories', href: '/admin/categories', icon: Grid },
  { title: 'Coupons', href: '/admin/coupons', icon: CreditCard },
  { title: 'Reviews', href: '/admin/reviews', icon: Star },
  { title: 'Video Reviews', href: '/admin/video-reviews', icon: FileText },
  { title: 'Model Gallery', href: '/admin/model-gallery', icon: User },
  { title: 'Marquee', href: '/admin/marquee', icon: TrendingUp },
  { title: 'Banners', href: '/admin/banners', icon: ImageIcon },
  { title: 'Showcases', href: '/admin/showcases', icon: Grid },
  { title: 'Popups', href: '/admin/popups', icon: Plus },
  { title: 'CMS Pages', href: '/admin/cms-pages', icon: File },
  { title: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  { title: 'Shipping', href: '/admin/shipping', icon: Truck },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
  {
    title: 'Reports',
    icon: TrendingUp,
    submenu: [
      { title: 'Top Selling', href: '/admin/reports/top-selling' },
    ],
  },
];

const submenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' as const } },
};

function SidebarContent({
  pathname,
  openSubmenu,
  toggleSubmenu,
  isAuthenticated,
  user,
  onLinkClick,
  onLoginClick,
  onLogout,
}: {
  pathname: string;
  openSubmenu: string | null;
  toggleSubmenu: (t: string) => void;
  isAuthenticated: boolean;
  user: any;
  onLinkClick: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
        <Link href="/admin" onClick={onLinkClick} className="flex items-center gap-3">
          <Image src="/image/Amoli_1.png" alt="Amoli Admin" width={120} height={40} className="object-contain" style={{ width: 'auto', height: 'auto' }} priority />
        </Link>
        <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded text-white" style={{ backgroundColor: '#B76E79' }}>Admin</span>
      </div>

      {/* User info */}
      {isAuthenticated && user ? (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0" style={{ backgroundColor: '#B76E79' }}>
            {user?.displayName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{user?.displayName || 'Admin'}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email || ''}</p>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <button onClick={onLoginClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#B76E79' }}>
            <User className="h-4 w-4 flex-shrink-0" /><span>Login to Admin</span>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openSubmenu === item.title ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {openSubmenu === item.title && (
                      <motion.ul variants={submenuVariants} initial="hidden" animate="visible" exit="exit" className="overflow-hidden mt-1 ml-4 space-y-1">
                        {item.submenu.map((sub, si) => (
                          <li key={si}>
                            <Link href={sub.href} onClick={onLinkClick}
                              className={`block pl-8 pr-4 py-2.5 text-sm rounded-lg transition-colors ${pathname === sub.href ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                              {sub.title}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href={item.href!} onClick={onLinkClick}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${pathname === item.href ? 'bg-gray-100 text-gray-900 font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{item.title}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0 space-y-1">
        <Link href="/" onClick={onLinkClick} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
          <ExternalLink className="h-4 w-4" /><span>Back to Store</span>
        </Link>
        {isAuthenticated && (
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="h-4 w-4" /><span>Logout</span>
          </button>
        )}
      </div>
    </>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const toggleSubmenu = (title: string) => setOpenSubmenu(openSubmenu === title ? null : title);

  const handleLogout = async () => {
    try {
      localStorage.setItem('manualLogout', 'true');
      localStorage.removeItem('token');
      dispatch(logout());
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      if (auth) await signOut(auth);
      router.push('/');
    } catch {
      localStorage.removeItem('token');
      dispatch(logout());
      router.push('/');
    }
  };

  const sharedProps = {
    pathname,
    openSubmenu,
    toggleSubmenu,
    isAuthenticated,
    user,
    onLoginClick: () => setAuthModalOpen(true),
    onLogout: handleLogout,
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg shadow-xl transition-all"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop sidebar — always visible */}
      <aside className="hidden lg:flex w-64 bg-white text-gray-900 fixed left-0 z-40 flex-col shadow-xl border-r border-gray-200 top-0 h-screen">
        <SidebarContent {...sharedProps} onLinkClick={() => {}} />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar — slides in/out */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            className="lg:hidden w-64 bg-white text-gray-900 fixed left-0 z-50 flex flex-col shadow-2xl border-r border-gray-200 top-0 h-screen"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Close button inside mobile sidebar */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 z-10 p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent {...sharedProps} onLinkClick={() => setIsMobileOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="login" />
    </>
  );
}
