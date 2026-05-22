'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingCart, User, LayoutGrid } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { items } = useAppSelector((state) => state.cart);
  const cartCount = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const tabs = [
    { href: '/products', label: 'Shop', icon: LayoutGrid },
    { href: '/cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
    { href: '/account/profile', label: 'Account', icon: User },
    { href: '/search', label: 'Search', icon: Search },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1 h-full relative group"
            >
              <div className="relative">
                <Icon
                  className="h-5 w-5 transition-colors duration-200"
                  style={{ color: isActive ? '#1A1A1A' : '#9CA3AF' }}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {tab.badge && tab.badge > 0 && (
                  <span
                    className="absolute -top-2 -right-2.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white rounded-full"
                    style={{ backgroundColor: '#1A1A1A' }}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] mt-1 font-medium tracking-wide transition-colors duration-200"
                style={{ color: isActive ? '#1A1A1A' : '#9CA3AF' }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
