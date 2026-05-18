/**
 * GET /api/risk/dashboard
 * Get risk dashboard aggregated data.
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope } from '@/lib/api/envelope';

export async function GET(request) {
  try {
    return NextResponse.json(successEnvelope({
      overview: {
        totalAudits: 0,
        avgRiskScore: 0,
        criticalFindings: 0,
        highFindings: 0,
      },
      byChain: {
        ethereum: { audits: 0, avgRisk: 0 },
        bsc: { audits: 0, avgRisk: 0 },
        polygon: { audits: 0, avgRisk: 0 },
        arbitrum: { audits: 0, avgRisk: 0 },
      },
      recentAudits: [],
      topVulnerabilities: [],
    }, 'internal', 'live'));
  } catch (error) {
    console.error('[risk/dashboard]', error);
    return NextResponse.json(
      errorEnvelope('Internal server error', 'internal'),
      { status: 500 }
    );
  }
}
