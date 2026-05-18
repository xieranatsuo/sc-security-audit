'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

const CHAINS = [
  { value: 'ethereum', label: 'Ethereum', id: 1, color: '#627EEA' },
  { value: 'bsc', label: 'BNB Chain', id: 56, color: '#F0B90B' },
  { value: 'polygon', label: 'Polygon', id: 137, color: '#8247E5' },
  { value: 'arbitrum', label: 'Arbitrum', id: 42161, color: '#28A0F0' },
];

export default function AuditPage() {
  const [tab, setTab] = useState('quick');
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState('ethereum');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: stats } = useSWR('/api/audit/stats', fetcher, { revalidateOnFocus: false });
  const { data: history } = useSWR('/api/audit/history', fetcher, { revalidateOnFocus: false });

  const handleAudit = async (e) => {
    e.preventDefault();
    setError('');
    if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      setError('Enter a valid contract address (0x...)');
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/audit/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, chain }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error.message); }
      else { setResult(data.data); }
    } catch { setError('Connection failed'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security Audit</h1>
          <p className="text-gray-500 text-sm mt-1">Analyze smart contracts for vulnerabilities across 4 chains</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export Report
          </button>
          <button className="btn-primary text-xs flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            New Audit
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard label="Total Audits" value={stats?.totalAudits ?? 0} change="+12%" trend="up" />
        <StatCard label="Findings" value={stats?.totalFindings ?? 0} change="+8%" trend="up" />
        <StatCard label="Critical" value={stats?.bySeverity?.critical ?? 0} change="-3%" trend="down" color="red" />
        <StatCard label="Avg Risk Score" value={stats?.avgRiskScore?.toFixed(1) ?? '0.0'} change="-5%" trend="down" color="green" />
        <StatCard label="Contracts" value={stats?.totalContracts ?? 0} change="+24%" trend="up" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface-1 rounded-lg p-1 w-fit border border-gray-600/10">
        {[
          { id: 'quick', label: 'Quick Audit', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          { id: 'full', label: 'Full Report', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { id: 'batch', label: 'Batch Scan', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
          { id: 'history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              tab === t.id ? 'bg-surface-2 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
            </svg>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'quick' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Audit Form */}
          <div className="col-span-2">
            <div className="card">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Contract Analysis
              </h2>
              <form onSubmit={handleAudit} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Contract Address</label>
                  <div className="relative">
                    <input
                      type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                      placeholder="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
                      className="input w-full font-mono text-sm pr-10"
                    />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Blockchain</label>
                    <select value={chain} onChange={(e) => setChain(e.target.value)} className="input w-full bg-white text-gray-900 text-sm">
                      {CHAINS.map((c) => <option key={c.value} value={c.value}>{c.label} ({c.id})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Analysis Depth</label>
                    <select className="input w-full bg-white text-gray-900 text-sm">
                      <option>Standard Scan</option>
                      <option>Deep Analysis</option>
                      <option>Full Audit (Source + Bytecode)</option>
                    </select>
                  </div>
                </div>
                {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"><p className="text-red-400 text-xs">{error}</p></div>}
                <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    Start Security Audit</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Supported Chains</h3>
              <div className="space-y-2">
                {CHAINS.map((c) => (
                  <div key={c.value} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-sm text-gray-300">{c.label}</span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">Chain {c.id}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Scan Capabilities</h3>
              <div className="space-y-2">
                {['Reentrancy Detection', 'Arithmetic Overflow', 'Flash Loan Attacks', 'Proxy Safety', 'Access Control', 'Gas Optimization', 'ERC Compliance', 'Oracle Manipulation'].map((cap) => (
                  <div key={cap} className="flex items-center gap-2 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {cap}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'full' && <FullReportTab />}
      {tab === 'batch' && <BatchScanTab />}
      {tab === 'history' && <HistoryTab />}

      {/* Results */}
      {result && <AuditResults result={result} />}
    </div>
  );
}

function StatCard({ label, value, change, trend, color }) {
  return (
    <div className="card group hover:border-gray-600/30 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color === 'red' ? 'text-red-400' : color === 'green' ? 'text-emerald-400' : 'text-white'}`}>
            {value}
          </p>
        </div>
        {change && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

function FullReportTab() {
  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-white mb-4">Full Contract Report</h2>
      <p className="text-gray-500 text-sm mb-6">Generate a comprehensive security report including source code analysis, bytecode disassembly, gas optimization recommendations, and compliance checks.</p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div><label className="block text-xs text-gray-400 mb-1.5">Contract Address</label><input type="text" placeholder="0x..." className="input w-full font-mono text-sm" /></div>
        <div><label className="block text-xs text-gray-400 mb-1.5">Chain</label><select className="input w-full bg-white text-gray-900 text-sm"><option>Ethereum</option><option>BNB Chain</option><option>Polygon</option><option>Arbitrum</option></select></div>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {['Source Analysis', 'Bytecode Scan', 'Gas Report', 'Compliance Check'].map((item) => (
          <label key={item} className="flex items-center gap-2 p-3 rounded-lg bg-surface-2 border border-gray-600/20 cursor-pointer hover:border-blue-500/30">
            <input type="checkbox" defaultChecked className="rounded border-gray-600" />
            <span className="text-xs text-gray-300">{item}</span>
          </label>
        ))}
      </div>
      <button className="btn-primary">Generate Full Report</button>
    </div>
  );
}

function BatchScanTab() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Batch Scanner</h2>
          <p className="text-gray-500 text-xs mt-1">Scan multiple contracts simultaneously using Go concurrent scanner</p>
        </div>
        <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-semibold">CONCURRENT</span>
      </div>
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1.5">Contract Addresses (one per line)</label>
        <textarea rows={6} placeholder={"0x...\n0x...\n0x..."} className="input w-full font-mono text-sm resize-none" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div><label className="block text-xs text-gray-400 mb-1.5">Chain</label><select className="input w-full bg-white text-gray-900 text-sm"><option>Ethereum</option><option>BNB Chain</option></select></div>
        <div><label className="block text-xs text-gray-400 mb-1.5">Concurrency</label><input type="number" defaultValue={10} min={1} max={50} className="input w-full text-sm" /></div>
        <div><label className="block text-xs text-gray-400 mb-1.5">Timeout (sec)</label><input type="number" defaultValue={30} className="input w-full text-sm" /></div>
      </div>
      <button className="btn-primary">Start Batch Scan</button>
    </div>
  );
}

function HistoryTab() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Audit History</h2>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Filter by address..." className="input text-xs w-48" />
          <select className="input text-xs bg-white text-gray-900"><option>All Severities</option><option>Critical</option><option>High</option><option>Medium</option></select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-header"><tr>
            <th className="px-4 py-2.5 text-left text-[10px]">Contract</th>
            <th className="px-4 py-2.5 text-left text-[10px]">Chain</th>
            <th className="px-4 py-2.5 text-left text-[10px]">Risk</th>
            <th className="px-4 py-2.5 text-left text-[10px]">Findings</th>
            <th className="px-4 py-2.5 text-left text-[10px]">Date</th>
            <th className="px-4 py-2.5 text-left text-[10px]">Actions</th>
          </tr></thead>
          <tbody>
            <tr className="table-row"><td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">No audit history yet</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditResults({ result }) {
  const sevBadge = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low', informational: 'badge bg-gray-500/15 text-gray-400' };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Contract Info Bar */}
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">{result.contractName}</h3>
            <p className="text-gray-500 text-xs font-mono">{result.contractAddress}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>{result.chainName}</span>
          <span>{result.compilerVersion}</span>
          {result.metadata?.isProxy && <span className="badge-high">Proxy</span>}
          <span className="font-mono text-gray-500">{result.auditId}</span>
        </div>
      </div>

      {/* Risk Score + Severity Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card col-span-1">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Risk Score</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1a1a24" strokeWidth="3" />
                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={result.riskScore?.color || '#6b7280'} strokeWidth="3" strokeDasharray={`${result.riskScore?.score || 0}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{result.riskScore?.score || 0}</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: result.riskScore?.color }}>{result.riskScore?.label}</p>
              <p className="text-gray-500 text-[10px] font-mono mt-1">RiskScore = 100 × Σ(wi·fi)</p>
            </div>
          </div>
        </div>

        <div className="card col-span-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Findings by Severity</h3>
          <div className="grid grid-cols-5 gap-3">
            {['critical', 'high', 'medium', 'low', 'informational'].map((sev) => (
              <div key={sev} className="text-center p-3 rounded-lg bg-surface-2 border border-gray-600/10">
                <p className="text-2xl font-bold text-white">{result.summary?.bySeverity?.[sev] || 0}</p>
                <p className="text-[10px] text-gray-500 mt-1 capitalize">{sev}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Findings List */}
      {result.findings?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Vulnerabilities Detected ({result.findings.length})</h3>
          <div className="space-y-2">
            {result.findings.map((f, i) => (
              <FindingRow key={f.id || i} finding={f} badge={sevBadge} />
            ))}
          </div>
        </div>
      )}

      {result.findings?.length === 0 && (
        <div className="card text-center py-10">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="text-emerald-400 font-semibold">No vulnerabilities detected</p>
          <p className="text-gray-500 text-xs mt-1">Automated scan found no known patterns. Always perform manual review.</p>
        </div>
      )}
    </div>
  );
}

function FindingRow({ finding, badge }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-surface-2 border border-gray-600/10 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-3/50 transition-colors text-left">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className={badge[finding.severity] || 'badge'}>{finding.severity?.toUpperCase()}</span>
          <span className="text-white text-sm font-medium truncate">{finding.title}</span>
          <span className="text-gray-500 text-xs font-mono">{finding.score}/10</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-gray-500 text-[10px]">{finding.category}</span>
          <svg className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-600/10 pt-3 space-y-3 animate-fade-in">
          <p className="text-gray-300 text-sm">{finding.description}</p>
          {finding.recommendation && (
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
              <p className="text-xs text-blue-400 font-semibold mb-1">Recommendation</p>
              <p className="text-gray-300 text-sm">{finding.recommendation}</p>
            </div>
          )}
          {finding.cweId && <p className="text-gray-500 text-xs">CWE: <a href={`https://cwe.mitre.org/data/definitions/${finding.cweId.replace('CWE-','')}.html`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{finding.cweId}</a></p>}
        </div>
      )}
    </div>
  );
}
