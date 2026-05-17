/**
 * Etherscan V2 API client.
 * Single key works across all supported chains (chainid parameter).
 * Docs: https://docs.etherscan.io/
 *
 * Free tier: 5 calls/sec, contract source code, ABI, transactions.
 */

import { config } from '@/lib/config';

const { baseUrl, apiKey, rateLimit } = config.etherscan;

/** Simple rate limiter — tracks call timestamps */
const callTimestamps = [];

function rateLimitWait() {
  const now = Date.now();
  const windowStart = now - 1000;
  const recentCalls = callTimestamps.filter((t) => t > windowStart);
  if (recentCalls.length >= rateLimit) {
    const waitMs = recentCalls[0] + 1000 - now;
    return new Promise((resolve) => setTimeout(resolve, Math.max(waitMs, 0)));
  }
  callTimestamps.push(now);
  return Promise.resolve();
}

/**
 * Make an Etherscan V2 API call.
 * @param {number} chainId - Chain ID (1=ETH, 56=BSC, 137=Polygon, 42161=Arbitrum)
 * @param {string} module - API module (contract, account, stats, etc.)
 * @param {string} action - API action
 * @param {object} params - Additional parameters
 * @returns {Promise<object>} API response data
 */
export async function etherscanV2Call(chainId, module, action, params = {}) {
  await rateLimitWait();

  const url = new URL(baseUrl);
  url.searchParams.set('chainid', String(chainId));
  url.searchParams.set('module', module);
  url.searchParams.set('action', action);
  url.searchParams.set('apikey', apiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Etherscan API HTTP error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status === '0' && data.message === 'NOTOK') {
    throw new Error(`Etherscan API error: ${data.result}`);
  }

  return data;
}

/**
 * Get contract source code and ABI.
 * @param {number} chainId
 * @param {string} address - Contract address
 * @returns {Promise<{sourceCode: string, abi: string, contractName: string, compiler: string}>}
 */
export async function getContractSource(chainId, address) {
  const data = await etherscanV2Call(chainId, 'contract', 'getsourcecode', { address });

  if (!data.result || !data.result[0]) {
    throw new Error(`No source code found for ${address} on chain ${chainId}`);
  }

  const result = data.result[0];

  if (result.SourceCode === '') {
    throw new Error(`Contract ${address} is not verified on chain ${chainId}`);
  }

  // Handle multi-part source code (JSON format)
  let sourceCode = result.SourceCode;
  if (sourceCode.startsWith('{{')) {
    try {
      const parsed = JSON.parse(sourceCode.slice(1, -1));
      sourceCode = Object.values(parsed.sources || parsed)
        .map((s) => s.content || s)
        .join('\n\n');
    } catch {
      // Use raw source if parsing fails
    }
  }

  return {
    sourceCode,
    abi: result.ABI,
    contractName: result.ContractName,
    compiler: result.CompilerVersion,
    optimizationUsed: result.OptimizationUsed,
    runs: result.Runs,
    evmVersion: result.EVMVersion,
    licenseType: result.LicenseType,
    proxy: result.Proxy,
    implementation: result.Implementation,
  };
}

/**
 * Get contract ABI only.
 * @param {number} chainId
 * @param {string} address
 * @returns {Promise<string>} JSON ABI string
 */
export async function getContractABI(chainId, address) {
  const data = await etherscanV2Call(chainId, 'contract', 'getabi', { address });
  return data.result;
}

/**
 * Get normal transactions for an address.
 * @param {number} chainId
 * @param {string} address
 * @param {object} options - startblock, endblock, page, offset, sort
 * @returns {Promise<Array>}
 */
export async function getTransactions(chainId, address, options = {}) {
  const data = await etherscanV2Call(chainId, 'account', 'txlist', {
    address,
    startblock: options.startblock || 0,
    endblock: options.endblock || 99999999,
    page: options.page || 1,
    offset: options.offset || 10,
    sort: options.sort || 'desc',
  });
  return data.result;
}

/**
 * Get internal transactions for an address.
 */
export async function getInternalTransactions(chainId, address, options = {}) {
  const data = await etherscanV2Call(chainId, 'account', 'txlistinternal', {
    address,
    startblock: options.startblock || 0,
    endblock: options.endblock || 99999999,
    page: options.page || 1,
    offset: options.offset || 10,
    sort: options.sort || 'desc',
  });
  return data.result;
}

/**
 * Get ERC-20 token transfers for an address.
 */
export async function getTokenTransfers(chainId, address, options = {}) {
  const data = await etherscanV2Call(chainId, 'account', 'tokentx', {
    address,
    page: options.page || 1,
    offset: options.offset || 10,
    sort: options.sort || 'desc',
  });
  return data.result;
}

/**
 * Get ETH/BNB balance for an address.
 */
export async function getBalance(chainId, address) {
  const data = await etherscanV2Call(chainId, 'account', 'balance', {
    address,
    tag: 'latest',
  });
  return data.result;
}
