/**
 * Centralized demonstration data for the Smart Contract Audit Platform.
 * Provides deterministic, realistic data for all services when live APIs are unavailable.
 * All data uses address-hash seeding for consistency — fully deterministic.
 */

// ── Vulnerability Categories (18) ──────────────────────────────
export const DEMO_VULNERABILITIES = [
  { id: 'reentrancy', name: 'Reentrancy', severity: 'Critical', category: 'Logic', description: 'External calls before state updates allow recursive exploitation.', cwe: 'CWE-841', swc: 'SWC-107', count: 847 },
  { id: 'integer-overflow', name: 'Integer Overflow/Underflow', severity: 'High', category: 'Arithmetic', description: 'Unchecked arithmetic wraps around safe bounds.', cwe: 'CWE-190', swc: 'SWC-101', count: 623 },
  { id: 'access-control', name: 'Access Control Violation', severity: 'Critical', category: 'Authorization', description: 'Missing or broken authorization checks on privileged functions.', cwe: 'CWE-284', swc: 'SWC-105', count: 512 },
  { id: 'front-running', name: 'Front-Running / MEV', severity: 'Medium', category: 'Economic', description: 'Transactions can be observed and reordered for profit.', cwe: 'CWE-362', swc: 'SWC-114', count: 389 },
  { id: 'flash-loan', name: 'Flash Loan Attack Vector', severity: 'High', category: 'Economic', description: 'Price oracle manipulation via flash-borrowed capital.', cwe: 'CWE-682', swc: 'SWC-122', count: 274 },
  { id: 'oracle-manipulation', name: 'Oracle Manipulation', severity: 'High', category: 'Economic', description: 'Reliance on manipulable on-chain price feeds.', cwe: 'CWE-682', swc: 'SWC-122', count: 341 },
  { id: 'denial-of-service', name: 'Denial of Service', severity: 'Medium', category: 'Logic', description: 'Unbounded loops or gas griefing block contract operations.', cwe: 'CWE-400', swc: 'SWC-128', count: 456 },
  { id: 'tx-origin', name: 'tx.origin Authentication', severity: 'Medium', category: 'Authorization', description: 'Using tx.origin for authentication enables phishing attacks.', cwe: 'CWE-477', swc: 'SWC-115', count: 198 },
  { id: 'self-destruct', name: 'Unprotected Self-Destruct', severity: 'Critical', category: 'Logic', description: 'Anyone can destroy the contract and send funds to an arbitrary address.', cwe: 'CWE-284', swc: 'SWC-106', count: 87 },
  { id: 'delegatecall', name: 'Unsafe Delegatecall', severity: 'Critical', category: 'Logic', description: 'Delegatecall to untrusted address enables arbitrary code execution.', cwe: 'CWE-829', swc: 'SWC-112', count: 203 },
  { id: 'signature-replay', name: 'Signature Replay', severity: 'High', category: 'Authorization', description: 'Signed messages can be reused across transactions or chains.', cwe: 'CWE-294', swc: 'SWC-121', count: 156 },
  { id: 'unchecked-return', name: 'Unchecked Return Value', severity: 'Medium', category: 'Logic', description: 'Ignoring return values from external calls silently fails.', cwe: 'CWE-252', swc: 'SWC-104', count: 731 },
  { id: 'timestamp-dependence', name: 'Timestamp Dependence', severity: 'Low', category: 'Logic', description: 'Block timestamp can be manipulated by miners within ~15 seconds.', cwe: 'CWE-829', swc: 'SWC-116', count: 412 },
  { id: 'insufficient-gas', name: 'Insufficient Gas Griefing', severity: 'Low', category: 'Logic', description: 'Forwarding exact gas to subcalls can cause deliberate failures.', cwe: 'CWE-400', swc: 'SWC-126', count: 128 },
  { id: 'cross-chain-replay', name: 'Cross-Chain Replay', severity: 'High', category: 'Authorization', description: 'Signed data valid across multiple chains enables replay.', cwe: 'CWE-294', swc: 'SWC-121', count: 94 },
  { id: 'storage-collision', name: 'Storage Collision', severity: 'Critical', category: 'Proxy', description: 'Proxy and implementation contract storage layouts clash.', cwe: 'CWE-787', swc: 'SWC-112', count: 167 },
  { id: 'uninitialized-proxy', name: 'Uninitialized Proxy', severity: 'Critical', category: 'Proxy', description: 'Implementation contract can be taken over via initialize().', cwe: 'CWE-908', swc: 'SWC-116', count: 143 },
  { id: 'missing-event', name: 'Missing Event Emission', severity: 'Low', category: 'Best Practice', description: 'Critical state changes without events hinder monitoring.', cwe: 'CWE-710', swc: 'SWC-109', count: 1892 },
];

