/**
 * POST /api/auth/register
 * Register a new user with email/password.
 *
 * Request: { email, password, name }
 * Response: { user, token }
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';
import { createUser, createSession, COOKIE_NAME } from '@/lib/auth';

export async function POST(request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate
    if (!email || !password || !name) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, 'email, password, and name are required', null, { requestId }),
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, 'Password must be at least 8 characters', null, { requestId }),
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, 'Invalid email format', null, { requestId }),
        { status: 400 }
      );
    }

    const user = await createUser(email, password, name);
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
    const status = error.message === 'Email already registered' ? 409 : 500;
    return NextResponse.json(
      errorEnvelope(status === 409 ? 'CONFLICT' : ErrorCodes.INTERNAL_ERROR, error.message, null, { requestId }),
      { status }
    );
  }
}
