'use client';

export default function OfflinePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: '#FDFCF0' }}
    >
      {/* Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/image/Amoli_2.png"
        alt="Amoli Fashion Jewellery"
        className="w-36 h-auto object-contain mb-8 opacity-80"
      />

      {/* Offline icon */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#F3E9DD' }}>
        <svg className="w-8 h-8 text-[#8a7560]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M8.111 8.111A5.5 5.5 0 0112 7c1.657 0 3.156.733 4.19 1.9M15.536 15.536A5.5 5.5 0 0112 17a5.5 5.5 0 01-3.536-1.464M1.5 8.5a11 11 0 0121 0M5.5 12.5a7 7 0 0113 0" />
        </svg>
      </div>

      <h1 className="text-2xl font-playfair text-[#1A1A1A] mb-3">You're Offline</h1>
      <p className="text-sm text-gray-500 font-light max-w-xs leading-relaxed mb-8">
        It looks like you've lost your internet connection. Some pages may still be available from your last visit.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="/"
          className="px-6 py-2.5 text-xs font-semibold tracking-widest uppercase text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: '#1A1A1A' }}
        >
          Go to Home
        </a>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 text-xs font-semibold tracking-widest uppercase border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Try Again
        </button>
      </div>

      <p className="text-[10px] text-gray-400 mt-10 tracking-widest uppercase font-elegant">
        Amoli Fashion Jewellery
      </p>
    </div>
  );
}
