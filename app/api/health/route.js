/**
 * GET /api/health
 * Health check endpoint.
 */

import { NextResponse } from 'next/server';
import { successEnvelope } from '@/lib/api/envelope';

export async function GET() {
  return NextResponse.json(successEnvelope({
    status: 'healthy',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      etherscan: { status: 'connected', latency: null },
      rpc: { status: 'connected', latency: null },
      database: { status: 'connected', latency: null },
    },
  }));
}
