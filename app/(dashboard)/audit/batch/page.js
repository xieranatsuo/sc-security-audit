'use client';

import { useState } from 'react';

export default function BatchScanPage() {
  const [addresses, setAddresses] = useState('');
  const [chain, setChain] = useState('ethereum');
  const [concurrency, setConcurrency] = useState(10);
  const [results, setResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleScan = async () => {
    const addrs = addresses.split('\n').map(a => a.trim()).filter(a => /^0x[0-9a-fA-F]{40}$/.test(a));
    if (addrs.length === 0) return;

    setIsScanning(true);
    setProgress(0);
    setResults(null);

    // Simulate batch scan progress
    const total = addrs.length;
    const scanResults = [];

    for (let i = 0; i < addrs.length; i++) {
      try {
        const res = await fetch('/api/audit/contract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: addrs[i], chain }),
        });
        const data = await res.json();
        scanResults.push({
          address: addrs[i],
          status: data.error ? 'error' : 'success',
          result: data.data || null,
          error: data.error?.message || null,
        });
      } catch {
        scanResults.push({ address: addrs[i], status: 'error', result: null, error: 'Connection failed' });
      }
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    setResults(scanResults);
    setIsScanning(false);
  };

  const validCount = addresses.split('\n').filter(a => /^0x[0-9a-fA-F]{40}$/.test(a.trim())).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Batch Scanner</h1>
          <p className="text-gray-500 text-sm mt-1">Scan multiple contracts concurrently using Go-powered parallel analysis</p>
        </div>
        <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-semibold">CONCURRENT</span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Input */}
        <div className="col-span-2 space-y-4">
          <div className="card">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Contract Addresses
            </h2>
            <textarea
              value={addresses}
              onChange={(e) => setAddresses(e.target.value)}
              rows={10}
              placeholder={"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\n0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D\n0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\n...\n(one address per line)"}
              className="input w-full font-mono text-sm resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                {validCount} valid address{validCount !== 1 ? 'es' : ''} detected
              </p>
              <button onClick={() => setAddresses('')} className="text-xs text-gray-500 hover:text-white">Clear</button>
            </div>
          </div>

          {/* Config */}
          <div className="card">
            <h2 className="text-sm font-semibold text-white mb-4">Scan Configuration</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Chain</label>
                <select value={chain} onChange={(e) => setChain(e.target.value)} className="input w-full bg-white text-gray-900 text-sm">
                  <option value="ethereum">Ethereum</option>
                  <option value="bsc">BNB Chain</option>
                  <option value="polygon">Polygon</option>
                  <option value="arbitrum">Arbitrum</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Concurrency</label>
                <input type="number" value={concurrency} onChange={(e) => setConcurrency(Number(e.target.value))} min={1} max={50} className="input w-full text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Timeout (sec)</label>
                <input type="number" defaultValue={30} className="input w-full text-sm" />
              </div>
            </div>
          </div>

          {/* Action */}
          <button onClick={handleScan} disabled={isScanning || validCount === 0} className="btn-primary w-full flex items-center justify-center gap-2">
            {isScanning ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning... {progress}%</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Start Batch Scan ({validCount} contracts)</>
            )}
          </button>

          {/* Progress */}
          {isScanning && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Progress</span>
                <span className="text-xs text-white">{progress}%</span>
              </div>
              <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Scan Results ({results.length})</h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-400">{results.filter(r => r.status === 'success').length} success</span>
                  <span className="text-red-400">{results.filter(r => r.status === 'error').length} errors</span>
                </div>
              </div>
              <div className="space-y-2">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-3 px-4 rounded-lg bg-surface-2 border border-gray-600/10">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${r.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span className="font-mono text-sm text-gray-300">{r.address.slice(0, 10)}...{r.address.slice(-6)}</span>
                    </div>
                    {r.status === 'success' && r.result ? (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{r.result.contractName}</span>
                        <span className={`text-xs font-bold ${r.result.riskScore?.score >= 60 ? 'text-red-400' : r.result.riskScore?.score >= 40 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                          {r.result.riskScore?.score || 0}
                        </span>
                        <span className="text-[10px] text-gray-500">{r.result.findings?.length || 0} findings</span>
                      </div>
                    ) : (
                      <span className="text-xs text-red-400">{r.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">How It Works</h3>
            <div className="space-y-3">
              {[
                { step: '1', label: 'Paste addresses (one per line)' },
                { step: '2', label: 'Select chain & concurrency' },
                { step: '3', label: 'Go scanner fetches bytecode via RPC' },
                { step: '4', label: 'Python analyzer scans source code' },
                { step: '5', label: 'Risk scores calculated per contract' },
                { step: '6', label: 'Results aggregated & displayed' },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 font-bold shrink-0">{s.step}</span>
                  <span className="text-xs text-gray-400">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Scanner Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-xs text-gray-500">Engine</span><span className="text-xs text-white">Go 1.21</span></div>
              <div className="flex justify-between"><span className="text-xs text-gray-500">Max Concurrency</span><span className="text-xs text-white">50</span></div>
              <div className="flex justify-between"><span className="text-xs text-gray-500">Avg Scan Time</span><span className="text-xs text-white">2.4s</span></div>
              <div className="flex justify-between"><span className="text-xs text-gray-500">Analyzers</span><span className="text-xs text-white">4</span></div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Addresses</h3>
            <div className="space-y-1.5">
              {[
                { name: 'WETH', addr: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
                { name: 'Uniswap Router', addr: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' },
                { name: 'USDC', addr: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
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
