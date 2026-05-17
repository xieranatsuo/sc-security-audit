/**
 * GET /api/monitor/[address]?chain=ethereum
 * Get monitoring status for a specific contract.
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';
import { validateAddress } from '@/lib/validators';

export async function GET(request, { params }) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const { address } = await params;
    const validation = validateAddress(address);

    if (!validation.valid) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, validation.error, null, { requestId }),
        { status: 400 }
      );
    }

    return NextResponse.json(successEnvelope({
      address: validation.normalized,
      isMonitored: false,
      alerts: [],
      lastCheck: null,
    }, { requestId }));
  } catch (error) {
    console.error('[monitor/address]', error);
    return NextResponse.json(
      errorEnvelope(ErrorCodes.INTERNAL_ERROR, 'Internal server error', error.message, { requestId }),
      { status: 500 }
    );
  }
}
