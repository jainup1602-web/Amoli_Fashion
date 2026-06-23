import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FDFCF0] px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-8xl font-playfair text-[#1A1A1A]">404</h1>
        
        <div className="w-16 h-px mx-auto bg-[#B76E79]"></div>
        
        <h2 className="text-2xl font-playfair text-[#1C1C1C]">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 font-light text-sm md:text-base">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="rounded-none border-none tracking-[0.2em] uppercase text-xs px-8 h-12 text-white transition-luxury"
            style={{ backgroundColor: '#1A1A1A' }}
          >
            <Link href="/">
              Return Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-none border-[#1A1A1A] text-[#1A1A1A] tracking-[0.2em] uppercase text-xs px-8 h-12 transition-luxury hover:bg-[#1A1A1A] hover:text-white"
          >
            <Link href="/products">
              Shop Collections
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
