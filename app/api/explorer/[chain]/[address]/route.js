/**
 * GET /api/explorer/[chain]/[address]
 * Get blockchain explorer data for an address.
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';
import { validateAddress, validateChain } from '@/lib/validators';
import { getContractSource, getTransactions, getBalance } from '@/lib/etherscan';
import { getCode } from '@/lib/rpc';

export async function GET(request, { params }) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const { chain, address } = await params;

    const chainValidation = validateChain(chain);
    if (!chainValidation.valid) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, chainValidation.error, null, { requestId }),
        { status: 400 }
      );
    }

    const addressValidation = validateAddress(address);
    if (!addressValidation.valid) {
      return NextResponse.json(
        errorEnvelope(ErrorCodes.VALIDATION_ERROR, addressValidation.error, null, { requestId }),
        { status: 400 }
      );
    }

    // Get bytecode to determine if contract
    let bytecode = '0x';
    try {
      bytecode = await getCode(chainValidation.chainName, addressValidation.normalized);
    } catch {
      // Continue without bytecode
    }

    const isContract = bytecode.length > 4;

    // Get balance
    let balance = '0';
    try {
      balance = await getBalance(chainValidation.chainId, addressValidation.normalized);
    } catch {
      // Continue without balance
    }

    // Get recent transactions
    let transactions = [];
    try {
      transactions = await getTransactions(chainValidation.chainId, addressValidation.normalized, { offset: 10 });
    } catch {
      // Continue without transactions
    }

    // Get contract source if it's a contract
    let contractInfo = null;
    if (isContract) {
      try {
        contractInfo = await getContractSource(chainValidation.chainId, addressValidation.normalized);
      } catch {
        // Contract may not be verified
      }
    }

    return NextResponse.json(successEnvelope({
      address: addressValidation.normalized,
      chain: chainValidation.chainName,
      chainId: chainValidation.chainId,
      isContract,
      balance: balance.toString(),
      bytecodeSize: (bytecode.length - 2) / 2,
      contract: contractInfo ? {
        name: contractInfo.contractName,
        compiler: contractInfo.compiler,
        verified: true,
        isProxy: contractInfo.proxy === '1',
        implementation: contractInfo.implementation,
      } : null,
      recentTransactions: Array.isArray(transactions) ? transactions.slice(0, 10).map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        timeStamp: tx.timeStamp,
        isError: tx.isError,
      })) : [],
    }, { requestId }));
  } catch (error) {
    console.error('[explorer]', error);
    return NextResponse.json(
      errorEnvelope(ErrorCodes.INTERNAL_ERROR, 'Internal server error', error.message, { requestId }),
      { status: 500 }
    );
  }
}
