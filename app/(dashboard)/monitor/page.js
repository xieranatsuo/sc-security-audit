'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DEMO_CONTRACTS, DEMO_ALERTS, DEMO_TRANSACTIONS } from '@/lib/mock-data';

const MONITOR_STORAGE_KEY = 'monitored_contracts';

function getMonitored() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(MONITOR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEMO_CONTRACTS.slice(0, 5).map(c => c.address);
  } catch {
    return [];
  }
}

function saveMonitored(addresses) {
  try {
    localStorage.setItem(MONITOR_STORAGE_KEY, JSON.stringify(addresses));
  } catch {}
}

function getRiskColor(score) {
  if (score >= 70) return 'text-red-400';
  if (score >= 40) return 'text-orange-400';
  if (score >= 20) return 'text-yellow-400';
  return 'text-blue-400';
}

function getTimeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function deterministicActivity(address) {
  const hex = (address || '').toLowerCase().replace('0x', '');
  let seed = 0;
  for (let i = 0; i < Math.min(hex.length, 6); i++) seed += hex.charCodeAt(i);
  const mins = seed % 180;
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function deterministicRiskChange(address) {
  const hex = (address || '').toLowerCase().replace('0x', '');
  let seed = 0;
  for (let i = 0; i < 4; i++) seed += hex.charCodeAt(i);
  const changes = [
    { text: 'Risk score decreased by 3', direction: 'down', delta: -3 },
    { text: 'Risk score increased by 5', direction: 'up', delta: 5 },
    { text: 'New vulnerability detected', direction: 'up', delta: 8 },
    { text: 'Contract re-verified', direction: 'down', delta: -2 },
  ];
  return changes[seed % changes.length];
}

export default function MonitorPage() {
  const [monitoredAddresses, setMonitoredAddresses] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMonitoredAddresses(getMonitored());
    setMounted(true);
  }, []);

  const toggleMonitor = (address) => {
    setMonitoredAddresses((prev) => {
      const next = prev.includes(address)
        ? prev.filter(a => a !== address)
        : [...prev, address];
      saveMonitored(next);
      return next;
    });
  };

  const monitoredContracts = useMemo(() => {
    return DEMO_CONTRACTS.filter(c => monitoredAddresses.includes(c.address));
  }, [monitoredAddresses]);

  const riskChanges = useMemo(() => {
    return monitoredContracts.map(c => ({
      ...c,
      change: deterministicRiskChange(c.address),
    }));
  }, [monitoredContracts]);

  const txAlerts = DEMO_TRANSACTIONS.slice(0, 5);
  const proxyAlerts = DEMO_ALERTS.filter(a => a.type === 'info' || a.title.includes('Upgrade'));
  const adminAlerts = DEMO_ALERTS.filter(a => a.title.includes('Admin') || a.title.includes('Ownership') || a.type === 'warning');

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="card text-center py-16">
          <p className="text-gray-500">Loading monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-gray-300 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-400">Monitoring</span>
        <span>/</span>
        <span className="text-gray-300">Live Monitor</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Live Monitor</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time tracking for {monitoredContracts.length} contracts</p>
        </div>
        <Link href="/contracts" className="btn btn-secondary btn-sm text-xs">
          + Add Contracts
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider">Monitored</p>
          <p className="text-2xl font-bold text-white mt-1">{monitoredContracts.length}</p>
        </div>
        <div className="card">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider">Active Alerts</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{DEMO_ALERTS.filter(a => !a.read).length}</p>
        </div>
        <div className="card">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider">Transactions</p>
          <p className="text-2xl font-bold text-white mt-1">{txAlerts.length}</p>
        </div>
        <div className="card">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider">Risk Changes</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{riskChanges.filter(c => c.change.direction === 'up').length}</p>
        </div>
      </div>

      {/* Monitored Contracts */}
      <div className="card overflow-hidden p-0">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-white">Monitored Contracts</h3>
        </div>
        {monitoredContracts.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <svg className="w-10 h-10 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400 text-sm">No contracts being monitored</p>
            <p className="text-gray-600 text-xs mt-1">Add contracts from the registry to start monitoring</p>
            <Link href="/contracts" className="btn btn-primary btn-sm text-xs mt-4 inline-flex">
              Browse Contracts
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Contract</th>
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Chain</th>
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Risk Score</th>
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Last Activity</th>
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {monitoredContracts.map((c) => (
                  <tr key={c.address} className="border-b border-gray-800/50 hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-medium">{c.name}</p>
                      <p className="text-gray-500 text-xs font-mono">{c.address.slice(0, 10)}...{c.address.slice(-6)}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 capitalize">{c.chain}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${getRiskColor(c.riskScore)}`}>{c.riskScore}</span>
                      <span className="text-gray-600 text-xs ml-1">/ 100</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{deterministicActivity(c.address)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-emerald-400 text-xs">Active</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleMonitor(c.address)}
                        className="btn btn-danger btn-sm text-[11px]"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Risk Changes */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Recent Risk Changes</h3>
        {riskChanges.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">No risk changes detected</p>
        ) : (
          <div className="space-y-2">
            {riskChanges.map((c) => (
              <div key={c.address} className="flex items-center justify-between p-3 rounded-lg bg-surface-2">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-xs ${c.change.direction === 'up' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                    {c.change.direction === 'up' ? '↑' : '↓'}
                  </span>
                  <div>
                    <p className="text-white text-sm">{c.name}</p>
                    <p className="text-gray-500 text-xs">{c.change.text}</p>
                  </div>
                </div>
                <span className={`text-xs font-mono font-bold ${c.change.direction === 'up' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {c.change.delta > 0 ? '+' : ''}{c.change.delta}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Transaction Alerts */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">New Transaction Alerts</h3>
        <div className="space-y-2">
          {txAlerts.map((tx, i) => (
            <div key={tx.hash} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2">
              <span className={`w-6 h-6 rounded flex items-center justify-center text-xs ${tx.status === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                {tx.status === 'success' ? '✓' : '✗'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{tx.method}</p>
                <p className="text-gray-500 text-xs font-mono truncate">{tx.from} → {tx.to}</p>
              </div>
              <span className="text-gray-400 text-xs">{tx.value}</span>
              <span className="text-gray-500 text-xs">{getTimeAgo(tx.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Proxy Implementation Changes */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Proxy Implementation Changes</h3>
        {proxyAlerts.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">No proxy changes detected</p>
        ) : (
          <div className="space-y-2">
            {proxyAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2">
                <span className="w-6 h-6 rounded flex items-center justify-center text-xs bg-orange-500/15 text-orange-400">⟲</span>
                <div className="flex-1">
                  <p className="text-white text-sm">{alert.title}</p>
                  <p className="text-gray-500 text-xs">{alert.message}</p>
                </div>
                <span className="text-gray-500 text-xs">{getTimeAgo(alert.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin / Ownership Changes */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Admin & Ownership Changes</h3>
        {adminAlerts.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">No admin changes detected</p>
        ) : (
          <div className="space-y-2">
            {adminAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2">
                <span className="w-6 h-6 rounded flex items-center justify-center text-xs bg-yellow-500/15 text-yellow-400">⚑</span>
                <div className="flex-1">
                  <p className="text-white text-sm">{alert.title} — {alert.contract}</p>
                  <p className="text-gray-500 text-xs">{alert.message}</p>
                </div>
                <span className="text-gray-500 text-xs">{getTimeAgo(alert.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
