"""CLI entry point for the Python security scanner.

Usage:
    python -m scanners.python.cli.main --target ./contracts --output ./reports
    python -m scanners.python.cli.main --address 0x... --chain ethereum
"""

import argparse
import json
import os
import sys

# Add parent directories to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from scanners.python.core.security_engine import SecurityEngine
from scanners.python.analyzers.reentrancy import ReentrancyAnalyzer
from scanners.python.analyzers.overflow import OverflowAnalyzer
from scanners.python.analyzers.flash_loan import FlashLoanAnalyzer
from scanners.python.analyzers.proxy import ProxyAnalyzer


def create_engine():
    """Create a fully configured security engine with all analyzers."""
    engine = SecurityEngine()
    engine.register_analyzer(ReentrancyAnalyzer())
    engine.register_analyzer(OverflowAnalyzer())
    engine.register_analyzer(FlashLoanAnalyzer())
    engine.register_analyzer(ProxyAnalyzer())
    return engine


def scan_file(engine, file_path, chain_id=1):
    """Scan a single Solidity file."""
    with open(file_path, 'r') as f:
        source_code = f.read()

    contract_name = os.path.basename(file_path).replace('.sol', '')

    report = engine.analyze(
        source_code=source_code,
        bytecode='0x',
        contract_address=f'file://{file_path}',
        chain_id=chain_id,
        chain_name='local',
        contract_name=contract_name,
    )

    return report


def scan_directory(engine, directory, output_dir=None, chain_id=1):
    """Scan all Solidity files in a directory."""
    reports = []

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.sol'):
                file_path = os.path.join(root, file)
                try:
                    report = scan_file(engine, file_path, chain_id)
                    reports.append(report)

                    # Print summary
                    summary = report.summary
                    print(f"\n{'='*60}")
                    print(f"Contract: {report.contract_name}")
                    print(f"File: {file_path}")
                    print(f"Findings: {summary['totalFindings']}")
                    print(f"  Critical: {summary['bySeverity']['critical']}")
                    print(f"  High: {summary['bySeverity']['high']}")
                    print(f"  Medium: {summary['bySeverity']['medium']}")
                    print(f"  Low: {summary['bySeverity']['low']}")
                    print(f"  Info: {summary['bySeverity']['informational']}")

                    if report.risk_score:
                        print(f"Risk Score: {report.risk_score['score']}/100 ({report.risk_score['label']})")

                    # Print findings
                    for finding in report.findings:
                        print(f"\n  [{finding.severity.value.upper()}] {finding.title}")
                        print(f"    Score: {finding.score}/10")
                        print(f"    {finding.description[:100]}...")

                except Exception as e:
                    print(f"Error scanning {file_path}: {e}")

    # Save reports if output directory specified
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        for report in reports:
            output_file = os.path.join(
                output_dir,
                f"{report.contract_name}_{report.audit_id}.json"
            )
            with open(output_file, 'w') as f:
                json.dump(report.to_dict(), f, indent=2)
            print(f"\nReport saved: {output_file}")

    return reports


def main():
    parser = argparse.ArgumentParser(
        description='Smart Contract Security Scanner',
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    parser.add_argument(
        '--target', '-t',
        required=True,
        help='Directory or file to scan',
    )

    parser.add_argument(
        '--output', '-o',
        default='./reports',
        help='Output directory for reports (default: ./reports)',
    )

    parser.add_argument(
        '--chain', '-c',
        type=int,
        default=1,
        help='Chain ID (default: 1 for Ethereum)',
    )

    parser.add_argument(
        '--format', '-f',
        choices=['json', 'text'],
        default='text',
        help='Output format (default: text)',
    )

    args = parser.parse_args()

    engine = create_engine()

    if os.path.isfile(args.target):
        report = scan_file(engine, args.target, args.chain)
        if args.format == 'json':
            print(json.dumps(report.to_dict(), indent=2))
        else:
            print(json.dumps(report.to_dict(), indent=2))
    elif os.path.isdir(args.target):
        reports = scan_directory(engine, args.target, args.output, args.chain)
        print(f"\n\nScanned {len(reports)} contracts.")
        total_findings = sum(len(r.findings) for r in reports)
        print(f"Total findings: {total_findings}")
    else:
        print(f"Error: {args.target} is not a valid file or directory")
        sys.exit(1)


if __name__ == '__main__':
    main()
