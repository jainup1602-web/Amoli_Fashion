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
      title: 'General Guidelines',
      icon: <RotateCcw className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed font-light">
          <p>
            You can raise a return request from here within <strong className="font-medium text-gray-900">2 days</strong> of the delivery of the order.
          </p>
          <p>
            For product returns, please ensure that all freebies received with the order are returned along with the product.
          </p>
          <ul className="space-y-2 mt-2">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#1A1A1A' }} />
              <span>Return of Products purchased under Buy 1 Get 1 or other related offers would be eligible for refund to Amoli&apos;s Wallet.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#1A1A1A' }} />
              <span>Items sold at a strike-through or discounted price (without applying a coupon) are eligible for return.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: 'Return Conditions',
      icon: <Package className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed font-light">
          <p>
            Items must be unused, with original packaging and tags intact.
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
      title: 'How to Return or Exchange',
      icon: <MousePointer2 className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <ol className="space-y-4 text-gray-600 font-light list-decimal list-inside ml-2">
          <li>
            Go to the Return/Exchange section on the Amoli website or app menu, or follow this link: <Link href="/account/orders" className="text-[#1A1A1A] hover:underline font-medium">My Orders</Link>.
          </li>
          <li>
            Enter your Amoli Order ID and Contact Number. Ensure the Order ID is correctly entered.
          </li>
          <li>
            Choose the items you wish to return.
          </li>
          <li>
            Provide necessary details: select a return reason, upload a minimum of two images, specify the pickup address and date, and choose your refund method.
          </li>
          <li>
            Review your information and confirm the return request.
          </li>
        </ol>
      )
    },
    {
      title: 'Refunds',
      icon: <CreditCard className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed font-light">
          <p>
            Refunds are processed in <strong className="font-medium text-gray-900">7–10 working days</strong> as per RBI guidelines, following item pickup and verification.
          </p>
          <ul className="space-y-3 mt-4">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1A1A1A' }} />
              <span><strong className="font-medium text-gray-900">Prepaid orders:</strong> Refunded to original payment method.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1A1A1A' }} />
              <span><strong className="font-medium text-gray-900">COD orders:</strong> Refunded to UPI or bank account provided by you.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: 'LGD Orders (Lab-Grown Diamonds)',
      icon: <Gem className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed font-light">
          <p>
            LGD products can only be exchanged for other LGD items.
          </p>
          <p>
            If a customer wishes to exchange an LGD item for a Demifine product, the total value of the selected Demifine items must be equal to or greater than the value of the LGD item.
          </p>
          <p>
            If the value is lower, the remaining balance will be issued as store credit, which can be redeemed at checkout.
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
              <a href="mailto:support@amoli.com" className="text-gray-900 font-medium hover:text-[#1A1A1A] transition-colors">support@amoli.com</a>
            </div>
            <div className="hidden sm:block w-[1px] h-12 bg-gray-200" />
            <div>
              <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-2">Call Us</p>
              <a href="tel:+911234567890" className="text-gray-900 font-medium hover:text-[#1A1A1A] transition-colors">+91 123 456 7890</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
