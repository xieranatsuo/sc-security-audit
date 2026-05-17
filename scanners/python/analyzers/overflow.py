"""Arithmetic overflow/underflow analyzer.

Detects:
- Unchecked arithmetic in Solidity <0.8.0
- Explicit unchecked blocks with overflow risk
- SafeMath bypass patterns
- Cast truncation (uint256 -> uint128, etc.)
- Division before multiplication precision loss

Note: Solidity 0.8+ has built-in overflow checks by default.
"""

import re
from typing import List

from ..core.severity import Vulnerability, SeverityLevel, CATEGORIES, CWE_MAPPINGS


# Patterns indicating unchecked arithmetic
UNCHECKED_PATTERNS = [
    r'unchecked\s*\{',                    # explicit unchecked block
]

# Arithmetic operations that can overflow
ARITHMETIC_OPS = [
    r'(\w+)\s*\+\s*(\w+)',               # addition
    r'(\w+)\s*-\s*(\w+)',                 # subtraction
    r'(\w+)\s*\*\s*(\w+)',               # multiplication
    r'(\w+)\s*<<\s*(\w+)',               # left shift
]

# Safe version patterns (reduces false positives)
SAFE_PATTERNS = [
    r'SafeMath',                           # OpenZeppelin SafeMath
    r'@openzeppelin',                      # OpenZeppelin import
    r'safeAdd|safeSub|safeMul|safeDiv',   # SafeMath methods
    r'PRBMath',                            # PRBMath library
    r'ABDKMath64x64',                      # ABDK fixed-point
]

# Type cast patterns that may truncate
CAST_PATTERNS = [
    r'uint8\s*\(',                         # cast to uint8
    r'uint16\s*\(',                        # cast to uint16
    r'uint32\s*\(',                        # cast to uint32
    r'uint64\s*\(',                        # cast to uint64
    r'uint128\s*\(',                       # cast to uint128
    r'int8\s*\(',                          # cast to int8
    r'int16\s*\(',                         # cast to int16
    r'int32\s*\(',                         # cast to int32
    r'int64\s*\(',                         # cast to int64
]

# Division patterns
DIVISION_PATTERNS = [
    r'(\w+)\s*/\s*(\w+)',                 # division
    r'(\w+)\s*%\s*(\w+)',                 # modulo
]

# Compiler version check
COMPILER_VERSION_PATTERN = r'pragma\s+solidity\s+([^;]+)'


