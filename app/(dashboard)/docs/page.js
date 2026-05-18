'use client';

export default function DocsPage() {
  const endpoints = [
    { method: 'POST', path: '/api/audit/contract', desc: 'Audit a smart contract by address and chain' },
    { method: 'POST', path: '/api/audit/risk-score', desc: 'Calculate risk score for vulnerability findings' },
    { method: 'GET', path: '/api/audit/full-report', desc: 'Generate full audit report' },
    { method: 'GET', path: '/api/audit/history', desc: 'Get audit history with pagination' },
    { method: 'GET', path: '/api/audit/stats', desc: 'Get aggregated audit statistics' },
    { method: 'GET', path: '/api/contracts', desc: 'List audited contracts' },
    { method: 'POST', path: '/api/contracts', desc: 'Register a contract' },
    { method: 'GET', path: '/api/contracts/[chain]', desc: 'Get contracts by chain' },
    { method: 'GET', path: '/api/contracts/search', desc: 'Search contracts' },
    { method: 'GET', path: '/api/monitor/alerts', desc: 'Get monitoring alerts' },
    { method: 'GET', path: '/api/monitor/[address]', desc: 'Get monitor status for address' },
    { method: 'GET', path: '/api/market/data', desc: 'Get token market data from Binance' },
    { method: 'GET', path: '/api/risk/dashboard', desc: 'Get risk dashboard data' },
    { method: 'GET', path: '/api/explorer/[chain]/[address]', desc: 'Block explorer lookup' },
    { method: 'POST', path: '/api/auth/register', desc: 'Register a new user' },
    { method: 'GET', path: '/api/health', desc: 'Health check' },
    { method: 'GET', path: '/api/scanner/status', desc: 'Scanner status' },
  ];

  const methodColor = { GET: 'bg-emerald-500/15 text-emerald-400', POST: 'bg-blue-500/15 text-blue-400', PUT: 'bg-orange-500/15 text-orange-400', DELETE: 'bg-red-500/15 text-red-400' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">API Documentation</h1>
        <p className="text-gray-500 text-sm mt-1">REST API with envelope response format · v1.0.0</p>
      </div>

      {/* Envelope Format */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-3">Success Response</h3>
          <pre className="bg-surface-0 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto font-mono">{`{
  "data": { ... },
  "meta": {
    "timestamp": "2026-05-18T00:00:00Z",
    "version": "1.0.0",
    "requestId": "req_abc123"
  }
}`}</pre>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-3">Error Response</h3>
          <pre className="bg-surface-0 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto font-mono">{`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid address format",
    "details": null
  },
  "meta": { ... }
}`}</pre>
        </div>
      </div>

      {/* Risk Formula */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-3">Risk Scoring Formula</h3>
        <div className="bg-surface-0 rounded-lg p-4 font-mono text-sm text-blue-400 mb-3">
          RiskScore = 100 × (w₁·S + w₂·E + w₃·A + w₄·I + w₅·D)
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[
            { name: 'Severity (w₁)', value: '0.30' },
            { name: 'Exploitability (w₂)', value: '0.25' },
            { name: 'Attack Complexity (w₃)', value: '0.20' },
            { name: 'Impact (w₄)', value: '0.15' },
            { name: 'Detection Difficulty (w₅)', value: '0.10' },
          ].map((w) => (
            <div key={w.name} className="text-center p-2 rounded bg-surface-2">
              <p className="text-xs text-gray-500">{w.name}</p>
              <p className="text-lg font-bold text-white">{w.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Endpoints */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Endpoints ({endpoints.length})</h3>
        <div className="space-y-1">
          {endpoints.map((ep) => (
            <div key={ep.path} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer">
              <span className={`${methodColor[ep.method]} text-[10px] font-bold px-2 py-0.5 rounded w-14 text-center`}>{ep.method}</span>
              <span className="font-mono text-sm text-gray-300">{ep.path}</span>
              <span className="text-gray-500 text-xs ml-auto">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
