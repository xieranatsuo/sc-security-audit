/**
 * GET /api/contracts?chain=ethereum&page=1&limit=20
 * List audited contracts from the registry.
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';
import { validateChain, validatePagination } from '@/lib/validators';

// In-memory store for demo (would be PostgreSQL in production)
const contractRegistry = new Map();

export async function GET(request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain');
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

    let chainFilter = null;
    if (chain) {
      const chainValidation = validateChain(chain);
      if (!chainValidation.valid) {
        return NextResponse.json(
          errorEnvelope(ErrorCodes.VALIDATION_ERROR, chainValidation.error, null, { requestId }),
          { status: 400 }
        );
      }
      chainFilter = chainValidation.chainId;
    }

    // Get contracts from registry
    let contracts = Array.from(contractRegistry.values());

    if (chainFilter) {
      contracts = contracts.filter(c => c.chainId === chainFilter);
    }

    // Sort by last audit date
    contracts.sort((a, b) => new Date(b.lastAudit) - new Date(a.lastAudit));

    // Paginate
    const { page, limit } = pageValidation;
    const start = (page - 1) * limit;
    const paginatedContracts = contracts.slice(start, start + limit);

    return NextResponse.json(successEnvelope({
      contracts: paginatedContracts,
      pagination: {
        page,
        limit,
        total: contracts.length,
        totalPages: Math.ceil(contracts.length / limit),
      },
    }, { requestId }));
  } catch (error) {
    console.error('[contracts]', error);
    return NextResponse.json(
      errorEnvelope(ErrorCodes.INTERNAL_ERROR, 'Internal server error', error.message, { requestId }),
      { status: 500 }
    );
  }
}

/**
 * POST /api/contracts
 * Register a contract in the registry after audit.
 */
export async function POST(request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const body = await request.json();
    const { address, chainId, chainName, contractName, auditId, riskScore } = body;

    if (!address || !chainId) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, 'address and chainId are required', null, { requestId }),
        { status: 400 }
      );
    }

    const key = `${chainId}_${address.toLowerCase()}`;
    const existing = contractRegistry.get(key);

    const contract = {
      address: address.toLowerCase(),
      chainId,
      chainName: chainName || 'unknown',
      contractName: contractName || 'Unknown',
      auditCount: (existing?.auditCount || 0) + 1,
      lastAudit: new Date().toISOString(),
      lastAuditId: auditId,
      riskScore: riskScore || 0,
      riskLabel: getRiskLabel(riskScore || 0),
    };

    contractRegistry.set(key, contract);

    return NextResponse.json(successEnvelope(contract, { requestId }));
  } catch (error) {
    console.error('[contracts POST]', error);
    return NextResponse.json(
      errorEnvelope(ErrorCodes.INTERNAL_ERROR, 'Internal server error', error.message, { requestId }),
      { status: 500 }
    );
  }
}

function getRiskLabel(score) {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  if (score >= 20) return 'LOW';
  return 'INFORMATIONAL';
}
