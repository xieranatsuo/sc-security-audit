'use client';

import { useState } from 'react';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Security trends, chain comparisons, and audit metrics</p>
        </div>
        <div className="flex items-center gap-1 bg-surface-1 rounded-lg p-1 border border-gray-600/10">
          {['24h', '7d', '30d', '90d'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p ? 'bg-surface-2 text-white' : 'text-gray-500 hover:text-gray-300'}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Audits Completed" value="1,247" change="+18.2%" trend="up" sparkline={[3,5,4,7,6,8,9]} />
        <KPICard label="Vulnerabilities Found" value="3,891" change="+12.4%" trend="up" sparkline={[2,4,3,5,6,4,7]} />
        <KPICard label="Critical Issues" value="89" change="-23.1%" trend="down" sparkline={[8,6,7,5,4,3,2]} />
        <KPICard label="Avg Scan Time" value="2.4s" change="-8.7%" trend="down" sparkline={[5,4,4,3,3,2,2]} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Audit Volume Trend</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Audits</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Findings</span>
            </div>
          </div>
          <div className="h-48 flex items-end gap-1.5 px-2">
            {[35,48,42,65,58,72,68,85,78,92,88,95].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-blue-500/20 rounded-t" style={{ height: `${v * 1.8}px` }}>
                  <div className="w-full bg-blue-500 rounded-t" style={{ height: `${v * 1.2}px` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2 mt-2 text-[10px] text-gray-500">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">By Chain</h3>
          <div className="space-y-4">
            {[
              { name: 'Ethereum', count: 542, pct: 43, color: '#627EEA' },
              { name: 'BNB Chain', count: 312, pct: 25, color: '#F0B90B' },
              { name: 'Polygon', count: 248, pct: 20, color: '#8247E5' },
              { name: 'Arbitrum', count: 145, pct: 12, color: '#28A0F0' },
            ].map((chain) => (
              <div key={chain.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-300">{chain.name}</span>
                  <span className="text-xs text-gray-500">{chain.count} ({chain.pct}%)</span>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${chain.pct}%`, backgroundColor: chain.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vulnerability Heatmap */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Vulnerability Category Heatmap</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { cat: 'Reentrancy', count: 234, sev: 'critical', heat: 95 },
            { cat: 'Access Control', count: 189, sev: 'high', heat: 82 },
            { cat: 'Arithmetic', count: 156, sev: 'high', heat: 71 },
            { cat: 'Flash Loan', count: 134, sev: 'critical', heat: 88 },
            { cat: 'Oracle Manip.', count: 98, sev: 'high', heat: 65 },
            { cat: 'Front-Running', count: 87, sev: 'medium', heat: 52 },
            { cat: 'Proxy Safety', count: 76, sev: 'high', heat: 60 },
            { cat: 'Gas Waste', count: 312, sev: 'low', heat: 40 },
          ].map((v) => (
            <div key={v.cat} className="p-3 rounded-lg border border-gray-600/10 bg-surface-2 hover:border-gray-600/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-300 font-medium">{v.cat}</span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${v.sev === 'critical' ? 'bg-red-500/15 text-red-400' : v.sev === 'high' ? 'bg-orange-500/15 text-orange-400' : v.sev === 'medium' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-green-500/15 text-green-400'}`}>{v.sev}</span>
              </div>
              <p className="text-xl font-bold text-white">{v.count}</p>
              <div className="h-1 bg-surface-3 rounded-full mt-2 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-red-500" style={{ width: `${v.heat}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Audited Contracts */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Most Audited Contracts</h3>
        <table className="w-full">
          <thead className="table-header"><tr>
            <th className="px-4 py-2.5 text-left text-[10px]">#</th>
            <th className="px-4 py-2.5 text-left text-[10px]">Contract</th>
            <th className="px-4 py-2.5 text-left text-[10px]">Chain</th>
            <th className="px-4 py-2.5 text-left text-[10px]">Audits</th>
            <th className="px-4 py-2.5 text-left text-[10px]">Risk</th>
            <th className="px-4 py-2.5 text-left text-[10px]">Last Audit</th>
          </tr></thead>
          <tbody>
            {[
              { rank: 1, name: 'Uniswap V2 Router', addr: '0x7a25...88D', chain: 'Ethereum', audits: 24, risk: 12, label: 'LOW' },
              { rank: 2, name: 'Aave V3 Pool', addr: '0x8787...B39', chain: 'Ethereum', audits: 19, risk: 18, label: 'LOW' },
              { rank: 3, name: 'PancakeSwap Router', addr: '0x10ED...777', chain: 'BNB Chain', audits: 16, risk: 25, label: 'LOW' },
              { rank: 4, name: 'Compound cDAI', addr: '0x5d3a...976', chain: 'Ethereum', audits: 14, risk: 35, label: 'MEDIUM' },
              { rank: 5, name: 'Curve 3Pool', addr: '0xbEbc...7ea', chain: 'Ethereum', audits: 12, risk: 22, label: 'LOW' },
            ].map((c) => (
              <tr key={c.rank} className="table-row">
                <td className="px-4 py-2.5 text-sm text-gray-500">{c.rank}</td>
                <td className="px-4 py-2.5"><p className="text-white text-sm font-medium">{c.name}</p><p className="text-gray-500 text-xs font-mono">{c.addr}</p></td>
                <td className="px-4 py-2.5 text-sm text-gray-400">{c.chain}</td>
                <td className="px-4 py-2.5 text-sm text-white">{c.audits}</td>
                <td className="px-4 py-2.5"><span className={c.label === 'LOW' ? 'badge-low' : 'badge-medium'}>{c.risk} — {c.label}</span></td>
                <td className="px-4 py-2.5 text-sm text-gray-500">2 days ago</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPICard({ label, value, change, trend, sparkline }) {
  return (
    <div className="card group hover:border-gray-600/30 transition-colors">
      <p className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-end justify-between mt-2">
        <p className="text-2xl font-bold text-white">{value}</p>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{change}</span>
      </div>
      <div className="flex items-end gap-0.5 h-8 mt-3">
        {sparkline.map((v, i) => (
          <div key={i} className="flex-1 bg-blue-500/30 rounded-t" style={{ height: `${v * 12}%` }} />
        ))}
      </div>
    </div>
  );
}
