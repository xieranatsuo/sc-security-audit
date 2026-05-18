/**
 * API response envelope contract.
 * Every API route MUST wrap responses in this format.
 * Success: { data, status, provider, lastUpdated, error: null }
 * Error: { data: null, status: "error", provider, lastUpdated, error }
 */

/**
 * Create a standard envelope response.
 * @param {Object} options
 * @param {*} options.data - Response payload (null for errors)
 * @param {string} options.status - "live" | "cached" | "fallback" | "error"
 * @param {string} options.provider - Data source identifier
 * @param {string|null} options.error - Error message or null
 * @returns {Object}
 */
export function envelope({ data = null, status = 'live', provider = 'internal', error = null }) {
  return {
    data,
    status,
    provider,
    lastUpdated: new Date().toISOString(),
    error,
  };
}

/**
 * Success response envelope.
 * @param {*} data - Response payload
 * @param {string} provider - Data source identifier
 * @param {string} status - "live" | "cached" | "fallback"
 * @returns {Object}
 */
export function successEnvelope(data, provider = 'internal', status = 'live') {
  return envelope({ data, status, provider, error: null });
}

/**
 * Error response envelope.
 * @param {string} message - Error message
 * @param {string} provider - Data source identifier
 * @returns {Object}
 */
export function errorEnvelope(message, provider = 'internal') {
  return envelope({ data: null, status: 'error', provider, error: message });
}

/**
 * Generate a unique request ID using Date.now().
 * @returns {string}
 */
export function generateRequestId() {
  return `req_${Date.now()}_${Date.now().toString(36).slice(-8)}`;
}

/**
 * Standard error codes used across all API routes.
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  BLOCKCHAIN_ERROR: 'BLOCKCHAIN_ERROR',
  CONTRACT_NOT_VERIFIED: 'CONTRACT_NOT_VERIFIED',
};
