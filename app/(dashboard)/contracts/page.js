'use client';

import { useState } from 'react';

export default function ContractsPage() {
  const [search, setSearch] = useState('');
  const [chain, setChain] = useState('all');
  const [sort, setSort] = useState('risk');

  const contracts = [
    { name: 'Uniswap V2 Router02', addr: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', chain: 'Ethereum', chainId: 1, type: 'DEX', audits: 24, risk: 12, label: 'LOW', findings: 2, lastAudit: '2 days ago', verified: true, proxy: false },
    { name: 'Aave V3 Pool', addr: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', chain: 'Ethereum', chainId: 1, type: 'Lending', audits: 19, risk: 18, label: 'LOW', findings: 3, lastAudit: '5 days ago', verified: true, proxy: true },
    { name: 'PancakeSwap Router', addr: '0x10ED43C718714eb63d5aA57B78B54704E256024E', chain: 'BNB Chain', chainId: 56, type: 'DEX', audits: 16, risk: 25, label: 'LOW', findings: 4, lastAudit: '1 week ago', verified: true, proxy: false },
    { name: 'Compound cDAI', addr: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', chain: 'Ethereum', chainId: 1, type: 'Lending', audits: 14, risk: 35, label: 'MEDIUM', findings: 6, lastAudit: '2 weeks ago', verified: true, proxy: false },
    { name: 'Curve 3Pool', addr: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7', chain: 'Ethereum', chainId: 1, type: 'DEX', audits: 12, risk: 22, label: 'LOW', findings: 3, lastAudit: '3 weeks ago', verified: true, proxy: false },
    { name: 'Lido stETH', addr: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', chain: 'Ethereum', chainId: 1, type: 'Staking', audits: 18, risk: 15, label: 'LOW', findings: 1, lastAudit: '4 days ago', verified: true, proxy: true },
    { name: 'QuickSwap Router', addr: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', chain: 'Polygon', chainId: 137, type: 'DEX', audits: 8, risk: 28, label: 'LOW', findings: 3, lastAudit: '1 month ago', verified: true, proxy: false },
    { name: 'GMX Router', addr: '0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064', chain: 'Arbitrum', chainId: 42161, type: 'Derivatives', audits: 10, risk: 42, label: 'MEDIUM', findings: 7, lastAudit: '2 weeks ago', verified: true, proxy: true },
    { name: 'Venus XVS', addr: '0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63', chain: 'BNB Chain', chainId: 56, type: 'Lending', audits: 11, risk: 38, label: 'MEDIUM', findings: 5, lastAudit: '3 weeks ago', verified: true, proxy: true },
    { name: 'SushiSwap Router', addr: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F', chain: 'Ethereum', chainId: 1, type: 'DEX', audits: 15, risk: 20, label: 'LOW', findings: 2, lastAudit: '1 week ago', verified: true, proxy: false },
  ];

  const riskBadge = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high', CRITICAL: 'badge-critical' };

  const filtered = contracts.filter((c) => {
    if (chain !== 'all' && !c.chain.toLowerCase().includes(chain)) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.addr.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'risk') return b.risk - a.risk;
    if (sort === 'audits') return b.audits - a.audits;
    if (sort === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Contract Registry</h1>
          <p className="text-gray-500 text-sm mt-1">Audited contracts across all supported chains</p>
        </div>
        <button className="btn-primary text-xs flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Register Contract
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or address..." className="input w-full pl-9 text-sm" />
        </div>
        {['all', 'ethereum', 'bsc', 'polygon', 'arbitrum'].map((c) => (
          <button key={c} onClick={() => setChain(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${chain === c ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-surface-2 text-gray-400 border border-transparent'}`}>
            {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
        <div className="flex-1" />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input text-xs bg-white text-gray-900 w-36">
          <option value="risk">Sort: Risk Score</option>
          <option value="audits">Sort: Audit Count</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="table-header"><tr>
            <th className="px-4 py-3 text-left text-[10px]">Contract</th>
            <th className="px-4 py-3 text-left text-[10px]">Chain</th>
            <th className="px-4 py-3 text-left text-[10px]">Type</th>
            <th className="px-4 py-3 text-left text-[10px]">Audits</th>
            <th className="px-4 py-3 text-left text-[10px]">Findings</th>
            <th className="px-4 py-3 text-left text-[10px]">Risk</th>
            <th className="px-4 py-3 text-left text-[10px]">Flags</th>
            <th className="px-4 py-3 text-left text-[10px]">Last Audit</th>
            <th className="px-4 py-3 text-left text-[10px]">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.addr} className="table-row">
                <td className="px-4 py-3">
                  <p className="text-white text-sm font-medium">{c.name}</p>
                  <p className="text-gray-500 text-xs font-mono">{c.addr.slice(0, 10)}...{c.addr.slice(-4)}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{c.chain}</td>
                <td className="px-4 py-3"><span className="bg-surface-3 px-2 py-0.5 rounded text-xs text-gray-300">{c.type}</span></td>
                <td className="px-4 py-3 text-sm text-white">{c.audits}</td>
                <td className="px-4 py-3 text-sm text-white">{c.findings}</td>
                <td className="px-4 py-3"><span className={riskBadge[c.label]}>{c.risk} — {c.label}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {c.proxy && <span className="text-[9px] bg-orange-500/15 text-orange-400 px-1.5 py-0.5 rounded">Proxy</span>}
                    {c.verified && <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">Verified</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{c.lastAudit}</td>
                <td className="px-4 py-3">
                  <button className="text-gray-500 hover:text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
