'use client';

import { 
  Package, 
  Truck, 
  CreditCard, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Video 
} from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';

export default function ShippingPolicyPage() {
  const policies = [
    {
      title: 'Dispatch Timelines',
      icon: <Package className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed font-light">
          <p>
            Dispatched within <strong className="font-medium text-gray-900">2–3 working days</strong> if the item is in stock.
          </p>
          <p>
            If the exact item is not available, our team will assist you with the closest available variant or process a refund.
          </p>
        </div>
      )
    },
    {
      title: 'Delivery Timelines',
      icon: <Truck className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed font-light">
          <p>Delivery estimates are shown at the product pages & checkout. These estimates depend on your specific pincode and the items you&apos;ve chosen.</p>
          <p>The time taken for delivery tends to vary according to the destination; however, we make our best efforts to ensure that the order is delivered on time.</p>
        </div>
      )
    },
    {
      title: 'Shipping Charges',
      icon: <CreditCard className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <ul className="space-y-3 text-gray-600 font-light">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1A1A1A' }} />
            <span><strong className="font-medium text-gray-900">Prepaid Orders:</strong> Free shipping across India above ₹999.</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1A1A1A' }} />
            <span><strong className="font-medium text-gray-900">Cash on Delivery (COD):</strong> ₹75 COD Charge is Applicable.</span>
          </li>
        </ul>
      )
    },
    {
      title: 'Order Tracking',
      icon: <MapPin className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed font-light">
          <p>Once shipped, you&apos;ll receive a tracking link via SMS, WhatsApp, and Email.</p>
          <p>For any queries, please contact our support team.</p>
        </div>
      )
    },
    {
      title: 'Delays & Exceptions',
      icon: <AlertTriangle className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed font-light">
          <p>Occasional delays may occur due to weather, Government Authority, local restrictions, or courier-related issues.</p>
          <p>Certain Logistic partners may request for an ID proof while delivering the shipment. When the original recipient is not available and the shipment value is high, the delivery agent may request for ID proof from whomever is collecting the shipment at the mentioned address on behalf of the customer. This is to ensure correct and safe delivery of the product.</p>
          <div className="p-4 border-l-2" style={{ backgroundColor: 'rgba(183, 110, 121, 0.05)', borderColor: '#1A1A1A' }}>
            <p className="text-sm italic"><strong className="font-medium text-gray-900 not-italic">Please note:</strong> In case you suspect that the package may have tampered before the delivery, you may reject it at the time of delivery.</p>
          </div>
          <p>If your address becomes unserviceable, our team will contact you with alternatives or a refund.</p>
        </div>
      )
    },
    {
      title: 'Secure Packaging',
      icon: <ShieldCheck className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed font-light">
          <p>Every product goes through multiple quality checks to ensure we deliver you the perfect jewels safely. Once the jewellery passes quality checks it is packed to ensure the safest delivery. The packaged products come in Amoli&apos;s Fashion Jewellery Box/Pouches.</p>
          <p>Our aim is to deliver you your products safely at the earliest possible to provide you with a happy unboxing experience, and we appreciate your patience and trust with us regarding the same.</p>
        </div>
      )
    },
    {
      title: 'Unboxing Video',
      icon: <Video className="w-6 h-6" style={{ color: '#1A1A1A' }} />,
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed font-light">
          <p className="font-medium text-gray-900">A Simple Step to Help Us Help You</p>
          <p>To assist you quickly in case of any issues, it is mandatory to record a video while opening your parcel. This unboxing video acts as essential proof in the event of any damage, manufacturing defects or Missing products claim.</p>
          <p>We appreciate your cooperation in this important step.</p>
        </div>
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
            Shipping & Delivery Policy
          </h1>
          <div className="w-24 h-[1px] mx-auto mb-8" style={{ backgroundColor: '#1A1A1A' }} />
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto font-light text-sm md:text-base">
            At Amoli, we partner with trusted courier services to ensure your orders reach you safely and efficiently. 
            In India, Amoli serves to all major cities. Please check if we deliver to your pincode in shopping cart checkout page. 
            If there is no courier service available in your area, we do apologize for the inconvenience caused.
          </p>
        </div>
      </div>

      {/* Breadcrumb - Optional */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <Breadcrumb items={[{ label: 'Shipping Policy' }]} />
      </div>

      {/* Policies Content */}
      <div className="max-w-5xl mx-auto px-4 pb-24 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
          {policies.map((policy, idx) => (
            <div 
              key={idx} 
              className={`p-8 bg-white rounded-sm border transition-shadow duration-300 hover:shadow-lg ${idx === 4 ? 'md:col-span-2' : ''}`}
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
      </div>
    </div>
  );
}
