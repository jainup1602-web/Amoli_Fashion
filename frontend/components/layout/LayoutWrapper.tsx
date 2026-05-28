'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { AppInitializer } from '@/components/providers/AppInitializer';
import { CookieConsent } from '@/components/common/CookieConsent';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { ScrollToTopButton } from '@/components/common/ScrollToTopButton';
import { PageTransition } from '@/components/common/PageTransition';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { AnimatePresence, motion } from 'framer-motion';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const [globalLoading, setGlobalLoading] = useState(true);

  useEffect(() => {
    // Show the splash screen for 2.5 seconds on initial load
    const timer = setTimeout(() => {
      setGlobalLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isAdminRoute) {
    return (
      <AppInitializer>
        <PageTransition>{children}</PageTransition>
      </AppInitializer>
    );
  }

  return (
    <AppInitializer>
      <AnimatePresence>
        {globalLoading && (
          <motion.div
            key="global-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] bg-[#FDFCF0]"
          >
            <PageLoader />
          </motion.div>
        )}
      </AnimatePresence>
      <Header />
      <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#FDFCF0', color: '#1A1A1A' }}>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <MobileBottomNav />
      <CookieConsent />
      <WhatsAppButton />
      <ScrollToTopButton />
    </AppInitializer>
  );
}
