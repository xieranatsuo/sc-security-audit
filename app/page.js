import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-0">
      {/* Hero */}
      <header className="border-b border-gray-600/10">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm">Audit Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className="btn-primary text-sm px-4 py-1.5">Sign Up Free</Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Powered by Etherscan V2 API
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            Smart Contract<br />Security Audit Platform
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Analyze smart contracts for vulnerabilities across Ethereum, BSC, Polygon, and Arbitrum.
            Powered by Python source analysis and Go concurrent bytecode scanning.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/audit" className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Start Free Audit
            </Link>
            <Link href="/audit?demo=true" className="btn-secondary text-sm px-6 py-2.5 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Try Demo Scan
            </Link>
            <Link href="/vulnerabilities" className="btn-ghost text-sm px-6 py-2.5 flex items-center gap-2 text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              Vulnerability DB
            </Link>
          </div>
        </div>
      </header>

      {/* Trust Counters */}
      <section className="border-b border-gray-600/10">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Demo Metrics</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '1,247', label: 'Contracts Audited', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { value: '4', label: 'Chains Supported', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9' },
            { value: '3,891', label: 'Vulnerabilities Found', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
            { value: '2.4s', label: 'Avg Scan Time', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Supported Chains */}
      <section className="border-b border-gray-600/10">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-sm font-semibold text-gray-400 text-center uppercase tracking-wider mb-8">Supported Blockchain Networks</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Ethereum', id: 1, color: '#627EEA', symbol: 'ETH' },
              { name: 'BNB Chain', id: 56, color: '#F0B90B', symbol: 'BNB' },
              { name: 'Polygon', id: 137, color: '#8247E5', symbol: 'MATIC' },
              { name: 'Arbitrum', id: 42161, color: '#28A0F0', symbol: 'ARB' },
              { name: 'Optimism', id: 10, color: '#FF0420', symbol: 'OP' },
              { name: 'Base', id: 8453, color: '#0052FF', symbol: 'ETH' },
              { name: 'Avalanche', id: 43114, color: '#E84142', symbol: 'AVAX' },
              { name: 'Fantom', id: 250, color: '#1969FF', symbol: 'FTM' },
            ].map((chain) => (
              <div key={chain.id} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-1 border border-gray-600/10 hover:border-gray-600/30 transition-colors">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: chain.color }} />
                <span className="text-sm text-gray-300">{chain.name}</span>
                <span className="text-[10px] text-gray-500 font-mono">{chain.id}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-gray-600/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-white text-center mb-2">How It Works</h2>
          <p className="text-gray-500 text-center mb-12">Get a security report in 3 simple steps</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Paste Contract Address',
                desc: 'Enter the deployed contract address or upload Solidity source code. We support verified contracts on all major chains.',
                icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
              },
              {
                step: '2',
                title: 'Select Blockchain',
                desc: 'Choose from Ethereum, BNB Chain, Polygon, Arbitrum, and more. Our Go scanner fetches bytecode via public RPCs.',
                icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9',
              },
              {
                step: '3',
                title: 'Get Security Report',
                desc: 'Our Python engine analyzes source code for reentrancy, overflow, flash loan, and proxy vulnerabilities. Risk score calculated with formal formula.',
                icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center mx-auto mb-3">{item.step}</div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vulnerability Coverage */}
      <section className="border-b border-gray-600/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-white text-center mb-2">Vulnerability Coverage</h2>
          <p className="text-gray-500 text-center mb-12">Detecting 15+ vulnerability categories across source code and bytecode</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Reentrancy', sev: 'Critical', count: 234 },
              { name: 'Access Control', sev: 'High', count: 189 },
              { name: 'Arithmetic', sev: 'High', count: 156 },
              { name: 'Flash Loan', sev: 'Critical', count: 134 },
              { name: 'Oracle Manipulation', sev: 'High', count: 98 },
              { name: 'Front-Running', sev: 'Medium', count: 87 },
              { name: 'Proxy Safety', sev: 'High', count: 76 },
              { name: 'Gas Optimization', sev: 'Low', count: 312 },
            ].map((v) => (
              <div key={v.name} className="p-3 rounded-lg bg-surface-1 border border-gray-600/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{v.name}</span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${v.sev === 'Critical' ? 'bg-red-500/15 text-red-400' : v.sev === 'High' ? 'bg-orange-500/15 text-orange-400' : v.sev === 'Medium' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-green-500/15 text-green-400'}`}>{v.sev}</span>
                </div>
                <p className="text-xs text-gray-500">{v.count} detections</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="border-b border-gray-600/10">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-yellow-400 font-semibold text-sm mb-2">Disclaimer</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  This tool provides automated analysis and does not constitute a full professional audit.
                  It detects known vulnerability patterns but may miss novel attack vectors, business logic errors,
                  or complex multi-contract interactions. <strong className="text-gray-300">False positives and false negatives are possible.</strong>
                  Always consult a certified smart contract auditor before deploying to mainnet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">&copy; 2026 Smart Contract Audit Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/docs" className="hover:text-white transition-colors">API</Link>
            <Link href="/vulnerabilities" className="hover:text-white transition-colors">Vulnerability DB</Link>
            <span className="flex items-center gap-1.5">
              Powered by <span className="text-gray-400">Etherscan V2</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
