'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { AppInitializer } from '@/components/providers/AppInitializer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Admin routes have their own layout with header/footer
  if (isAdminRoute) {
    return (
      <AppInitializer>
        {children}
      </AppInitializer>
    );
  }

  // Main site routes get header and footer
  return (
    <AppInitializer>
      <Header />
      <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F6F2', color: '#1A1A1A' }}>
        {children}
      </main>
      <Footer />
    </AppInitializer>
  );
}
