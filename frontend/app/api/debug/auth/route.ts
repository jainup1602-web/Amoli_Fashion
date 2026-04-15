import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  console.log('🔍 DEBUG: Auth endpoint called');
  
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    console.log('🔍 DEBUG: Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (authHeader) {
      console.log('🔍 DEBUG: Auth header preview:', authHeader.substring(0, 50) + '...');
    }

    // Try to verify admin
    const authResult = await verifyAdmin(request);
    
    if ('error' in authResult) {
      console.log('🔍 DEBUG: Auth failed:', authResult.error);
      return NextResponse.json({
        success: false,
        debug: {
          step: 'admin_verification',
          error: authResult.error,
          status: authResult.status,
          hasAuthHeader: !!authHeader,
          authHeaderPreview: authHeader ? authHeader.substring(0, 50) + '...' : null
        }
      }, { status: authResult.status });
    }

    console.log('🔍 DEBUG: Auth successful for user:', authResult.user.email);
    
    return NextResponse.json({
      success: true,
      debug: {
        step: 'admin_verification_success',
        user: {
          id: authResult.user.id,
          email: authResult.user.email,
          role: authResult.user.role,
          isActive: authResult.user.isActive
        },
        hasAuthHeader: !!authHeader,
        authHeaderPreview: authHeader ? authHeader.substring(0, 50) + '...' : null
      }
    });

  } catch (error: any) {
    console.error('🔍 DEBUG: Unexpected error:', error);
    
    return NextResponse.json({
      success: false,
      debug: {
        step: 'unexpected_error',
        error: error.message,
        stack: error.stack
      }
    }, { status: 500 });
  }
}