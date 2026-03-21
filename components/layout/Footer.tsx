'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

export function Footer() {
  const { settings } = useAppSelector((state) => state.settings);

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/image/Amoli_2.png"
                alt="Amoli Fashion Jewellery"
                width={180}
                height={65}
                className="object-contain"
                priority
              />
            </Link>
            <p className="text-sm text-gray-600 mb-4">
              {settings?.siteDescription || 'Premium copper and stainless steel jewelry. Nickel-free, skin-friendly, and crafted with care in Rajasthan.'}
            </p>
            <div className="flex space-x-3">
              {settings?.socialLinks?.twitter && (
                <a 
                  href={settings.socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-md hover:text-white transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#B76E79';
                    e.currentTarget.style.borderColor = '#B76E79';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {settings?.socialLinks?.instagram && (
                <a 
                  href={settings.socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-md hover:text-white transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#B76E79';
                    e.currentTarget.style.borderColor = '#B76E79';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {settings?.socialLinks?.facebook && (
                <a 
                  href={settings.socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-md hover:text-white transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#B76E79';
                    e.currentTarget.style.borderColor = '#B76E79';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings?.socialLinks?.youtube && (
                <a 
                  href={settings.socialLinks.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-md hover:text-white transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#B76E79';
                    e.currentTarget.style.borderColor = '#B76E79';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-gray-600 hover:text-black transition-colors">All Products</Link></li>
              <li><Link href="/products?category=new" className="text-gray-600 hover:text-black transition-colors">New Arrivals</Link></li>
              <li><Link href="/products?category=sale" className="text-gray-600 hover:text-black transition-colors">Sale</Link></li>
              <li><Link href="/products?category=featured" className="text-gray-600 hover:text-black transition-colors">Featured</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-600 hover:text-black transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-black transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="text-gray-600 hover:text-black transition-colors">FAQ</Link></li>
              <li><Link href="/account/orders" className="text-gray-600 hover:text-black transition-colors">Track Order</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-black transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-black transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              {settings?.address && (
                <li className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-gray-600" />
                  <span className="text-gray-600">{settings.address}</span>
                </li>
              )}
              {settings?.contactPhone && (
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-gray-600" />
                  <span className="text-gray-600">{settings.contactPhone}</span>
                </li>
              )}
              {settings?.contactEmail && (
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0 text-gray-600" />
                  <span className="text-gray-600">{settings.contactEmail}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <p>©️2026 Amoli Fashion Jewellery. All Rights Reserved</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
