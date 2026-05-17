/**
 * JavaScript tests — API envelope, validators, config.
 * Run with: npx jest tests/javascript/
 */

import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';
import { validateAddress, validateChain, validatePagination } from '@/lib/validators';
import { validateRiskWeights, config } from '@/lib/config';

describe('API Envelope', () => {
  test('successEnvelope wraps data correctly', () => {
    const result = successEnvelope({ foo: 'bar' });
    expect(result.data).toEqual({ foo: 'bar' });
    expect(result.meta).toHaveProperty('timestamp');
    expect(result.meta).toHaveProperty('version', '1.0.0');
    expect(result.meta).toHaveProperty('requestId');
  });

  test('errorEnvelope wraps error correctly', () => {
    const result = errorEnvelope(ErrorCodes.VALIDATION_ERROR, 'Bad input');
    expect(result.error.code).toBe('VALIDATION_ERROR');
    expect(result.error.message).toBe('Bad input');
    expect(result.meta).toHaveProperty('timestamp');
  });

  test('errorEnvelope includes details when provided', () => {
    const result = errorEnvelope(ErrorCodes.INTERNAL_ERROR, 'Fail', { stack: '...' });
    expect(result.error.details).toEqual({ stack: '...' });
  });
});

describe('Validators', () => {
  test('validateAddress accepts valid address', () => {
    const result = validateAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2');
  });

  test('validateAddress rejects invalid address', () => {
    expect(validateAddress('not-an-address').valid).toBe(false);
    expect(validateAddress('0x123').valid).toBe(false);
    expect(validateAddress('').valid).toBe(false);
    expect(validateAddress(null).valid).toBe(false);
  });

  test('validateChain accepts valid chain names', () => {
    expect(validateChain('ethereum').valid).toBe(true);
    expect(validateChain('bsc').valid).toBe(true);
    expect(validateChain('polygon').valid).toBe(true);
    expect(validateChain('arbitrum').valid).toBe(true);
  });

  test('validateChain accepts valid chain IDs', () => {
    expect(validateChain(1).valid).toBe(true);
    expect(validateChain(56).valid).toBe(true);
    expect(validateChain(137).valid).toBe(true);
    expect(validateChain(42161).valid).toBe(true);
  });

  test('validateChain rejects unsupported chains', () => {
    expect(validateChain('solana').valid).toBe(false);
    expect(validateChain(999).valid).toBe(false);
  });

  test('validatePagination accepts valid params', () => {
    const result = validatePagination({ page: '2', limit: '50' });
    expect(result.valid).toBe(true);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(50);
  });

  test('validatePagination uses defaults', () => {
    const result = validatePagination({});
    expect(result.valid).toBe(true);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  test('validatePagination rejects invalid params', () => {
    expect(validatePagination({ page: '0' }).valid).toBe(false);
    expect(validatePagination({ limit: '200' }).valid).toBe(false);
  });
});

describe('Config', () => {
  test('riskWeights sum to 1.0', () => {
    expect(() => validateRiskWeights()).not.toThrow();
  });

  test('all RPC endpoints are configured', () => {
    expect(config.rpcs.ethereum).toBeTruthy();
    expect(config.rpcs.bsc).toBeTruthy();
    expect(config.rpcs.polygon).toBeTruthy();
    expect(config.rpcs.arbitrum).toBeTruthy();
  });

  test('supported chains are configured', () => {
    expect(Object.keys(config.chains)).toHaveLength(4);
    expect(config.chains.ethereum.id).toBe(1);
    expect(config.chains.bsc.id).toBe(56);
    expect(config.chains.polygon.id).toBe(137);
    expect(config.chains.arbitrum.id).toBe(42161);
  });
});
