import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/middleware/auth';

// GET - Fetch settings
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const settingsRecords = await prisma.settings.findMany();

    // Convert array to object (parse JSON values)
    const settings: any = {};
    settingsRecords.forEach(record => {
      try {
        settings[record.key] = JSON.parse(record.value);
      } catch {
        settings[record.key] = record.value; // Fallback if not valid JSON
      }
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await request.json();

    // Update or create each setting (ensure values are JSON strings)
    for (const [key, value] of Object.entries(body)) {
      const jsonValue = typeof value === 'string' ? JSON.stringify(value) : JSON.stringify(value);
      await prisma.settings.upsert({
        where: { key },
        update: { value: jsonValue },
        create: { key, value: jsonValue },
      });
    }

    const settingsRecords = await prisma.settings.findMany();
    const settings: any = {};
    settingsRecords.forEach(record => {
      try {
        settings[record.key] = JSON.parse(record.value);
      } catch {
        settings[record.key] = record.value; // Fallback if not valid JSON
      }
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
