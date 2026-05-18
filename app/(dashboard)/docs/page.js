'use client';

import { useState } from 'react';

const BREADCRUMB = [
  { label: 'Dashboard', href: '/' },
  { label: 'Developer', href: null },
  { label: 'API Docs', href: null },
];

const SECTIONS = ['Authentication', 'Rate Limits', 'Endpoints'];

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/audit/contract',
    label: 'Live',
    title: 'Scan Contract',
    description: 'Submit a smart contract address and chain for automated security scanning. Returns vulnerability findings, risk score, and detailed analysis.',
    requestBody: {
      address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      chain: 'ethereum',
      scanner: 'hybrid',
      depth: 'full',
    },
    response: {
      data: { data: {
        auditId: 'AUD-2026-042',
        contractName: 'Uniswap V3 Router',
        riskScore: 22,
        findings: [
          { id: 'V001', severity: 'high', title: 'Unchecked External Call', line: 142 },
          { id: 'V009', severity: 'medium', title: 'Front-Running / MEV', line: 87 },
        ],
        scannedAt: '2026-05-18T14:30:00Z',
        duration: '4m 12s',
      }, status: 'live', provider: 'etherscan-v2 + publicnode', lastUpdated: '2026-05-18T14:30:00Z', error: null },
    },
    errorResponse: {
      data: null, status: 'error', provider: 'etherscan-v2 + publicnode', lastUpdated: '2026-05-18T14:30:00Z', error: 'Contract address must be a valid 0x-prefixed hex string',
    },
    curl: `curl -X POST https://api.smartaudit.dev/api/audit/contract \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "address": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    "chain": "ethereum",
    "scanner": "hybrid"
  }'`,
    javascript: `const response = await fetch('/api/audit/contract', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    address: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    chain: 'ethereum',
    scanner: 'hybrid',
  }),
});
const { data } = await response.json();
console.log(data.riskScore); // 22`,
    python: `import requests

resp = requests.post(
    'https://api.smartaudit.dev/api/audit/contract',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={
        'address': '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        'chain': 'ethereum',
        'scanner': 'hybrid',
    },
)
data = resp.json()['data']
print(f"Risk Score: {data['riskScore']}")`,
  },
  {
    method: 'GET',
    path: '/api/audit/history',
    label: 'Live',
    title: 'Get Audit History',
    description: 'Retrieve paginated audit history for the authenticated user. Supports filtering by severity and sorting by date or risk score.',
    requestBody: null,
    queryParams: [
      { name: 'page', type: 'integer', description: 'Page number (default: 1)' },
      { name: 'limit', type: 'integer', description: 'Items per page (default: 20, max: 100)' },
      { name: 'severity', type: 'string', description: 'Filter by severity: critical, high, medium, low' },
      { name: 'sort', type: 'string', description: 'Sort by: date, risk (default: date)' },
      { name: 'order', type: 'string', description: 'asc or desc (default: desc)' },
    ],
    response: {
      data: { data: {
        audits: [
          {
            auditId: 'AUD-2026-001',
            contractName: 'Uniswap V3 Router',
            address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
            chain: 'ethereum',
            riskScore: 22,
            vulnerabilitiesFound: 3,
            status: 'completed',
            auditedAt: '2026-05-15T14:23:00Z',
          },
        ],
        pagination: { page: 1, limit: 20, total: 42, totalPages: 3 },
      }, status: 'live', provider: 'internal', lastUpdated: '2026-05-18T14:30:00Z', error: null },
    },
    errorResponse: {
      data: null, status: 'error', provider: 'internal', lastUpdated: '2026-05-18T14:30:00Z', error: 'Valid authentication token required',
    },
    curl: `curl https://api.smartaudit.dev/api/audit/history?page=1&limit=20&sort=date&order=desc \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    javascript: `const response = await fetch(
  '/api/audit/history?page=1&limit=20&sort=date&order=desc',
  {
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  }
);
const { data } = await response.json();
console.log(data.audits.length, data.pagination.total);`,
    python: `import requests

resp = requests.get(
    'https://api.smartaudit.dev/api/audit/history',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    params={'page': 1, 'limit': 20, 'sort': 'date', 'order': 'desc'},
)
data = resp.json()['data']
for audit in data['audits']:
    print(f"{audit['contractName']} — Risk: {audit['riskScore']}")`,
  },
  {
    method: 'POST',
    path: '/api/audit/batch',
    label: 'Demo',
    title: 'Batch Scan',
    description: 'Submit multiple contract addresses for concurrent scanning. Returns a batch ID for tracking progress. Maximum 10 contracts per batch.',
    requestBody: {
      contracts: [
        { address: '0x1F98431c8aD98523631AE4a59f267346ea31F984', chain: 'ethereum' },
        { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', chain: 'ethereum' },
        { address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', chain: 'bsc' },
      ],
      scanner: 'hybrid',
      priority: 'normal',
    },
    response: {
      data: { data: {
        batchId: 'BAT-2026-017',
        contractsSubmitted: 3,
        status: 'queued',
        estimatedCompletion: '2026-05-18T14:45:00Z',
        results: null,
      }, status: 'live', provider: 'etherscan-v2 + publicnode', lastUpdated: '2026-05-18T14:30:00Z', error: null },
    },
    errorResponse: {
      data: null, status: 'error', provider: 'etherscan-v2 + publicnode', lastUpdated: '2026-05-18T14:30:00Z', error: 'Maximum 10 contracts per batch request',
    },
    curl: `curl -X POST https://api.smartaudit.dev/api/audit/batch \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contracts": [
      { "address": "0x1F98431c8aD98523631AE4a59f267346ea31F984", "chain": "ethereum" },
      { "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "chain": "ethereum" }
    ],
    "scanner": "hybrid"
  }'`,
    javascript: `const response = await fetch('/api/audit/batch', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contracts: [
      { address: '0x1F98431c8aD98523631AE4a59f267346ea31F984', chain: 'ethereum' },
      { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', chain: 'ethereum' },
    ],
    scanner: 'hybrid',
  }),
});
const { data } = await response.json();
console.log(data.batchId); // BAT-2026-017`,
    python: `import requests

resp = requests.post(
    'https://api.smartaudit.dev/api/audit/batch',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={
        'contracts': [
            {'address': '0x1F98431c8aD98523631AE4a59f267346ea31F984', 'chain': 'ethereum'},
            {'address': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 'chain': 'ethereum'},
        ],
        'scanner': 'hybrid',
    },
)
data = resp.json()['data']
print(f"Batch ID: {data['batchId']}, Status: {data['status']}")`,
  },
  {
    method: 'GET',
    path: '/api/vulnerabilities',
    label: 'Demo',
    title: 'List Vulnerabilities',
    description: 'Retrieve the full vulnerability database with detection rules, severity classifications, CWE/SWC mappings, and remediation guidance.',
    requestBody: null,
    queryParams: [
      { name: 'severity', type: 'string', description: 'Filter: critical, high, medium, low' },
      { name: 'category', type: 'string', description: 'Filter by category (e.g., Logic, Arithmetic, Proxy)' },
      { name: 'search', type: 'string', description: 'Search by name or CWE/SWC ID' },
    ],
    response: {
      data: { data: {
        vulnerabilities: [
          {
            id: 'reentrancy',
            name: 'Reentrancy',
            severity: 'Critical',
            category: 'Logic',
            cwe: 'CWE-841',
            swc: 'SWC-107',
            description: 'External calls before state updates allow recursive exploitation.',
            count: 847,
          },
        ],
        total: 18,
      }, status: 'live', provider: 'internal', lastUpdated: '2026-05-18T14:30:00Z', error: null },
    },
    errorResponse: {
      data: null, status: 'error', provider: 'internal', lastUpdated: '2026-05-18T14:30:00Z', error: 'Unknown severity level: extreme',
    },
    curl: `curl https://api.smartaudit.dev/api/vulnerabilities?severity=critical \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    javascript: `const response = await fetch('/api/vulnerabilities?severity=critical', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
});
const { data } = await response.json();
console.log(data.vulnerabilities.length, data.total);`,
    python: `import requests

