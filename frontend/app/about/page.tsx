'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F6F2' }}>

      {/* Hero */}
      <section className="relative py-20 sm:py-28 text-center overflow-hidden" style={{ backgroundColor: '#B76E79' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl bg-white" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl bg-white" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <p className="text-xs tracking-[0.4em] uppercase text-white/70 mb-4">Our Story</p>
          <h1 className="text-3xl sm:text-5xl font-fairplay text-white leading-tight mb-6">
            Amoli – Because Some Things<br className="hidden sm:block" /> are Truly Priceless.
          </h1>
          <p className="text-white/80 text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed">
            Born in the heart of Rajasthan's jewelry heritage. Crafted for the modern woman.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-3">The Mission</p>
          <div className="w-12 h-px mx-auto" style={{ backgroundColor: '#B76E79' }} />
        </div>
        <p className="text-gray-700 text-base sm:text-lg font-light leading-relaxed text-center max-w-2xl mx-auto mb-6">
          At Amoli, we believe that high-end fashion shouldn't come with a "one-time wear" expiration date. Our journey began with a simple question:
        </p>
        <blockquote className="text-center text-xl sm:text-2xl font-fairplay italic mb-8" style={{ color: '#B76E79' }}>
          "Why should premium, handcrafted jewelry be out of reach for the everyday woman?"
        </blockquote>
        <p className="text-gray-600 text-sm sm:text-base font-light leading-relaxed text-center max-w-2xl mx-auto">
          We realized the market was filled with jewelry that looked beautiful on day one but lost its luster by day ten. We decided to change that.
        </p>
      </section>

      {/* The Promise — 3 pillars */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: '#fff' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-2">The Amoli Promise</p>
            <h2 className="text-2xl sm:text-3xl font-fairplay text-gray-900">
              "Amoli" means priceless — and that is exactly how we want you to feel.
            </h2>
            <div className="w-12 h-px mx-auto mt-4" style={{ backgroundColor: '#B76E79' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: '✦',
                title: 'Handcrafted Integrity',
                desc: 'We move away from mass-produced, glued-on stones. Our pieces feature meticulous prong-setting and artisan craftsmanship that honors the tradition of Rajasthani jewelry-making.',
              },
              {
                icon: '◇',
                title: 'Skin-First Philosophy',
                desc: 'Your comfort is our priority. Every piece is curated to be hypoallergenic and skin-friendly, using premium base metals like brass and copper — no harsh chemicals, ever.',
              },
              {
                icon: '◈',
                title: 'Built to Last',
                desc: 'From our anti-tarnish Western wear to our heavy bridal ethnics, we focus on superior plating that stands the test of time. Quality you can feel from the very first wear.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 border border-gray-100 rounded-sm hover:border-[#B76E79]/30 transition-colors">
                <div className="text-2xl mb-4" style={{ color: '#B76E79' }}>{item.icon}</div>
                <h3 className="font-fairplay text-lg text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we stand for */}
      <section className="py-16 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-2">Our Standards</p>
          <div className="w-12 h-px mx-auto" style={{ backgroundColor: '#B76E79' }} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'No Harsh Chemicals', yes: false },
            { label: 'No Visible Glue', yes: false },
            { label: 'Premium Finishing', yes: true },
            { label: 'Timeless Designs', yes: true },
            { label: 'Anti-Tarnish Coating', yes: true },
            { label: 'Hypoallergenic Metals', yes: true },
          ].map((item) => (
            <div key={item.label} className={`flex items-center gap-3 p-4 rounded-sm border ${item.yes ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
              <span className={`text-lg font-bold ${item.yes ? 'text-green-600' : 'text-red-500'}`}>
                {item.yes ? '✓' : '✗'}
              </span>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 sm:py-20 text-center" style={{ backgroundColor: '#B76E79' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs tracking-[0.3em] uppercase text-white/70 mb-4">Our Vision</p>
          <p className="text-white text-base sm:text-xl font-light leading-relaxed mb-8">
            To empower every woman to build a jewelry wardrobe that reflects her unique personality — without compromising on quality or ethics. Whether it's a minimalist office look or a grand wedding celebration, Amoli is here to make your moments unforgettable.
          </p>
          <Link href="/products"
            className="inline-block px-8 py-3 bg-white text-sm font-medium tracking-widest uppercase transition-opacity hover:opacity-90"
            style={{ color: '#B76E79' }}>
            Shop the Collection
          </Link>
        </div>
      </section>

      {/* Heritage badge */}
      <section className="py-12 text-center max-w-2xl mx-auto px-4">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-3">Heritage</p>
        <p className="text-sm text-gray-600 font-light leading-relaxed">
          Born in the heart of Rajasthan's jewelry heritage — the land of Kundan, Meenakari & Polki. Every Amoli piece carries the soul of centuries-old craftsmanship, reimagined for the modern woman.
        </p>
      </section>

    </div>
  );
}
