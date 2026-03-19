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
      <div className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Close */}
        <button
          onClick={closePopup}
          className="absolute top-3 right-3 z-10 text-white/80 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div
          className="relative px-8 pt-10 pb-8 text-center text-white"
          style={{ backgroundColor: '#043927' }}
        >
          {popupData.image && (
            <img
              src={popupData.image}
              alt={popupData.title}
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}
          <div className="relative z-10">
            <Star className="h-8 w-8 mx-auto mb-3 opacity-80" />
            <h2 className="text-2xl font-serif font-semibold tracking-wide">{popupData.title}</h2>
            {popupData.subtitle && (
              <p className="text-sm mt-1 opacity-75 tracking-widest uppercase">{popupData.subtitle}</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 text-center">
          {popupData.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-5">{popupData.description}</p>
          )}

          {popupData.offerText && (
            <div
              className="border rounded-lg px-4 py-3 mb-6"
              style={{ borderColor: '#043927', backgroundColor: '#f0f7f4' }}
            >
              <p className="text-sm font-medium" style={{ color: '#043927' }}>
                {popupData.offerText}
              </p>
            </div>
          )}

          <button
            onClick={handleButtonClick}
            className="w-full text-white py-3 rounded-lg text-sm font-semibold tracking-wider uppercase transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#043927' }}
          >
            {popupData.buttonText}
          </button>

          <button
            onClick={closePopup}
            className="mt-3 w-full text-gray-400 hover:text-gray-600 text-xs transition-colors"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