resp = requests.get(
    'https://api.smartaudit.dev/api/vulnerabilities',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    params={'severity': 'critical'},
)
data = resp.json()['data']
for v in data['vulnerabilities']:
    print(f"{v['name']} ({v['swc']})")`,
  },
  {
    method: 'GET',
    path: '/api/contracts/:address',
    label: 'Demo',
    title: 'Get Contract Info',
    description: 'Retrieve detailed information about a deployed smart contract including verification status, compiler version, bytecode metadata, and audit history.',
    requestBody: null,
    response: {
      data: { data: {
        name: 'Uniswap V3 Router',
        address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        chain: 'ethereum',
        type: 'DEX',
        verified: true,
        compiler: 'v0.7.6',
        balance: '1,247.83 ETH',
        txCount: 2847193,
        tags: ['amm', 'dex', 'swap', 'liquidity'],
        lastAudit: { auditId: 'AUD-2026-001', riskScore: 22, auditedAt: '2026-05-15T14:23:00Z' },
      }, status: 'live', provider: 'etherscan-v2 + publicnode', lastUpdated: '2026-05-18T14:30:00Z', error: null },
    },
    errorResponse: {
      data: null, status: 'error', provider: 'etherscan-v2 + publicnode', lastUpdated: '2026-05-18T14:30:00Z', error: 'No contract found at the specified address on this chain',
    },
    curl: `curl https://api.smartaudit.dev/api/contracts/0xE592427A0AEce92De3Edee1F18E0157C05861564?chain=ethereum \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    javascript: `const address = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
