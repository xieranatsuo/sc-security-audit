'use client';

import { useState, useEffect } from 'react';

const DEMO_TRANSACTIONS = [
  { hash: '0xabc1...def1', method: 'swapExactTokensForETH', from: '0x1234...5678', to: '0x7a25...488D', value: '0 ETH', risk: 'low', timestamp: '2 min ago', chain: 'Ethereum', status: 'Success' },
  { hash: '0xabc2...def2', method: 'transfer', from: '0x9876...5432', to: '0xA0b8...6648', value: '50,000 USDC', risk: 'low', timestamp: '5 min ago', chain: 'Ethereum', status: 'Success' },
  { hash: '0xabc3...def3', method: 'execute', from: '0x0000...0001', to: '0x6B17...dD76', value: '0 ETH', risk: 'high', timestamp: '12 min ago', chain: 'Ethereum', status: 'Success' },
  { hash: '0xabc4...def4', method: 'liquidate', from: '0x5555...6666', to: '0x7d27...2685', value: '2.5 ETH', risk: 'medium', timestamp: '18 min ago', chain: 'Ethereum', status: 'Success' },
  { hash: '0xabc5...def5', method: 'approve', from: '0x7777...8888', to: '0xC02a...Cc2', value: '∞', risk: 'medium', timestamp: '25 min ago', chain: 'Ethereum', status: 'Success' },
  { hash: '0xabc6...def6', method: 'selfDestruct', from: '0xdead...beef', to: '0x0000...0000', value: '12.3 ETH', risk: 'critical', timestamp: '1 hour ago', chain: 'Ethereum', status: 'Success' },
  { hash: '0xabc7...def7', method: 'swap', from: '0xaaaa...bbbb', to: '0xE592...6978', value: '100 ETH', risk: 'low', timestamp: '1 hour ago', chain: 'Arbitrum', status: 'Success' },
  { hash: '0xabc8...def8', method: 'multicall', from: '0xcccc...dddd', to: '0xDef1...C001', value: '0 ETH', risk: 'medium', timestamp: '2 hours ago', chain: 'Polygon', status: 'Failed' },
];

const riskColors = { critical: 'text-red-400 bg-red-500/10', high: 'text-orange-400 bg-orange-500/10', medium: 'text-yellow-400 bg-yellow-500/10', low: 'text-emerald-400 bg-emerald-500/10' };

export default function TransactionsPage() {
  const [filter, setFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const methods = [...new Set(DEMO_TRANSACTIONS.map(t => t.method))];
  const filtered = DEMO_TRANSACTIONS.filter(t => {
    if (filter !== 'all' && t.risk !== filter) return false;
    if (methodFilter !== 'all' && t.method !== methodFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="text-gray-400">Dashboard</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-400">Monitoring</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span className="text-white">Transactions</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transaction Monitor</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and analyze on-chain transactions with risk labels</p>
        </div>
        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-semibold">DEMO DATA</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input w-40 bg-white text-gray-900 text-sm">
          <option value="all">All Risk Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="input w-48 bg-white text-gray-900 text-sm">
          <option value="all">All Methods</option>
          {methods.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-header"><tr>
            <th className="px-4 py-2.5 text-left text-[10px]">Tx Hash</th>
            <th className="px-4 py-2.5 text-left text-[10px]">Method</th>
            <th className="px-4 py-2.5 text-left text-[10px]">From</th>
            <th className="px-4 py-2.5 text-left text-[10px]">To</th>
            <th className="px-4 py-2.5 text-left text-[10px]">Value</th>
            <th className="px-4 py-2.5 text-left text-[10px]">Risk</th>
            <th className="px-4 py-2.5 text-left text-[10px]">Chain</th>
            <th className="px-4 py-2.5 text-left text-[10px]">Time</th>
          </tr></thead>
          <tbody>
            {filtered.map((tx, i) => (
              <tr key={i} className="table-row">
                <td className="px-4 py-3 text-xs font-mono text-blue-400">{tx.hash}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-300">{tx.method}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-400">{tx.from}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-400">{tx.to}</td>
                <td className="px-4 py-3 text-xs text-white">{tx.value}</td>
                <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${riskColors[tx.risk]}`}>{tx.risk.toUpperCase()}</span></td>
                <td className="px-4 py-3 text-xs text-gray-400">{tx.chain}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{tx.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-gray-500 text-sm">No transactions match your filters</p>
          <button onClick={() => { setFilter('all'); setMethodFilter('all'); }} className="btn-secondary text-xs mt-3">Clear Filters</button>
        </div>
      )}
    </div>
  );
}
