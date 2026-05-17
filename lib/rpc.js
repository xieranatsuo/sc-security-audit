/**
 * Direct EVM RPC client using JSON-RPC 2.0.
 * Public endpoints only — no paid provider keys.
 * Supports: eth_call, eth_getCode, eth_getStorageAt, eth_blockNumber, etc.
 */

import { config } from '@/lib/config';

/**
 * Make a JSON-RPC call to an EVM node.
 * @param {string} chain - Chain name (ethereum, bsc, polygon, arbitrum)
 * @param {string} method - RPC method
 * @param {Array} params - Method parameters
 * @returns {Promise<any>} RPC result
 */
export async function rpcCall(chain, method, params = []) {
  const rpcUrl = config.rpcs[chain];
  if (!rpcUrl) {
    throw new Error(`No RPC endpoint configured for chain: ${chain}`);
  }

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC HTTP error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`RPC error: ${data.error.message} (code: ${data.error.code})`);
  }

  return data.result;
}

/**
 * Get contract bytecode at an address.
 * Returns '0x' if address is an EOA (no code).
 */
export async function getCode(chain, address, blockTag = 'latest') {
  return rpcCall(chain, 'eth_getCode', [address, blockTag]);
}

/**
 * Get storage value at a specific slot.
 * Useful for detecting proxy implementation slots, owner variables, etc.
 */
export async function getStorageAt(chain, address, slot, blockTag = 'latest') {
  return rpcCall(chain, 'eth_getStorageAt', [address, slot, blockTag]);
}

/**
 * Get current block number.
 */
export async function getBlockNumber(chain) {
  const result = await rpcCall(chain, 'eth_blockNumber');
  return parseInt(result, 16);
}

/**
 * Get block by number with transaction hashes.
 */
export async function getBlock(chain, blockNumber, includeTransactions = false) {
  const blockHex = '0x' + blockNumber.toString(16);
  return rpcCall(chain, 'eth_getBlockByNumber', [blockHex, includeTransactions]);
}

/**
 * Get transaction receipt.
 */
export async function getTransactionReceipt(chain, txHash) {
  return rpcCall(chain, 'eth_getTransactionReceipt', [txHash]);
}

/**
 * Call a contract function (read-only, no state change).
 * @param {string} chain
 * @param {string} to - Contract address
 * @param {string} data - Encoded function call data
 * @returns {string} Encoded return data
 */
export async function ethCall(chain, to, data) {
  return rpcCall(chain, 'eth_call', [{ to, data }, 'latest']);
}

/**
 * Get the latest block timestamp.
 */
export async function getLatestBlockTimestamp(chain) {
  const block = await getBlock(chain, 'latest');
  return parseInt(block.timestamp, 16);
}

/**
 * Get chain ID from the RPC node.
 */
export async function getChainId(chain) {
  const result = await rpcCall(chain, 'eth_chainId');
  return parseInt(result, 16);
}
