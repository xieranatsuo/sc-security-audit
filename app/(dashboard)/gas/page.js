'use client';

import { useState, useEffect } from 'react';

const CHAINS_GAS = [
  { name: 'Ethereum', color: '#627EEA', baseFee: '12.4', priority: '1.5', usd: '$0.84', trend: 'up', icon: '⟠' },
  { name: 'BNB Chain', color: '#F0B90B', baseFee: '3.0', priority: '1.0', usd: '$0.03', trend: 'down', icon: '◆' },
  { name: 'Polygon', color: '#8247E5', baseFee: '30.2', priority: '30.0', usd: '$0.01', trend: 'stable', icon: '⬡' },
  { name: 'Arbitrum', color: '#28A0F0', baseFee: '0.1', priority: '0.01', usd: '$0.001', trend: 'down', icon: '🔵' },
  { name: 'Optimism', color: '#FF0420', baseFee: '0.01', priority: '0.001', usd: '$0.001', trend: 'stable', icon: '🔴' },
  { name: 'Base', color: '#0052FF', baseFee: '0.01', priority: '0.001', usd: '$0.001', trend: 'stable', icon: '🔵' },
];

const trendIcons = { up: '↑', down: '↓', stable: '→' };
const trendColors = { up: 'text-red-400', down: 'text-emerald-400', stable: 'text-gray-400' };

export default function GasPage() {
  const [selected, setSelected] = useState('ethereum');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="text-gray-400">Dashboard</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-400">Blockchain Tools</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span className="text-white">Gas Tracker</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gas Tracker</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time gas prices across all supported networks</p>
        </div>
        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded font-semibold">DEMO DATA</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHAINS_GAS.map(chain => (
          <div key={chain.name} className="card hover:border-gray-600/30 transition-colors cursor-pointer" onClick={() => setSelected(chain.name.toLowerCase())}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{chain.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{chain.name}</p>
                  <p className="text-gray-500 text-[10px]">Last updated: just now</p>
                </div>
              </div>
              <span className={`text-lg ${trendColors[chain.trend]}`}>{trendIcons[chain.trend]}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Base Fee</p>
                <p className="text-white font-bold text-lg">{chain.baseFee}</p>
                <p className="text-gray-500 text-[10px]">Gwei</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Priority</p>
                <p className="text-white font-bold text-lg">{chain.priority}</p>
                <p className="text-gray-500 text-[10px]">Gwei</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Est. Cost</p>
                <p className="text-white font-bold text-lg">{chain.usd}</p>
                <p className="text-gray-500 text-[10px]">per tx</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gas Tips */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Gas Optimization Tips</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { tip: 'Use L2 networks for lower fees', detail: 'Arbitrum, Optimism, and Base offer 10-100x lower gas costs than Ethereum mainnet.' },
            { tip: 'Batch transactions when possible', detail: 'Use multicall to combine multiple operations into a single transaction.' },
            { tip: 'Set appropriate gas limits', detail: 'Setting gas too high wastes ETH. Use gas estimation before submitting.' },
            { tip: 'Monitor base fee trends', detail: 'Gas prices are lowest during weekends and off-peak hours (UTC 2-6 AM).' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface-2/50">
              <svg className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <div>
                <p className="text-white text-sm font-medium">{item.tip}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
