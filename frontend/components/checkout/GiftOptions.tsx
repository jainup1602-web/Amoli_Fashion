'use client';

import { Gift } from 'lucide-react';

interface GiftOptionsProps {
  isGift: boolean;
  giftWrap: boolean;
  giftMessage: string;
  onChange: (field: string, value: any) => void;
}

export function GiftOptions({ isGift, giftWrap, giftMessage, onChange }: GiftOptionsProps) {
  return (
    <div className="bg-white border border-gray-100 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <Gift className="h-5 w-5" style={{ color: '#B76E79' }} />
        <h2 className="text-base font-fairplay text-[#1C1C1C]">Gift Options</h2>
      </div>

      {/* Is Gift Toggle */}
      <label className="flex items-center gap-3 cursor-pointer mb-4">
        <div
          className="w-10 h-5 rounded-full flex items-center px-0.5 transition-colors"
          style={{ backgroundColor: isGift ? '#B76E79' : '#d1d5db' }}
          onClick={() => onChange('isGift', !isGift)}
        >
          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isGift ? 'translate-x-5' : ''}`} />
        </div>
        <span className="text-sm text-gray-700">This is a gift</span>
      </label>

      {isGift && (
        <div className="space-y-3 pl-2 border-l-2" style={{ borderColor: '#B76E79' }}>
          {/* Gift Wrap */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={giftWrap}
              onChange={e => onChange('giftWrap', e.target.checked)}
              className="accent-[#B76E79] w-4 h-4"
            />
            <div>
              <span className="text-sm text-gray-700 font-medium">Add Gift Wrap</span>
              <span className="text-xs text-gray-400 ml-2">(Premium packaging)</span>
            </div>
          </label>

          {/* Gift Message */}
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-elegant tracking-widest uppercase">
              Gift Message (optional)
            </label>
            <textarea
              value={giftMessage}
              onChange={e => onChange('giftMessage', e.target.value)}
              placeholder="Write a personal message for the recipient..."
              maxLength={200}
              rows={3}
              className="w-full border border-gray-200 focus:border-[#B76E79] px-3 py-2 text-sm font-light outline-none resize-none rounded-none"
            />
            <p className="text-[10px] text-gray-400 text-right">{giftMessage.length}/200</p>
          </div>
        </div>
      )}
    </div>
  );
}
