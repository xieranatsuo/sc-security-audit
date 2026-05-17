/**
 * POST /api/auth/register
 * Register a new user (simplified for demo).
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';

export async function POST(request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, 'email and name are required', null, { requestId }),
        { status: 400 }
      );
    }

    return NextResponse.json(successEnvelope({
      user: {
        id: `user_${Date.now().toString(36)}`,
        email,
        name,
        createdAt: new Date().toISOString(),
        plan: 'free',
        auditLimit: 10,
        auditsUsed: 0,
      },
    }, { requestId }));
  } catch (error) {
    console.error('[auth/register]', error);
    return NextResponse.json(
      errorEnvelope(ErrorCodes.INTERNAL_ERROR, 'Internal server error', error.message, { requestId }),
      { status: 500 }
    );
  }
}
