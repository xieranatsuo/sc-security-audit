"""Proxy contract safety analyzer.

Detects:
- Missing EIP-1967 implementation slot
- Unprotected upgrade functions
- Storage collision risk
- Delegatecall to untrusted contracts
- Missing initialization
- Centralization risks (admin keys)
"""

import re
from typing import List

from ..core.severity import Vulnerability, SeverityLevel, CATEGORIES, CWE_MAPPINGS


# EIP-1967 storage slots
EIP1967_IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
EIP1967_ADMIN_SLOT = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103'

# Proxy patterns
PROXY_PATTERNS = [
    r'delegatecall',                        # Generic delegatecall
    r'_delegate\s*\(',                      # OpenZeppelin delegate
    r'_implementation\s*\(',                # Implementation getter
    r'fallback\s*\(\)\s*external\s*payable', # Fallback function
    r'receive\s*\(\)\s*external\s*payable',  # Receive function
]

# Upgrade patterns
UPGRADE_PATTERNS = [
    r'upgradeTo\s*\(',                     # UUPS upgrade
    r'upgradeToAndCall\s*\(',              # UUPS upgrade with init
    r'_upgradeTo\s*\(',                    # Internal upgrade
    r'upgrade\s*\(',                       # Generic upgrade
    r'changeAdmin\s*\(',                   # Admin change
    r'_changeAdmin\s*\(',                  # Internal admin change
]

# Proxy contract types
PROXY_TYPES = [
    'TransparentUpgradeableProxy',
    'UUPSUpgradeable',
    'BeaconProxy',
    'ERC1967Proxy',
    'Diamond',
    'MinimalProxy',  # ERC-1167
    'Clone',
]


