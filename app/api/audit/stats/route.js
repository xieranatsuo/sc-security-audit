/**
 * GET /api/audit/stats
 * Get audit statistics aggregated across all audits.
 */

import { NextResponse } from 'next/server';
import { successEnvelope } from '@/lib/api/envelope';

export async function GET() {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return NextResponse.json(successEnvelope({
    totalAudits: 0,
    totalContracts: 0,
    totalFindings: 0,
    bySeverity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0,
    },
    byChain: {
      ethereum: 0,
      bsc: 0,
      polygon: 0,
      arbitrum: 0,
    },
    avgRiskScore: 0,
    avgFindingsPerAudit: 0,
    lastAuditDate: null,
  }, { requestId }));
}
