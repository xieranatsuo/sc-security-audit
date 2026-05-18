/**
 * POST /api/auth/wallet
 * Authenticate or register via wallet signature (EIP-4361 SIWE).
 *
 * Request: { address, signature, message, chainId }
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';
import { createSession, COOKIE_NAME } from '@/lib/auth';

// In-memory wallet users
const walletUsers = new Map();

export async function POST(request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const { address, signature, message, chainId } = await request.json();

    if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, 'Valid wallet address required', null, { requestId }),
        { status: 400 }
      );
    }

    if (!signature || !message) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, 'Signature and message are required', null, { requestId }),
        { status: 400 }
      );
    }

    // In production: verify signature using ethers.recoverAddress(message, signature)
    // For demo: accept any valid-looking signature
    if (signature.length < 10) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, 'Invalid signature', null, { requestId }),
        { status: 400 }
      );
    }

    const normalizedAddr = address.toLowerCase();

    // Check if wallet already registered
    let user = walletUsers.get(normalizedAddr);
    if (!user) {
      // Auto-register wallet user
      user = {
        id: `wallet_${Date.now().toString(36)}_${normalizedAddr.slice(2, 8)}`,
        address: normalizedAddr,
        name: `${normalizedAddr.slice(0, 6)}...${normalizedAddr.slice(-4)}`,
        plan: 'enterprise',
        connectedAt: new Date().toISOString(),
      };
      walletUsers.set(normalizedAddr, user);
    }

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
      errorEnvelope(ErrorCodes.INTERNAL_ERROR, error.message, null, { requestId }),
      { status: 500 }
    );
  }
}
