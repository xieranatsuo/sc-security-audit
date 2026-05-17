# API Documentation

Base URL: `https://your-domain.vercel.app`

## Response Envelope

All API responses use a standard envelope format.

### Success
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-05-18T00:00:00Z",
    "version": "1.0.0",
    "requestId": "req_abc123"
  }
}
```

### Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid address format",
    "details": null
  },
  "meta": {
    "timestamp": "2026-05-18T00:00:00Z",
    "version": "1.0.0",
    "requestId": "req_abc123"
  }
}
```

## Endpoints

### Audit

#### POST /api/audit/contract
Audit a smart contract by address and chain.

**Request:**
```json
{
  "address": "0x...",
  "chain": "ethereum"
}
```

**Response:** Full security report with findings, risk score, and metadata.

#### POST /api/audit/risk-score
Calculate risk score for a set of findings.

**Request:**
```json
{
  "findings": [
    {
      "severity": 0.9,
      "exploitability": 0.8,
      "attackComplexity": 0.3,
      "impact": 0.85,
      "detectionDifficulty": 0.4
    }
  ]
}
```

**Response:** Risk scores with breakdown and formula.

#### GET /api/audit/full-report?address=0x...&chain=ethereum
Generate a full audit report.

#### GET /api/audit/history?page=1&limit=20
Get audit history.

#### GET /api/audit/stats
Get aggregated audit statistics.

### Contracts

#### GET /api/contracts?chain=ethereum&page=1&limit=20
List audited contracts.

#### POST /api/contracts
Register a contract in the registry.

#### GET /api/contracts/[chain]?page=1&limit=20
Get contracts for a specific chain.

#### GET /api/contracts/search?q=uniswap&chain=ethereum
Search contracts by name or address.

### Monitor

#### GET /api/monitor/alerts?chain=ethereum&severity=critical
Get monitoring alerts.

#### GET /api/monitor/[address]?chain=ethereum
Get monitoring status for a specific contract.

### Market

#### GET /api/market/data?symbols=ETH,BNB,MATIC&vs=usd
Get market data from Binance.

### Risk

#### GET /api/risk/dashboard
Get risk dashboard aggregated data.

### Explorer

#### GET /api/explorer/[chain]/[address]
Get blockchain explorer data for an address.

### Auth

#### POST /api/auth/register
Register a new user.

### System

#### GET /api/health
Health check endpoint.

#### GET /api/scanner/status
Get scanner status and statistics.

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input parameters |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMITED | 429 | Rate limit exceeded |
| EXTERNAL_API_ERROR | 502 | External API failure |
| INTERNAL_ERROR | 500 | Internal server error |
| UNAUTHORIZED | 401 | Authentication required |
| BLOCKCHAIN_ERROR | 502 | Blockchain RPC failure |
| CONTRACT_NOT_VERIFIED | 404 | Contract not verified on explorer |

## Rate Limits

- 60 requests per minute per IP
- Etherscan API: 5 calls/sec (free tier)
