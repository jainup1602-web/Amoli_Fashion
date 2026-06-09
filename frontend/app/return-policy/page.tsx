'use client';

import { 
  RotateCcw, 
  Package, 
  MousePointer2, 
  CreditCard, 
  Gem, 
  Ban,
  Video
} from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import Link from 'next/link';

export default function ReturnPolicyPage() {
  const policies = [
    {
      title: 'Return Conditions',
      icon: <Package className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed font-light">
          <p>
            Please be sure that all items that are to be returned or exchanged, must be unworn and in their original condition with all original tags and packaging intact.
          </p>
          <p>
            Any items that were damaged during transit must also bear the tag for us to process the return. Items that are damaged or altered once the tags are removed, may not be accepted and will be sent back to the customer.
          </p>
          <p className="font-medium text-gray-900">
            Shipping amount is non-refundable.
          </p>
          <div className="flex items-start gap-3 mt-4 p-4 border rounded-sm bg-gray-50/50" style={{ borderColor: 'rgba(183, 110, 121, 0.2)' }}>
            <Video className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1A1A1A' }} />
            <p className="text-sm">
              An <strong className="font-medium text-gray-900">unboxing video</strong> is required to process any claims for missing items in your order. Please ensure you record the package being opened from the sealed state for your claim to be considered.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'How to Schedule a Return or Exchange',
      icon: <MousePointer2 className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <div className="space-y-4 text-gray-600 font-light">
          <p>
            WhatsApp us on: <a href="https://wa.me/919982470002" className="text-[#1A1A1A] font-medium hover:underline">+91-9982470002</a> with images of the products with packaging and tags to schedule a return pick up.
          </p>
          <p>
            Subsequent to this, your package will be picked up by our courier partner at no extra cost to you within <strong className="font-medium text-gray-900">3-5 business days</strong>.
          </p>
          <p>
            You can exchange an item purchased on www.amolijewels.com with the same item or another one, however, all exchanges are subject to stock availability.
          </p>
        </div>
      )
    },
    {
      title: 'Refunds & Store Credit',
      icon: <CreditCard className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed font-light">
          <p>
            Once the item is picked up, we will credit the amount of that item as <strong className="font-medium text-gray-900">STORE CREDIT</strong> in your account.
          </p>
          <p>
            You can use this store credit for your future purchases on our website.
          </p>
        </div>
      )
    },
    {
      title: 'Order Cancellations',
      icon: <RotateCcw className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed font-light">
          <p>
            To cancel an order, please send us a WhatsApp on: <a href="https://wa.me/919982470002" className="text-[#1A1A1A] font-medium hover:underline">+91-9982470002</a> with your order number within <strong className="font-medium text-gray-900">24 hours</strong> from the time the order is placed.
          </p>
        </div>
      )
    },
    {
      title: 'Non-Returnable Items',
      icon: <Ban className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <ul className="space-y-3 text-gray-600 font-light">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1A1A1A' }} />
            <span>Custom-made or personalized Jewellery.</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1A1A1A' }} />
            <span>Goodbye sale or clearance products (as mentioned on product page).</span>
          </li>
        </ul>
      )
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCF0' }}>
      {/* Header Banner */}
      <div className="py-16 md:py-24 px-4 text-center border-b border-gray-200" style={{ backgroundColor: '#fff' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] sm:text-xs tracking-[0.4em] uppercase mb-4 font-elegant drop-shadow-sm" style={{ color: '#1A1A1A' }}>
            Customer Information
          </p>
          <h1 className="text-4xl md:text-5xl font-playfair text-[#1C1C1C] tracking-wide mb-6">
            Return &amp; Exchange Policy
          </h1>
          <div className="w-24 h-[1px] mx-auto mb-8" style={{ backgroundColor: '#1A1A1A' }} />
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto font-light text-sm md:text-base">
            At Amoli, here’s our clear and transparent policy for returns, exchanges, and refunds.
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <Breadcrumb items={[{ label: 'Return Policy' }]} />
      </div>

      {/* Policies Content */}
      <div className="max-w-5xl mx-auto px-4 pb-24 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
          {policies.map((policy, idx) => (
            <div 
              key={idx} 
              className={`p-8 bg-white rounded-sm border transition-shadow duration-300 hover:shadow-lg ${idx === 2 || idx === 4 ? 'md:col-span-2' : ''}`}
              style={{ borderColor: 'rgba(183, 110, 121, 0.1)' }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(183, 110, 121, 0.05)' }}>
                  {policy.icon}
                </div>
                <div>
                  <h3 className="text-xl font-playfair text-gray-900 tracking-wide mb-4">
                    {policy.title}
                  </h3>
                  {policy.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-16 text-center border-t border-gray-200 pt-16">
          <h2 className="text-2xl font-playfair text-gray-900 mb-4 tracking-wide">Still have questions?</h2>
          <p className="text-gray-600 font-light mb-8 max-w-lg mx-auto">
            Our customer care team is here to help you with your return or exchange process.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-8">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-2">Email Us</p>
              <a href="mailto:support@amolijewelry.com" className="text-gray-900 font-medium hover:text-[#1A1A1A] transition-colors">support@amolijewelry.com</a>
            </div>
            <div className="hidden sm:block w-[1px] h-12 bg-gray-200" />
            <div>
              <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-2">Call Us</p>
              <a href="tel:+919982470002" className="text-gray-900 font-medium hover:text-[#1A1A1A] transition-colors">+91 99824 70002</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