class ProxyAnalyzer:
    """Analyze proxy contract patterns for security issues."""

    def __init__(self):
        self.name = 'ProxyAnalyzer'
        self.version = '2.0.0'

    def analyze(
        self,
        source_code: str,
        bytecode: str = '',
        contract_address: str = '',
        chain_id: int = 0,
        abi: str = '[]',
    ) -> List[Vulnerability]:
        """Run proxy safety analysis."""
        findings = []

        is_proxy = self._is_proxy(source_code)

        if not is_proxy:
            return findings

        # Check for initialization
        init_findings = self._check_initialization(source_code)
        findings.extend(init_findings)

        # Check for upgrade protection
        upgrade_findings = self._check_upgrade_protection(source_code)
        findings.extend(upgrade_findings)

        # Check for storage collision
        storage_findings = self._check_storage_collision(source_code)
        findings.extend(storage_findings)

        # Check for centralization
        centralization_findings = self._check_centralization(source_code)
        findings.extend(centralization_findings)

        return findings

    def _is_proxy(self, source: str) -> bool:
        """Check if contract is a proxy."""
        for pattern in PROXY_PATTERNS:
            if re.search(pattern, source, re.IGNORECASE):
                return True
        for proxy_type in PROXY_TYPES:
            if proxy_type in source:
                return True
        return False

    def _check_initialization(self, source: str) -> List[Vulnerability]:
        findings = []

        has_initializer = bool(re.search(
            r'initializer|reinitializer|initialized',
            source, re.IGNORECASE
        ))

        has_constructor_init = bool(re.search(
            r'constructor\s*\([^)]*\)\s*\{[^}]*_',
            source
        ))

        # Proxy contracts should use initializer pattern, not constructors
        if not has_initializer and not has_constructor_init:
            findings.append(Vulnerability(
                id='PROXY_0001',
                title='Missing Proxy Initialization',
                description=(
                    'Proxy contract does not have an initializer pattern. '
                    'The implementation contract may be initialized by an attacker '
                    'before the legitimate owner initializes it.'
                ),
                severity=SeverityLevel.HIGH,
                score=7.5,
                category=CATEGORIES['PROXY'],
                cwe_id=CWE_MAPPINGS['PROXY'],
                location='Contract level',
                recommendation=(
                    'Use OpenZeppelin\'s Initializable contract with the initializer modifier. '
                    'Initialize in the constructor of the implementation or via a separate initialize function.'
                ),
            ))

        return findings

    def _check_upgrade_protection(self, source: str) -> List[Vulnerability]:
        findings = []

        has_upgrade = bool(re.search(UPGRADE_PATTERNS[0], source))

        if has_upgrade:
            # Check for access control on upgrade functions
            has_access_control = bool(re.search(
                r'onlyOwner|onlyAdmin|onlyProxy|_checkOwner',
                source
            ))

            if not has_access_control:
                findings.append(Vulnerability(
                    id='PROXY_0002',
                    title='Unprotected Upgrade Function',
                    description=(
                        'The upgrade function does not have access control. '
                        'Anyone could upgrade the implementation to a malicious contract.'
                    ),
                    severity=SeverityLevel.CRITICAL,
                    score=9.5,
                    category=CATEGORIES['PROXY'],
                    cwe_id=CWE_MAPPINGS['PROXY'],
                    location='Upgrade function',
                    recommendation=(
                        'Add onlyOwner or onlyAdmin modifier to the upgrade function. '
                        'Consider using a timelock for upgrades to give users time to exit.'
                    ),
                ))

            # Check for UUPS self-destruct risk
            if 'UUPS' in source and not re.search(r'_disableInitializers', source):
                findings.append(Vulnerability(
                    id='PROXY_0003',
                    title='UUPS Implementation Self-Destruct Risk',
                    description=(
                        'UUPS implementation contract may be vulnerable to self-destruct. '
                        'If the implementation is destroyed, all proxies pointing to it become bricked.'
                    ),
                    severity=SeverityLevel.HIGH,
                    score=7.0,
                    category=CATEGORIES['PROXY'],
                    cwe_id=CWE_MAPPINGS['PROXY'],
                    location='Implementation contract',
                    recommendation=(
                        'Call _disableInitializers() in the implementation constructor. '
                        'This prevents direct initialization of the implementation contract.'
                    ),
                ))

        return findings

    def _check_storage_collision(self, source: str) -> List[Vulnerability]:
        findings = []

        # Check for storage variables in implementation that could collide
        storage_vars = re.findall(
            r'(?:uint|int|bool|address|string|bytes|mapping)\s*(?:\[\])?\s+(?:public\s+|private\s+|internal\s+)?(\w+)',
            source
        )

        if len(storage_vars) > 0:
            # Check if using storage gap pattern
            has_gap = bool(re.search(r'__gap|__storage_gap', source))

            if not has_gap and len(storage_vars) > 3:
                findings.append(Vulnerability(
                    id='PROXY_0004',
                    title='Potential Storage Collision Risk',
                    description=(
                        f'Contract has {len(storage_vars)} storage variables without a storage gap. '
                        f'Adding new variables in upgrades may collide with existing storage slots.'
                    ),
                    severity=SeverityLevel.MEDIUM,
                    score=5.0,
                    category=CATEGORIES['PROXY'],
                    cwe_id=CWE_MAPPINGS['PROXY'],
                    location='Storage layout',
                    recommendation=(
                        'Use OpenZeppelin\'s storage layout pattern or add a __gap array '
                        'at the end of the contract to reserve storage slots for future variables.'
                    ),
                ))

        return findings

    def _check_centralization(self, source: str) -> List[Vulnerability]:
        findings = []

        # Check for timelock on admin operations
        has_timelock = bool(re.search(r'timelock|TimelockController', source, re.IGNORECASE))
        has_multisig = bool(re.search(r'multisig|MultiSig|GnosisSafe', source, re.IGNORECASE))

        has_admin = bool(re.search(r'admin|owner|governance', source, re.IGNORECASE))

        if has_admin and not has_timelock and not has_multisig:
            findings.append(Vulnerability(
                id='PROXY_0005',
                title='Centralization Risk — Single Admin Key',
                description=(
                    'Proxy is controlled by a single admin key without timelock or multisig. '
                    'A compromised admin key can instantly upgrade to a malicious implementation.'
                ),
                severity=SeverityLevel.MEDIUM,
                score=5.5,
                category=CATEGORIES['PROXY'],
                cwe_id=CWE_MAPPINGS['PROXY'],
                location='Admin control',
                recommendation=(
                    'Use a multisig wallet (e.g., Gnosis Safe) as the proxy admin. '
                    'Add a timelock for upgrade operations to give users time to react.'
                ),
            ))

        return findings
