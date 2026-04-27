import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, return empty array until backend is restarted
    // The backend route at /api/marquee will work after restart
    return NextResponse.json({
      success: true,
      items: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
