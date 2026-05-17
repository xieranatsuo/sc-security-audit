#!/usr/bin/env python3
"""risk-dashboard.py — Generate risk dashboard data.

Reads audit reports from JSON files and generates aggregated statistics.
Can be used as a standalone script or imported as a module.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path


def load_reports(reports_dir='./reports'):
    """Load all audit report JSON files from a directory."""
    reports = []
    if not os.path.exists(reports_dir):
        return reports

    for file in os.listdir(reports_dir):
        if file.endswith('.json'):
            try:
                with open(os.path.join(reports_dir, file)) as f:
                    reports.append(json.load(f))
            except (json.JSONDecodeError, IOError):
                continue

    return reports


def aggregate_stats(reports):
    """Calculate aggregate statistics from reports."""
    if not reports:
        return {
            'totalAudits': 0,
            'totalContracts': 0,
            'totalFindings': 0,
            'avgRiskScore': 0,
            'bySeverity': {'critical': 0, 'high': 0, 'medium': 0, 'low': 0, 'informational': 0},
            'byChain': {},
            'topCategories': [],
        }

    total_findings = 0
    severity_counts = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0, 'informational': 0}
    chain_stats = {}
    category_counts = {}
    risk_scores = []
    contracts = set()

    for report in reports:
        # Track unique contracts
        addr = report.get('contractAddress', '')
        chain = report.get('chainName', 'unknown')
        contracts.add(f"{chain}_{addr}")

        # Chain stats
        if chain not in chain_stats:
            chain_stats[chain] = {'audits': 0, 'totalRisk': 0}
        chain_stats[chain]['audits'] += 1

        risk_score = report.get('riskScore', {})
        if isinstance(risk_score, dict):
            score = risk_score.get('score', 0)
        else:
            score = risk_score
        chain_stats[chain]['totalRisk'] += score
        risk_scores.append(score)

        # Findings
        findings = report.get('findings', [])
        total_findings += len(findings)

        for finding in findings:
            sev = finding.get('severity', 'informational')
            if sev in severity_counts:
                severity_counts[sev] += 1

            cat = finding.get('category', 'Unknown')
            category_counts[cat] = category_counts.get(cat, 0) + 1

    # Calculate averages
    avg_risk = sum(risk_scores) / len(risk_scores) if risk_scores else 0

    for chain in chain_stats:
        if chain_stats[chain]['audits'] > 0:
            chain_stats[chain]['avgRisk'] = chain_stats[chain]['totalRisk'] / chain_stats[chain]['audits']

    # Top categories
    top_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        'totalAudits': len(reports),
        'totalContracts': len(contracts),
        'totalFindings': total_findings,
        'avgRiskScore': round(avg_risk, 2),
        'bySeverity': severity_counts,
        'byChain': chain_stats,
        'topCategories': [{'category': c, 'count': n} for c, n in top_categories],
    }


def main():
    reports_dir = sys.argv[1] if len(sys.argv) > 1 else './reports'
    reports = load_reports(reports_dir)
    stats = aggregate_stats(reports)

    print(json.dumps(stats, indent=2))


if __name__ == '__main__':
    main()
