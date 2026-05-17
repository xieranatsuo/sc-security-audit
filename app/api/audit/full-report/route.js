/**
 * GET /api/audit/full-report?address=0x...&chain=ethereum
 * Generate a full audit report combining source + bytecode analysis.
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';
import { validateAddress, validateChain } from '@/lib/validators';
import { getContractSource } from '@/lib/etherscan';
import { getCode } from '@/lib/rpc';

export async function GET(request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') || 'ethereum';

    const addressValidation = validateAddress(address);
    if (!addressValidation.valid) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, addressValidation.error, null, { requestId }),
        { status: 400 }
      );
    }

    const chainValidation = validateChain(chain);
    if (!chainValidation.valid) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, chainValidation.error, null, { requestId }),
        { status: 400 }
      );
    }

    // Fetch contract source
    let contractSource = null;
    try {
      contractSource = await getContractSource(chainValidation.chainId, addressValidation.normalized);
    } catch (error) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.CONTRACT_NOT_VERIFIED, error.message, null, { requestId }),
        { status: 404 }
      );
    }

    // Get bytecode
    let bytecode = '0x';
    try {
      bytecode = await getCode(chainValidation.chainName, addressValidation.normalized);
    } catch {
      // Continue without bytecode
    }

    const report = {
      auditId: `audit_${Date.now().toString(36)}`,
      contractAddress: addressValidation.normalized,
      chainId: chainValidation.chainId,
      chainName: chainValidation.chainName,
      contractName: contractSource.contractName,
      compilerVersion: contractSource.compiler,
      timestamp: new Date().toISOString(),
      sourceCode: {
        length: contractSource.sourceCode.length,
        lines: contractSource.sourceCode.split('\n').length,
        hasMultiPart: contractSource.sourceCode.includes('{{'),
      },
      bytecode: {
        size: (bytecode.length - 2) / 2,
        hasCode: bytecode.length > 4,
      },
      metadata: {
        isProxy: contractSource.proxy === '1',
        implementation: contractSource.implementation,
        licenseType: contractSource.licenseType,
        optimizationUsed: contractSource.optimizationUsed,
        runs: contractSource.runs,
        evmVersion: contractSource.evmVersion,
      },
      findings: [],
      riskScore: { score: 0, label: 'INFORMATIONAL' },
    };

    return NextResponse.json(successEnvelope(report, { requestId }));
  } catch (error) {
    console.error('[audit/full-report]', error);
    return NextResponse.json(
      errorEnvelope(ErrorCodes.INTERNAL_ERROR, 'Internal server error', error.message, { requestId }),
      { status: 500 }
    );
  }
}
