export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lavender via-white to-lilac">
      <div className="text-center">
        {/* Elegant Purple Loading Animation */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer rotating ring - Purple */}
          <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-purple border-r-purple animate-spin"></div>
          {/* Middle ring - Violet */}
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-violet border-l-violet animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          {/* Inner pulsing circle - Purple Gradient */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-black via-purple to-gray-600 animate-pulse"></div>
          {/* Center sparkle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-gray-50 rounded-full animate-ping shadow-lg"></div>
          </div>
        </div>
        
        {/* Brand Text */}
        <div className="space-y-3">
          <h2 className="text-3xl font-serif text-purple tracking-[0.3em]">Amoli</h2>
          <div className="w-16 h-[1px] bg-purple mx-auto"></div>
          <p className="text-sm text-gray-600 tracking-[0.4em] uppercase font-light">Loading Elegance...</p>
        </div>
      </div>
    </div>
  );
}
