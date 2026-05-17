/**
 * GET /api/contracts/search?q=uniswap&chain=ethereum
 * Search contracts by name or address.
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';

export async function GET(request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const chain = searchParams.get('chain');

    if (!query || query.length < 2) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, 'Search query must be at least 2 characters', null, { requestId }),
        { status: 400 }
      );
    }

    return NextResponse.json(successEnvelope({
      query,
      chain: chain || 'all',
      results: [],
      total: 0,
    }, { requestId }));
  } catch (error) {
    console.error('[contracts/search]', error);
    return NextResponse.json(
      errorEnvelope(ErrorCodes.INTERNAL_ERROR, 'Internal server error', error.message, { requestId }),
      { status: 500 }
    );
  }
}