class OverflowAnalyzer:
    """Analyze Solidity source code for arithmetic vulnerabilities."""

    def __init__(self):
        self.name = 'OverflowAnalyzer'
        self.version = '2.0.0'

    def analyze(
        self,
        source_code: str,
        bytecode: str = '',
        contract_address: str = '',
        chain_id: int = 0,
        abi: str = '[]',
    ) -> List[Vulnerability]:
        """Run overflow/underflow analysis on source code."""
        findings = []

        # Check compiler version
        compiler_version = self._get_compiler_version(source_code)
        is_pre_08 = self._is_pre_08(compiler_version)

        # Check for SafeMath usage
        has_safemath = self._has_safe_math(source_code)

        # Analyze unchecked blocks
        unchecked_findings = self._analyze_unchecked_blocks(source_code, is_pre_08)
        findings.extend(unchecked_findings)

        # Analyze type casts
        cast_findings = self._analyze_casts(source_code)
        findings.extend(cast_findings)

        # Analyze division precision
        division_findings = self._analyze_division(source_code)
        findings.extend(division_findings)

        # If pre-0.8 and no SafeMath, flag general risk
        if is_pre_08 and not has_safemath:
            findings.append(Vulnerability(
                id='OVERFLOW_0001',
                title='Compiler Version Without Built-in Overflow Protection',
                description=(
                    f'Contract uses Solidity {compiler_version} which does not have '
                    f'built-in overflow/underflow protection. Without SafeMath, all '
                    f'arithmetic operations can silently overflow.'
                ),
                severity=SeverityLevel.HIGH,
                score=7.0,
                category=CATEGORIES['ARITHMETIC'],
                cwe_id=CWE_MAPPINGS['ARITHMETIC'],
                location='Contract level',
                recommendation=(
                    'Upgrade to Solidity >=0.8.0 for built-in overflow checks, '
                    'or use OpenZeppelin\'s SafeMath library for all arithmetic.'
                ),
            ))

        return findings

    def _get_compiler_version(self, source: str) -> str:
        match = re.search(COMPILER_VERSION_PATTERN, source)
        if match:
            return match.group(1).strip()
        return 'unknown'

    def _is_pre_08(self, version: str) -> bool:
        if version == 'unknown':
            return False
        # Extract major.minor version
        match = re.search(r'(\d+)\.(\d+)', version)
        if match:
            major, minor = int(match.group(1)), int(match.group(2))
            return major == 0 and minor < 8
        return False

    def _has_safe_math(self, source: str) -> bool:
        for pattern in SAFE_PATTERNS:
            if re.search(pattern, source, re.IGNORECASE):
                return True
        return False

    def _analyze_unchecked_blocks(self, source: str, is_pre_08: bool) -> List[Vulnerability]:
        findings = []

        for match in re.finditer(UNCHECKED_PATTERNS[0], source):
            block_start = match.start()
            line = source[:block_start].count('\n') + 1

            # Extract unchecked block content
            brace_count = 0
            block_content = ''
            for i in range(match.end() - 1, len(source)):
                if source[i] == '{':
                    brace_count += 1
                elif source[i] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        block_content = source[match.end():i]
                        break

            # Check for arithmetic in unchecked block
            for op_pattern in ARITHMETIC_OPS:
                if re.search(op_pattern, block_content):
                    findings.append(Vulnerability(
                        id=f'UNCHECKED_{hash(block_content[:50]) % 10000:04d}',
                        title=f'Arithmetic in unchecked block at line {line}',
                        description=(
                            f'Arithmetic operation found in unchecked block starting at line {line}. '
                            f'Overflow/underflow will not revert.'
                        ),
                        severity=SeverityLevel.MEDIUM,
                        score=5.5,
                        category=CATEGORIES['ARITHMETIC'],
                        cwe_id=CWE_MAPPINGS['ARITHMETIC'],
                        location=f'Line {line}',
                        code_snippet=self._extract_snippet(source, line),
                        recommendation=(
                            'Verify that overflow is impossible or acceptable. '
                            'If overflow is a risk, remove the unchecked block or add manual checks.'
                        ),
                    ))
                    break  # One finding per unchecked block

        return findings

    def _analyze_casts(self, source: str) -> List[Vulnerability]:
        findings = []

        for pattern in CAST_PATTERNS:
            for match in re.finditer(pattern, source):
                line = source[:match.start()].count('\n') + 1
                cast_type = match.group().split('(')[0].strip()

                # Find the source expression
                cast_start = match.end()
                paren_depth = 0
                expr = ''
                for i in range(cast_start, len(source)):
                    if source[i] == '(':
                        paren_depth += 1
                    elif source[i] == ')':
                        if paren_depth == 0:
                            break
                        paren_depth -= 1
                    expr += source[i]

                # Check if there's a bounds check before the cast
                if not self._has_bounds_check(source, match.start(), expr.strip()):
                    findings.append(Vulnerability(
                        id=f'CAST_{hash(match.group()) % 10000:04d}',
                        title=f'Unchecked type cast to {cast_type} at line {line}',
                        description=(
                            f'Casting to {cast_type} without bounds checking. '
                            f'Values exceeding {cast_type} range will be silently truncated.'
                        ),
                        severity=SeverityLevel.MEDIUM,
                        score=4.5,
                        category=CATEGORIES['ARITHMETIC'],
                        cwe_id=CWE_MAPPINGS['ARITHMETIC'],
                        location=f'Line {line}',
                        recommendation=f'Add a require() check before casting to ensure the value fits in {cast_type}.',
                    ))

        return findings

    def _analyze_division(self, source: str) -> List[Vulnerability]:
        findings = []
        lines = source.split('\n')

        for i, line in enumerate(lines):
            # Check for division before multiplication pattern
            if re.search(r'/\s.*\*', line) and not re.search(r'//', line):
                if not re.search(r'require|assert|if\s*\(', line):
                    findings.append(Vulnerability(
                        id=f'DIVMUL_{i:04d}',
                        title=f'Division before multiplication at line {i + 1}',
                        description=(
                            'Division before multiplication can cause precision loss. '
                            'Integer division truncates, so the order of operations matters.'
                        ),
                        severity=SeverityLevel.LOW,
                        score=3.0,
                        category=CATEGORIES['ARITHMETIC'],
                        cwe_id=CWE_MAPPINGS['ARITHMETIC'],
                        location=f'Line {i + 1}',
                        code_snippet=self._extract_snippet(source, i),
                        recommendation='Reorder to multiply first, then divide to minimize precision loss.',
                    ))

        return findings

    def _has_bounds_check(self, source: str, position: int, expr: str) -> bool:
        # Look for require/assert within 200 chars before the cast
        context = source[max(0, position - 200):position]
        return bool(re.search(r'require|assert|if\s*\(', context))

    def _extract_snippet(self, source: str, line: int, context: int = 2) -> str:
        lines = source.split('\n')
        start = max(0, line - context - 1)
        end = min(len(lines), line + context)
        return '\n'.join(f'{i + 1:4d} | {lines[i]}' for i in range(start, end))
