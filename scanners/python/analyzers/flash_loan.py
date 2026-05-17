"""Flash loan vulnerability analyzer.

Detects:
- Missing flash loan callback validation
- Price manipulation via flash loans
- Governance attack vectors
- Liquidity pool manipulation
- Unvalidated IFlashLoanReceiver
"""

import re
from typing import List

from ..core.severity import Vulnerability, SeverityLevel, CATEGORIES, CWE_MAPPINGS


# Flash loan callback patterns
FLASH_LOAN_CALLBACK_PATTERNS = [
    r'executeOperation',           # Aave V3
    r'onFlashLoan',                # ERC-3156
    r'flashLoanCall',              # Custom
    r'UNISWAPV2_CALL_SWAP',        # Uniswap flash swap callback
    r'uniswapV2Call',              # Uniswap V2
    r'pancakeCall',                # PancakeSwap
]

# Flash loan initiation patterns
FLASH_LOAN_INIT_PATTERNS = [
    r'flashLoan\s*\(',             # Aave
    r'flashLoanSimple\s*\(',       # Aave V3
    r'flash\s*\(',                 # dYdX
    r'flashSwap\s*\(',             # Uniswap V2
    r'borrow\s*\(.*true\)',        # Compound with flash repay
]

# Price oracle patterns (manipulable via flash loans)
ORACLE_PATTERNS = [
    r'getReserves\s*\(\)',         # Uniswap reserves
    r'getAmountOut\s*\(',          # Uniswap amount calculation
    r'getAmountsOut\s*\(',         # Multi-hop
    r'quote\s*\(',                 # Router quote
    r'consult\s*\(',               # Uniswap oracle
    r'toUint\s*\(.*get.*amount',   # Amount conversion
]


class FlashLoanAnalyzer:
    """Analyze Solidity source code for flash loan vulnerabilities."""

    def __init__(self):
        self.name = 'FlashLoanAnalyzer'
        self.version = '2.0.0'

    def analyze(
        self,
        source_code: str,
        bytecode: str = '',
        contract_address: str = '',
        chain_id: int = 0,
        abi: str = '[]',
    ) -> List[Vulnerability]:
        """Run flash loan vulnerability analysis."""
        findings = []

        # Check for flash loan usage
        uses_flash_loan = self._uses_flash_loan(source_code)
        has_callback = self._has_flash_loan_callback(source_code)

        if uses_flash_loan:
            # Check callback validation
            if has_callback:
                callback_findings = self._analyze_callback(source_code)
                findings.extend(callback_findings)

            # Check for oracle manipulation risk
            oracle_findings = self._analyze_oracle_manipulation(source_code)
            findings.extend(oracle_findings)

            # Check for governance attack vectors
            governance_findings = self._analyze_governance(source_code)
            findings.extend(governance_findings)

        return findings

    def _uses_flash_loan(self, source: str) -> bool:
        for pattern in FLASH_LOAN_INIT_PATTERNS:
            if re.search(pattern, source):
                return True
        return False

    def _has_flash_loan_callback(self, source: str) -> bool:
        for pattern in FLASH_LOAN_CALLBACK_PATTERNS:
            if re.search(pattern, source):
                return True
        return False

    def _analyze_callback(self, source: str) -> List[Vulnerability]:
        findings = []

        # Check if callback validates the caller
        caller_validation_patterns = [
            r'require\s*\(\s*msg\.sender\s*==',
            r'require\s*\(\s*[_a-zA-Z].*==\s*msg\.sender',
            r'onlyPool',
            r'onlyLendingPool',
            r'onlyController',
        ]

        has_caller_check = False
        for pattern in caller_validation_patterns:
            if re.search(pattern, source):
                has_caller_check = True
                break

        if not has_caller_check:
            findings.append(Vulnerability(
                id='FLASH_0001',
                title='Missing Flash Loan Callback Caller Validation',
                description=(
                    'The flash loan callback function does not validate msg.sender. '
                    'Anyone could call the callback directly with crafted parameters, '
                    'bypassing the flash loan mechanism and potentially draining funds.'
                ),
                severity=SeverityLevel.CRITICAL,
                score=9.0,
                category=CATEGORIES['FLASH_LOAN'],
                cwe_id=CWE_MAPPINGS['FLASH_LOAN'],
                location='Flash loan callback function',
                recommendation=(
                    'Add require(msg.sender == LENDING_POOL) in the callback. '
                    'For ERC-3156, validate msg.sender is the expected lending pool.'
                ),
            ))

        return findings

    def _analyze_oracle_manipulation(self, source: str) -> List[Vulnerability]:
        findings = []

        # Check if price is derived from spot reserves
        for pattern in ORACLE_PATTERNS:
            if re.search(pattern, source):
                findings.append(Vulnerability(
                    id='FLASH_0002',
                    title='Flash Loan Oracle Manipulation Risk',
                    description=(
                        'Contract uses spot price from DEX reserves which can be '
                        'manipulated via flash loans. An attacker can borrow a large '
                        'amount, skew the reserves, and exploit the price-dependent logic.'
                    ),
                    severity=SeverityLevel.HIGH,
                    score=8.0,
                    category=CATEGORIES['FLASH_LOAN'],
                    cwe_id=CWE_MAPPINGS['ORACLE_MANIPULATION'],
                    location='Oracle/price calculation',
                    recommendation=(
                        'Use a TWAP (Time-Weighted Average Price) oracle like Chainlink '
                        'instead of spot reserves. If DEX prices must be used, add a '
                        'significant deviation check (>2-5%).'
                    ),
                ))
                break  # One finding is enough

        return findings

    def _analyze_governance(self, source: str) -> List[Vulnerability]:
        findings = []

        governance_patterns = [
            r'propose\s*\(',              # Governance proposal
            r'castVote\s*\(',             # Voting
            r'execute\s*\(.*proposal',    # Execution
            r'votingPower\s*\(',          # Voting power
        ]

        has_governance = False
        for pattern in governance_patterns:
            if re.search(pattern, source, re.IGNORECASE):
                has_governance = True
                break

        if has_governance:
            findings.append(Vulnerability(
                id='FLASH_0003',
                title='Flash Loan Governance Attack Vector',
                description=(
                    'Contract has governance functions that could be exploited via flash loans. '
                    'An attacker could borrow governance tokens, vote on a malicious proposal, '
                    'and return the tokens in the same transaction.'
                ),
                severity=SeverityLevel.HIGH,
                score=7.5,
                category=CATEGORIES['FLASH_LOAN'],
                cwe_id=CWE_MAPPINGS['FLASH_LOAN'],
                location='Governance functions',
                recommendation=(
                    'Implement a time-lock for governance actions. '
                    'Use snapshot-based voting (balance at block N-1) instead of current balance. '
                    'Consider using a governance token with transfer restrictions during voting.'
                ),
            ))

        return findings
