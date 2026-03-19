import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch public settings (no auth required)
export async function GET() {
  try {
    const settingsRecords = await prisma.settings.findMany();

    // Convert array of settings to object
    const settings: any = {};
    settingsRecords.forEach(record => {
      settings[record.key] = record.value;
    });

    // Create default settings if none exist
    if (settingsRecords.length === 0) {
      const defaults = {
        siteName: 'Amoli Fashion Jewellery',
        contactEmail: 'support@amolifashionjewellery.com',
        freeShippingThreshold: 500,
        shippingCharge: 50,
        returnPolicyDays: 7,
        copyrightText: 'All rights reserved.',
      };

      for (const [key, value] of Object.entries(defaults)) {
        await prisma.settings.create({
          data: { key, value },
        });
        settings[key] = value;
      }
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
