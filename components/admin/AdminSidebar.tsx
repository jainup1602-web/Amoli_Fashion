'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Package,
  ShoppingCart,
  User,
  Grid,
  Star,
  Mail,
  Truck,
  Settings,
  Menu,
  X,
  CreditCard,
  Image as ImageIcon,
  File,
  ChevronDown,
  FileText,
  Plus
} from 'lucide-react';

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
  { title: 'Banners', href: '/admin/banners', icon: ImageIcon },
  { title: 'Showcases', href: '/admin/showcases', icon: Grid },
  { title: 'Popups', href: '/admin/popups', icon: Plus },
  { title: 'CMS Pages', href: '/admin/cms-pages', icon: File },
  { title: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  { title: 'Shipping', href: '/admin/shipping', icon: Truck },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
];

// Sidebar slide-in from left
const sidebarVariants = {
  hidden: { x: -256, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

// Stagger container for nav items
const navContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045, delayChildren: 0.1 },
  },
};

// Each nav item fades + slides in from left
const navItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

// Submenu expand/collapse
const submenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

// Mobile overlay fade
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-[144px] left-4 z-50 p-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg shadow-xl transition-all"
        aria-label="Toggle menu"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isMobileMenuOpen ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={toggleMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className={`
          w-64 bg-white text-gray-900 fixed left-0 z-40
          flex flex-col shadow-2xl border-r border-gray-200
          top-[136px] h-[calc(100vh-136px)]
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <Link
            href="/admin"
            className="flex items-center gap-3 group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Image
              src="/image/Amoli_1.png"
              alt="Amoli Fashion Admin"
              width={120}
              height={40}
              className="object-contain"
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </Link>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto py-4">
          <motion.ul
            className="space-y-1 px-3"
            variants={navContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {menuItems.map((item, index) => (
              <motion.li key={index} variants={navItemVariants}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.title)}
                      className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium text-sm">{item.title}</span>
                      </div>
                      <motion.span
                        animate={{ rotate: openSubmenu === item.title ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {openSubmenu === item.title && (
                        <motion.ul
                          variants={submenuVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="overflow-hidden mt-1 ml-4 space-y-1"
                        >
                          {item.submenu.map((subItem, subIndex) => (
                            <motion.li
                              key={subIndex}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: subIndex * 0.06, duration: 0.2 }}
                            >
                              <Link
                                href={subItem.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block pl-8 pr-4 py-2.5 text-sm rounded-lg transition-colors ${
                                  pathname === subItem.href
                                    ? 'bg-gray-100 text-gray-900 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                {subItem.title}
                              </Link>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group ${
                      pathname === item.href
                        ? 'bg-gray-100 text-gray-900 font-semibold shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <motion.span
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                    </motion.span>
                    <span className="font-medium text-sm">{item.title}</span>
                  </Link>
                )}
              </motion.li>
            ))}
          </motion.ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span>← Back to Store</span>
          </Link>
        </div>
      </motion.aside>
    </>
  );
}
