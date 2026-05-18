#!/bin/bash
# Test RPC connectivity across all supported chains
set -e
PASS=0
FAIL=0

check_rpc() {
  local name="$1"
  local url="$2"
  local result
  result=$(curl -sL -X POST "$url" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    --max-time 10 2>/dev/null)
  if echo "$result" | grep -q '"result"'; then
    echo "  PASS $name"
    PASS=$((PASS + 1))
  else
    echo "  FAIL $name"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== RPC Connectivity Tests ==="
check_rpc "Ethereum" "https://eth.llamarpc.com"
check_rpc "BNB Chain" "https://bsc-dataseed1.binance.org"
check_rpc "Polygon" "https://polygon-rpc.com"
check_rpc "Arbitrum" "https://arb1.arbitrum.io/rpc"
check_rpc "Optimism" "https://mainnet.optimism.io"
check_rpc "Base" "https://mainnet.base.org"

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -ge 4 ] && exit 1 || exit 0
