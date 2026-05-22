'use client';

import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';

interface PopupData {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  offerText?: string;
  buttonText: string;
  buttonLink: string;
  showDelay: number;
}

export function OfferPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [popupData, setPopupData] = useState<PopupData | null>(null);

  useEffect(() => {
    const popupShown = sessionStorage.getItem('offerPopupShown');
    if (!popupShown) {
      fetchPopupData();
    }
  }, []);

  const fetchPopupData = async () => {
    try {
      const response = await fetch('/api/popup');
      const data = await response.json();

      if (data.success && data.popup) {
        setPopupData(data.popup);
        setTimeout(() => setIsVisible(true), data.popup.showDelay || 2000);
      } else {
        const fallback: PopupData = {
          id: 'fallback',
          title: 'Exclusive Offer',
          subtitle: 'Welcome to Amoli',
          description: 'Discover our premium jewelry collection crafted with love and precision.',
          image: '',
          offerText: 'Shop for ₹1000+ & Get 10% Extra Discount',
          buttonText: 'Shop Now',
          buttonLink: '/products',
          showDelay: 2000,
        };
        setPopupData(fallback);
        setTimeout(() => setIsVisible(true), fallback.showDelay);
      }
    } catch {
      const fallback: PopupData = {
        id: 'fallback',
        title: 'Exclusive Offer',
        subtitle: 'Welcome to Amoli',
        description: 'Discover our premium jewelry collection crafted with love and precision.',
        image: '',
        offerText: 'Shop for ₹1000+ & Get 10% Extra Discount',
        buttonText: 'Shop Now',
        buttonLink: '/products',
        showDelay: 2000,
      };
      setPopupData(fallback);
      setTimeout(() => setIsVisible(true), fallback.showDelay);
    }
  };

  const closePopup = () => {
    setIsVisible(false);
    sessionStorage.setItem('offerPopupShown', 'true');
  };

  const handleButtonClick = () => {
    closePopup();
    if (popupData?.buttonLink) {
      window.location.href = popupData.buttonLink;
    }
  };

  if (!isVisible || !popupData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row min-h-[450px]">
        {/* Close Button */}
        <button
          onClick={closePopup}
          className="absolute top-3 right-3 z-20 text-gray-500 hover:text-gray-800 transition-colors bg-white/80 hover:bg-white rounded-full p-1.5 shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Side: Content */}
        <div className="flex-1 flex flex-col justify-center text-center px-8 py-10 md:py-12 bg-white relative z-10">
          <Star className="h-8 w-8 mx-auto mb-4" style={{ color: '#1A1A1A' }} />
          
          <h2 className="text-2xl md:text-3xl font-serif font-semibold tracking-wide text-gray-900 mb-2">
            {popupData.title}
          </h2>
          
          {popupData.subtitle && (
            <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: '#1A1A1A' }}>
              {popupData.subtitle}
            </p>
          )}

          {popupData.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-6 px-2">
              {popupData.description}
            </p>
          )}

          {popupData.offerText && (
            <div
              className="border border-dashed rounded-lg px-4 py-3 mb-6 mx-auto w-full max-w-xs"
              style={{ borderColor: '#1A1A1A', backgroundColor: '#fdf5f6' }}
            >
              <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                {popupData.offerText}
              </p>
            </div>
          )}

          <button
            onClick={handleButtonClick}
            className="w-full max-w-xs mx-auto text-white py-3 px-6 rounded text-sm font-semibold tracking-wider uppercase transition-opacity hover:opacity-90 shadow-md"
            style={{ backgroundColor: '#1A1A1A' }}
          >
            {popupData.buttonText}
          </button>

          <button
            onClick={closePopup}
            className="mt-4 w-full text-gray-400 hover:text-gray-600 text-xs transition-colors underline-offset-4 hover:underline"
          >
            No thanks
          </button>
        </div>

        {/* Right Side: Image */}
        <div className="flex-1 relative hidden md:block bg-gray-100">
          {popupData.image ? (
            <img
              src={popupData.image}
              alt={popupData.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-[#1A1A1A]">
              <img
                src="https://images.unsplash.com/photo-1599643478524-fb66f70d00a8?q=80&w=1000&auto=format&fit=crop"
                alt="Jewelry Offer"
                className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
