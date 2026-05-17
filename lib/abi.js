/**
 * Common contract ABIs for on-chain function calls.
 * Minimal ABIs — only the functions we need for monitoring.
 */

/** ERC-20 Standard */
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
  'function transfer(address,uint256) returns (bool)',
  'function approve(address,uint256) returns (bool)',
  'function transferFrom(address,address,uint256) returns (bool)',
  'event Transfer(address indexed,address indexed,uint256)',
  'event Approval(address indexed,address indexed,uint256)',
];

/** ERC-721 Standard */
export const ERC721_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function ownerOf(uint256) view returns (address)',
  'function transferFrom(address,address,uint256)',
  'function safeTransferFrom(address,address,uint256)',
  'function approve(address,uint256)',
  'function getApproved(uint256) view returns (address)',
  'function setApprovalForAll(address,bool)',
  'function isApprovedForAll(address,address) view returns (bool)',
  'event Transfer(address indexed,address indexed,uint256 indexed)',
  'event Approval(address indexed,address indexed,uint256 indexed)',
];

/** Ownable */
export const OWNABLE_ABI = [
  'function owner() view returns (address)',
  'function renounceOwnership()',
  'function transferOwnership(address)',
  'event OwnershipTransferred(address indexed,address indexed)',
];

/** Proxy (EIP-1967) */
export const PROXY_ABI = [
  'function implementation() view returns (address)',
  'function admin() view returns (address)',
  'function changeAdmin(address)',
  'function upgrade(address)',
  'function upgradeToAndCall(address,bytes)',
];

/** Uniswap V2 Pair */
export const UNISWAP_V2_PAIR_ABI = [
  'function getReserves() view returns (uint112,uint112,uint32)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function totalSupply() view returns (uint256)',
  'function swap(uint256,uint256,address,bytes)',
  'event Swap(address indexed,uint256,uint256,uint256,uint256,address indexed)',
  'event Sync(uint112,uint112)',
];

/** Uniswap V3 Pool */
export const UNISWAP_V3_POOL_ABI = [
  'function slot0() view returns (uint160,int24,uint16,uint16,uint16,uint8,bool)',
  'function liquidity() view returns (uint128)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function fee() view returns (uint24)',
];

/** Flash Loan (Aave V3) */
export const FLASH_LOAN_ABI = [
  'function flashLoan(address,address,uint256,bytes)',
  'function flashLoanSimple(address,address,uint256,bytes,uint16)',
];

/** Timelock */
export const TIMELOCK_ABI = [
  'function delay() view returns (uint256)',
  'function MINIMUM_DELAY() view returns (uint256)',
  'function MAXIMUM_DELAY() view returns (uint256)',
  'function queueTransaction(address,uint256,string,bytes,uint256) returns (bytes32)',
  'function executeTransaction(address,uint256,string,bytes,uint256) returns (bytes)',
  'function cancelTransaction(address,uint256,string,bytes,uint256)',
];

/** Multisig (Gnosis Safe) */
export const MULTISIG_ABI = [
  'function getOwners() view returns (address[])',
  'function getThreshold() view returns (uint256)',
  'function nonce() view returns (uint256)',
  'function isOwner(address) view returns (bool)',
  'function execTransaction(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,bytes) returns (bool)',
];

/**
 * Encode a function call using the ABI.
 * Uses ethers.js-style ABI encoding with just the function signature.
 * @param {string} signature - e.g. 'balanceOf(address)'
 * @param {Array} params - Parameters to encode
 * @returns {string} Encoded calldata
 */
export function encodeFunctionData(signature, params = []) {
  // Simple keccak256-based encoding for common functions
  // In production, use ethers.js or viem for full ABI encoding
  const functionSelector = signature.split('(')[0];
  throw new Error(
    `Use ethers.js or viem for ABI encoding. Function: ${functionSelector}`
  );
}
