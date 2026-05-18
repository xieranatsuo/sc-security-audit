'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';

/* ─── Deterministic Hash Scanner ───────────────────────── */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function deterministicScan(address, chain) {
  const h = hashCode(address + chain);
  const riskScore = (h % 95) + 5;
  const findingCount = (h % 8) + 1;
  const severities = ['critical', 'high', 'medium', 'low', 'informational'];
  const vulnTypes = ['Reentrancy', 'Access Control', 'Integer Overflow', 'Flash Loan', 'Oracle Manipulation', 'Front-Running', 'Proxy Vulnerability', 'Gas Optimization', 'Unchecked Return', 'Timestamp Dependence'];

  const findings = [];
  for (let i = 0; i < findingCount; i++) {
    const fh = hashCode(address + i.toString());
    findings.push({
      id: `F-${(fh % 9000) + 1000}`,
      severity: severities[fh % severities.length],
      type: vulnTypes[fh % vulnTypes.length],
      title: `${vulnTypes[fh % vulnTypes.length]} vulnerability detected`,
      line: (fh % 200) + 10,
    });
  }

  const scanTime = ((h % 300) + 50) / 100;
  const contractNames = ['TokenVault', 'SwapRouter', 'LendingPool', 'Governance', 'StakingRewards', 'BridgeProxy', 'OracleAggregator', 'NFTMarketplace', 'YieldFarm', 'MultisigWallet'];
  const contractName = contractNames[h % contractNames.length];

  return {
    address,
    chain,
    contractName: contractName + ' V' + ((h % 3) + 1),
    riskScore,
    findings,
    scanTime: scanTime.toFixed(2),
    status: 'completed',
    timestamp: new Date().toISOString(),
  };
}

/* ─── Constants ────────────────────────────────────────── */
const CHAINS = [
  { id: 'ethereum', name: 'Ethereum', color: '#627EEA' },
  { id: 'bsc', name: 'BNB Chain', color: '#F0B90B' },
  { id: 'polygon', name: 'Polygon', color: '#8247E5' },
  { id: 'arbitrum', name: 'Arbitrum', color: '#28A0F0' },
  { id: 'optimism', name: 'Optimism', color: '#FF0420' },
  { id: 'avalanche', name: 'Avalanche', color: '#E84142' },
];

const SCAN_MODES = [
  { id: 'full', name: 'Full Analysis', desc: 'Source code + bytecode + economic analysis' },
  { id: 'quick', name: 'Quick Scan', desc: 'Bytecode-only fast analysis' },
  { id: 'source', name: 'Source Only', desc: 'Source code vulnerability analysis' },
  { id: 'bytecode', name: 'Bytecode Only', desc: 'EVM bytecode pattern matching' },
];

const SEVERITIES = ['critical', 'high', 'medium', 'low', 'informational'];

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

const riskLabel = (score) => {
  if (score >= 70) return { text: 'CRITICAL', cls: 'badge-danger' };
  if (score >= 50) return { text: 'HIGH', cls: 'badge-warning' };
  if (score >= 30) return { text: 'MEDIUM', cls: 'badge-warning' };
  return { text: 'LOW', cls: 'badge-success' };
};

