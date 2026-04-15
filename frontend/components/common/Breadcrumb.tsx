'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-[10px] text-gray-500 mb-4 overflow-hidden font-elegant tracking-widest uppercase">
      <Link href="/" className="hover:text-primary flex items-center flex-shrink-0">
        <Home className="h-3 w-3" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1 min-w-0">
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          {item.href ? (
            <Link href={item.href} className="hover:text-primary flex-shrink-0 whitespace-nowrap">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-medium truncate">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
