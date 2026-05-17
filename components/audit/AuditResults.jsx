'use client';

import { RiskScoreCard } from '@/components/audit/RiskScoreCard';
import { FindingsList } from '@/components/audit/FindingsList';

export function AuditResults({ result }) {
  if (!result) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Contract Info */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{result.contractName}</h3>
            <p className="text-gray-500 text-sm font-mono mt-1">{result.contractAddress}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <span>Chain: {result.chainName}</span>
              <span>Compiler: {result.compilerVersion}</span>
              {result.metadata?.isProxy && (
                <span className="badge-high">Proxy Contract</span>
              )}
            </div>
          </div>
          <span className="text-gray-500 text-xs font-mono">{result.auditId}</span>
        </div>
      </div>

      {/* Risk Score */}
      {result.riskScore && (
        <RiskScoreCard riskScore={result.riskScore} />
      )}

      {/* Summary */}
      {result.summary && (
        <div className="grid grid-cols-5 gap-4">
          <SummaryCard label="Critical" count={result.summary.bySeverity.critical} color="red" />
          <SummaryCard label="High" count={result.summary.bySeverity.high} color="orange" />
          <SummaryCard label="Medium" count={result.summary.bySeverity.medium} color="yellow" />
          <SummaryCard label="Low" count={result.summary.bySeverity.low} color="green" />
          <SummaryCard label="Info" count={result.summary.bySeverity.informational} color="gray" />
        </div>
      )}

      {/* Findings */}
      {result.findings && result.findings.length > 0 && (
        <FindingsList findings={result.findings} />
      )}

      {/* No Findings */}
      {result.findings && result.findings.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-accent-green text-lg font-semibold">No vulnerabilities detected</p>
          <p className="text-gray-500 text-sm mt-1">
            The automated scan did not find any known vulnerability patterns.
            This does not guarantee the contract is secure — always perform manual review.
          </p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, count, color }) {
  const colorMap = {
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    gray: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  };

  return (
    <div className={`rounded-lg border p-4 text-center ${colorMap[color]}`}>
      <p className="text-2xl font-bold text-white">{count}</p>
      <p className="text-xs mt-1">{label}</p>
    </div>
  );
}
