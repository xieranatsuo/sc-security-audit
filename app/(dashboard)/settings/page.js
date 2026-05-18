'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'audit_platform_settings';

function getSettings() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

function saveSettings(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    defaultChain: 'ethereum',
    defaultScanMode: 'standard',
    notifications: { critical: true, high: true, medium: false, low: false },
    riskThreshold: 70,
    theme: 'dark',
    dataMode: 'live',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => { setSettings(prev => ({ ...prev, ...getSettings() })); }, []);

  const update = (key, value) => {
    setSettings(prev => { const next = { ...prev, [key]: value }; saveSettings(next); return next; });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateNotif = (key, value) => {
    const notifs = { ...settings.notifications, [key]: value };
    update('notifications', notifs);
  };

  const clearHistory = () => {
    localStorage.removeItem('audit_history');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'audit-settings.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="text-gray-400">Dashboard</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span className="text-white">Settings</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your audit platform preferences</p>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2 animate-fade-in">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span className="text-emerald-400 text-sm">Settings saved</span>
        </div>
      )}

      {/* Scan Defaults */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Scan Defaults</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Default Chain</label>
            <select value={settings.defaultChain} onChange={e => update('defaultChain', e.target.value)} className="input w-full bg-white text-gray-900 text-sm">
              <option value="ethereum">Ethereum</option>
              <option value="bsc">BNB Chain</option>
              <option value="polygon">Polygon</option>
              <option value="arbitrum">Arbitrum</option>
              <option value="optimism">Optimism</option>
              <option value="base">Base</option>
              <option value="avalanche">Avalanche</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Default Scan Mode</label>
            <select value={settings.defaultScanMode} onChange={e => update('defaultScanMode', e.target.value)} className="input w-full bg-white text-gray-900 text-sm">
              <option value="standard">Standard Scan</option>
              <option value="deep">Deep Analysis</option>
              <option value="full">Full Audit (Source + Bytecode)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Risk Threshold */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Risk Threshold</h2>
        <p className="text-gray-500 text-xs mb-3">Alert when contract risk score exceeds this value</p>
        <div className="flex items-center gap-4">
          <input type="range" min={0} max={100} value={settings.riskThreshold} onChange={e => update('riskThreshold', parseInt(e.target.value))} className="flex-1 accent-indigo-500" />
          <span className={`text-lg font-bold w-12 text-right ${settings.riskThreshold > 70 ? 'text-red-400' : settings.riskThreshold > 40 ? 'text-yellow-400' : 'text-emerald-400'}`}>{settings.riskThreshold}</span>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Notification Preferences</h2>
        <div className="space-y-3">
          {[
            { key: 'critical', label: 'Critical findings', color: 'text-red-400' },
            { key: 'high', label: 'High severity findings', color: 'text-orange-400' },
            { key: 'medium', label: 'Medium severity findings', color: 'text-yellow-400' },
            { key: 'low', label: 'Low severity findings', color: 'text-indigo-400' },
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between py-2 cursor-pointer">
              <span className={`text-sm ${item.color}`}>{item.label}</span>
              <button onClick={() => updateNotif(item.key, !settings.notifications[item.key])} className={`w-10 h-6 rounded-full transition-colors ${settings.notifications[item.key] ? 'bg-indigo-500' : 'bg-surface-3'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-1 ${settings.notifications[item.key] ? 'translate-x-4' : ''}`} />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Data Mode */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Data Mode</h2>
        <p className="text-gray-500 text-xs mb-3">Switch between live API data and reference data for testing</p>
        <div className="flex gap-2">
          {['live', 'demo'].map(mode => (
            <button key={mode} onClick={() => update('dataMode', mode)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${settings.dataMode === mode ? 'bg-indigo-500 text-white' : 'bg-surface-2 text-gray-400 hover:text-white'}`}>
              {mode === 'live' ? '🟢 Live' : '🔵 Demo'}
            </button>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Data Management</h2>
        <div className="flex gap-3">
          <button onClick={clearHistory} className="btn-danger text-sm">Clear Audit History</button>
          <button onClick={exportData} className="btn-secondary text-sm">Export Settings</button>
        </div>
      </div>
    </div>
  );
}
