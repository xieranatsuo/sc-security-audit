#!/bin/bash
# Smoke test: verify all API endpoints respond
set -e
BASE="${1:-http://localhost:3000}"
PASS=0
FAIL=0

check() {
  local path="$1"
  local status
  status=$(curl -sL -o /dev/null -w "%{http_code}" "$BASE$path" --max-time 10)
  if [ "$status" -ge 200 ] && [ "$status" -lt 500 ]; then
    echo "  PASS $path ($status)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL $path ($status)"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== API Smoke Tests ==="
echo "Base: $BASE"
echo ""

check "/api/health"
check "/api/audit/stats"
check "/api/audit/history"
check "/api/contracts"
check "/api/market/data"
check "/api/risk/dashboard"
check "/api/scanner/status"

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
