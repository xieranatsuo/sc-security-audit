'use client';

import { useState } from 'react';
import { AuditForm } from '@/components/audit/AuditForm';
import { AuditResults } from '@/components/audit/AuditResults';
import { StatsOverview } from '@/components/audit/StatsOverview';

export default function AuditPage() {
  const [auditResult, setAuditResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Smart Contract</h1>
        <p className="text-gray-500 mt-1">
          Analyze smart contracts for security vulnerabilities across Ethereum, BSC, Polygon, and Arbitrum
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Audit Form */}
      <AuditForm
        onResult={setAuditResult}
        onLoading={setIsLoading}
      />

      {/* Results */}
      {isLoading && (
        <div className="card flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Analyzing contract...</p>
            <p className="text-gray-500 text-sm mt-1">Fetching source code from Etherscan V2</p>
          </div>
        </div>
      )}

      {auditResult && !isLoading && (
        <AuditResults result={auditResult} />
      )}
    </div>
  );
}
