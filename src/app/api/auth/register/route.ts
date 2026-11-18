import { NextRequest, NextResponse } from 'next/server';
import { registerWithGoogleSheet } from '@/lib/sheets/googleSheets';
import { setSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const regResult = await registerWithGoogleSheet({
      email,
      password,
      name: fullName || email.split('@')[0],
      phone,
    });

    if (!regResult.success || !regResult.user) {
      return NextResponse.json(
        { error: regResult.error || 'Failed to create user account' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: regResult.user,
    });

    await setSessionCookie(regResult.user, response);

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
