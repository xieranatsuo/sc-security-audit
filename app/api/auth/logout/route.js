/**
 * POST /api/auth/logout
 * Clear session.
 */

import { NextResponse } from 'next/server';
import { successEnvelope } from '@/lib/api/envelope';
import { deleteSession, COOKIE_NAME } from '@/lib/auth';

export async function POST(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token) deleteSession(token);

  const response = NextResponse.json(successEnvelope({ loggedOut: true }, 'internal', 'live'));
  response.cookies.delete(COOKIE_NAME);
  return response;
}
