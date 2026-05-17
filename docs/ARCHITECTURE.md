# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Audit   │  │Contracts │  │ Monitor  │  │ Explorer │ │
│  │  Page    │  │ Registry │  │  Page    │  │   Page   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │              │              │              │       │
│  ┌────┴──────────────┴──────────────┴──────────────┴───┐  │
│  │                 API Routes (Next.js)                 │  │
│  │         All responses use envelope format            │  │
│  └────────────────────┬────────────────────────────────┘  │
└───────────────────────┼───────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────┴────┐    ┌─────┴─────┐    ┌────┴────┐
   │Etherscan│    │  Python   │    │   Go    │
   │   V2    │    │  Scanner  │    │ Scanner │
   │  API    │    │ (source)  │    │(bytecode│
   └─────────┘    └───────────┘    └─────────┘
        │
   ┌────┴────────────────────────────────┐
   │        Blockchain RPCs (Public)      │
   │  Ethereum │ BSC │ Polygon │ Arbitrum │
   └─────────────────────────────────────┘
```

## Data Flow

1. **User submits contract address** → Frontend
2. **API validates** → Address format, chain support
3. **Fetch source code** → Etherscan V2 API (single key, all chains)
4. **Fetch bytecode** → Public RPC endpoint
5. **Run analyzers** → Python source analysis + Go bytecode analysis
6. **Calculate risk** → Weighted formula with runtime validation
7. **Return report** → Envelope format with findings + score

## Risk Scoring

```
RiskScore = 100 × (w₁·S + w₂·E + w₃·A + w₄·I + w₅·D)
```

Where:
- S = Severity (0.30)
- E = Exploitability (0.25)
- A = Attack Complexity (0.20)
- I = Impact (0.15)
- D = Detection Difficulty (0.10)

Weights MUST sum to 1.0 — enforced at runtime.

## Security Analyzers

### Python (Source Code)
- **Reentrancy**: Classic, cross-function, ERC-777 hook-based
- **Arithmetic**: Overflow/underflow, unchecked blocks, cast truncation
- **Flash Loan**: Callback validation, oracle manipulation, governance attacks
- **Proxy**: Initialization, upgrade protection, storage collision

### Go (Bytecode)
- **SELFDESTRUCT**: Contract destruction risk
- **DELEGATECALL**: Unprotected delegate calls
- **TIMESTAMP**: Miner-manipulable dependency
- **Unchecked CALL**: Return value not checked
- **Gas patterns**: Storage optimization, repeated calls

## Supported Chains

| Chain | ID | RPC | Explorer |
|-------|-----|-----|----------|
| Ethereum | 1 | eth.llamarpc.com | etherscan.io |
| BNB Chain | 56 | binance.org | bscscan.com |
| Polygon | 137 | polygon-rpc.com | polygonscan.com |
| Arbitrum | 42161 | arbitrum.io/rpc | arbiscan.io |

## External APIs

| API | Auth | Rate Limit | Usage |
|-----|------|------------|-------|
| Etherscan V2 | API Key | 5 calls/sec | Contract source, ABI, transactions |
| Binance | None | 1200/min | Token prices, market data |
| Public RPCs | None | Varies | Bytecode, storage, calls |
