'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ─── Deterministic Demo Data ──────────────────────────── */
const AUDIT_VOLUME = {
  '24h': [
    { label: '00:00', audits: 12, findings: 34 },
    { label: '04:00', audits: 8, findings: 22 },
    { label: '08:00', audits: 24, findings: 61 },
    { label: '12:00', audits: 38, findings: 89 },
    { label: '16:00', audits: 42, findings: 95 },
    { label: '20:00', audits: 28, findings: 67 },
  ],
  '7d': [
    { label: 'Mon', audits: 145, findings: 389 },
    { label: 'Tue', audits: 162, findings: 421 },
    { label: 'Wed', audits: 138, findings: 356 },
    { label: 'Thu', audits: 185, findings: 478 },
    { label: 'Fri', audits: 198, findings: 512 },
    { label: 'Sat', audits: 112, findings: 298 },
    { label: 'Sun', audits: 95, findings: 245 },
  ],
  '30d': [
    { label: 'W1', audits: 892, findings: 2341 },
    { label: 'W2', audits: 945, findings: 2478 },
    { label: 'W3', audits: 1024, findings: 2689 },
    { label: 'W4', audits: 1087, findings: 2834 },
  ],
  '90d': [
    { label: 'Jan', audits: 3245, findings: 8512 },
    { label: 'Feb', audits: 3578, findings: 9234 },
    { label: 'Mar', audits: 3892, findings: 10124 },
  ],
};

const VULN_BY_SEVERITY = {
  '24h': { critical: 23, high: 67, medium: 134, low: 245, informational: 89 },
  '7d': { critical: 89, high: 234, medium: 478, low: 1024, informational: 356 },
  '30d': { critical: 312, high: 845, medium: 1678, low: 3456, informational: 1234 },
  '90d': { critical: 891, high: 2456, medium: 4789, low: 9823, informational: 3567 },
};

const CHAIN_DATA = {
  '24h': [
    { name: 'Ethereum', audits: 42, pct: 38, color: '#627EEA' },
    { name: 'BNB Chain', audits: 28, pct: 25, color: '#F0B90B' },
    { name: 'Polygon', audits: 22, pct: 20, color: '#8247E5' },
    { name: 'Arbitrum', audits: 18, pct: 17, color: '#28A0F0' },
  ],
  '7d': [
    { name: 'Ethereum', audits: 312, pct: 43, color: '#627EEA' },
    { name: 'BNB Chain', audits: 185, pct: 25, color: '#F0B90B' },
    { name: 'Polygon', audits: 142, pct: 19, color: '#8247E5' },
    { name: 'Arbitrum', audits: 95, pct: 13, color: '#28A0F0' },
  ],
  '30d': [
    { name: 'Ethereum', audits: 1247, pct: 42, color: '#627EEA' },
    { name: 'BNB Chain', audits: 738, pct: 25, color: '#F0B90B' },
    { name: 'Polygon', audits: 578, pct: 19, color: '#8247E5' },
    { name: 'Arbitrum', audits: 423, pct: 14, color: '#28A0F0' },
  ],
  '90d': [
    { name: 'Ethereum', audits: 3578, pct: 41, color: '#627EEA' },
    { name: 'BNB Chain', audits: 2156, pct: 25, color: '#F0B90B' },
    { name: 'Polygon', audits: 1678, pct: 19, color: '#8247E5' },
    { name: 'Arbitrum', audits: 1234, pct: 14, color: '#28A0F0' },
  ],
};

const VULN_TYPES = [
  { name: 'Reentrancy', count: 234, sev: 'critical', pct: 95 },
  { name: 'Access Control', count: 189, sev: 'high', pct: 82 },
  { name: 'Integer Overflow', count: 156, sev: 'high', pct: 71 },
  { name: 'Flash Loan Attack', count: 134, sev: 'critical', pct: 88 },
  { name: 'Oracle Manipulation', count: 98, sev: 'high', pct: 65 },
  { name: 'Front-Running', count: 87, sev: 'medium', pct: 52 },
  { name: 'Proxy Vulnerability', count: 76, sev: 'high', pct: 60 },
  { name: 'Gas Optimization', count: 312, sev: 'low', pct: 40 },
  { name: 'Unchecked Return', count: 67, sev: 'medium', pct: 45 },
  { name: 'Timestamp Dependence', count: 45, sev: 'low', pct: 30 },
];

