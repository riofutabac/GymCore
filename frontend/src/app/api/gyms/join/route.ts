import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    // Basic validation
    if (!code) {
      return NextResponse.json(
        { error: 'Gym code is required' },
        { status: 400 }
      );
    }

    // Mock gym codes (in production, validate against database)
    const validCodes = ['GYM123', 'FIT456', 'HEALTH789'];
    
    if (validCodes.includes(code.toUpperCase())) {
      return NextResponse.json({
        success: true,
        message: 'Successfully joined gym',
        gym: {
          id: 1,
          name: 'PowerFit Gym',
          code: code.toUpperCase()
        }
      }, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Invalid gym code' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Gym join error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
