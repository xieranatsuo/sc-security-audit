'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export default function RiskDashboardPage() {
  const { data, isLoading } = useSWR('/api/risk/dashboard', fetcher);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Risk Dashboard</h1>
        <p className="text-gray-500 mt-1">Aggregated risk analysis across all audited contracts</p>
      </div>

      {isLoading && (
        <div className="card flex items-center justify-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <p className="stat-value">{data?.overview?.totalAudits ?? 0}</p>
          <p className="stat-label">Total Audits</p>
        </div>
        <div className="card">
          <p className="stat-value">{data?.overview?.avgRiskScore?.toFixed(1) ?? '0.0'}</p>
          <p className="stat-label">Avg Risk Score</p>
        </div>
        <div className="card">
          <p className="stat-value text-red-400">{data?.overview?.criticalFindings ?? 0}</p>
          <p className="stat-label">Critical Findings</p>
        </div>
        <div className="card">
          <p className="stat-value text-orange-400">{data?.overview?.highFindings ?? 0}</p>
          <p className="stat-label">High Findings</p>
        </div>
      </div>

      {/* By Chain */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Risk by Chain</h2>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(data?.byChain || {}).map(([chain, info]) => (
            <div key={chain} className="bg-surface-2 rounded-lg p-4">
              <p className="text-white font-medium capitalize">{chain}</p>
              <p className="text-gray-500 text-sm mt-1">{info.audits} audits</p>
              <p className="text-2xl font-bold text-white mt-2">{info.avgRisk.toFixed(1)}</p>
              <p className="text-xs text-gray-500">avg risk</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Vulnerabilities */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Top Vulnerability Categories</h2>
        {data?.topVulnerabilities?.length === 0 && (
          <p className="text-gray-500 text-center py-4">No vulnerability data yet</p>
        )}
      </div>
    </div>
  );
}
