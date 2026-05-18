export default function ChangelogPage() {
  const entries = [
    { date: 'May 18, 2026', version: '1.0.0', tag: 'Latest', items: [
      'Multi-chain audit support (Ethereum, BSC, Polygon, Arbitrum)',
      'Python source code analysis engine (reentrancy, overflow, flash loan, proxy)',
      'Go concurrent bytecode scanner with goroutines',
      'Formal risk scoring formula with runtime weight validation',
      'Etherscan V2 API integration (single key, all chains)',
      'Batch scanner for concurrent multi-contract analysis',
      'Vulnerability database with 15 SWC entries',
      'Gas tracker with real-time prices across 4 chains',
      'Transaction monitor with risk classification',
      'Analytics dashboard with KPIs, charts, and heatmaps',
      'Email/password + wallet connect authentication',
      'Demo mode with sample audit report',
      'API documentation with full endpoint reference',
    ]},
    { date: 'May 15, 2026', version: '0.9.0', tag: 'Beta', items: [
      'Initial platform architecture',
      'Basic audit form and results display',
      'Contract registry with chain filtering',
      'Market data from Binance public API',
      'Block explorer integration',
    ]},
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Changelog</h1>
        <p className="text-gray-500 text-sm mt-1">Recent updates and new features</p>
      </div>

      {entries.map((entry) => (
        <div key={entry.version} className="card">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-white">v{entry.version}</h2>
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${entry.tag === 'Latest' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-gray-500/15 text-gray-400'}`}>{entry.tag}</span>
            <span className="text-xs text-gray-500 ml-auto">{entry.date}</span>
          </div>
          <ul className="space-y-2">
            {entry.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
