#!/usr/bin/env bash
# db-migrate.sh — Run database migrations
set -euo pipefail

DB_URL="${DATABASE_URL:-postgresql://audit_user:audit_pass@localhost:5432/smart_contract_audit}"

echo "Running database migrations..."
echo "Database: $DB_URL"
echo ""

# Run schema
psql "$DB_URL" -f sql/schema.sql

echo ""
echo "Migration complete."
