export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: '#F8F6F2' }}
    >
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        .loader-name { animation: fadeUp 0.7s ease forwards; }
        .loader-sub { animation: fadeUp 0.7s ease 0.15s both; }
        .loader-bar { animation: fadeUp 0.7s ease 0.3s both; }
        .dot1 { animation: dot 1.4s ease-in-out 0s infinite; }
        .dot2 { animation: dot 1.4s ease-in-out 0.2s infinite; }
        .dot3 { animation: dot 1.4s ease-in-out 0.4s infinite; }
      `}</style>

      {/* Logo mark */}
      <div className="mb-8 loader-name">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" stroke="#B76E79" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
          <circle cx="24" cy="24" r="14" stroke="#B76E79" strokeWidth="1" opacity="0.6" />
          <circle cx="24" cy="24" r="4" fill="#B76E79" />
        </svg>
      </div>

      {/* Brand name */}
      <h1
        className="loader-name font-fairplay text-[#1C1C1C] tracking-[0.25em] uppercase mb-1"
        style={{ fontSize: 'clamp(22px, 5vw, 32px)' }}
      >
        Amoli
      </h1>

      {/* Tagline */}
      <p
        className="loader-sub font-elegant text-gray-400 tracking-[0.4em] uppercase mb-10"
        style={{ fontSize: '9px' }}
      >
        Fashion Jewellery
      </p>

      {/* Animated bar */}
      <div className="loader-bar relative w-32 h-px overflow-hidden" style={{ backgroundColor: '#e8ddd9' }}>
        <div
          className="absolute inset-y-0 left-0 w-1/3"
          style={{
            backgroundColor: '#B76E79',
            animation: 'shimmer 1.6s ease-in-out infinite',
          }}
        />
      </div>

      {/* Dots */}
      <div className="flex gap-1.5 mt-6">
        <span className="dot1 w-1 h-1 rounded-full" style={{ backgroundColor: '#B76E79' }} />
        <span className="dot2 w-1 h-1 rounded-full" style={{ backgroundColor: '#B76E79' }} />
        <span className="dot3 w-1 h-1 rounded-full" style={{ backgroundColor: '#B76E79' }} />
      </div>
    </div>
  );
}
