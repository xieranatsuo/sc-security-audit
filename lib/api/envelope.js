/**
 * API response envelope contract.
 * Every API route MUST wrap responses in this format.
 * Success: { data: T, meta: { timestamp, version, requestId } }
 * Error: { error: { code, message, details? }, meta: { timestamp, version, requestId } }
 */

export function successEnvelope(data, meta = {}) {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      requestId: meta.requestId || generateRequestId(),
      ...meta,
    },
  };
}

export function errorEnvelope(code, message, details = null, meta = {}) {
  return {
    error: {
      code,
      message,
      ...(details && { details }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      requestId: meta.requestId || generateRequestId(),
      ...meta,
    },
  };
}

function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
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
