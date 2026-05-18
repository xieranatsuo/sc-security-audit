/**
 * GET /api/contracts/search?q=uniswap&chain=ethereum
 * Search contracts by name or address.
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope } from '@/lib/api/envelope';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const chain = searchParams.get('chain');

    if (!query || query.length < 2) {
      return NextResponse.json(
        errorEnvelope('Search query must be at least 2 characters', 'internal'),
        { status: 400 }
      );
    }

    return NextResponse.json(successEnvelope({
      query,
      chain: chain || 'all',
      results: [],
      total: 0,
    }, 'internal', 'live'));
  } catch (error) {
    console.error('[contracts/search]', error);
    return NextResponse.json(
      errorEnvelope('Internal server error', 'internal'),
      { status: 500 }
    );
  }
}
