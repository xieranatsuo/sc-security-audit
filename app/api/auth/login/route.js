/**
 * POST /api/auth/login
 * Login with email/password.
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope } from '@/lib/api/envelope';
import { authenticateUser, createSession, COOKIE_NAME } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        errorEnvelope('email and password are required', 'internal'),
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);
    const token = createSession(user.id);

    const response = NextResponse.json(successEnvelope({ user, token }, 'internal', 'live'));
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
      errorEnvelope(error.message, 'internal'),
      { status: 401 }
    );
  }
}
