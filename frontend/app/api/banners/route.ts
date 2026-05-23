import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch active banners (public)
// Base64 images are served via /api/banners/[id]/image to avoid large JSON responses
export async function GET(req: NextRequest) {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        image: true,
        link: true,
        buttonText: true,
        order: true,
        isActive: true,
      },
    });

    // Replace base64 images with a served URL to keep JSON response small
    const processedBanners = banners.map((banner) => ({
      ...banner,
      image: banner.image?.startsWith('data:')
        ? `/api/banners/${banner.id}/image`
        : (banner.image || null),
    }));

    return new NextResponse(
      JSON.stringify({ success: true, banners: processedBanners }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