const RISK_TREND = {
  '24h': [
    { label: '00:00', score: 42 },
    { label: '04:00', score: 38 },
    { label: '08:00', score: 45 },
    { label: '12:00', score: 52 },
    { label: '16:00', score: 48 },
    { label: '20:00', score: 41 },
  ],
  '7d': [
    { label: 'Mon', score: 48 },
    { label: 'Tue', score: 52 },
    { label: 'Wed', score: 45 },
    { label: 'Thu', score: 41 },
    { label: 'Fri', score: 38 },
    { label: 'Sat', score: 35 },
    { label: 'Sun', score: 32 },
  ],
  '30d': [
    { label: 'W1', score: 55 },
    { label: 'W2', score: 48 },
    { label: 'W3', score: 42 },
    { label: 'W4', score: 38 },
  ],
  '90d': [
    { label: 'Jan', score: 58 },
    { label: 'Feb', score: 49 },
    { label: 'Mar', score: 41 },
  ],
};

const KPI_DATA = {
  '24h': { audits: '152', vulns: '458', critical: '23', scanTime: '2.1s', changes: ['+12.4%', '+8.7%', '-15.2%', '-4.3%'] },
  '7d': { audits: '935', vulns: '2,181', critical: '89', scanTime: '2.4s', changes: ['+18.2%', '+12.4%', '-23.1%', '-8.7%'] },
  '30d': { audits: '4,012', vulns: '7,525', critical: '312', scanTime: '2.3s', changes: ['+24.6%', '+15.8%', '-18.4%', '-12.1%'] },
  '90d': { audits: '11,046', vulns: '21,526', critical: '891', scanTime: '2.5s', changes: ['+31.2%', '+22.4%', '-28.7%', '-15.6%'] },
};

