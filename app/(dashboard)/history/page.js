'use client';

import { useState, useMemo } from 'react';
import { DEMO_AUDIT_HISTORY } from '@/lib/reference-data';

const BREADCRUMB = [
  { label: 'Dashboard', href: '/' },
  { label: 'Audit', href: null },
  { label: 'Audit History', href: null },
];

const CHAIN_BADGES = {
  ethereum: 'bg-indigo-500/15 text-indigo-400',
  bsc: 'bg-yellow-500/15 text-yellow-400',
  polygon: 'bg-purple-500/15 text-purple-400',
  arbitrum: 'bg-sky-500/15 text-sky-400',
};

const STATUS_BADGES = {
  completed: 'bg-emerald-500/15 text-emerald-400',
  failed: 'bg-red-500/15 text-red-400',
  in_progress: 'bg-indigo-500/15 text-indigo-400',
};

const RISK_COLORS = (score) => {
  if (score >= 70) return 'text-red-400';
  if (score >= 40) return 'text-orange-400';
  if (score >= 20) return 'text-yellow-400';
  return 'text-emerald-400';
};

function Breadcrumb() {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      {BREADCRUMB.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
          <span className={i === BREADCRUMB.length - 1 ? 'text-white' : 'text-gray-400 hover:text-gray-300 cursor-pointer'}>
            {item.label}
          </span>
        </span>
      ))}
    </div>
  );
}

function SeverityBreakdown({ audit }) {
  return (
    <div className="flex items-center gap-1">
      {audit.criticalCount > 0 && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">{audit.criticalCount}C</span>
      )}
      {audit.highCount > 0 && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400">{audit.highCount}H</span>
      )}
      {audit.mediumCount > 0 && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400">{audit.mediumCount}M</span>
      )}
      {audit.lowCount > 0 && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400">{audit.lowCount}L</span>
      )}
    </div>
  );
}

