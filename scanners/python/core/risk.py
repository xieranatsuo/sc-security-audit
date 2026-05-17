"""Risk scoring engine with formal weighted formula.

RiskScore = 100 * (w1*S + w2*E + w3*A + w4*I + w5*D)

Where:
    S = Severity score (normalized 0-1)
    E = Exploitability score (normalized 0-1)
    A = Attack complexity score (normalized 0-1, lower complexity = higher risk)
    I = Impact score (normalized 0-1)
    D = Detection difficulty score (normalized 0-1, harder to detect = higher risk)
    w1..w5 = Configurable weights (must sum to 1.0)

Runtime assertion enforces weight integrity on every calculation.
"""

from dataclasses import dataclass
from typing import List, Dict, Optional
import hashlib
import json


@dataclass
class RiskInput:
    """Input factors for risk calculation."""
    severity: float        # 0.0 to 1.0
    exploitability: float  # 0.0 to 1.0
    attack_complexity: float  # 0.0 to 1.0 (lower complexity = higher score)
    impact: float          # 0.0 to 1.0
    detection_difficulty: float  # 0.0 to 1.0


# Default weights — must sum to 1.0
DEFAULT_WEIGHTS = {
    'severity': 0.30,
    'exploitability': 0.25,
    'attack_complexity': 0.20,
    'impact': 0.15,
    'detection_difficulty': 0.10,
}


def validate_weights(weights: Dict[str, float]) -> bool:
    """Validate that weights sum to 1.0.

    Args:
        weights: Dictionary of weight name to value

    Returns:
        True if valid

    Raises:
        ValueError if weights don't sum to 1.0
    """
    total = sum(weights.values())
    if abs(total - 1.0) > 0.001:
        raise ValueError(
            f"Risk weights must sum to 1.0, got {total:.4f}. "
            f"Current weights: {json.dumps(weights, indent=2)}"
        )
    return True


def calculate_risk_score(
    inputs: RiskInput,
    weights: Optional[Dict[str, float]] = None,
    seed: Optional[str] = None,
) -> Dict:
    """Calculate the composite risk score.

    Formula: RiskScore = 100 * (w1*S + w2*E + w3*A + w4*I + w5*D)

    Args:
        inputs: RiskInput with all factor scores
        weights: Optional custom weights (defaults to DEFAULT_WEIGHTS)
        seed: Optional deterministic seed for reproducibility

    Returns:
        Dictionary with score, breakdown, and metadata
    """
    w = weights or DEFAULT_WEIGHTS

    # Runtime weight validation — enforced on every call
    validate_weights(w)

    # Calculate weighted sum
    weighted_sum = (
        w['severity'] * inputs.severity +
        w['exploitability'] * inputs.exploitability +
        w['attack_complexity'] * inputs.attack_complexity +
        w['impact'] * inputs.impact +
        w['detection_difficulty'] * inputs.detection_difficulty
    )

    # Scale to 0-100
    score = round(100 * weighted_sum, 2)

    # Clamp to 0-100
    score = max(0.0, min(100.0, score))

    # Calculate breakdown for transparency
    breakdown = {
        'severity': {
            'value': inputs.severity,
            'weight': w['severity'],
            'contribution': round(w['severity'] * inputs.severity * 100, 2),
        },
        'exploitability': {
            'value': inputs.exploitability,
            'weight': w['exploitability'],
            'contribution': round(w['exploitability'] * inputs.exploitability * 100, 2),
        },
        'attack_complexity': {
            'value': inputs.attack_complexity,
            'weight': w['attack_complexity'],
            'contribution': round(w['attack_complexity'] * inputs.attack_complexity * 100, 2),
        },
        'impact': {
            'value': inputs.impact,
            'weight': w['impact'],
            'contribution': round(w['impact'] * inputs.impact * 100, 2),
        },
        'detection_difficulty': {
            'value': inputs.detection_difficulty,
            'weight': w['detection_difficulty'],
            'contribution': round(w['detection_difficulty'] * inputs.detection_difficulty * 100, 2),
        },
    }

    return {
        'score': score,
        'breakdown': breakdown,
        'weights': w,
        'formula': 'RiskScore = 100 * (w1*S + w2*E + w3*A + w4*I + w5*D)',
        'seed': seed,
    }


def calculate_batch_risk_scores(
    inputs_list: List[RiskInput],
    weights: Optional[Dict[str, float]] = None,
) -> List[Dict]:
    """Calculate risk scores for multiple inputs.

    Args:
        inputs_list: List of RiskInput objects
        weights: Optional custom weights

    Returns:
        List of risk score dictionaries
    """
    return [
        calculate_risk_score(inputs, weights, seed=str(i))
        for i, inputs in enumerate(inputs_list)
    ]


def risk_label(score: float) -> str:
    """Get a human-readable risk label for a score.

    Args:
        score: Risk score (0-100)

    Returns:
        Risk label string
    """
    if score >= 80:
        return 'CRITICAL'
    elif score >= 60:
        return 'HIGH'
    elif score >= 40:
        return 'MEDIUM'
    elif score >= 20:
        return 'LOW'
    else:
        return 'INFORMATIONAL'


def risk_color(score: float) -> str:
    """Get the hex color for a risk score."""
    if score >= 80:
        return '#dc2626'
    elif score >= 60:
        return '#ea580c'
    elif score >= 40:
        return '#ca8a04'
    elif score >= 20:
        return '#16a34a'
    else:
        return '#6b7280'


def normalize_score(value: float, min_val: float, max_val: float) -> float:
    """Normalize a value to 0-1 range.

    Args:
        value: Raw value
        min_val: Minimum possible value
        max_val: Maximum possible value

    Returns:
        Normalized value (0.0 to 1.0)
    """
    if max_val == min_val:
        return 0.0
    return max(0.0, min(1.0, (value - min_val) / (max_val - min_val)))
