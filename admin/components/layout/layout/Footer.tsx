'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, ChevronDown } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

function AccordionSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 px-1 text-xs font-semibold tracking-[0.18em] uppercase text-gray-700"
      >
        <span className="flex-1 text-center">{title}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
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

  const socialIconCls = "w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:border-[#B76E79] hover:text-[#B76E79] transition-all duration-200";

  return (
    <footer className="border-t border-gray-200 bg-gray-50">

      {/* ── MOBILE ACCORDION (< md) ── */}
      <div className="md:hidden px-4 pt-6 pb-2" style={{ backgroundColor: '#F8F6F2' }}>
        {/* Logo + social */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-3">
            <Image src="/image/Amoli_2.png" alt="Amoli Fashion Jewellery" width={140} height={50} className="object-contain mx-auto" priority />
          </Link>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            {settings?.siteDescription || 'Premium jewellery crafted with care in Rajasthan.'}
          </p>
          <div className="flex justify-center gap-3">
            <a href={settings?.socialLinks?.facebook || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}><Facebook className="h-4 w-4" /></a>
            <a href={settings?.socialLinks?.instagram || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}><Instagram className="h-4 w-4" /></a>
            <a href={settings?.socialLinks?.twitter || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}><Twitter className="h-4 w-4" /></a>
            <a href={settings?.socialLinks?.youtube || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}><Youtube className="h-4 w-4" /></a>
          </div>
        </div>

        {/* Accordion sections */}
        <AccordionSection title="Care">
          <ul className="space-y-3 text-sm text-gray-700 text-center">
            <li><Link href="/account/orders" className="hover:text-[#B76E79] transition-colors">Track Your Order</Link></li>
            <li><Link href="/terms" className="hover:text-[#B76E79] transition-colors">Terms And Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-[#B76E79] transition-colors">Privacy Policy</Link></li>
            <li><Link href="/faq" className="hover:text-[#B76E79] transition-colors">Return Policy</Link></li>
            <li><Link href="/faq" className="hover:text-[#B76E79] transition-colors">Exchange / Return</Link></li>
          </ul>
        </AccordionSection>

        <AccordionSection title="Shop">
          <ul className="space-y-3 text-sm text-gray-700 text-center">
            <li><Link href="/products" className="hover:text-[#B76E79] transition-colors">All Products</Link></li>
            <li><Link href="/products?filter=new-arrivals" className="hover:text-[#B76E79] transition-colors">New Arrivals</Link></li>
            <li><Link href="/products?sortBy=salesCount" className="hover:text-[#B76E79] transition-colors">Best Sellers</Link></li>
            <li><Link href="/products?featured=true" className="hover:text-[#B76E79] transition-colors">Featured</Link></li>
          </ul>
        </AccordionSection>

        <AccordionSection title="Contact Us">
          <ul className="space-y-3 text-sm text-gray-700 text-center">
            {settings?.address && (
              <li>{settings.address}</li>
            )}
            {settings?.contactPhone && (
              <li><a href={`tel:${settings.contactPhone}`} className="hover:text-[#B76E79] transition-colors">{settings.contactPhone}</a></li>
            )}
            {settings?.contactEmail && (
              <li><a href={`mailto:${settings.contactEmail}`} className="hover:text-[#B76E79] transition-colors">{settings.contactEmail}</a></li>
            )}
            <li><Link href="/contact" className="hover:text-[#B76E79] transition-colors">Send us a message</Link></li>
          </ul>
        </AccordionSection>

        <AccordionSection title="Popular Categories">
          <ul className="space-y-3 text-sm text-gray-700 text-center">
            <li><Link href="/products?category=rings" className="hover:text-[#B76E79] transition-colors">Rings</Link></li>
            <li><Link href="/products?category=earrings" className="hover:text-[#B76E79] transition-colors">Earrings</Link></li>
            <li><Link href="/products?category=necklaces" className="hover:text-[#B76E79] transition-colors">Necklaces</Link></li>
            <li><Link href="/products?category=bangles" className="hover:text-[#B76E79] transition-colors">Bangles</Link></li>
            <li><Link href="/products?category=bracelets" className="hover:text-[#B76E79] transition-colors">Bracelets</Link></li>
          </ul>
        </AccordionSection>

        {/* Bottom bar */}
        <div className="py-5 text-center text-xs text-gray-400">
          <p>&copy; 2026 Amoli Fashion Jewellery. All Rights Reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/terms" className="hover:text-[#B76E79] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#B76E79] transition-colors">Privacy</Link>
          </div>
        </div>
      </div>

      {/* ── DESKTOP GRID (md+) ── */}
      <div className="hidden md:block container-custom py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image src="/image/Amoli_2.png" alt="Amoli Fashion Jewellery" width={180} height={65} className="object-contain" priority />
            </Link>
            <p className="text-sm text-gray-600 mb-4">
              {settings?.siteDescription || 'Premium copper and stainless steel jewelry. Nickel-free, skin-friendly, and crafted with care in Rajasthan.'}
            </p>
            <div className="flex space-x-3">
              <a href={settings?.socialLinks?.facebook || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}><Facebook className="h-4 w-4" /></a>
              <a href={settings?.socialLinks?.instagram || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}><Instagram className="h-4 w-4" /></a>
              <a href={settings?.socialLinks?.twitter || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}><Twitter className="h-4 w-4" /></a>
              <a href={settings?.socialLinks?.youtube || '#'} target="_blank" rel="noopener noreferrer" className={socialIconCls}><Youtube className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-gray-600 hover:text-[#B76E79] transition-colors">All Products</Link></li>
              <li><Link href="/products?filter=new-arrivals" className="text-gray-600 hover:text-[#B76E79] transition-colors">New Arrivals</Link></li>
              <li><Link href="/products?sortBy=salesCount" className="text-gray-600 hover:text-[#B76E79] transition-colors">Best Sellers</Link></li>
              <li><Link href="/products?featured=true" className="text-gray-600 hover:text-[#B76E79] transition-colors">Featured</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-600 hover:text-[#B76E79] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-[#B76E79] transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="text-gray-600 hover:text-[#B76E79] transition-colors">FAQ</Link></li>
              <li><Link href="/account/orders" className="text-gray-600 hover:text-[#B76E79] transition-colors">Track Order</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-[#B76E79] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-[#B76E79] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide uppercase">Contact</h4>
            <ul className="space-y-3 text-sm">
              {settings?.address && (
                <li className="flex items-start"><MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-gray-500" /><span className="text-gray-600">{settings.address}</span></li>
              )}
              {settings?.contactPhone && (
                <li className="flex items-center"><Phone className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" /><span className="text-gray-600">{settings.contactPhone}</span></li>
              )}
              {settings?.contactEmail && (
                <li className="flex items-center"><Mail className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" /><span className="text-gray-600">{settings.contactEmail}</span></li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; 2026 Amoli Fashion Jewellery. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-[#B76E79] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#B76E79] transition-colors">Privacy</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
