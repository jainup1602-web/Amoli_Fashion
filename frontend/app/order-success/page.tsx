'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, Package, Truck } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-[#F9F5F2] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-lg text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8" style={{ backgroundColor: '#B76E79' }}>
          <Check className="h-10 w-10 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-fairplay text-[#1C1C1C] mb-3">Order Confirmed!</h1>
        <p className="text-gray-500 font-light mb-6">Thank you for shopping with us.</p>
        {orderId && (
          <div className="inline-block bg-white border border-gray-200 px-6 py-3 mb-8">
            <p className="text-xs font-elegant tracking-widest uppercase text-gray-400 mb-1">Order ID</p>
            <p className="text-base font-medium text-[#1C1C1C]">{orderId}</p>
          </div>
        )}
        <div className="bg-white border border-gray-100 p-6 mb-8 text-left space-y-5">
          <div className="flex items-start gap-4">
            <Package className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#B76E79' }} />
            <div>
              <p className="text-sm font-medium text-[#1C1C1C]">Order Processing</p>
              <p className="text-xs text-gray-400 font-light mt-0.5">Your order is confirmed and being prepared.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Truck className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#B76E79' }} />
            <div>
              <p className="text-sm font-medium text-[#1C1C1C]">Shipping Updates</p>
              <p className="text-xs text-gray-400 font-light mt-0.5">You will receive tracking details via email once shipped.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="text-white rounded-none border-none tracking-widest uppercase text-xs h-10 px-6" style={{ backgroundColor: '#B76E79' }}>
            <Link href="/account/orders">View My Orders</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-none border-gray-300 text-[#1C1C1C] hover:border-[#B76E79] tracking-widest uppercase text-xs h-10 px-6">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9F5F2] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#B76E79' }} />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
