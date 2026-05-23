import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// In-memory cache: bannerId -> Buffer (cleared on server restart)
const imageCache = new Map<string, { buffer: Buffer; mimeType: string; cachedAt: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// GET /api/banners/[id]/image — serves the base64 image as actual binary
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Check in-memory cache first
    const cached = imageCache.get(id);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
      return new NextResponse(cached.buffer, {
        status: 200,
        headers: {
          'Content-Type': cached.mimeType,
          'Cache-Control': 'public, max-age=3600',
          'X-Cache': 'HIT',
        },
      });
    }

    const banner = await prisma.banner.findUnique({
      where: { id },
      select: { image: true },
    });

    if (!banner?.image) {
      return new NextResponse(null, { status: 404 });
    }

    // If it's a plain URL (not base64), redirect
    if (!banner.image.startsWith('data:')) {
      return NextResponse.redirect(banner.image);
    }

    // Parse: data:image/jpeg;base64,/9j/...
    const commaIdx = banner.image.indexOf(',');
    if (commaIdx === -1) {
      return new NextResponse(null, { status: 400 });
    }

    const meta = banner.image.substring(5, commaIdx); // "image/jpeg;base64"
    const mimeType = meta.split(';')[0] || 'image/jpeg';
    const base64Data = banner.image.substring(commaIdx + 1);
    const buffer = Buffer.from(base64Data, 'base64');

    // Store in cache
    imageCache.set(id, { buffer, mimeType, cachedAt: Date.now() });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': buffer.length.toString(),
        'X-Cache': 'MISS',
      },
    });
  } catch (error: any) {
    console.error('Banner image error:', error.message);
    return new NextResponse(null, { status: 500 });
  }
}
