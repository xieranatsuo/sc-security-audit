'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export default function MonitorPage() {
  const { data: alerts } = useSWR('/api/monitor/alerts', fetcher);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Contract Monitor</h1>
        <p className="text-gray-500 mt-1">Real-time alerts for monitored contracts</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="stat-value">0</p>
          <p className="stat-label">Monitored Contracts</p>
        </div>
        <div className="card">
          <p className="stat-value">0</p>
          <p className="stat-label">Active Alerts</p>
        </div>
        <div className="card">
          <p className="stat-value">0</p>
          <p className="stat-label">Alerts Today</p>
        </div>
      </div>

      <div className="card text-center py-12">
        <p className="text-gray-500">No alerts to display</p>
        <p className="text-gray-600 text-sm mt-1">
          Alerts will appear here when monitored contracts have significant events
        </p>
      </div>
    </div>
  );
}
