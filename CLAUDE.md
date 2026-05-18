# CLAUDE.md — AI Agent Instructions

## Project Type
Multi-chain smart contract security audit platform.

## Key Rules
1. JavaScript only — no TypeScript
2. All API routes use envelope format from lib/api/envelope.js
3. Risk weights must sum to 1.0 (validated at runtime)
4. Use crypto.randomUUID() for request IDs — never Math.random()
5. All blockchain RPCs are public endpoints
6. Etherscan V2 uses single API key for all chains (chainid parameter)

## Code Patterns

### API Route Template
```javascript
import { successEnvelope, errorEnvelope, ErrorCodes } from '@/lib/api/envelope';

export async function GET(request) {
  const requestId = `req_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  try {
    // ... logic ...
    return NextResponse.json(successEnvelope(data, { requestId }));
  } catch (error) {
    return NextResponse.json(
      errorEnvelope(ErrorCodes.INTERNAL_ERROR, error.message, null, { requestId }),
      { status: 500 }
    );
  }
}
```

### Risk Score Formula
```
RiskScore = 100 × (w₁·S + w₂·E + w₃·A + w₄·I + w₅·D)
```
Where S=Severity, E=Exploitability, A=AttackComplexity, I=Impact, D=DetectionDifficulty.

### Envelope Response Format
```javascript
// Success
{ data: T, meta: { timestamp, version, requestId } }

// Error
{ error: { code, message, details? }, meta: { timestamp, version, requestId } }
```

## File Count Target
60+ files across 5 languages (JavaScript, Python, Go, SQL, Bash).
