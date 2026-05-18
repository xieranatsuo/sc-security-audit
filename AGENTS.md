# AGENTS.md — Smart Contract Audit Platform

## Project Overview

Production-grade multi-chain smart contract security analysis platform.
Stack: Next.js 15 (JavaScript) + Python + Go + SQL + Bash.

## Architecture

- **Frontend**: Next.js 15 App Router, Tailwind CSS, Recharts
- **API**: Next.js API Routes with envelope response format
- **Python Scanner**: Source code vulnerability analysis (reentrancy, overflow, flash loan, proxy)
- **Go Scanner**: Concurrent bytecode analysis via goroutines
- **Database**: PostgreSQL for audit records and findings
- **External APIs**: Etherscan V2 (single key, all chains), Binance (market data)

## Conventions

- ALL API responses use envelope format: `{ data, status, provider, lastUpdated, error }`
- NO TypeScript — pure JavaScript only
- Risk scoring formula: `RiskScore = 100 × (w₁·S + w₂·E + w₃·A + w₄·I + w₅·D)`
- Runtime weight validation — weights must sum to 1.0
- All RPC endpoints are public — no paid keys required
- Etherscan V2 API key required for contract source code fetching

## Forbidden Words

NEVER use these in API routes or lib files:
- mock, simulated, educational, placeholder, dummy, fake

## File Structure

- `app/` — Next.js App Router (pages + API routes)
- `components/` — React components
- `lib/` — Shared JavaScript utilities
- `scanners/python/` — Python security engine
- `scanners/go/` — Go concurrent scanner
- `scripts/` — Automation scripts
- `sql/` — Database schema
- `tests/` — Test files
- `data/` — Static data files
- `docs/` — Documentation

## Testing

- JavaScript: Jest
- E2E: Playwright
- Python: Direct execution (test_core.py)
- Security: `bash scripts/security-check.sh`

## Deployment

- Platform: Vercel
- Build: `npm run build`
- Health check: `GET /api/health`
