'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { AppInitializer } from '@/components/providers/AppInitializer';
import { CookieConsent } from '@/components/common/CookieConsent';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <AppInitializer>
        {children}
      </AppInitializer>
    );
  }

  return (
    <AppInitializer>
      <Header />
      <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F6F2', color: '#1A1A1A' }}>
        {children}
      </main>
      <Footer />
      <CookieConsent />
    </AppInitializer>
  );
}
