/**
 * Risk Score calculation tests.
 * Validates the formula: RiskScore = 100 * (w1*S + w2*E + w3*A + w4*I + w5*D)
 * Weights: w1=0.30, w2=0.25, w3=0.20, w4=0.15, w5=0.10
 * Run with: npx jest tests/javascript/risk-score.test.js
 */

import { calculateRiskScore, validateWeights, WEIGHTS } from '@/lib/risk-score';

describe('Risk Score Weights', () => {
  test('weights sum to exactly 1.0', () => {
    const sum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });

  test('weight validation passes for correct weights', () => {
    expect(() => validateWeights()).not.toThrow();
  });

  test('individual weights are correct', () => {
    expect(WEIGHTS.severity).toBeCloseTo(0.30, 2);
    expect(WEIGHTS.exploitability).toBeCloseTo(0.25, 2);
    expect(WEIGHTS.attackComplexity).toBeCloseTo(0.20, 2);
    expect(WEIGHTS.impact).toBeCloseTo(0.15, 2);
    expect(WEIGHTS.detectionDifficulty).toBeCloseTo(0.10, 2);
  });
});

describe('Risk Score Calculation', () => {
  test('all zeros returns 0', () => {
    const score = calculateRiskScore({ S: 0, E: 0, A: 0, I: 0, D: 0 });
    expect(score).toBe(0);
  });

  test('all ones returns 100', () => {
    const score = calculateRiskScore({ S: 1, E: 1, A: 1, I: 1, D: 1 });
    expect(score).toBeCloseTo(100, 0);
  });

  test('only severity max returns 30', () => {
    const score = calculateRiskScore({ S: 1, E: 0, A: 0, I: 0, D: 0 });
    expect(score).toBeCloseTo(30, 0);
  });

  test('only exploitability max returns 25', () => {
    const score = calculateRiskScore({ S: 0, E: 1, A: 0, I: 0, D: 0 });
    expect(score).toBeCloseTo(25, 0);
  });

  test('only attack complexity max returns 20', () => {
    const score = calculateRiskScore({ S: 0, E: 0, A: 1, I: 0, D: 0 });
    expect(score).toBeCloseTo(20, 0);
  });

  test('only impact max returns 15', () => {
    const score = calculateRiskScore({ S: 0, E: 0, A: 0, I: 1, D: 0 });
    expect(score).toBeCloseTo(15, 0);
  });

  test('only detection difficulty max returns 10', () => {
    const score = calculateRiskScore({ S: 0, E: 0, A: 0, I: 0, D: 1 });
    expect(score).toBeCloseTo(10, 0);
  });

  test('half values returns 50', () => {
    const score = calculateRiskScore({ S: 0.5, E: 0.5, A: 0.5, I: 0.5, D: 0.5 });
    expect(score).toBeCloseTo(50, 0);
  });

  test('score is clamped to 100 max', () => {
    const score = calculateRiskScore({ S: 2, E: 2, A: 2, I: 2, D: 2 });
    expect(score).toBeLessThanOrEqual(100);
  });

  test('score is clamped to 0 min', () => {
    const score = calculateRiskScore({ S: -1, E: -1, A: -1, I: -1, D: -1 });
    expect(score).toBeGreaterThanOrEqual(0);
  });

  test('returns numeric type', () => {
    const score = calculateRiskScore({ S: 0.7, E: 0.5, A: 0.3, I: 0.8, D: 0.2 });
    expect(typeof score).toBe('number');
    expect(Number.isNaN(score)).toBe(false);
  });
});

describe('Risk Score Consistency', () => {
  test('same inputs produce same output', () => {
    const inputs = { S: 0.8, E: 0.6, A: 0.4, I: 0.7, D: 0.3 };
    const score1 = calculateRiskScore(inputs);
    const score2 = calculateRiskScore(inputs);
    expect(score1).toBe(score2);
  });

  test('higher severity increases score', () => {
    const low = calculateRiskScore({ S: 0.2, E: 0.5, A: 0.5, I: 0.5, D: 0.5 });
    const high = calculateRiskScore({ S: 0.9, E: 0.5, A: 0.5, I: 0.5, D: 0.5 });
    expect(high).toBeGreaterThan(low);
  });
});
