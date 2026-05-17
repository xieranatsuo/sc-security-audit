'use client';

import { useState } from 'react';

export function FindingsList({ findings }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');

  const filteredFindings = filter === 'all'
    ? findings
    : findings.filter(f => f.severity === filter);

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, informational: 4 };
  const sortedFindings = [...filteredFindings].sort(
    (a, b) => (severityOrder[a.severity] || 5) - (severityOrder[b.severity] || 5)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Findings ({filteredFindings.length})
        </h3>
        <div className="flex gap-2">
          {['all', 'critical', 'high', 'medium', 'low', 'informational'].map((severity) => (
            <button
              key={severity}
              onClick={() => setFilter(severity)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === severity
                  ? 'bg-accent-blue text-white'
                  : 'bg-surface-2 text-gray-400 hover:text-white'
              }`}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {sortedFindings.map((finding) => (
          <FindingCard
            key={finding.id}
            finding={finding}
            isExpanded={expandedId === finding.id}
            onToggle={() => setExpandedId(expandedId === finding.id ? null : finding.id)}
          />
        ))}
      </div>
    </div>
  );
}

function FindingCard({ finding, isExpanded, onToggle }) {
  const severityBadge = {
    critical: 'badge-critical',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
    informational: 'badge bg-gray-500/15 text-gray-400 border border-gray-500/20',
  };

  return (
    <div className="card-hover cursor-pointer" onClick={onToggle}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className={severityBadge[finding.severity] || 'badge'}>
              {finding.severity.toUpperCase()}
            </span>
            <span className="text-white font-medium">{finding.title}</span>
            <span className="text-gray-500 text-xs font-mono">{finding.score}/10</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">{finding.description}</p>
        </div>
        <span className="text-gray-500 ml-4">{isExpanded ? '▲' : '▼'}</span>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-600/10 space-y-3 animate-fade-in">
          {finding.location && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="text-sm text-white font-mono">{finding.location}</p>
            </div>
          )}

          {finding.codeSnippet && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Code</p>
              <pre className="bg-surface-0 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
                {finding.codeSnippet}
              </pre>
            </div>
          )}

          {finding.recommendation && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Recommendation</p>
              <p className="text-sm text-gray-300">{finding.recommendation}</p>
            </div>
          )}

          {finding.cweId && (
            <div>
              <p className="text-xs text-gray-500 mb-1">CWE Reference</p>
              <a
                href={`https://cwe.mitre.org/data/definitions/${finding.cweId.replace('CWE-', '')}.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-blue text-sm hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {finding.cweId}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
