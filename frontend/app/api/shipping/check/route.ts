export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const pincode = req.nextUrl.searchParams.get('pincode');
    if (!pincode || pincode.length !== 6) {
      return NextResponse.json({ available: false });
    }

    // Check shipping zones
    const zones = await prisma.shippingzone.findMany({ where: { isActive: true } });

    for (const zone of zones) {
      const pincodes = zone.pincodes.split(',').map((p: string) => p.trim());
      if (pincodes.includes(pincode) || pincodes.includes('all') || pincodes.includes('ALL')) {
        return NextResponse.json({ available: true, city: '', charges: zone.charges });
      }
    }

    // If no zones configured or pincode not found — default available for all India
    if (zones.length === 0) {
      return NextResponse.json({ available: true });
    }

    return NextResponse.json({ available: false });
  } catch {
    return NextResponse.json({ available: true }); // fallback
  }
}
