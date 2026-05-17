/**
 * Input validation utilities.
 * All validators return { valid: boolean, error?: string }.
 */

const ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/;
const TX_HASH_REGEX = /^0x[0-9a-fA-F]{64}$/;
const CHAIN_NAMES = ['ethereum', 'bsc', 'polygon', 'arbitrum'];
const CHAIN_IDS = [1, 56, 137, 42161];

/**
 * Validate an Ethereum address.
 * @param {string} address
 * @returns {{valid: boolean, error?: string, normalized?: string}}
 */
export function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Address is required and must be a string' };
  }
  if (!ADDRESS_REGEX.test(address)) {
    return { valid: false, error: 'Invalid address format. Must be 0x followed by 40 hex characters.' };
  }
  return { valid: true, normalized: address.toLowerCase() };
}

/**
 * Validate a transaction hash.
 * @param {string} hash
 * @returns {{valid: boolean, error?: string}}
 */
export function validateTxHash(hash) {
  if (!hash || typeof hash !== 'string') {
    return { valid: false, error: 'Transaction hash is required' };
  }
  if (!TX_HASH_REGEX.test(hash)) {
    return { valid: false, error: 'Invalid transaction hash format. Must be 0x followed by 64 hex characters.' };
  }
  return { valid: true };
}

/**
 * Validate a chain name or chain ID.
 * @param {string|number} chain
 * @returns {{valid: boolean, error?: string, chainName?: string, chainId?: number}}
 */
export function validateChain(chain) {
  if (typeof chain === 'number' || /^\d+$/.test(chain)) {
    const chainId = Number(chain);
    if (!CHAIN_IDS.includes(chainId)) {
      return { valid: false, error: `Unsupported chain ID: ${chainId}. Supported: ${CHAIN_IDS.join(', ')}` };
    }
    const names = { 1: 'ethereum', 56: 'bsc', 137: 'polygon', 42161: 'arbitrum' };
    return { valid: true, chainName: names[chainId], chainId };
  }

  const name = String(chain).toLowerCase();
  if (!CHAIN_NAMES.includes(name)) {
    return { valid: false, error: `Unsupported chain: ${name}. Supported: ${CHAIN_NAMES.join(', ')}` };
  }
  const ids = { ethereum: 1, bsc: 56, polygon: 137, arbitrum: 42161 };
  return { valid: true, chainName: name, chainId: ids[name] };
}

/**
 * Validate pagination parameters.
 * @param {object} params
 * @returns {{valid: boolean, error?: string, page?: number, limit?: number}}
 */
export function validatePagination(params = {}) {
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 20;

  if (page < 1) return { valid: false, error: 'Page must be >= 1' };
  if (limit < 1 || limit > 100) return { valid: false, error: 'Limit must be between 1 and 100' };

  return { valid: true, page, limit };
}
