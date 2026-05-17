'use client';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 mt-1">Configure platform settings and API keys</p>
      </div>

      {/* API Keys */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">API Keys</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Etherscan API Key</label>
            <input
              type="password"
              placeholder="Enter your Etherscan V2 API key"
              className="input w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Free tier: 5 calls/sec. Get yours at etherscan.io/myapikey
            </p>
          </div>
        </div>
      </div>

      {/* Chains */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Supported Chains</h2>
        <div className="space-y-3">
          {[
            { name: 'Ethereum', id: 1, status: 'active' },
            { name: 'BNB Chain', id: 56, status: 'active' },
            { name: 'Polygon', id: 137, status: 'active' },
            { name: 'Arbitrum', id: 42161, status: 'active' },
          ].map((chain) => (
            <div key={chain.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-accent-green rounded-full" />
                <span className="text-white">{chain.name}</span>
                <span className="text-gray-500 text-sm">Chain ID: {chain.id}</span>
              </div>
              <span className="badge bg-green-500/15 text-green-400 text-xs">Active</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scanner Config */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Scanner Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Go Scanner Concurrency</label>
            <input
              type="number"
              defaultValue={10}
              min={1}
              max={50}
              className="input w-32"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Scan Timeout (seconds)</label>
            <input
              type="number"
              defaultValue={30}
              min={10}
              max={300}
              className="input w-32"
            />
          </div>
        </div>
      </div>

      {/* Risk Weights */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Risk Scoring Weights</h2>
        <p className="text-gray-500 text-sm mb-4">
          Formula: RiskScore = 100 × (w₁·S + w₂·E + w₃·A + w₄·I + w₅·D)
        </p>
        <div className="space-y-3">
          {[
            { label: 'Severity (w₁)', value: 0.30 },
            { label: 'Exploitability (w₂)', value: 0.25 },
            { label: 'Attack Complexity (w₃)', value: 0.20 },
            { label: 'Impact (w₄)', value: 0.15 },
            { label: 'Detection Difficulty (w₅)', value: 0.10 },
          ].map((w) => (
            <div key={w.label} className="flex items-center gap-4">
              <span className="text-gray-400 text-sm w-48">{w.label}</span>
              <input
                type="number"
                defaultValue={w.value}
                step={0.05}
                min={0}
                max={1}
                className="input w-24"
              />
              <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-blue rounded-full"
                  style={{ width: `${w.value * 100}%` }}
                />
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-500">Weights must sum to 1.0 (enforced at runtime)</p>
        </div>
      </div>
    </div>
  );
}
