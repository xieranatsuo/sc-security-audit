'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export function StatsOverview() {
  const { data: stats } = useSWR('/api/audit/stats', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const items = [
    { label: 'Total Audits', value: stats?.totalAudits ?? 0 },
    { label: 'Contracts Scanned', value: stats?.totalContracts ?? 0 },
    { label: 'Findings Detected', value: stats?.totalFindings ?? 0 },
    { label: 'Avg Risk Score', value: stats?.avgRiskScore?.toFixed(1) ?? '0.0' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="card">
          <p className="stat-value">{item.value}</p>
          <p className="stat-label">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
