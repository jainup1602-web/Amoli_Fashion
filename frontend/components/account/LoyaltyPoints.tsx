'use client';

import { Star, Gift, TrendingUp } from 'lucide-react';

interface LoyaltyPointsProps {
  points: number;
  onRedeem?: (points: number) => void;
  orderTotal?: number;
  redeemPoints?: number;
  setRedeemPoints?: (n: number) => void;
}

const POINTS_PER_RUPEE = 1; // 1 point per ₹1 spent
const RUPEE_PER_POINT = 0.5; // 1 point = ₹0.50 discount

export function LoyaltyPoints({ points, onRedeem, orderTotal, redeemPoints = 0, setRedeemPoints }: LoyaltyPointsProps) {
  const maxRedeemable = Math.min(points, orderTotal ? Math.floor(orderTotal * 0.1 / RUPEE_PER_POINT) : points);
  const discount = redeemPoints * RUPEE_PER_POINT;

  return (
    <div className="bg-white border border-gray-100 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <Star className="h-5 w-5" style={{ color: '#B76E79' }} />
        <h2 className="text-base font-fairplay text-[#1C1C1C]">Loyalty Points</h2>
        <span className="ml-auto text-sm font-bold" style={{ color: '#B76E79' }}>{points} pts</span>
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>You earn <strong>1 point per ₹1</strong> spent. 1 point = ₹0.50 discount</span>
      </div>

      {points > 0 && setRedeemPoints && (
        <div>
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={redeemPoints > 0}
              onChange={e => setRedeemPoints(e.target.checked ? maxRedeemable : 0)}
              className="accent-[#B76E79]"
            />
            <span className="text-sm text-gray-700">
              Use {maxRedeemable} points = <strong style={{ color: '#B76E79' }}>₹{(maxRedeemable * RUPEE_PER_POINT).toFixed(0)} off</strong>
            </span>
          </label>
          {redeemPoints > 0 && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Gift className="h-3 w-3" /> ₹{discount.toFixed(0)} discount applied from loyalty points
            </p>
          )}
        </div>
      )}

      {points === 0 && (
        <p className="text-xs text-gray-400">Place your first order to start earning points!</p>
      )}
    </div>
  );
}