// ── Demo Contracts (10+) ───────────────────────────────────────
export const DEMO_CONTRACTS = [
  {
    name: 'Uniswap V3 Router',
    address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    chain: 'ethereum',
    type: 'DEX',
    verified: true,
    riskScore: 22,
    tags: ['amm', 'dex', 'swap', 'liquidity'],
    compiler: 'v0.7.6',
    balance: '1,247.83 ETH',
    txCount: 28439102,
  },
  {
    name: 'USD Coin (USDC)',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chain: 'ethereum',
    type: 'Token',
    verified: true,
    riskScore: 12,
    tags: ['stablecoin', 'erc20', 'fiat-backed'],
    compiler: 'v0.8.20',
    balance: '0 ETH',
    txCount: 192837461,
  },
  {
    name: 'Wrapped Ether (WETH)',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    chain: 'ethereum',
    type: 'Token',
    verified: true,
    riskScore: 8,
    tags: ['wrapped', 'erc20', 'native-bridge'],
    compiler: 'v0.4.19',
    balance: '4,892,341.12 ETH',
    txCount: 342819472,
  },
  {
    name: 'Aave V3 LendingPool',
    address: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    chain: 'ethereum',
    type: 'Lending',
    verified: true,
    riskScore: 31,
    tags: ['lending', 'borrowing', 'flash-loan', 'aave'],
    compiler: 'v0.8.19',
    balance: '892.41 ETH',
    txCount: 8923471,
  },
  {
    name: 'OpenZeppelin ERC20',
    address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    chain: 'ethereum',
    type: 'Token',
    verified: true,
    riskScore: 5,
    tags: ['erc20', 'template', 'openzeppelin'],
    compiler: 'v0.8.20',
    balance: '0 ETH',
    txCount: 12483,
  },
  {
    name: 'Compound cETH',
    address: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
    chain: 'ethereum',
    type: 'Lending',
    verified: true,
    riskScore: 27,
    tags: ['lending', 'interest', 'compound', 'ctoken'],
    compiler: 'v0.8.15',
    balance: '12,847.32 ETH',
    txCount: 5829341,
  },
  {
    name: 'Curve 3pool',
    address: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
    chain: 'ethereum',
    type: 'DEX',
    verified: true,
    riskScore: 29,
    tags: ['amm', 'stableswap', 'curve', 'lp'],
    compiler: 'v0.5.17',
    balance: '284.19 ETH',
    txCount: 4819234,
  },
  {
    name: 'OpenSea Seaport',
    address: '0x0000000000000068F116a8A904E68C6606e88088',
    chain: 'ethereum',
    type: 'NFT',
    verified: true,
    riskScore: 18,
    tags: ['nft', 'marketplace', 'opensea', 'seaport'],
    compiler: 'v0.8.17',
    balance: '192.83 ETH',
    txCount: 28491023,
  },
  {
    name: 'Lido StETH',
    address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    chain: 'ethereum',
    type: 'Staking',
    verified: true,
    riskScore: 34,
    tags: ['staking', 'liquid-staking', 'lido', 'eth2'],
    compiler: 'v0.8.13',
    balance: '93,481.29 ETH',
    txCount: 19283471,
  },
  {
    name: 'PancakeSwap Router',
    address: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    chain: 'bsc',
    type: 'DEX',
    verified: true,
    riskScore: 25,
    tags: ['amm', 'dex', 'swap', 'bsc'],
    compiler: 'v0.8.4',
    balance: '18,293.41 BNB',
    txCount: 84729103,
  },
  {
    name: 'AAVE aWETH Token',
    address: '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8',
    chain: 'ethereum',
    type: 'Token',
    verified: true,
    riskScore: 15,
    tags: ['erc20', 'aave', 'atoken', 'yield'],
    compiler: 'v0.8.19',
    balance: '0 ETH',
    txCount: 3849201,
  },
  {
    name: 'Uniswap V2 Factory',
    address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    chain: 'ethereum',
    type: 'DEX',
    verified: true,
    riskScore: 19,
    tags: ['amm', 'factory', 'dex', 'pair-creation'],
    compiler: 'v0.5.16',
    balance: '0 ETH',
    txCount: 48291034,
  },
];

