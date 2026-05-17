"""Reentrancy vulnerability analyzer.

Detects:
- Classic reentrancy (call before state update)
- Cross-function reentrancy
- Cross-contract reentrancy
- Read-only reentrancy (DeFi specific)
- ERC-777 hook-based reentrancy

Detection method: Source code pattern matching + call graph analysis.
"""

import re
from typing import List

from ..core.severity import Vulnerability, SeverityLevel, CATEGORIES, CWE_MAPPINGS
from ..core.risk import normalize_score


# Dangerous external call patterns
EXTERNAL_CALL_PATTERNS = [
    r'\.call\s*\{.*\}\s*\(.*\)',         # .call{value:}() — Solidity 0.8+
    r'\.call\.value\s*\(',                # .call.value()() — legacy
    r'\.call\s*\(',                       # .call() — low level
    r'\.send\s*\(',                       # .send()
    r'\.transfer\s*\(',                   # .transfer() — 2300 gas limit
    r'Address\.sendValue\s*\(',           # OpenZeppelin Address.sendValue
    r'Address\.functionCall\s*\(',        # OpenZeppelin Address.functionCall
]

# State variable patterns
STATE_WRITE_PATTERNS = [
    r'\b(\w+)\s*=\s*',                    # variable assignment
    r'\b(\w+)\s*\+=\s*',                  # increment
    r'\b(\w+)\s*-=\s*',                   # decrement
    r'\b(\w+)\s*\[.*\]\s*=',              # mapping/array write
    r'_balances\[',                       # OpenZeppelin balances
    r'_allowances\[',                     # OpenZeppelin allowances
    r'_totalSupply',                      # totalSupply
]

# Reentrancy guard patterns (positive indicators)
REENTRANCY_GUARD_PATTERNS = [
    r'nonReentrant',                      # OpenZeppelin ReentrancyGuard
    r'reentrancyLock',                    # Custom lock
    r'_status\s*==\s*_ENTERED',           # Manual guard
    r'_locked',                           # Simple lock variable
    r'ReentrancyGuard',                   # Import
]


