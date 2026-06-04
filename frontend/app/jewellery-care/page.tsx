'use client';

import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Card } from '@/components/ui/card';
import { Sparkles, Droplets, Shield, Clock } from 'lucide-react';

export default function JewelleryCarePage() {
  return (
    <div className="min-h-screen bg-[#FDFCF0]">
      {/* Header Banner */}
      <div className="py-16 md:py-24 px-4 text-center border-b border-gray-200" style={{ backgroundColor: '#fff' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] sm:text-xs tracking-[0.4em] uppercase mb-4 font-elegant drop-shadow-sm" style={{ color: '#1A1A1A' }}>
            Product Information
          </p>
          <h1 className="text-4xl md:text-5xl font-playfair text-[#1C1C1C] tracking-wide mb-6">
            Jewellery Care Instructions
          </h1>
          <div className="w-24 h-[1px] mx-auto mb-8" style={{ backgroundColor: '#1A1A1A' }} />
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto font-light text-sm md:text-base">
            To keep your jewellery looking beautiful for years to come, please follow these care guidelines.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        <Breadcrumb items={[{ label: 'Jewellery Care' }]} />
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-24 pt-8">
        <Card className="p-8 md:p-12 border-0 shadow-sm">
          <div className="space-y-8 text-gray-700 leading-relaxed font-light text-lg">
            
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#1A1A1A' }} />
              <p>Store your jewellery in a dry, airtight pouch or jewellery box when not in use.</p>
            </div>

            <div className="flex items-start gap-4">
              <Droplets className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#1A1A1A' }} />
              <p>Avoid direct contact with water, perfumes, lotions, hairsprays, and other chemicals.</p>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#1A1A1A' }} />
              <p>Remove your jewellery before bathing, swimming, exercising, or sleeping.</p>
            </div>

            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#1A1A1A' }} />
              <div>
                <p className="mb-4">Gently clean with a soft, dry cloth after each use to maintain its shine.</p>
                <p className="mb-4">Keep pieces separate to prevent scratches and tangling.</p>
                <p>Handle delicate designs with care to avoid damage.</p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-gray-50/50 border rounded-sm" style={{ borderColor: 'rgba(183, 110, 121, 0.2)' }}>
              <h3 className="text-xl font-playfair text-[#1A1A1A] mb-3">Note</h3>
              <p className="text-base text-gray-600">
                Fashion and plated jewelry may naturally tarnish over time depending on usage and exposure to moisture, air, and chemicals. Proper care will help extend its beauty and lifespan.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
