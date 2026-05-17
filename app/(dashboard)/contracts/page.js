'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export default function ContractsPage() {
  const { data, error, isLoading } = useSWR('/api/contracts', fetcher);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Contract Registry</h1>
        <p className="text-gray-500 mt-1">Audited contracts across all chains</p>
      </div>

      {isLoading && (
        <div className="card flex items-center justify-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {data?.contracts?.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No contracts audited yet</p>
          <p className="text-gray-600 text-sm mt-1">Run your first audit to see contracts here</p>
        </div>
      )}

      {data?.contracts?.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3 text-left">Contract</th>
                <th className="px-4 py-3 text-left">Chain</th>
                <th className="px-4 py-3 text-left">Risk Score</th>
                <th className="px-4 py-3 text-left">Audits</th>
                <th className="px-4 py-3 text-left">Last Audit</th>
              </tr>
            </thead>
            <tbody>
              {data.contracts.map((contract) => (
                <tr key={`${contract.chainId}_${contract.address}`} className="table-row">
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{contract.contractName}</p>
                    <p className="text-gray-500 text-xs font-mono">{contract.address.slice(0, 10)}...</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{contract.chainName}</td>
                  <td className="px-4 py-3">
                    <RiskBadge score={contract.riskScore} label={contract.riskLabel} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{contract.auditCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(contract.lastAudit).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RiskBadge({ score, label }) {
  const colors = {
    CRITICAL: 'badge-critical',
    HIGH: 'badge-high',
    MEDIUM: 'badge-medium',
    LOW: 'badge-low',
    INFORMATIONAL: 'badge bg-gray-500/15 text-gray-400',
  };

  return (
    <span className={colors[label] || 'badge'}>
      {score} — {label}
    </span>
  );
}
