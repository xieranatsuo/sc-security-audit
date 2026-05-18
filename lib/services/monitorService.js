/**
 * Monitor service — live monitoring, alerts, and transaction tracking.
 * Attempts live API calls first; falls back to deterministic demonstration data on failure.
 */

import {
  DEMO_ALERTS,
  DEMO_TRANSACTIONS,
  DEMO_CONTRACTS,
  deterministicIndex,
  deterministicDate,
  deterministicScore,
} from '@/lib/reference-data';

// ── Live API Helpers ───────────────────────────────────────────

async function fetchLiveAlerts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/monitor/alerts${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function fetchLiveTransactions(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/monitor/transactions${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function fetchLiveMonitorStatus() {
  const res = await fetch('/api/monitor/status');
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function fetchLiveAlertRules() {
  const res = await fetch('/api/monitor/rules');
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function postLiveAlertRule(rule) {
  const res = await fetch('/api/monitor/rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// ── Deterministic Fallback Builders ────────────────────────────

function buildAlerts(params = {}) {
  let alerts = [...DEMO_ALERTS];
  if (params.type) alerts = alerts.filter((a) => a.type === params.type);
  if (params.read !== undefined) alerts = alerts.filter((a) => a.read === (params.read === 'true'));
  return {
    items: alerts,
    total: alerts.length,
    unread: DEMO_ALERTS.filter((a) => !a.read).length,
  };
}

function buildTransactions(params = {}) {
  let txs = [...DEMO_TRANSACTIONS];
  if (params.chain) txs = txs.filter((t) => t.chain === params.chain);
  if (params.status) txs = txs.filter((t) => t.status === params.status);
  return {
    items: txs,
    total: txs.length,
    successCount: txs.filter((t) => t.status === 'success').length,
    failedCount: txs.filter((t) => t.status === 'reverted').length,
  };
}

function buildMonitorStatus() {
  return {
    activeMonitors: 89,
    monitoredContracts: DEMO_CONTRACTS.length,
    alertsLast24h: DEMO_ALERTS.length,
    uptime: '99.97%',
    lastCheck: new Date().toISOString(),
    chains: {
      ethereum: { status: 'connected', blockNumber: 19523481, latency: '42ms' },
      bsc: { status: 'connected', blockNumber: 38192834, latency: '38ms' },
      polygon: { status: 'connected', blockNumber: 55421987, latency: '55ms' },
      arbitrum: { status: 'connected', blockNumber: 210834719, latency: '31ms' },
    },
    recentActivity: DEMO_ALERTS.slice(0, 3).map((a) => ({
      type: a.type,
      message: a.title,
      timestamp: a.timestamp,
    })),
  };
}

function buildAlertRules() {
  return [
    { id: 'rule-001', name: 'Large Transfer Alert', condition: 'transfer > 1000000 USDC', severity: 'critical', enabled: true, chain: 'ethereum', contract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    { id: 'rule-002', name: 'Unusual Gas Spike', condition: 'gas > 3x avg(24h)', severity: 'warning', enabled: true, chain: 'all', contract: null },
    { id: 'rule-003', name: 'Admin Function Call', condition: 'function in (setFeeTo, pause, unpause, upgradeTo)', severity: 'info', enabled: true, chain: 'all', contract: null },
    { id: 'rule-004', name: 'Oracle Price Deviation', condition: 'price_deviation > 5%', severity: 'warning', enabled: true, chain: 'ethereum', contract: null },
    { id: 'rule-005', name: 'Contract Self-Destruct', condition: 'function == selfdestruct', severity: 'critical', enabled: true, chain: 'all', contract: null },
    { id: 'rule-006', name: 'New Proxy Deployment', condition: 'event == Upgraded(address)', severity: 'info', enabled: false, chain: 'all', contract: null },
  ];
}

function buildAlertRuleResult(rule) {
  return {
    id: 'rule-' + String(Date.now()).slice(-6),
    ...rule,
    createdAt: new Date().toISOString(),
    triggeredCount: 0,
  };
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Fetch alerts with optional filters.
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function getAlerts(params = {}) {
  try {
    const res = await fetchLiveAlerts(params);
    return { data: res.data || res, error: null, source: 'live' };
  } catch {
    return { data: buildAlerts(params), error: null, source: 'demo' };
  }
}

/**
 * Fetch recent transactions with optional filters.
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function getTransactions(params = {}) {
  try {
    const res = await fetchLiveTransactions(params);
    return { data: res.data || res, error: null, source: 'live' };
  } catch {
    return { data: buildTransactions(params), error: null, source: 'demo' };
  }
}

/**
 * Fetch monitoring status (chain connections, active monitors).
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function getMonitorStatus() {
  try {
    const res = await fetchLiveMonitorStatus();
    return { data: res.data || res, error: null, source: 'live' };
  } catch {
    return { data: buildMonitorStatus(), error: null, source: 'demo' };
  }
}

/**
 * Fetch configured alert rules.
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function getAlertRules() {
  try {
    const res = await fetchLiveAlertRules();
    return { data: res.data || res, error: null, source: 'live' };
  } catch {
    return { data: { rules: buildAlertRules() }, error: null, source: 'demo' };
  }
}

/**
 * Create a new alert rule.
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function createAlertRule(rule) {
  try {
    const res = await postLiveAlertRule(rule);
    return { data: res.data || res, error: null, source: 'live' };
  } catch {
    return { data: buildAlertRuleResult(rule), error: null, source: 'demo' };
  }
}
