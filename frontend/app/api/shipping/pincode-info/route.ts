export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const pincode = req.nextUrl.searchParams.get('pincode');

  if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
    return NextResponse.json({ success: false, message: 'Invalid pincode' }, { status: 400 });
  }

  try {
    const res = await fetch(`http://api.zippopotam.us/in/${pincode}`, {
      signal: AbortSignal.timeout(5000),
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.places && data.places.length > 0) {
        const place = data.places[0];
        return NextResponse.json({
          success: true,
          city: place['place name'] || '',
          state: place.state || '',
          postOffice: place['place name'] || ''
        });
      }
    }
  } catch (e: any) {
    console.warn('Postal pincode API failed:', e.message);
  }

  // Fallback: return success false — delivery check still works without city name
  return NextResponse.json({ success: false, message: 'City info unavailable' });
}
