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

    // Test credentials for different user types
    const testUsers = [
      { email: 'admin@gym.com', password: 'password123', role: 'MANAGER', id: 1, name: 'Admin User' },
      { email: 'client@gym.com', password: 'password123', role: 'CLIENT', id: 2, name: 'Client User' },
      { email: 'reception@gym.com', password: 'password123', role: 'RECEPTION', id: 3, name: 'Reception User' },
    ];

    const user = testUsers.find(u => u.email === email && u.password === password);

    if (user) {
      // Generate a simple JWT-like token (in production use proper JWT)
      const token = `jwt-token-${user.id}-${Date.now()}`;
      
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }, { status: 200 });
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