/* ─── Helpers ──────────────────────────────────────────── */
const sevColor = (sev) => {
  const map = { critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-green-400', informational: 'text-indigo-400' };
  return map[sev] || 'text-gray-400';
};
const sevBg = (sev) => {
  const map = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-green-500', informational: 'bg-indigo-500' };
  return map[sev] || 'bg-gray-500';
};
const sevBadge = (sev) => {
  const map = {
    critical: 'bg-red-500/15 text-red-400',
    high: 'bg-orange-500/15 text-orange-400',
    medium: 'bg-yellow-500/15 text-yellow-400',
    low: 'bg-green-500/15 text-green-400',
    informational: 'bg-indigo-500/15 text-indigo-400',
  };
  return map[sev] || 'bg-gray-500/15 text-gray-400';
};

/* ─── Main Page ────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d');

  const kpi = KPI_DATA[period];
  const auditData = AUDIT_VOLUME[period];
  const vulnSev = VULN_BY_SEVERITY[period];
  const chainData = CHAIN_DATA[period];
  const riskTrend = RISK_TREND[period];

  const maxAudits = Math.max(...auditData.map(d => d.audits));
  const maxFindings = Math.max(...auditData.map(d => d.findings));
  const maxVuln = Math.max(...Object.values(vulnSev));
  const maxRisk = Math.max(...riskTrend.map(d => d.score));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/audit" className="hover:text-gray-300 transition-colors">Dashboard</Link>
        <span className="text-gray-600">/</span>
        <span className="text-gray-400">Intelligence</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Analytics</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Analytics Dashboard</h1>
            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">Demo Analytics</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Security trends, chain comparisons, and audit metrics</p>
        </div>
        <div className="flex items-center gap-1 bg-surface-1 rounded-lg p-1 border border-gray-600/10">
          {['24h', '7d', '30d', '90d'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p ? 'bg-surface-2 text-white' : 'text-gray-500 hover:text-gray-300'}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Audits Completed" value={kpi.audits} change={kpi.changes[0]} trend="up" />
        <KPICard label="Vulnerabilities Found" value={kpi.vulns} change={kpi.changes[1]} trend="up" />
        <KPICard label="Critical Issues" value={kpi.critical} change={kpi.changes[2]} trend="down" />
        <KPICard label="Avg Scan Time" value={kpi.scanTime} change={kpi.changes[3]} trend="down" />
      </div>

      {/* Audits Over Time + Chain Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Audit Volume Trend */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Audits Over Time</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Audits</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Findings</span>
            </div>
          </div>
          <div className="h-52 flex items-end gap-2 px-2">
            {auditData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end" style={{ height: '180px' }}>
                  <div className="flex-1 bg-indigo-500/20 rounded-t relative overflow-hidden" style={{ height: `${(d.audits / maxAudits) * 100}%` }}>
                    <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t" style={{ height: '100%' }} />
                  </div>
                  <div className="flex-1 bg-emerald-500/20 rounded-t relative overflow-hidden" style={{ height: `${(d.findings / maxFindings) * 100}%` }}>
                    <div className="absolute bottom-0 w-full bg-emerald-500/60 rounded-t" style={{ height: '100%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2 mt-2 text-[10px] text-gray-500">
            {auditData.map((d, i) => <span key={i}>{d.label}</span>)}
          </div>
        </div>

        {/* Chain Comparison */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Chain Comparison</h3>
          <div className="space-y-4">
            {chainData.map((chain) => (
              <div key={chain.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-300">{chain.name}</span>
                  <span className="text-xs text-gray-500">{chain.audits} ({chain.pct}%)</span>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${chain.pct}%`, backgroundColor: chain.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-600/10">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Total Audits</p>
            <p className="text-2xl font-bold text-white">{chainData.reduce((s, c) => s + c.audits, 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Vulnerabilities by Severity + Risk Score Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vulnerabilities by Severity */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Vulnerabilities by Severity</h3>
          <div className="space-y-3">
            {Object.entries(vulnSev).map(([sev, count]) => (
              <div key={sev}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${sevBg(sev)}`} />
                    <span className="text-sm text-gray-300 capitalize">{sev}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{count.toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-surface-3 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${sevBg(sev)}`} style={{ width: `${(count / maxVuln) * 100}%`, opacity: 0.8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Risk Score Trend */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Average Risk Score Trend</h3>
          <div className="h-48 flex items-end gap-3 px-2">
            {riskTrend.map((d, i) => {
              const color = d.score >= 60 ? 'bg-red-500' : d.score >= 40 ? 'bg-yellow-500' : 'bg-green-500';
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className={`text-[10px] font-semibold ${d.score >= 60 ? 'text-red-400' : d.score >= 40 ? 'text-yellow-400' : 'text-green-400'}`}>{d.score}</span>
                  <div className={`w-full rounded-t transition-all duration-500 ${color}`} style={{ height: `${(d.score / 100) * 160}px`, opacity: 0.7 }} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between px-2 mt-2 text-[10px] text-gray-500">
            {riskTrend.map((d, i) => <span key={i}>{d.label}</span>)}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Low (&lt;40)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Medium (40-60)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> High (&gt;60)</span>
          </div>
        </div>
      </div>

      {/* Most Common Vulnerability Types */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Most Common Vulnerability Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {VULN_TYPES.map((v) => (
            <div key={v.name} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 border border-gray-600/10 hover:border-gray-600/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-300 font-medium">{v.name}</span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${sevBadge(v.sev)}`}>{v.sev}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${v.pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 font-mono w-10 text-right">{v.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── KPI Card Component ──────────────────────────────── */
function KPICard({ label, value, change, trend }) {
  return (
    <div className="card group hover:border-gray-600/30 transition-colors">
      <p className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className="text-2xl font-bold text-white">{value}</p>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{change}</span>
      </div>
    </div>
  );
}
