/**
 * GET /api/monitor/alerts?chain=ethereum&severity=critical
 * Get monitoring alerts.
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope } from '@/lib/api/envelope';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain');
    const severity = searchParams.get('severity');

    return NextResponse.json(successEnvelope({
      alerts: [],
      filters: { chain: chain || 'all', severity: severity || 'all' },
      total: 0,
      unread: 0,
    }, 'internal', 'live'));
  } catch (error) {
    console.error('[monitor/alerts]', error);
    return NextResponse.json(
      errorEnvelope('Internal server error', 'internal'),
      { status: 500 }
    );
  }
}
