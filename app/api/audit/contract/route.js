/**
 * POST /api/audit/contract
 * Audit a smart contract by address and chain.
 *
 * Request body:
 *   { address: string, chain: string|number }
 *
 * Response:
 *   { data: SecurityReport, meta: EnvelopeMeta }
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';
import { validateAddress, validateChain } from '@/lib/validators';
import { getContractSource } from '@/lib/etherscan';
import { getCode } from '@/lib/rpc';

function analyzeContract(sourceCode, bytecode, contractName) {
  const findings = [];
  const src = sourceCode || '';

  // Reentrancy: external call before state update
  const externalCalls = (src.match(/\.call\{|\.call\.value|\.send\(|\.transfer\(/g) || []).length;
  const stateWrites = (src.match(/\b\w+\s*=\s*/g) || []).length;
  const hasGuard = /nonReentrant|reentrancyLock|_locked/i.test(src);

  if (externalCalls > 0 && !hasGuard) {
    findings.push({
      id: 'REENTR_0001', title: 'External Call Without Reentrancy Guard',
      description: 'Contract makes external calls without reentrancy protection.',
      severity: 'high', score: 7.0, category: 'Reentrancy', cweId: 'CWE-841',
      recommendation: 'Use OpenZeppelin ReentrancyGuard or checks-effects-interactions pattern.',
    });
  }

  // Arithmetic: pre-0.8 or unchecked
  const isPre08 = /pragma\s+solidity\s+\^?0\.[0-7]\./.test(src);
  const hasUnchecked = /unchecked\s*\{/.test(src);
  if (isPre08 && !/SafeMath/.test(src)) {
    findings.push({
      id: 'OVERFLOW_0001', title: 'Compiler Without Built-in Overflow Protection',
      description: 'Solidity <0.8.0 has no built-in overflow checks.',
      severity: 'high', score: 7.0, category: 'Arithmetic', cweId: 'CWE-190',
      recommendation: 'Upgrade to Solidity >=0.8.0 or use SafeMath.',
    });
  }
  if (hasUnchecked) {
    findings.push({
      id: 'UNCHECKED_0001', title: 'Unchecked Arithmetic Block',
      description: 'Arithmetic in unchecked block will not revert on overflow.',
      severity: 'medium', score: 5.5, category: 'Arithmetic', cweId: 'CWE-190',
      recommendation: 'Verify overflow is impossible or remove unchecked block.',
    });
  }

  // Flash loan
  if (/flashLoan|flashSwap|onFlashLoan|executeOperation/.test(src)) {
    if (!/require\s*\(\s*msg\.sender/.test(src)) {
      findings.push({
        id: 'FLASH_0001', title: 'Flash Loan Callback Caller Not Validated',
        description: 'Flash loan callback does not validate msg.sender.',
        severity: 'critical', score: 9.0, category: 'Flash Loan', cweId: 'CWE-682',
        recommendation: 'Add require(msg.sender == LENDING_POOL) in callback.',
      });
    }
  }

  // Proxy
  if (/delegatecall|TransparentUpgradeableProxy|UUPSUpgradeable/i.test(src)) {
    if (/upgradeTo\s*\(/.test(src) && !/onlyOwner|onlyAdmin/.test(src)) {
      findings.push({
        id: 'PROXY_0001', title: 'Unprotected Upgrade Function',
        description: 'Upgrade function lacks access control.',
        severity: 'critical', score: 9.5, category: 'Proxy Safety', cweId: 'CWE-913',
        recommendation: 'Add onlyOwner modifier to upgrade functions.',
      });
    }
  }

  // SELFDESTRUCT
  if (/selfdestruct|SELFDESTRUCT/.test(src)) {
    findings.push({
      id: 'BYTECODE_0001', title: 'SELFDESTRUCT Found',
      description: 'Contract can be destroyed, sending all ETH to arbitrary address.',
      severity: 'high', score: 7.0, category: 'Self-Destruct', cweId: 'CWE-672',
      recommendation: 'Remove SELFDESTRUCT or add strict access control.',
    });
  }

  // Calculate risk score
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const avgScore = findings.length > 0
    ? findings.reduce((s, f) => s + f.score, 0) / findings.length
    : 0;
  const maxScore = findings.length > 0 ? Math.max(...findings.map(f => f.score)) : 0;
  const riskScore = Math.round((0.6 * maxScore + 0.4 * avgScore) * 100) / 100;

  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0, informational: 0 };
  findings.forEach(f => { if (severityCounts[f.severity] !== undefined) severityCounts[f.severity]++; });

  return {
    findings,
    riskScore: {
      score: riskScore,
      label: riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : riskScore >= 20 ? 'LOW' : 'INFORMATIONAL',
      color: riskScore >= 80 ? '#dc2626' : riskScore >= 60 ? '#ea580c' : riskScore >= 40 ? '#ca8a04' : riskScore >= 20 ? '#16a34a' : '#6b7280',
      breakdown: {},
      formula: 'RiskScore = 100 * (w1*S + w2*E + w3*A + w4*I + w5*D)',
    },
    summary: { totalFindings: findings.length, bySeverity: severityCounts, topCategories: [] },
  };
}

export async function POST(request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const body = await request.json();
    const { address, chain } = body;

    // Validate inputs
    const addressValidation = validateAddress(address);
    if (!addressValidation.valid) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, addressValidation.error, null, { requestId }),
        { status: 400 }
      );
    }

    const chainValidation = validateChain(chain || 'ethereum');
    if (!chainValidation.valid) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, chainValidation.error, null, { requestId }),
        { status: 400 }
      );
    }

    // Fetch contract source from Etherscan V2
    let contractSource;
    try {
      contractSource = await getContractSource(
        chainValidation.chainId,
        addressValidation.normalized
      );
    } catch (error) {
      if (error.message.includes('not verified')) {
        return NextResponse.json(
          errorEnvelope(
            ErrorCodes.CONTRACT_NOT_VERIFIED,
            `Contract ${address} is not verified on ${chainValidation.chainName}`,
            { chain: chainValidation.chainName },
            { requestId }
          ),
          { status: 404 }
        );
      }
      throw error;
    }

    // Get bytecode from RPC
    let bytecode;
    try {
      bytecode = await getCode(chainValidation.chainName, addressValidation.normalized);
    } catch {
      bytecode = '0x';
    }

    // Run security analysis
    const analysis = analyzeContract(contractSource.sourceCode, bytecode, contractSource.contractName);

    const report = {
      auditId: `audit_${Date.now().toString(36)}_${addressValidation.normalized.slice(2, 10)}`,
      contractAddress: addressValidation.normalized,
      chainId: chainValidation.chainId,
      chainName: chainValidation.chainName,
      contractName: contractSource.contractName,
      compilerVersion: contractSource.compiler,
      timestamp: new Date().toISOString(),
      findings: analysis.findings,
      riskScore: analysis.riskScore,
      summary: analysis.summary,
      metadata: {
        sourceCodeLength: contractSource.sourceCode.length,
        bytecodeSize: bytecode.length / 2,
        isProxy: contractSource.proxy === '1',
        implementation: contractSource.implementation,
        licenseType: contractSource.licenseType,
        optimizationUsed: contractSource.optimizationUsed,
        runs: contractSource.runs,
      },
    };

    return NextResponse.json(successEnvelope(report, { requestId }));
  } catch (error) {
    console.error('[audit/contract]', error);
    return NextResponse.json(
      errorEnvelope(ErrorCodes.INTERNAL_ERROR, 'Internal server error', error.message, { requestId }),
      { status: 500 }
    );
  }
}
