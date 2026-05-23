export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// Multiple pincode API fallbacks — postalpincode.in SSL expired
const PINCODE_APIS = [
  (pin: string) => `https://pincode.vercel.app/${pin}`,
  (pin: string) => `https://api.vedicastroapi.com/v3-json/utilities/pincode?pincode=${pin}`,
];

async function fetchFromVercelApi(pincode: string) {
  const res = await fetch(`https://pincode.vercel.app/${pincode}`, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  const data = await res.json();
  // Response: [{ District, State, Name, ... }] or { District, State, ... }
  const record = Array.isArray(data) ? data[0] : data;
  if (!record) throw new Error('No data');
  return {
    city: record.District || record.district || record.Name || record.name || '',
    state: record.State || record.state || '',
    postOffice: record.Name || record.name || '',
  };
}

async function fetchFromIndiaPostApi(pincode: string) {
  const res = await fetch(
    `https://india-pincode-with-latitude-and-longitude.p.rapidapi.com/api/v1/pincode/${pincode}`,
    {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    }
  );
  if (!res.ok) throw new Error(`${res.status}`);
  const data = await res.json();
  const record = Array.isArray(data) ? data[0] : data;
  if (!record) throw new Error('No data');
  return {
    city: record.district || record.District || '',
    state: record.state || record.State || '',
    postOffice: record.taluk || record.officeName || '',
  };
}

export async function GET(req: NextRequest) {
  const pincode = req.nextUrl.searchParams.get('pincode');

  if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
    return NextResponse.json({ success: false, message: 'Invalid pincode' }, { status: 400 });
  }

  // Try vercel pincode API first
  try {
    const info = await fetchFromVercelApi(pincode);
    if (info.city) {
      return NextResponse.json({ success: true, ...info });
    }
  } catch (e: any) {
    console.warn('Vercel pincode API failed:', e.message);
  }

  // Fallback: return success false — delivery check still works without city name
  return NextResponse.json({ success: false, message: 'City info unavailable' });
}
