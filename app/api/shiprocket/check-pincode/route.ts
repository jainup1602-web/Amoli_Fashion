import { NextRequest, NextResponse } from 'next/server';
import { checkPincodeServiceability } from '@/lib/shiprocket';

export async function POST(request: NextRequest) {
  try {
    const { pincode } = await request.json();

    if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
      return NextResponse.json(
        { error: 'Invalid pincode' },
        { status: 400 }
      );
    }

    const pickupPincode = '110001'; // Your warehouse pincode
    const weight = 0.5; // Default weight in kg

    const result = await checkPincodeServiceability(
      pickupPincode,
      pincode,
      weight
    );

    if (result.data && result.data.available_courier_companies.length > 0) {
      return NextResponse.json({
        serviceable: true,
        estimatedDays: result.data.available_courier_companies[0].estimated_delivery_days,
        message: 'Delivery available',
      });
    }

    return NextResponse.json({
      serviceable: false,
      message: 'Delivery not available for this pincode',
    });
  } catch (error: any) {
    console.error('Pincode check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check pincode' },
      { status: 500 }
    );
  }
}
