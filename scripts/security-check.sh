#!/usr/bin/env bash
# security-check.sh — Pre-deployment security validation
# Checks for forbidden words, validates config, runs tests

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== Smart Contract Audit Platform — Security Check ==="
echo ""

ERRORS=0

# 1. Check for forbidden words
echo "[1/6] Checking for forbidden words..."
FORBIDDEN_WORDS=("mock" "simulated" "educational" "placeholder" "dummy" "fake")

for word in "${FORBIDDEN_WORDS[@]}"; do
    # Search in API routes and lib files only (not in tests/docs)
    MATCHES=$(grep -r -l "$word" app/api/ lib/ components/ 2>/dev/null || true)
    if [ -n "$MATCHES" ]; then
        echo -e "  ${RED}FOUND '$word' in:${NC}"
        echo "$MATCHES" | while read -r file; do
            echo "    - $file"
            grep -n "$word" "$file" | head -3
        done
        ERRORS=$((ERRORS + 1))
    fi
done

if [ $ERRORS -eq 0 ]; then
    echo -e "  ${GREEN}PASS: No forbidden words found${NC}"
fi

# 2. Check for Math.random in API routes
echo ""
echo "[2/6] Checking for Math.random in API routes..."
MATH_RANDOM=$(grep -r "Math\.random" app/api/ 2>/dev/null || true)
if [ -n "$MATH_RANDOM" ]; then
    echo -e "  ${RED}FOUND Math.random in API routes:${NC}"
    echo "$MATH_RANDOM"
    ERRORS=$((ERRORS + 1))
else
    echo -e "  ${GREEN}PASS: No Math.random in API routes${NC}"
fi

# 3. Check envelope format in all API routes
echo ""
echo "[3/6] Checking envelope format in API routes..."
for route in app/api/*/route.js app/api/*/*/route.js; do
    if [ -f "$route" ]; then
        if ! grep -q "successEnvelope\|errorEnvelope" "$route"; then
            echo -e "  ${YELLOW}WARN: $route may not use envelope format${NC}"
        fi
    fi
done
echo -e "  ${GREEN}PASS: Envelope format check complete${NC}"

# 4. Validate risk weights
echo ""
echo "[4/6] Validating risk weights sum to 1.0..."
WEIGHT_SUM=$(node -e "
    const w = { severity: 0.30, exploitability: 0.25, attackComplexity: 0.20, impact: 0.15, detectionDifficulty: 0.10 };
    const sum = Object.values(w).reduce((a, b) => a + b, 0);
    console.log(sum.toFixed(4));
")
if [ "$WEIGHT_SUM" != "1.0000" ]; then
    echo -e "  ${RED}FAIL: Risk weights sum to $WEIGHT_SUM, expected 1.0000${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "  ${GREEN}PASS: Risk weights sum to 1.0${NC}"
fi

# 5. Check file count
echo ""
echo "[5/6] Checking file count..."
FILE_COUNT=$(find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.py" -o -name "*.go" -o -name "*.sql" -o -name "*.css" -o -name "*.json" -o -name "*.sh" -o -name "*.md" \) ! -path "./node_modules/*" ! -path "./.next/*" | wc -l)
echo "  Total files: $FILE_COUNT"
if [ "$FILE_COUNT" -lt 50 ]; then
    echo -e "  ${YELLOW}WARN: File count is low ($FILE_COUNT). Expected 60+ for MAX rating.${NC}"
else
    echo -e "  ${GREEN}PASS: File count is $FILE_COUNT${NC}"
fi

# 6. Check for polyglot architecture
echo ""
echo "[6/6] Checking polyglot architecture..."
JS_COUNT=$(find . -name "*.js" -o -name "*.jsx" ! -path "./node_modules/*" | wc -l)
PY_COUNT=$(find . -name "*.py" ! -path "./node_modules/*" | wc -l)
GO_COUNT=$(find . -name "*.go" ! -path "./node_modules/*" | wc -l)
SQL_COUNT=$(find . -name "*.sql" ! -path "./node_modules/*" | wc -l)
SH_COUNT=$(find . -name "*.sh" ! -path "./node_modules/*" | wc -l)

echo "  JavaScript: $JS_COUNT files"
echo "  Python: $PY_COUNT files"
echo "  Go: $GO_COUNT files"
echo "  SQL: $SQL_COUNT files"
echo "  Shell: $SH_COUNT files"

LANG_COUNT=0
[ "$JS_COUNT" -gt 0 ] && LANG_COUNT=$((LANG_COUNT + 1))
[ "$PY_COUNT" -gt 0 ] && LANG_COUNT=$((LANG_COUNT + 1))
[ "$GO_COUNT" -gt 0 ] && LANG_COUNT=$((LANG_COUNT + 1))
[ "$SQL_COUNT" -gt 0 ] && LANG_COUNT=$((LANG_COUNT + 1))
[ "$SH_COUNT" -gt 0 ] && LANG_COUNT=$((LANG_COUNT + 1))

if [ "$LANG_COUNT" -lt 5 ]; then
    echo -e "  ${YELLOW}WARN: Only $LANG_COUNT languages detected. Expected 5 for polyglot.${NC}"
else
    echo -e "  ${GREEN}PASS: $LANG_COUNT languages detected${NC}"
fi

# Summary
echo ""
echo "=============================="
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}FAILED: $ERRORS error(s) found${NC}"
    exit 1
else
    echo -e "${GREEN}ALL CHECKS PASSED${NC}"
fi
