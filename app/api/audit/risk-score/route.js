/**
 * POST /api/audit/risk-score
 * Calculate risk score for a set of vulnerability findings.
 *
 * Request body:
 *   { findings: Array<{severity, exploitability, attackComplexity, impact, detectionDifficulty}> }
 */

import { NextResponse } from 'next/server';
import { successEnvelope, errorEnvelope } from '@/lib/api/envelope';
import { config, validateRiskWeights } from '@/lib/config';

// Validate weights at startup
validateRiskWeights();

export async function POST(request) {
  try {
    const body = await request.json();
    const { findings } = body;

    if (!findings || !Array.isArray(findings) || findings.length === 0) {
      return NextResponse.json(
        errorEnvelope('findings array is required and must not be empty', 'internal'),
        { status: 400 }
      );
    }

    const weights = config.riskWeights;

    // Calculate composite risk score using the formula:
    // RiskScore = 100 * (w1*S + w2*E + w3*A + w4*I + w5*D)
    const results = findings.map((finding, index) => {
      const s = Math.max(0, Math.min(1, finding.severity || 0));
      const e = Math.max(0, Math.min(1, finding.exploitability || 0));
      const a = Math.max(0, Math.min(1, finding.attackComplexity || 0));
      const i = Math.max(0, Math.min(1, finding.impact || 0));
      const d = Math.max(0, Math.min(1, finding.detectionDifficulty || 0));

      const weightedSum = (
        weights.severity * s +
        weights.exploitability * e +
        weights.attackComplexity * a +
        weights.impact * i +
        weights.detectionDifficulty * d
      );

      const score = Math.round(100 * weightedSum * 100) / 100;

      return {
        index,
        score: Math.max(0, Math.min(100, score)),
        breakdown: {
          severity: { value: s, weight: weights.severity, contribution: Math.round(weights.severity * s * 10000) / 100 },
          exploitability: { value: e, weight: weights.exploitability, contribution: Math.round(weights.exploitability * e * 10000) / 100 },
          attackComplexity: { value: a, weight: weights.attackComplexity, contribution: Math.round(weights.attackComplexity * a * 10000) / 100 },
          impact: { value: i, weight: weights.impact, contribution: Math.round(weights.impact * i * 10000) / 100 },
          detectionDifficulty: { value: d, weight: weights.detectionDifficulty, contribution: Math.round(weights.detectionDifficulty * d * 10000) / 100 },
        },
      };
    });

    // Aggregate
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const maxScore = Math.max(...results.map(r => r.score));

    return NextResponse.json(successEnvelope({
      formula: 'RiskScore = 100 * (w1*S + w2*E + w3*A + w4*I + w5*D)',
      weights,
      results,
      aggregate: {
        averageScore: Math.round(avgScore * 100) / 100,
        maxScore,
        count: results.length,
      },
    }, 'internal', 'live'));
  } catch (error) {
    console.error('[audit/risk-score]', error);
    return NextResponse.json(
      errorEnvelope('Internal server error', 'internal'),
      { status: 500 }
    );
  }
}