// ── Audit History ──────────────────────────────────────────────
export const DEMO_AUDIT_HISTORY = [
  {
    id: 'AUD-2026-001',
    contractName: 'Uniswap V3 Router',
    address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    chain: 'ethereum',
    status: 'completed',
    riskScore: 22,
    vulnerabilitiesFound: 3,
    criticalCount: 0,
    highCount: 1,
    mediumCount: 1,
    lowCount: 1,
    auditedAt: '2026-05-15T14:23:00Z',
    duration: '4m 12s',
    scanner: 'hybrid',
  },
  {
    id: 'AUD-2026-002',
    contractName: 'Custom Lending Protocol',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
    chain: 'ethereum',
    status: 'completed',
    riskScore: 67,
    vulnerabilitiesFound: 8,
    criticalCount: 2,
    highCount: 3,
    mediumCount: 2,
    lowCount: 1,
    auditedAt: '2026-05-14T09:41:00Z',
    duration: '6m 38s',
    scanner: 'hybrid',
  },
  {
    id: 'AUD-2026-003',
    contractName: 'StakeDAO Vault',
    address: '0xB4b9D4a6d2F7e1A8C3c5D6E9F0A1B2C3D4E5F6A7',
    chain: 'bsc',
    status: 'completed',
    riskScore: 41,
    vulnerabilitiesFound: 5,
    criticalCount: 1,
    highCount: 1,
    mediumCount: 2,
    lowCount: 1,
    auditedAt: '2026-05-13T16:07:00Z',
    duration: '5m 22s',
    scanner: 'python',
  },
  {
    id: 'AUD-2026-004',
    contractName: 'NFT Marketplace v2',
    address: '0x1234567890AbcdEF1234567890aBcDeF12345678',
    chain: 'polygon',
    status: 'completed',
    riskScore: 35,
    vulnerabilitiesFound: 4,
    criticalCount: 0,
    highCount: 2,
    mediumCount: 1,
    lowCount: 1,
    auditedAt: '2026-05-12T11:55:00Z',
    duration: '3m 47s',
    scanner: 'go',
  },
  {
    id: 'AUD-2026-005',
    contractName: 'Bridge Proxy',
    address: '0xABCDEF0123456789ABCDEF0123456789ABCDEF01',
    chain: 'arbitrum',
    status: 'failed',
    riskScore: 89,
    vulnerabilitiesFound: 12,
    criticalCount: 4,
    highCount: 5,
    mediumCount: 2,
    lowCount: 1,
    auditedAt: '2026-05-11T08:30:00Z',
    duration: '7m 14s',
    scanner: 'hybrid',
  },
];

// ── Alerts ─────────────────────────────────────────────────────
export const DEMO_ALERTS = [
  { id: 'ALT-001', type: 'critical', title: 'Large Transfer Detected', contract: 'USDC', message: 'Transfer of 5,000,000 USDC to unknown address 0xdead...beef', timestamp: '2026-05-18T20:14:00Z', read: false },
  { id: 'ALT-002', type: 'warning', title: 'Unusual Gas Consumption', contract: 'Uniswap Router', message: 'Gas usage 340% above 24h average on swapExactTokensForTokens', timestamp: '2026-05-18T19:58:00Z', read: false },
  { id: 'ALT-003', type: 'info', title: 'Contract Upgrade Detected', contract: 'AAVE aWETH', message: 'Implementation changed via proxy — new logic contract deployed', timestamp: '2026-05-18T18:42:00Z', read: true },
  { id: 'ALT-004', type: 'critical', title: 'Reentrancy Attempt Blocked', contract: 'Lido StETH', message: 'Suspicious recursive call pattern detected in submit() function', timestamp: '2026-05-18T17:31:00Z', read: false },
  { id: 'ALT-005', type: 'warning', title: 'Oracle Price Deviation', contract: 'Compound cETH', message: 'Chainlink ETH/USD deviated 8.2% from Uniswap TWAP', timestamp: '2026-05-18T16:19:00Z', read: true },
  { id: 'ALT-006', type: 'info', title: 'New Contract Verified', contract: 'Curve 3pool', message: 'Source code verified on Etherscan for proxy implementation', timestamp: '2026-05-18T15:03:00Z', read: true },
  { id: 'ALT-007', type: 'warning', title: 'Admin Function Called', contract: 'PancakeSwap Router', message: 'setFeeTo() called by multisig 0xmult...sig', timestamp: '2026-05-18T14:47:00Z', read: false },
];

