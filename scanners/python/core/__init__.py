"""Core security analysis engine components."""

from .opcodes import OPCODES, disassemble, is_dangerous
from .severity import SeverityLevel, Vulnerability, classify_severity
from .risk import RiskInput, calculate_risk_score, validate_weights
from .security_engine import SecurityEngine, SecurityReport

__all__ = [
    'OPCODES', 'disassemble', 'is_dangerous',
    'SeverityLevel', 'Vulnerability', 'classify_severity',
    'RiskInput', 'calculate_risk_score', 'validate_weights',
    'SecurityEngine', 'SecurityReport',
]
