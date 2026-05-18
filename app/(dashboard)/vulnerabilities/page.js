'use client';

import { useState } from 'react';

const VULNERABILITIES = [
  { id: 'V001', title: 'Reentrancy', swc: 'SWC-107', cwe: 'CWE-841', severity: 'critical', category: 'Reentrancy', description: 'External calls to untrusted contracts before state updates allow attackers to re-enter the function and drain funds.', whyItMatters: 'Reentrancy caused the $60M DAO hack in 2016. Still one of the most devastating vulnerability classes in smart contracts.', exploitScenario: 'Attacker deploys a contract with a fallback function that calls withdraw() again before balance is set to zero, draining the entire contract.', vulnerableCode: `function withdraw(uint amount) public {\n  require(balances[msg.sender] >= amount);\n  (bool success, ) = msg.sender.call{value: amount}("");\n  require(success);\n  balances[msg.sender] -= amount; // State update AFTER call\n}`, secureCode: `function withdraw(uint amount) public {\n  require(balances[msg.sender] >= amount);\n  balances[msg.sender] -= amount; // State update BEFORE call\n  (bool success, ) = msg.sender.call{value: amount}("");\n  require(success);\n}`, detection: 'Checks if external calls precede state variable updates. Looks for call/send/transfer followed by storage writes.', remediation: ['Use Checks-Effects-Interactions pattern', 'Use OpenZeppelin ReentrancyGuard', 'Update state before external calls', 'Consider pull-over-push payment pattern'], references: ['https://swcregistry.io/docs/SWC-107', 'https://consensys.github.io/smart-contract-best-practices/attacks/reentrancy/'] },
  { id: 'V002', title: 'Access Control', swc: 'SWC-105', cwe: 'CWE-284', severity: 'critical', category: 'Access Control', description: 'Missing or improper access control allows unauthorized users to execute privileged functions like minting, pausing, or upgrading.', whyItMatters: 'The Parity Wallet hack ($30M) and Poly Network hack ($600M) were caused by access control failures.', exploitScenario: 'A public initialize() function allows anyone to become the contract owner and drain all funds.', vulnerableCode: `function initialize(address _owner) public {\n  owner = _owner; // No access control!\n}`, secureCode: `function initialize(address _owner) public {\n  require(owner == address(0), "Already initialized");\n  owner = _owner;\n}`, detection: 'Identifies functions modifying critical state without onlyOwner, require(msg.sender), or role-based modifiers.', remediation: ['Use OpenZeppelin AccessControl or Ownable', 'Implement role-based permissions', 'Audit all privileged functions', 'Use multi-sig for critical operations'], references: ['https://swcregistry.io/docs/SWC-105'] },
  { id: 'V003', title: 'Integer Overflow/Underflow', swc: 'SWC-101', cwe: 'CWE-190', severity: 'high', category: 'Arithmetic', description: 'Arithmetic operations that exceed type boundaries wrap around silently in Solidity <0.8.0, potentially allowing attackers to manipulate balances or supply.', whyItMatters: 'The BEC token (Beauty Chain) lost $900M due to integer overflow. Pre-0.8.0 contracts are especially vulnerable.', exploitScenario: 'Attacker transfers more tokens than their balance by triggering an underflow, resulting in a massive token balance.', vulnerableCode: `// Solidity <0.8.0\nfunction transfer(address to, uint amount) public {\n  balances[msg.sender] -= amount; // Underflows if amount > balance\n  balances[to] += amount;\n}`, secureCode: `// Solidity >=0.8.0 (built-in overflow checks)\n// Or use SafeMath for <0.8.0\nusing SafeMath for uint256;\nfunction transfer(address to, uint amount) public {\n  balances[msg.sender] = balances[msg.sender].sub(amount);\n  balances[to] = balances[to].add(amount);\n}`, detection: 'Checks compiler version and arithmetic operations. Flags unchecked arithmetic in pre-0.8.0 contracts.', remediation: ['Upgrade to Solidity >=0.8.0', 'Use SafeMath library for older contracts', 'Use unchecked blocks only when mathematically safe'], references: ['https://swcregistry.io/docs/SWC-101'] },
  { id: 'V004', title: 'Unchecked External Call', swc: 'SWC-104', cwe: 'CWE-252', severity: 'high', category: 'External Calls', description: 'Return values of low-level calls (call, send, delegatecall) are not checked, allowing silent failures.', whyItMatters: 'Silent failures can lead to lost funds, broken logic, and false assumptions about contract state.', exploitScenario: 'Contract sends ETH via call() but does not check the return value. The send silently fails, but the contract updates state as if it succeeded.', vulnerableCode: `function pay(address payable recipient) public {\n  recipient.call{value: 1 ether}(""); // Return value ignored\n  paid[recipient] = true;\n}`, secureCode: `function pay(address payable recipient) public {\n  (bool success, ) = recipient.call{value: 1 ether}("");\n  require(success, "Transfer failed");\n  paid[recipient] = true;\n}`, detection: 'Identifies call/send/transfer/delegatecall invocations where return value is not captured or checked.', remediation: ['Always check return values of external calls', 'Use transfer() or send() with caution (gas limits)', 'Implement proper error handling'], references: ['https://swcregistry.io/docs/SWC-104'] },
  { id: 'V005', title: 'Delegatecall Injection', swc: 'SWC-112', cwe: 'CWE-829', severity: 'critical', category: 'Delegatecall', description: 'delegatecall to user-controlled addresses allows attackers to execute arbitrary code in the context of the calling contract.', whyItMatters: 'The Parity Wallet hack used delegatecall injection to take ownership of the library contract.', exploitScenario: 'Attacker calls a function that performs delegatecall to an address they control, allowing them to modify storage and drain funds.', vulnerableCode: `function execute(address _target, bytes memory _data) public {\n  (bool success, ) = _target.delegatecall(_data);\n  require(success);\n}`, secureCode: `address private immutable _implementation;\n\nfunction execute(bytes memory _data) public onlyOwner {\n  (bool success, ) = _implementation.delegatecall(_data);\n  require(success);\n}`, detection: 'Flags delegatecall operations where the target address is not immutable or is user-controlled.', remediation: ['Restrict delegatecall targets to immutable addresses', 'Use access control on delegatecall functions', 'Consider using proxy patterns from OpenZeppelin'], references: ['https://swcregistry.io/docs/SWC-112'] },
  { id: 'V006', title: 'tx.origin Authentication', swc: 'SWC-115', cwe: 'CWE-477', severity: 'high', category: 'Authentication', description: 'Using tx.origin for authentication allows phishing attacks where a malicious contract tricks the user into calling a vulnerable contract.', whyItMatters: 'tx.origin phishing can bypass authentication entirely. Vitalik Buterin warned about this in 2016.', exploitScenario: 'Attacker deploys a contract that calls the vulnerable contract. The original user initiated the transaction, so tx.origin matches.', vulnerableCode: `function transfer(address to, uint amount) public {\n  require(tx.origin == owner); // Phishable!\n  balances[to] += amount;\n}`, secureCode: `function transfer(address to, uint amount) public {\n  require(msg.sender == owner); // Safe\n  balances[to] += amount;\n}`, detection: 'Flags all uses of tx.origin for authentication or authorization decisions.', remediation: ['Always use msg.sender instead of tx.origin', 'tx.origin should only be used to reject calls from contracts, not for auth'], references: ['https://swcregistry.io/docs/SWC-115'] },
  { id: 'V007', title: 'Oracle Manipulation', swc: 'SWC-116', cwe: 'CWE-829', severity: 'critical', category: 'Oracle', description: 'Using spot prices from DEXes or single-source oracles allows flash loan attacks to manipulate price feeds.', whyItMatters: 'Cream Finance ($130M), bZx ($8M), and many others were exploited via oracle manipulation.', exploitScenario: 'Attacker uses flash loan to dump a token on a DEX, crashing the spot price. The lending protocol uses this price to liquidate positions.', vulnerableCode: `function getPrice() public view returns (uint) {\n  return pair.getReserves()[0] * 1e18 / pair.getReserves()[1]; // Spot price!\n}`, secureCode: `function getPrice() public view returns (uint) {\n  return priceFeed.latestRoundData().answer; // Chainlink TWAP\n}`, detection: 'Identifies price calculations using DEX reserves, single block data, or lack of TWAP mechanisms.', remediation: ['Use Chainlink oracles', 'Implement TWAP with multiple blocks', 'Use multiple oracle sources', 'Add circuit breakers for extreme price movements'], references: ['https://swcregistry.io/docs/SWC-116'] },
  { id: 'V008', title: 'Flash Loan Attack Surface', swc: 'SWC-116', cwe: 'CWE-829', severity: 'high', category: 'Flash Loan', description: 'Contracts that rely on in-transaction state (balances, prices) can be manipulated by flash loans that borrow and repay within one transaction.', whyItMatters: 'Flash loans have caused over $500M in DeFi losses since 2020.', exploitScenario: 'Attacker borrows massive amount via flash loan, manipulates internal contract state, extracts profit, repays loan in same tx.', vulnerableCode: `function liquidate(address user) public {\n  uint price = getSpotPrice(); // Manipulable via flash loan\n  if (debt[user] > collateral[user] * price) {\n    seizeCollateral(user);\n  }\n}`, secureCode: `function liquidate(address user) public {\n  uint price = oracle.getTWAP(); // 30-min TWAP\n  if (debt[user] > collateral[user] * price) {\n    seizeCollateral(user);\n  }\n}`, detection: 'Analyzes price oracle sources and state dependencies within single transactions.', remediation: ['Use time-weighted average prices', 'Add multi-block confirmation delays', 'Implement reentrancy guards', 'Use commit-reveal schemes for critical operations'], references: ['https://arxiv.org/abs/2003.03810'] },
  { id: 'V009', title: 'Front-Running / MEV', swc: 'SWC-116', cwe: 'CWE-829', severity: 'medium', category: 'MEV', description: 'Miners or bots can reorder, insert, or censor transactions to extract value from users.', whyItMatters: 'MEV extraction exceeds $600M annually on Ethereum. Front-running causes worse execution prices for users.', exploitScenario: 'Bot sees a large DEX swap in the mempool, inserts its own swap before it (sandwich attack), and profits from the price impact.', vulnerableCode: `function swap(uint amountIn, uint minAmountOut) public {\n  // No slippage protection\n  uint amountOut = getAmountOut(amountIn);\n  doSwap(amountIn, amountOut);\n}`, secureCode: `function swap(uint amountIn, uint minAmountOut) public {\n  uint amountOut = getAmountOut(amountIn);\n  require(amountOut >= minAmountOut, "Slippage exceeded");\n  doSwap(amountIn, amountOut);\n}`, detection: 'Identifies functions with order-dependent logic, insufficient slippage protection, or predictable outcomes.', remediation: ['Use Flashbots for private transactions', 'Implement commit-reveal schemes', 'Add maximum slippage parameters', 'Use MEV-protected RPCs'], references: ['https://arxiv.org/abs/1904.05234'] },
  { id: 'V010', title: 'Timestamp Dependence', swc: 'SWC-116', cwe: 'CWE-829', severity: 'low', category: 'Timestamp', description: 'Using block.timestamp for critical logic allows miners to manipulate the outcome by up to ~15 seconds.', whyItMatters: 'Timestamp manipulation can affect lottery outcomes, time-locked vaults, and governance voting periods.', exploitScenario: 'Lottery contract uses block.timestamp to determine winner. Miner manipulates timestamp to favor their address.', vulnerableCode: `function isWinner() public view returns (bool) {\n  return uint(keccak256(abi.encodePacked(block.timestamp))) % 100 == 0;\n}`, secureCode: `function isWinner(bytes32 commitment) public view returns (bool) {\n  return uint(keccak256(abi.encodePacked(commitment, blockhash(block.number - 1)))) % 100 == 0;\n}`, detection: 'Flags block.timestamp usage in comparison operators, randomness, or critical business logic.', remediation: ['Do not use block.timestamp for randomness', 'Use commit-reveal for random outcomes', 'Allow tolerance in timestamp comparisons (>15s)'], references: ['https://swcregistry.io/docs/SWC-116'] },
  { id: 'V011', title: 'Signature Replay', swc: 'SWC-121', cwe: 'CWE-294', severity: 'high', category: 'Signature', description: 'Signed messages can be replayed if nonces or unique identifiers are not properly managed.', whyItMatters: 'Signature replay allows attackers to re-execute authorized operations multiple times.', exploitScenario: 'User signs a message to authorize a withdrawal. Attacker replays the same signature to make multiple withdrawals.', vulnerableCode: `function withdraw(uint amount, bytes memory sig) public {\n  require(verify(sig, msg.sender, amount));\n  payable(msg.sender).transfer(amount);\n}`, secureCode: `mapping(address => uint) public nonces;\n\nfunction withdraw(uint amount, uint nonce, bytes memory sig) public {\n  require(nonces[msg.sender] == nonce);\n  require(verify(sig, msg.sender, amount, nonce));\n  nonces[msg.sender]++;\n  payable(msg.sender).transfer(amount);\n}`, detection: 'Checks for signature verification without nonce tracking or unique identifiers.', remediation: ['Use nonces for each signer', 'Include unique context (chainId, contract address) in signed messages', 'Use EIP-712 for structured signing'], references: ['https://swcregistry.io/docs/SWC-121'] },
  { id: 'V012', title: 'Upgradeable Proxy Risk', swc: 'SWC-116', cwe: 'CWE-829', severity: 'high', category: 'Proxy', description: 'Improper proxy patterns can allow unauthorized upgrades, storage collisions, or initialization attacks.', whyItMatters: 'The Wormhole hack ($320M) and various proxy-related exploits have caused massive losses.', exploitScenario: 'Attacker calls uninitialized implementation contract directly and becomes its owner, then upgrades the proxy to malicious logic.', vulnerableCode: `// Implementation contract - no initializer guard\nfunction initialize(address _owner) public {\n  owner = _owner;\n}`, secureCode: `// OpenZeppelin Initializable\nbool private _initialized;\n\nfunction initialize(address _owner) public initializer {\n  __Ownable_init(_owner);\n}`, detection: 'Analyzes proxy patterns, checks for storage layout conflicts, initialization guards, and upgrade authorization.', remediation: ['Use OpenZeppelin Upgradeable contracts', 'Implement initializer guards', 'Verify storage layout compatibility', 'Use transparent proxy or UUPS patterns'], references: ['https://docs.openzeppelin.com/contracts/4.x/upgradeable'] },
  { id: 'V013', title: 'Unprotected Initializer', swc: 'SWC-116', cwe: 'CWE-829', severity: 'critical', category: 'Initialization', description: 'The initialize() function can be called by anyone if it lacks protection, allowing an attacker to take ownership.', whyItMatters: 'Multiple protocols have been exploited due to unprotected initializers, including force-financing attacks.', exploitScenario: 'Attacker calls initialize() on the implementation contract before legitimate users, gaining owner privileges.', vulnerableCode: `function initialize() public {\n  owner = msg.sender;\n  initialized = true;\n}`, secureCode: `constructor() {\n  _disableInitializers();\n}\n\nfunction initialize() public initializer {\n  owner = msg.sender;\n}`, detection: 'Checks for initialize functions without proper guards (initializer modifier, initialized flag, constructor disable).', remediation: ['Use OpenZeppelin Initializable', 'Disable initializers in constructor', 'Use reinitializer for upgrades'], references: ['https://docs.openzeppelin.com/contracts/4.x/upgradeable'] },
  { id: 'V014', title: 'Selfdestruct Usage', swc: 'SWC-106', cwe: 'CWE-829', severity: 'high', category: 'Destruct', description: 'The selfdestruct instruction destroys the contract and sends remaining ETH to a specified address, bypassing fallback functions.', whyItMatters: 'Selfdestruct can permanently destroy contracts and bypass security checks. Post-Dencun, it no longer sends ETH.', exploitScenario: 'Attacker force-sends ETH to a contract via selfdestruct, breaking balance assumptions or triggering unexpected behavior.', vulnerableCode: `function destroy() public onlyOwner {\n  selfdestruct(payable(owner));\n}`, secureCode: `// Avoid selfdestruct entirely\n// Use pause/unpause patterns instead\nfunction pause() public onlyOwner {\n  _paused = true;\n}`, detection: 'Flags all uses of selfdestruct and suicide opcodes in contract bytecode and source.', remediation: ['Avoid selfdestruct entirely', 'Use pause mechanisms instead', 'If needed, add strict access control', 'Note: selfdestruct is deprecated post-EIP-6049'], references: ['https://swcregistry.io/docs/SWC-106'] },
  { id: 'V015', title: 'Gas Griefing', swc: 'SWC-126', cwe: 'CWE-400', severity: 'medium', category: 'Gas', description: 'Malicious contracts can consume excessive gas in fallback functions, causing operations to fail or become uneconomical.', whyItMatters: 'Gas griefing can make contract functions unusable or cause permanent DoS conditions.', exploitScenario: 'Contract iterates over an array of addresses. Attacker adds many addresses to make the iteration cost exceed block gas limit.', vulnerableCode: `function distribute(address[] memory recipients) public {\n  for (uint i = 0; i < recipients.length; i++) {\n    payable(recipients[i]).transfer(1 ether);\n  }\n}`, secureCode: `function distribute(address recipient) public {\n  // Pull pattern - each user withdraws individually\n  uint amount = pending[recipient];\n  pending[recipient] = 0;\n  payable(recipient).transfer(amount);\n}`, detection: 'Identifies unbounded loops, external calls in loops, and state changes that grow without limits.', remediation: ['Use pull-over-push pattern', 'Add batch size limits', 'Implement pagination', 'Set gas limits for external calls'], references: ['https://swcregistry.io/docs/SWC-126'] },
  { id: 'V016', title: 'Honeypot Pattern', swc: 'SWC-116', cwe: 'CWE-829', severity: 'high', category: 'Honeypot', description: 'Contracts designed to trap user funds by appearing legitimate but containing hidden mechanisms to prevent withdrawal.', whyItMatters: 'Honeypots steal millions from users who trust unverified or unaudited contracts.', exploitScenario: 'Contract has a public deposit function but the withdrawal function has a hidden condition that only the owner can satisfy.', vulnerableCode: `function withdraw() public {\n  require(tx.origin == owner); // Hidden owner-only check\n  // Looks like a normal function signature\n  payable(msg.sender).transfer(balances[msg.sender]);\n}`, secureCode: `function withdraw() public {\n  uint amount = balances[msg.sender];\n  require(amount > 0, "No balance");\n  balances[msg.sender] = 0;\n  payable(msg.sender).transfer(amount);\n}`, detection: 'Analyzes control flow differences between public-facing and actual behavior.', remediation: ['Always verify contract source code', 'Check for hidden conditions in withdrawal functions', 'Use established audited contracts'], references: ['https://arxiv.org/abs/2002.06897'] },
  { id: 'V017', title: 'ERC20 Approval Race', swc: 'SWC-116', cwe: 'CWE-829', severity: 'medium', category: 'ERC20', description: 'The ERC20 approve() function has a known race condition where front-running the approval change can result in double-spending.', whyItMatters: 'The approval race condition has been exploited in practice and affects all standard ERC20 tokens.', exploitScenario: 'User approves spender for 100, then changes to 50. Spender front-runs the change and spends 100, then spends the new 50.', vulnerableCode: `// Standard ERC20 approve\nfunction approve(address spender, uint amount) public returns (bool) {\n  allowances[msg.sender][spender] = amount;\n  return true;\n}`, secureCode: `// Use increaseAllowance/decreaseAllowance\nfunction increaseAllowance(address spender, uint addedValue) public returns (bool) {\n  allowances[msg.sender][spender] += addedValue;\n  return true;\n}`, detection: 'Flags standard approve() usage and suggests increaseAllowance/decreaseAllowance alternatives.', remediation: ['Use increaseAllowance/decreaseAllowance', 'Set approval to 0 before changing value', 'Use EIP-2612 permit for gasless approvals'], references: ['https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729'] },
  { id: 'V018', title: 'Unsafe Randomness', swc: 'SWC-116', cwe: 'CWE-330', severity: 'high', category: 'Randomness', description: 'Using block variables (blockhash, block.timestamp, difficulty) for randomness is predictable and manipulable by miners.', whyItMatters: 'Unsafe randomness has led to exploitation of lotteries, NFT mints, and gaming protocols worth millions.', exploitScenario: 'NFT contract uses blockhash to assign rare traits. Attacker mines blocks until they get a favorable hash.', vulnerableCode: `function mint() public returns (uint tokenId) {\n  tokenId = uint(keccak256(abi.encodePacked(\n    blockhash(block.number - 1),\n    block.timestamp,\n    msg.sender\n  )));\n  _mint(msg.sender, tokenId);\n}`, secureCode: `// Use Chainlink VRF\nfunction mint() public returns (uint tokenId) {\n  requestId = requestRandomWords();\n  // Fulfillment happens in callback\n}\n\nfunction fulfillRandomWords(uint requestId, uint[] memory randomWords) internal override {\n  tokenId = randomWords[0];\n  _mint(requestOwner[requestId], tokenId);\n}`, detection: 'Identifies use of blockhash, block.timestamp, block.difficulty for random number generation.', remediation: ['Use Chainlink VRF for verifiable randomness', 'Use commit-reveal schemes', 'Never use block variables for critical randomness'], references: ['https://docs.chain.link/vrf'] },
];

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3, informational: 4 };
const SEVERITY_COLORS = { critical: 'text-red-400 bg-red-500/10 border-red-500/20', high: 'text-orange-400 bg-orange-500/10 border-orange-500/20', medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', low: 'text-blue-400 bg-blue-500/10 border-blue-500/20', informational: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };

export default function VulnerabilitiesPage() {
  const [search, setSearch] = useState('');
  const [sevFilter, setSevFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const filtered = VULNERABILITIES.filter(v => {
    if (sevFilter !== 'all' && v.severity !== sevFilter) return false;
    if (search && !v.title.toLowerCase().includes(search.toLowerCase()) && !v.cwe.includes(search) && !v.swc.includes(search)) return false;
    return true;
  }).sort((a, b) => (SEVERITY_ORDER[a.severity] || 99) - (SEVERITY_ORDER[b.severity] || 99));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="text-gray-400">Dashboard</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span className="text-white">Vulnerability Database</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Vulnerability Database</h1>
        <p className="text-gray-500 text-sm mt-1">Comprehensive reference for smart contract vulnerability patterns, detection logic, and remediation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total', count: VULNERABILITIES.length, color: 'text-white' },
          { label: 'Critical', count: VULNERABILITIES.filter(v => v.severity === 'critical').length, color: 'text-red-400' },
          { label: 'High', count: VULNERABILITIES.filter(v => v.severity === 'high').length, color: 'text-orange-400' },
          { label: 'Medium', count: VULNERABILITIES.filter(v => v.severity === 'medium').length, color: 'text-yellow-400' },
          { label: 'Low', count: VULNERABILITIES.filter(v => v.severity === 'low').length, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="card py-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-[10px] text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, CWE, or SWC..." className="input w-full pl-10 text-sm" />
        </div>
        <select value={sevFilter} onChange={e => setSevFilter(e.target.value)} className="input w-40 bg-white text-gray-900 text-sm">
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Vulnerability List */}
      <div className="space-y-2">
        {filtered.map(v => (
          <div key={v.id} className="rounded-lg bg-surface-1 border border-gray-600/10 overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === v.id ? null : v.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-2/50 transition-colors text-left"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${SEVERITY_COLORS[v.severity]}`}>
                  {v.severity.toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium">{v.title}</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">{v.swc} · {v.cwe} · {v.category}</p>
                </div>
              </div>
              <svg className={`w-4 h-4 text-gray-500 transition-transform shrink-0 ${expanded === v.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>

            {expanded === v.id && (
              <div className="px-5 pb-5 border-t border-gray-600/10 pt-4 space-y-4 animate-fade-in">
                <p className="text-gray-300 text-sm leading-relaxed">{v.description}</p>

                <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4">
                  <p className="text-red-400 text-xs font-semibold mb-1">Why It Matters</p>
                  <p className="text-gray-300 text-sm">{v.whyItMatters}</p>
                </div>

                <div className="bg-orange-500/5 border border-orange-500/10 rounded-lg p-4">
                  <p className="text-orange-400 text-xs font-semibold mb-1">Exploit Scenario</p>
                  <p className="text-gray-300 text-sm">{v.exploitScenario}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-red-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      Vulnerable Code
                    </p>
                    <pre className="bg-surface-2 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">{v.vulnerableCode}</pre>
                  </div>
                  <div>
                    <p className="text-emerald-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Secure Code
                    </p>
                    <pre className="bg-surface-2 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">{v.secureCode}</pre>
                  </div>
                </div>

                <div>
                  <p className="text-blue-400 text-xs font-semibold mb-1">Detection Logic</p>
                  <p className="text-gray-300 text-sm">{v.detection}</p>
                </div>

                <div>
                  <p className="text-emerald-400 text-xs font-semibold mb-2">Remediation Checklist</p>
                  <ul className="space-y-1">
                    {v.remediation.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-gray-500 text-xs font-semibold mb-1">References</p>
                  <div className="flex flex-wrap gap-2">
                    {v.references.map((ref, i) => (
                      <a key={i} href={ref} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline break-all">{ref.replace('https://', '')}</a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-sm">No vulnerabilities match your filters</p>
          <button onClick={() => { setSearch(''); setSevFilter('all'); }} className="btn-secondary text-xs mt-3">Clear Filters</button>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
        <p className="text-yellow-400 text-xs font-semibold mb-1">Disclaimer</p>
        <p className="text-gray-400 text-xs">This database is for educational and reference purposes. Vulnerability patterns may evolve. Always consult updated security research and get professional audits before deploying to mainnet.</p>
      </div>
    </div>
  );
}