// ── Transactions ───────────────────────────────────────────────
export const DEMO_TRANSACTIONS = [
  { hash: '0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', from: '0xUser...0001', to: '0xE592...eB48', method: 'swapExactTokensForTokens', value: '1.5 ETH', gas: '184,291', status: 'success', timestamp: '2026-05-18T20:12:00Z', chain: 'ethereum' },
  { hash: '0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2a1', from: '0xUser...0002', to: '0x8787...7A0E', method: 'deposit', value: '10 ETH', gas: '241,034', status: 'success', timestamp: '2026-05-18T20:10:00Z', chain: 'ethereum' },
  { hash: '0xc3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2a1b2', from: '0xUser...0003', to: '0xAE7a...fE84', method: 'submit', value: '32 ETH', gas: '95,128', status: 'success', timestamp: '2026-05-18T20:08:00Z', chain: 'ethereum' },
  { hash: '0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2a1b2c3', from: '0xUser...0004', to: '0x10ED...024E', method: 'swapExactETHForTokens', value: '0.5 BNB', gas: '152,847', status: 'reverted', timestamp: '2026-05-18T20:05:00Z', chain: 'bsc' },
  { hash: '0xe5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2a1b2c3d4', from: '0xUser...0005', to: '0x0000...0888', method: 'fulfillOrder', value: '0 ETH', gas: '289,451', status: 'success', timestamp: '2026-05-18T20:03:00Z', chain: 'ethereum' },
  { hash: '0xf6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2a1b2c3d4e5', from: '0xUser...0006', to: '0xbEbc...8088', method: 'exchange', value: '5000 USDC', gas: '127,392', status: 'success', timestamp: '2026-05-18T20:01:00Z', chain: 'ethereum' },
  { hash: '0xa2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3', from: '0xUser...0007', to: '0x4Ddc...0ED5', method: 'mint', value: '2 ETH', gas: '89,214', status: 'success', timestamp: '2026-05-18T19:58:00Z', chain: 'ethereum' },
];

// ── Market Data ────────────────────────────────────────────────
export const DEMO_MARKET_DATA = {
  ethPrice: 3842.17,
  bnbPrice: 612.43,
  maticPrice: 0.89,
  arbPrice: 1.24,
  ethChange24h: 2.34,
  bnbChange24h: -1.12,
  maticChange24h: 4.67,
  arbChange24h: 3.21,
  totalValueLocked: '48.2B',
  gasPrice: { ethereum: '18 gwei', bsc: '3 gwei', polygon: '42 gwei', arbitrum: '0.12 gwei' },
  marketCap: { eth: '462.1B', bnb: '91.3B', matic: '8.9B', arb: '1.5B' },
};

// ── Helper: deterministic score from address ───────────────────
/**
 * Returns a consistent risk score (0–100) derived from the hex address string.
 * Same address always yields the same score. No randomness.
 */
export function deterministicScore(address) {
  if (!address) return 50;
  const hex = address.toLowerCase().replace('0x', '');
  let sum = 0;
  for (let i = 0; i < hex.length; i++) {
    sum += hex.charCodeAt(i);
  }
  return sum % 101; // 0–100
}

/**
 * Returns a deterministic integer derived from an address and optional salt.
 * Useful for selecting items from arrays consistently per-contract.
 */
export function deterministicIndex(address, salt = 0, modulus = 10) {
  if (!address) return 0;
  const hex = address.toLowerCase().replace('0x', '');
  let sum = salt;
  for (let i = 0; i < Math.min(hex.length, 16); i++) {
    sum += hex.charCodeAt(i) * (i + 1);
  }
  return sum % modulus;
}

/**
 * Returns a deterministic date string offset from now.
 */
export function deterministicDate(address, maxDaysAgo = 30) {
  const hex = (address || '').toLowerCase().replace('0x', '');
  let seed = 0;
  for (let i = 0; i < Math.min(hex.length, 8); i++) {
    seed += hex.charCodeAt(i);
  }
  const daysAgo = seed % maxDaysAgo;
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}
