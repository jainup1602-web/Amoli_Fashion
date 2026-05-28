export default function Loading() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ backgroundColor: '#FDFCF0', zIndex: 2147483647 }}
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

      {/* Amoli Logo */}
      <div className="mb-6 loader-name">
        <img
          src="/image/Amoli_2.png"
          alt="Amoli Fashion Jewellery"
          style={{ width: '160px', height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Animated bar */}
      <div className="loader-bar relative w-32 h-px overflow-hidden mb-10" style={{ backgroundColor: '#e8ddd9' }}>
        <div
          className="absolute inset-y-0 left-0 w-1/3"
          style={{
            backgroundColor: '#1A1A1A',
            animation: 'shimmer 1.6s ease-in-out infinite',
          }}
        />
      </div>

      {/* Dots */}
      <div className="flex gap-1.5 mt-6">
        <span className="dot1 w-1 h-1 rounded-full" style={{ backgroundColor: '#1A1A1A' }} />
        <span className="dot2 w-1 h-1 rounded-full" style={{ backgroundColor: '#1A1A1A' }} />
        <span className="dot3 w-1 h-1 rounded-full" style={{ backgroundColor: '#1A1A1A' }} />
      </div>
    </div>
  );
}
