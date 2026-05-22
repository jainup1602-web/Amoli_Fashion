import React from 'react';

export const ServicesSection = () => {
  return (
    <section className="py-16 md:py-24 w-full border-t border-b border-[#e8dccf]" style={{ backgroundColor: '#F3E9DD' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          
          {/* Feature 1 */}
          <div className="flex-1 flex flex-col items-center text-center px-4 md:px-8 py-8 md:py-0 group cursor-pointer">
            <div className="mb-6 transform transition-transform duration-500 group-hover:-translate-y-2">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#1C1C1C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                {/* Ring Box */}
                <path d="M5 15h14v3c0 2-2 3-7 3s-7-1-7-3v-3z" />
                <path d="M4 15h16c1 0 1-1 1-1L19 9c0-2-2-3-7-3S5 7 5 9L3 14c0 0 0 1 1 1z" />
                <path d="M4 14h16" />
                <path d="M10 11c0-2 4-2 4 0" />
                <polygon points="11,9 13,9 12,7" fill="#1C1C1C"/>
                <path d="M5 9c0 1.5 3 2.5 7 2.5s7-1 7-2.5" strokeDasharray="1 3" />
              </svg>
            </div>
            <h3 className="text-[1.35rem] font-playfair text-[#1A1A1A] tracking-wide mb-3">Gift Collection</h3>
            <p className="text-[#595959] text-[0.7rem] leading-[1.6] font-elegant tracking-widest uppercase opacity-80">
              Nibh Nunc Nullam Dignissim Orci Nunc Duis<br />
              Purus Leo Vulputate Vivamus Orci Ornare
            </p>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-[1px] h-32 bg-[#1A1A1A] opacity-[0.08]"></div>
          <div className="block md:hidden w-32 h-[1px] bg-[#1A1A1A] opacity-[0.08] my-2"></div>

          {/* Feature 2 */}
          <div className="flex-1 flex flex-col items-center text-center px-4 md:px-8 py-8 md:py-0 group cursor-pointer">
            <div className="mb-6 transform transition-transform duration-500 group-hover:-translate-y-2">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#1C1C1C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                {/* Diamond */}
                <path d="M3.5 10L12 21.5 20.5 10 16.5 3.5h-9L3.5 10z"/>
                <path d="M3.5 10h17"/>
                <path d="M12 21.5L8.5 10 12 3.5l3.5 6.5L12 21.5z"/>
                <path d="M7.5 3.5l-2 6.5"/>
                <path d="M16.5 3.5l2 6.5"/>
                {/* Sparkles */}
                <path d="M18 1.5l1 1-1 1M21 4.5l1 1-1 1M4 4l-1-1 1-1" strokeWidth="1"/>
              </svg>
            </div>
            <h3 className="text-[1.35rem] font-playfair text-[#1A1A1A] tracking-wide mb-3">Diamond Jewelry</h3>
            <p className="text-[#595959] text-[0.7rem] leading-[1.6] font-elegant tracking-widest uppercase opacity-80">
              Fames Auctor Pellentesque Urna<br />
              Fermentum Vehicula Sociosqu Ante Arcu
            </p>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-[1px] h-32 bg-[#1A1A1A] opacity-[0.08]"></div>
          <div className="block md:hidden w-32 h-[1px] bg-[#1A1A1A] opacity-[0.08] my-2"></div>

          {/* Feature 3 */}
          <div className="flex-1 flex flex-col items-center text-center px-4 md:px-8 py-8 md:py-0 group cursor-pointer">
            <div className="mb-6 transform transition-transform duration-500 group-hover:-translate-y-2">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#1C1C1C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                {/* Wedding Ring */}
                <ellipse cx="12" cy="12" rx="9" ry="4.5" transform="rotate(-25 12 12)" />
                <ellipse cx="12" cy="12" rx="6.5" ry="2.5" transform="rotate(-25 12 12)" />
                {/* Dashed Target/Focus Frame */}
                <path d="M8 9h1.5v-1.5 M8 15h1.5v1.5 M16 9h-1.5v-1.5 M16 15h-1.5v1.5" strokeWidth="1"/>
                <path d="M8 9v1.5h-1.5 M8 15v-1.5h-1.5 M16 9v1.5h1.5 M16 15v-1.5h1.5" strokeWidth="1"/>
              </svg>
            </div>
            <h3 className="text-[1.35rem] font-playfair text-[#1A1A1A] tracking-wide mb-3">Wedding Rings</h3>
            <p className="text-[#595959] text-[0.7rem] leading-[1.6] font-elegant tracking-widest uppercase opacity-80">
              Massa Conubia Tellus Et Netus Tincidunt<br />
              Nascetur Primis MollisLacus Odio
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
