# Smart Contract Audit Platform

Production-grade multi-chain smart contract security analysis platform.

**Live Demo:** https://smart-contract-audit-platform.vercel.app

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-yellow)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![Go](https://img.shields.io/badge/Go-1.21-cyan)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)
![License](https://img.shields.io/badge/License-MIT-green)

## Overview

A comprehensive smart contract security audit platform that analyzes contracts across Ethereum, BNB Chain, Polygon, Arbitrum, Optimism, Base, and Avalanche. The platform combines Python source code analysis with Go-powered concurrent bytecode scanning to detect 18+ vulnerability categories.

Risk scoring uses a formal weighted formula:

```
RiskScore = 100 × (w₁·S + w₂·E + w₃·A + w₄·I + w₅·D)

Where:
  w₁ = 0.30 (Severity)
  w₂ = 0.25 (Exploitability)
  w₃ = 0.20 (Attack Complexity)
  w₄ = 0.15 (Impact)
  w₅ = 0.10 (Detection Difficulty)

assert(w₁ + w₂ + w₃ + w₄ + w₅ === 1.0)
```

## Features

1. **Single Contract Audit** — Paste address, select chain, get instant analysis
2. **Batch Scanner** — Scan multiple contracts concurrently with Go-powered parallel engine
3. **18 Vulnerability Categories** — Reentrancy, Access Control, Oracle Manipulation, Flash Loan, and more
4. **Risk Score Engine** — Formal weighted formula with breakdown by category
5. **Contract Registry** — Pre-indexed popular contracts across 7 chains
6. **Live Monitor** — Track contract changes, proxy upgrades, admin actions
7. **Alert Rules** — Custom alerts for risk score changes, proxy upgrades, large transfers
8. **Block Explorer** — Search addresses, transactions, and blocks
9. **Gas Tracker** — Real-time gas prices across all supported networks
10. **Analytics Dashboard** — Audit trends, vulnerability distribution, chain comparison

## Stack Rationale

| Language | Purpose | Why |
|----------|---------|-----|
| JavaScript/JSX | Frontend + API | Next.js 15 App Router, React ecosystem |
| Python | Security scanner | Rich AST parsing, static analysis libraries |
| Go | Bytecode scanner | Concurrent goroutines for parallel RPC scanning |
| SQL | Database schema | Structured audit record storage |
| Bash | Automation | Build scripts, deployment, testing |

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser    │────▶│  Next.js 15      │────▶│  API Routes     │
│  (React UI)  │     │  App Router      │     │  /api/*         │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                       ┌───────────────────────────────┼──────────────┐
                       │                               │              │
                ┌──────▼──────┐  ┌─────────────┐  ┌───▼───────────┐
                │ Python      │  │ Go Scanner   │  │ External APIs │
                │ Source      │  │ Bytecode     │  │ Etherscan V2  │
                │ Analyzer    │  │ Analyzer     │  │ Public RPCs   │
                └─────────────┘  └─────────────┘  │ Binance       │
                                                   └───────────────┘
```

## Free APIs Used

| API | Purpose | Auth Required |
|-----|---------|--------------|
| Etherscan V2 | Contract source code | API key (free tier) |
| Public RPCs | Blockchain data | None |
| Binance | Market data | None |

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Run tests
npm test

# Security check
bash scripts/pre-push-audit.sh

# API smoke tests
bash scripts/test-apis.sh
```

## Testing

```bash
# Unit tests
npm test

# E2E tests
npx playwright test

# Risk score consistency check
python3 scanners/python/test_core.py
```

## Project Structure

```
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   ├── (auth)/           # Login/Register
│   └── (dashboard)/      # Main app pages
├── components/           # React components
├── lib/                  # Shared utilities
├── scanners/
│   ├── python/           # Source code analyzer
│   └── go/               # Bytecode scanner
├── data/                 # Reference data
├── scripts/              # Automation scripts
├── sql/                  # Database schema
└── tests/                # Test suites
```

## License

MIT — See [LICENSE](./LICENSE)
