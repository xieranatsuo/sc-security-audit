# Security Policy

## Smart Contract Security Audit Platform

### Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x | Yes |

### Reporting a Vulnerability

If you discover a security vulnerability in this platform, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Email security concerns to the repository owner
3. Include steps to reproduce the vulnerability
4. Allow reasonable time for a fix before public disclosure

### Security Measures

- All API responses use envelope format with request IDs
- Input validation on all user-facing endpoints
- Rate limiting on API routes (60 req/min)
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- No sensitive data in client-side code
- Etherscan API key stored in environment variables
- Public RPC endpoints only (no paid provider keys in code)

### Audit Tool Disclaimer

This tool provides automated security analysis. It does NOT guarantee that a smart contract is secure. Always:

- Perform manual code review
- Engage professional auditors for high-value contracts
- Test thoroughly on testnets before mainnet deployment
- Monitor contracts after deployment