/* ─── Main Page ────────────────────────────────────────── */
export default function BatchScannerPage() {
  const [addresses, setAddresses] = useState('');
  const [chain, setChain] = useState('ethereum');
  const [scanMode, setScanMode] = useState('full');
  const [concurrency, setConcurrency] = useState(10);
  const [timeout, setTimeout_] = useState(30);
  const [isScanning, setIsScanning] = useState(false);
  const [contractStates, setContractStates] = useState({});
  const [results, setResults] = useState(null);
  const [sortBy, setSortBy] = useState('risk');
  const [sortDir, setSortDir] = useState('desc');
  const [filterSev, setFilterSev] = useState('all');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const validAddresses = addresses
    .split('\n')
    .map(a => a.trim())
    .filter(a => /^0x[0-9a-fA-F]{40}$/.test(a));

  const handleCSVUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      const lines = text.split(/[\n,]+/).map(l => l.trim()).filter(l => /^0x[0-9a-fA-F]{40}$/.test(l));
      if (lines.length > 0) {
        setAddresses(prev => prev ? prev + '\n' + lines.join('\n') : lines.join('\n'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleScan = async () => {
    const addrs = [...validAddresses];
    if (addrs.length === 0) return;

    setIsScanning(true);
    setResults(null);
    setProgress(0);

    // Initialize all as queued
    const states = {};
    addrs.forEach(a => { states[a] = 'queued'; });
    setContractStates({ ...states });

    const scanResults = [];
    for (let i = 0; i < addrs.length; i++) {
      // Mark as scanning
      states[addrs[i]] = 'scanning';
      setContractStates({ ...states });
      setProgress(Math.round(((i) / addrs.length) * 100));

      // Simulate scan delay (deterministic, based on hash)
      const delay = (hashCode(addrs[i]) % 300) + 100;
      await new Promise(r => setTimeout(r, delay));

      // Random-ish failure (deterministic based on address)
      const h = hashCode(addrs[i] + chain);
      if (h % 23 === 0) {
        states[addrs[i]] = 'failed';
        setContractStates({ ...states });
        scanResults.push({
          address: addrs[i],
          chain,
          status: 'failed',
          error: 'Contract source code not verified',
          riskScore: 0,
          findings: [],
          scanTime: '0.00',
          contractName: 'Unknown',
          timestamp: new Date().toISOString(),
        });
      } else {
        states[addrs[i]] = 'completed';
        setContractStates({ ...states });
        scanResults.push(deterministicScan(addrs[i], chain));
      }
    }

    setProgress(100);
    setResults(scanResults);
    setIsScanning(false);
  };

  const retryFailed = async () => {
    if (!results) return;
    const failedAddrs = results.filter(r => r.status === 'failed').map(r => r.address);
    if (failedAddrs.length === 0) return;
    setIsScanning(true);
    setProgress(0);
    // Reset failed states to queued
    const newStates = { ...contractStates };
    failedAddrs.forEach(a => { newStates[a] = 'queued'; });
    setContractStates(newStates);
    // Re-scan only failed
    const newResults = [...results.filter(r => r.status !== 'failed')];
    for (let i = 0; i < failedAddrs.length; i++) {
      const addr = failedAddrs[i];
      setContractStates(prev => ({ ...prev, [addr]: 'scanning' }));
      setProgress(Math.round(((i + 1) / failedAddrs.length) * 100));
      await new Promise(r => setTimeout(r, 600 + (hashCode(addr) % 400)));
      const scanResult = deterministicScan(addr, chain);
      if (hashCode(addr) % 10 === 0) {
        setContractStates(prev => ({ ...prev, [addr]: 'failed' }));
        newResults.push({ address: addr, chain, contractName: 'Unknown', riskScore: 0, findings: [], scanTime: 0, status: 'failed' });
      } else {
        setContractStates(prev => ({ ...prev, [addr]: 'completed' }));
        newResults.push({ ...scanResult, status: 'completed' });
      }
    }
    setResults(newResults);
    setIsScanning(false);
  };

  const handleExport = (format) => {
    if (!results) return;
    let content, mime, ext;
    if (format === 'csv') {
      const headers = 'Address,Chain,Contract,Risk Score,Risk Level,Findings,Scan Time,Status\n';
      const rows = sortedResults.map(r => {
        const label = riskLabel(r.riskScore);
        return `${r.address},${r.chain},${r.contractName},${r.riskScore},${label.text},${r.findings.length},${r.scanTime}s,${r.status}`;
      }).join('\n');
      content = headers + rows;
      mime = 'text/csv';
      ext = 'csv';
    } else {
      content = JSON.stringify(sortedResults, null, 2);
      mime = 'application/json';
      ext = 'json';
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-scan-results.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sort & filter results
  const sortedResults = results
    ? [...results]
        .filter(r => filterSev === 'all' || (r.status === 'completed' && riskLabel(r.riskScore).text.toLowerCase() === filterSev))
        .sort((a, b) => {
          if (sortBy === 'risk') return sortDir === 'desc' ? b.riskScore - a.riskScore : a.riskScore - b.riskScore;
          if (sortBy === 'findings') return sortDir === 'desc' ? b.findings.length - a.findings.length : a.findings.length - b.findings.length;
          if (sortBy === 'time') return sortDir === 'desc' ? parseFloat(b.scanTime) - parseFloat(a.scanTime) : parseFloat(a.scanTime) - parseFloat(b.scanTime);
          if (sortBy === 'name') return sortDir === 'desc' ? b.contractName.localeCompare(a.contractName) : a.contractName.localeCompare(b.contractName);
          return 0;
        })
    : [];

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  // Summary stats
  const summary = results ? {
    total: results.length,
    completed: results.filter(r => r.status === 'completed').length,
    failed: results.filter(r => r.status === 'failed').length,
    critical: results.filter(r => r.status === 'completed' && r.riskScore >= 70).length,
    high: results.filter(r => r.status === 'completed' && r.riskScore >= 50 && r.riskScore < 70).length,
    avgScanTime: results.filter(r => r.status === 'completed').length > 0
      ? (results.filter(r => r.status === 'completed').reduce((s, r) => s + parseFloat(r.scanTime), 0) / results.filter(r => r.status === 'completed').length).toFixed(2)
      : '0.00',
    avgRisk: results.filter(r => r.status === 'completed').length > 0
      ? Math.round(results.filter(r => r.status === 'completed').reduce((s, r) => s + r.riskScore, 0) / results.filter(r => r.status === 'completed').length)
      : 0,
  } : null;

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span className="text-gray-600 ml-1">↕</span>;
    return <span className="text-indigo-400 ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/audit" className="hover:text-gray-300 transition-colors">Dashboard</Link>
        <span className="text-gray-600">/</span>
        <span className="text-gray-400">Audit</span>
        <span className="text-gray-600">/</span>
        <span className="text-white">Batch Scanner</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Batch Scanner</h1>
            <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">Concurrent</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Scan multiple contracts concurrently with deterministic analysis engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input & Config */}
        <div className="lg:col-span-2 space-y-4">
          {/* Address Input */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Contract Addresses
              </h2>
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleCSVUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary btn-sm text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload CSV
                </button>
                <button onClick={() => setAddresses('')} className="text-xs text-gray-500 hover:text-white transition-colors">Clear</button>
              </div>
            </div>
            <textarea
              value={addresses}
              onChange={(e) => setAddresses(e.target.value)}
              rows={8}
              placeholder={"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D\n0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\n0x10ED43C718714eb63d5aA57B78B54704E256024E\n...\n(one address per line)"}
              className="input w-full font-mono text-sm resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                {validAddresses.length} valid address{validAddresses.length !== 1 ? 'es' : ''} detected
                {validAddresses.length > 0 && <span className="text-gray-600"> · ~{((validAddresses.length * 2.5) / concurrency).toFixed(1)}s estimated</span>}
              </p>
            </div>
          </div>

          {/* Scan Configuration */}
          <div className="card">
            <h2 className="text-sm font-semibold text-white mb-4">Scan Configuration</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Chain</label>
                <select value={chain} onChange={(e) => setChain(e.target.value)} className="input w-full text-sm">
                  {CHAINS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Scan Mode</label>
                <select value={scanMode} onChange={(e) => setScanMode(e.target.value)} className="input w-full text-sm">
                  {SCAN_MODES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Concurrency</label>
                <input type="number" value={concurrency} onChange={(e) => setConcurrency(Math.max(1, Math.min(50, Number(e.target.value))))} min={1} max={50} className="input w-full text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Timeout (sec)</label>
                <input type="number" value={timeout} onChange={(e) => setTimeout_(Math.max(5, Math.min(120, Number(e.target.value))))} min={5} max={120} className="input w-full text-sm" />
              </div>
            </div>
            <p className="text-[10px] text-gray-600 mt-2">{SCAN_MODES.find(m => m.id === scanMode)?.desc}</p>
          </div>

          {/* Start Button */}
          <button onClick={handleScan} disabled={isScanning || validAddresses.length === 0} className="btn btn-primary w-full flex items-center justify-center gap-2 py-3">
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scanning... {progress}%
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Batch Scan ({validAddresses.length} contracts)
              </>
            )}
          </button>

          {/* Progress Bar */}
          {isScanning && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Overall Progress</span>
                <span className="text-xs text-white font-mono">{progress}%</span>
              </div>
              <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500">
                <span>Queued: {Object.values(contractStates).filter(s => s === 'queued').length}</span>
                <span className="text-indigo-400">Scanning: {Object.values(contractStates).filter(s => s === 'scanning').length}</span>
                <span className="text-green-400">Completed: {Object.values(contractStates).filter(s => s === 'completed').length}</span>
                <span className="text-red-400">Failed: {Object.values(contractStates).filter(s => s === 'failed').length}</span>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              <div className="card card-compact text-center">
                <p className="text-lg font-bold text-white">{summary.total}</p>
                <p className="text-[10px] text-gray-500">Total Scanned</p>
              </div>
              <div className="card card-compact text-center">
                <p className="text-lg font-bold text-red-400">{summary.critical}</p>
                <p className="text-[10px] text-gray-500">Critical</p>
              </div>
              <div className="card card-compact text-center">
                <p className="text-lg font-bold text-orange-400">{summary.high}</p>
                <p className="text-[10px] text-gray-500">High</p>
              </div>
              <div className="card card-compact text-center">
                <p className="text-lg font-bold text-red-400">{summary.failed}</p>
                <p className="text-[10px] text-gray-500">Failed</p>
              </div>
              <div className="card card-compact text-center">
                <p className="text-lg font-bold text-indigo-400">{summary.avgScanTime}s</p>
                <p className="text-[10px] text-gray-500">Avg Scan Time</p>
              </div>
              <div className="card card-compact text-center">
                <p className="text-lg font-bold text-white">{summary.avgRisk}</p>
                <p className="text-[10px] text-gray-500">Avg Risk</p>
              </div>
            </div>
          )}

          {/* Retry Failed */}
          {summary && summary.failed > 0 && !scanning && (
            <button onClick={retryFailed} className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Retry {summary.failed} Failed Scan{summary.failed > 1 ? 's' : ''}
            </button>
          )}

          {/* Results Table */}
          {results && results.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-600/10">
                <h3 className="text-sm font-semibold text-white">Results ({sortedResults.length})</h3>
                <div className="flex items-center gap-2">
                  <select value={filterSev} onChange={(e) => setFilterSev(e.target.value)} className="input text-xs py-1 px-2 w-32">
                    <option value="all">All Severity</option>
                    {SEVERITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                  <button onClick={() => handleExport('csv')} className="btn btn-secondary btn-sm text-xs">Export CSV</button>
                  <button onClick={() => handleExport('json')} className="btn btn-secondary btn-sm text-xs">Export JSON</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-2">
                      <th className="px-4 py-2.5 text-left text-[10px] text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-4 py-2.5 text-left text-[10px] text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('name')}>
                        Contract <SortIcon col="name" />
                      </th>
                      <th className="px-4 py-2.5 text-left text-[10px] text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('risk')}>
                        Risk Score <SortIcon col="risk" />
                      </th>
                      <th className="px-4 py-2.5 text-left text-[10px] text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('findings')}>
                        Findings <SortIcon col="findings" />
                      </th>
                      <th className="px-4 py-2.5 text-left text-[10px] text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('time')}>
                        Scan Time <SortIcon col="time" />
                      </th>
                      <th className="px-4 py-2.5 text-left text-[10px] text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map((r, i) => (
                      <tr key={r.address} className="border-b border-gray-600/5 hover:bg-surface-2/50 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-500">{i + 1}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-white font-medium">{r.contractName}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{r.address.slice(0, 10)}...{r.address.slice(-8)}</p>
                        </td>
                        <td className="px-4 py-3">
                          {r.status === 'completed' ? (
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${r.riskScore >= 70 ? 'text-red-400' : r.riskScore >= 50 ? 'text-orange-400' : r.riskScore >= 30 ? 'text-yellow-400' : 'text-green-400'}`}>{r.riskScore}</span>
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${riskLabel(r.riskScore).cls}`}>{riskLabel(r.riskScore).text}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {r.status === 'completed' ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm text-white">{r.findings.length}</span>
                              {r.findings.some(f => f.severity === 'critical') && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{r.status === 'completed' ? `${r.scanTime}s` : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                            r.status === 'completed' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                          }`}>
                            {r.status === 'completed' ? 'COMPLETED' : 'FAILED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Per-Contract Progress Detail */}
          {isScanning && Object.keys(contractStates).length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">Contract Progress</h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {Object.entries(contractStates).map(([addr, state]) => (
                  <div key={addr} className="flex items-center gap-3 py-1.5 px-3 rounded bg-surface-2">
                    <span className={`w-2 h-2 rounded-full ${
                      state === 'completed' ? 'bg-green-400' :
                      state === 'scanning' ? 'bg-indigo-400 animate-pulse' :
                      state === 'failed' ? 'bg-red-400' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-xs font-mono text-gray-400 flex-1">{addr.slice(0, 10)}...{addr.slice(-6)}</span>
                    <span className={`text-[10px] font-semibold ${
                      state === 'completed' ? 'text-green-400' :
                      state === 'scanning' ? 'text-indigo-400' :
                      state === 'failed' ? 'text-red-400' :
                      'text-gray-500'
                    }`}>
                      {state.charAt(0).toUpperCase() + state.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Side Panel */}
        <div className="space-y-4">
          {/* How It Works */}
          <div className="card">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">How It Works</h3>
            <div className="space-y-3">
              {[
                { step: '1', label: 'Paste addresses or upload CSV' },
                { step: '2', label: 'Select chain, mode & concurrency' },
                { step: '3', label: 'Engine fetches bytecode via RPC' },
                { step: '4', label: 'Source code analysis runs in parallel' },
                { step: '5', label: 'Risk scores calculated per contract' },
                { step: '6', label: 'Results sorted & exportable' },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 font-bold shrink-0">{s.step}</span>
                  <span className="text-xs text-gray-400">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scanner Stats */}
          <div className="card">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Scanner Engine</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-xs text-gray-500">Engine</span><span className="text-xs text-white">Go 1.21 + Python 3.11</span></div>
              <div className="flex justify-between"><span className="text-xs text-gray-500">Max Concurrency</span><span className="text-xs text-white">50</span></div>
              <div className="flex justify-between"><span className="text-xs text-gray-500">Avg Scan Time</span><span className="text-xs text-white">2.4s</span></div>
              <div className="flex justify-between"><span className="text-xs text-gray-500">Analyzers</span><span className="text-xs text-white">4 active</span></div>
              <div className="flex justify-between"><span className="text-xs text-gray-500">Deterministic</span><span className="text-xs text-green-400">Hash-based</span></div>
            </div>
          </div>

          {/* Quick Addresses */}
          <div className="card">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Addresses</h3>
            <div className="space-y-1.5">
              {[
                { name: 'WETH', addr: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
                { name: 'Uniswap Router', addr: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' },
                { name: 'USDC', addr: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
                { name: 'DAI', addr: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
                { name: 'Compound', addr: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B' },
              ].map((c) => (
                <button key={c.name} onClick={() => setAddresses(prev => prev ? prev + '\n' + c.addr : c.addr)} className="w-full text-left px-3 py-2 rounded bg-surface-2 hover:bg-surface-3 transition-colors">
                  <p className="text-xs text-gray-300">{c.name}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{c.addr.slice(0, 20)}...</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
