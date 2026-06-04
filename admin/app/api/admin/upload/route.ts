import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size too large. Max 50MB allowed.' }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueId = crypto.randomUUID();
    const ext = file.name.split('.').pop() || 'mp4';
    const filename = `${uniqueId}.${ext}`;
    
    // Write to the frontend's public directory so it's served by the main app
    const uploadDir = join(process.cwd(), '..', 'frontend', 'public', 'uploads', 'videos');
    const filePath = join(uploadDir, filename);

    try {
      await writeFile(filePath, buffer);
    } catch (fsError) {
      console.error('File write error:', fsError);
      return NextResponse.json({ success: false, error: 'Could not save file' }, { status: 500 });
    }

    const url = `/uploads/videos/${filename}`;

    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}
