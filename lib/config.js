/**
 * Centralized application configuration.
 * All RPC endpoints are public — no paid keys required for basic operation.
 * Etherscan V2 API key enables contract source code fetching across all chains.
 */

export const config = {
  /** Blockchain RPC endpoints — all public, no API key required */
  rpcs: {
    ethereum: process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    bsc: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org',
    polygon: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    arbitrum: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
  },

  /** Etherscan V2 API — single key, all chains */
  etherscan: {
    baseUrl: 'https://api.etherscan.io/v2/api',
    apiKey: process.env.ETHERSCAN_API_KEY || '',
    rateLimit: 5, // calls per second (free tier)
  },

  /** Supported blockchain networks */
  chains: {
    ethereum: { id: 1, name: 'Ethereum', symbol: 'ETH', explorer: 'https://etherscan.io' },
    bsc: { id: 56, name: 'BNB Chain', symbol: 'BNB', explorer: 'https://bscscan.com' },
    polygon: { id: 137, name: 'Polygon', symbol: 'MATIC', explorer: 'https://polygonscan.com' },
    arbitrum: { id: 42161, name: 'Arbitrum', symbol: 'ETH', explorer: 'https://arbiscan.io' },
  },

  /** Risk scoring weights (must sum to 1.0 — enforced at runtime) */
  riskWeights: {
    severity: 0.30,
    exploitability: 0.25,
    attackComplexity: 0.20,
    impact: 0.15,
    detectionDifficulty: 0.10,
  },

  /** API configuration */
  api: {
    version: '1.0.0',
    maxPageSize: 100,
    defaultPageSize: 20,
    rateLimitPerMinute: 60,
  },

  /** Monitoring configuration */
  monitor: {
    alertCooldownMs: 300000, // 5 minutes between duplicate alerts
    maxAlertsPerContract: 50,
    enabledChains: ['ethereum', 'bsc', 'polygon', 'arbitrum'],
  },
};

/**
 * Validate risk weights sum to 1.0.
 * Throws at startup if weights are misconfigured.
 */
export function validateRiskWeights() {
  const { riskWeights } = config;
  const sum = Object.values(riskWeights).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1.0) > 0.001) {
    throw new Error(
      `Risk weights must sum to 1.0, got ${sum.toFixed(4)}. ` +
      `Current weights: ${JSON.stringify(riskWeights)}`
    );
  }
  return true;
}
