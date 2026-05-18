'use client';

import { useState } from 'react';

const VULN_DB = [
  { id: 'SWC-107', name: 'Reentrancy', severity: 'critical', category: 'Reentrancy', cwe: 'CWE-841', count: 234, description: 'External calls before state updates allow attackers to re-enter functions.', impact: 'Complete drainage of contract funds', recommendation: 'Use checks-effects-interactions pattern or ReentrancyGuard' },
  { id: 'SWC-101', name: 'Integer Overflow/Underflow', severity: 'high', category: 'Arithmetic', cwe: 'CWE-190', count: 156, description: 'Arithmetic operations can wrap around without checks in Solidity <0.8.', impact: 'Token minting, balance manipulation', recommendation: 'Upgrade to Solidity >=0.8 or use SafeMath' },
  { id: 'SWC-105', name: 'Unprotected Ether Withdrawal', severity: 'critical', category: 'Access Control', cwe: 'CWE-284', count: 89, description: 'Functions that transfer ETH lack access control.', impact: 'Complete fund theft', recommendation: 'Add onlyOwner or role-based access control' },
  { id: 'SWC-106', name: 'Unprotected SELFDESTRUCT', severity: 'critical', category: 'Self-Destruct', cwe: 'CWE-672', count: 67, description: 'SELFDESTRUCT callable by anyone, destroying the contract.', impact: 'Permanent contract destruction, fund loss', recommendation: 'Remove SELFDESTRUCT or add strict access control' },
  { id: 'SWC-112', name: 'Delegatecall to Untrusted', severity: 'critical', category: 'Delegatecall', cwe: 'CWE-250', count: 78, description: 'DELEGATECALL to user-controlled address.', impact: 'Full contract takeover', recommendation: 'Validate delegatecall target addresses' },
  { id: 'SWC-110', name: 'Assert Violation', severity: 'medium', category: 'Assertion', cwe: 'CWE-670', count: 134, description: 'Assert consumes all remaining gas on failure.', impact: 'Gas exhaustion, failed transactions', recommendation: 'Use require() instead of assert() for input validation' },
  { id: 'SWC-115', name: 'Authorization through tx.origin', severity: 'high', category: 'Access Control', cwe: 'CWE-477', count: 45, description: 'Using tx.origin for authorization is vulnerable to phishing.', impact: 'Unauthorized function access', recommendation: 'Use msg.sender instead of tx.origin' },
  { id: 'SWC-116', name: 'Block Timestamp Dependency', severity: 'low', category: 'Timestamp', cwe: 'CWE-829', count: 189, description: 'Relying on block.timestamp which miners can manipulate ~15s.', impact: 'Predictable randomness, time-based exploits', recommendation: 'Avoid timestamp for critical logic; use block numbers' },
  { id: 'SWC-120', name: 'Weak Randomness', severity: 'high', category: 'Randomness', cwe: 'CWE-330', count: 56, description: 'Using block variables for randomness is predictable.', impact: 'Predictable outcomes in games, lotteries', recommendation: 'Use Chainlink VRF or commit-reveal scheme' },
  { id: 'SWC-122', name: 'Lack of Proper Signature Verification', severity: 'high', category: 'Signature', cwe: 'CWE-345', count: 34, description: 'Missing or incorrect ECDSA signature verification.', impact: 'Unauthorized actions, replay attacks', recommendation: 'Use OpenZeppelin ECDSA and EIP-712' },
  { id: 'SWC-124', name: 'Write to Arbitrary Storage', severity: 'critical', category: 'Storage', cwe: 'CWE-123', count: 23, description: 'Ability to write to arbitrary storage slots.', impact: 'Complete contract state manipulation', recommendation: 'Validate all storage slot calculations' },
  { id: 'SWC-128', name: 'DoS with Block Gas Limit', severity: 'medium', category: 'DoS', cwe: 'CWE-400', count: 98, description: 'Unbounded loops can exceed block gas limit.', impact: 'Permanent contract bricking', recommendation: 'Implement pagination; limit array sizes' },
  { id: 'SWC-129', name: 'Typographical Error', severity: 'low', category: 'Logic', cwe: 'CWE-480', count: 67, description: 'Using wrong operator (= instead of ==).', impact: 'Unintended state changes', recommendation: 'Static analysis tools and thorough testing' },
  { id: 'SWC-131', name: 'Presence of Unused Variables', severity: 'informational', category: 'Optimization', cwe: 'CWE-1164', count: 245, description: 'Variables declared but never used.', impact: 'Increased gas cost, confusion', recommendation: 'Remove unused variables' },
  { id: 'SWC-133', name: 'Hash Collisions with Multiple Variables', severity: 'medium', category: 'Hashing', cwe: 'CWE-328', count: 12, description: 'abi.encodePacked with multiple dynamic types.', impact: 'Hash collision attacks', recommendation: 'Use abi.encode or include type separators' },
];

export default function VulnerabilitiesPage() {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = VULN_DB.filter((v) => {
    if (severity !== 'all' && v.severity !== severity) return false;
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sevBadge = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low', informational: 'badge bg-gray-500/15 text-gray-400' };
  const sevCount = { critical: 0, high: 0, medium: 0, low: 0, informational: 0 };
  VULN_DB.forEach(v => sevCount[v.severity]++);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Vulnerability Database</h1>
        <p className="text-gray-500 text-sm mt-1">Comprehensive SWC registry with detection patterns and remediation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {['critical', 'high', 'medium', 'low', 'informational'].map((sev) => (
          <button key={sev} onClick={() => setSeverity(severity === sev ? 'all' : sev)} className={`card text-center transition-all ${severity === sev ? 'border-blue-500/40 bg-blue-500/5' : 'hover:border-gray-600/30'}`}>
            <p className="text-2xl font-bold text-white">{sevCount[sev]}</p>
            <p className="text-[10px] text-gray-500 capitalize mt-1">{sev}</p>
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search SWC ID or vulnerability name..." className="input w-full pl-9 text-sm" />
        </div>
        <span className="text-xs text-gray-500">{filtered.length} results</span>
      </div>

      {/* Vulnerability List */}
      <div className="space-y-2">
        {filtered.map((vuln) => (
          <div key={vuln.id} className={`card-hover cursor-pointer ${selected === vuln.id ? 'border-blue-500/30' : ''}`} onClick={() => setSelected(selected === vuln.id ? null : vuln.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-gray-500 w-16">{vuln.id}</span>
                <span className={sevBadge[vuln.severity]}>{vuln.severity}</span>
                <span className="text-white text-sm font-medium">{vuln.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">{vuln.category}</span>
                <span className="text-xs text-gray-500">{vuln.count} occurrences</span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${selected === vuln.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            {selected === vuln.id && (
              <div className="mt-4 pt-4 border-t border-gray-600/10 space-y-3 animate-fade-in">
                <p className="text-gray-300 text-sm">{vuln.description}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-surface-3/50">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Impact</p>
                    <p className="text-sm text-red-400">{vuln.impact}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-3/50">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">CWE</p>
                    <a href={`https://cwe.mitre.org/data/definitions/${vuln.cwe.replace('CWE-','')}.html`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">{vuln.cwe}</a>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-3/50">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Detected</p>
                    <p className="text-sm text-white">{vuln.count} times</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <p className="text-[10px] text-blue-400 font-semibold uppercase mb-1">Remediation</p>
                  <p className="text-sm text-gray-300">{vuln.recommendation}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
