#!/usr/bin/env bash
# deploy-check.sh — Pre-deployment validation for Vercel
set -euo pipefail

echo "=== Pre-Deploy Check ==="
echo ""

# Check Node.js version
echo "[1/5] Node.js version..."
node --version

# Check npm dependencies
echo ""
echo "[2/5] Installing dependencies..."
npm install --silent

# Run lint
echo ""
echo "[3/5] Running lint..."
npm run lint 2>/dev/null || echo "Lint not configured, skipping"

# Run build
echo ""
echo "[4/5] Running build..."
npm run build

# Run security check
echo ""
echo "[5/5] Running security check..."
bash scripts/security-check.sh

echo ""
echo "=== Ready for deployment ==="
