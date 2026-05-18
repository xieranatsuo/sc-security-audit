'use client';

import { useState } from 'react';

export default function MonitorAlertsPage() {
  const [filter, setFilter] = useState('all');

  const alerts = [
    { id: 1, type: 'Ownership Transfer', severity: 'critical', contract: '0x7a25...88D', chain: 'Ethereum', description: 'Ownership transferred to unknown address 0xdead...beef', time: '3 min ago', read: false },
    { id: 2, type: 'Large Transfer', severity: 'high', contract: '0xA0b8...eb48', chain: 'Ethereum', description: 'Transfer of 10,000,000 USDC to new address', time: '12 min ago', read: false },
    { id: 3, type: 'Flash Loan', severity: 'high', contract: '0x8787...B39', chain: 'Ethereum', description: 'Flash loan of 50,000 ETH detected', time: '18 min ago', read: false },
    { id: 4, type: 'Proxy Upgrade', severity: 'critical', contract: '0xdef0...1234', chain: 'Polygon', description: 'Implementation changed to 0x9abc...new', time: '25 min ago', read: true },
    { id: 5, type: 'Function Pause', severity: 'medium', contract: '0x1234...5678', chain: 'BNB Chain', description: 'Contract paused by admin', time: '1 hour ago', read: true },
    { id: 6, type: 'New Contract', severity: 'low', contract: '0x5678...9abc', chain: 'Arbitrum', description: 'New contract deployed by monitored address', time: '2 hours ago', read: true },
    { id: 7, type: 'Approval Change', severity: 'medium', contract: '0xabcd...ef01', chain: 'Ethereum', description: 'Unlimited USDT approval granted to DEX router', time: '3 hours ago', read: true },
    { id: 8, type: 'SELFDESTRUCT', severity: 'critical', contract: '0x9abc...def0', chain: 'Ethereum', description: 'Contract self-destructed, 12.5 ETH drained', time: '5 hours ago', read: true },
  ];

  const sevBadge = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
  const typeIcons = {
    'Ownership Transfer': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    'Large Transfer': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'Flash Loan': 'M13 10V3L4 14h7v7l9-11h-7z',
    'Proxy Upgrade': 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    'Function Pause': 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z',
    'New Contract': 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
    'Approval Change': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    'SELFDESTRUCT': 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  };

  const unread = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Alert Rules & Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">Configure monitoring rules and view security alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs">Mark All Read</button>
          <button className="btn-primary text-xs flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            New Rule
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card"><p className="text-[11px] text-gray-500 uppercase tracking-wider">Active Rules</p><p className="text-2xl font-bold text-white mt-1">12</p></div>
        <div className="card"><p className="text-[11px] text-gray-500 uppercase tracking-wider">Unread Alerts</p><p className="text-2xl font-bold text-orange-400 mt-1">{unread}</p></div>
        <div className="card"><p className="text-[11px] text-gray-500 uppercase tracking-wider">Monitored Contracts</p><p className="text-2xl font-bold text-white mt-1">24</p></div>
        <div className="card"><p className="text-[11px] text-gray-500 uppercase tracking-wider">Alerts Today</p><p className="text-2xl font-bold text-white mt-1">{alerts.length}</p></div>
      </div>

      {/* Alert Rules */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Active Monitoring Rules</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Ownership Transfer', enabled: true, contracts: 8 },
            { name: 'Flash Loan Detection', enabled: true, contracts: 12 },
            { name: 'Large Transfer (>$100K)', enabled: true, contracts: 15 },
            { name: 'Proxy Upgrade', enabled: true, contracts: 6 },
            { name: 'Contract Pause/Unpause', enabled: false, contracts: 4 },
            { name: 'SELFDESTRUCT', enabled: true, contracts: 20 },
          ].map((rule) => (
            <div key={rule.name} className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-gray-600/10">
              <div>
                <p className="text-sm text-gray-300">{rule.name}</p>
                <p className="text-[10px] text-gray-500">{rule.contracts} contracts</p>
              </div>
              <div className={`w-9 h-5 rounded-full relative cursor-pointer ${rule.enabled ? 'bg-blue-500' : 'bg-gray-600'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${rule.enabled ? 'left-[18px]' : 'left-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-2">
        {alerts.filter(a => filter === 'all' || a.severity === filter).map((alert) => (
          <div key={alert.id} className={`card-hover flex items-start gap-4 ${!alert.read ? 'border-l-2 border-l-orange-500' : ''}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${alert.severity === 'critical' ? 'bg-red-500/10' : alert.severity === 'high' ? 'bg-orange-500/10' : 'bg-surface-3'}`}>
              <svg className={`w-4 h-4 ${alert.severity === 'critical' ? 'text-red-400' : alert.severity === 'high' ? 'text-orange-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={typeIcons[alert.type] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={sevBadge[alert.severity]}>{alert.severity}</span>
                <span className="text-white text-sm font-medium">{alert.type}</span>
                {!alert.read && <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />}
              </div>
              <p className="text-gray-400 text-sm">{alert.description}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                <span className="font-mono">{alert.contract}</span>
                <span>{alert.chain}</span>
                <span>{alert.time}</span>
              </div>
            </div>
            <button className="text-gray-500 hover:text-white p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
