'use client';

import { useState } from 'react';

export default function TransactionsPage() {
  const [chain, setChain] = useState('all');

  const txns = [
    { hash: '0x8a7b...3e2f', from: '0x1234...5678', to: '0xabcd...ef01', value: '1.5 ETH', method: 'swap()', chain: 'Ethereum', status: 'success', gas: '142,350', time: '2 min ago', risk: 'low' },
    { hash: '0x9c2d...8f1a', from: '0x5678...9abc', to: '0xdef0...1234', value: '0 ETH', method: 'transfer()', chain: 'BNB Chain', status: 'success', gas: '65,200', time: '5 min ago', risk: 'low' },
    { hash: '0x3f1e...7b9c', from: '0x9abc...def0', to: '0x2345...6789', value: '100 USDC', method: 'flashLoan()', chain: 'Ethereum', status: 'success', gas: '312,450', time: '8 min ago', risk: 'high' },
    { hash: '0x5d4c...2a8b', from: '0xdef0...1234', to: '0x6789...abcd', value: '0 ETH', method: 'approve()', chain: 'Polygon', status: 'success', gas: '46,120', time: '12 min ago', risk: 'low' },
    { hash: '0x7e6f...4d3c', from: '0x2345...6789', to: '0x9abc...def0', value: '5.2 ETH', method: 'deposit()', chain: 'Ethereum', status: 'success', gas: '189,300', time: '15 min ago', risk: 'low' },
    { hash: '0x1b2a...5e6d', from: '0x6789...abcd', to: '0x1234...5678', value: '0 ETH', method: 'upgradeTo()', chain: 'Ethereum', status: 'success', gas: '45,200', time: '18 min ago', risk: 'critical' },
    { hash: '0x4c3b...8a7f', from: '0x9abc...def0', to: '0x5678...9abc', value: '0 BNB', method: 'swap()', chain: 'BNB Chain', status: 'failed', gas: '210,000', time: '22 min ago', risk: 'medium' },
    { hash: '0x2a1f...6c5d', from: '0x1234...5678', to: '0xdef0...1234', value: '250 MATIC', method: 'transfer()', chain: 'Polygon', status: 'success', gas: '52,300', time: '25 min ago', risk: 'low' },
  ];

  const riskBadge = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high', critical: 'badge-critical' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transaction Monitor</h1>
          <p className="text-gray-500 text-sm mt-1">Track and analyze transactions across chains in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Monitoring 4 chains</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card"><p className="text-[11px] text-gray-500 uppercase tracking-wider">Total Monitored</p><p className="text-2xl font-bold text-white mt-1">12,847</p></div>
        <div className="card"><p className="text-[11px] text-gray-500 uppercase tracking-wider">Suspicious</p><p className="text-2xl font-bold text-orange-400 mt-1">23</p></div>
        <div className="card"><p className="text-[11px] text-gray-500 uppercase tracking-wider">Flash Loans</p><p className="text-2xl font-bold text-red-400 mt-1">8</p></div>
        <div className="card"><p className="text-[11px] text-gray-500 uppercase tracking-wider">Failed</p><p className="text-2xl font-bold text-gray-400 mt-1">156</p></div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        {['all', 'ethereum', 'bsc', 'polygon', 'arbitrum'].map((c) => (
          <button key={c} onClick={() => setChain(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${chain === c ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-surface-2 text-gray-400 border border-transparent hover:text-white'}`}>
            {c === 'all' ? 'All Chains' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
        <div className="flex-1" />
        <input type="text" placeholder="Search by hash, address..." className="input text-xs w-56" />
      </div>

      {/* Transaction Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="table-header"><tr>
            <th className="px-4 py-3 text-left text-[10px]">Tx Hash</th>
            <th className="px-4 py-3 text-left text-[10px]">Method</th>
            <th className="px-4 py-3 text-left text-[10px]">From → To</th>
            <th className="px-4 py-3 text-left text-[10px]">Value</th>
            <th className="px-4 py-3 text-left text-[10px]">Chain</th>
            <th className="px-4 py-3 text-left text-[10px]">Gas</th>
            <th className="px-4 py-3 text-left text-[10px]">Risk</th>
            <th className="px-4 py-3 text-left text-[10px]">Status</th>
            <th className="px-4 py-3 text-left text-[10px]">Time</th>
          </tr></thead>
          <tbody>
            {txns.filter(t => chain === 'all' || t.chain.toLowerCase().includes(chain)).map((tx, i) => (
              <tr key={i} className="table-row">
                <td className="px-4 py-3"><span className="text-blue-400 font-mono text-xs hover:underline cursor-pointer">{tx.hash}</span></td>
                <td className="px-4 py-3"><span className="bg-surface-3 px-2 py-0.5 rounded text-xs text-gray-300 font-mono">{tx.method}</span></td>
                <td className="px-4 py-3"><span className="text-xs text-gray-400 font-mono">{tx.from}</span><span className="text-gray-600 mx-1">→</span><span className="text-xs text-gray-400 font-mono">{tx.to}</span></td>
                <td className="px-4 py-3 text-sm text-white">{tx.value}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{tx.chain}</td>
                <td className="px-4 py-3 text-xs text-gray-400 font-mono">{tx.gas}</td>
                <td className="px-4 py-3"><span className={riskBadge[tx.risk]}>{tx.risk}</span></td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1.5 text-xs ${tx.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {tx.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{tx.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