const response = await fetch(
  \`/api/contracts/\${address}?chain=ethereum\`,
  { headers: { 'Authorization': 'Bearer YOUR_API_KEY' } }
);
const { data } = await response.json();
console.log(data.name, data.verified);`,
    python: `import requests

address = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
resp = requests.get(
    f'https://api.smartaudit.dev/api/contracts/{address}',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    params={'chain': 'ethereum'},
)
data = resp.json()['data']
print(f"{data['name']} — Verified: {data['verified']}")`,
  },
  {
    method: 'POST',
    path: '/api/monitor/alerts',
    label: 'Demo',
    title: 'Create Alert Rule',
    description: 'Create a monitoring alert rule for a contract. Triggers notifications when specified conditions are met (large transfers, admin calls, oracle deviations, etc.).',
    requestBody: {
      contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      chain: 'ethereum',
      name: 'Large Transfer Alert',
      conditions: {
        type: 'transfer',
        threshold: '1000000',
        token: 'USDC',
      },
      notify: ['email', 'webhook'],
      webhookUrl: 'https://hooks.example.com/audit-alerts',
    },
    response: {
      data: { data: {
        alertId: 'ALT-2026-023',
        name: 'Large Transfer Alert',
        contract: 'USDC',
        status: 'active',
        createdAt: '2026-05-18T14:30:00Z',
      }, status: 'live', provider: 'internal', lastUpdated: '2026-05-18T14:30:00Z', error: null },
    },
    errorResponse: {
      data: null, status: 'error', provider: 'internal', lastUpdated: '2026-05-18T14:30:00Z', error: 'Alert condition type must be one of: transfer, gas, admin, oracle',
    },
    curl: `curl -X POST https://api.smartaudit.dev/api/monitor/alerts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contractAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "chain": "ethereum",
    "name": "Large Transfer Alert",
    "conditions": {
      "type": "transfer",
      "threshold": "1000000",
      "token": "USDC"
    },
    "notify": ["email", "webhook"]
  }'`,
    javascript: `const response = await fetch('/api/monitor/alerts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chain: 'ethereum',
    name: 'Large Transfer Alert',
    conditions: { type: 'transfer', threshold: '1000000', token: 'USDC' },
    notify: ['email', 'webhook'],
  }),
});
const { data } = await response.json();
console.log(data.alertId, data.status);`,
    python: `import requests

resp = requests.post(
    'https://api.smartaudit.dev/api/monitor/alerts',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={
        'contractAddress': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        'chain': 'ethereum',
        'name': 'Large Transfer Alert',
        'conditions': {'type': 'transfer', 'threshold': '1000000', 'token': 'USDC'},
        'notify': ['email', 'webhook'],
    },
)
data = resp.json()['data']
print(f"Alert {data['alertId']} is {data['status']}")`,
  },
];

