'use client';

import { useState } from 'react';

const CHAINS = [
  { value: 'ethereum', label: 'Ethereum', id: 1 },
  { value: 'bsc', label: 'BNB Chain', id: 56 },
  { value: 'polygon', label: 'Polygon', id: 137 },
  { value: 'arbitrum', label: 'Arbitrum', id: 42161 },
];

export function AuditForm({ onResult, onLoading }) {
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState('ethereum');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      setError('Please enter a valid contract address (0x...)');
      return;
    }

    onLoading(true);

    try {
      const res = await fetch('/api/audit/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, chain }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error.message);
        onResult(null);
      } else {
        onResult(data.data);
      }
    } catch (err) {
      setError('Failed to connect to audit service');
      onResult(null);
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-white mb-4">New Audit</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Address Input */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Contract Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="input w-full font-mono"
          />
        </div>

        {/* Chain Select */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Blockchain</label>
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value)}
            className="input w-full bg-white text-gray-900"
          >
            {CHAINS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label} (Chain ID: {c.id})
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button type="submit" className="btn-primary w-full">
          Start Audit
        </button>
      </form>

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-gray-600/10">
        <p className="text-gray-500 text-xs">
          Source code fetched from Etherscan V2 API. Contract must be verified on the block explorer.
          Analysis includes reentrancy, arithmetic, flash loan, and proxy vulnerability detection.
        </p>
      </div>
    </div>
  );
}
