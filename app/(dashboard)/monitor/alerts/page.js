'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ALERT_RULES_KEY = 'alert_rules';

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-blue-500/15 text-blue-400' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/15 text-yellow-400' },
  { value: 'high', label: 'High', color: 'bg-orange-500/15 text-orange-400' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500/15 text-red-400' },
];

const CONDITION_TYPES = [
  { value: 'risk_score_above', label: 'Risk score above threshold', needsThreshold: true, thresholdLabel: 'Risk Score', thresholdPlaceholder: 'e.g. 70' },
  { value: 'proxy_implementation_change', label: 'Proxy implementation changes', needsThreshold: false },
  { value: 'admin_change', label: 'Admin/ownership changes', needsThreshold: false },
  { value: 'large_transfer', label: 'Large transfer above threshold', needsThreshold: true, thresholdLabel: 'Amount (ETH)', thresholdPlaceholder: 'e.g. 100' },
  { value: 'critical_finding', label: 'New critical finding detected', needsThreshold: false },
];

const DEFAULT_RULES = [
  { id: 'rule-1', condition: 'risk_score_above', threshold: '70', severity: 'critical', enabled: true, label: 'High Risk Alert' },
  { id: 'rule-2', condition: 'proxy_implementation_change', threshold: '', severity: 'high', enabled: true, label: 'Proxy Upgrade Alert' },
  { id: 'rule-3', condition: 'admin_change', threshold: '', severity: 'high', enabled: true, label: 'Admin Change Alert' },
  { id: 'rule-4', condition: 'large_transfer', threshold: '100', severity: 'medium', enabled: false, label: 'Large Transfer Alert' },
  { id: 'rule-5', condition: 'critical_finding', threshold: '', severity: 'critical', enabled: true, label: 'Critical Finding Alert' },
];

function loadRules() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(ALERT_RULES_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveRules(rules) {
  try {
    localStorage.setItem(ALERT_RULES_KEY, JSON.stringify(rules));
  } catch {}
}

function getConditionLabel(condition) {
  const found = CONDITION_TYPES.find(c => c.value === condition);
  return found ? found.label : condition;
}

function getSeverityColor(severity) {
  const found = SEVERITY_OPTIONS.find(s => s.value === severity);
  return found ? found.color : 'bg-gray-500/15 text-gray-400';
}

export default function AlertRulesPage() {
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    label: '',
    condition: CONDITION_TYPES[0].value,
    threshold: '',
    severity: 'medium',
  });

  useEffect(() => {
    const stored = loadRules();
    setRules(stored || DEFAULT_RULES);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && rules.length > 0) {
      saveRules(rules);
    }
  }, [rules, mounted]);

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteRule = (id) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const addRule = () => {
    if (!form.label.trim()) return;
    const cond = CONDITION_TYPES.find(c => c.value === form.condition);
    const newRule = {
      id: `rule-${Date.now()}`,
      condition: form.condition,
      threshold: cond?.needsThreshold ? form.threshold : '',
      severity: form.severity,
      enabled: true,
      label: form.label.trim(),
    };
    setRules(prev => [...prev, newRule]);
    setForm({ label: '', condition: CONDITION_TYPES[0].value, threshold: '', severity: 'medium' });
    setShowForm(false);
  };

  const selectedCondition = CONDITION_TYPES.find(c => c.value === form.condition);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="card text-center py-16">
          <p className="text-gray-500">Loading alert rules...</p>
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
        <span className="text-gray-300">Alert Rules</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Alert Rules</h1>
          <p className="text-gray-500 text-sm mt-1">
            {rules.filter(r => r.enabled).length} active rules · {rules.length} total
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm text-xs flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Rule
        </button>
      </div>

      {/* New Rule Form */}
      {showForm && (
        <div className="card border-accent/30">
          <h3 className="text-sm font-semibold text-white mb-4">Create Alert Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1.5">Rule Name</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Critical Risk Monitor"
                className="input text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1.5">Condition</label>
              <select
                value={form.condition}
                onChange={(e) => setForm(f => ({ ...f, condition: e.target.value, threshold: '' }))}
                className="input text-sm"
              >
                {CONDITION_TYPES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            {selectedCondition?.needsThreshold && (
              <div>
                <label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1.5">
                  {selectedCondition.thresholdLabel}
                </label>
                <input
                  type="number"
                  value={form.threshold}
                  onChange={(e) => setForm(f => ({ ...f, threshold: e.target.value }))}
                  placeholder={selectedCondition.thresholdPlaceholder}
                  className="input text-sm"
                />
              </div>
            )}
            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wider block mb-1.5">Severity</label>
              <div className="flex gap-2">
                {SEVERITY_OPTIONS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setForm(f => ({ ...f, severity: s.value }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.severity === s.value ? s.color + ' ring-1 ring-current' : 'bg-surface-2 text-gray-400'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addRule} className="btn btn-primary btn-sm text-xs" disabled={!form.label.trim()}>
              Create Rule
            </button>
            <button onClick={() => setShowForm(false)} className="btn btn-secondary btn-sm text-xs">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="card text-center py-16">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <p className="text-gray-400 text-sm font-medium">No alert rules configured</p>
          <p className="text-gray-600 text-xs mt-1">Create your first rule to start receiving security alerts</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm text-xs mt-4 inline-flex">
            Create First Rule
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className={`card flex items-center gap-4 ${!rule.enabled ? 'opacity-50' : ''}`}>
              {/* Toggle */}
              <button
                onClick={() => toggleRule(rule.id)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors ${rule.enabled ? 'bg-blue-500' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${rule.enabled ? 'left-[18px]' : 'left-0.5'}`} />
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-medium">{rule.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${getSeverityColor(rule.severity)}`}>
                    {rule.severity}
                  </span>
                </div>
                <p className="text-gray-500 text-xs">
                  {getConditionLabel(rule.condition)}
                  {rule.threshold && ` — threshold: ${rule.threshold}`}
                </p>
              </div>

              {/* Status */}
              <span className={`text-xs font-medium ${rule.enabled ? 'text-emerald-400' : 'text-gray-500'}`}>
                {rule.enabled ? 'Active' : 'Paused'}
              </span>

              {/* Delete */}
              <button
                onClick={() => deleteRule(rule.id)}
                className="text-gray-600 hover:text-red-400 transition-colors p-1"
                title="Delete rule"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
