/**
 * GET /api/monitor/[address]?chain=ethereum
 * Get monitoring status for a specific contract.
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope } from '@/lib/api/envelope';
import { validateAddress } from '@/lib/validators';

export async function GET(request, { params }) {
  try {
    const { address } = await params;
    const validation = validateAddress(address);

    if (!validation.valid) {
      return NextResponse.json(
        errorEnvelope(validation.error, 'internal'),
        { status: 400 }
      );
    }

    return NextResponse.json(successEnvelope({
      address: validation.normalized,
      isMonitored: false,
      alerts: [],
      lastCheck: null,
    }, 'internal', 'live'));
  } catch (error) {
    console.error('[monitor/address]', error);
    return NextResponse.json(
      errorEnvelope('Internal server error', 'internal'),
      { status: 500 }
    );
  }
}
