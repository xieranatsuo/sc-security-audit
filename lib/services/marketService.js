/**
 * Market service — token prices, gas estimates, and market analytics.
 * Attempts live API calls first; falls back to deterministic demonstration data on failure.
 */

import { DEMO_MARKET_DATA, deterministicIndex } from '@/lib/mock-data';

// ── Live API Helpers ───────────────────────────────────────────

async function fetchLivePrices() {
  const res = await fetch('/api/market/prices');
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function fetchLiveGasPrices(chains) {
  const qs = chains ? `?chains=${chains.join(',')}` : '';
  const res = await fetch(`/api/market/gas${qs}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function fetchLiveMarketOverview() {
  const res = await fetch('/api/market/overview');
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function fetchLiveTokenInfo(address, chain) {
  const res = await fetch(`/api/market/token?address=${address}&chain=${chain}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// ── Deterministic Fallback Builders ────────────────────────────

function buildPrices() {
  return {
    ethereum: {
      symbol: 'ETH',
      price: DEMO_MARKET_DATA.ethPrice,
      change24h: DEMO_MARKET_DATA.ethChange24h,
      marketCap: DEMO_MARKET_DATA.marketCap.eth,
    },
    bsc: {
      symbol: 'BNB',
      price: DEMO_MARKET_DATA.bnbPrice,
      change24h: DEMO_MARKET_DATA.bnbChange24h,
      marketCap: DEMO_MARKET_DATA.marketCap.bnb,
    },
    polygon: {
      symbol: 'MATIC',
      price: DEMO_MARKET_DATA.maticPrice,
      change24h: DEMO_MARKET_DATA.maticChange24h,
      marketCap: DEMO_MARKET_DATA.marketCap.matic,
    },
    arbitrum: {
      symbol: 'ARB',
      price: DEMO_MARKET_DATA.arbPrice,
      change24h: DEMO_MARKET_DATA.arbChange24h,
      marketCap: DEMO_MARKET_DATA.marketCap.arb,
    },
  };
}

function buildGasPrices(chains) {
  const allGas = {
    ethereum: { chain: 'ethereum', standard: '18', fast: '24', instant: '32', unit: 'gwei' },
    bsc: { chain: 'bsc', standard: '3', fast: '5', instant: '7', unit: 'gwei' },
    polygon: { chain: 'polygon', standard: '42', fast: '65', instant: '100', unit: 'gwei' },
    arbitrum: { chain: 'arbitrum', standard: '0.12', fast: '0.18', instant: '0.25', unit: 'gwei' },
  };
  if (chains) {
    const filtered = {};
    for (const c of chains) {
      if (allGas[c]) filtered[c] = allGas[c];
    }
    return filtered;
  }
  return allGas;
}

function buildOverview() {
  return {
    prices: buildPrices(),
    gas: buildGasPrices(),
    totalValueLocked: DEMO_MARKET_DATA.totalValueLocked,
    totalAudits24h: 1247,
    activeMonitors: 89,
    lastUpdated: new Date().toISOString(),
  };
}

function buildTokenInfo(address, chain) {
  const idx = deterministicIndex(address, 0, 1000);
  return {
    address,
    chain: chain || 'ethereum',
    name: 'Token ' + address.slice(2, 8),
    symbol: address.slice(2, 6).toUpperCase(),
    decimals: 18,
    price: (idx % 5000) + 0.01,
    change24h: (idx % 20) - 10,
    volume24h: `${(idx % 100) + 1}M`,
    holders: (idx * 137) % 100000,
    totalSupply: `${(idx % 1000000).toLocaleString()}`,
  };
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Fetch current token/chain prices.
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function getPrices() {
  try {
    const res = await fetchLivePrices();
    return { data: res.data || res, error: null, source: 'live' };
  } catch {
    return { data: buildPrices(), error: null, source: 'demo' };
  }
}

/**
 * Fetch gas prices for one or more chains.
 * @param {string[]} [chains] - Optional array of chain names.
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function getGasPrices(chains) {
  try {
    const res = await fetchLiveGasPrices(chains);
    return { data: res.data || res, error: null, source: 'live' };
  } catch {
    return { data: buildGasPrices(chains), error: null, source: 'demo' };
  }
}

/**
 * Fetch market overview (prices, gas, TVL, activity counts).
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function getMarketOverview() {
  try {
    const res = await fetchLiveMarketOverview();
    return { data: res.data || res, error: null, source: 'live' };
  } catch {
    return { data: buildOverview(), error: null, source: 'demo' };
  }
}

/**
 * Fetch info for a specific token by address.
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function getTokenInfo(address, chain = 'ethereum') {
  try {
    const res = await fetchLiveTokenInfo(address, chain);
    return { data: res.data || res, error: null, source: 'live' };
  } catch {
    return { data: buildTokenInfo(address, chain), error: null, source: 'demo' };
  }
}
