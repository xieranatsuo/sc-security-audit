/**
 * GET /api/auth/session
 * Check current session.
 */

import { NextResponse } from 'next/server';
import { successEnvelope } from '@/lib/api/envelope';
import { getSession, getUserById, COOKIE_NAME } from '@/lib/auth';

export async function GET(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(successEnvelope({ user: null }));
  }

  const session = getSession(token);
  if (!session) {
    return NextResponse.json(successEnvelope({ user: null }));
  }

  const user = getUserById(session.userId);
  return NextResponse.json(successEnvelope({ user }));
}
