'use client';

import { useState } from 'react';

export default function GasTrackerPage() {
  const [chain, setChain] = useState('ethereum');

  const gasData = {
    ethereum: { standard: 18, fast: 25, instant: 35, unit: 'Gwei', baseFee: 16.2, priorityFee: 1.5, history: [22,19,18,21,25,23,18,16,19,22,20,18] },
    bsc: { standard: 3, fast: 5, instant: 7, unit: 'Gwei', baseFee: 2.8, priorityFee: 1.0, history: [4,3,3,5,4,3,3,4,5,3,3,4] },
    polygon: { standard: 30, fast: 45, instant: 65, unit: 'Gwei', baseFee: 28.5, priorityFee: 2.0, history: [35,30,28,40,45,38,30,32,35,42,38,30] },
    arbitrum: { standard: 0.1, fast: 0.2, instant: 0.3, unit: 'Gwei', baseFee: 0.08, priorityFee: 0.01, history: [0.1,0.1,0.2,0.1,0.2,0.1,0.1,0.2,0.1,0.1,0.2,0.1] },
  };

  const data = gasData[chain];

  const gasActions = [
    { name: 'ETH Transfer', gas: 21000, cost: (21000 * data.standard * 1e-9 * 3200).toFixed(4) },
    { name: 'ERC-20 Transfer', gas: 65000, cost: (65000 * data.standard * 1e-9 * 3200).toFixed(4) },
    { name: 'Uniswap Swap', gas: 150000, cost: (150000 * data.standard * 1e-9 * 3200).toFixed(4) },
    { name: 'NFT Mint', gas: 200000, cost: (200000 * data.standard * 1e-9 * 3200).toFixed(4) },
    { name: 'Contract Deploy', gas: 1500000, cost: (1500000 * data.standard * 1e-9 * 3200).toFixed(4) },
    { name: 'Flash Loan', gas: 350000, cost: (350000 * data.standard * 1e-9 * 3200).toFixed(4) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gas Tracker</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time gas prices across supported chains</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Live · Updated 3s ago</span>
        </div>
      </div>

      {/* Chain Selector */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(gasData).map(([key, val]) => (
          <button key={key} onClick={() => setChain(key)} className={`card text-left transition-all ${chain === key ? 'border-blue-500/40 bg-blue-500/5' : 'hover:border-gray-600/30'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300 capitalize font-medium">{key}</span>
              {chain === key && <span className="w-2 h-2 bg-blue-400 rounded-full" />}
            </div>
            <p className="text-2xl font-bold text-white">{val.standard}</p>
            <p className="text-xs text-gray-500">{val.unit}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Gas Price Tiers */}
        <div className="col-span-2 space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-4">Gas Price Tiers — <span className="capitalize">{chain}</span></h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-xs text-emerald-400 font-semibold mb-1">🐢 Standard</p>
                <p className="text-3xl font-bold text-white">{data.standard}</p>
                <p className="text-xs text-gray-500 mt-1">~5 min confirmation</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <p className="text-xs text-blue-400 font-semibold mb-1">⚡ Fast</p>
                <p className="text-3xl font-bold text-white">{data.fast}</p>
                <p className="text-xs text-gray-500 mt-1">~30 sec confirmation</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                <p className="text-xs text-orange-400 font-semibold mb-1">🚀 Instant</p>
                <p className="text-3xl font-bold text-white">{data.instant}</p>
                <p className="text-xs text-gray-500 mt-1">Next block</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-surface-2 border border-gray-600/10">
                <p className="text-xs text-gray-500">Base Fee</p>
                <p className="text-lg font-bold text-white">{data.baseFee} <span className="text-xs text-gray-500">{data.unit}</span></p>
              </div>
              <div className="p-3 rounded-lg bg-surface-2 border border-gray-600/10">
                <p className="text-xs text-gray-500">Priority Fee (Tip)</p>
                <p className="text-lg font-bold text-white">{data.priorityFee} <span className="text-xs text-gray-500">{data.unit}</span></p>
              </div>
            </div>
          </div>

          {/* Gas History Chart */}
          <div className="card">
            <h3 className="text-sm font-semibold text-white mb-4">12-Hour Gas Price History</h3>
            <div className="h-32 flex items-end gap-2 px-2">
              {data.history.map((v, i) => {
                const max = Math.max(...data.history);
                const height = (v / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500">{v}</span>
                    <div className="w-full bg-blue-500/30 rounded-t" style={{ height: `${height}%` }}>
                      <div className="w-full bg-blue-500 rounded-t" style={{ height: `${height * 0.7}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between px-2 mt-2 text-[10px] text-gray-500">
              <span>12h ago</span><span>10h</span><span>8h</span><span>6h</span><span>4h</span><span>2h</span><span>Now</span>
            </div>
          </div>
        </div>

        {/* Cost Estimator */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Transaction Cost Estimator</h3>
          <div className="space-y-3">
            {gasActions.map((action) => (
              <div key={action.name} className="flex items-center justify-between py-2 border-b border-gray-600/10 last:border-0">
                <div>
                  <p className="text-sm text-gray-300">{action.name}</p>
                  <p className="text-[10px] text-gray-500">{action.gas.toLocaleString()} gas</p>
                </div>
                <p className="text-sm text-white font-mono">${action.cost}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-600/10">
            <p className="text-[10px] text-gray-500">* Based on ETH price $3,200</p>
          </div>
        </div>
      </div>
    </div>
  );
}
