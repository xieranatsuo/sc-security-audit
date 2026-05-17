'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export default function ExplorerPage() {
  const [chain, setChain] = useState('ethereum');
  const [address, setAddress] = useState('');
  const [searchAddress, setSearchAddress] = useState(null);

  const { data, isLoading, error } = useSWR(
    searchAddress ? `/api/explorer/${chain}/${searchAddress}` : null,
    fetcher
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (/^0x[0-9a-fA-F]{40}$/.test(address)) {
      setSearchAddress(address);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Block Explorer</h1>
        <p className="text-gray-500 mt-1">Look up contract details and transaction history</p>
      </div>

      {/* Search */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-4">
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value)}
            className="input bg-white text-gray-900"
          >
            <option value="ethereum">Ethereum</option>
            <option value="bsc">BNB Chain</option>
            <option value="polygon">Polygon</option>
            <option value="arbitrum">Arbitrum</option>
          </select>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address (0x...)"
            className="input flex-1 font-mono"
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="card flex items-center justify-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Address Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-white font-mono text-sm">{data.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-white">{data.isContract ? 'Contract' : 'EOA'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Balance</p>
                <p className="text-white">{(parseInt(data.balance) / 1e18).toFixed(4)} ETH</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Bytecode Size</p>
                <p className="text-white">{data.bytecodeSize} bytes</p>
              </div>
            </div>
          </div>

          {data.contract && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Contract Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-white">{data.contract.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Compiler</p>
                  <p className="text-white font-mono text-sm">{data.contract.compiler}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Verified</p>
                  <p className="text-accent-green">Yes</p>
                </div>
                {data.contract.isProxy && (
                  <div>
                    <p className="text-xs text-gray-500">Implementation</p>
                    <p className="text-white font-mono text-sm">{data.contract.implementation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {data.recentTransactions?.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Transactions</h2>
              <div className="space-y-2">
                {data.recentTransactions.map((tx) => (
                  <div key={tx.hash} className="flex items-center justify-between py-2 border-b border-gray-600/10 last:border-0">
                    <div>
                      <p className="text-white font-mono text-xs">{tx.hash?.slice(0, 20)}...</p>
                      <p className="text-gray-500 text-xs">
                        From: {tx.from?.slice(0, 10)}... → To: {tx.to?.slice(0, 10)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm">{(parseInt(tx.value || 0) / 1e18).toFixed(4)} ETH</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(parseInt(tx.timeStamp) * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
