import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/middleware/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Attempt to verify auth, but we don't strictly require it (optional user)
    // However, getting user info is nice. If not logged in, authResult might be an error.
    let userId = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const authResult = await verifyAuth(request);
      if (!('error' in authResult)) {
        userId = authResult.user.id;
      }
    }

    const formData = await request.formData();
    const customerName = formData.get('customerName') as string;
    const customerLocation = formData.get('customerLocation') as string;
    const rating = formData.get('rating') as string;
    const videoFile = formData.get('videoFile') as File | null;
    const thumbnailUrl = formData.get('thumbnailUrl') as string | null;

    if (!customerName || !rating || !videoFile) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (videoFile.size > 20 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Video file size too large. Max 20MB allowed.' }, { status: 413 });
    }

    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueId = crypto.randomUUID();
    const ext = videoFile.name.split('.').pop() || 'mp4';
    const filename = `${uniqueId}.${ext}`;
    
    // Path where file will be saved
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'videos');
    const filePath = join(uploadDir, filename);

    // Ensure the directory exists (we already created it via CLI, but let's be safe)
    try {
      await writeFile(filePath, buffer);
    } catch (fsError) {
      console.error('File write error:', fsError);
      return NextResponse.json({ success: false, error: 'Could not save video file' }, { status: 500 });
    }

    // URL to access the file from the frontend
    const videoUrl = `/uploads/videos/${filename}`;

    const newReview = await prisma.videoreview.create({
      data: {
        customerName,
        customerLocation: customerLocation || null,
        rating: Number(rating),
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        status: 'pending',
        isActive: false,
        userId: userId,
        order: 0,
      }
    });

    return NextResponse.json({ success: true, message: 'Review submitted successfully and is pending approval', review: newReview });
  } catch (error: any) {
    console.error('Error submitting video review:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to submit review' }, { status: 500 });
  }
}