function ReportModal({ audit, onClose }) {
  if (!audit) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-1 border border-gray-600/10 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{audit.contractName}</h2>
            <p className="text-gray-500 text-xs font-mono mt-1">{audit.address}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="bg-surface-2 rounded-lg p-3 text-center">
            <p className={`text-2xl font-bold ${RISK_COLORS(audit.riskScore)}`}>{audit.riskScore}</p>
            <p className="text-[10px] text-gray-500 mt-1">Risk Score</p>
          </div>
          <div className="bg-surface-2 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{audit.vulnerabilitiesFound}</p>
            <p className="text-[10px] text-gray-500 mt-1">Findings</p>
          </div>
          <div className="bg-surface-2 rounded-lg p-3 text-center">
            <p className="text-sm font-bold text-white">{audit.duration}</p>
            <p className="text-[10px] text-gray-500 mt-1">Duration</p>
          </div>
          <div className="bg-surface-2 rounded-lg p-3 text-center">
            <p className="text-sm font-bold text-white capitalize">{audit.scanner}</p>
            <p className="text-[10px] text-gray-500 mt-1">Scanner</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-300 mb-2">Severity Breakdown</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Critical', count: audit.criticalCount, color: 'text-red-400 bg-red-500/10' },
              { label: 'High', count: audit.highCount, color: 'text-orange-400 bg-orange-500/10' },
              { label: 'Medium', count: audit.mediumCount, color: 'text-yellow-400 bg-yellow-500/10' },
              { label: 'Low', count: audit.lowCount, color: 'text-indigo-400 bg-indigo-500/10' },
            ].map((s) => (
              <div key={s.label} className={`rounded-lg p-3 text-center ${s.color}`}>
                <p className="text-xl font-bold">{s.count}</p>
                <p className="text-[10px] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Chain</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${CHAIN_BADGES[audit.chain] || 'bg-gray-500/15 text-gray-400'}`}>
              {audit.chain.charAt(0).toUpperCase() + audit.chain.slice(1)}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500">Audited</p>
            <p className="text-white text-sm">{new Date(audit.auditedAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${STATUS_BADGES[audit.status]}`}>
              {audit.status}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500">Audit ID</p>
            <p className="text-white text-sm font-mono">{audit.id}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button className="btn-primary btn-sm">Download Full Report (PDF)</button>
          <button className="btn-secondary btn-sm">Re-Scan Contract</button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedAudit, setSelectedAudit] = useState(null);

  const audits = DEMO_AUDIT_HISTORY;

  const filtered = useMemo(() => {
    let result = audits.filter((a) => {
      if (severityFilter !== 'all') {
        const hasMatch =
          (severityFilter === 'critical' && a.criticalCount > 0) ||
          (severityFilter === 'high' && a.highCount > 0) ||
          (severityFilter === 'medium' && a.mediumCount > 0) ||
          (severityFilter === 'low' && a.lowCount > 0);
        if (!hasMatch) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          a.address.toLowerCase().includes(q) ||
          a.contractName.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') cmp = new Date(a.auditedAt) - new Date(b.auditedAt);
      if (sortBy === 'risk') cmp = a.riskScore - b.riskScore;
      if (sortBy === 'findings') cmp = a.vulnerabilitiesFound - b.vulnerabilitiesFound;
      return sortOrder === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [audits, search, severityFilter, sortBy, sortOrder]);

  const toggleSortOrder = () => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));

  const exportCSV = () => {
    const headers = ['ID', 'Contract Name', 'Address', 'Chain', 'Risk Score', 'Findings', 'Critical', 'High', 'Medium', 'Low', 'Status', 'Duration', 'Scanner', 'Date'];
    const rows = filtered.map((a) => [
      a.id, a.contractName, a.address, a.chain, a.riskScore, a.vulnerabilitiesFound,
      a.criticalCount, a.highCount, a.mediumCount, a.lowCount, a.status, a.duration, a.scanner, a.auditedAt,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit History</h1>
          <p className="text-gray-500 text-sm mt-1">Previous audit reports, findings, and risk assessments</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary btn-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Audits', value: audits.length, color: 'text-white' },
          { label: 'Avg Risk Score', value: Math.round(audits.reduce((s, a) => s + a.riskScore, 0) / audits.length), color: 'text-orange-400' },
          { label: 'Total Findings', value: audits.reduce((s, a) => s + a.vulnerabilitiesFound, 0), color: 'text-yellow-400' },
          { label: 'Critical Issues', value: audits.reduce((s, a) => s + a.criticalCount, 0), color: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="card py-3 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by address, name, or audit ID..."
            className="input w-full pl-10 text-sm"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="input w-40 bg-white text-gray-900 text-sm"
        >
          <option value="all">All Severities</option>
          <option value="critical">Has Critical</option>
          <option value="high">Has High</option>
          <option value="medium">Has Medium</option>
          <option value="low">Has Low</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input w-36 bg-white text-gray-900 text-sm"
        >
          <option value="date">Sort by Date</option>
          <option value="risk">Sort by Risk</option>
          <option value="findings">Sort by Findings</option>
        </select>
        <button onClick={toggleSortOrder} className="btn-icon btn-secondary" title={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}>
          <svg className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-sm">No audit history found</p>
          <p className="text-gray-600 text-xs mt-1">
            {search || severityFilter !== 'all' ? 'Try adjusting your filters' : 'Completed audits will appear here'}
          </p>
          {(search || severityFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setSeverityFilter('all'); }}
              className="btn-secondary btn-sm mt-3"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Contract</th>
                <th>Address</th>
                <th>Chain</th>
                <th>Risk Score</th>
                <th>Findings</th>
                <th>Severity</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((audit) => (
                <tr key={audit.id} className="cursor-pointer" onClick={() => setSelectedAudit(audit)}>
                  <td>
                    <div>
                      <p className="text-white font-medium text-sm">{audit.contractName}</p>
                      <p className="text-gray-600 text-[11px] font-mono">{audit.id}</p>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-gray-400">{audit.address.slice(0, 8)}...{audit.address.slice(-6)}</span>
                  </td>
                  <td>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${CHAIN_BADGES[audit.chain] || 'bg-gray-500/15 text-gray-400'}`}>
                      {audit.chain.charAt(0).toUpperCase() + audit.chain.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`text-sm font-bold ${RISK_COLORS(audit.riskScore)}`}>{audit.riskScore}</span>
                    <span className="text-gray-600 text-xs"> / 100</span>
                  </td>
                  <td>
                    <span className="text-white text-sm">{audit.vulnerabilitiesFound}</span>
                  </td>
                  <td>
                    <SeverityBreakdown audit={audit} />
                  </td>
                  <td>
                    <p className="text-gray-400 text-xs">{new Date(audit.auditedAt).toLocaleDateString()}</p>
                    <p className="text-gray-600 text-[10px]">{new Date(audit.auditedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedAudit(audit); }}
                        className="btn-ghost btn-sm"
                        title="View Report"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination footer */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Showing {filtered.length} of {audits.length} audits</span>
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      )}

      {/* Report Modal */}
      {selectedAudit && <ReportModal audit={selectedAudit} onClose={() => setSelectedAudit(null)} />}
    </div>
  );
}