const METHOD_STYLES = {
  GET: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  POST: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  PUT: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  DELETE: 'bg-red-500/15 text-red-400 border-red-500/30',
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

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-2 border-b border-gray-600/10 rounded-t-lg">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="text-gray-500 hover:text-gray-300 transition-colors text-xs flex items-center gap-1"
        >
          {copied ? (
            <>
              <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="bg-surface-0 rounded-b-lg p-4 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">{code}</pre>
    </div>
  );
}

function EndpointCard({ endpoint }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('curl');

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 text-left"
      >
        <span className={`${METHOD_STYLES[endpoint.method]} text-[10px] font-bold px-2.5 py-1 rounded border w-16 text-center`}>
          {endpoint.method}
        </span>
        <span className="font-mono text-sm text-gray-300">{endpoint.path}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${endpoint.label === 'Live' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
          {endpoint.label}
        </span>
        <span className="text-gray-500 text-xs ml-auto">{endpoint.title}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-5 pt-5 border-t border-gray-600/10 space-y-5 animate-fade-in">
          <p className="text-gray-400 text-sm leading-relaxed">{endpoint.description}</p>

          {/* Request Body */}
          {endpoint.requestBody && (
            <div>
              <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Request Body
              </h4>
              <pre className="bg-surface-0 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto font-mono">{JSON.stringify(endpoint.requestBody, null, 2)}</pre>
            </div>
          )}

          {/* Query Params */}
          {endpoint.queryParams && (
            <div>
              <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Query Parameters
              </h4>
              <div className="bg-surface-0 rounded-lg p-4 space-y-2">
                {endpoint.queryParams.map((p) => (
                  <div key={p.name} className="flex items-start gap-3">
                    <code className="text-xs text-indigo-400 font-mono shrink-0 pt-0.5">{p.name}</code>
                    <span className="text-[10px] text-gray-500 shrink-0 pt-0.5">{p.type}</span>
                    <span className="text-xs text-gray-400">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response */}
          <div>
            <h4 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Success Response (200)
            </h4>
            <pre className="bg-surface-0 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto font-mono">{JSON.stringify(endpoint.response, null, 2)}</pre>
          </div>

          {/* Error Response */}
          <div>
            <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Error Response
            </h4>
            <pre className="bg-surface-0 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto font-mono">{JSON.stringify(endpoint.errorResponse, null, 2)}</pre>
          </div>

          {/* Code Examples */}
          <div>
            <h4 className="text-xs font-semibold text-gray-300 mb-2">Code Examples</h4>
            <div className="flex gap-1 mb-0">
              {[
                { key: 'curl', label: 'cURL' },
                { key: 'javascript', label: 'JavaScript' },
                { key: 'python', label: 'Python' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.key
                      ? 'bg-surface-2 text-white border-t border-x border-gray-600/10'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="border border-gray-600/10 rounded-b-lg rounded-tr-lg overflow-hidden">
              <CodeBlock
                code={endpoint[activeTab]}
                language={activeTab === 'curl' ? 'bash' : activeTab === 'javascript' ? 'javascript' : 'python'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('Endpoints');

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">API Documentation</h1>
        <p className="text-gray-500 text-sm mt-1">REST API reference with envelope response format · v1.0.0</p>
      </div>

      {/* Section Nav */}
      <div className="flex gap-2">
        {SECTIONS.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeSection === section
                ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
                : 'text-gray-500 hover:text-gray-300 hover:bg-surface-2'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Authentication Section */}
      {activeSection === 'Authentication' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Authentication</h3>
            <p className="text-gray-400 text-sm mb-4">
              All API requests require authentication via Bearer token. Obtain your token by calling the login endpoint.
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-300 mb-2">Step 1: Obtain Token</h4>
                <CodeBlock
                  code={`curl -X POST https://api.smartaudit.dev/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "you@example.com",
    "password": "your_password"
  }'`}
                  language="bash"
                />
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-300 mb-2">Step 2: Use Token in Requests</h4>
                <CodeBlock
                  code={`curl https://api.smartaudit.dev/api/audit/history \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
                  language="bash"
                />
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-400 text-xs font-semibold mb-1">Token Expiry</p>
                <p className="text-gray-400 text-sm">Tokens expire after 24 hours. Use the refresh token endpoint to obtain a new token without re-authenticating.</p>
              </div>
            </div>
          </div>

          {/* Envelope Format */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <h4 className="text-sm font-semibold text-white mb-3">Success Envelope</h4>
              <pre className="bg-surface-0 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto font-mono">{`{
  "data": { ... },
  "meta": {
    "timestamp": "2026-05-18T14:30:00Z",
    "version": "1.0.0",
    "requestId": "req_abc123"
  }
}`}</pre>
            </div>
            <div className="card">
              <h4 className="text-sm font-semibold text-white mb-3">Error Envelope</h4>
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

          {/* HTTP Status Codes */}
          <div className="card">
            <h4 className="text-sm font-semibold text-white mb-3">HTTP Status Codes</h4>
            <div className="space-y-2">
              {[
                { code: '200', label: 'OK', desc: 'Request succeeded' },
                { code: '201', label: 'Created', desc: 'Resource created successfully' },
                { code: '400', label: 'Bad Request', desc: 'Invalid request parameters' },
                { code: '401', label: 'Unauthorized', desc: 'Missing or invalid authentication token' },
                { code: '403', label: 'Forbidden', desc: 'Insufficient permissions' },
                { code: '404', label: 'Not Found', desc: 'Resource not found' },
                { code: '429', label: 'Too Many Requests', desc: 'Rate limit exceeded' },
                { code: '500', label: 'Server Error', desc: 'Internal server error' },
              ].map((s) => (
                <div key={s.code} className="flex items-center gap-3 py-1.5">
                  <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                    s.code.startsWith('2') ? 'bg-emerald-500/15 text-emerald-400' :
                    s.code.startsWith('4') ? 'bg-yellow-500/15 text-yellow-400' :
                    'bg-red-500/15 text-red-400'
                  }`}>{s.code}</span>
                  <span className="text-white text-sm font-medium w-28">{s.label}</span>
                  <span className="text-gray-500 text-sm">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rate Limits Section */}
      {activeSection === 'Rate Limits' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Rate Limits</h3>
            <p className="text-gray-400 text-sm mb-4">
              API requests are rate-limited to ensure fair usage and platform stability. Limits are applied per API key.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-surface-0 rounded-lg p-5 text-center">
                <p className="text-3xl font-bold text-white">60</p>
                <p className="text-gray-500 text-sm mt-1">Requests per minute</p>
              </div>
              <div className="bg-surface-0 rounded-lg p-5 text-center">
                <p className="text-3xl font-bold text-white">5</p>
                <p className="text-gray-500 text-sm mt-1">Requests per second</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-300">Rate Limit Headers</h4>
              <pre className="bg-surface-0 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto font-mono">{`X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1716045600`}</pre>

              <h4 className="text-xs font-semibold text-gray-300 pt-2">When Rate Limited</h4>
              <pre className="bg-surface-0 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto font-mono">{`{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Retry after 12 seconds.",
    "details": {
      "limit": 60,
      "remaining": 0,
      "resetAt": "2026-05-18T14:31:00Z"
    }
  },
  "meta": { ... }
}`}</pre>

              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-4">
                <p className="text-indigo-400 text-xs font-semibold mb-1">Best Practices</p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Implement exponential backoff when receiving 429 responses</li>
                  <li>• Cache responses where possible to reduce API calls</li>
                  <li>• Use batch endpoints for multiple contract scans</li>
                  <li>• Monitor X-RateLimit-Remaining header proactively</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Endpoints Section */}
      {activeSection === 'Endpoints' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm">
              {ENDPOINTS.length} endpoints · <span className="text-emerald-400">{ENDPOINTS.filter(e => e.label === 'Live').length} Live</span> · <span className="text-yellow-400">{ENDPOINTS.filter(e => e.label === 'Demo').length} Demo</span>
            </p>
          </div>
          {ENDPOINTS.map((ep) => (
            <EndpointCard key={ep.path} endpoint={ep} />
          ))}
        </div>
      )}
    </div>
  );
}
