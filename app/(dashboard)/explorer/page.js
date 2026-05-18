'use client';

import { useState } from 'react';

const BREADCRUMB = [
  { label: 'Dashboard', href: '/' },
  { label: 'Blockchain Tools', href: null },
  { label: 'Block Explorer', href: null },
];

const SEARCH_TYPES = [
  { value: 'address', label: 'Address', placeholder: 'Enter address (0x...)', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { value: 'tx', label: 'Transaction', placeholder: 'Enter tx hash (0x...)', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { value: 'block', label: 'Block', placeholder: 'Enter block number', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
];

const DEMO_RESULTS = {
  address: {
    address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    balance: '1,247.83 ETH',
    balanceUsd: '$4,794,128.42',
    txCount: 2847193,
    isContract: true,
    codeSize: '24,891 bytes',
    chain: 'Ethereum Mainnet',
    firstSeen: '2021-05-04T18:23:00Z',
    lastActivity: '2026-05-18T20:12:00Z',
    contract: {
      name: 'Uniswap V3 Router',
      compiler: 'v0.7.6+commit.7338295f',
      verified: true,
      isProxy: false,
      implementation: null,
    },
  },
  tx: {
    hash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    from: '0xUser0001abcd1234567890abcdef1234567890ab',
    to: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    value: '1.5 ETH',
    valueUsd: '$5,763.26',
    gasUsed: '184,291',
    gasPrice: '18 gwei',
    gasFee: '0.003317 ETH',
    status: 'Success',
    blockNumber: 19847231,
    timestamp: '2026-05-18T20:12:00Z',
    method: 'swapExactTokensForTokens',
    nonce: 42,
    chain: 'Ethereum Mainnet',
  },
  block: {
    number: 19847231,
    timestamp: '2026-05-18T20:12:00Z',
    txCount: 187,
    miner: '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326',
    gasUsed: '14,892,341',
    gasLimit: '30,000,000',
    gasUsedPercent: '49.64%',
    baseFee: '18.2 gwei',
    hash: '0xf82b4c5d6e7f89012345678901234567890abcdef1234567890abcdef56789012',
    parentHash: '0x1a2b3c4d5e6f789012345678901234567890abcdef1234567890abcdef12345678',
    chain: 'Ethereum Mainnet',
  },
};

const VALIDATION_PATTERNS = {
  address: /^0x[0-9a-fA-F]{40}$/,
  tx: /^0x[0-9a-fA-F]{64}$/,
  block: /^\d+$/,
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

function InfoRow({ label, value, mono = false, color = null }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-600/10 last:border-0">
      <span className="text-gray-500 text-xs shrink-0">{label}</span>
      <span className={`text-sm text-right ${mono ? 'font-mono text-xs' : ''} ${color || 'text-white'}`}>{value}</span>
    </div>
  );
}

function AddressResult({ data }) {
  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Address Details</h3>
            <p className="text-gray-500 text-xs font-mono">{data.address}</p>
          </div>
          <span className={`ml-auto text-[10px] font-bold px-2 py-1 rounded ${data.isContract ? 'bg-blue-500/15 text-blue-400' : 'bg-gray-500/15 text-gray-400'}`}>
            {data.isContract ? 'CONTRACT' : 'EOA'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-surface-0 rounded-lg p-4 text-center">
            <p className="text-xl font-bold text-white">{data.balance}</p>
            <p className="text-[10px] text-gray-500 mt-1">Balance</p>
            <p className="text-emerald-400 text-[10px]">{data.balanceUsd}</p>
          </div>
          <div className="bg-surface-0 rounded-lg p-4 text-center">
            <p className="text-xl font-bold text-white">{data.txCount.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 mt-1">Transactions</p>
          </div>
          <div className="bg-surface-0 rounded-lg p-4 text-center">
            <p className="text-xl font-bold text-white">{data.codeSize}</p>
            <p className="text-[10px] text-gray-500 mt-1">Code Size</p>
          </div>
          <div className="bg-surface-0 rounded-lg p-4 text-center">
            <p className="text-sm font-bold text-white">{data.chain}</p>
            <p className="text-[10px] text-gray-500 mt-1">Network</p>
          </div>
        </div>

        <InfoRow label="First Seen" value={new Date(data.firstSeen).toLocaleString()} />
        <InfoRow label="Last Activity" value={new Date(data.lastActivity).toLocaleString()} />
      </div>

      {data.contract && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-3">Contract Information</h3>
          <InfoRow label="Name" value={data.contract.name} />
          <InfoRow label="Compiler" value={data.contract.compiler} mono />
          <InfoRow
            label="Verified"
            value={data.contract.verified ? 'Yes ✓' : 'No'}
            color={data.contract.verified ? 'text-emerald-400' : 'text-red-400'}
          />
          <InfoRow
            label="Proxy"
            value={data.contract.isProxy ? 'Yes' : 'No'}
            color={data.contract.isProxy ? 'text-yellow-400' : 'text-gray-400'}
          />
          {data.contract.implementation && (
            <InfoRow label="Implementation" value={data.contract.implementation} mono />
          )}
        </div>
      )}
    </div>
  );
}

function TxResult({ data }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
          <p className="text-gray-500 text-xs font-mono break-all">{data.hash}</p>
        </div>
        <span className={`ml-auto text-[10px] font-bold px-2 py-1 rounded ${data.status === 'Success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          {data.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-surface-0 rounded-lg p-4 text-center">
          <p className="text-xl font-bold text-white">{data.value}</p>
          <p className="text-[10px] text-gray-500 mt-1">Value</p>
          <p className="text-emerald-400 text-[10px]">{data.valueUsd}</p>
        </div>
        <div className="bg-surface-0 rounded-lg p-4 text-center">
          <p className="text-xl font-bold text-white">{data.gasUsed}</p>
          <p className="text-[10px] text-gray-500 mt-1">Gas Used</p>
        </div>
        <div className="bg-surface-0 rounded-lg p-4 text-center">
          <p className="text-xl font-bold text-white">{data.gasPrice}</p>
          <p className="text-[10px] text-gray-500 mt-1">Gas Price</p>
        </div>
        <div className="bg-surface-0 rounded-lg p-4 text-center">
          <p className="text-sm font-bold text-white">{data.method}</p>
          <p className="text-[10px] text-gray-500 mt-1">Method</p>
        </div>
      </div>

      <InfoRow label="From" value={data.from} mono />
      <InfoRow label="To" value={data.to} mono />
      <InfoRow label="Block" value={`#${data.blockNumber.toLocaleString()}`} />
      <InfoRow label="Nonce" value={data.nonce} />
      <InfoRow label="Gas Fee" value={data.gasFee} />
      <InfoRow label="Timestamp" value={new Date(data.timestamp).toLocaleString()} />
      <InfoRow label="Network" value={data.chain} />
    </div>
  );
}

function BlockResult({ data }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Block #{data.number.toLocaleString()}</h3>
          <p className="text-gray-500 text-xs font-mono break-all">{data.hash}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-surface-0 rounded-lg p-4 text-center">
          <p className="text-xl font-bold text-white">{data.number.toLocaleString()}</p>
          <p className="text-[10px] text-gray-500 mt-1">Block Number</p>
        </div>
        <div className="bg-surface-0 rounded-lg p-4 text-center">
          <p className="text-xl font-bold text-white">{data.txCount}</p>
          <p className="text-[10px] text-gray-500 mt-1">Transactions</p>
        </div>
        <div className="bg-surface-0 rounded-lg p-4 text-center">
          <p className="text-xl font-bold text-white">{data.gasUsedPercent}</p>
          <p className="text-[10px] text-gray-500 mt-1">Gas Used</p>
        </div>
        <div className="bg-surface-0 rounded-lg p-4 text-center">
          <p className="text-sm font-bold text-white">{data.baseFee}</p>
          <p className="text-[10px] text-gray-500 mt-1">Base Fee</p>
        </div>
      </div>

      <InfoRow label="Timestamp" value={new Date(data.timestamp).toLocaleString()} />
      <InfoRow label="Miner" value={data.miner} mono />
      <InfoRow label="Gas Used / Limit" value={`${data.gasUsed} / ${data.gasLimit}`} />
      <InfoRow label="Parent Hash" value={data.parentHash} mono />
      <InfoRow label="Network" value={data.chain} />
    </div>
  );
}

export default function ExplorerPage() {
  const [searchType, setSearchType] = useState('address');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentSearchType = SEARCH_TYPES.find((t) => t.value === searchType);

  const handleSearch = (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const trimmed = query.trim();
    if (!trimmed) {
      setError('Please enter a search query');
      return;
    }

    const pattern = VALIDATION_PATTERNS[searchType];
    if (!pattern.test(trimmed)) {
      setError(
        searchType === 'address'
          ? 'Invalid format: Address must be 0x followed by 40 hex characters'
          : searchType === 'tx'
          ? 'Invalid format: Transaction hash must be 0x followed by 64 hex characters'
          : 'Invalid format: Block number must be a positive integer'
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const demoData = DEMO_RESULTS[searchType];
      if (demoData) {
        setResult({ type: searchType, data: demoData });
      } else {
        setError('Not found: No results found for this query');
      }
      setIsLoading(false);
    }, 800);
  };

  const clearSearch = () => {
    setQuery('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Block Explorer</h1>
        <p className="text-gray-500 text-sm mt-1">Look up addresses, transactions, and blocks across supported chains</p>
      </div>

      {/* Search */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            {SEARCH_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => { setSearchType(type.value); clearSearch(); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  searchType === type.value
                    ? 'bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--border-active)]'
                    : 'bg-surface-2 text-gray-500 hover:text-gray-300 border border-transparent'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={type.icon} />
                </svg>
                {type.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={currentSearchType.placeholder}
              className="input flex-1 font-mono"
            />
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </>
              )}
            </button>
            {(result || error) && (
              <button type="button" onClick={clearSearch} className="btn-secondary">
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-red-400 text-sm font-semibold">Search Error</p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="card flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Searching blockchain data...</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="animate-fade-in">
          {result.type === 'address' && <AddressResult data={result.data} />}
          {result.type === 'tx' && <TxResult data={result.data} />}
          {result.type === 'block' && <BlockResult data={result.data} />}
        </div>
      )}

      {/* Empty State */}
      {!result && !error && !isLoading && (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500 text-sm">Search for an address, transaction, or block</p>
          <p className="text-gray-600 text-xs mt-1">Enter a query above to explore blockchain data</p>
          <div className="flex justify-center gap-2 mt-4">
            {[
              { type: 'address', label: 'Try: Address', value: '0xE592427A0AEce92De3Edee1F18E0157C05861564' },
              { type: 'tx', label: 'Try: Tx Hash', value: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456' },
              { type: 'block', label: 'Try: Block', value: '19847231' },
            ].map((example) => (
              <button
                key={example.type}
                onClick={() => {
                  setSearchType(example.type);
                  setQuery(example.value);
                }}
                className="btn-ghost btn-sm text-xs"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
