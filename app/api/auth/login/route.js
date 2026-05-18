/**
 * POST /api/auth/login
 * Login with email/password.
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';
import { authenticateUser, createSession, COOKIE_NAME } from '@/lib/auth';

export async function POST(request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, 'email and password are required', null, { requestId }),
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);
    const token = createSession(user.id);

    const response = NextResponse.json(successEnvelope({ user, token }, { requestId }));
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      errorEnvelope(ErrorCodes.UNAUTHORIZED, error.message, null, { requestId }),
      { status: 401 }
    );
  }
}
