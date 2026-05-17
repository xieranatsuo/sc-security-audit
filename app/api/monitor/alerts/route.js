/**
 * GET /api/monitor/alerts?chain=ethereum&severity=critical
 * Get monitoring alerts.
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';

export async function GET(request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain');
    const severity = searchParams.get('severity');

    return NextResponse.json(successEnvelope({
      alerts: [],
      filters: { chain: chain || 'all', severity: severity || 'all' },
      total: 0,
      unread: 0,
    }, { requestId }));
  } catch (error) {
    console.error('[monitor/alerts]', error);
    return NextResponse.json(
      errorEnvelope(ErrorCodes.INTERNAL_ERROR, 'Internal server error', error.message, { requestId }),
      { status: 500 }
    );
  }
}
