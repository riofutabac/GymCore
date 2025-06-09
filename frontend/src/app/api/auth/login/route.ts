import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual authentication logic
    // This is a placeholder - integrate with your actual auth system
    if (email === 'admin@gym.com' && password === 'admin123') {
      const response = NextResponse.json(
        { 
          success: true, 
          user: { 
            id: 1, 
            email, 
            role: 'admin' 
          } 
        },
        { status: 200 }
      );

      // Set authentication cookie (optional)
      response.cookies.set('auth-token', 'sample-jwt-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400 // 24 hours
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
