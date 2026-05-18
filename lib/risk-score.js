/**
 * Risk Score Calculation
 * Formula: RiskScore = 100 * (w1*S + w2*E + w3*A + w4*I + w5*D)
 * Weights: w1=0.30, w2=0.25, w3=0.20, w4=0.15, w5=0.10
 * Runtime assertion: weights must sum to 1.0
 */

export const WEIGHTS = {
  severity: 0.30,
  exploitability: 0.25,
  attackComplexity: 0.20,
  impact: 0.15,
  detectionDifficulty: 0.10,
};

// Runtime weight validation
const weightSum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
if (Math.abs(weightSum - 1.0) > 1e-10) {
  throw new Error(`Risk weights must sum to 1.0, got ${weightSum}`);
}

export function validateWeights() {
  const sum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1.0) > 1e-10) {
    throw new Error(`Risk weights must sum to 1.0, got ${sum}`);
  }
}

/**
 * Calculate risk score from 5 normalized factors (0-1 range).
 * @param {Object} params - { S, E, A, I, D } each 0-1
 * @returns {number} Risk score 0-100
 */
export function calculateRiskScore({ S, E, A, I, D }) {
  const raw = 100 * (
    WEIGHTS.severity * S +
    WEIGHTS.exploitability * E +
    WEIGHTS.attackComplexity * A +
    WEIGHTS.impact * I +
    WEIGHTS.detectionDifficulty * D
  );

  return Math.max(0, Math.min(100, raw));
}
