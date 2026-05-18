#!/bin/bash
# Pre-push audit: grep for forbidden words
set -e

echo "=== Forbidden Words Audit ==="
MATCHES=$(grep -rn \
  "simulated\|mock\|educational\|research demo\|Math.random\|demo data\|fake data\|not financial advice\|proof of concept\|toy example" \
  app/ lib/ components/ scanners/ data/ \
  --include="*.js" --include="*.jsx" --include="*.py" --include="*.go" --include="*.json" \
  | grep -v node_modules | grep -v ".next" | grep -v test | grep -v reference-data \
  | grep -v "placeholder=" | grep -v "placeholder-gray" || true)

if [ -z "$MATCHES" ]; then
  echo "  PASS: 0 forbidden words found"
  exit 0
else
  echo "  FAIL: Forbidden words found:"
  echo "$MATCHES"
  exit 1
fi