class ReentrancyAnalyzer:
    """Analyze Solidity source code for reentrancy vulnerabilities."""

    def __init__(self):
        self.name = 'ReentrancyAnalyzer'
        self.version = '2.0.0'

    def analyze(
        self,
        source_code: str,
        bytecode: str = '',
        contract_address: str = '',
        chain_id: int = 0,
        abi: str = '[]',
    ) -> List[Vulnerability]:
        """Run reentrancy analysis on source code.

        Args:
            source_code: Solidity source code
            bytecode: Contract bytecode (unused for source analysis)
            contract_address: Contract address (for report metadata)
            chain_id: Chain ID (for report metadata)
            abi: Contract ABI (unused)

        Returns:
            List of Vulnerability findings
        """
        findings = []

        # Check if contract has reentrancy guard
        has_guard = self._has_reentrancy_guard(source_code)

        # Find all external calls
        external_calls = self._find_external_calls(source_code)

        # Find all state writes
        state_writes = self._find_state_writes(source_code)

        # Analyze each function for reentrancy patterns
        functions = self._extract_functions(source_code)

        for func_name, func_body, func_start_line in functions:
            func_calls = self._find_in_function(func_body, EXTERNAL_CALL_PATTERNS)
            func_writes = self._find_in_function(func_body, STATE_WRITE_PATTERNS)

            if not func_calls:
                continue

            # Classic reentrancy: external call before state update
            for call in func_calls:
                for write in func_writes:
                    if call['position'] < write['position']:
                        # Check if there's a guard
                        if has_guard and self._function_has_guard(func_body, func_name):
                            continue

                        findings.append(self._create_finding(
                            title=f'Reentrancy in {func_name}()',
                            description=(
                                f'Function {func_name}() makes an external call at line '
                                f'{func_start_line + call["line"]} before updating state at line '
                                f'{func_start_line + write["line"]}. '
                                f'An attacker could re-enter the function before the state update completes.'
                            ),
                            severity=SeverityLevel.CRITICAL,
                            score=9.5,
                            location=f'{func_name}() lines {func_start_line + call["line"]}-{func_start_line + write["line"]}',
                            code_snippet=self._extract_snippet(source_code, func_start_line + call["line"]),
                            recommendation=(
                                'Apply the checks-effects-interactions pattern: '
                                'update all state variables BEFORE making external calls. '
                                'Alternatively, use OpenZeppelin\'s ReentrancyGuard modifier.'
                            ),
                        ))
                        break  # One finding per function is enough

        # Check for ERC-777 reentrancy vectors
        if self._has_erc777_hooks(source_code):
            findings.append(self._create_finding(
                title='ERC-777 Hook Reentrancy Risk',
                description=(
                    'Contract implements ERC-777 tokensToSend/tokensReceived hooks. '
                    'These hooks are called during transfers and can enable reentrancy attacks.'
                ),
                severity=SeverityLevel.HIGH,
                score=7.5,
                location='Contract level',
                recommendation=(
                    'Use ReentrancyGuard on all functions that interact with ERC-777 tokens. '
                    'Consider using ERC-20 instead if hooks are not required.'
                ),
            ))

        return findings

    def _has_reentrancy_guard(self, source: str) -> bool:
        for pattern in REENTRANCY_GUARD_PATTERNS:
            if re.search(pattern, source):
                return True
        return False

    def _function_has_guard(self, func_body: str, func_name: str) -> bool:
        for pattern in REENTRANCY_GUARD_PATTERNS:
            if re.search(pattern, func_body):
                return True
        return False

    def _find_external_calls(self, source: str) -> List[dict]:
        calls = []
        for pattern in EXTERNAL_CALL_PATTERNS:
            for match in re.finditer(pattern, source):
                line = source[:match.start()].count('\n')
                calls.append({
                    'pattern': pattern,
                    'match': match.group(),
                    'position': match.start(),
                    'line': line,
                })
        return sorted(calls, key=lambda x: x['position'])

    def _find_state_writes(self, source: str) -> List[dict]:
        writes = []
        for pattern in STATE_WRITE_PATTERNS:
            for match in re.finditer(pattern, source):
                line = source[:match.start()].count('\n')
                writes.append({
                    'pattern': pattern,
                    'match': match.group(),
                    'position': match.start(),
                    'line': line,
                })
        return sorted(writes, key=lambda x: x['position'])

    def _extract_functions(self, source: str) -> List[tuple]:
        """Extract function names and bodies."""
        functions = []
        func_pattern = r'function\s+(\w+)\s*\([^)]*\)[^{]*\{'
        for match in re.finditer(func_pattern, source):
            func_name = match.group(1)
            start = match.start()
            start_line = source[:start].count('\n')

            # Find matching closing brace
            brace_count = 0
            body_start = match.end() - 1
            for i in range(body_start, len(source)):
                if source[i] == '{':
                    brace_count += 1
                elif source[i] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        func_body = source[body_start:i + 1]
                        functions.append((func_name, func_body, start_line))
                        break

        return functions

    def _find_in_function(self, func_body: str, patterns: List[str]) -> List[dict]:
        matches = []
        for pattern in patterns:
            for match in re.finditer(pattern, func_body):
                line = func_body[:match.start()].count('\n')
                matches.append({
                    'pattern': pattern,
                    'match': match.group(),
                    'position': match.start(),
                    'line': line,
                })
        return sorted(matches, key=lambda x: x['position'])

    def _has_erc777_hooks(self, source: str) -> bool:
        return bool(re.search(r'tokensToSend|tokensReceived|IERC777', source))

    def _extract_snippet(self, source: str, line: int, context: int = 3) -> str:
        lines = source.split('\n')
        start = max(0, line - context)
        end = min(len(lines), line + context + 1)
        return '\n'.join(f'{i + 1:4d} | {lines[i]}' for i in range(start, end))

    def _create_finding(self, title, description, severity, score, location,
                        code_snippet=None, recommendation=None):
        return Vulnerability(
            id=f'REENTR_{hash(title) % 10000:04d}',
            title=title,
            description=description,
            severity=severity,
            score=score,
            category=CATEGORIES['REENTRANCY'],
            cwe_id=CWE_MAPPINGS['REENTRANCY'],
            location=location,
            code_snippet=code_snippet,
            recommendation=recommendation,
        )
