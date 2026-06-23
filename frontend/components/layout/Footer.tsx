'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, ChevronDown } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

function AccordionSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 px-1 text-sm font-medium tracking-[0.05em] text-[#1A1A1A]"
      >
        <span className="flex-1 text-left uppercase">{title}</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? '400px' : '0px', opacity: open ? 1 : 0 }}
      >
        <div className="pb-4 px-1">{children}</div>
      </div>
    </div>
  );
}

export function Footer() {
  const { settings } = useAppSelector((state) => state.settings);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories?limit=10')
      .then(r => r.json())
      .then(data => {
        if (data.categories) {
          // Explicitly sort categories by order to ensure sequence is maintained
          const sortedCategories = [...data.categories].sort((a, b) => (a.order || 0) - (b.order || 0));
          setCategories(sortedCategories);
        }
      })
      .catch(() => {});
  }, []);

  const socialIconCls = "w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:text-[#1A1A1A] transition-all duration-200";

  return (
    <footer className="border-t border-gray-200 relative z-10" style={{ backgroundColor: '#FDFCF0' }}>

      {/* ── MOBILE ACCORDION (< md) ── */}
      <div className="md:hidden flex flex-col">
        <div className="px-6 pt-10 pb-6">
          {/* Logo + text */}
          <div className="mb-8">
            <Link href="/" className="inline-block mb-4">
              <Image src="/image/Amoli_2.png" alt="Amoli Fashion Jewellery" width={160} height={55} className="object-contain" priority />
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed max-w-[90%] whitespace-pre-line mb-4">
              {settings?.siteDescription || 'Premium Jewellery That Stays as Precious as You.\nFrom timeless traditional designs to contemporary demi-fine pieces, our collection is crafted with anti-tarnish technology and skin-friendly materials for beauty that lasts beyond trends.'}
            </p>

            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>{settings?.address || 'Pratap Colony, Beawar, Rajasthan - 305901'}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <p>{settings?.contactPhone || '+91 9982470002'}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <a href={settings?.socialLinks?.instagram || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href={settings?.socialLinks?.facebook || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
              </a>
              <a href={settings?.socialLinks?.twitter || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href={settings?.socialLinks?.youtube || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          {/* Accordion sections */}
          <div className="mb-4">
            <AccordionSection title="Categories">
              <ul className="space-y-3 text-sm text-gray-600 text-left">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/products?category=${cat.slug}`} className="hover:text-[#1A1A1A] transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionSection>

            <AccordionSection title="Care">
              <ul className="space-y-3 text-sm text-gray-600 text-left">
                <li><Link href="/faq" className="hover:text-[#1A1A1A] transition-colors">FAQs</Link></li>
                <li><Link href="/jewellery-care" className="hover:text-[#1A1A1A] transition-colors">Jewellery Care</Link></li>
                <li><Link href="/size-guide" className="hover:text-[#1A1A1A] transition-colors">Size Guide</Link></li>
              </ul>
            </AccordionSection>

            <AccordionSection title="About">
              <ul className="space-y-3 text-sm text-gray-600 text-left">
                <li><Link href="/about" className="hover:text-[#1A1A1A] transition-colors">Our Story</Link></li>
                <li><Link href="/contact" className="hover:text-[#1A1A1A] transition-colors">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-[#1A1A1A] transition-colors">Terms And Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-[#1A1A1A] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/shipping-policy" className="hover:text-[#1A1A1A] transition-colors">Shipping & Delivery</Link></li>
                <li><Link href="/return-policy" className="hover:text-[#1A1A1A] transition-colors">Return & Exchange Policy</Link></li>
              </ul>
            </AccordionSection>

            <AccordionSection title="Newsletter Signup">
              <div className="pt-2">
                <p className="text-sm text-gray-600 mb-3">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
                <div className="flex w-full">
                  <input type="email" placeholder="Enter your email" className="w-full bg-transparent border-b border-gray-400 py-2 text-sm focus:outline-none focus:border-[#1A1A1A] transition-colors text-[#1A1A1A]" />
                  <button className="border-b border-gray-400 py-2 px-3 text-sm font-medium hover:text-[#D4AF37] transition-colors">SUBSCRIBE</button>
                </div>
              </div>
            </AccordionSection>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bg-[#1A1A1A] pt-5 pb-[5.5rem] px-4 text-center">
          <p className="text-white text-sm font-medium">
            All rights reserved © Amoli Fashion Jewellery
          </p>
        </div>
      </div>

      {/* ── DESKTOP GRID (md+) ── */}
      <div className="hidden md:block container-custom pt-16 pb-0">
        <div className="grid grid-cols-5 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <Image src="/image/Amoli_2.png" alt="Amoli Fashion Jewellery" width={180} height={65} className="object-contain" priority />
            </Link>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed whitespace-pre-line">
              {settings?.siteDescription || 'Premium Jewellery That Stays as Precious as You.\nFrom timeless traditional designs to contemporary demi-fine pieces, our collection is crafted with anti-tarnish technology and skin-friendly materials for beauty that lasts beyond trends.'}
            </p>

            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>{settings?.address || 'Pratap Colony, Beawar, Rajasthan - 305901'}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <p>{settings?.contactPhone || '+91 9982470002'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <a href={settings?.socialLinks?.instagram || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href={settings?.socialLinks?.facebook || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
              </a>
              <a href={settings?.socialLinks?.twitter || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href={settings?.socialLinks?.youtube || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-6 text-sm tracking-widest uppercase text-[#1A1A1A]">Categories</h4>
            <ul className="space-y-4 text-sm">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/products?category=${cat.slug}`} className="text-gray-600 hover:text-[#1A1A1A] transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Care */}
          <div>
            <h4 className="font-semibold mb-6 text-sm tracking-widest uppercase text-[#1A1A1A]">Care</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/faq" className="text-gray-600 hover:text-[#1A1A1A] transition-colors">FAQs</Link></li>
              <li><Link href="/jewellery-care" className="text-gray-600 hover:text-[#1A1A1A] transition-colors">Jewellery Care</Link></li>
              <li><Link href="/size-guide" className="text-gray-600 hover:text-[#1A1A1A] transition-colors">Size Guide</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold mb-6 text-sm tracking-widest uppercase text-[#1A1A1A]">About</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/about" className="text-gray-600 hover:text-[#1A1A1A] transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-[#1A1A1A] transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping-policy" className="text-gray-600 hover:text-[#1A1A1A] transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/return-policy" className="text-gray-600 hover:text-[#1A1A1A] transition-colors">Return Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-[#1A1A1A] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-[#1A1A1A] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="font-semibold mb-6 text-sm tracking-widest uppercase text-[#1A1A1A]">Newsletter Signup</h4>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <div className="flex w-full mt-4">
              <input type="email" placeholder="Enter your email" className="w-full bg-transparent border-b border-gray-400 py-2 text-sm focus:outline-none focus:border-[#1A1A1A] transition-colors text-[#1A1A1A]" />
              <button className="border-b border-gray-400 py-2 px-3 text-sm font-medium hover:text-[#D4AF37] transition-colors">SUBSCRIBE</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop Bottom Bar */}
      <div className="hidden md:block bg-[#1A1A1A] py-5">
        <div className="container-custom flex justify-center text-sm">
          <p className="text-white font-medium">
            All rights reserved © Amoli Fashion Jewellery
          </p>
        </div>
      </div>

    </footer>
  );
}
