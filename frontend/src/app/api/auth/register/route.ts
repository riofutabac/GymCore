import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Basic validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists (simplified check)
    if (email === 'admin@gym.com' || email === 'client@gym.com') {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create new user (in production, save to database)
    const newUser = {
      id: Math.floor(Math.random() * 10000),
      email,
      name,
      role: 'CLIENT' // Default role for new registrations
    };

    // Generate token
    const token = `jwt-token-${newUser.id}-${Date.now()}`;

    return NextResponse.json({
      success: true,
      user: newUser,
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
