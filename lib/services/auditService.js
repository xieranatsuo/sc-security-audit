/**
 * Audit service — contract audit, batch scanning, history, and statistics.
 * Attempts live API calls first; falls back to deterministic demonstration data on failure.
 */

import {
  DEMO_CONTRACTS,
  DEMO_AUDIT_HISTORY,
  DEMO_VULNERABILITIES,
  deterministicScore,
  deterministicIndex,
  deterministicDate,
} from '@/lib/mock-data';

// ── Live API Helpers ───────────────────────────────────────────

async function fetchLiveAudit(address, chain) {
  const res = await fetch(`/api/audit/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, chain }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function fetchLiveBatchScan(addresses, chain) {
  const res = await fetch(`/api/audit/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addresses, chain }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function fetchLiveHistory(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/audit/history${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function fetchLiveStats() {
  const res = await fetch(`/api/audit/stats`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// ── Deterministic Fallback Builders ────────────────────────────

function buildAuditResult(address, chain) {
  const score = deterministicScore(address);
  const contractMeta = DEMO_CONTRACTS.find(
    (c) => c.address.toLowerCase() === address.toLowerCase()
  );
  const numVulns = deterministicIndex(address, 3, 7) + 1;
  const vulns = DEMO_VULNERABILITIES.slice(0, numVulns).map((v, i) => ({
    ...v,
    location: `contracts/${contractMeta?.name?.replace(/\s+/g, '') || 'Contract'}.sol:${42 + i * 17}`,
    confidence: ['Confirmed', 'High', 'Medium', 'Low'][deterministicIndex(address, i, 4)],
  }));

  const criticalCount = vulns.filter((v) => v.severity === 'Critical').length;
  const highCount = vulns.filter((v) => v.severity === 'High').length;
  const mediumCount = vulns.filter((v) => v.severity === 'Medium').length;
  const lowCount = vulns.filter((v) => v.severity === 'Low').length;

  return {
    address,
    chain: chain || 'ethereum',
    contractName: contractMeta?.name || 'Unknown Contract',
    riskScore: score,
    status: 'completed',
    vulnerabilities: vulns,
    summary: {
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
      total: vulns.length,
    },
    auditedAt: deterministicDate(address),
    duration: `${deterministicIndex(address, 7, 8) + 1}m ${deterministicIndex(address, 13, 60)}s`,
    scanner: 'hybrid',
  };
}

function buildBatchResult(addresses, chain) {
  return {
    results: addresses.map((addr) => buildAuditResult(addr, chain)),
    totalContracts: addresses.length,
    completedAt: new Date().toISOString(),
  };
}

function buildHistory(params = {}) {
  let items = [...DEMO_AUDIT_HISTORY];
  if (params.status) items = items.filter((i) => i.status === params.status);
  return {
    items,
    total: items.length,
    page: parseInt(params.page) || 1,
    pageSize: parseInt(params.pageSize) || 20,
  };
}

function buildStats() {
  const totalAudits = DEMO_AUDIT_HISTORY.length;
  const completed = DEMO_AUDIT_HISTORY.filter((h) => h.status === 'completed').length;
  const avgRisk =
    DEMO_AUDIT_HISTORY.reduce((s, h) => s + h.riskScore, 0) / (totalAudits || 1);
  const totalVulns = DEMO_AUDIT_HISTORY.reduce((s, h) => s + h.vulnerabilitiesFound, 0);

  return {
    totalAudits,
    completedAudits: completed,
    failedAudits: totalAudits - completed,
    averageRiskScore: Math.round(avgRisk * 10) / 10,
    totalVulnerabilitiesFound: totalVulns,
    vulnBreakdown: {
      critical: DEMO_AUDIT_HISTORY.reduce((s, h) => s + h.criticalCount, 0),
      high: DEMO_AUDIT_HISTORY.reduce((s, h) => s + h.highCount, 0),
      medium: DEMO_AUDIT_HISTORY.reduce((s, h) => s + h.mediumCount, 0),
      low: DEMO_AUDIT_HISTORY.reduce((s, h) => s + h.lowCount, 0),
    },
    topVulnerabilities: DEMO_VULNERABILITIES.slice(0, 5).map((v) => ({
      id: v.id,
      name: v.name,
      severity: v.severity,
      count: v.count,
    })),
  };
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Scan a single contract address.
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function auditContract(address, chain = 'ethereum') {
  try {
    const res = await fetchLiveAudit(address, chain);
    return { data: res.data || res, error: null, source: 'live' };
  } catch (err) {
    return { data: buildAuditResult(address, chain), error: null, source: 'demo' };
  }
}

/**
 * Batch scan multiple contract addresses.
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function batchScan(addresses, chain = 'ethereum') {
  try {
    const res = await fetchLiveBatchScan(addresses, chain);
    return { data: res.data || res, error: null, source: 'live' };
  } catch (err) {
    return { data: buildBatchResult(addresses, chain), error: null, source: 'demo' };
  }
}

/**
 * Fetch audit history with optional filters.
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function getAuditHistory(params = {}) {
  try {
    const res = await fetchLiveHistory(params);
    return { data: res.data || res, error: null, source: 'live' };
  } catch (err) {
    return { data: buildHistory(params), error: null, source: 'demo' };
  }
}

/**
 * Fetch aggregate audit statistics.
 * @returns {{ data: object, error: string|null, source: 'live'|'demo' }}
 */
export async function getAuditStats() {
  try {
    const res = await fetchLiveStats();
    return { data: res.data || res, error: null, source: 'live' };
  } catch (err) {
    return { data: buildStats(), error: null, source: 'demo' };
  }
}
