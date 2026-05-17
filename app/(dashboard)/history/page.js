'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export default function HistoryPage() {
  const { data, isLoading } = useSWR('/api/audit/history', fetcher);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit History</h1>
        <p className="text-gray-500 mt-1">Previous audit reports and findings</p>
      </div>

      {isLoading && (
        <div className="card flex items-center justify-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {data?.audits?.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No audit history</p>
          <p className="text-gray-600 text-sm mt-1">Completed audits will appear here</p>
        </div>
      )}

      {data?.audits?.length > 0 && (
        <div className="space-y-2">
          {data.audits.map((audit) => (
            <div key={audit.auditId} className="card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{audit.contractName}</p>
                  <p className="text-gray-500 text-sm font-mono">{audit.contractAddress}</p>
                </div>
                <div className="text-right">
                  <p className="text-white">{audit.riskScore}</p>
                  <p className="text-gray-500 text-sm">{new Date(audit.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
