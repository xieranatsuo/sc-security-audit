"""Core security engine for smart contract analysis.

Orchestrates all vulnerability analyzers and produces
a comprehensive security report.
"""

import hashlib
import json
import time
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any

from .severity import Vulnerability, SeverityLevel, classify_severity
from .risk import RiskInput, calculate_risk_score, risk_label


@dataclass
class SecurityReport:
    """Complete security analysis report for a contract."""
    contract_address: str
    chain_id: int
    chain_name: str
    contract_name: str
    compiler_version: str
    audit_id: str
    timestamp: str
    findings: List[Vulnerability] = field(default_factory=list)
    risk_score: Optional[Dict] = None
    gas_analysis: Optional[Dict] = None
    summary: Optional[Dict] = None
    metadata: Dict = field(default_factory=dict)

    def to_dict(self):
        """Convert report to API-serializable dictionary."""
        return {
            'auditId': self.audit_id,
            'contractAddress': self.contract_address,
            'chainId': self.chain_id,
            'chainName': self.chain_name,
            'contractName': self.contract_name,
            'compilerVersion': self.compiler_version,
            'timestamp': self.timestamp,
            'findings': [f.to_dict() for f in self.findings],
            'riskScore': self.risk_score,
            'gasAnalysis': self.gas_analysis,
            'summary': self.summary,
            'metadata': self.metadata,
        }


class SecurityEngine:
    """Main security analysis engine.

    Usage:
        engine = SecurityEngine()
        engine.register_analyzer(reentrancy_analyzer)
        engine.register_analyzer(overflow_analyzer)
        report = engine.analyze(source_code, bytecode, contract_address, chain_id)
    """

    def __init__(self):
        self._analyzers = []
        self._bytecode_analyzers = []

    def register_analyzer(self, analyzer, bytecode_only=False):
        """Register a vulnerability analyzer.

        Args:
            analyzer: Analyzer instance with analyze() method
            bytecode_only: If True, analyzer only needs bytecode (not source)
        """
        if bytecode_only:
            self._bytecode_analyzers.append(analyzer)
        else:
            self._analyzers.append(analyzer)

    def analyze(
        self,
        source_code: str,
        bytecode: str,
        contract_address: str,
        chain_id: int,
        chain_name: str = 'ethereum',
        contract_name: str = 'Unknown',
        compiler_version: str = 'unknown',
        abi: str = '[]',
    ) -> SecurityReport:
        """Run full security analysis on a contract.

        Args:
            source_code: Solidity source code
            bytecode: Contract bytecode (hex)
            contract_address: Contract address
            chain_id: Chain ID
            chain_name: Chain name
            contract_name: Contract name
            compiler_version: Compiler version
            abi: Contract ABI (JSON string)

        Returns:
            SecurityReport with all findings
        """
        audit_id = self._generate_audit_id(contract_address, chain_id)

        report = SecurityReport(
            contract_address=contract_address,
            chain_id=chain_id,
            chain_name=chain_name,
            contract_name=contract_name,
            compiler_version=compiler_version,
            audit_id=audit_id,
            timestamp=self._timestamp(),
        )

        all_findings = []

        # Run source code analyzers
        for analyzer in self._analyzers:
            try:
                findings = analyzer.analyze(
                    source_code=source_code,
                    bytecode=bytecode,
                    contract_address=contract_address,
                    chain_id=chain_id,
                    abi=abi,
                )
                all_findings.extend(findings)
            except Exception as e:
                report.metadata[f'error_{analyzer.__class__.__name__}'] = str(e)

        # Run bytecode-only analyzers
        for analyzer in self._bytecode_analyzers:
            try:
                findings = analyzer.analyze(
                    bytecode=bytecode,
                    contract_address=contract_address,
                    chain_id=chain_id,
                )
                all_findings.extend(findings)
            except Exception as e:
                report.metadata[f'error_{analyzer.__class__.__name__}'] = str(e)

        report.findings = all_findings

        # Calculate composite risk score
        report.risk_score = self._calculate_report_risk(all_findings)

        # Generate summary
        report.summary = self._generate_summary(all_findings)

        return report

    def _calculate_report_risk(self, findings: List[Vulnerability]) -> Dict:
        """Calculate overall risk score from all findings."""
        if not findings:
            return {
                'score': 0,
                'label': 'INFORMATIONAL',
                'color': '#6b7280',
                'breakdown': {},
                'formula': 'RiskScore = 100 * (w1*S + w2*E + w3*A + w4*I + w5*D)',
            }

        # Aggregate finding scores into risk input factors
        max_severity = max(f.score for f in findings)
        avg_severity = sum(f.score for f in findings) / len(findings)

        # Count by severity for exploitability assessment
        critical_count = sum(1 for f in findings if f.severity == SeverityLevel.CRITICAL)
        high_count = sum(1 for f in findings if f.severity == SeverityLevel.HIGH)

        exploitability = min(1.0, (critical_count * 0.4 + high_count * 0.2 + 0.1))
        attack_complexity = 1.0 - (avg_severity / 10.0)  # Lower complexity = higher risk
        impact = max_severity / 10.0
        detection_difficulty = min(1.0, len(findings) * 0.1 + 0.2)

        risk_input = RiskInput(
            severity=avg_severity / 10.0,
            exploitability=exploitability,
            attack_complexity=attack_complexity,
            impact=impact,
            detection_difficulty=detection_difficulty,
        )

        result = calculate_risk_score(risk_input)
        result['label'] = risk_label(result['score'])
        result['color'] = self._risk_color(result['score'])

        return result

    def _generate_summary(self, findings: List[Vulnerability]) -> Dict:
        """Generate a summary of findings by severity."""
        counts = {
            'critical': 0,
            'high': 0,
            'medium': 0,
            'low': 0,
            'informational': 0,
        }

        for finding in findings:
            counts[finding.severity.value] += 1

        return {
            'totalFindings': len(findings),
            'bySeverity': counts,
            'topCategories': self._top_categories(findings),
        }

    def _top_categories(self, findings: List[Vulnerability]) -> List[Dict]:
        """Get top vulnerability categories by count."""
        category_counts = {}
        for f in findings:
            category_counts[f.category] = category_counts.get(f.category, 0) + 1

        sorted_categories = sorted(
            category_counts.items(),
            key=lambda x: x[1],
            reverse=True,
        )

        return [{'category': cat, 'count': count} for cat, count in sorted_categories[:5]]

    def _risk_color(self, score: float) -> str:
        if score >= 80: return '#dc2626'
        if score >= 60: return '#ea580c'
        if score >= 40: return '#ca8a04'
        if score >= 20: return '#16a34a'
        return '#6b7280'

    def _generate_audit_id(self, address: str, chain_id: int) -> str:
        raw = f"{address}_{chain_id}_{time.time()}"
        return f"audit_{hashlib.sha256(raw.encode()).hexdigest()[:16]}"

    def _timestamp(self):
        import datetime
        return datetime.datetime.utcnow().isoformat() + 'Z'
