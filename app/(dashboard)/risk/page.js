'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ─── Risk Data ────────────────────────────────────────── */
const RISK_SECTIONS = [
  {
    id: 'code',
    name: 'Code Risk',
    score: 38,
    weight: 0.30,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    explanation: 'Evaluates the quality and security of the smart contract source code, including reentrancy guards, integer overflow protection, access control patterns, and adherence to security best practices.',
    factors: [
      { name: 'Reentrancy Protection', score: 85, status: 'pass' },
      { name: 'Integer Overflow Guards', score: 92, status: 'pass' },
      { name: 'Access Control', score: 45, status: 'warning' },
      { name: 'Input Validation', score: 62, status: 'warning' },
      { name: 'Gas Optimization', score: 78, status: 'pass' },
    ],
    limitations: [
      'Static analysis may miss complex multi-contract interactions',
      'Dynamic analysis coverage depends on test suite quality',
      'Assembly blocks require manual review',
    ],
  },
  {
    id: 'admin',
    name: 'Admin Risk',
    score: 62,
    weight: 0.20,
    color: 'bg-orange-500',
    textColor: 'text-orange-400',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    explanation: 'Measures centralization risk from admin keys, multisig configurations, timelock durations, and owner privileges. High admin risk indicates potential for rug pulls or unauthorized changes.',
    factors: [
      { name: 'Multisig Configuration', score: 40, status: 'fail' },
      { name: 'Timelock Duration', score: 55, status: 'warning' },
      { name: 'Owner Privileges', score: 35, status: 'fail' },
      { name: 'Admin Key Rotation', score: 72, status: 'pass' },
      { name: 'Emergency Powers', score: 48, status: 'warning' },
    ],
    limitations: [
      'Off-chain multisig signers cannot be verified on-chain',
      'Social engineering attacks on admins are not detectable',
      'Timelock can be bypassed in emergency mode',
    ],
  },
  {
    id: 'upgradeability',
    name: 'Upgradeability Risk',
    score: 45,
    weight: 0.15,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    explanation: 'Assesses risks from proxy patterns, implementation upgrades, storage layout compatibility, and initialization vulnerabilities. Upgradeable contracts carry inherent trust assumptions.',
    factors: [
      { name: 'Proxy Pattern Safety', score: 72, status: 'pass' },
      { name: 'Storage Layout', score: 85, status: 'pass' },
      { name: 'Initializer Guards', score: 30, status: 'fail' },
      { name: 'Implementation Verification', score: 55, status: 'warning' },
      { name: 'Upgrade Governance', score: 42, status: 'warning' },
    ],
    limitations: [
      'Cannot detect storage collisions across complex inheritance',
      'Delegatecall behavior in edge cases may differ',
      'Upgrade proposals may not be publicly visible',
    ],
  },
  {
    id: 'external',
    name: 'External Dependency Risk',
    score: 55,
    weight: 0.15,
    color: 'bg-orange-500',
    textColor: 'text-orange-400',
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    explanation: 'Evaluates risks from external contract dependencies, oracle reliability, price feed manipulation vectors, and third-party library versions.',
    factors: [
      { name: 'Oracle Dependencies', score: 38, status: 'fail' },
      { name: 'Library Versions', score: 82, status: 'pass' },
      { name: 'External Call Safety', score: 55, status: 'warning' },
      { name: 'Price Feed Sources', score: 42, status: 'warning' },
      { name: 'Cross-Chain Bridges', score: 65, status: 'warning' },
    ],
    limitations: [
      'Oracle manipulation through flash loans requires scenario simulation',
      'Off-chain dependency health is not continuously monitored',
      'New dependency vulnerabilities may emerge post-audit',
    ],
  },
  {
    id: 'economic',
    name: 'Economic Risk',
    score: 48,
    weight: 0.10,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    explanation: 'Analyzes tokenomics, liquidity depth, slippage tolerance, MEV vulnerability, and economic attack vectors such as sandwich attacks and flash loan exploits.',
    factors: [
      { name: 'MEV Protection', score: 35, status: 'fail' },
      { name: 'Slippage Controls', score: 62, status: 'warning' },
      { name: 'Liquidity Depth', score: 75, status: 'pass' },
      { name: 'Flash Loan Resistance', score: 28, status: 'fail' },
      { name: 'Sandwich Attack Protection', score: 42, status: 'warning' },
    ],
    limitations: [
      'MEV analysis depends on mempool data availability',
      'Economic attack simulations use simplified models',
      'Cross-protocol economic interactions are complex to model',
    ],
  },
  {
    id: 'operational',
    name: 'Operational Risk',
    score: 32,
    weight: 0.10,
    color: 'bg-green-500',
    textColor: 'text-green-400',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    explanation: 'Evaluates monitoring capabilities, incident response readiness, circuit breaker mechanisms, and operational procedures for emergency situations.',
    factors: [
      { name: 'Monitoring Coverage', score: 78, status: 'pass' },
      { name: 'Circuit Breakers', score: 82, status: 'pass' },
      { name: 'Incident Response', score: 65, status: 'warning' },
      { name: 'Pause Mechanisms', score: 90, status: 'pass' },
      { name: 'Recovery Procedures', score: 55, status: 'warning' },
    ],
    limitations: [
      'Monitoring effectiveness depends on alerting configuration',
      'Response time metrics are based on historical averages',
      'Circuit breaker thresholds may need tuning per protocol',
    ],
  },
];

