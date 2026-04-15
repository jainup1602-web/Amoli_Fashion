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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" style={{ width: '100vw', height: '100vh', left: 0, top: 0 }}>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xs overflow-hidden">
        {/* Close */}
        <button
          onClick={closePopup}
          className="absolute top-2.5 right-2.5 z-10 text-white/80 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div
          className="relative px-5 pt-6 pb-5 text-center text-white"
          style={{ backgroundColor: '#B76E79' }}
        >
          {popupData.image && (
            <img src={popupData.image} alt={popupData.title} className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
          <div className="relative z-10">
            <Star className="h-5 w-5 mx-auto mb-2 opacity-80" />
            <h2 className="text-base font-serif font-semibold tracking-wide">{popupData.title}</h2>
            {popupData.subtitle && (
              <p className="text-[10px] mt-0.5 opacity-75 tracking-widest uppercase">{popupData.subtitle}</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 text-center">
          {popupData.description && (
            <p className="text-gray-600 text-xs leading-relaxed mb-3">{popupData.description}</p>
          )}

          {popupData.offerText && (
            <div className="border rounded px-3 py-2 mb-4" style={{ borderColor: '#B76E79', backgroundColor: '#fdf5f6' }}>
              <p className="text-xs font-medium" style={{ color: '#B76E79' }}>{popupData.offerText}</p>
            </div>
          )}

          <button
            onClick={handleButtonClick}
            className="w-full text-white py-2.5 rounded text-xs font-semibold tracking-wider uppercase transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#B76E79' }}
          >
            {popupData.buttonText}
          </button>

          <button onClick={closePopup} className="mt-2 w-full text-gray-400 hover:text-gray-600 text-[10px] transition-colors">
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
