"""Severity levels and scoring for vulnerability findings.

Uses a 0-10 CVSS-like scale with defined thresholds.
"""

from enum import Enum
from dataclasses import dataclass
from typing import Optional


class SeverityLevel(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFORMATIONAL = "informational"


@dataclass
class SeverityRange:
    level: SeverityLevel
    min_score: float
    max_score: float
    color: str
    description: str


SEVERITY_RANGES = [
    SeverityRange(SeverityLevel.CRITICAL, 9.0, 10.0, '#dc2626', 'Direct loss of funds, contract takeover'),
    SeverityRange(SeverityLevel.HIGH, 7.0, 8.9, '#ea580c', 'Significant risk, exploitable under certain conditions'),
    SeverityRange(SeverityLevel.MEDIUM, 4.0, 6.9, '#ca8a04', 'Moderate risk, requires specific conditions'),
    SeverityRange(SeverityLevel.LOW, 1.0, 3.9, '#16a34a', 'Minor risk, defense-in-depth improvement'),
    SeverityRange(SeverityLevel.INFORMATIONAL, 0.0, 0.9, '#6b7280', 'Best practice recommendation'),
]


def classify_severity(score: float) -> SeverityLevel:
    """Classify a numeric score into a severity level.

    Args:
        score: Numeric severity score (0.0 to 10.0)

    Returns:
        SeverityLevel enum value
    """
    if score < 0 or score > 10:
        raise ValueError(f"Score must be between 0 and 10, got {score}")

    for severity_range in SEVERITY_RANGES:
        if severity_range.min_score <= score <= severity_range.max_score:
            return severity_range.level

    return SeverityLevel.INFORMATIONAL


def get_severity_color(level: SeverityLevel) -> str:
    """Get the hex color for a severity level."""
    for severity_range in SEVERITY_RANGES:
        if severity_range.level == level:
            return severity_range.color
    return '#6b7280'


def get_severity_description(level: SeverityLevel) -> str:
    """Get the description for a severity level."""
    for severity_range in SEVERITY_RANGES:
        if severity_range.level == level:
            return severity_range.description
    return 'Unknown severity'


@dataclass
class Vulnerability:
    """A single vulnerability finding."""
    id: str
    title: str
    description: str
    severity: SeverityLevel
    score: float
    category: str
    cwe_id: Optional[str] = None
    location: Optional[str] = None
    code_snippet: Optional[str] = None
    recommendation: Optional[str] = None
    references: Optional[list] = None
    gas_impact: Optional[int] = None

    def to_dict(self):
        """Convert to dictionary for API response."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'severity': self.severity.value,
            'score': self.score,
            'category': self.category,
            'cweId': self.cwe_id,
            'location': self.location,
            'codeSnippet': self.code_snippet,
            'recommendation': self.recommendation,
            'references': self.references or [],
            'gasImpact': self.gas_impact,
            'color': get_severity_color(self.severity),
        }


# Common vulnerability categories
CATEGORIES = {
    'REENTRANCY': 'Reentrancy',
    'ACCESS_CONTROL': 'Access Control',
    'ARITHMETIC': 'Arithmetic',
    'FLASH_LOAN': 'Flash Loan',
    'ORACLE_MANIPULATION': 'Oracle Manipulation',
    'FRONTRUNNING': 'Front-Running',
    'LOGIC': 'Business Logic',
    'GAS_OPTIMIZATION': 'Gas Optimization',
    'PROXY': 'Proxy Safety',
    'ERC_COMPLIANCE': 'ERC Compliance',
    'PRIVACY': 'Privacy',
    'DENIAL_OF_SERVICE': 'Denial of Service',
}

# CWE mappings for common smart contract vulnerabilities
CWE_MAPPINGS = {
    'REENTRANCY': 'CWE-841',       # Implementation of Behavioral Workflow
    'ACCESS_CONTROL': 'CWE-284',    # Improper Access Control
    'ARITHMETIC': 'CWE-190',        # Integer Overflow
    'FLASH_LOAN': 'CWE-682',        # Incorrect Calculation
    'ORACLE_MANIPULATION': 'CWE-345', # Insufficient Verification of Data Authenticity
    'FRONTRUNNING': 'CWE-362',      # Race Condition
    'LOGIC': 'CWE-840',             # Business Logic Error
    'GAS_OPTIMIZATION': 'CWE-1104', # Use of Unmaintained Third Party Components
    'PROXY': 'CWE-913',             # Improper Control of Dynamically-Managed Code Resources
    'DENIAL_OF_SERVICE': 'CWE-400', # Uncontrolled Resource Consumption
}
