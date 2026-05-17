/**
 * GET /api/audit/history?page=1&limit=20
 * Get audit history for the current user.
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';
import { validatePagination } from '@/lib/validators';

export async function GET(request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const { searchParams } = new URL(request.url);
    const pageValidation = validatePagination({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    if (!pageValidation.valid) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, pageValidation.error, null, { requestId }),
        { status: 400 }
      );
    }

    return NextResponse.json(successEnvelope({
      audits: [],
      pagination: {
        page: pageValidation.page,
        limit: pageValidation.limit,
        total: 0,
        totalPages: 0,
      },
    }, { requestId }));
  } catch (error) {
    console.error('[audit/history]', error);
    return NextResponse.json(
      errorEnvelope(ErrorCodes.INTERNAL_ERROR, 'Internal server error', error.message, { requestId }),
      { status: 500 }
    );
  }
}
