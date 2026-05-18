/**
 * Explorer service — block explorer lookups for contracts, transactions, and blocks.
 * Attempts live API calls first; falls back to deterministic demonstration data on failure.
 */

import {
  DEMO_CONTRACTS,
  DEMO_TRANSACTIONS,
  deterministicScore,
  deterministicIndex,
  deterministicDate,
} from '@/lib/mock-data';

// ── Live API Helpers ───────────────────────────────────────────

async function fetchLiveContractInfo(address, chain) {
  const res = await fetch(`/api/explorer/contract?address=${address}&chain=${chain}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function fetchLiveTransaction(hash, chain) {
  const res = await fetch(`/api/explorer/tx?hash=${hash}&chain=${chain}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function fetchLiveBlock(blockNumber, chain) {
  const res = await fetch(`/api/explorer/block?number=${blockNumber}&chain=${chain}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function fetchLiveAddressInfo(address, chain) {
  const res = await fetch(`/api/explorer/address?address=${address}&chain=${chain}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// ── Deterministic Fallback Builders ────────────────────────────

function buildContractInfo(address, chain) {
  const known = DEMO_CONTRACTS.find(
    (c) => c.address.toLowerCase() === address.toLowerCase()
  );
  if (known) {
    return {
      address: known.address,
      name: known.name,
      chain: chain || known.chain,
      type: known.type,
      verified: known.verified,
      compiler: known.compiler,
      balance: known.balance,
      txCount: known.txCount,
      creator: '0xDeployer' + address.slice(10, 30),
      createdAt: deterministicDate(address, 365),
      sourceCode: known.verified ? '// Verified source available via Etherscan API' : null,
    };
  }

  const score = deterministicScore(address);
  return {
    address,
    chain: chain || 'ethereum',
    name: 'Contract ' + address.slice(0, 10),
    type: ['Token', 'DEX', 'Lending', 'NFT', 'Proxy'][deterministicIndex(address, 0, 5)],
    verified: score > 40,
    compiler: `v0.8.${deterministicIndex(address, 1, 24)}`,
    balance: `${deterministicIndex(address, 2, 1000)} ETH`,
    txCount: deterministicIndex(address, 3, 100000),
    creator: '0x' + address.slice(2, 22),
    createdAt: deterministicDate(address, 730),
    sourceCode: score > 40 ? '// Verified source available via Etherscan API' : null,
  };
}

function buildTransactionInfo(hash, chain) {
  const known = DEMO_TRANSACTIONS.find((t) => t.hash === hash);
  if (known) return { ...known, chain: chain || known.chain };

  return {
    hash,
    chain: chain || 'ethereum',
    from: '0x' + hash.slice(2, 42),
    to: '0x' + hash.slice(42, 64) + hash.slice(2, 22),
    method: 'transfer',
    value: `${deterministicIndex(hash, 0, 10)} ETH`,
    gas: `${deterministicIndex(hash, 1, 500000) + 21000}`,
    gasUsed: `${deterministicIndex(hash, 2, 300000) + 21000}`,
    gasPrice: `${deterministicIndex(hash, 3, 100) + 10} gwei`,
    status: deterministicIndex(hash, 4, 10) > 1 ? 'success' : 'reverted',
    blockNumber: 19000000 + deterministicIndex(hash, 5, 500000),
    timestamp: deterministicDate(hash, 7),
    nonce: deterministicIndex(hash, 6, 10000),
    inputData: '0x' + hash.slice(2, 74),
  };
}

function buildBlockInfo(blockNumber, chain) {
  const num = parseInt(blockNumber) || 19500000;
  const seed = String(num);
  return {
    number: num,
    chain: chain || 'ethereum',
    hash: '0x' + seed.padStart(64, 'a'),
    parentHash: '0x' + String(num - 1).padStart(64, 'b'),
    timestamp: deterministicDate(seed, 30),
    gasUsed: deterministicIndex(seed, 0, 30000000) + 5000000,
    gasLimit: 30000000,
    txCount: deterministicIndex(seed, 1, 300) + 50,
    miner: '0xMiner' + seed.padStart(34, 'c'),
    difficulty: '0',
    baseFeePerGas: `${deterministicIndex(seed, 2, 80) + 5} gwei`,
  };
}

function buildAddressInfo(address, chain) {
  const known = DEMO_CONTRACTS.find(
    (c) => c.address.toLowerCase() === address.toLowerCase()
  );
  return {
    address,
    chain: chain || 'ethereum',
    balance: known?.balance || `${deterministicIndex(address, 0, 500)} ETH`,
    txCount: known?.txCount || deterministicIndex(address, 1, 500000),
    isContract: !!known || deterministicIndex(address, 2, 10) > 3,
    name: known?.name || null,
    firstSeen: deterministicDate(address, 730),
    lastActivity: deterministicDate(address, 7),
  };
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Look up contract information by address.
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function getContractInfo(address, chain = 'ethereum') {
  try {
    const res = await fetchLiveContractInfo(address, chain);
    return { data: res.data || res, error: null, source: 'live' };
  } catch {
    return { data: buildContractInfo(address, chain), error: null, source: 'demo' };
  }
}

/**
 * Look up a transaction by hash.
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function getTransaction(hash, chain = 'ethereum') {
  try {
    const res = await fetchLiveTransaction(hash, chain);
    return { data: res.data || res, error: null, source: 'live' };
  } catch {
    return { data: buildTransactionInfo(hash, chain), error: null, source: 'demo' };
  }
}

/**
 * Look up block information by number.
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function getBlock(blockNumber, chain = 'ethereum') {
  try {
    const res = await fetchLiveBlock(blockNumber, chain);
    return { data: res.data || res, error: null, source: 'live' };
  } catch {
    return { data: buildBlockInfo(blockNumber, chain), error: null, source: 'demo' };
  }
}

/**
 * Look up address information (balance, tx count, type).
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function getAddressInfo(address, chain = 'ethereum') {
  try {
    const res = await fetchLiveAddressInfo(address, chain);
    return { data: res.data || res, error: null, source: 'live' };
  } catch {
    return { data: buildAddressInfo(address, chain), error: null, source: 'demo' };
  }
}
