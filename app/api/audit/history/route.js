/**
 * GET /api/audit/history?page=1&limit=20
 * Get audit history for the current user.
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope } from '@/lib/api/envelope';
import { validatePagination } from '@/lib/validators';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageValidation = validatePagination({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    if (!pageValidation.valid) {
      return NextResponse.json(
        errorEnvelope(pageValidation.error, 'internal'),
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
    }, 'internal', 'live'));
  } catch (error) {
    console.error('[audit/history]', error);
    return NextResponse.json(
      errorEnvelope('Internal server error', 'internal'),
      { status: 500 }
    );
  }
}
