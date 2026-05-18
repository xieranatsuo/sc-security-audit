export default function AboutPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">About</h1>
        <p className="text-gray-500 text-sm mt-1">Audit methodology, vulnerability coverage, and limitations</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-3">Methodology</h2>
        <div className="space-y-3 text-sm text-gray-300">
          <p>Our platform uses a multi-layered approach to smart contract security analysis:</p>
          <ol className="list-decimal list-inside space-y-2 text-gray-400">
            <li><strong className="text-gray-300">Source Code Analysis (Python)</strong> — Pattern matching against Solidity source code for known vulnerability signatures including reentrancy, arithmetic overflow, flash loan vectors, and proxy safety issues.</li>
            <li><strong className="text-gray-300">Bytecode Analysis (Go)</strong> — EVM opcode disassembly and analysis for dangerous patterns like SELFDESTRUCT, unguarded DELEGATECALL, timestamp dependency, and unchecked return values.</li>
            <li><strong className="text-gray-300">Risk Scoring</strong> — Composite score using weighted formula: RiskScore = 100 × (w₁·S + w₂·E + w₃·A + w₄·I + w₅·D) where S=Severity, E=Exploitability, A=AttackComplexity, I=Impact, D=DetectionDifficulty.</li>
          </ol>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-3">What We Check</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            'Reentrancy (classic, cross-function, ERC-777)',
            'Integer overflow/underflow',
            'Flash loan callback validation',
            'Oracle manipulation via spot prices',
            'Proxy upgrade safety (EIP-1967)',
            'Access control issues',
            'SELFDESTRUCT protection',
            'DELEGATECALL safety',
            'Timestamp dependency',
            'Gas optimization opportunities',
            'ERC compliance checks',
            'Front-running vectors',
          ].map((check) => (
            <div key={check} className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {check}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-3">Limitations</h2>
        <div className="space-y-2 text-sm text-gray-400">
          <p>This automated scanner has known limitations:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Cannot detect novel or zero-day attack vectors</li>
            <li>May miss business logic errors specific to a protocol</li>
            <li>Cannot analyze unverified contracts (no source code)</li>
            <li>Limited to single-contract analysis (no cross-contract calls)</li>
            <li>Does not replace a professional manual audit</li>
            <li>False positives may occur with complex patterns</li>
          </ul>
          <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-xs font-semibold mb-1">Important</p>
            <p className="text-gray-400 text-xs">Always consult a certified smart contract auditor before deploying to mainnet. This tool is a first-pass analysis, not a security guarantee.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
