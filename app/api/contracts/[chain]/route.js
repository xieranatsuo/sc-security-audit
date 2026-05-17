/**
 * GET /api/contracts/[chain]?page=1&limit=20
 * Get contracts for a specific chain.
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';
import { validateChain, validatePagination } from '@/lib/validators';

export async function GET(request, { params }) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const { chain } = await params;
    const chainValidation = validateChain(chain);

    if (!chainValidation.valid) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, chainValidation.error, null, { requestId }),
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pageValidation = validatePagination({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    return NextResponse.json(successEnvelope({
      chain: chainValidation.chainName,
      chainId: chainValidation.chainId,
      contracts: [],
      pagination: {
        page: pageValidation.page || 1,
        limit: pageValidation.limit || 20,
        total: 0,
        totalPages: 0,
      },
    }, { requestId }));
  } catch (error) {
    console.error('[contracts/chain]', error);
    return NextResponse.json(
      errorEnvelope(ErrorCodes.INTERNAL_ERROR, 'Internal server error', error.message, { requestId }),
      { status: 500 }
    );
  }
}