const WEIGHTS = RISK_SECTIONS.map(s => ({ name: s.name, weight: s.weight }));

const OVERALL_SCORE = Math.round(RISK_SECTIONS.reduce((sum, s) => sum + s.score * s.weight, 0));

/* ─── Helpers ──────────────────────────────────────────── */
const scoreColor = (score) => {
  if (score >= 70) return 'text-red-400';
  if (score >= 50) return 'text-orange-400';
  if (score >= 30) return 'text-yellow-400';
  return 'text-green-400';
};

const scoreBg = (score) => {
  if (score >= 70) return 'bg-red-500';
  if (score >= 50) return 'bg-orange-500';
  if (score >= 30) return 'bg-yellow-500';
  return 'bg-green-500';
};

const scoreLabel = (score) => {
  if (score >= 70) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
};

const statusIcon = (status) => {
  if (status === 'pass') return <span className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center"><span className="text-green-400 text-[10px]">✓</span></span>;
  if (status === 'warning') return <span className="w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center"><span className="text-yellow-400 text-[10px]">!</span></span>;
  return <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center"><span className="text-red-400 text-[10px]">✗</span></span>;
};

/* ─── Main Page ────────────────────────────────────────── */
export default function RiskAnalysisPage() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/audit" className="hover:text-gray-300 transition-colors">Dashboard</Link>
        <span className="text-gray-600">/</span>
        <span className="text-gray-400">Intelligence</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Risk Analysis</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Risk Analysis</h1>
        <p className="text-gray-500 text-sm mt-1">Comprehensive multi-dimensional risk scoring for smart contracts</p>
      </div>

      {/* Overall Score + Formula */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overall Risk Score */}
        <div className="card">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Overall Risk Score</p>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={OVERALL_SCORE >= 60 ? '#f87171' : OVERALL_SCORE >= 40 ? '#fbbf24' : '#34d399'} strokeWidth="3" strokeDasharray={`${OVERALL_SCORE}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${scoreColor(OVERALL_SCORE)}`}>{OVERALL_SCORE}</span>
              </div>
            </div>
            <div>
              <span className={`badge ${OVERALL_SCORE >= 60 ? 'badge-danger' : OVERALL_SCORE >= 40 ? 'badge-warning' : 'badge-success'}`}>{scoreLabel(OVERALL_SCORE)}</span>
              <p className="text-xs text-gray-500 mt-2">Weighted composite score</p>
              <p className="text-[10px] text-gray-600 mt-1">Based on {RISK_SECTIONS.length} risk dimensions</p>
            </div>
          </div>
        </div>

        {/* Formula */}
        <div className="card lg:col-span-2">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-3">Risk Scoring Formula</p>
          <div className="bg-surface-2 rounded-lg p-4 border border-gray-600/10 mb-4">
            <p className="font-mono text-sm text-indigo-400">
              RiskScore = 100 × (w₁·S + w₂·E + w₃·A + w₄·I + w₅·D)
            </p>
            <div className="mt-2 text-[10px] text-gray-500 space-y-0.5">
              <p>S = Severity weighted findings • E = Economic impact • A = Admin centralization</p>
              <p>I = Infrastructure risk • D = Dependency exposure</p>
            </div>
          </div>
          {/* Weight Visualization */}
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Weight Distribution</p>
          <div className="h-3 bg-surface-3 rounded-full overflow-hidden flex">
            {WEIGHTS.map((w, i) => {
              const colors = ['bg-indigo-500', 'bg-orange-500', 'bg-yellow-500', 'bg-purple-500', 'bg-emerald-500', 'bg-pink-500'];
              return <div key={i} className={`${colors[i]} transition-all`} style={{ width: `${w.weight * 100}%` }} title={`${w.name}: ${(w.weight * 100).toFixed(0)}%`} />;
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {WEIGHTS.map((w, i) => {
              const colors = ['bg-indigo-500', 'bg-orange-500', 'bg-yellow-500', 'bg-purple-500', 'bg-emerald-500', 'bg-pink-500'];
              return (
                <span key={i} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${colors[i]}`} />
                  {w.name} ({(w.weight * 100).toFixed(0)}%)
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Risk Breakdown Sections */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Risk Breakdown</h2>
        {RISK_SECTIONS.map((section) => (
          <div key={section.id} className="card">
            <button
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              className="w-full text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${section.score >= 50 ? 'bg-orange-500/10' : 'bg-green-500/10'} flex items-center justify-center shrink-0`}>
                  <svg className={`w-5 h-5 ${section.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={section.icon} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white">{section.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-500">Weight: {(section.weight * 100).toFixed(0)}%</span>
                      <span className={`text-lg font-bold ${scoreColor(section.score)}`}>{section.score}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${scoreBg(section.score)}`} style={{ width: `${section.score}%`, opacity: 0.7 }} />
                  </div>
                </div>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {expandedSection === section.id && (
              <div className="mt-4 pt-4 border-t border-gray-600/10 space-y-4">
                {/* Explanation */}
                <p className="text-sm text-gray-400 leading-relaxed">{section.explanation}</p>

                {/* Factor Breakdown */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Factor Analysis</p>
                  <div className="space-y-2">
                    {section.factors.map((f) => (
                      <div key={f.name} className="flex items-center gap-3">
                        {statusIcon(f.status)}
                        <span className="text-sm text-gray-300 flex-1">{f.name}</span>
                        <div className="w-32 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${f.score >= 70 ? 'bg-green-500' : f.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${f.score}%` }} />
                        </div>
                        <span className={`text-xs font-mono w-8 text-right ${f.score >= 70 ? 'text-green-400' : f.score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{f.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Known Limitations */}
                <div className="bg-surface-2 rounded-lg p-4 border border-gray-600/10">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Known Limitations</p>
                  <ul className="space-y-1.5">
                    {section.limitations.map((lim, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                        <span className="text-gray-600 mt-0.5">•</span>
                        {lim}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Known Limitations (Global) */}
      <div className="card border-amber-500/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Global Known Limitations</h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex items-start gap-2"><span className="text-gray-600">•</span>Risk scores are point-in-time assessments and do not account for future protocol changes</li>
              <li className="flex items-start gap-2"><span className="text-gray-600">•</span>Cross-contract and cross-protocol interactions may introduce risks not captured in single-contract analysis</li>
              <li className="flex items-start gap-2"><span className="text-gray-600">•</span>Economic attack vectors depend on market conditions that fluctuate continuously</li>
              <li className="flex items-start gap-2"><span className="text-gray-600">•</span>Off-chain components (keepers, oracles, frontends) are outside the scope of on-chain analysis</li>
              <li className="flex items-start gap-2"><span className="text-gray-600">•</span>Weight calibration is based on historical exploit data and may not reflect emerging attack patterns</li>
              <li className="flex items-start gap-2"><span className="text-gray-600">•</span>False positive and false negative rates vary by contract complexity and language version</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
