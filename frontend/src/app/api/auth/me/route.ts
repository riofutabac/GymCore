import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Simple token validation (in production use proper JWT verification)
    if (!token.startsWith('jwt-token-')) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Extract user ID from token (simplified)
    const userId = token.split('-')[2];
    
    // Mock user data (in production, fetch from database)
    const mockUser = {
      id: parseInt(userId) || 1,
      email: 'admin@gym.com',
      name: 'Admin User',
      role: 'MANAGER'
    };

    return NextResponse.json({
      success: true,
      user: mockUser
    }, { status: 200 });

  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
