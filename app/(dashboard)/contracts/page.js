'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { DEMO_CONTRACTS } from '@/lib/reference-data';

const CHAINS = ['all', 'ethereum', 'bsc', 'polygon', 'arbitrum'];
const TYPES = ['all', 'DEX', 'Token', 'Lending', 'NFT', 'Proxy', 'Multisig', 'Staking'];

const TYPE_CONFIG = {
  DEX:     { color: 'bg-indigo-500/15 text-indigo-400',   icon: '⇄' },
  Token:   { color: 'bg-green-500/15 text-green-400',  icon: '◎' },
  Lending: { color: 'bg-purple-500/15 text-purple-400', icon: '%' },
  NFT:     { color: 'bg-pink-500/15 text-pink-400',    icon: '♦' },
  Proxy:   { color: 'bg-orange-500/15 text-orange-400', icon: '⟲' },
  Multisig:{ color: 'bg-yellow-500/15 text-yellow-400', icon: '⚑' },
  Staking: { color: 'bg-teal-500/15 text-teal-400',    icon: '⛏' },
};

const VERIFICATION_CONFIG = {
  Verified:   { cls: 'bg-emerald-500/15 text-emerald-400', label: 'Verified' },
  Unverified: { cls: 'bg-red-500/15 text-red-400',         label: 'Unverified' },
  Partial:    { cls: 'bg-yellow-500/15 text-yellow-400',    label: 'Partial' },
};

function getVerification(contract) {
  if (contract.verified) return 'Verified';
  if (contract.partial) return 'Partial';
  return 'Unverified';
}

function getRiskColor(score) {
  if (score >= 70) return 'text-red-400 bg-red-500/15';
  if (score >= 40) return 'text-orange-400 bg-orange-500/15';
  if (score >= 20) return 'text-yellow-400 bg-yellow-500/15';
  return 'text-indigo-400 bg-indigo-500/15';
}

function getRiskLabel(score) {
  if (score >= 70) return 'CRITICAL';
  if (score >= 40) return 'HIGH';
  if (score >= 20) return 'MEDIUM';
  return 'LOW';
}

function deterministicLastScan(address) {
  const hex = (address || '').toLowerCase().replace('0x', '');
  let seed = 0;
  for (let i = 0; i < Math.min(hex.length, 8); i++) {
    seed += hex.charCodeAt(i);
  }
  const hours = seed % 168;
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ContractsPage() {
  const [search, setSearch] = useState('');
  const [chain, setChain] = useState('all');
  const [type, setType] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    return DEMO_CONTRACTS.filter((c) => {
      if (chain !== 'all' && c.chain !== chain) return false;
      if (type !== 'all' && c.type !== type) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          (c.tags && c.tags.some(t => t.includes(q)))
        );
      }
      return true;
    });
  }, [search, chain, type]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-gray-300 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-400">Blockchain Tools</span>
        <span>/</span>
        <span className="text-gray-300">Contract Registry</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Contract Registry</h1>
          <p className="text-gray-500 text-sm mt-1">{DEMO_CONTRACTS.length} contracts tracked across all chains</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, address, or tag..."
            className="input w-full pl-9 text-sm"
          />
        </div>

        <select value={chain} onChange={(e) => setChain(e.target.value)} className="input text-xs w-36">
          {CHAINS.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All Chains' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>

        <select value={type} onChange={(e) => setType(e.target.value)} className="input text-xs w-36">
          {TYPES.map((t) => (
            <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-400 text-sm font-medium">No contracts found</p>
          <p className="text-gray-600 text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Contract</th>
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Chain</th>
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Verification</th>
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Last Scan</th>
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Risk</th>
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Tags</th>
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const verification = getVerification(c);
                  const verConfig = VERIFICATION_CONFIG[verification];
                  const typeConfig = TYPE_CONFIG[c.type] || { color: 'bg-gray-500/15 text-gray-400', icon: '•' };
                  const isExpanded = expanded === c.address;

                  return (
                    <tbody key={c.address}>
                      <tr
                        className="border-b border-gray-800/50 hover:bg-surface-2 cursor-pointer transition-colors"
                        onClick={() => setExpanded(isExpanded ? null : c.address)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${typeConfig.color}`}>
                              {typeConfig.icon}
                            </span>
                            <div>
                              <p className="text-white text-sm font-medium">{c.name}</p>
                              <p className="text-gray-500 text-xs font-mono">{c.address.slice(0, 10)}...{c.address.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-400 capitalize">{c.chain}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${typeConfig.color}`}>
                            {c.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${verConfig.cls}`}>
                            {verConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {deterministicLastScan(c.address)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${getRiskColor(c.riskScore)}`}>
                            {c.riskScore} · {getRiskLabel(c.riskScore)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {(c.tags || []).slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[9px] bg-surface-3 text-gray-400 px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/audit?address=${c.address}&chain=${c.chain}`}
                            className="btn btn-primary btn-sm text-[11px] whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Audit Contract
                          </Link>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="px-4 py-4 bg-surface-2 border-b border-gray-800/50">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Compiler</p>
                                <p className="text-gray-300 font-mono text-xs">{c.compiler || 'Unknown'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Balance</p>
                                <p className="text-gray-300 text-xs">{c.balance || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Transactions</p>
                                <p className="text-gray-300 text-xs">{c.txCount ? c.txCount.toLocaleString() : 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Address</p>
                                <p className="text-gray-300 font-mono text-xs break-all">{c.address}</p>
                              </div>
                            </div>
                            {c.tags && c.tags.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {c.tags.map((tag) => (
                                  <span key={tag} className="text-[10px] bg-surface-3 text-gray-400 px-2 py-0.5 rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
