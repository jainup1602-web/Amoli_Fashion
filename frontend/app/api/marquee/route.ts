import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Proxy to backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/marquee`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Backend API failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Marquee API error:', error);
    // Return empty items on error so page doesn't break
    return NextResponse.json({
      success: true,
      items: [],
    });
  }
}
